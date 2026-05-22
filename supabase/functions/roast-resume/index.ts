import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GEMINI_MODELS = ["gemini-2.0-flash", "gemini-2.5-flash-lite", "gemini-2.5-flash"];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const geminiKey = Deno.env.get("GEMINI_API_KEY");

    if (!geminiKey) {
      return new Response(JSON.stringify({ error: "Gemini API key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Auth user
    const supabaseClient = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { roastId } = await req.json();
    if (!roastId) {
      return new Response(JSON.stringify({ error: "roastId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Service client to read storage & update roast
    const serviceClient = createClient(supabaseUrl, serviceKey);

    // --- Rate limiting ---
    const { data: profile, error: profileError } = await serviceClient
      .from("profiles")
      .select("is_pro, roasts_today, last_roast_date, bonus_roasts")
      .eq("user_id", user.id)
      .single();

    if (profileError || !profile) {
      return new Response(JSON.stringify({ error: "Profile not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!profile.is_pro) {
      const today = new Date().toISOString().split("T")[0];
      const roastsUsedToday = profile.last_roast_date === today ? profile.roasts_today : 0;
      const dailyLimit = 1 + (profile.bonus_roasts || 0);

      if (roastsUsedToday >= dailyLimit) {
        return new Response(
          JSON.stringify({
            error: "Daily roast limit reached 💀",
            limit: dailyLimit,
            used: roastsUsedToday,
            is_pro: false,
          }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Increment counter
      await serviceClient.from("profiles").update({
        roasts_today: roastsUsedToday + 1,
        last_roast_date: today,
      }).eq("user_id", user.id);
    }

    // Get roast record
    const { data: roast, error: roastError } = await serviceClient
      .from("roasts")
      .select("*")
      .eq("id", roastId)
      .eq("user_id", user.id)
      .single();

    if (roastError || !roast) {
      return new Response(JSON.stringify({ error: "Roast not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update status to processing
    await serviceClient.from("roasts").update({ status: "processing" }).eq("id", roastId);

    // Download PDF from storage
    const { data: fileData, error: fileError } = await serviceClient.storage
      .from("resumes")
      .download(roast.file_path);

    if (fileError || !fileData) {
      await serviceClient.from("roasts").update({ status: "failed" }).eq("id", roastId);
      return new Response(JSON.stringify({ error: "Failed to read PDF" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Convert PDF to base64 for Gemini (chunked to avoid stack overflow)
    const arrayBuffer = await fileData.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    const chunkSize = 8192;
    let binary = "";
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
      for (let j = 0; j < chunk.length; j++) {
        binary += String.fromCharCode(chunk[j]);
      }
    }
    const base64 = btoa(binary);

    // Build prompt based on language and tone
    const languageTonePrompts: Record<string, Record<string, string>> = {
      english: {
        brutal: `You are a brutally honest, savage resume reviewer with a Gen-Z personality. Roast this resume with NO MERCY. Be funny, use emojis, be devastating but accurate. 
        Focus on: 
        1. "Ghost" accomplishments (tasks without results).
        2. Overused buzzwords (Passionate, Team-player, Motivated).
        3. Cringe formatting or font choices.
        4. "Fluff" skills that mean nothing in 2026.
        Use slang like "bestie", "fr fr", "no cap", "it's giving". End with a score out of 10.`,
        balanced: `You are an honest, constructive resume reviewer with a Gen-Z personality. Give balanced feedback — praise what works, call out what doesn't. Be real but helpful. 
        Specifically look for:
        1. Layout issues.
        2. Where they need more metrics/data.
        3. Action verbs that are too weak.
        End with a score out of 10.`,
        gentle: `You are a kind, encouraging resume reviewer with a Gen-Z personality. Give gentle, supportive feedback. Highlight strengths first, then suggest improvements as "small tweaks". Be positive and motivating. Use warm language and emojis. End with a score out of 10.`,
      },
      hindi: {
        brutal: `आप एक बेहद ईमानदार, तीखा रिज्यूमे समीक्षक हैं। इस रिज्यूमे को बिना दया के रोस्ट करें। मज़ेदार बनें, इमोजी का उपयोग करें, तबाह करने वाले लेकिन सटीक हों। 
        इन पर ध्यान दें:
        1. "खाली" उपलब्धियां (बिना परिणाम के काम)।
        2. घिसे-पिटे शब्द (मेहनती, टीम-प्लेयर)।
        3. 2026 में बेकार स्किल्स।
        10 में से स्कोर के साथ समाप्त करें।`,
        balanced: `आप एक ईमानदार, रचनात्मक रिज्यूमे समीक्षक हैं। संतुलित फीडबैक दें — जो अच्छा है उसकी प्रशंसा करें, जो नहीं है उसे बताएं। वास्तविक लेकिन सहायक बनें। विशिष्ट सुधार बताएं। 10 में से स्कोर के साथ समाप्त करें।`,
        gentle: `आप एक दयालु, उत्साहजनक रिज्यूमे समीक्षक हैं। कोमल, सहायक फीडबैक दें। पहले ताकत को उजागर करें, फिर "छोटे बदलाव" के रूप में सुधार सुझाएं। सकारात्मक और प्रेरक बनें। 10 म�    };
�ヤバい」「エグい」のようなスラングを使ってください。10点満点でスコアを付けて終わってください。`,
        balanced: `あなたは正直で建設的な履歴書レビュアーで、Z世代の個性を持っています。バランスの取れたフィードバックを提供してください — うまくいっていることは称賛し、うまくいっていないことは指摘してください。本物だが役立つようにしてください。自然なスラングを使ってください。具体的な改善点を指摘してください。10点満点でスコアを付けて終わってください。`,
        gentle: `あなたは親切で励ましてくれる履歴書レビュアーで、Z世代の個性を持っています。優しく、サポート的なフィードバックを提供してください。まず強みを強調し、次に「小さな調整」として改善を提案してください。ポジティブで励みになるようにしてください。温かい言葉と絵文字を使ってください。10点満点でスコアを付けて終わってください。`,
      },
      portuguese: {
        brutal: `Você é um crítico de currículos brutalmente honesto e implacável com personalidade Gen-Z. Destrua este currículo SEM PIEDADE. Seja engraçado, use emojis, seja devastador mas preciso. Aponte cada falha, cada ponto vergonhoso, cada bandeira vermelha. Use gírias como "mano", "cara", "tipo assim". Termine com uma pontuação de 10.`,
        balanced: `Você é um crítico de currículos honesto e construtivo com personalidade Gen-Z. Dê feedback equilibrado — elogie o que funciona, aponte o que não funciona. Seja real mas útil. Use gírias naturalmente. Aponte melhorias específicas. Termine com uma pontuação de 10.`,
        gentle: `Você é um crítico de currículos gentil e encorajador com personalidade Gen-Z. Dê feedback gentil e de apoio. Destaque pontos fortes primeiro, depois sugira melhorias como "pequenos ajustes". Seja positivo e motivador. Use linguagem calorosa e emojis. Termine com uma pontuação de 10.`,
      },
    };

    const systemPrompt = languageTonePrompts[roast.language]?.[roast.tone] || languageTonePrompts.english.balanced;

    // Language name mapping for explicit instructions
    const languageNames: Record<string, string> = {
      english: "English",
      hindi: "Hindi (हिंदी)",
      hinglish: "Hinglish (Hindi-English mix)",
    };

    const targetLanguage = languageNames[roast.language] || "English";
    
    // Build language-specific instruction
    const languageInstruction = roast.language === "english" 
      ? "" 
      : `\n\n🚨 CRITICAL LANGUAGE REQUIREMENT 🚨\nYou MUST write your ENTIRE response in ${targetLanguage}. Do NOT use English except for technical terms that have no translation. The roast, commentary, emojis captions, and fix suggestions text - ALL must be in ${targetLanguage}. This is non-negotiable.\n`;

    const geminiPayload = {
      contents: [
        {
          parts: [
            { text: `${systemPrompt}${languageInstruction}\n\nReview this resume and provide:\n1. A detailed roast/review in ${targetLanguage} (use markdown formatting with **bold** for section headers)\n2. At the end, output a JSON block with fix suggestions in this exact format:\n\n---FIXES---\n[{"text": "fix description in ${targetLanguage}", "free": true/false}]\n\nMake the first 3 fixes free:true and the rest free:false. Provide 6-8 fix suggestions total. Remember: ALL text must be in ${targetLanguage}!` },
            {
              inline_data: {
                mime_type: "application/pdf",
                data: base64,
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.9,
        maxOutputTokens: 2048,
      },
    };

    // Call Gemini API with model fallback
    let geminiResponse: Response | null = null;
    let lastErrorText = "";
    let lastStatus = 500;

    for (const model of GEMINI_MODELS) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(geminiPayload),
        }
      );

      if (response.ok) {
        geminiResponse = response;
        break;
      }

      const errText = await response.text();
      console.error(`Gemini error on ${model}:`, response.status, errText);
      lastErrorText = errText;
      lastStatus = response.status;

      // If it's not quota/rate related, stop trying other models
      if (![429, 402, 403, 500, 502, 503, 504].includes(response.status)) {
        break;
      }
    }

    if (!geminiResponse) {
      await serviceClient.from("roasts").update({ status: "failed" }).eq("id", roastId);

      const isQuotaError = lastStatus === 429;
      return new Response(
        JSON.stringify({
          error: isQuotaError
            ? "Gemini quota exceeded across available models. Enable billing or retry later."
            : "AI processing failed",
          provider_status: lastStatus,
          details: lastErrorText.slice(0, 500),
        }),
        {
          status: isQuotaError ? 429 : 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const geminiData = await geminiResponse.json();
    const fullText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Parse roast text and fixes
    let roastText = fullText;
    let fixes: Array<{ text: string; free: boolean }> = [];
    let score: number | null = null;

    // Extract fixes JSON
    const fixesMatch = fullText.match(/---FIXES---\s*\n?\s*(\[[\s\S]*?\])/);
    if (fixesMatch) {
      try {
        fixes = JSON.parse(fixesMatch[1]);
        roastText = fullText.substring(0, fullText.indexOf("---FIXES---")).trim();
      } catch {
        console.error("Failed to parse fixes JSON");
      }
    }

    // Extract score
    const scoreMatch = roastText.match(/(\d{1,2})\s*\/\s*10/);
    if (scoreMatch) {
      score = Math.min(10, Math.max(0, parseInt(scoreMatch[1])));
    }

    // Update roast with results
    await serviceClient.from("roasts").update({
      roast_text: roastText,
      fix_suggestions: fixes,
      score,
      status: "completed",
    }).eq("id", roastId);

    return new Response(
      JSON.stringify({
        roast_text: roastText,
        fix_suggestions: fixes,
        score,
        status: "completed",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("roast-resume error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
