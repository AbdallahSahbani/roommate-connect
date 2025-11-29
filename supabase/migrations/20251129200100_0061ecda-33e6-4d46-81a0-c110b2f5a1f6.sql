-- Add property requirement columns
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS max_occupants integer,
ADD COLUMN IF NOT EXISTS min_household_income numeric,
ADD COLUMN IF NOT EXISTS required_id_verified boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS required_income_verified boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS required_background_check boolean DEFAULT false;

-- Drop applications table if exists to recreate with correct structure
DROP TABLE IF EXISTS applications CASCADE;

-- Create applications table
CREATE TABLE applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  applicant_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status text CHECK (status IN ('pending', 'approved', 'rejected', 'waitlisted', 'cancelled')) DEFAULT 'pending',
  meets_verification boolean NOT NULL,
  meets_income boolean NOT NULL,
  meets_background boolean NOT NULL,
  meets_capacity boolean NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(applicant_id, property_id)
);

-- Enable RLS on applications
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own applications
CREATE POLICY "Users can view own applications"
ON applications
FOR SELECT
USING (auth.uid() = applicant_id);

-- Policy: Users can insert their own applications
CREATE POLICY "Users can insert own applications"
ON applications
FOR INSERT
WITH CHECK (auth.uid() = applicant_id);

-- Policy: Users can update their own applications (for cancellation)
CREATE POLICY "Users can update own applications"
ON applications
FOR UPDATE
USING (auth.uid() = applicant_id);

-- Policy: Landlords can view applications for their properties
CREATE POLICY "Landlords can view property applications"
ON applications
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM properties
    WHERE properties.id = applications.property_id
    AND properties.landlord_id = auth.uid()
  )
);

-- Policy: Landlords can update applications for their properties
CREATE POLICY "Landlords can update property applications"
ON applications
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM properties
    WHERE properties.id = applications.property_id
    AND properties.landlord_id = auth.uid()
  )
);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_applications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER applications_updated_at_trigger
BEFORE UPDATE ON applications
FOR EACH ROW
EXECUTE FUNCTION update_applications_updated_at();