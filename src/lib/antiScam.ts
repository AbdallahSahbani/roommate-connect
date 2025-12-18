/**
 * Anti-Scam Detection Layer
 * 
 * Stores detection signals as flags, not judgments.
 * Rules detect anomalies → LLM summarizes risk → Humans decide edge cases.
 * 
 * This follows the Stripe/Plaid/Airbnb model.
 */

import { supabase } from "@/integrations/supabase/client";

// Detection signal types
export type FraudSignal = 
  | 'PROFILE_CHURN'           // Frequent profile changes
  | 'VERIFICATION_RETRY'       // Multiple verification attempts
  | 'APPLICATION_BURST'        // Many applications in short time
  | 'IP_ANOMALY'              // Suspicious IP patterns (hashed)
  | 'DEVICE_ANOMALY'          // Multiple accounts from same device
  | 'GEO_MISMATCH'            // Location doesn't match move-in
  | 'GROUP_RESHUFFLING'       // Frequently joining/leaving groups
  | 'TIMELINE_UNREALISTIC'    // Move-in dates that don't make sense
  | 'INCOME_INCONSISTENCY'    // Declared vs verified income mismatch
  | 'VELOCITY_ANOMALY';       // General activity velocity issues

// Thresholds for automatic flagging
const THRESHOLDS = {
  PROFILE_CHANGES_PER_WEEK: 5,
  VERIFICATION_RETRIES: 3,
  APPLICATIONS_PER_DAY: 10,
  GROUP_RESHUFFLES_PER_WEEK: 3,
} as const;

interface DetectionResult {
  signals: FraudSignal[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  requiresReview: boolean;
  details: Record<string, unknown>;
}

/**
 * Analyze user activity for fraud signals
 * Returns signals as flags, not judgments
 */
export async function analyzeUserActivity(userId: string): Promise<DetectionResult> {
  const signals: FraudSignal[] = [];
  const details: Record<string, unknown> = {};

  try {
    // Fetch user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('profile_changes_count, last_profile_change_at, verification_retry_count, application_burst_count, last_application_at, group_reshuffles, fraud_flags')
      .eq('id', userId)
      .single();

    if (!profile) {
      return {
        signals: [],
        riskLevel: 'low',
        requiresReview: false,
        details: { error: 'Profile not found' },
      };
    }

    // Check profile churn
    if (profile.profile_changes_count && profile.profile_changes_count > THRESHOLDS.PROFILE_CHANGES_PER_WEEK) {
      signals.push('PROFILE_CHURN');
      details.profileChanges = profile.profile_changes_count;
    }

    // Check verification retries
    if (profile.verification_retry_count && profile.verification_retry_count > THRESHOLDS.VERIFICATION_RETRIES) {
      signals.push('VERIFICATION_RETRY');
      details.verificationRetries = profile.verification_retry_count;
    }

    // Check application burst
    if (profile.application_burst_count && profile.application_burst_count > THRESHOLDS.APPLICATIONS_PER_DAY) {
      signals.push('APPLICATION_BURST');
      details.applicationBurst = profile.application_burst_count;
    }

    // Check group reshuffling
    if (profile.group_reshuffles && profile.group_reshuffles > THRESHOLDS.GROUP_RESHUFFLES_PER_WEEK) {
      signals.push('GROUP_RESHUFFLING');
      details.groupReshuffles = profile.group_reshuffles;
    }

    // Include existing fraud flags
    if (profile.fraud_flags && profile.fraud_flags.length > 0) {
      profile.fraud_flags.forEach((flag: string) => {
        if (!signals.includes(flag as FraudSignal)) {
          signals.push(flag as FraudSignal);
        }
      });
    }

    // Calculate risk level
    const riskLevel = calculateRiskLevel(signals.length);

    return {
      signals,
      riskLevel,
      requiresReview: riskLevel === 'high' || riskLevel === 'critical',
      details,
    };
  } catch (error) {
    console.error('[AntiScam] Analysis error:', error);
    return {
      signals: [],
      riskLevel: 'low',
      requiresReview: false,
      details: { error: 'Analysis failed' },
    };
  }
}

/**
 * Calculate risk level based on number of signals
 */
function calculateRiskLevel(signalCount: number): 'low' | 'medium' | 'high' | 'critical' {
  if (signalCount === 0) return 'low';
  if (signalCount === 1) return 'medium';
  if (signalCount <= 3) return 'high';
  return 'critical';
}

/**
 * Record a fraud signal for a user
 */
export async function recordFraudSignal(
  userId: string, 
  signal: FraudSignal
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get current flags
    const { data: profile } = await supabase
      .from('profiles')
      .select('fraud_flags')
      .eq('id', userId)
      .single();

    const currentFlags = profile?.fraud_flags || [];
    
    // Don't duplicate
    if (currentFlags.includes(signal)) {
      return { success: true };
    }

    // Update with new flag
    const { error } = await supabase
      .from('profiles')
      .update({
        fraud_flags: [...currentFlags, signal],
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    // Log to audit
    await supabase.from('audit_logs').insert({
      user_id: userId,
      action: 'FRAUD_SIGNAL_RECORDED',
      resource_type: 'profile',
      resource_id: userId,
      metadata: { signal },
    });

    return { success: true };
  } catch (err) {
    console.error('[AntiScam] Record signal error:', err);
    return { success: false, error: 'Failed to record signal' };
  }
}

/**
 * Clear a fraud signal for a user (admin only)
 */
export async function clearFraudSignal(
  userId: string, 
  signal: FraudSignal
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('fraud_flags')
      .eq('id', userId)
      .single();

    const currentFlags = profile?.fraud_flags || [];
    const updatedFlags = currentFlags.filter((f: string) => f !== signal);

    const { error } = await supabase
      .from('profiles')
      .update({
        fraud_flags: updatedFlags,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('[AntiScam] Clear signal error:', err);
    return { success: false, error: 'Failed to clear signal' };
  }
}

/**
 * Increment profile change counter
 */
export async function trackProfileChange(userId: string): Promise<void> {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('profile_changes_count')
      .eq('id', userId)
      .single();

    const newCount = (profile?.profile_changes_count || 0) + 1;

    await supabase
      .from('profiles')
      .update({
        profile_changes_count: newCount,
        last_profile_change_at: new Date().toISOString(),
      })
      .eq('id', userId);

    // Auto-flag if threshold exceeded
    if (newCount > THRESHOLDS.PROFILE_CHANGES_PER_WEEK) {
      await recordFraudSignal(userId, 'PROFILE_CHURN');
    }
  } catch (error) {
    console.error('[AntiScam] Track profile change error:', error);
  }
}

/**
 * Increment application counter
 */
export async function trackApplication(userId: string): Promise<void> {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('application_burst_count, last_application_at')
      .eq('id', userId)
      .single();

    // Reset counter if last application was more than 24 hours ago
    const lastApp = profile?.last_application_at ? new Date(profile.last_application_at) : null;
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const shouldReset = !lastApp || lastApp < oneDayAgo;
    const newCount = shouldReset ? 1 : (profile?.application_burst_count || 0) + 1;

    await supabase
      .from('profiles')
      .update({
        application_burst_count: newCount,
        last_application_at: new Date().toISOString(),
      })
      .eq('id', userId);

    // Auto-flag if threshold exceeded
    if (newCount > THRESHOLDS.APPLICATIONS_PER_DAY) {
      await recordFraudSignal(userId, 'APPLICATION_BURST');
    }
  } catch (error) {
    console.error('[AntiScam] Track application error:', error);
  }
}
