import { Button } from "@/components/ui/button";
import { Shield, Lock, FileKey, Users, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Lock,
      title: "End-to-End Encryption",
      description: "All files encrypted with AES-256 before upload"
    },
    {
      icon: Shield,
      title: "Role-Based Access",
      description: "Granular permissions with admin oversight"
    },
    {
      icon: FileKey,
      title: "Secure File Vault",
      description: "Military-grade storage with audit trails"
    },
    {
      icon: Users,
      title: "User Authentication",
      description: "JWT-based auth with password hashing"
    },
    {
      icon: Activity,
      title: "Activity Logging",
      description: "Complete audit trail of all operations"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 pb-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Shield className="w-4 h-4" />
            Enterprise-Grade Security
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent leading-tight">
            Secure File Vault
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A comprehensive encrypted file management system with authentication, 
            role-based access control, and complete audit trails.
          </p>
          
          <div className="flex gap-4 justify-center flex-wrap">
            <Button 
              size="lg" 
              onClick={() => navigate("/auth")}
              className="bg-primary hover:bg-primary/90"
            >
              Get Started
              <Shield className="ml-2 w-4 h-4" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate("/dashboard")}
            >
              View Dashboard
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-all hover:border-primary/50"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Security Mechanisms */}
      <section className="container mx-auto px-4 pb-20">
        <div className="max-w-4xl mx-auto bg-card border border-border rounded-xl p-8">
          <h2 className="text-3xl font-bold mb-6 text-center">Security Mechanisms Implemented</h2>
          <ul className="space-y-3">
            {[
              "JWT Authentication & Authorization",
              "Password Hashing with bcrypt",
              "File Encryption (AES-256)",
              "Role-Based Access Control (RBAC)",
              "Input Validation & Sanitization (Zod)",
              "Activity Logging & Auditing",
              "Secure Headers & Rate Limiting"
            ].map((mechanism, i) => (
              <li key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-secure/20 flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-secure" />
                </div>
                <span className="text-foreground">{mechanism}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
};

export default Index;
