import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Users, Activity, FileText, ArrowLeft, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Admin = () => {
  const navigate = useNavigate();

  // Mock data
  const users = [
    { id: 1, name: "John Doe", email: "john@example.com", role: "user", filesCount: 12, lastActive: "2024-01-15" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", role: "admin", filesCount: 8, lastActive: "2024-01-15" },
    { id: 3, name: "Bob Johnson", email: "bob@example.com", role: "user", filesCount: 5, lastActive: "2024-01-14" },
  ];

  const activityLogs = [
    { id: 1, user: "john@example.com", action: "FILE_UPLOAD", details: "Uploaded Financial_Report_2024.pdf", timestamp: "2024-01-15 14:32:15", severity: "info" },
    { id: 2, user: "jane@example.com", action: "FILE_DELETE", details: "Deleted old_backup.sql", timestamp: "2024-01-15 13:20:45", severity: "warning" },
    { id: 3, user: "bob@example.com", action: "LOGIN", details: "Successful login from 192.168.1.100", timestamp: "2024-01-15 12:15:30", severity: "info" },
    { id: 4, user: "unknown", action: "LOGIN_FAILED", details: "Failed login attempt from 10.0.0.50", timestamp: "2024-01-15 11:45:22", severity: "error" },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "error": return "destructive";
      case "warning": return "warning";
      default: return "secondary";
    }
  };

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
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Users</CardDescription>
              <CardTitle className="text-3xl">127</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="w-4 h-4 mr-1" />
                +12 this week
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Files</CardDescription>
              <CardTitle className="text-3xl">1,247</CardTitle>
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
              <CardTitle className="text-3xl">342</CardTitle>
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
              <CardTitle className="text-3xl text-warning">3</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                <AlertTriangle className="w-4 h-4 mr-1" />
                Requires attention
              </div>
            </CardContent>
          </Card>
        </div>

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
                <div className="space-y-4">
                  {users.map((user) => (
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
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button variant="ghost" size="sm">Delete</Button>
                      </div>
                    </div>
                  ))}
                </div>
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
                <div className="space-y-3">
                  {activityLogs.map((log) => (
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
                          {log.user} • {log.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
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
