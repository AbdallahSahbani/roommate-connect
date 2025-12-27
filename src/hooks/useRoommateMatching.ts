import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { scoreUsers } from '@/lib/matching';
import { applyHardFilters } from '@/lib/roommateMatching';

interface Profile {
  id: string;
  full_name?: string | null;
  profile_photo_url?: string | null;
  date_of_birth?: string | null;
  occupation?: string | null;
  bio?: string | null;
  preferred_cities?: string[] | null;
  preferred_city?: string | null;
  preferred_state?: string | null;
  budget_min?: number | null;
  budget_max?: number | null;
  sleep_schedule?: string | null;
  social_preference?: string | null;
  pets?: string | null;
  smoking?: string | null;
  cleanliness_level?: number | null;
  noise_tolerance?: number | null;
  work_from_home?: boolean | null;
  move_in_date?: string | null;
  id_verified?: boolean | null;
  income_verified?: boolean | null;
  profile_completed?: boolean | null;
  profile_changes_count?: number | null;
}

interface ScoredCandidate extends Profile {
  compatibilityScore: number;
}

interface AIInsights {
  vibeCheck: string;
  compatibilityPoints: string[];
  potentialChallenges: string[];
  recommendedIcebreaker: string;
}

export function useRoommateMatching() {
  const [candidates, setCandidates] = useState<ScoredCandidate[]>([]);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [aiInsights, setAiInsights] = useState<Record<string, AIInsights>>({});
  const [insightsLoading, setInsightsLoading] = useState<Record<string, boolean>>({});
  const [passedIds, setPassedIds] = useState<Set<string>>(new Set());
  const [connectedIds, setConnectedIds] = useState<Set<string>>(new Set());

  // Load candidates
  const loadCandidates = useCallback(async () => {
    setLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    // Get current user's profile
    const { data: myProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!myProfile) {
      setLoading(false);
      return;
    }

    setCurrentUser(myProfile);

    // Get existing matches to exclude
    const { data: existingMatches } = await supabase
      .from('matches')
      .select('user_id_1, user_id_2')
      .or(`user_id_1.eq.${user.id},user_id_2.eq.${user.id}`);

    const matchedUserIds = new Set<string>();
    existingMatches?.forEach(match => {
      if (match.user_id_1 === user.id) {
        matchedUserIds.add(match.user_id_2);
      } else {
        matchedUserIds.add(match.user_id_1);
      }
    });

    // Get potential roommates
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .neq('id', user.id)
      .eq('is_public_profile', true)
      .eq('is_suspended', false);

    if (!profiles) {
      setLoading(false);
      return;
    }

    // Filter and score candidates
    const scored: ScoredCandidate[] = profiles
      .filter(profile => {
        // Exclude already matched users
        if (matchedUserIds.has(profile.id)) return false;
        
        // Apply hard filters
        const filterResult = applyHardFilters(myProfile, profile);
        return filterResult.passed;
      })
      .map(profile => {
        const score = scoreUsers(myProfile, profile);
        return {
          ...profile,
          compatibilityScore: score.overall,
        };
      })
      .filter(c => c.compatibilityScore >= 40) // Minimum threshold
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    setCandidates(scored);
    setLoading(false);
  }, []);

  // Get AI insights for a candidate
  const getAIInsights = useCallback(async (candidate: ScoredCandidate) => {
    if (!currentUser || aiInsights[candidate.id] || insightsLoading[candidate.id]) return;

    setInsightsLoading(prev => ({ ...prev, [candidate.id]: true }));

    try {
      const { data, error } = await supabase.functions.invoke('roommate-match-ai', {
        body: {
          currentUser: {
            occupation: currentUser.occupation,
            budget_min: currentUser.budget_min,
            budget_max: currentUser.budget_max,
            cleanliness_level: currentUser.cleanliness_level,
            noise_tolerance: currentUser.noise_tolerance,
            pets: currentUser.pets,
            smoking: currentUser.smoking,
            sleep_schedule: currentUser.sleep_schedule,
            social_preference: currentUser.social_preference,
            work_from_home: currentUser.work_from_home,
            preferred_cities: currentUser.preferred_cities,
            id_verified: currentUser.id_verified,
            income_verified: currentUser.income_verified,
          },
          candidate: {
            occupation: candidate.occupation,
            budget_min: candidate.budget_min,
            budget_max: candidate.budget_max,
            cleanliness_level: candidate.cleanliness_level,
            noise_tolerance: candidate.noise_tolerance,
            pets: candidate.pets,
            smoking: candidate.smoking,
            sleep_schedule: candidate.sleep_schedule,
            social_preference: candidate.social_preference,
            work_from_home: candidate.work_from_home,
            preferred_cities: candidate.preferred_cities,
            id_verified: candidate.id_verified,
            income_verified: candidate.income_verified,
          },
          compatibilityScore: candidate.compatibilityScore,
        },
      });

      if (error) throw error;

      // Check if we got a fallback due to rate limit
      const insights = data.fallback || data;
      setAiInsights(prev => ({ ...prev, [candidate.id]: insights }));
    } catch (err) {
      console.error('Failed to get AI insights:', err);
    } finally {
      setInsightsLoading(prev => ({ ...prev, [candidate.id]: false }));
    }
  }, [currentUser, aiInsights, insightsLoading]);

  // Handle swipe actions
  const handleSwipe = useCallback(async (direction: 'left' | 'right') => {
    const candidate = candidates[currentIndex];
    if (!candidate || !currentUser) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (direction === 'right') {
      // Connect action
      const [userId1, userId2] = [user.id, candidate.id].sort();

      // Check for existing match
      const { data: existingMatch } = await supabase
        .from('matches')
        .select('*')
        .eq('user_id_1', userId1)
        .eq('user_id_2', userId2)
        .single();

      if (existingMatch) {
        if (existingMatch.status === 'pending') {
          await supabase
            .from('matches')
            .update({ status: 'mutual' })
            .eq('id', existingMatch.id);
        }
      } else {
        await supabase.from('matches').insert({
          user_id_1: userId1,
          user_id_2: userId2,
          status: 'pending',
        });
      }

      setConnectedIds(prev => new Set(prev).add(candidate.id));
    } else {
      // Pass action
      setPassedIds(prev => new Set(prev).add(candidate.id));
    }

    setCurrentIndex(prev => prev + 1);
  }, [candidates, currentIndex, currentUser]);

  // Load initial data
  useEffect(() => {
    loadCandidates();
  }, [loadCandidates]);

  // Prefetch AI insights for current and next candidates
  useEffect(() => {
    if (candidates.length === 0) return;

    const current = candidates[currentIndex];
    const next = candidates[currentIndex + 1];

    if (current) getAIInsights(current);
    if (next) getAIInsights(next);
  }, [candidates, currentIndex, getAIInsights]);

  const currentCandidate = candidates[currentIndex];
  const nextCandidate = candidates[currentIndex + 1];

  return {
    candidates,
    currentCandidate,
    nextCandidate,
    currentIndex,
    totalCandidates: candidates.length,
    loading,
    aiInsights,
    insightsLoading,
    handleSwipe,
    refreshCandidates: loadCandidates,
  };
}
