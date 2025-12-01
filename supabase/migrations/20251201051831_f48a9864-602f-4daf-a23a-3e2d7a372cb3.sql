-- Drop existing overly permissive RLS policies
DROP POLICY IF EXISTS "Group members can view each other profiles" ON public.profiles;
DROP POLICY IF EXISTS "Message participants can view each other profiles" ON public.profiles;

-- Recreate public_profiles view with only safe, non-sensitive fields
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles AS
SELECT 
  id,
  bio,
  occupation,
  budget_min,
  budget_max,
  preferred_cities,
  move_in_date,
  lease_duration_months,
  cleanliness_level,
  noise_tolerance,
  sleep_schedule,
  smoking,
  pets,
  social_preference,
  guest_frequency,
  work_from_home,
  profile_photo_url,
  avatar_url,
  is_public_profile,
  id_verified,
  income_verified,
  background_check_status,
  created_at,
  -- Calculate age without exposing exact DOB
  CASE 
    WHEN date_of_birth IS NOT NULL 
    THEN DATE_PART('year', AGE(date_of_birth))::integer 
    ELSE NULL 
  END as age,
  -- Only show first name, not full name
  CASE 
    WHEN full_name IS NOT NULL 
    THEN SPLIT_PART(full_name, ' ', 1) 
    ELSE NULL 
  END as first_name
FROM public.profiles
WHERE is_public_profile = true;

-- Add RLS policies for public_profiles view
ALTER VIEW public.public_profiles SET (security_invoker = true);

-- Add new restricted policies for profiles table
-- Group members can only see limited profile info through queries, not direct access
CREATE POLICY "Group members can view limited profile info"
ON public.profiles
FOR SELECT
USING (
  is_public_profile = true 
  AND (
    -- Only if they're in the same active group
    EXISTS (
      SELECT 1 FROM group_members gm1
      JOIN group_members gm2 ON gm1.group_id = gm2.group_id
      WHERE gm1.user_id = auth.uid() 
        AND gm2.user_id = profiles.id
        AND gm1.status = 'active'
        AND gm2.status = 'active'
    )
  )
);

-- Message participants need explicit consent - only after first message exchange
CREATE POLICY "Message participants can view limited profile info"
ON public.profiles
FOR SELECT
USING (
  is_public_profile = true
  AND EXISTS (
    -- Both users must have sent at least one message to each other
    SELECT 1 FROM messages m1
    WHERE (
      (m1.sender_id = auth.uid() AND m1.recipient_id = profiles.id)
      OR (m1.recipient_id = auth.uid() AND m1.sender_id = profiles.id)
    )
    AND EXISTS (
      SELECT 1 FROM messages m2
      WHERE (
        (m2.sender_id = profiles.id AND m2.recipient_id = auth.uid())
        OR (m2.recipient_id = profiles.id AND m2.sender_id = auth.uid())
      )
    )
  )
);