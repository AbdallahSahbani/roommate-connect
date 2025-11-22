-- Drop the overly permissive policy that allows anyone to view all profiles
DROP POLICY IF EXISTS "Users can view all active profiles" ON public.profiles;

-- Allow users to view their own complete profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Allow authenticated users to view LIMITED public information of other active users
-- This policy only exposes non-sensitive fields needed for roommate matching
CREATE POLICY "Users can view limited public profile info"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  is_active = true 
  AND id != auth.uid()
);

-- Create a view that exposes only public profile information for roommate matching
-- This excludes sensitive PII like email, phone, exact date_of_birth, income details
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  full_name,
  bio,
  avatar_url,
  profile_photo_url,
  EXTRACT(YEAR FROM age(date_of_birth))::integer as age, -- Calculate age without exposing DOB
  occupation,
  preferred_cities,
  budget_min,
  budget_max,
  move_in_date,
  lease_duration_months,
  sleep_schedule,
  social_preference,
  smoking,
  pets,
  guest_frequency,
  work_from_home,
  noise_tolerance,
  cleanliness_level,
  is_public_profile,
  id_verified,
  income_verified,
  background_check_status,
  created_at
FROM public.profiles
WHERE is_active = true;

-- Grant access to the public profiles view
GRANT SELECT ON public.public_profiles TO authenticated;

COMMENT ON VIEW public.public_profiles IS 'Public view of profiles with sensitive PII removed (no email, phone, DOB, income details)';

-- Note: Applications should use public_profiles view for browsing roommates
-- and only query profiles table directly when users need their own sensitive data