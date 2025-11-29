-- Create security definer function to check if user is landlord of a property
CREATE OR REPLACE FUNCTION public.is_property_landlord(_user_id uuid, _property_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM properties
    WHERE id = _property_id
      AND landlord_id = _user_id
  )
$$;

-- Update applications policies to use the security definer function
DROP POLICY IF EXISTS "Landlords can view property applications" ON applications;
DROP POLICY IF EXISTS "Landlords can update property applications" ON applications;

CREATE POLICY "Landlords can view property applications"
ON applications
FOR SELECT
USING (
  auth.uid() = applicant_id 
  OR public.is_property_landlord(auth.uid(), property_id)
);

CREATE POLICY "Landlords can update property applications"
ON applications
FOR UPDATE
USING (public.is_property_landlord(auth.uid(), property_id));