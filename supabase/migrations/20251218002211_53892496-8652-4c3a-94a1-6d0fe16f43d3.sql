-- Security settings table with kill switch
CREATE TABLE public.security_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lockdown boolean NOT NULL DEFAULT false,
  lockdown_reason text,
  lockdown_at timestamp with time zone,
  lockdown_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Insert default row
INSERT INTO public.security_settings (id, lockdown) VALUES (gen_random_uuid(), false);

-- Enable RLS
ALTER TABLE public.security_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can view and update
CREATE POLICY "Admins can view security settings"
  ON public.security_settings FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update security settings"
  ON public.security_settings FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Decision explanations table for audit trail
CREATE TABLE public.decision_explanations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_type text NOT NULL, -- 'application', 'match', 'group_join', 'slot_reserve'
  target_id uuid NOT NULL, -- application_id, match_id, etc.
  user_id uuid,
  inputs_snapshot jsonb NOT NULL,
  rules_triggered text[] DEFAULT '{}',
  ai_flags text[] DEFAULT '{}',
  ai_risk_score integer,
  ai_recommended_action text,
  final_decision text NOT NULL, -- 'approved', 'rejected', 'review', 'pending'
  human_override boolean DEFAULT false,
  override_reason text,
  override_by uuid,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.decision_explanations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all decision explanations"
  ON public.decision_explanations FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view own decision explanations"
  ON public.decision_explanations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert decision explanations"
  ON public.decision_explanations FOR INSERT
  WITH CHECK (true);

-- Add reserved_slots to properties
ALTER TABLE public.properties 
  ADD COLUMN IF NOT EXISTS reserved_slots integer DEFAULT 0;

-- Add slot_reservations table for tracking reservations with expiry
CREATE TABLE public.slot_reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  group_id uuid REFERENCES public.groups(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'reserved', -- 'reserved', 'confirmed', 'expired', 'released'
  reserved_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone DEFAULT (now() + interval '48 hours'),
  confirmed_at timestamp with time zone,
  released_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.slot_reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reservations"
  ON public.slot_reservations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Landlords can view property reservations"
  ON public.slot_reservations FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM properties WHERE id = slot_reservations.property_id AND landlord_id = auth.uid()
  ));

CREATE POLICY "System can manage reservations"
  ON public.slot_reservations FOR ALL
  WITH CHECK (true);

-- Add anti-scam tracking columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS verification_retry_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS application_burst_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_application_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS device_hash text,
  ADD COLUMN IF NOT EXISTS ip_hash text,
  ADD COLUMN IF NOT EXISTS group_reshuffles integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS fraud_flags text[] DEFAULT '{}';

-- Add state column to applications if not exists (for state machine)
-- States: draft, submitted, verifying, ai_review, needs_human_review, approved, rejected, expired
ALTER TABLE public.applications
  DROP COLUMN IF EXISTS status;

ALTER TABLE public.applications
  ADD COLUMN status text DEFAULT 'draft';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_decision_explanations_target ON public.decision_explanations(target_id);
CREATE INDEX IF NOT EXISTS idx_slot_reservations_property ON public.slot_reservations(property_id);
CREATE INDEX IF NOT EXISTS idx_slot_reservations_expires ON public.slot_reservations(expires_at) WHERE status = 'reserved';

-- Function to check if system is in lockdown
CREATE OR REPLACE FUNCTION public.is_system_locked()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT COALESCE(
    (SELECT lockdown FROM security_settings LIMIT 1),
    false
  )
$$;