import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SecurityStatus {
  isSuspended: boolean;
  suspensionReason: string | null;
  trustLevel: string;
  loading: boolean;
}

/**
 * Hook to check user's security status (suspension, trust level)
 * Use this to gate features based on user's security standing
 */
export function useSecurityCheck(): SecurityStatus {
  const [status, setStatus] = useState<SecurityStatus>({
    isSuspended: false,
    suspensionReason: null,
    trustLevel: 'unverified',
    loading: true,
  });

  useEffect(() => {
    async function checkStatus() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setStatus({
            isSuspended: false,
            suspensionReason: null,
            trustLevel: 'unverified',
            loading: false,
          });
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('is_suspended, suspension_reason, trust_level')
          .eq('id', user.id)
          .maybeSingle();

        setStatus({
          isSuspended: profile?.is_suspended ?? false,
          suspensionReason: profile?.suspension_reason ?? null,
          trustLevel: profile?.trust_level ?? 'unverified',
          loading: false,
        });
      } catch (error) {
        console.error('Error checking security status:', error);
        setStatus(prev => ({ ...prev, loading: false }));
      }
    }

    checkStatus();
  }, []);

  return status;
}

/**
 * Check if user meets minimum trust level for an action
 */
export function meetsMinimumTrust(
  currentLevel: string, 
  requiredLevel: 'unverified' | 'basic' | 'id_verified' | 'income_verified' | 'trusted'
): boolean {
  const levels = ['unverified', 'basic', 'id_verified', 'income_verified', 'trusted'];
  const currentIndex = levels.indexOf(currentLevel);
  const requiredIndex = levels.indexOf(requiredLevel);
  return currentIndex >= requiredIndex;
}
