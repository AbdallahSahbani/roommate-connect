-- Add policy for landlords to view income verifications of applicants
-- Landlords can ONLY view income verifications when:
-- 1. The user has an active application to one of their properties
-- 2. The user has an active agreement with them
-- This ensures ethical access - only when there's a legitimate business need

CREATE POLICY "Landlords can view applicant income verifications"
ON public.income_verifications
FOR SELECT
TO authenticated
USING (
  -- Landlord can view if user applied to their property
  EXISTS (
    SELECT 1
    FROM public.applications a
    JOIN public.properties p ON a.property_id = p.id
    JOIN public.group_members gm ON a.group_id = gm.group_id
    WHERE p.landlord_id = auth.uid()
      AND gm.user_id = income_verifications.user_id
      AND a.status IN ('pending', 'under_review', 'approved')
  )
  OR
  -- Landlord can view if user made an inquiry about their property
  EXISTS (
    SELECT 1
    FROM public.property_inquiries pi
    JOIN public.properties p ON pi.property_id = p.id
    WHERE p.landlord_id = auth.uid()
      AND pi.user_id = income_verifications.user_id
      AND pi.status IN ('new', 'in_progress')
  )
  OR
  -- Landlord can view if there's an active or pending agreement
  EXISTS (
    SELECT 1
    FROM public.agreements ag
    WHERE ag.landlord_id = auth.uid()
      AND ag.tenant_user_id = income_verifications.user_id
      AND ag.status IN ('pending_email_confirmation', 'active', 'signed')
  )
);

-- Add audit logging comment for transparency
COMMENT ON POLICY "Landlords can view applicant income verifications" ON public.income_verifications IS 
'Allows landlords to view income verification documents only for users with active business relationships (applications, inquiries, or agreements). This ensures ethical access to sensitive financial data only when necessary for rental decisions.';