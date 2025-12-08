-- Drop the existing overly permissive SELECT policy
DROP POLICY IF EXISTS "Users can view their messages" ON public.messages;

-- Create separate, tighter policies for direct messages vs group messages

-- Policy 1: Users can view DIRECT messages where they are sender or recipient
-- Direct messages have group_id = NULL
CREATE POLICY "Users can view direct messages"
ON public.messages
FOR SELECT
USING (
  group_id IS NULL 
  AND (sender_id = auth.uid() OR recipient_id = auth.uid())
);

-- Policy 2: Users can view GROUP messages only if they are active members
-- Group messages have group_id NOT NULL
CREATE POLICY "Active group members can view group messages"
ON public.messages
FOR SELECT
USING (
  group_id IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM group_members
    WHERE group_members.group_id = messages.group_id
      AND group_members.user_id = auth.uid()
      AND group_members.status = 'active'
  )
);