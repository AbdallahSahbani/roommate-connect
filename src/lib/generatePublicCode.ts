import { supabase } from "@/integrations/supabase/client";

/**
 * Generates a unique property public code in format: RM-STATE-000001
 * @param state - Two-letter state abbreviation
 * @returns Promise<string> - Unique public code
 */
export async function generatePublicCode(state: string): Promise<string> {
  const stateCode = state.toUpperCase().substring(0, 2);
  
  // Query existing properties with this state prefix
  const { data, error } = await supabase
    .from("properties")
    .select("public_code")
    .like("public_code", `RM-${stateCode}-%`)
    .order("public_code", { ascending: false })
    .limit(1);

  if (error) {
    console.error("Error querying properties:", error);
    // Fallback to timestamp-based code if query fails
    return `RM-${stateCode}-${Date.now().toString().slice(-6)}`;
  }

  let sequence = 1;
  
  if (data && data.length > 0 && data[0].public_code) {
    // Extract sequence number from last code
    const lastCode = data[0].public_code;
    const match = lastCode.match(/RM-[A-Z]{2}-(\d+)$/);
    if (match) {
      sequence = parseInt(match[1], 10) + 1;
    }
  }

  // Format: RM-STATE-000001 (6-digit zero-padded)
  return `RM-${stateCode}-${sequence.toString().padStart(6, '0')}`;
}
