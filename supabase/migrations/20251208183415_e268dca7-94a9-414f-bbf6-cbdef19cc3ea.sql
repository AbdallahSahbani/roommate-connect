-- Drop the dangerous public access policies
DROP POLICY IF EXISTS "Anyone can view public profiles through view" ON public.profiles;
DROP POLICY IF EXISTS "Group members can view limited profile info" ON public.profiles;
DROP POLICY IF EXISTS "Message participants can view limited profile info" ON public.profiles;

-- Drop the existing public_profiles view if it exists
DROP VIEW IF EXISTS public.public_profiles;

-- Create a SECURE view that only exposes non-sensitive profile fields
-- This view excludes: email, phone, date_of_birth, income data, full addresses
CREATE VIEW public.public_profiles WITH (security_invoker = true) AS
SELECT 
  id,
  -- Only show first name, not full name
  SPLIT_PART(full_name, ' ', 1) AS first_name,
  avatar_url,
  profile_photo_url,
  bio,
  occupation,
  -- Lifestyle preferences (non-sensitive)
  sleep_schedule,
  cleanliness_level,
  noise_tolerance,
  guest_frequency,
  smoking,
  pets,
  social_preference,
  work_from_home,
  -- Housing preferences (non-sensitive)
  budget_min,
  budget_max,
  move_in_date,
  lease_duration_months,
  preferred_cities,
  -- Verification flags only (not actual verification data)
  id_verified,
  income_verified,
  background_check_status,
  -- Profile metadata
  is_public_profile,
  created_at,
  -- Calculate age from date_of_birth without exposing the actual date
  CASE 
    WHEN date_of_birth IS NOT NULL 
    THEN EXTRACT(YEAR FROM age(current_date, date_of_birth))::integer 
    ELSE NULL 
  END AS age
FROM public.profiles
WHERE is_public_profile = true
  AND is_suspended = false;

-- Create new policy: Only authenticated users can view public profiles
-- They must use the public_profiles view for limited data
CREATE POLICY "Authenticated users can view public profile flags"
ON public.profiles
FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND is_public_profile = true
  AND is_suspended = false
  -- Only allow viewing non-sensitive columns through this policy
  -- The actual field restriction happens via the view
);

-- Policy for group members to view basic profile info of other group members
CREATE POLICY "Group members can view fellow member profiles"
ON public.profiles
FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND is_public_profile = true
  AND EXISTS (
    SELECT 1 FROM group_members gm1
    JOIN group_members gm2 ON gm1.group_id = gm2.group_id
    WHERE gm1.user_id = auth.uid()
      AND gm2.user_id = profiles.id
      AND gm1.status = 'active'
      AND gm2.status = 'active'
  )
);

-- Policy for landlords to view applicant verification status
CREATE POLICY "Landlords can view applicant verification flags"
ON public.profiles
FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM applications a
    JOIN properties p ON a.property_id = p.id
    WHERE a.applicant_id = profiles.id
      AND p.landlord_id = auth.uid()
  )
);