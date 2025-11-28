import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUserRole } from "@/hooks/useCurrentUserRole";
import { useToast } from "@/hooks/use-toast";
import { createAuditLog } from "@/lib/auditLog";
import { Eye, CheckCircle2, XCircle } from "lucide-react";

export default function AdminVerifications() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin, loading: roleLoading } = useCurrentUserRole();
  const [verifications, setVerifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      navigate("/");
      return;
    }

    loadVerifications();
  }, [isAdmin, roleLoading, navigate]);

  async function loadVerifications() {
    const { data, error } = await supabase
      .from("id_verifications")
      .select(`
        *,
        profiles:user_id (full_name, email)
      `)
      .eq("status", "submitted")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setVerifications(data);
    }
    setLoading(false);
  }

  async function handleApprove(verification: any) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Update verification status
    const { error: verifyError } = await supabase
      .from("id_verifications")
      .update({
        status: "verified",
        reviewed_at: new Date().toISOString(),
        reviewer_id: user.id,
      })
      .eq("id", verification.id);

    if (verifyError) {
      toast({ title: "Error", description: verifyError.message, variant: "destructive" });
      return;
    }

    // Update profile
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        id_verified: true,
        id_verification_status: "verified",
      })
      .eq("id", verification.user_id);

    if (profileError) {
      toast({ title: "Error", description: profileError.message, variant: "destructive" });
      return;
    }

    // Log action
    await createAuditLog("VERIFY_ID", "id_verification", verification.id, {
      user_id: verification.user_id,
      decision: "approved",
    });

    toast({ title: "Success", description: "ID verification approved" });
    loadVerifications();
  }

  async function handleReject(verification: any) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Update verification status
    const { error: verifyError } = await supabase
      .from("id_verifications")
      .update({
        status: "rejected",
        reviewed_at: new Date().toISOString(),
        reviewer_id: user.id,
      })
      .eq("id", verification.id);

    if (verifyError) {
      toast({ title: "Error", description: verifyError.message, variant: "destructive" });
      return;
    }

    // Update profile
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        id_verification_status: "rejected",
      })
      .eq("id", verification.user_id);

    if (profileError) {
      toast({ title: "Error", description: profileError.message, variant: "destructive" });
      return;
    }

    // Log action
    await createAuditLog("REJECT_ID", "id_verification", verification.id, {
      user_id: verification.user_id,
      decision: "rejected",
    });

    toast({ title: "Success", description: "ID verification rejected" });
    loadVerifications();
  }

  async function getImageUrl(path: string) {
    const { data } = await supabase.storage
      .from("verification-docs")
      .createSignedUrl(path, 3600);
    
    return data?.signedUrl || "";
  }

  if (roleLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-8">ID Verification Queue</h1>

          <div className="space-y-4">
            {verifications.map((verification) => (
              <Card key={verification.id} className="p-6 bg-texture">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">
                        {verification.profiles?.full_name || "Unknown User"}
                      </h3>
                      <Badge variant="secondary">Pending Review</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      {verification.profiles?.email}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Submitted: {new Date(verification.created_at).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View Images
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <DialogHeader>
                          <DialogTitle>ID Verification Images</DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium mb-2">Front</p>
                            <img 
                              src={verification.id_front_path}
                              alt="ID Front"
                              className="w-full rounded-lg border"
                              onError={async (e) => {
                                const url = await getImageUrl(verification.id_front_path);
                                e.currentTarget.src = url;
                              }}
                            />
                          </div>
                          <div>
                            <p className="text-sm font-medium mb-2">Back</p>
                            <img 
                              src={verification.id_back_path}
                              alt="ID Back"
                              className="w-full rounded-lg border"
                              onError={async (e) => {
                                const url = await getImageUrl(verification.id_back_path);
                                e.currentTarget.src = url;
                              }}
                            />
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button
                      size="sm"
                      onClick={() => handleApprove(verification)}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleReject(verification)}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
              </Card>
            ))}

            {verifications.length === 0 && (
              <Card className="p-12 bg-texture text-center">
                <p className="text-muted-foreground">No pending verifications</p>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
