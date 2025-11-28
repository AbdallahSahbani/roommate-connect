import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUserRole } from "@/hooks/useCurrentUserRole";
import { Search, CheckCircle2, XCircle } from "lucide-react";

export default function AdminUsers() {
  const navigate = useNavigate();
  const { isAdmin, loading: roleLoading } = useCurrentUserRole();
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      navigate("/");
      return;
    }

    async function loadUsers() {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setUsers(data);
      }
      setLoading(false);
    }

    if (!roleLoading && isAdmin) {
      loadUsers();
    }
  }, [isAdmin, roleLoading, navigate]);

  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (roleLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-8">User Management</h1>

          <Card className="p-6 bg-texture mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </Card>

          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <Card key={user.id} className="p-6 bg-texture hover:scale-[1.01] transition-all duration-300 cursor-pointer" 
                    onClick={() => navigate(`/admin/users/${user.id}`)}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">
                        {user.full_name || "Unnamed User"}
                      </h3>
                      <Badge variant="outline">{user.role || "renter"}</Badge>
                      {user.id_verified && (
                        <Badge variant="default" className="flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          ID Verified
                        </Badge>
                      )}
                      {user.income_verified && (
                        <Badge variant="default" className="flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Income Verified
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <div className="mt-2 flex gap-4 text-sm">
                      <span className="text-muted-foreground">
                        ID: {user.id_verification_status || "not_started"}
                      </span>
                      <span className="text-muted-foreground">
                        Joined: {new Date(user.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            {filteredUsers.length === 0 && (
              <Card className="p-12 bg-texture text-center">
                <p className="text-muted-foreground">No users found</p>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
