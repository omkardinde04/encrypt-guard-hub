import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Users, Activity, FileText, ArrowLeft, AlertTriangle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

const Admin = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch users with their roles and file counts
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, created_at');
      
      if (profilesError) throw profilesError;

      const usersWithDetails = await Promise.all(
        profiles.map(async (profile) => {
          // Get user's roles
          const { data: roles } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', profile.id);

          // Get user's file count
          const { count: filesCount } = await supabase
            .from('files')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', profile.id);

          // Get last activity
          const { data: lastActivity } = await supabase
            .from('activity_logs')
            .select('created_at')
            .eq('user_id', profile.id)
            .order('created_at', { ascending: false })
            .limit(1);

          return {
            id: profile.id,
            name: profile.full_name || 'Unknown User',
            email: `User ID: ${profile.id.slice(0, 8)}...`,
            role: roles?.[0]?.role || 'user',
            filesCount: filesCount || 0,
            lastActive: lastActivity?.[0]?.created_at 
              ? format(new Date(lastActivity[0].created_at), 'yyyy-MM-dd')
              : 'Never'
          };
        })
      );

      return usersWithDetails;
    }
  });

  // Fetch activity logs
  const { data: activityLogs, isLoading: logsLoading } = useQuery({
    queryKey: ['admin-activity-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('id, user_id, action, details, severity, created_at')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;

      // Get user names for the logs
      const logsWithUsers = await Promise.all(
        data.map(async (log) => {
          if (!log.user_id) {
            return {
              ...log,
              userEmail: 'System'
            };
          }

          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', log.user_id)
            .maybeSingle();

          return {
            ...log,
            userEmail: profile?.full_name || 'Unknown User'
          };
        })
      );

      return logsWithUsers;
    }
  });

  // Fetch stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { count: filesCount } = await supabase
        .from('files')
        .select('*', { count: 'exact', head: true });

      const { count: todayActivityCount } = await supabase
        .from('activity_logs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString());

      const { count: alertsCount } = await supabase
        .from('activity_logs')
        .select('*', { count: 'exact', head: true })
        .eq('severity', 'error')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      return {
        usersCount: usersCount || 0,
        filesCount: filesCount || 0,
        todayActivityCount: todayActivityCount || 0,
        alertsCount: alertsCount || 0
      };
    }
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "error": return "destructive";
      case "warning": return "warning";
      default: return "secondary";
    }
  };

  const isLoading = usersLoading || logsLoading || statsLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Admin Panel</h1>
              <p className="text-xs text-muted-foreground">System Management</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Users</CardDescription>
                <CardTitle className="text-3xl">{stats?.usersCount || 0}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="w-4 h-4 mr-1" />
                  Registered users
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Files</CardDescription>
                <CardTitle className="text-3xl">{stats?.filesCount || 0}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground">
                  <FileText className="w-4 h-4 mr-1" />
                  All encrypted
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Activity Today</CardDescription>
                <CardTitle className="text-3xl">{stats?.todayActivityCount || 0}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Activity className="w-4 h-4 mr-1" />
                  Operations logged
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Security Alerts</CardDescription>
                <CardTitle className="text-3xl text-warning">{stats?.alertsCount || 0}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  Last 7 days
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="activity">Activity Logs</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Registered Users</CardTitle>
                <CardDescription>Manage user accounts and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {usersData?.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium">{user.name}</h3>
                              <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                                {user.role}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {user.email} • {user.filesCount} files • Last active {user.lastActive}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {!usersData?.length && (
                      <p className="text-center text-muted-foreground py-8">No users found</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Logs Tab */}
          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Activity Logs</CardTitle>
                <CardDescription>Complete audit trail of all system operations</CardDescription>
              </CardHeader>
              <CardContent>
                {logsLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activityLogs?.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-start gap-4 p-4 border border-border rounded-lg"
                      >
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-1">
                          <Activity className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{log.action}</span>
                            <Badge variant={getSeverityColor(log.severity) as any} className="text-xs">
                              {log.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">{log.details}</p>
                          <p className="text-xs text-muted-foreground">
                            {log.userEmail} • {format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss')}
                          </p>
                        </div>
                      </div>
                    ))}
                    {!activityLogs?.length && (
                      <p className="text-center text-muted-foreground py-8">No activity logs found</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Security Configuration</CardTitle>
                  <CardDescription>System-wide security settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <h3 className="font-medium">Password Hashing</h3>
                      <p className="text-sm text-muted-foreground">bcrypt with 10 rounds</p>
                    </div>
                    <Badge className="bg-secure text-secure-foreground">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <h3 className="font-medium">File Encryption</h3>
                      <p className="text-sm text-muted-foreground">AES-256-CBC</p>
                    </div>
                    <Badge className="bg-secure text-secure-foreground">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <h3 className="font-medium">JWT Token Expiry</h3>
                      <p className="text-sm text-muted-foreground">24 hours</p>
                    </div>
                    <Badge className="bg-secure text-secure-foreground">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <h3 className="font-medium">Rate Limiting</h3>
                      <p className="text-sm text-muted-foreground">100 requests per 15 minutes</p>
                    </div>
                    <Badge className="bg-secure text-secure-foreground">Active</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
