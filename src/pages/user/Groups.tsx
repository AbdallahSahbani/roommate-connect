import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Users, MapPin, Calendar, DollarSign, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface Group {
  id: string;
  name: string;
  description: string | null;
  combined_budget_max: number | null;
  preferred_city: string | null;
  preferred_state: string | null;
  target_move_in_date: string | null;
  created_at: string;
  member_count?: number;
}

const Groups = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    combined_budget_max: "",
    preferred_city: "",
    preferred_state: "",
    target_move_in_date: "",
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch groups where user is creator
      const { data: createdGroups, error: createdError } = await supabase
        .from("groups")
        .select("*")
        .eq("creator_id", user.id)
        .order("created_at", { ascending: false });

      if (createdError) throw createdError;

      // Fetch groups where user is a member
      const { data: memberGroups, error: memberError } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("user_id", user.id)
        .eq("status", "active");

      if (memberError) throw memberError;

      const memberGroupIds = memberGroups?.map(m => m.group_id) || [];
      
      let joinedGroups: any[] = [];
      if (memberGroupIds.length > 0) {
        const { data, error } = await supabase
          .from("groups")
          .select("*")
          .in("id", memberGroupIds)
          .order("created_at", { ascending: false });

        if (error) throw error;
        joinedGroups = data || [];
      }

      // Combine and deduplicate
      const allGroups = [...(createdGroups || []), ...joinedGroups];
      const uniqueGroups = Array.from(new Map(allGroups.map(g => [g.id, g])).values());

      // Get member counts for each group
      const groupsWithCounts = await Promise.all(
        uniqueGroups.map(async (group) => {
          const { count } = await supabase
            .from("group_members")
            .select("*", { count: "exact", head: true })
            .eq("group_id", group.id)
            .eq("status", "active");

          return { ...group, member_count: (count || 0) + 1 }; // +1 for creator
        })
      );

      setGroups(groupsWithCounts);
    } catch (error) {
      console.error("Error loading groups:", error);
      toast({
        title: "Error",
        description: "Failed to load groups",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to create a group",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from("groups")
        .insert({
          name: formData.name,
          description: formData.description || null,
          combined_budget_max: formData.combined_budget_max ? parseInt(formData.combined_budget_max) : null,
          preferred_city: formData.preferred_city || null,
          preferred_state: formData.preferred_state || null,
          target_move_in_date: formData.target_move_in_date || null,
          creator_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Add creator as first member
      await supabase
        .from("group_members")
        .insert({
          group_id: data.id,
          user_id: user.id,
          status: "active",
        });

      toast({
        title: "Success",
        description: "Group created successfully!",
      });

      setIsCreateDialogOpen(false);
      setFormData({
        name: "",
        description: "",
        combined_budget_max: "",
        preferred_city: "",
        preferred_state: "",
        target_move_in_date: "",
      });
      loadGroups();
    } catch (error) {
      console.error("Error creating group:", error);
      toast({
        title: "Error",
        description: "Failed to create group",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">My Groups</h1>
            <p className="text-muted-foreground">
              Create or join groups to find properties together
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Create Group
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Group</DialogTitle>
                <DialogDescription>
                  Set up a group to search for properties with potential roommates
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Group Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., SF Tech Roommates 2025"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what you're looking for..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Preferred City</Label>
                    <Input
                      id="city"
                      placeholder="e.g., San Francisco"
                      value={formData.preferred_city}
                      onChange={(e) => setFormData({ ...formData, preferred_city: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      placeholder="e.g., CA"
                      value={formData.preferred_state}
                      onChange={(e) => setFormData({ ...formData, preferred_state: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="budget">Combined Budget (Max)</Label>
                    <Input
                      id="budget"
                      type="number"
                      placeholder="e.g., 4000"
                      value={formData.combined_budget_max}
                      onChange={(e) => setFormData({ ...formData, combined_budget_max: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="move_date">Target Move-in Date</Label>
                    <Input
                      id="move_date"
                      type="date"
                      value={formData.target_move_in_date}
                      onChange={(e) => setFormData({ ...formData, target_move_in_date: e.target.value })}
                    />
                  </div>
                </div>
                <Button
                  onClick={handleCreateGroup}
                  disabled={!formData.name}
                  className="w-full"
                >
                  Create Group
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading groups...</p>
          </div>
        ) : groups.length === 0 ? (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                No Groups Yet
              </CardTitle>
              <CardDescription>
                Create a group to start finding roommates and properties together
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Group
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {groups.map((group) => (
              <Card
                key={group.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/groups/${group.id}`)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      {group.name}
                    </span>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {group.description || "No description"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {group.preferred_city && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>
                          {group.preferred_city}
                          {group.preferred_state && `, ${group.preferred_state}`}
                        </span>
                      </div>
                    )}
                    {group.combined_budget_max && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        <span>Budget: ${group.combined_budget_max.toLocaleString()}/mo</span>
                      </div>
                    )}
                    {group.target_move_in_date && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Move-in: {new Date(group.target_move_in_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-muted-foreground pt-2 border-t">
                      <Users className="h-4 w-4" />
                      <span>{group.member_count || 1} member{group.member_count !== 1 ? "s" : ""}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Groups;
