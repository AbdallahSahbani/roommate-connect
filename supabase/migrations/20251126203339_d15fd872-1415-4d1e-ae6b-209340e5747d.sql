-- Drop the overly permissive policy that allows all authenticated users to view profiles
DROP POLICY IF EXISTS "Users can view limited public profile info" ON public.profiles;

-- Create restrictive policies based on legitimate business relationships

-- 1. Group members can view each other's profiles (potential roommates)
CREATE POLICY "Group members can view each other profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.group_members gm1
    JOIN public.group_members gm2 ON gm1.group_id = gm2.group_id
    WHERE gm1.user_id = auth.uid()
      AND gm2.user_id = public.profiles.id
      AND gm1.status = 'active'
      AND gm2.status = 'active'
  )
);

-- 2. Landlords can view profiles of users who applied to their properties
CREATE POLICY "Landlords can view applicant profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.applications a
    JOIN public.properties p ON a.property_id = p.id
    JOIN public.group_members gm ON a.group_id = gm.group_id
    WHERE p.landlord_id = auth.uid()
      AND gm.user_id = public.profiles.id
  )
  OR
  EXISTS (
    SELECT 1
    FROM public.property_inquiries pi
    JOIN public.properties p ON pi.property_id = p.id
    WHERE p.landlord_id = auth.uid()
      AND pi.user_id = public.profiles.id
  )
  OR
  EXISTS (
    SELECT 1
    FROM public.agreements ag
    WHERE ag.landlord_id = auth.uid()
      AND ag.tenant_user_id = public.profiles.id
  )
);

-- 3. Users in message threads can view each other's profiles
CREATE POLICY "Message participants can view each other profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.messages m
    WHERE (m.sender_id = auth.uid() AND m.recipient_id = public.profiles.id)
       OR (m.recipient_id = auth.uid() AND m.sender_id = public.profiles.id)
  )
);

-- 4. Public profiles with opt-in (for Browse/matching features)
CREATE POLICY "Users can view public opt-in profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  public.profiles.is_public_profile = true
  AND public.profiles.is_active = true
  AND public.profiles.id <> auth.uid()
);