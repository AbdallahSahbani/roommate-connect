import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ProfileData {
  id: string;
  full_name?: string;
  occupation?: string;
  bio?: string;
  budget_min?: number;
  budget_max?: number;
  cleanliness_level?: number;
  noise_tolerance?: number;
  pets?: string;
  smoking?: string;
  sleep_schedule?: string;
  social_preference?: string;
  work_from_home?: boolean;
  preferred_cities?: string[];
  move_in_date?: string;
  id_verified?: boolean;
  income_verified?: boolean;
}

interface MatchRequest {
  currentUser: ProfileData;
  candidate: ProfileData;
  compatibilityScore: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { currentUser, candidate, compatibilityScore } = await req.json() as MatchRequest;
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context for AI analysis
    const userContext = buildProfileContext("You", currentUser);
    const candidateContext = buildProfileContext("Potential roommate", candidate);

    const systemPrompt = `You are a roommate compatibility analyst. Your job is to analyze two potential roommates and provide helpful, friendly insights about their compatibility.

RULES:
- Be positive but honest
- Focus on lifestyle compatibility
- Mention specific shared traits or complementary differences
- Keep responses concise and friendly
- Never mention specific names, use "you" and "they"
- Provide 2-3 key compatibility points
- Give a one-sentence "vibe check" summary

OUTPUT FORMAT (JSON):
{
  "vibeCheck": "One sentence summary of the match vibe",
  "compatibilityPoints": ["Point 1", "Point 2", "Point 3"],
  "potentialChallenges": ["Optional challenge 1"],
  "recommendedIcebreaker": "A fun conversation starter based on shared interests"
}`;

    const userPrompt = `Analyze the compatibility between these two potential roommates:

${userContext}

${candidateContext}

Current compatibility score: ${compatibilityScore}%

Provide a friendly analysis of why they might be a good match.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: "Rate limit exceeded",
            fallback: generateFallbackInsights(currentUser, candidate, compatibilityScore)
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ 
            error: "Payment required",
            fallback: generateFallbackInsights(currentUser, candidate, compatibilityScore)
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    // Try to parse JSON response
    let insights;
    try {
      // Extract JSON from markdown code block if present
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      insights = JSON.parse(jsonStr);
    } catch {
      // If parsing fails, create structured response from text
      insights = {
        vibeCheck: content.slice(0, 100),
        compatibilityPoints: ["Great match based on lifestyle preferences"],
        potentialChallenges: [],
        recommendedIcebreaker: "Ask about their ideal weekend!"
      };
    }

    return new Response(JSON.stringify(insights), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in roommate-match-ai:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function buildProfileContext(label: string, profile: ProfileData): string {
  const traits: string[] = [];

  if (profile.occupation) traits.push(`Works as: ${profile.occupation}`);
  if (profile.budget_max) traits.push(`Budget: $${profile.budget_min || 0}-$${profile.budget_max}/month`);
  if (profile.sleep_schedule) traits.push(`Sleep schedule: ${profile.sleep_schedule.replace('_', ' ')}`);
  if (profile.cleanliness_level) traits.push(`Cleanliness (1-5): ${profile.cleanliness_level}`);
  if (profile.noise_tolerance) traits.push(`Noise tolerance (1-5): ${profile.noise_tolerance}`);
  if (profile.social_preference) traits.push(`Social style: ${profile.social_preference.replace('_', ' ')}`);
  if (profile.pets) traits.push(`Pets: ${profile.pets}`);
  if (profile.smoking) traits.push(`Smoking: ${profile.smoking}`);
  if (profile.work_from_home) traits.push("Works from home");
  if (profile.preferred_cities?.length) traits.push(`Looking in: ${profile.preferred_cities.slice(0, 3).join(', ')}`);
  if (profile.id_verified) traits.push("ID verified ✓");
  if (profile.income_verified) traits.push("Income verified ✓");

  return `${label}:\n${traits.map(t => `- ${t}`).join('\n')}`;
}

function generateFallbackInsights(user: ProfileData, candidate: ProfileData, score: number) {
  const points: string[] = [];

  // Budget match
  if (user.budget_max && candidate.budget_max) {
    const diff = Math.abs(user.budget_max - candidate.budget_max);
    if (diff < 500) points.push("Similar budget range");
  }

  // Schedule match
  if (user.sleep_schedule === candidate.sleep_schedule) {
    points.push(`Both are ${user.sleep_schedule?.replace('_', ' ')}s`);
  }

  // Social match
  if (user.social_preference === candidate.social_preference) {
    points.push(`Both prefer a ${user.social_preference} lifestyle`);
  }

  // Cleanliness
  if (user.cleanliness_level && candidate.cleanliness_level) {
    if (Math.abs(user.cleanliness_level - candidate.cleanliness_level) <= 1) {
      points.push("Compatible cleanliness standards");
    }
  }

  // WFH
  if (user.work_from_home && candidate.work_from_home) {
    points.push("Both work from home");
  }

  if (points.length === 0) {
    points.push("Potential for a great match!");
  }

  return {
    vibeCheck: score >= 80 ? "This could be a great match!" : score >= 60 ? "Worth exploring!" : "Some things in common",
    compatibilityPoints: points.slice(0, 3),
    potentialChallenges: [],
    recommendedIcebreaker: "What does your ideal weekend look like?"
  };
}
