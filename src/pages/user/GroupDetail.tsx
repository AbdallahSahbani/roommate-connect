import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { GroupMatching } from "@/components/GroupMatching";
import { ArrowLeft, Users, Mail, Plus, Home, MessageSquare, X } from "lucide-react";

interface Group {
  id: string;
  name: string;
  description: string | null;
  combined_budget_max: number | null;
  preferred_city: string | null;
  preferred_state: string | null;
  target_move_in_date: string | null;
  creator_id: string;
}

interface Member {
  id: string;
  user_id: string;
  status: string;
  profiles: {
    full_name: string | null;
    email: string;
    profile_photo_url: string | null;
  };
}

interface Property {
  id: string;
  title: string;
  rent_amount: number;
  city: string;
  state: string;
  bedrooms: number;
  bathrooms: number;
  photos: string[] | null;
  added_by_user_id: string;
  note: string | null;
}

const GroupDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    loadGroupData();
  }, [id]);

  const loadGroupData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      setCurrentUserId(user.id);

      // Load group details
      const { data: groupData, error: groupError } = await supabase
        .from("groups")
        .select("*")
        .eq("id", id)
        .single();

      if (groupError) throw groupError;
      setGroup(groupData);

      // Load members
      const { data: membersData, error: membersError } = await supabase
        .from("group_members")
        .select("*")
        .eq("group_id", id)
        .eq("status", "active");

      if (membersError) throw membersError;
      
      // Fetch profiles for members
      if (membersData && membersData.length > 0) {
        const userIds = membersData.map(m => m.user_id);
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, full_name, email, profile_photo_url, self_reported_monthly_income")
          .in("id", userIds);

        const membersWithProfiles = membersData.map(member => ({
          ...member,
          profiles: profilesData?.find(p => p.id === member.user_id) || {
            full_name: null,
            email: "",
            profile_photo_url: null,
          },
        }));
        setMembers(membersWithProfiles);
      } else {
        setMembers([]);
      }

      // Load shared properties
      const { data: propertiesData, error: propertiesError } = await supabase
        .from("group_listings")
        .select(`
          *,
          properties (
            id,
            title,
            rent_amount,
            city,
            state,
            bedrooms,
            bathrooms,
            photos
          )
        `)
        .eq("group_id", id);

      if (propertiesError) throw propertiesError;
      
      const formattedProperties = propertiesData?.map(item => ({
        ...(item.properties as any),
        added_by_user_id: item.added_by_user_id,
        note: item.note,
      })) || [];
      
      setProperties(formattedProperties);
    } catch (error) {
      console.error("Error loading group data:", error);
      toast({
        title: "Error",
        description: "Failed to load group details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInviteMember = async () => {
    try {
      // In a real app, you'd send an email invitation here
      // For now, we'll just show a success message
      toast({
        title: "Invitation Sent",
        description: `Invitation sent to ${inviteEmail}`,
      });
      setInviteEmail("");
      setIsInviteDialogOpen(false);
    } catch (error) {
      console.error("Error inviting member:", error);
      toast({
        title: "Error",
        description: "Failed to send invitation",
        variant: "destructive",
      });
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from("group_members")
        .delete()
        .eq("id", memberId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Member removed from group",
      });
      loadGroupData();
    } catch (error) {
      console.error("Error removing member:", error);
      toast({
        title: "Error",
        description: "Failed to remove member",
        variant: "destructive",
      });
    }
  };

  const handleContactLandlord = async (propertyId: string) => {
    try {
      const { data: property } = await supabase
        .from("properties")
        .select("landlord_id")
        .eq("id", propertyId)
        .single();

      if (!property) return;

      // Create or get conversation
      const { data: conversation } = await supabase
        .from("conversations")
        .select("*")
        .eq("property_id", propertyId)
        .eq("renter_id", currentUserId)
        .single();

      if (conversation) {
        navigate(`/messages?conversation=${conversation.id}`);
      } else {
        const { data: newConversation } = await supabase
          .from("conversations")
          .insert({
            property_id: propertyId,
            landlord_id: property.landlord_id,
            renter_id: currentUserId,
          })
          .select()
          .single();

        navigate(`/messages?conversation=${newConversation?.id}`);
      }
    } catch (error) {
      console.error("Error contacting landlord:", error);
      toast({
        title: "Error",
        description: "Failed to contact landlord",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-muted-foreground">Loading group details...</p>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-muted-foreground">Group not found</p>
          <Button onClick={() => navigate("/groups")} className="mt-4">
            Back to Groups
          </Button>
        </div>
      </div>
    );
  }

  const isCreator = currentUserId === group.creator_id;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/groups")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Groups
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">{group.name}</h1>
          {group.description && (
            <p className="text-muted-foreground">{group.description}</p>
          )}
        </div>

        <Tabs defaultValue="members" className="space-y-6">
          <TabsList>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="properties">Shared Properties</TabsTrigger>
            <TabsTrigger value="matching">Find Matches</TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Group Members</h2>
              {isCreator && (
                <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Invite Member
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Invite Member</DialogTitle>
                      <DialogDescription>
                        Send an invitation to join this group
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="roommate@example.com"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                        />
                      </div>
                      <Button onClick={handleInviteMember} className="w-full">
                        <Mail className="h-4 w-4 mr-2" />
                        Send Invitation
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {members.map((member) => (
                <Card key={member.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={member.profiles.profile_photo_url || undefined} />
                          <AvatarFallback>
                            {member.profiles.full_name?.charAt(0) || member.profiles.email.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-base">
                            {member.profiles.full_name || "Anonymous"}
                          </CardTitle>
                          <CardDescription className="text-sm">
                            {member.profiles.email}
                          </CardDescription>
                        </div>
                      </div>
                      {isCreator && member.user_id !== currentUserId && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveMember(member.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  {member.user_id === group.creator_id && (
                    <CardContent>
                      <Badge>Group Creator</Badge>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="properties" className="space-y-4">
            <h2 className="text-2xl font-semibold">Shared Properties</h2>
            {properties.length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>No Properties Yet</CardTitle>
                  <CardDescription>
                    Use the "Find Matches" tab to discover properties that fit your group's criteria
                  </CardDescription>
                </CardHeader>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {properties.map((property) => (
                  <Card key={property.id}>
                    {property.photos?.[0] && (
                      <div className="aspect-video relative overflow-hidden rounded-t-lg">
                        <img
                          src={property.photos[0]}
                          alt={property.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle>{property.title}</CardTitle>
                      <CardDescription>
                        {property.city}, {property.state}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-2xl font-bold text-primary">
                          ${property.rent_amount.toLocaleString()}/mo
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {property.bedrooms} bed • {property.bathrooms} bath
                        </p>
                        {property.note && (
                          <p className="text-sm italic text-muted-foreground mt-2">
                            Note: {property.note}
                          </p>
                        )}
                        <div className="flex gap-2 pt-4">
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => navigate(`/properties/${property.id}`)}
                          >
                            <Home className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button
                            className="flex-1"
                            onClick={() => handleContactLandlord(property.id)}
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Contact
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="matching">
            <GroupMatching
              group={group}
              members={members.map(m => ({
                id: m.user_id,
                self_reported_monthly_income: (m.profiles as any).self_reported_monthly_income || null,
              }))}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default GroupDetail;
