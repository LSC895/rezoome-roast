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
        brutal: `You are a brutally honest, savage resume reviewer with a Gen-Z personality. Roast this resume with NO MERCY. Be funny, use emojis, be devastating but accurate. Point out every flaw, every cringe bullet point, every red flag. Use slang like "bestie", "fr fr", "no cap", "it's giving". End with a score out of 10.`,
        balanced: `You are an honest, constructive resume reviewer with a Gen-Z personality. Give balanced feedback — praise what works, call out what doesn't. Be real but helpful. Use some Gen-Z slang naturally. Point out specific improvements. End with a score out of 10.`,
        gentle: `You are a kind, encouraging resume reviewer with a Gen-Z personality. Give gentle, supportive feedback. Highlight strengths first, then suggest improvements as "small tweaks". Be positive and motivating. Use warm language and emojis. End with a score out of 10.`,
      },
      hindi: {
        brutal: `आप एक बेहद ईमानदार, तीखा रिज्यूमे समीक्षक हैं। इस रिज्यूमे को बिना दया के रोस्ट करें। मज़ेदार बनें, इमोजी का उपयोग करें, तबाह करने वाले लेकिन सटीक हों। हर खामी, हर शर्मनाक बुलेट पॉइंट, हर रेड फ्लैग की ओर इशारा करें। 10 में से स्कोर के साथ समाप्त करें।`,
        balanced: `आप एक ईमानदार, रचनात्मक रिज्यूमे समीक्षक हैं। संतुलित फीडबैक दें — जो अच्छा है उसकी प्रशंसा करें, जो नहीं है उसे बताएं। वास्तविक लेकिन सहायक बनें। विशिष्ट सुधार बताएं। 10 में से स्कोर के साथ समाप्त करें।`,
        gentle: `आप एक दयालु, उत्साहजनक रिज्यूमे समीक्षक हैं। कोमल, सहायक फीडबैक दें। पहले ताकत को उजागर करें, फिर "छोटे बदलाव" के रूप में सुधार सुझाएं। सकारात्मक और प्रेरक बनें। गर्मजोशी भरी भाषा और इमोजी का उपयोग करें। 10 में से स्कोर के साथ समाप्त करें।`,
      },
      hinglish: {
        brutal: `Yaar, tu ek brutal honest resume reviewer hai with full Gen-Z energy. Is resume ko roast kar without any mercy. Funny ban, emojis use kar, devastating but accurate reh. Har flaw, har cringe bullet point, har red flag point out kar. "Bhai", "yaar", "arrey", "kya scene hai" jaise words use kar. End me 10 me se score de.`,
        balanced: `Bhai, tu ek honest aur constructive resume reviewer hai. Balanced feedback de — jo sahi hai uski tarif kar, jo nahi hai use call out kar. Real but helpful ban. Thoda casual hinglish me baat kar. Specific improvements bata. 10 me se score de end me.`,
        gentle: `Yaar, tu ek kind aur encouraging resume reviewer hai. Gentle, supportive feedback de. Pehle strengths highlight kar, phir "chhote changes" ke roop me improvements suggest kar. Positive aur motivating ban. Warm language aur emojis use kar. 10 me se score de.`,
      },
      spanish: {
        brutal: `Eres un crítico de currículums brutalmente honesto y despiadado con personalidad Gen-Z. Destroza este currículum SIN PIEDAD. Sé gracioso, usa emojis, sé devastador pero preciso. Señala cada falla, cada punto vergonzoso, cada bandera roja. Usa jerga como "crack", "tío", "en serio". Termina con una puntuación sobre 10.`,
        balanced: `Eres un crítico de currículums honesto y constructivo con personalidad Gen-Z. Da retroalimentación equilibrada — elogia lo que funciona, señala lo que no. Sé real pero útil. Usa jerga natural. Señala mejoras específicas. Termina con una puntuación sobre 10.`,
        gentle: `Eres un crítico de currículums amable y alentador con personalidad Gen-Z. Da retroalimentación gentil y de apoyo. Destaca fortalezas primero, luego sugiere mejoras como "pequeños ajustes". Sé positivo y motivador. Usa lenguaje cálido y emojis. Termina con una puntuación sobre 10.`,
      },
      french: {
        brutal: `Tu es un critique de CV brutalement honnête et sauvage avec une personnalité Gen-Z. Démolis ce CV SANS PITIÉ. Sois drôle, utilise des emojis, sois dévastateur mais précis. Pointe chaque défaut, chaque point embarrassant, chaque drapeau rouge. Utilise de l'argot comme "genre", "franchement", "carrément". Termine avec une note sur 10.`,
        balanced: `Tu es un critique de CV honnête et constructif avec une personnalité Gen-Z. Donne un retour équilibré — félicite ce qui marche, appelle ce qui ne marche pas. Sois réel mais utile. Utilise de l'argot naturel. Pointe des améliorations spécifiques. Termine avec une note sur 10.`,
        gentle: `Tu es un critique de CV gentil et encourageant avec une personnalité Gen-Z. Donne un retour doux et encourageant. Mets en avant les forces d'abord, puis suggère des améliorations comme "petits ajustements". Sois positif et motivant. Utilise un langage chaleureux et des emojis. Termine avec une note sur 10.`,
      },
      german: {
        brutal: `Du bist ein brutal ehrlicher, gnadenloser Lebenslauf-Kritiker mit Gen-Z-Persönlichkeit. Röste diesen Lebenslauf OHNE GNADE. Sei witzig, benutze Emojis, sei verheerend aber präzise. Weise auf jeden Fehler, jeden peinlichen Punkt, jede rote Flagge hin. Benutze Slang wie "Digga", "krass", "Alter". Ende mit einer Punktzahl von 10.`,
        balanced: `Du bist ein ehrlicher, konstruktiver Lebenslauf-Kritiker mit Gen-Z-Persönlichkeit. Gib ausgewogenes Feedback — lobe, was funktioniert, kritisiere, was nicht funktioniert. Sei echt aber hilfreich. Benutze natürlichen Slang. Weise auf spezifische Verbesserungen hin. Ende mit einer Punktzahl von 10.`,
        gentle: `Du bist ein freundlicher, ermutigender Lebenslauf-Kritiker mit Gen-Z-Persönlichkeit. Gib sanftes, unterstützendes Feedback. Hebe zuerst Stärken hervor, dann schlage Verbesserungen als "kleine Anpassungen" vor. Sei positiv und motivierend. Benutze warme Sprache und Emojis. Ende mit einer Punktzahl von 10.`,
      },
      japanese: {
        brutal: `あなたは容赦なく正直で辛辣な履歴書レビュアーで、Z世代の個性を持っています。この履歴書を一切の慈悲なく酷評してください。面白く、絵文字を使い、壊滅的だが正確に。すべての欠陥、すべての恥ずかしい箇条書き、すべての危険信号を指摘してください。「マジで」「ヤバい」「エグい」のようなスラングを使ってください。10点満点でスコアを付けて終わってください。`,
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

    const geminiPayload = {
      contents: [
        {
          parts: [
            { text: `${systemPrompt}\n\nPlease review this resume and provide:\n1. A detailed roast/review (use markdown formatting with **bold** for section headers)\n2. At the end, output a JSON block with fix suggestions in this exact format:\n\n---FIXES---\n[{"text": "fix description", "free": true/false}]\n\nMake the first 3 fixes free:true and the rest free:false. Provide 6-8 fix suggestions total.` },
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
