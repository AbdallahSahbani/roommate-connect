/**
 * Roomates Matching Algorithm
 * 
 * Security: All matching is done client-side with validated data
 * Never trust client input - validate before using in calculations
 */

interface Profile {
  id: string;
  budget_max?: number | null;
  budget_min?: number | null;
  cleanliness_level?: number | null;
  noise_tolerance?: number | null;
  pets?: string | null;
  smoking?: string | null;
  sleep_schedule?: string | null;
  social_preference?: string | null;
  self_reported_monthly_income?: number | null;
}

interface Group {
  id: string;
  combined_budget_max?: number | null;
  preferred_city?: string | null;
  preferred_state?: string | null;
}

interface Property {
  id: string;
  rent_total?: number | null;
  rent_amount?: number | null;
  max_occupants?: number | null;
  min_household_income?: number | null;
  city?: string | null;
  state?: string | null;
}

interface CompatibilityScore {
  overall: number;
  budgetScore: number;
  lifestyleScore: number;
  scheduleScore: number;
  socialScore: number;
}

/**
 * Calculate compatibility between two user profiles
 * @returns Score object with overall (0-100) and component scores
 */
export function scoreUsers(profileA: Profile, profileB: Profile): CompatibilityScore {
  const scores: number[] = [];
  
  // 1. Budget compatibility (0-100)
  let budgetScore = 0;
  if (profileA.budget_max && profileB.budget_max) {
    const maxBudget = Math.max(profileA.budget_max, profileB.budget_max);
    const minBudget = Math.min(profileA.budget_max, profileB.budget_max);
    const budgetDiff = maxBudget - minBudget;
    const percentDiff = budgetDiff / maxBudget;
    budgetScore = Math.max(0, 100 - (percentDiff * 100));
    scores.push(budgetScore);
  }
  
  // 2. Lifestyle compatibility (cleanliness + noise + pets + smoking)
  let lifestyleScore = 0;
  let lifestyleCount = 0;
  
  // Cleanliness (1-5 scale)
  if (profileA.cleanliness_level && profileB.cleanliness_level) {
    const diff = Math.abs(profileA.cleanliness_level - profileB.cleanliness_level);
    lifestyleScore += Math.max(0, 100 - (diff * 25)); // 0 diff = 100, 4 diff = 0
    lifestyleCount++;
  }
  
  // Noise tolerance (1-5 scale)
  if (profileA.noise_tolerance && profileB.noise_tolerance) {
    const diff = Math.abs(profileA.noise_tolerance - profileB.noise_tolerance);
    lifestyleScore += Math.max(0, 100 - (diff * 25));
    lifestyleCount++;
  }
  
  // Pets (exact match preferred)
  if (profileA.pets && profileB.pets) {
    lifestyleScore += profileA.pets === profileB.pets ? 100 : 50;
    lifestyleCount++;
  }
  
  // Smoking (exact match required for high score)
  if (profileA.smoking && profileB.smoking) {
    lifestyleScore += profileA.smoking === profileB.smoking ? 100 : 20;
    lifestyleCount++;
  }
  
  const avgLifestyleScore = lifestyleCount > 0 ? lifestyleScore / lifestyleCount : 0;
  if (lifestyleCount > 0) scores.push(avgLifestyleScore);
  
  // 3. Schedule compatibility (sleep_schedule)
  let scheduleScore = 0;
  if (profileA.sleep_schedule && profileB.sleep_schedule) {
    scheduleScore = profileA.sleep_schedule === profileB.sleep_schedule ? 100 : 50;
    scores.push(scheduleScore);
  }
  
  // 4. Social compatibility
  let socialScore = 0;
  if (profileA.social_preference && profileB.social_preference) {
    socialScore = profileA.social_preference === profileB.social_preference ? 100 : 60;
    scores.push(socialScore);
  }
  
  // Calculate overall score (average of all component scores)
  const overall = scores.length > 0 
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0;
  
  return {
    overall,
    budgetScore: Math.round(budgetScore),
    lifestyleScore: Math.round(avgLifestyleScore),
    scheduleScore: Math.round(scheduleScore),
    socialScore: Math.round(socialScore),
  };
}

/**
 * Calculate how well a property matches a group
 * @returns Score 0-100 (higher is better)
 */
export function scorePropertyForGroup(
  group: Group,
  members: Profile[],
  property: Property
): number {
  const scores: number[] = [];
  const groupSize = members.length;
  
  if (groupSize === 0) return 0;
  
  // Use rent_total if available, otherwise rent_amount
  const propertyRent = property.rent_total ?? property.rent_amount ?? 0;
  
  // 1. Occupancy check (hard requirement)
  if (property.max_occupants && groupSize > property.max_occupants) {
    return 0; // Reject if group too large
  }
  
  // 2. Income verification check (hard requirement)
  if (property.min_household_income) {
    const totalVerifiedIncome = members.reduce((sum, m) => {
      return sum + (m.self_reported_monthly_income ?? 0);
    }, 0);
    
    if (totalVerifiedIncome < property.min_household_income) {
      return 0; // Reject if income too low
    }
  }
  
  // 3. Budget compatibility (per person)
  const perPersonRent = propertyRent / groupSize;
  let budgetScore = 0;
  
  // Check if per-person rent fits within group budget
  if (group.combined_budget_max) {
    const perPersonBudget = group.combined_budget_max / groupSize;
    if (perPersonRent <= perPersonBudget) {
      // Within budget - score based on how much room is left
      const utilizationPercent = (perPersonRent / perPersonBudget) * 100;
      // 70-90% utilization is ideal, score accordingly
      if (utilizationPercent >= 70 && utilizationPercent <= 90) {
        budgetScore = 100;
      } else if (utilizationPercent < 70) {
        budgetScore = 80; // Under budget is good but not perfect
      } else {
        budgetScore = Math.max(0, 100 - (utilizationPercent - 90) * 2);
      }
      scores.push(budgetScore);
    } else {
      return 0; // Over budget - reject
    }
  }
  
  // 4. Location match
  let locationScore = 0;
  let locationMatches = 0;
  
  if (group.preferred_state && property.state) {
    if (group.preferred_state.toLowerCase() === property.state.toLowerCase()) {
      locationScore += 50;
      locationMatches++;
    }
  }
  
  if (group.preferred_city && property.city) {
    if (group.preferred_city.toLowerCase() === property.city.toLowerCase()) {
      locationScore += 50;
      locationMatches++;
    }
  }
  
  if (locationMatches > 0) {
    scores.push(locationScore);
  }
  
  // Calculate overall score
  const overall = scores.length > 0
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 50; // Neutral score if no criteria
  
  return overall;
}

/**
 * Save compatibility score to database
 * Security: Only authenticated users can save their own scores
 */
export async function saveCompatibilityScore(
  supabase: any,
  userId1: string,
  userId2: string,
  scores: CompatibilityScore
): Promise<{ success: boolean; error?: string }> {
  try {
    // Ensure consistent ordering (smaller UUID first)
    const [id1, id2] = userId1 < userId2 ? [userId1, userId2] : [userId2, userId1];
    
    const { error } = await supabase
      .from('compatibility_scores')
      .upsert({
        user_id_1: id1,
        user_id_2: id2,
        overall_score: scores.overall,
        budget_score: scores.budgetScore,
        lifestyle_score: scores.lifestyleScore,
        schedule_score: scores.scheduleScore,
        social_score: scores.socialScore,
        calculated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id_1,user_id_2'
      });
    
    if (error) {
      console.error('Error saving compatibility score:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (err) {
    console.error('Unexpected error saving compatibility score:', err);
    return { success: false, error: 'Failed to save compatibility score' };
  }
}
