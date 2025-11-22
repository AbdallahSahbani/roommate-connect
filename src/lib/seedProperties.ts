import { supabase } from "@/integrations/supabase/client";
import { seedProperties } from "@/data/seedProperties";

export async function seedPropertiesIfEmpty() {
  const { data, error } = await supabase
    .from("properties")
    .select("id")
    .limit(1);

  if (error) {
    console.error("Error checking properties:", error);
    return;
  }

  if (data && data.length > 0) return;

  const { error: insertError } = await supabase.from("properties").insert(
    seedProperties
  );

  if (insertError) {
    console.error("Error seeding properties:", insertError);
  } else {
    console.log("Seeded initial properties.");
  }
}
