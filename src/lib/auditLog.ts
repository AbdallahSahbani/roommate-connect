import { supabase } from "@/integrations/supabase/client";

export async function createAuditLog(
  action: string,
  resourceType: string,
  resourceId?: string,
  metadata?: Record<string, any>
) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return;

  await supabase.from("audit_logs").insert({
    user_id: user.id,
    action,
    resource_type: resourceType,
    resource_id: resourceId,
    metadata,
  });
}
