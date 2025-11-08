import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, FileText, Upload, Search, Lock, Edit, Trash2, Download, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Dashboard = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data - will be replaced with real data from Lovable Cloud
  const files = [
    { id: 1, name: "Financial_Report_2024.pdf", size: "2.4 MB", encrypted: true, uploadedAt: "2024-01-15" },
    { id: 2, name: "User_Database_Backup.sql", size: "15.8 MB", encrypted: true, uploadedAt: "2024-01-14" },
    { id: 3, name: "Security_Audit_Log.txt", size: "456 KB", encrypted: true, uploadedAt: "2024-01-13" },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Secure File Vault</h1>
              <p className="text-xs text-muted-foreground">Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/admin")}>
              Admin Panel
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Files</CardDescription>
              <CardTitle className="text-3xl">24</CardTitle>
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
              <CardDescription>Storage Used</CardDescription>
              <CardTitle className="text-3xl">156 MB</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                <Lock className="w-4 h-4 mr-1" />
                AES-256 encrypted
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Security Score</CardDescription>
              <CardTitle className="text-3xl text-secure">98%</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                <Shield className="w-4 h-4 mr-1" />
                Excellent
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions & Search */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search encrypted files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={() => navigate("/upload")} className="md:w-auto">
                <Upload className="w-4 h-4 mr-2" />
                Upload File
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Files Table */}
        <Card>
          <CardHeader>
            <CardTitle>Your Encrypted Files</CardTitle>
            <CardDescription>All files are encrypted with AES-256 before storage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-encrypted/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-encrypted" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{file.name}</h3>
                        {file.encrypted && (
                          <Badge variant="outline" className="text-xs">
                            <Lock className="w-3 h-3 mr-1" />
                            Encrypted
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {file.size} • Uploaded {file.uploadedAt}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
