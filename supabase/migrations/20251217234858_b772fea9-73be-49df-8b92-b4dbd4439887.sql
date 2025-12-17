-- Add missing columns to compatibility_scores table for roommate matching
ALTER TABLE public.compatibility_scores 
ADD COLUMN IF NOT EXISTS location_score integer,
ADD COLUMN IF NOT EXISTS risk_score integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS llm_summary text,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'suggested' CHECK (status IN ('suggested', 'hidden', 'blocked')),
ADD COLUMN IF NOT EXISTS flags text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS recommended_action text CHECK (recommended_action IN ('approve', 'review', 'reject')),
ADD COLUMN IF NOT EXISTS followups text[] DEFAULT '{}';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_compatibility_scores_status ON public.compatibility_scores(status);

-- Add RLS policy for users to update match status (hide/block)
CREATE POLICY "Users can update their match status"
ON public.compatibility_scores
FOR UPDATE
USING (user_id_1 = auth.uid() OR user_id_2 = auth.uid())
WITH CHECK (user_id_1 = auth.uid() OR user_id_2 = auth.uid());

-- Add profile stability tracking to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS profile_changes_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_profile_change_at timestamp with time zone;