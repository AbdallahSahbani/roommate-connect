import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are the Ultra-Landlord AI Assistant for a rental housing platform.

YOUR ROLE:
- Help landlords create complete, professional property listings
- Gather ALL required property data through natural conversation
- Validate information and detect contradictions
- Ask follow-up questions for missing critical details
- Be conversational, helpful, and efficient

REQUIRED DATA TO COLLECT:

PROPERTY BASICS:
- Property type (apartment, condo, house, loft, studio, etc.)
- Full address or city-only
- Unit number (if applicable)
- Rent price
- Security deposit
- Lease length
- Availability date

UNIT DETAILS:
- Bedrooms
- Bathrooms
- Square footage
- Floor level
- Flooring types
- Kitchen appliances
- Heating/cooling
- Natural light level
- Furnished/unfurnished

UTILITIES:
- Which utilities are included
- Which tenant pays for
- Average monthly costs

PET POLICY:
- Pets allowed? Types?
- Restrictions (breed, weight)
- Pet rent/deposit

BUILDING FEATURES:
- Parking
- Laundry (in-unit, on-site, none)
- Elevator, security system
- Amenities (gym, pool, etc.)

NEIGHBORHOOD:
- Walkability
- Transit access
- Nearby amenities
- General environment

REQUIREMENTS:
- Minimum credit score
- Income requirement (e.g., 3x rent)
- Background check required?
- Application fee
- Renter's insurance required?

VALIDATION RULES:
- Check for contradictions (e.g., "pets allowed" + "no pets" in description)
- Verify suspicious data (rent < $100 or > $50,000)
- Ensure consistency across all fields

FAIR HOUSING COMPLIANCE:
- NEVER mention protected classes (race, religion, familial status, etc.)
- NEVER say "good for families" or "safe for women"
- OK to say: "close to schools", "quiet street", "pets considered"

BEHAVIOR:
- Be conversational and friendly
- Ask 2-3 questions at a time to move efficiently
- Summarize what you've learned periodically
- Never guess or invent facts
- When you have ALL required data, provide a complete JSON object with all property details
- The JSON should be ready to create a property listing

Start by greeting the landlord and asking about the property type and location.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, action } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // If action is "generate_listing", format the last message to request JSON output
    let finalMessages = messages;
    if (action === "generate_listing") {
      finalMessages = [
        ...messages,
        {
          role: "user",
          content: "Based on all the information we've discussed, please generate a complete JSON object with all the property details in this exact format: {\"property_type\": \"\", \"address\": \"\", \"unit_number\": \"\", \"rent\": \"\", \"deposit\": \"\", \"lease_length\": \"\", \"availability_date\": \"\", \"bedrooms\": \"\", \"bathrooms\": \"\", \"sqft\": \"\", \"floor_level\": \"\", \"interior_features\": {}, \"appliances\": [], \"utilities_included\": [], \"utilities_excluded\": [], \"pet_policy\": {}, \"parking\": {}, \"amenities\": [], \"screening_requirements\": {}, \"neighborhood\": {}, \"description\": \"\"}"
        }
      ];
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...finalMessages
        ],
        stream: true,
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
          JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }),
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

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });

  } catch (error) {
    console.error("landlord-assistant error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
