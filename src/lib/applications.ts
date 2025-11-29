import { supabase } from "@/integrations/supabase/client";

export type EligibilityResult = {
  canApply: boolean;
  reasons: string[];
  flags: {
    idOk: boolean;
    incomeVerifiedOk: boolean;
    backgroundOk: boolean;
    capacityOk: boolean;
    incomeAmountOk: boolean;
  };
};

interface Profile {
  id_verified: boolean | null;
  income_verified: boolean | null;
  background_check_status: string | null;
  self_reported_monthly_income: number | null;
}

interface Property {
  required_id_verified: boolean | null;
  required_income_verified: boolean | null;
  required_background_check: boolean | null;
  max_occupants: number | null;
  min_household_income: number | null;
}

export function checkEligibility(
  profile: Profile | null,
  property: Property,
  approvedCount: number
): EligibilityResult {
  if (!profile) {
    return {
      canApply: false,
      reasons: ["You must be logged in to apply."],
      flags: {
        idOk: false,
        incomeVerifiedOk: false,
        backgroundOk: false,
        capacityOk: false,
        incomeAmountOk: false,
      },
    };
  }

  const idOk = !property.required_id_verified || profile.id_verified === true;
  const incomeVerifiedOk =
    !property.required_income_verified || profile.income_verified === true;
  const backgroundOk =
    !property.required_background_check ||
    profile.background_check_status === "clear";
  const capacityOk =
    property.max_occupants == null || approvedCount < property.max_occupants;
  const incomeAmountOk =
    property.min_household_income == null ||
    profile.self_reported_monthly_income == null ||
    profile.self_reported_monthly_income >= property.min_household_income;

  const reasons: string[] = [];
  if (!idOk) reasons.push("ID verification required");
  if (!incomeVerifiedOk) reasons.push("Income verification required");
  if (!backgroundOk) reasons.push("Background check must be clear");
  if (!capacityOk) reasons.push("This listing is already full");
  if (!incomeAmountOk)
    reasons.push("Your income does not meet this listing's minimum");

  return {
    canApply:
      idOk && incomeVerifiedOk && backgroundOk && capacityOk && incomeAmountOk,
    reasons,
    flags: { idOk, incomeVerifiedOk, backgroundOk, capacityOk, incomeAmountOk },
  };
}

export async function getApprovedCount(propertyId: string): Promise<number> {
  const { count, error } = await supabase
    .from("applications")
    .select("*", { count: "exact", head: true })
    .eq("property_id", propertyId)
    .eq("status", "approved");

  if (error) {
    console.error("Error fetching approved count:", error);
    return 0;
  }

  return count || 0;
}

export async function createApplication(
  propertyId: string,
  applicantId: string,
  flags: EligibilityResult["flags"]
) {
  const { data, error } = await supabase
    .from("applications")
    .insert({
      property_id: propertyId,
      applicant_id: applicantId,
      status: "pending",
      meets_verification:
        flags.idOk && flags.incomeVerifiedOk && flags.backgroundOk,
      meets_income: flags.incomeAmountOk,
      meets_background: flags.backgroundOk,
      meets_capacity: flags.capacityOk,
    })
    .select()
    .single();

  return { data, error };
}

export async function checkExistingApplication(
  propertyId: string,
  applicantId: string
) {
  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .eq("property_id", propertyId)
    .eq("applicant_id", applicantId)
    .maybeSingle();

  return { data, error };
}
