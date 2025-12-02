-- Add capacity management columns to properties
ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS total_slots integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS filled_slots integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS auto_capacity boolean DEFAULT true;

-- Create conversations table for messaging
CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES public.properties(id) ON DELETE CASCADE,
  landlord_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  renter_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(property_id, landlord_id, renter_id)
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own conversations"
  ON public.conversations FOR SELECT
  USING (auth.uid() = landlord_id OR auth.uid() = renter_id);

CREATE POLICY "Users can create conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (auth.uid() = renter_id OR auth.uid() = landlord_id);

-- Update messages table to reference conversations
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS body text;

-- Create property_meetings table for scheduling
CREATE TABLE IF NOT EXISTS public.property_meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  landlord_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  start_time timestamptz NOT NULL,
  status text DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'completed', 'cancelled')),
  reserved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.property_meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view available meeting slots"
  ON public.property_meetings FOR SELECT
  USING (status = 'available' OR auth.uid() = landlord_id OR auth.uid() = reserved_by);

CREATE POLICY "Landlords can manage their meeting slots"
  ON public.property_meetings FOR ALL
  USING (auth.uid() = landlord_id);

CREATE POLICY "Renters can reserve available slots"
  ON public.property_meetings FOR UPDATE
  USING (status = 'available')
  WITH CHECK (auth.uid() = reserved_by AND status = 'reserved');

-- Add move_in_date to applications if not exists
ALTER TABLE public.applications
ADD COLUMN IF NOT EXISTS move_in_date date;

-- Create function to update filled_slots when application status changes
CREATE OR REPLACE FUNCTION update_property_filled_slots()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND NEW.status = 'approved' AND OLD.status != 'approved') THEN
    UPDATE properties
    SET filled_slots = (
      SELECT COUNT(*) FROM applications
      WHERE property_id = NEW.property_id AND status = 'approved'
    )
    WHERE id = NEW.property_id AND auto_capacity = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for auto-updating filled_slots
DROP TRIGGER IF EXISTS update_filled_slots_trigger ON public.applications;
CREATE TRIGGER update_filled_slots_trigger
  AFTER UPDATE ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION update_property_filled_slots();