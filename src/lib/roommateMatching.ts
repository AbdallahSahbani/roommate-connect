/**
 * Roommate Matching System - Three-Phase Algorithm
 * 
 * Phase 1: Hard filters (budget, location, move-in date, pets/smoking)
 * Phase 2: Deterministic scoring (lifestyle, schedule, budget, location, timeline)
 * Phase 3: LLM risk review (advisory only, not decision-making)
 * 
 * Security: LLM advises. System decides. Humans arbitrate edge cases.
 */

import { supabase } from "@/integrations/supabase/client";

// Types
export interface RoommateProfile {
  id: string;
  budget_min?: number | null;
  budget_max?: number | null;
  cleanliness_level?: number | null;
  noise_tolerance?: number | null;
  pets?: string | null;
  smoking?: string | null;
  sleep_schedule?: string | null;
  social_preference?: string | null;
  work_from_home?: boolean | null;
  move_in_date?: string | null;
  preferred_state?: string | null;
  preferred_city?: string | null;
  preferred_cities?: string[] | null;
  id_verified?: boolean | null;
  income_verified?: boolean | null;
  background_check_status?: string | null;
  profile_changes_count?: number | null;
  profile_completed?: boolean | null;
}

export interface MatchScores {
  overall_score: number;
  lifestyle_score: number;
  schedule_score: number;
  budget_score: number;
  location_score: number;
  timeline_score: number;
}

export interface HardFilterResult {
  passed: boolean;
  reason?: string;
}

export interface LLMRiskResponse {
  risk_score: number;
  flags: string[];
  recommended_action: 'approve' | 'review' | 'reject';
  summary: string;
  followups: string[];
}

export interface MatchResult {
  user_id_1: string;
  user_id_2: string;
  scores: MatchScores;
  risk_assessment?: LLMRiskResponse;
  status: 'suggested' | 'hidden' | 'blocked';
  should_show: boolean;
}

// Constants
const SCORING_WEIGHTS = {
  lifestyle: 0.40,  // 40%
  schedule: 0.20,   // 20%
  budget: 0.20,     // 20%
  location: 0.10,   // 10%
  timeline: 0.10,   // 10%
};

const COMPATIBILITY_THRESHOLD = 65;
const RISK_THRESHOLD = 30;

// Allowed flag categories (ONLY these)
export const ALLOWED_FLAGS = [
  'OCCUPANCY_MISMATCH',
  'INCOME_RENT_ANOMALY',
  'PROFILE_CHURN',
  'TIMELINE_INCONSISTENCY',
  'VERIFICATION_INCOMPLETE',
  'FRAUD_SIGNAL_VENDOR',
  'MULTI_APPLICATION_BURST',
  'LOCATION_INCONSISTENCY',
  'GROUP_COMPOSITION_MISMATCH',
] as const;

/**
 * PHASE 1: Hard Filters
 * Reject immediately if criteria are mutually exclusive
 */
export function applyHardFilters(
  profileA: RoommateProfile,
  profileB: RoommateProfile
): HardFilterResult {
  // Budget overlap check
  if (profileA.budget_max && profileB.budget_min) {
    if (profileA.budget_max < profileB.budget_min) {
      return { passed: false, reason: 'Budget ranges do not overlap' };
    }
  }
  if (profileB.budget_max && profileA.budget_min) {
    if (profileB.budget_max < profileA.budget_min) {
      return { passed: false, reason: 'Budget ranges do not overlap' };
    }
  }

  // Location overlap check
  const hasLocationOverlap = checkLocationOverlap(profileA, profileB);
  if (!hasLocationOverlap) {
    return { passed: false, reason: 'Preferred locations do not overlap' };
  }

  // Move-in date compatibility (within 60 days of each other)
  if (profileA.move_in_date && profileB.move_in_date) {
    const dateA = new Date(profileA.move_in_date);
    const dateB = new Date(profileB.move_in_date);
    const daysDiff = Math.abs((dateA.getTime() - dateB.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > 60) {
      return { passed: false, reason: 'Move-in dates incompatible (>60 days apart)' };
    }
  }

  // Smoking mutual exclusivity
  if (profileA.smoking && profileB.smoking) {
    const smokerA = profileA.smoking === 'yes' || profileA.smoking === 'outdoor_only';
    const smokerB = profileB.smoking === 'yes' || profileB.smoking === 'outdoor_only';
    const noSmokeA = profileA.smoking === 'no';
    const noSmokeB = profileB.smoking === 'no';
    
    if ((smokerA && noSmokeB) || (smokerB && noSmokeA)) {
      return { passed: false, reason: 'Smoking preferences incompatible' };
    }
  }

  // Pets mutual exclusivity
  if (profileA.pets && profileB.pets) {
    const hasPetsA = profileA.pets !== 'none';
    const hasPetsB = profileB.pets !== 'none';
    const noPetsA = profileA.pets === 'none';
    const noPetsB = profileB.pets === 'none';
    
    // Only reject if one has pets and the other explicitly said none
    if ((hasPetsA && noPetsB) || (hasPetsB && noPetsA)) {
      return { passed: false, reason: 'Pet preferences incompatible' };
    }
  }

  return { passed: true };
}

/**
 * Check if two profiles have overlapping location preferences
 */
function checkLocationOverlap(
  profileA: RoommateProfile,
  profileB: RoommateProfile
): boolean {
  // If either has no location preference, consider it a match
  if (!profileA.preferred_state && !profileA.preferred_city && !profileA.preferred_cities?.length) {
    return true;
  }
  if (!profileB.preferred_state && !profileB.preferred_city && !profileB.preferred_cities?.length) {
    return true;
  }

  // Check state overlap
  if (profileA.preferred_state && profileB.preferred_state) {
    if (profileA.preferred_state.toLowerCase() !== profileB.preferred_state.toLowerCase()) {
      return false;
    }
  }

  // Check city overlap
  const citiesA = new Set([
    profileA.preferred_city?.toLowerCase(),
    ...(profileA.preferred_cities?.map(c => c.toLowerCase()) || []),
  ].filter(Boolean));

  const citiesB = new Set([
    profileB.preferred_city?.toLowerCase(),
    ...(profileB.preferred_cities?.map(c => c.toLowerCase()) || []),
  ].filter(Boolean));

  // If both have cities, check for overlap
  if (citiesA.size > 0 && citiesB.size > 0) {
    for (const city of citiesA) {
      if (citiesB.has(city)) return true;
    }
    return false;
  }

  return true;
}

/**
 * PHASE 2: Deterministic Scoring
 * Returns scores from 0-100 for each category
 */
export function calculateDeterministicScores(
  profileA: RoommateProfile,
  profileB: RoommateProfile
): MatchScores {
  const lifestyleScore = calculateLifestyleScore(profileA, profileB);
  const scheduleScore = calculateScheduleScore(profileA, profileB);
  const budgetScore = calculateBudgetScore(profileA, profileB);
  const locationScore = calculateLocationScore(profileA, profileB);
  const timelineScore = calculateTimelineScore(profileA, profileB);

  // Weighted overall score
  const overall_score = Math.round(
    lifestyleScore * SCORING_WEIGHTS.lifestyle +
    scheduleScore * SCORING_WEIGHTS.schedule +
    budgetScore * SCORING_WEIGHTS.budget +
    locationScore * SCORING_WEIGHTS.location +
    timelineScore * SCORING_WEIGHTS.timeline
  );

  return {
    overall_score,
    lifestyle_score: Math.round(lifestyleScore),
    schedule_score: Math.round(scheduleScore),
    budget_score: Math.round(budgetScore),
    location_score: Math.round(locationScore),
    timeline_score: Math.round(timelineScore),
  };
}

/**
 * Lifestyle score: cleanliness + noise tolerance + social preference + work from home
 */
function calculateLifestyleScore(a: RoommateProfile, b: RoommateProfile): number {
  let totalScore = 0;
  let count = 0;

  // Cleanliness (1-5 scale)
  if (a.cleanliness_level && b.cleanliness_level) {
    const diff = Math.abs(a.cleanliness_level - b.cleanliness_level);
    totalScore += Math.max(0, 100 - diff * 25);
    count++;
  }

  // Noise tolerance (1-5 scale)
  if (a.noise_tolerance && b.noise_tolerance) {
    const diff = Math.abs(a.noise_tolerance - b.noise_tolerance);
    totalScore += Math.max(0, 100 - diff * 25);
    count++;
  }

  // Social preference (exact match preferred)
  if (a.social_preference && b.social_preference) {
    totalScore += a.social_preference === b.social_preference ? 100 : 60;
    count++;
  }

  // Work from home compatibility
  if (a.work_from_home !== null && b.work_from_home !== null) {
    // Both WFH or both not - higher compatibility
    totalScore += a.work_from_home === b.work_from_home ? 100 : 70;
    count++;
  }

  return count > 0 ? totalScore / count : 50;
}

/**
 * Schedule score: sleep schedule alignment
 */
function calculateScheduleScore(a: RoommateProfile, b: RoommateProfile): number {
  if (!a.sleep_schedule || !b.sleep_schedule) return 50;

  // Exact match = 100, similar = 70, opposite = 30
  if (a.sleep_schedule === b.sleep_schedule) return 100;

  const scheduleCompatibility: Record<string, Record<string, number>> = {
    'early_bird': { 'early_bird': 100, 'regular': 70, 'night_owl': 30 },
    'regular': { 'early_bird': 70, 'regular': 100, 'night_owl': 70 },
    'night_owl': { 'early_bird': 30, 'regular': 70, 'night_owl': 100 },
  };

  return scheduleCompatibility[a.sleep_schedule]?.[b.sleep_schedule] ?? 50;
}

/**
 * Budget score: how well budgets overlap
 */
function calculateBudgetScore(a: RoommateProfile, b: RoommateProfile): number {
  if (!a.budget_max || !b.budget_max) return 50;

  const maxBudget = Math.max(a.budget_max, b.budget_max);
  const minBudget = Math.min(a.budget_max, b.budget_max);
  
  // Calculate overlap percentage
  const overlapPercent = (minBudget / maxBudget) * 100;
  
  // 90%+ overlap = 100, scales down from there
  if (overlapPercent >= 90) return 100;
  if (overlapPercent >= 75) return 85;
  if (overlapPercent >= 60) return 70;
  if (overlapPercent >= 50) return 55;
  return 40;
}

/**
 * Location score: state and city alignment
 */
function calculateLocationScore(a: RoommateProfile, b: RoommateProfile): number {
  let score = 0;

  // State match
  if (a.preferred_state && b.preferred_state) {
    if (a.preferred_state.toLowerCase() === b.preferred_state.toLowerCase()) {
      score += 50;
    }
  } else {
    score += 25; // Neutral if not specified
  }

  // City match
  const citiesA = new Set([
    a.preferred_city?.toLowerCase(),
    ...(a.preferred_cities?.map(c => c.toLowerCase()) || []),
  ].filter(Boolean));

  const citiesB = new Set([
    b.preferred_city?.toLowerCase(),
    ...(b.preferred_cities?.map(c => c.toLowerCase()) || []),
  ].filter(Boolean));

  if (citiesA.size > 0 && citiesB.size > 0) {
    for (const city of citiesA) {
      if (citiesB.has(city)) {
        score += 50;
        break;
      }
    }
  } else {
    score += 25; // Neutral if not specified
  }

  return score;
}

/**
 * Timeline score: move-in date alignment
 */
function calculateTimelineScore(a: RoommateProfile, b: RoommateProfile): number {
  if (!a.move_in_date || !b.move_in_date) return 50;

  const dateA = new Date(a.move_in_date);
  const dateB = new Date(b.move_in_date);
  const daysDiff = Math.abs((dateA.getTime() - dateB.getTime()) / (1000 * 60 * 60 * 24));

  if (daysDiff <= 7) return 100;
  if (daysDiff <= 14) return 90;
  if (daysDiff <= 30) return 75;
  if (daysDiff <= 45) return 60;
  if (daysDiff <= 60) return 45;
  return 30;
}

/**
 * PHASE 3: Call LLM Risk Review
 * Returns structured risk assessment
 */
export async function getLLMRiskAssessment(
  profileA: RoommateProfile,
  profileB: RoommateProfile,
  scores: MatchScores
): Promise<LLMRiskResponse | null> {
  try {
    const { data, error } = await supabase.functions.invoke('roommate-risk-review', {
      body: {
        profileA: redactProfile(profileA),
        profileB: redactProfile(profileB),
        scores,
      },
    });

    if (error) {
      console.error('LLM risk assessment error:', error);
      return null;
    }

    return data as LLMRiskResponse;
  } catch (err) {
    console.error('Failed to get LLM risk assessment:', err);
    return null;
  }
}

/**
 * Redact profile to only include non-PII data for LLM
 */
function redactProfile(profile: RoommateProfile): Record<string, unknown> {
  return {
    id_verified: profile.id_verified ?? false,
    income_verified: profile.income_verified ?? false,
    background_check_status: profile.background_check_status ?? 'pending',
    profile_completed: profile.profile_completed ?? false,
    profile_changes_count: profile.profile_changes_count ?? 0,
    has_budget_set: !!(profile.budget_min || profile.budget_max),
    has_location_set: !!(profile.preferred_state || profile.preferred_city),
    has_move_in_date: !!profile.move_in_date,
    has_lifestyle_prefs: !!(profile.cleanliness_level || profile.noise_tolerance),
    has_schedule_set: !!profile.sleep_schedule,
  };
}

/**
 * Complete matching pipeline
 */
export async function matchRoommates(
  profileA: RoommateProfile,
  profileB: RoommateProfile,
  skipLLM = false
): Promise<MatchResult> {
  const baseResult: MatchResult = {
    user_id_1: profileA.id < profileB.id ? profileA.id : profileB.id,
    user_id_2: profileA.id < profileB.id ? profileB.id : profileA.id,
    scores: {
      overall_score: 0,
      lifestyle_score: 0,
      schedule_score: 0,
      budget_score: 0,
      location_score: 0,
      timeline_score: 0,
    },
    status: 'suggested',
    should_show: false,
  };

  // Phase 1: Hard filters
  const filterResult = applyHardFilters(profileA, profileB);
  if (!filterResult.passed) {
    return { ...baseResult, status: 'hidden', should_show: false };
  }

  // Phase 2: Deterministic scoring
  const scores = calculateDeterministicScores(profileA, profileB);
  baseResult.scores = scores;

  // Check compatibility threshold
  if (scores.overall_score < COMPATIBILITY_THRESHOLD) {
    return { ...baseResult, status: 'hidden', should_show: false };
  }

  // Phase 3: LLM risk review (optional)
  if (!skipLLM) {
    const riskAssessment = await getLLMRiskAssessment(profileA, profileB, scores);
    if (riskAssessment) {
      baseResult.risk_assessment = riskAssessment;

      // Apply visibility rules
      if (riskAssessment.recommended_action === 'reject') {
        return { ...baseResult, status: 'hidden', should_show: false };
      }

      if (riskAssessment.risk_score > RISK_THRESHOLD) {
        return { ...baseResult, status: 'suggested', should_show: false };
      }
    }
  }

  // All checks passed
  return { ...baseResult, status: 'suggested', should_show: true };
}

/**
 * Save match result to database
 */
export async function saveMatchResult(result: MatchResult): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('compatibility_scores')
      .upsert({
        user_id_1: result.user_id_1,
        user_id_2: result.user_id_2,
        overall_score: result.scores.overall_score,
        lifestyle_score: result.scores.lifestyle_score,
        schedule_score: result.scores.schedule_score,
        budget_score: result.scores.budget_score,
        location_score: result.scores.location_score,
        risk_score: result.risk_assessment?.risk_score ?? 0,
        llm_summary: result.risk_assessment?.summary,
        flags: result.risk_assessment?.flags ?? [],
        recommended_action: result.risk_assessment?.recommended_action,
        followups: result.risk_assessment?.followups ?? [],
        status: result.status,
        calculated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id_1,user_id_2',
      });

    if (error) {
      console.error('Error saving match result:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Unexpected error saving match result:', err);
    return { success: false, error: 'Failed to save match result' };
  }
}

/**
 * Update match status (user action: hide or block)
 */
export async function updateMatchStatus(
  userId1: string,
  userId2: string,
  status: 'suggested' | 'hidden' | 'blocked'
): Promise<{ success: boolean; error?: string }> {
  const [id1, id2] = userId1 < userId2 ? [userId1, userId2] : [userId2, userId1];

  try {
    const { error } = await supabase
      .from('compatibility_scores')
      .update({ status })
      .eq('user_id_1', id1)
      .eq('user_id_2', id2);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: 'Failed to update match status' };
  }
}
