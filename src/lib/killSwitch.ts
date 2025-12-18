/**
 * Kill Switch Utility
 * 
 * Emergency controls for platform-wide lockdown.
 * When activated:
 * - All write operations are blocked
 * - UI switches to read-only mode
 * - Users see "System maintenance" message
 */

import { supabase } from "@/integrations/supabase/client";

export interface KillSwitchStatus {
  isLocked: boolean;
  reason: string | null;
  lockedAt: string | null;
  loading: boolean;
  error: string | null;
}

/**
 * Check if system is in lockdown mode
 */
export async function checkKillSwitch(): Promise<KillSwitchStatus> {
  try {
    const { data, error } = await supabase
      .from('security_settings')
      .select('lockdown, lockdown_reason, lockdown_at')
      .limit(1)
      .single();

    if (error) {
      // If table doesn't exist or no access, assume not locked
      console.warn('[KillSwitch] Could not check status:', error.message);
      return {
        isLocked: false,
        reason: null,
        lockedAt: null,
        loading: false,
        error: null,
      };
    }

    return {
      isLocked: data?.lockdown ?? false,
      reason: data?.lockdown_reason ?? null,
      lockedAt: data?.lockdown_at ?? null,
      loading: false,
      error: null,
    };
  } catch (err) {
    console.error('[KillSwitch] Unexpected error:', err);
    return {
      isLocked: false,
      reason: null,
      lockedAt: null,
      loading: false,
      error: 'Failed to check system status',
    };
  }
}

/**
 * Activate kill switch (admin only)
 */
export async function activateKillSwitch(reason: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { error } = await supabase
      .from('security_settings')
      .update({
        lockdown: true,
        lockdown_reason: reason,
        lockdown_at: new Date().toISOString(),
        lockdown_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', (await supabase.from('security_settings').select('id').limit(1).single()).data?.id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('[KillSwitch] Activation error:', err);
    return { success: false, error: 'Failed to activate kill switch' };
  }
}

/**
 * Deactivate kill switch (admin only)
 */
export async function deactivateKillSwitch(): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('security_settings')
      .update({
        lockdown: false,
        lockdown_reason: null,
        lockdown_at: null,
        lockdown_by: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', (await supabase.from('security_settings').select('id').limit(1).single()).data?.id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('[KillSwitch] Deactivation error:', err);
    return { success: false, error: 'Failed to deactivate kill switch' };
  }
}
