import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrentUserRole } from "@/hooks/useCurrentUserRole";
import { supabase } from "@/integrations/supabase/client";
import { Users, FileCheck, Building, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { isAdmin, loading: roleLoading } = useCurrentUserRole();
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingVerifications: 0,
    activeProperties: 0,
    pendingApplications: 0,
  });

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      navigate("/");
      return;
    }

    async function loadStats() {
      const [users, verifications, properties, applications] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("income_verifications").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("properties").select("id", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("applications").select("id", { count: "exact", head: true }).eq("status", "pending"),
      ]);

      setStats({
        totalUsers: users.count || 0,
        pendingVerifications: verifications.count || 0,
        activeProperties: properties.count || 0,
        pendingApplications: applications.count || 0,
      });
    }

    if (!roleLoading && isAdmin) {
      loadStats();
    }
  }, [isAdmin, roleLoading, navigate]);

  if (roleLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-foreground">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-texture hover:scale-105 transition-smooth">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card className="bg-texture hover:scale-105 transition-smooth">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Verifications</CardTitle>
              <AlertTriangle className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingVerifications}</div>
            </CardContent>
          </Card>

          <Card className="bg-texture hover:scale-105 transition-smooth">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Properties</CardTitle>
              <Building className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeProperties}</div>
            </CardContent>
          </Card>

          <Card className="bg-texture hover:scale-105 transition-smooth">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Applications</CardTitle>
              <FileCheck className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingApplications}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/admin/users">
            <Card className="bg-texture hover:scale-105 transition-smooth cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  View and manage all users, roles, and permissions
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/verifications">
            <Card className="bg-texture hover:scale-105 transition-smooth cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5" />
                  Verifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Review and approve ID and income verifications
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/logs">
            <Card className="bg-texture hover:scale-105 transition-smooth cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  System Logs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  View system activity and audit logs
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
