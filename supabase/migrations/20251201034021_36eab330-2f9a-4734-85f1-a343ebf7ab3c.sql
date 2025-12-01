-- ================================================================
-- SECTION B: DATABASE SCHEMA & RLS POLICIES
-- Creating all required tables with proper security
-- ================================================================

-- Add missing columns to profiles table (if not exists)
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS preferred_city text,
  ADD COLUMN IF NOT EXISTS preferred_state text,
  ADD COLUMN IF NOT EXISTS preferred_country text DEFAULT 'United States',
  ADD COLUMN IF NOT EXISTS cleanliness_level int CHECK (cleanliness_level BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS noise_tolerance int CHECK (noise_tolerance BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS pets text,
  ADD COLUMN IF NOT EXISTS smoking text,
  ADD COLUMN IF NOT EXISTS sleep_schedule text,
  ADD COLUMN IF NOT EXISTS social_preference text,
  ADD COLUMN IF NOT EXISTS work_from_home boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'free';

-- Ensure properties table has all required columns
ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS street_address text,
  ADD COLUMN IF NOT EXISTS country text DEFAULT 'United States',
  ADD COLUMN IF NOT EXISTS bedrooms int,
  ADD COLUMN IF NOT EXISTS bathrooms numeric,
  ADD COLUMN IF NOT EXISTS square_feet int,
  ADD COLUMN IF NOT EXISTS min_household_income numeric,
  ADD COLUMN IF NOT EXISTS max_occupants int,
  ADD COLUMN IF NOT EXISTS available_from date,
  ADD COLUMN IF NOT EXISTS property_type text DEFAULT 'apartment',
  ADD COLUMN IF NOT EXISTS furnished boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS pets_allowed boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS smoking_allowed boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS parking text,
  ADD COLUMN IF NOT EXISTS lat numeric,
  ADD COLUMN IF NOT EXISTS lng numeric;

-- Create groups table if not exists
CREATE TABLE IF NOT EXISTS groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  creator_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  combined_budget_max numeric,
  target_move_in_date date,
  preferred_city text,
  preferred_state text,
  preferred_country text DEFAULT 'United States',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create group_members table if not exists
CREATE TABLE IF NOT EXISTS group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES groups(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  status text DEFAULT 'active',
  joined_at timestamptz DEFAULT now(),
  UNIQUE (group_id, user_id)
);

-- Create compatibility_scores table if not exists
CREATE TABLE IF NOT EXISTS compatibility_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id_1 uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id_2 uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  overall_score numeric,
  budget_score numeric,
  lifestyle_score numeric,
  schedule_score numeric,
  social_score numeric,
  calculated_at timestamptz DEFAULT now(),
  UNIQUE (user_id_1, user_id_2)
);

-- Ensure applications table exists with proper structure
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  applicant_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  group_id uuid REFERENCES groups(id) ON DELETE SET NULL,
  status text DEFAULT 'pending',
  message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create system_logs table for admin observability
CREATE TABLE IF NOT EXISTS system_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id uuid REFERENCES auth.users(id),
  action text,
  target_type text,
  target_id uuid,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- ================================================================
-- FUNCTION: Generate public property codes (RM-CT-000001)
-- ================================================================
CREATE OR REPLACE FUNCTION generate_public_code(_state text)
RETURNS text 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  seq int;
  code text;
BEGIN
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(public_code FROM '[0-9]+$') AS int)
  ), 0) + 1
  INTO seq
  FROM properties
  WHERE state = _state;
  
  code := 'RM-' || COALESCE(UPPER(_state), 'XX') || '-' || LPAD(seq::text, 6, '0');
  
  RETURN code;
END;
$$;

-- ================================================================
-- ROW LEVEL SECURITY POLICIES
-- ================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE compatibility_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- PROFILES POLICIES
-- ================================================================

-- Drop existing conflicting policies if any
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admin full access to profiles" ON profiles;

-- Users can view and update their own profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Admin full access
CREATE POLICY "Admin full access to profiles"
ON profiles FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- ================================================================
-- GROUPS POLICIES
-- ================================================================

DROP POLICY IF EXISTS "Group members can view groups" ON groups;
DROP POLICY IF EXISTS "Group creator can manage group" ON groups;
DROP POLICY IF EXISTS "Users can create groups" ON groups;
DROP POLICY IF EXISTS "Admin groups access" ON groups;

CREATE POLICY "Group members can view groups"
ON groups FOR SELECT
USING (
  creator_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM group_members gm
    WHERE gm.group_id = groups.id
      AND gm.user_id = auth.uid()
      AND gm.status = 'active'
  )
);

CREATE POLICY "Group creator can manage group"
ON groups FOR UPDATE
USING (creator_id = auth.uid())
WITH CHECK (creator_id = auth.uid());

CREATE POLICY "Users can create groups"
ON groups FOR INSERT
WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Admin groups access"
ON groups FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- ================================================================
-- GROUP_MEMBERS POLICIES
-- ================================================================

DROP POLICY IF EXISTS "Members manage their own membership" ON group_members;
DROP POLICY IF EXISTS "Group creator can add members" ON group_members;
DROP POLICY IF EXISTS "Members can view group membership" ON group_members;

CREATE POLICY "Members can view group membership"
ON group_members FOR SELECT
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM groups g
    WHERE g.id = group_members.group_id
      AND g.creator_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM group_members gm2
    WHERE gm2.group_id = group_members.group_id
      AND gm2.user_id = auth.uid()
      AND gm2.status = 'active'
  )
);

CREATE POLICY "Group creator can add members"
ON group_members FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM groups g
    WHERE g.id = group_members.group_id
      AND g.creator_id = auth.uid()
  )
);

CREATE POLICY "Members manage their own membership"
ON group_members FOR DELETE
USING (user_id = auth.uid());

-- ================================================================
-- COMPATIBILITY_SCORES POLICIES
-- ================================================================

DROP POLICY IF EXISTS "Users can view compatibility scores involving them" ON compatibility_scores;

CREATE POLICY "Users can view scores involving them"
ON compatibility_scores FOR SELECT
USING (
  user_id_1 = auth.uid() OR 
  user_id_2 = auth.uid()
);

-- System can insert scores
CREATE POLICY "System can insert scores"
ON compatibility_scores FOR INSERT
WITH CHECK (true);

-- ================================================================
-- SYSTEM_LOGS POLICIES
-- ================================================================

DROP POLICY IF EXISTS "Admin view logs" ON system_logs;
DROP POLICY IF EXISTS "Anyone can insert logs" ON system_logs;

CREATE POLICY "Admin view logs"
ON system_logs FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert logs"
ON system_logs FOR INSERT
WITH CHECK (true);