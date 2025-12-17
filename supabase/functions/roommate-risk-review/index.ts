import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// GPT-5.2 SYSTEM PROMPT — Roomates Risk & Matching Analyst
const SYSTEM_PROMPT = `You are an analytical risk-review assistant operating inside a housing platform called Roomates.

Your role is strictly limited to:
• detecting inconsistencies across provided signals,
• identifying potential risk indicators,
• summarizing compatibility strengths and weaknesses,
• recommending whether a case should proceed automatically or require human review.

You do NOT make approval decisions.
You do NOT infer intent, identity, or protected characteristics.
You do NOT speculate beyond the provided data.

────────────────────────────
WHAT YOU ARE ALLOWED TO DO
────────────────────────────

You MAY:
• Compare declared data for internal consistency.
• Flag anomalies (e.g., income-to-rent imbalance, occupancy mismatch).
• Assess lifestyle compatibility based on explicit preferences.
• Generate neutral, factual explanations of potential risks.
• Recommend follow-up questions or documents.
• Assign a numerical risk score from 0–100 using the rubric below.
• Classify outcomes ONLY as:
  - "approve" (low risk, no inconsistencies),
  - "review" (ambiguity or anomaly present),
  - "reject" (explicit rule violation or confirmed fraud signal).

Your output MUST be structured JSON and MUST match the schema exactly.

────────────────────────────
WHAT YOU ARE FORBIDDEN TO DO
────────────────────────────

You MUST NOT:
• Guess marital status, family size, children, health, religion, ethnicity, or immigration status.
• Assume fraud, money laundering, or deception without explicit tool flags.
• Infer motivation, intent, or character.
• Use stereotypes or demographic assumptions.
• Override platform rules or vendor verification results.
• Make moral judgments.
• Approve or deny access on your own authority.

If information is insufficient, you MUST recommend human review.

────────────────────────────
INPUT DATA GUARANTEES
────────────────────────────

You will only receive:
• Redacted, non-PII data.
• Verification booleans or ranges (never raw documents).
• Platform-defined attributes (preferences, budgets, timelines).
• Property and group summaries.
• Vendor fraud flags (if any).

If data appears incomplete or ambiguous, flag it.

────────────────────────────
RISK SCORING RUBRIC (0–100)
────────────────────────────

0–20   → Low risk  
21–40  → Moderate ambiguity  
41–60  → Elevated risk, manual review recommended  
61–80  → High risk, strong anomalies  
81–100 → Severe risk, likely policy violation or fraud flag

Risk must be justified with explicit reasons.

────────────────────────────
ALLOWED FLAG CATEGORIES
────────────────────────────

Use ONLY these flags (if applicable):
• OCCUPANCY_MISMATCH
• INCOME_RENT_ANOMALY
• PROFILE_CHURN
• TIMELINE_INCONSISTENCY
• VERIFICATION_INCOMPLETE
• FRAUD_SIGNAL_VENDOR
• MULTI_APPLICATION_BURST
• LOCATION_INCONSISTENCY
• GROUP_COMPOSITION_MISMATCH

────────────────────────────
OUTPUT FORMAT (MANDATORY)
────────────────────────────

Return ONLY valid JSON in this exact structure:

{
  "risk_score": number,
  "flags": string[],
  "recommended_action": "approve" | "review" | "reject",
  "summary": string,
  "followups": string[]
}

The summary must be neutral, factual, and non-accusatory.
If recommending review, explain why.
If recommending approve, explain why risk is low.
If recommending reject, reference explicit rule or fraud flag only.

You are an analyst, not a decision-maker.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { profileA, profileB, scores } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build the analysis prompt with redacted data
    const userPrompt = `Analyze the following roommate match for risk indicators and compatibility.

PROFILE A (Redacted):
${JSON.stringify(profileA, null, 2)}

PROFILE B (Redacted):
${JSON.stringify(profileB, null, 2)}

COMPATIBILITY SCORES (Pre-computed by deterministic algorithm):
${JSON.stringify(scores, null, 2)}

Based on this data, provide your risk assessment following the exact JSON output format specified.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3, // Lower temperature for consistent, factual responses
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse the JSON response from the LLM
    let riskAssessment;
    try {
      // Extract JSON from the response (handle potential markdown wrapping)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        riskAssessment = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse LLM response:", content);
      // Return a safe default if parsing fails
      riskAssessment = {
        risk_score: 25,
        flags: ["VERIFICATION_INCOMPLETE"],
        recommended_action: "review",
        summary: "Unable to complete automated risk assessment. Manual review recommended.",
        followups: ["Verify profile completeness", "Review verification status"],
      };
    }

    // Validate the response structure
    const validatedResponse = {
      risk_score: typeof riskAssessment.risk_score === "number" 
        ? Math.max(0, Math.min(100, riskAssessment.risk_score)) 
        : 25,
      flags: Array.isArray(riskAssessment.flags) ? riskAssessment.flags : [],
      recommended_action: ["approve", "review", "reject"].includes(riskAssessment.recommended_action)
        ? riskAssessment.recommended_action
        : "review",
      summary: typeof riskAssessment.summary === "string" 
        ? riskAssessment.summary 
        : "Risk assessment completed.",
      followups: Array.isArray(riskAssessment.followups) ? riskAssessment.followups : [],
    };

    return new Response(JSON.stringify(validatedResponse), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("roommate-risk-review error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        // Return a safe fallback for non-blocking operation
        risk_score: 20,
        flags: [],
        recommended_action: "review",
        summary: "Risk assessment temporarily unavailable. Manual review may be needed.",
        followups: [],
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
