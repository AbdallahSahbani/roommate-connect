import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  AlertTriangle, 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock,
  User,
  Ban
} from "lucide-react";
import { format } from "date-fns";

interface AbuseFlag {
  id: string;
  user_id: string;
  reason: string;
  details: string | null;
  severity: string;
  status: string;
  created_at: string;
}

interface SecurityEvent {
  id: string;
  user_id: string | null;
  event_type: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

const AdminAbuse = () => {
  const [abuseFlags, setAbuseFlags] = useState<AbuseFlag[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [flagsRes, eventsRes] = await Promise.all([
        supabase
          .from('abuse_flags')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50),
        supabase
          .from('security_events')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100),
      ]);

      if (flagsRes.data) setAbuseFlags(flagsRes.data);
      if (eventsRes.data) setSecurityEvents(eventsRes.data as SecurityEvent[]);
    } catch (error) {
      console.error('Error fetching abuse data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateFlagStatus = async (flagId: string, newStatus: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('abuse_flags')
        .update({ 
          status: newStatus, 
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', flagId);

      if (error) throw error;

      toast({ title: "Flag updated", description: `Status changed to ${newStatus}` });
      fetchData();
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Failed to update flag",
        variant: "destructive" 
      });
    }
  };

  const suspendUser = async (userId: string, reason: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_suspended: true, 
          suspension_reason: reason,
          suspended_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      toast({ title: "User suspended", description: "Account has been suspended" });
      fetchData();
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Failed to suspend user",
        variant: "destructive" 
      });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'actioned': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'dismissed': return <XCircle className="h-4 w-4 text-muted-foreground" />;
      case 'reviewed': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Abuse Monitoring</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-500">
              {abuseFlags.filter(f => f.status === 'pending').length}
            </div>
            <p className="text-sm text-muted-foreground">Pending Flags</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-500">
              {abuseFlags.filter(f => f.severity === 'critical').length}
            </div>
            <p className="text-sm text-muted-foreground">Critical Issues</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-500">
              {abuseFlags.filter(f => f.status === 'actioned').length}
            </div>
            <p className="text-sm text-muted-foreground">Actioned</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{securityEvents.length}</div>
            <p className="text-sm text-muted-foreground">Recent Events</p>
          </CardContent>
        </Card>
      </div>

      {/* Abuse Flags */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Abuse Flags
          </CardTitle>
        </CardHeader>
        <CardContent>
          {abuseFlags.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No abuse flags found</p>
          ) : (
            <div className="space-y-4">
              {abuseFlags.map((flag) => (
                <div 
                  key={flag.id} 
                  className="border rounded-lg p-4 flex items-start justify-between gap-4"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(flag.status)}
                      <Badge className={getSeverityColor(flag.severity)}>
                        {flag.severity}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(flag.created_at), 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>
                    <p className="font-medium">{flag.reason}</p>
                    {flag.details && (
                      <p className="text-sm text-muted-foreground">{flag.details}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      User ID: {flag.user_id.slice(0, 8)}...
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    {flag.status === 'pending' && (
                      <>
                        <Button 
                          size="sm" 
                          onClick={() => updateFlagStatus(flag.id, 'actioned')}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Action
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => updateFlagStatus(flag.id, 'dismissed')}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Dismiss
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => suspendUser(flag.user_id, flag.reason)}
                        >
                          <Ban className="h-4 w-4 mr-1" />
                          Suspend
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Recent Security Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          {securityEvents.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No security events</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {securityEvents.map((event) => (
                <div 
                  key={event.id} 
                  className="flex items-center gap-4 p-2 border-b"
                >
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm">{event.event_type}</span>
                  <span className="text-xs text-muted-foreground flex-1">
                    {event.user_id ? `User: ${event.user_id.slice(0, 8)}...` : 'Anonymous'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(event.created_at), 'MMM d, h:mm a')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAbuse;
