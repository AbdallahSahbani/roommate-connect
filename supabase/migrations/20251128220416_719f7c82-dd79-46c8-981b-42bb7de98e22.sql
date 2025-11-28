-- Create audit_logs table for admin action tracking
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view all logs
CREATE POLICY "Admins can view all logs"
ON public.audit_logs
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- System can insert logs
CREATE POLICY "System can insert logs"
ON public.audit_logs
FOR INSERT
WITH CHECK (true);

-- Create matches table for roommate connections
CREATE TABLE public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id_1 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id_2 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'mutual' | 'rejected'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id_1, user_id_2),
  CHECK (user_id_1 < user_id_2) -- Ensure consistent ordering
);

-- Enable RLS on matches
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Users can view their own matches
CREATE POLICY "Users can view own matches"
ON public.matches
FOR SELECT
USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

-- Users can create matches
CREATE POLICY "Users can create matches"
ON public.matches
FOR INSERT
WITH CHECK (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

-- Users can update their own matches
CREATE POLICY "Users can update own matches"
ON public.matches
FOR UPDATE
USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

-- Create index for audit logs
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- Create index for matches
CREATE INDEX idx_matches_user_1 ON public.matches(user_id_1);
CREATE INDEX idx_matches_user_2 ON public.matches(user_id_2);
CREATE INDEX idx_matches_status ON public.matches(status);