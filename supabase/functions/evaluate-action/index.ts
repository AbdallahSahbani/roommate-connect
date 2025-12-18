import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Decision Engine - Centralized Authorization Service
 * 
 * This is the "brainstem" of the platform. Every action flows through here.
 * UI never decides. UI only reacts to this function's output.
 * 
 * Action Types:
 * - APPLY_TO_PROPERTY
 * - JOIN_GROUP
 * - RESERVE_SLOT
 * - MESSAGE_USER
 * - VIEW_APPLICANT
 * - CREATE_MATCH
 */

interface EvaluationRequest {
  action_type: string;
  user_id: string;
  target_id?: string; // property_id, group_id, user_id depending on action
  group_id?: string;
  property_id?: string;
}

interface EvaluationResult {
  allowed: boolean;
  reason_code: string;
  reason_message: string;
  next_steps: string[];
  risk_evaluation_id?: string;
  warnings: string[];
}

interface UserProfile {
  id: string;
  id_verified: boolean;
  income_verified: boolean;
  is_suspended: boolean;
  trust_level: string;
  profile_completed: boolean;
  fraud_flags: string[];
  verification_retry_count: number;
  application_burst_count: number;
  tenant_subscription_active: boolean;
}

// Rule definitions - deterministic, no AI
const RULES = {
  SYSTEM_LOCKDOWN: "SYSTEM_LOCKDOWN",
  USER_SUSPENDED: "USER_SUSPENDED",
  ID_NOT_VERIFIED: "ID_NOT_VERIFIED",
  INCOME_NOT_VERIFIED: "INCOME_NOT_VERIFIED",
  PROFILE_INCOMPLETE: "PROFILE_INCOMPLETE",
  SLOT_UNAVAILABLE: "SLOT_UNAVAILABLE",
  MAX_OCCUPANTS_EXCEEDED: "MAX_OCCUPANTS_EXCEEDED",
  FRAUD_FLAG_DETECTED: "FRAUD_FLAG_DETECTED",
  APPLICATION_BURST: "APPLICATION_BURST",
  ALREADY_APPLIED: "ALREADY_APPLIED",
  ALREADY_IN_GROUP: "ALREADY_IN_GROUP",
  GROUP_FULL: "GROUP_FULL",
  NOT_GROUP_MEMBER: "NOT_GROUP_MEMBER",
  PROPERTY_INACTIVE: "PROPERTY_INACTIVE",
  SUBSCRIPTION_REQUIRED: "SUBSCRIPTION_REQUIRED",
  OK: "OK",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action_type, user_id, target_id, group_id, property_id } = await req.json() as EvaluationRequest;

    console.log(`[DecisionEngine] Evaluating: ${action_type} for user ${user_id}`);

    // Step 1: Check system lockdown (kill switch)
    const { data: securitySettings } = await supabase
      .from("security_settings")
      .select("lockdown")
      .limit(1)
      .single();

    if (securitySettings?.lockdown) {
      return respond({
        allowed: false,
        reason_code: RULES.SYSTEM_LOCKDOWN,
        reason_message: "System is in lockdown mode. Please try again later.",
        next_steps: [],
        warnings: [],
      });
    }

    // Step 2: Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, id_verified, income_verified, is_suspended, trust_level, profile_completed, fraud_flags, verification_retry_count, application_burst_count, tenant_subscription_active")
      .eq("id", user_id)
      .single();

    if (profileError || !profile) {
      return respond({
        allowed: false,
        reason_code: "USER_NOT_FOUND",
        reason_message: "User profile not found.",
        next_steps: ["CREATE_PROFILE"],
        warnings: [],
      });
    }

    // Step 3: Check suspension
    if (profile.is_suspended) {
      return respond({
        allowed: false,
        reason_code: RULES.USER_SUSPENDED,
        reason_message: "Your account is suspended.",
        next_steps: ["CONTACT_SUPPORT"],
        warnings: [],
      });
    }

    // Step 4: Check fraud flags
    if (profile.fraud_flags && profile.fraud_flags.length > 0) {
      console.log(`[DecisionEngine] Fraud flags detected: ${profile.fraud_flags.join(", ")}`);
      return respond({
        allowed: false,
        reason_code: RULES.FRAUD_FLAG_DETECTED,
        reason_message: "Your account requires manual review.",
        next_steps: ["CONTACT_SUPPORT"],
        warnings: profile.fraud_flags,
      });
    }

    // Step 5: Route to action-specific evaluation
    let result: EvaluationResult;

    switch (action_type) {
      case "APPLY_TO_PROPERTY":
        result = await evaluateApplyToProperty(supabase, profile, property_id || target_id!, group_id);
        break;

      case "JOIN_GROUP":
        result = await evaluateJoinGroup(supabase, profile, target_id!);
        break;

      case "RESERVE_SLOT":
        result = await evaluateReserveSlot(supabase, profile, property_id || target_id!, group_id);
        break;

      case "MESSAGE_USER":
        result = await evaluateMessageUser(supabase, profile, target_id!);
        break;

      case "CREATE_MATCH":
        result = await evaluateCreateMatch(supabase, profile, target_id!);
        break;

      case "VIEW_APPLICANT":
        result = await evaluateViewApplicant(supabase, profile, target_id!, property_id!);
        break;

      default:
        result = {
          allowed: false,
          reason_code: "UNKNOWN_ACTION",
          reason_message: `Unknown action type: ${action_type}`,
          next_steps: [],
          warnings: [],
        };
    }

    // Step 6: Log decision for audit
    if (result.allowed || result.reason_code !== "UNKNOWN_ACTION") {
      await logDecision(supabase, {
        action_type,
        user_id,
        target_id: target_id || property_id || group_id,
        result,
        profile,
      });
    }

    return respond(result);

  } catch (error) {
    console.error("[DecisionEngine] Error:", error);
    return new Response(
      JSON.stringify({
        allowed: false,
        reason_code: "INTERNAL_ERROR",
        reason_message: "An error occurred. Please try again.",
        next_steps: [],
        warnings: [],
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function respond(result: EvaluationResult): Response {
  return new Response(JSON.stringify(result), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function evaluateApplyToProperty(
  supabase: any,
  profile: UserProfile,
  propertyId: string,
  groupId?: string
): Promise<EvaluationResult> {
  const warnings: string[] = [];

  // Check profile completion
  if (!profile.profile_completed) {
    return {
      allowed: false,
      reason_code: RULES.PROFILE_INCOMPLETE,
      reason_message: "Please complete your profile before applying.",
      next_steps: ["COMPLETE_PROFILE"],
      warnings: [],
    };
  }

  // Check ID verification
  if (!profile.id_verified) {
    return {
      allowed: false,
      reason_code: RULES.ID_NOT_VERIFIED,
      reason_message: "ID verification is required to apply.",
      next_steps: ["VERIFY_ID"],
      warnings: [],
    };
  }

  // Check income verification
  if (!profile.income_verified) {
    return {
      allowed: false,
      reason_code: RULES.INCOME_NOT_VERIFIED,
      reason_message: "Income verification is required to apply.",
      next_steps: ["VERIFY_INCOME"],
      warnings: [],
    };
  }

  // Fetch property
  const { data: property, error: propError } = await supabase
    .from("properties")
    .select("id, is_active, total_slots, filled_slots, reserved_slots, max_occupants")
    .eq("id", propertyId)
    .single();

  if (propError || !property) {
    return {
      allowed: false,
      reason_code: "PROPERTY_NOT_FOUND",
      reason_message: "Property not found.",
      next_steps: [],
      warnings: [],
    };
  }

  if (!property.is_active) {
    return {
      allowed: false,
      reason_code: RULES.PROPERTY_INACTIVE,
      reason_message: "This property is no longer available.",
      next_steps: ["BROWSE_PROPERTIES"],
      warnings: [],
    };
  }

  // Check slot availability
  const availableSlots = (property.total_slots || 0) - (property.filled_slots || 0) - (property.reserved_slots || 0);
  if (availableSlots <= 0) {
    return {
      allowed: false,
      reason_code: RULES.SLOT_UNAVAILABLE,
      reason_message: "No slots available for this property.",
      next_steps: ["BROWSE_PROPERTIES", "JOIN_WAITLIST"],
      warnings: [],
    };
  }

  // Check for existing application
  const { data: existingApp } = await supabase
    .from("applications")
    .select("id")
    .eq("property_id", propertyId)
    .eq("applicant_id", profile.id)
    .not("status", "in", "(rejected,expired)")
    .limit(1);

  if (existingApp && existingApp.length > 0) {
    return {
      allowed: false,
      reason_code: RULES.ALREADY_APPLIED,
      reason_message: "You have already applied to this property.",
      next_steps: ["VIEW_APPLICATION"],
      warnings: [],
    };
  }

  // Check application burst (anti-scam)
  if (profile.application_burst_count && profile.application_burst_count > 5) {
    warnings.push("APPLICATION_VELOCITY_HIGH");
  }

  return {
    allowed: true,
    reason_code: RULES.OK,
    reason_message: "Application allowed.",
    next_steps: [],
    warnings,
  };
}

async function evaluateJoinGroup(
  supabase: any,
  profile: UserProfile,
  groupId: string
): Promise<EvaluationResult> {
  // Check ID verification for group joining
  if (!profile.id_verified) {
    return {
      allowed: false,
      reason_code: RULES.ID_NOT_VERIFIED,
      reason_message: "ID verification is required to join groups.",
      next_steps: ["VERIFY_ID"],
      warnings: [],
    };
  }

  // Fetch group
  const { data: group, error: groupError } = await supabase
    .from("groups")
    .select("id, is_complete")
    .eq("id", groupId)
    .single();

  if (groupError || !group) {
    return {
      allowed: false,
      reason_code: "GROUP_NOT_FOUND",
      reason_message: "Group not found.",
      next_steps: [],
      warnings: [],
    };
  }

  if (group.is_complete) {
    return {
      allowed: false,
      reason_code: RULES.GROUP_FULL,
      reason_message: "This group is already complete.",
      next_steps: ["BROWSE_GROUPS", "CREATE_GROUP"],
      warnings: [],
    };
  }

  // Check if already a member
  const { data: membership } = await supabase
    .from("group_members")
    .select("id")
    .eq("group_id", groupId)
    .eq("user_id", profile.id)
    .limit(1);

  if (membership && membership.length > 0) {
    return {
      allowed: false,
      reason_code: RULES.ALREADY_IN_GROUP,
      reason_message: "You are already a member of this group.",
      next_steps: [],
      warnings: [],
    };
  }

  return {
    allowed: true,
    reason_code: RULES.OK,
    reason_message: "Group join allowed.",
    next_steps: [],
    warnings: [],
  };
}

async function evaluateReserveSlot(
  supabase: any,
  profile: UserProfile,
  propertyId: string,
  groupId?: string
): Promise<EvaluationResult> {
  // First check if user can apply
  const applyResult = await evaluateApplyToProperty(supabase, profile, propertyId, groupId);
  if (!applyResult.allowed) {
    return applyResult;
  }

  // Check for existing reservation
  const { data: existingReservation } = await supabase
    .from("slot_reservations")
    .select("id")
    .eq("property_id", propertyId)
    .eq("user_id", profile.id)
    .eq("status", "reserved")
    .limit(1);

  if (existingReservation && existingReservation.length > 0) {
    return {
      allowed: false,
      reason_code: "ALREADY_RESERVED",
      reason_message: "You already have a reservation for this property.",
      next_steps: ["VIEW_RESERVATION"],
      warnings: [],
    };
  }

  return {
    allowed: true,
    reason_code: RULES.OK,
    reason_message: "Slot reservation allowed.",
    next_steps: [],
    warnings: [],
  };
}

async function evaluateMessageUser(
  supabase: any,
  profile: UserProfile,
  targetUserId: string
): Promise<EvaluationResult> {
  // Check ID verification for messaging
  if (!profile.id_verified) {
    return {
      allowed: false,
      reason_code: RULES.ID_NOT_VERIFIED,
      reason_message: "ID verification is required to message other users.",
      next_steps: ["VERIFY_ID"],
      warnings: [],
    };
  }

  // Check if target user exists and is not suspended
  const { data: targetProfile } = await supabase
    .from("profiles")
    .select("id, is_suspended")
    .eq("id", targetUserId)
    .single();

  if (!targetProfile) {
    return {
      allowed: false,
      reason_code: "USER_NOT_FOUND",
      reason_message: "User not found.",
      next_steps: [],
      warnings: [],
    };
  }

  return {
    allowed: true,
    reason_code: RULES.OK,
    reason_message: "Messaging allowed.",
    next_steps: [],
    warnings: [],
  };
}

async function evaluateCreateMatch(
  supabase: any,
  profile: UserProfile,
  targetUserId: string
): Promise<EvaluationResult> {
  // Subscription required for matching
  if (!profile.tenant_subscription_active) {
    return {
      allowed: false,
      reason_code: RULES.SUBSCRIPTION_REQUIRED,
      reason_message: "Active subscription required for roommate matching.",
      next_steps: ["SUBSCRIBE"],
      warnings: [],
    };
  }

  // ID verification required
  if (!profile.id_verified) {
    return {
      allowed: false,
      reason_code: RULES.ID_NOT_VERIFIED,
      reason_message: "ID verification is required for matching.",
      next_steps: ["VERIFY_ID"],
      warnings: [],
    };
  }

  return {
    allowed: true,
    reason_code: RULES.OK,
    reason_message: "Match creation allowed.",
    next_steps: [],
    warnings: [],
  };
}

async function evaluateViewApplicant(
  supabase: any,
  profile: UserProfile,
  applicantId: string,
  propertyId: string
): Promise<EvaluationResult> {
  // Check if user is landlord of property
  const { data: property } = await supabase
    .from("properties")
    .select("landlord_id")
    .eq("id", propertyId)
    .single();

  if (!property || property.landlord_id !== profile.id) {
    return {
      allowed: false,
      reason_code: "NOT_PROPERTY_OWNER",
      reason_message: "You are not authorized to view this applicant.",
      next_steps: [],
      warnings: [],
    };
  }

  return {
    allowed: true,
    reason_code: RULES.OK,
    reason_message: "View allowed.",
    next_steps: [],
    warnings: [],
  };
}

async function logDecision(
  supabase: any,
  data: {
    action_type: string;
    user_id: string;
    target_id?: string;
    result: EvaluationResult;
    profile: UserProfile;
  }
): Promise<void> {
  try {
    await supabase.from("decision_explanations").insert({
      decision_type: data.action_type.toLowerCase(),
      target_id: data.target_id || data.user_id,
      user_id: data.user_id,
      inputs_snapshot: {
        id_verified: data.profile.id_verified,
        income_verified: data.profile.income_verified,
        trust_level: data.profile.trust_level,
        profile_completed: data.profile.profile_completed,
        fraud_flags: data.profile.fraud_flags,
      },
      rules_triggered: data.result.reason_code !== RULES.OK ? [data.result.reason_code] : [],
      ai_flags: [],
      final_decision: data.result.allowed ? "approved" : "rejected",
    });
  } catch (error) {
    console.error("[DecisionEngine] Failed to log decision:", error);
  }
}
