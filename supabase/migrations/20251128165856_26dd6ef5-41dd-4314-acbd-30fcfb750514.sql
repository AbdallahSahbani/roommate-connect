-- Create id_verifications table
CREATE TABLE public.id_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'verified', 'rejected')),
  id_front_path TEXT NOT NULL,
  id_back_path TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewer_id UUID REFERENCES auth.users(id),
  review_notes TEXT,
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.id_verifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for id_verifications
CREATE POLICY "Users can view own verification"
  ON public.id_verifications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own verification"
  ON public.id_verifications
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own verification"
  ON public.id_verifications
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Add fields to profiles if they don't exist
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS id_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS id_verification_status TEXT DEFAULT 'not_started';

-- Create storage bucket for verification documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('verification-docs', 'verification-docs', false);

-- Storage policies for verification-docs bucket
CREATE POLICY "Users can upload own verification docs"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'verification-docs' 
    AND auth.uid()::text = (string_to_array(name, '/'))[2]
  );

CREATE POLICY "Users can view own verification docs"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'verification-docs' 
    AND auth.uid()::text = (string_to_array(name, '/'))[2]
  );

CREATE POLICY "Admins can view all verification docs"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'verification-docs' 
    AND has_role(auth.uid(), 'admin')
  );