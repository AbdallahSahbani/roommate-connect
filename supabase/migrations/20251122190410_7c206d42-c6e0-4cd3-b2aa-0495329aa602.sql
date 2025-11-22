-- Drop and recreate the view with proper security settings
DROP VIEW IF EXISTS public.public_profiles;

-- Create a view that respects RLS policies (security_invoker=on)
CREATE VIEW public.public_profiles 
WITH (security_invoker=on)
AS
SELECT 
  id,
  full_name,
  bio,
  avatar_url,
  profile_photo_url,
  EXTRACT(YEAR FROM age(date_of_birth))::integer as age,
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

-- Grant access to authenticated users
GRANT SELECT ON public.public_profiles TO authenticated;

COMMENT ON VIEW public.public_profiles IS 'Public view of profiles with sensitive PII removed. Uses security_invoker to respect RLS policies.';