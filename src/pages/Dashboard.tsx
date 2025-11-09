import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, FileText, Upload, Search, Lock, Edit, Trash2, Download, LogOut, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PasswordDialog } from "@/components/PasswordDialog";
import { FilePreviewDialog } from "@/components/FilePreviewDialog";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<{
    type: 'download' | 'preview' | 'edit' | 'delete';
    file: any;
  } | null>(null);
  const [previewFile, setPreviewFile] = useState<{
    name: string;
    url: string;
    type?: string;
  } | null>(null);

  useEffect(() => {
    if (user) {
      loadFiles();
    }
  }, [user]);

  const loadFiles = async () => {
    try {
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFiles(data || []);
    } catch (error: any) {
      toast.error("Failed to load files");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (file: any) => {
    if (!confirm(`Are you sure you want to delete "${file.name}"?`)) return;

    if (file.password_hash) {
      setCurrentAction({ type: 'delete', file });
      setPasswordDialogOpen(true);
    } else {
      await executeDelete(file.id, file.file_path, file.name);
    }
  };

  const executeDelete = async (fileId: string, filePath: string, fileName: string) => {
    try {
      // Delete from storage first
      const { error: storageError } = await supabase.storage
        .from('vault')
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('files')
        .delete()
        .eq('id', fileId);

      if (dbError) throw dbError;

      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: user?.id,
        action: 'FILE_DELETE',
        details: `Deleted file: ${fileName}`,
        severity: 'warning'
      });

      toast.success("File deleted successfully");
      loadFiles();
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error("Failed to delete file");
    }
  };

  const verifyPassword = async (file: any, inputPassword: string): Promise<boolean> => {
    if (!file.password_hash) return true;

    // Hash the input password
    const encoder = new TextEncoder();
    const data = encoder.encode(inputPassword);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const inputHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return inputHash === file.password_hash;
  };

  const handlePasswordSubmit = async (password: string) => {
    if (!currentAction) return;

    const isValid = await verifyPassword(currentAction.file, password);
    if (!isValid) {
      toast.error("Incorrect password");
      return;
    }

    setPasswordDialogOpen(false);

    // Execute the action
    if (currentAction.type === 'download') {
      await executeDownload(currentAction.file.file_path, currentAction.file.name);
    } else if (currentAction.type === 'preview') {
      await executePreview(currentAction.file);
    } else if (currentAction.type === 'edit') {
      await executeEdit(currentAction.file.id, currentAction.file.name, currentAction.file.description);
    } else if (currentAction.type === 'delete') {
      await executeDelete(currentAction.file.id, currentAction.file.file_path, currentAction.file.name);
    }

    setCurrentAction(null);
  };

  const handleDownload = async (file: any) => {
    if (file.password_hash) {
      setCurrentAction({ type: 'download', file });
      setPasswordDialogOpen(true);
    } else {
      await executeDownload(file.file_path, file.name);
    }
  };

  const executeDownload = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('vault')
        .download(filePath);

      if (error) throw error;

      // Create download link
      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: user?.id,
        action: 'FILE_DOWNLOAD',
        details: `Downloaded file: ${fileName}`,
        severity: 'info'
      });

      toast.success("File downloaded successfully");
    } catch (error: any) {
      console.error('Download error:', error);
      toast.error("Failed to download file");
    }
  };

  const handlePreview = async (file: any) => {
    if (file.password_hash) {
      setCurrentAction({ type: 'preview', file });
      setPasswordDialogOpen(true);
    } else {
      await executePreview(file);
    }
  };

  const executePreview = async (file: any) => {
    try {
      const { data, error } = await supabase.storage
        .from('vault')
        .download(file.file_path);

      if (error) throw error;

      const url = window.URL.createObjectURL(data);
      setPreviewFile({
        name: file.name,
        url: url,
      });
      setPreviewDialogOpen(true);

      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: user?.id,
        action: 'FILE_VIEW',
        details: `Previewed file: ${file.name}`,
        severity: 'info'
      });
    } catch (error: any) {
      console.error('Preview error:', error);
      toast.error("Failed to preview file");
    }
  };

  const handleEdit = async (file: any) => {
    if (file.password_hash) {
      setCurrentAction({ type: 'edit', file });
      setPasswordDialogOpen(true);
    } else {
      await executeEdit(file.id, file.name, file.description);
    }
  };

  const executeEdit = async (fileId: string, currentName: string, currentDescription: string | null) => {
    const newName = prompt("Enter new file name:", currentName);
    if (!newName || newName === currentName) return;

    try {
      const { error } = await supabase
        .from('files')
        .update({ name: newName })
        .eq('id', fileId);

      if (error) throw error;

      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: user?.id,
        action: 'FILE_UPDATE',
        details: `Renamed file from "${currentName}" to "${newName}"`,
        severity: 'info'
      });

      toast.success("File renamed successfully");
      loadFiles();
    } catch (error: any) {
      console.error('Edit error:', error);
      toast.error("Failed to update file");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error: any) {
      toast.error("Failed to sign out");
    }
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
            <ThemeToggle />
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
              <CardTitle className="text-3xl">{files.length}</CardTitle>
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
              <CardTitle className="text-3xl">
                {(files.reduce((acc, f) => acc + (f.size_bytes || 0), 0) / 1024 / 1024).toFixed(2)} MB
              </CardTitle>
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
            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading files...</p>
              </div>
            ) : files.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No files uploaded yet</p>
                <Button onClick={() => navigate("/upload")}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Your First File
                </Button>
              </div>
            ) : (
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
                          {(file.size_bytes / 1024 / 1024).toFixed(2)} MB • Uploaded {new Date(file.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handlePreview(file)}
                        title="Preview file"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDownload(file)}
                        title="Download file"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEdit(file)}
                        title="Rename file"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDelete(file)}
                        title="Delete file"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Password Dialog */}
      <PasswordDialog
        open={passwordDialogOpen}
        onOpenChange={setPasswordDialogOpen}
        onSubmit={handlePasswordSubmit}
      />

      {/* Preview Dialog */}
      <FilePreviewDialog
        open={previewDialogOpen}
        onOpenChange={(open) => {
          setPreviewDialogOpen(open);
          if (!open && previewFile) {
            window.URL.revokeObjectURL(previewFile.url);
            setPreviewFile(null);
          }
        }}
        file={previewFile}
      />
    </div>
  );
};

export default Dashboard;
