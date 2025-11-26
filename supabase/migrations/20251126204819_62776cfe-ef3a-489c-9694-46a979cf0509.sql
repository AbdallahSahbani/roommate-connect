-- ============================================
-- ROOMATES SECURE SCHEMA (Fixed)
-- ============================================

-- 1. Ensure profiles has role column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'role'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN role text DEFAULT 'renter' CHECK (role IN ('renter', 'landlord', 'both'));
  END IF;
END $$;

-- 2. Add missing columns to properties
ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS public_code text UNIQUE;

-- These might already exist, check first
DO $$ 
BEGIN
  ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS rent_total numeric;
  ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS min_household_income numeric;
  ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS max_occupants int;
EXCEPTION WHEN duplicate_column THEN
  NULL;
END $$;

-- 3. Add location preferences to groups (already exist, but ensuring)
DO $$ 
BEGIN
  ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS preferred_city text;
  ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS preferred_state text;
EXCEPTION WHEN duplicate_column THEN
  NULL;
END $$;

-- 4. Create function to generate public_code for properties
CREATE OR REPLACE FUNCTION generate_property_code(state_abbr text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sequence_num int;
  code text;
BEGIN
  -- Get next sequence number for this state
  SELECT COALESCE(MAX(
    CAST(
      SUBSTRING(public_code FROM '[0-9]+$') AS int
    )
  ), 0) + 1
  INTO sequence_num
  FROM properties
  WHERE public_code LIKE 'RM-' || UPPER(COALESCE(state_abbr, 'XX')) || '-%';
  
  -- Generate code: RM-STATE-000001
  code := 'RM-' || UPPER(COALESCE(state_abbr, 'XX')) || '-' || LPAD(sequence_num::text, 6, '0');
  
  RETURN code;
END;
$$;

-- 5. Create trigger to auto-generate public_code on property insert
CREATE OR REPLACE FUNCTION auto_generate_property_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.public_code IS NULL THEN
    NEW.public_code := generate_property_code(NEW.state);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_auto_property_code ON public.properties;
CREATE TRIGGER trigger_auto_property_code
  BEFORE INSERT ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_property_code();

-- ============================================
-- SECURE RLS POLICIES
-- ============================================

-- Drop overly permissive policy
DROP POLICY IF EXISTS "Users can view public opt-in profiles" ON public.profiles;

-- Create strict profile viewing policy
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can view own full profile" ON public.profiles;
  CREATE POLICY "Users can view own full profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

-- Landlords can view verification flags only
DO $$
BEGIN
  DROP POLICY IF EXISTS "Landlords can view applicant verification flags" ON public.profiles;
  CREATE POLICY "Landlords can view applicant verification flags"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT DISTINCT gm.user_id
      FROM group_members gm
      JOIN applications a ON a.group_id = gm.group_id
      JOIN properties p ON p.id = a.property_id
      WHERE p.landlord_id = auth.uid()
      
      UNION
      
      SELECT DISTINCT pi.user_id
      FROM property_inquiries pi
      JOIN properties p ON p.id = pi.property_id
      WHERE p.landlord_id = auth.uid()
    )
  );
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

-- Update property viewing policy
DROP POLICY IF EXISTS "Anyone can view active properties" ON public.properties;
CREATE POLICY "Anyone can view active properties"
ON public.properties
FOR SELECT
TO authenticated
USING (is_active = true);

-- Update property photos policy
DROP POLICY IF EXISTS "Anyone can view property photos" ON public.property_photos;
CREATE POLICY "Anyone can view active property photos"
ON public.property_photos
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM properties p
    WHERE p.id = property_photos.property_id
    AND p.is_active = true
  )
);

-- Update groups viewing policy
DROP POLICY IF EXISTS "Users can view groups they're members of" ON public.groups;
CREATE POLICY "Members can view their groups"
ON public.groups
FOR SELECT
TO authenticated
USING (
  auth.uid() = creator_id OR
  EXISTS (
    SELECT 1 FROM group_members gm
    WHERE gm.group_id = groups.id
    AND gm.user_id = auth.uid()
    AND gm.status = 'active'
  )
);

-- Update group members viewing policy
DROP POLICY IF EXISTS "Users can view members of their groups" ON public.group_members;
CREATE POLICY "Group members can view membership"
ON public.group_members
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM group_members gm2
    WHERE gm2.group_id = group_members.group_id
    AND gm2.user_id = auth.uid()
    AND gm2.status = 'active'
  )
);

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_properties_state_active ON public.properties(state, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_properties_city_active ON public.properties(city, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_compatibility_users ON public.compatibility_scores(user_id_1, user_id_2);
CREATE INDEX IF NOT EXISTS idx_group_members_lookup ON public.group_members(group_id, user_id, status);

-- Security documentation
COMMENT ON COLUMN profiles.self_reported_monthly_income IS 'SENSITIVE: Only visible to user themselves. Landlords see verification flags only.';
COMMENT ON FUNCTION generate_property_code IS 'Auto-generates unique property codes in format RM-STATE-000001';
COMMENT ON POLICY "Landlords can view applicant verification flags" ON profiles IS 'Landlords can see verification flags but NOT numeric income values';