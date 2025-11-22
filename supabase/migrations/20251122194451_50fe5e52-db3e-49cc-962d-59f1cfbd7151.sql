-- Add preferred location fields to profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS preferred_state text;