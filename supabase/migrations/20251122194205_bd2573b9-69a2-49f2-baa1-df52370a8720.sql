-- Ensure properties table has all required fields
ALTER TABLE public.properties 
  ADD COLUMN IF NOT EXISTS rent_total numeric,
  ADD COLUMN IF NOT EXISTS max_occupants integer,
  ADD COLUMN IF NOT EXISTS bedrooms integer;

-- Update existing data: copy rent_amount to rent_total if null
UPDATE public.properties 
SET rent_total = rent_amount 
WHERE rent_total IS NULL;

-- Update existing data: copy total_bedrooms to bedrooms if null
UPDATE public.properties 
SET bedrooms = total_bedrooms 
WHERE bedrooms IS NULL;