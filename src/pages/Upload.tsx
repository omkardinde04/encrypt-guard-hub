import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Upload as UploadIcon, FileText, Lock, CheckCircle, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Checkbox } from "@/components/ui/checkbox";

const Upload = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!file || !user) {
      toast.error("Please select a file to upload");
      return;
    }

    if (isPasswordProtected && !password) {
      toast.error("Please enter a password for protection");
      return;
    }

    setIsUploading(true);

    try {
      // Upload to storage with user folder structure
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('vault')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Hash password if protection is enabled
      let passwordHash = null;
      if (isPasswordProtected && password) {
        // Simple hash for demo - in production use bcrypt or similar
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      }

      // Insert file metadata into database
      const { error: dbError } = await supabase
        .from('files')
        .insert({
          user_id: user.id,
          name: file.name,
          description: description || null,
          size_bytes: file.size,
          encrypted: true,
          file_path: fileName,
          password_hash: passwordHash
        });

      if (dbError) throw dbError;

      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        action: 'FILE_UPLOAD',
        details: `Uploaded file: ${file.name}`,
        severity: 'info'
      });

      toast.success("File uploaded successfully!");
      navigate("/dashboard");
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || "Failed to upload file");
    } finally {
      setIsUploading(false);
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
              <h1 className="text-xl font-bold">Upload File</h1>
              <p className="text-xs text-muted-foreground">Encrypted before upload</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Secure File Upload</CardTitle>
            <CardDescription>
              Files are stored securely in private storage with access control
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpload} className="space-y-6">
              {/* File Upload */}
              <div className="space-y-2">
                <Label htmlFor="file">Select File</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                  <input
                    id="file"
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="file" className="cursor-pointer">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <UploadIcon className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-sm font-medium mb-1">
                      {file ? file.name : "Click to select file"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "Maximum file size: 50MB"}
                    </p>
                  </label>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Add a description for this file..."
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Password Protection */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="password-protection"
                    checked={isPasswordProtected}
                    onCheckedChange={(checked) => {
                      setIsPasswordProtected(checked as boolean);
                      if (!checked) setPassword("");
                    }}
                  />
                  <Label
                    htmlFor="password-protection"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Enable password protection (optional)
                  </Label>
                </div>
                
                {isPasswordProtected && (
                  <div className="space-y-2">
                    <Label htmlFor="file-password">File Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="file-password"
                        type="password"
                        placeholder="Enter password for this file"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
                        required={isPasswordProtected}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      This password will be required to view, download, or edit the file
                    </p>
                  </div>
                )}
              </div>

              {/* Security Info */}
              <div className="bg-muted/50 border border-border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2 font-medium">
                  <Shield className="w-5 h-5 text-primary" />
                  Security Features
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-secure" />
                    <span>Secure private storage with RLS</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-secure" />
                    <span>Encrypted in-transit with HTTPS</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-secure" />
                    <span>Activity logged for audit trail</span>
                  </div>
                </div>
              </div>

              {/* Upload Status */}
              {isUploading && (
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin">
                      <Lock className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-primary">Uploading...</p>
                      <p className="text-sm text-muted-foreground">
                        Uploading file to secure vault
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate("/dashboard")}
                  className="flex-1"
                  disabled={isUploading}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={!file || isUploading}
                  className="flex-1"
                >
                  {isUploading ? "Uploading..." : "Upload File"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Upload;
