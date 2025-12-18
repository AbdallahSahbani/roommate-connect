/**
 * Decision Engine Client
 * 
 * Client-side wrapper for the centralized decision engine.
 * UI never decides. UI only reacts to engine output.
 */

import { supabase } from "@/integrations/supabase/client";

export type ActionType = 
  | "APPLY_TO_PROPERTY"
  | "JOIN_GROUP"
  | "RESERVE_SLOT"
  | "MESSAGE_USER"
  | "CREATE_MATCH"
  | "VIEW_APPLICANT";

export interface EvaluationRequest {
  action_type: ActionType;
  user_id: string;
  target_id?: string;
  group_id?: string;
  property_id?: string;
}

export interface EvaluationResult {
  allowed: boolean;
  reason_code: string;
  reason_message: string;
  next_steps: string[];
  risk_evaluation_id?: string;
  warnings: string[];
}

// Human-readable messages for reason codes
const REASON_MESSAGES: Record<string, string> = {
  SYSTEM_LOCKDOWN: "System is temporarily unavailable. Please try again later.",
  USER_SUSPENDED: "Your account is suspended. Please contact support.",
  ID_NOT_VERIFIED: "Please verify your ID to continue.",
  INCOME_NOT_VERIFIED: "Please verify your income to continue.",
  PROFILE_INCOMPLETE: "Please complete your profile to continue.",
  SLOT_UNAVAILABLE: "No slots available for this property.",
  MAX_OCCUPANTS_EXCEEDED: "Maximum occupants exceeded.",
  FRAUD_FLAG_DETECTED: "Your account requires manual review.",
  APPLICATION_BURST: "Too many applications. Please wait.",
  ALREADY_APPLIED: "You have already applied to this property.",
  ALREADY_IN_GROUP: "You are already a member of this group.",
  GROUP_FULL: "This group is already full.",
  NOT_GROUP_MEMBER: "You are not a member of this group.",
  PROPERTY_INACTIVE: "This property is no longer available.",
  SUBSCRIPTION_REQUIRED: "Active subscription required.",
  OK: "Action allowed.",
};

// Next step actions
const NEXT_STEP_ROUTES: Record<string, string> = {
  VERIFY_ID: "/verification",
  VERIFY_INCOME: "/income-verification",
  COMPLETE_PROFILE: "/profile-setup",
  SUBSCRIBE: "/subscribe",
  BROWSE_PROPERTIES: "/properties",
  BROWSE_GROUPS: "/groups",
  CREATE_GROUP: "/groups",
  CONTACT_SUPPORT: "/contact",
};

/**
 * Evaluate if an action is allowed
 */
export async function evaluateAction(request: EvaluationRequest): Promise<EvaluationResult> {
  try {
    const { data, error } = await supabase.functions.invoke("evaluate-action", {
      body: request,
    });

    if (error) {
      console.error("[DecisionEngine] Invocation error:", error);
      return {
        allowed: false,
        reason_code: "NETWORK_ERROR",
        reason_message: "Unable to verify action. Please try again.",
        next_steps: [],
        warnings: [],
      };
    }

    return data as EvaluationResult;
  } catch (err) {
    console.error("[DecisionEngine] Unexpected error:", err);
    return {
      allowed: false,
      reason_code: "INTERNAL_ERROR",
      reason_message: "An unexpected error occurred. Please try again.",
      next_steps: [],
      warnings: [],
    };
  }
}

/**
 * Get human-readable message for a reason code
 */
export function getReasonMessage(reasonCode: string): string {
  return REASON_MESSAGES[reasonCode] || "Action not allowed.";
}

/**
 * Get route for a next step action
 */
export function getNextStepRoute(nextStep: string): string | null {
  return NEXT_STEP_ROUTES[nextStep] || null;
}

/**
 * Check if user can apply to property
 */
export async function canApplyToProperty(
  userId: string,
  propertyId: string,
  groupId?: string
): Promise<EvaluationResult> {
  return evaluateAction({
    action_type: "APPLY_TO_PROPERTY",
    user_id: userId,
    property_id: propertyId,
    group_id: groupId,
  });
}

/**
 * Check if user can join a group
 */
export async function canJoinGroup(
  userId: string,
  groupId: string
): Promise<EvaluationResult> {
  return evaluateAction({
    action_type: "JOIN_GROUP",
    user_id: userId,
    target_id: groupId,
  });
}

/**
 * Check if user can reserve a slot
 */
export async function canReserveSlot(
  userId: string,
  propertyId: string,
  groupId?: string
): Promise<EvaluationResult> {
  return evaluateAction({
    action_type: "RESERVE_SLOT",
    user_id: userId,
    property_id: propertyId,
    group_id: groupId,
  });
}

/**
 * Check if user can message another user
 */
export async function canMessageUser(
  userId: string,
  targetUserId: string
): Promise<EvaluationResult> {
  return evaluateAction({
    action_type: "MESSAGE_USER",
    user_id: userId,
    target_id: targetUserId,
  });
}

/**
 * Check if user can create a match
 */
export async function canCreateMatch(
  userId: string,
  targetUserId: string
): Promise<EvaluationResult> {
  return evaluateAction({
    action_type: "CREATE_MATCH",
    user_id: userId,
    target_id: targetUserId,
  });
}

/**
 * Check if landlord can view applicant details
 */
export async function canViewApplicant(
  userId: string,
  applicantId: string,
  propertyId: string
): Promise<EvaluationResult> {
  return evaluateAction({
    action_type: "VIEW_APPLICANT",
    user_id: userId,
    target_id: applicantId,
    property_id: propertyId,
  });
}
