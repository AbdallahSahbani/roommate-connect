-- =====================================================
-- SECURITY HARDENING MIGRATION
-- RLS & Data Protection Enhancement
-- =====================================================

-- 1. Add security-related columns to profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS trust_level text DEFAULT 'unverified' 
    CHECK (trust_level IN ('unverified', 'basic', 'id_verified', 'income_verified', 'trusted')),
  ADD COLUMN IF NOT EXISTS is_suspended boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS suspension_reason text,
  ADD COLUMN IF NOT EXISTS suspended_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS profile_completed boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_login_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS login_count integer DEFAULT 0;

-- 2. Create security_events table for logging
CREATE TABLE IF NOT EXISTS public.security_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  ip_hash text,
  user_agent text,
  metadata jsonb,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Only admins can view security events
CREATE POLICY "Admins can view security events"
  ON public.security_events FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- System can insert security events
CREATE POLICY "System can insert security events"
  ON public.security_events FOR INSERT
  WITH CHECK (true);

-- 3. Create abuse_flags table
CREATE TABLE IF NOT EXISTS public.abuse_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reason text NOT NULL,
  details text,
  severity text DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed', 'actioned')),
  reviewed_by uuid,
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.abuse_flags ENABLE ROW LEVEL SECURITY;

-- Only admins can manage abuse flags
CREATE POLICY "Admins can manage abuse flags"
  ON public.abuse_flags FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- 4. Create login_attempts table for brute force protection
CREATE TABLE IF NOT EXISTS public.login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email_hash text NOT NULL,
  ip_hash text NOT NULL,
  success boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

-- No public access to login attempts
CREATE POLICY "Admins can view login attempts"
  ON public.login_attempts FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert login attempts"
  ON public.login_attempts FOR INSERT
  WITH CHECK (true);

-- 5. Add rate limiting support table
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type text NOT NULL,
  ip_hash text,
  count integer DEFAULT 1,
  window_start timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- System can manage rate limits
CREATE POLICY "System can manage rate limits"
  ON public.rate_limits FOR ALL
  WITH CHECK (true);

-- 6. Function to check if user is suspended
CREATE OR REPLACE FUNCTION public.is_user_suspended(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_suspended FROM profiles WHERE id = _user_id),
    false
  )
$$;

-- 7. Function to get user trust level
CREATE OR REPLACE FUNCTION public.get_trust_level(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT trust_level FROM profiles WHERE id = _user_id),
    'unverified'
  )
$$;

-- 8. Update trust level based on verification status
CREATE OR REPLACE FUNCTION public.update_trust_level()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Calculate trust level based on verifications
  IF NEW.id_verified = true AND NEW.income_verified = true AND NEW.background_check_status = 'approved' THEN
    NEW.trust_level := 'trusted';
  ELSIF NEW.income_verified = true THEN
    NEW.trust_level := 'income_verified';
  ELSIF NEW.id_verified = true THEN
    NEW.trust_level := 'id_verified';
  ELSIF NEW.email_verified = true AND NEW.profile_completed = true THEN
    NEW.trust_level := 'basic';
  ELSE
    NEW.trust_level := 'unverified';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-update trust level
DROP TRIGGER IF EXISTS update_profile_trust_level ON public.profiles;
CREATE TRIGGER update_profile_trust_level
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_trust_level();

-- 9. Strengthen profiles RLS - prevent suspended users from acting
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id AND NOT is_user_suspended(auth.uid()))
  WITH CHECK (auth.uid() = id AND NOT is_user_suspended(auth.uid()));

-- 10. Strengthen messages RLS - prevent suspended users from messaging
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
CREATE POLICY "Users can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() 
    AND NOT is_user_suspended(auth.uid())
  );

-- 11. Strengthen applications RLS - prevent suspended users from applying
DROP POLICY IF EXISTS "Users can insert own applications" ON public.applications;
CREATE POLICY "Users can insert own applications"
  ON public.applications FOR INSERT
  WITH CHECK (
    auth.uid() = applicant_id 
    AND NOT is_user_suspended(auth.uid())
  );

-- 12. Add index for faster security queries
CREATE INDEX IF NOT EXISTS idx_profiles_trust_level ON public.profiles(trust_level);
CREATE INDEX IF NOT EXISTS idx_profiles_suspended ON public.profiles(is_suspended) WHERE is_suspended = true;
CREATE INDEX IF NOT EXISTS idx_security_events_user ON public.security_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_abuse_flags_user ON public.abuse_flags(user_id, status);
CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON public.login_attempts(email_hash, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_action ON public.rate_limits(user_id, action_type, window_start);

-- 13. Function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  _user_id uuid,
  _event_type text,
  _ip_hash text DEFAULT NULL,
  _user_agent text DEFAULT NULL,
  _metadata jsonb DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  event_id uuid;
BEGIN
  INSERT INTO security_events (user_id, event_type, ip_hash, user_agent, metadata)
  VALUES (_user_id, _event_type, _ip_hash, _user_agent, _metadata)
  RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$;

-- 14. Function to check rate limit
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  _user_id uuid,
  _action_type text,
  _ip_hash text,
  _max_count integer,
  _window_minutes integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_count integer;
  window_start timestamp with time zone;
BEGIN
  window_start := now() - (_window_minutes || ' minutes')::interval;
  
  SELECT COUNT(*) INTO current_count
  FROM rate_limits
  WHERE (user_id = _user_id OR ip_hash = _ip_hash)
    AND action_type = _action_type
    AND created_at > window_start;
  
  IF current_count >= _max_count THEN
    RETURN false; -- Rate limited
  END IF;
  
  -- Record this attempt
  INSERT INTO rate_limits (user_id, action_type, ip_hash)
  VALUES (_user_id, _action_type, _ip_hash);
  
  RETURN true; -- Allowed
END;
$$;

-- 15. Function to flag suspicious activity
CREATE OR REPLACE FUNCTION public.create_abuse_flag(
  _user_id uuid,
  _reason text,
  _details text DEFAULT NULL,
  _severity text DEFAULT 'low'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  flag_id uuid;
BEGIN
  INSERT INTO abuse_flags (user_id, reason, details, severity)
  VALUES (_user_id, _reason, _details, _severity)
  RETURNING id INTO flag_id;
  
  RETURN flag_id;
END;
$$;

-- 16. Cleanup old rate limit records (run periodically)
CREATE OR REPLACE FUNCTION public.cleanup_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM rate_limits WHERE created_at < now() - interval '1 hour';
  DELETE FROM login_attempts WHERE created_at < now() - interval '24 hours';
END;
$$;