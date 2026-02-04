import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface AnalysisRequest {
  jobText: string;
  userId?: string;
}

interface AnalysisResponse {
  result: "safe" | "suspicious" | "scam";
  confidence: number;
  redFlags: string[];
  tips: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { jobText, userId }: AnalysisRequest = await req.json();

    if (!jobText || jobText.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Job text is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert job scam detection AI. Analyze job postings, emails, and messages to identify potential scams.

Your task is to analyze the provided job-related text and determine if it's:
- "safe": Appears to be a legitimate job opportunity
- "suspicious": Has some concerning elements but not definitively a scam
- "scam": Shows clear signs of fraudulent activity

Common scam indicators to look for:
1. Requests for upfront payments, advance fees, or money transfers
2. Promises of unrealistic income or "guaranteed" earnings
3. Vague job descriptions with no specific duties
4. Requests for personal financial information (bank details, SSN, etc.)
5. Pressure tactics ("urgent", "limited time", "act now")
6. Poor grammar/spelling from supposedly professional companies
7. No company name, address, or verifiable contact information
8. Work-from-home jobs requiring equipment purchases
9. Payment via cryptocurrency, wire transfer, or gift cards
10. "No experience needed" for high-paying positions
11. Asking to cash checks or transfer money
12. Interview via text/chat only, no phone or video calls

Respond ONLY with valid JSON in this exact format:
{
  "result": "safe" | "suspicious" | "scam",
  "confidence": <number between 50-99>,
  "redFlags": ["list of specific red flags found"],
  "tips": ["list of 3-4 safety tips relevant to this job posting"]
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyze this job posting/message for potential scam indicators:\n\n${jobText}` }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service credits exhausted. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI analysis failed");
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    // Parse the JSON response from AI
    let analysis: AnalysisResponse;
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      analysis = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      // Fallback to default response
      analysis = {
        result: "suspicious",
        confidence: 60,
        redFlags: ["Unable to fully analyze - please review manually"],
        tips: [
          "Research the company thoroughly before applying",
          "Never pay upfront fees for job applications",
          "Verify contact information independently"
        ]
      };
    }

    // Save to database if user is logged in
    if (userId) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      
      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        await supabase.from("prediction_history").insert({
          user_id: userId,
          job_text: jobText.substring(0, 5000), // Limit text length
          result: analysis.result,
          confidence: analysis.confidence,
          red_flags: analysis.redFlags,
          tips: analysis.tips,
        });
      }
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("analyze-job error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
