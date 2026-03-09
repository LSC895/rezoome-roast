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

    // Build prompt based on tone
    const tonePrompts: Record<string, string> = {
      brutal: `You are a brutally honest, savage resume reviewer with a Gen-Z personality. Roast this resume with NO MERCY. Be funny, use emojis, be devastating but accurate. Point out every flaw, every cringe bullet point, every red flag. Use slang like "bestie", "fr fr", "no cap", "it's giving". End with a score out of 10.`,
      balanced: `You are an honest, constructive resume reviewer with a Gen-Z personality. Give balanced feedback — praise what works, call out what doesn't. Be real but helpful. Use some Gen-Z slang naturally. Point out specific improvements. End with a score out of 10.`,
      gentle: `You are a kind, encouraging resume reviewer with a Gen-Z personality. Give gentle, supportive feedback. Highlight strengths first, then suggest improvements as "small tweaks". Be positive and motivating. Use warm language and emojis. End with a score out of 10.`,
    };

    const systemPrompt = tonePrompts[roast.tone] || tonePrompts.balanced;

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
