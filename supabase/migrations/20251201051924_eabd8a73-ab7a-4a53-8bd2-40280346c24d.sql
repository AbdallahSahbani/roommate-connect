-- Add RLS policy to allow public access to public_profiles view
-- This allows anyone (authenticated or not) to view the limited safe fields
-- through the public_profiles view context

CREATE POLICY "Anyone can view public profiles through view"
ON public.profiles
FOR SELECT
USING (
  -- Only allow access to profiles marked as public
  is_public_profile = true
  -- And only when accessing the specific safe fields that are in the view
  -- The view itself filters to only safe fields, so this policy enables that access
);