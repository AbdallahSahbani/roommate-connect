import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [verifications, setVerifications] = useState<any[]>([]);

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    // Check if user has admin role
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "admin")
      .single();

    if (!roles) {
      toast({
        title: "Access Denied",
        description: "You don't have admin permissions",
        variant: "destructive"
      });
      navigate("/dashboard");
      return;
    }

    await loadVerifications();
    setLoading(false);
  };

  const loadVerifications = async () => {
    const { data } = await supabase
      .from("income_verifications")
      .select(`
        *,
        profiles:user_id (full_name, email)
      `)
      .order("created_at", { ascending: false });

    if (data) setVerifications(data);
  };

  const handleApprove = async (id: string, income: number) => {
    const { error } = await supabase
      .from("income_verifications")
      .update({ 
        status: "approved",
        verified_monthly_income: income
      })
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Verification approved" });
      await loadVerifications();
    }
  };

  const handleReject = async (id: string) => {
    const { error } = await supabase
      .from("income_verifications")
      .update({ status: "rejected" })
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Verification rejected" });
      await loadVerifications();
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Income Verifications</h2>

            <div className="space-y-4">
              {verifications.map((verification) => (
                <Card key={verification.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">
                          {verification.profiles?.full_name || "Unknown User"}
                        </h3>
                        <Badge variant={
                          verification.status === "approved" ? "default" :
                          verification.status === "rejected" ? "destructive" :
                          "secondary"
                        }>
                          {verification.status === "approved" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                          {verification.status === "rejected" && <XCircle className="h-3 w-3 mr-1" />}
                          {verification.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                          {verification.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {verification.profiles?.email}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Source: {verification.source}
                      </p>
                      {verification.verified_monthly_income && (
                        <p className="text-sm font-semibold mt-2">
                          Verified Income: ${verification.verified_monthly_income.toLocaleString()}/mo
                        </p>
                      )}
                    </div>

                    {verification.status === "pending" && (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => {
                            const income = prompt("Enter verified monthly income:");
                            if (income) handleApprove(verification.id, parseFloat(income));
                          }}
                        >
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleReject(verification.id)}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              ))}

              {verifications.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No verification requests
                </p>
              )}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
