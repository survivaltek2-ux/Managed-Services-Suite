import { useState } from "react";
import { Link } from "wouter";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/hooks/use-auth";
import { Building2, ArrowRight } from "lucide-react";

export default function Login() {
  const { login, isLoggingIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login({ email, password });
    } catch (err: any) {
      setError(err.message || "Failed to login. Check credentials.");
    }
  };

  return (
    <PublicLayout>
      <div className="flex-1 flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-900">
        <div className="w-full max-w-md bg-card border border-border shadow-xl rounded-3xl p-8">
          <div className="flex justify-center mb-8">
            <div className="bg-primary/10 text-primary p-3 rounded-2xl">
              <Building2 className="w-8 h-8" />
            </div>
          </div>
          <h2 className="text-2xl font-display font-bold text-center text-foreground mb-2">Partner Login</h2>
          <p className="text-center text-muted-foreground mb-8">Welcome back to the portal.</p>
          
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-xl mb-6 border border-destructive/20 text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground ml-1">Work Email</label>
              <Input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                placeholder="you@company.com"
                className="bg-slate-50 dark:bg-slate-950"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-semibold text-foreground">Password</label>
                <a href="#" className="text-xs text-primary hover:underline font-medium">Forgot password?</a>
              </div>
              <Input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                placeholder="••••••••"
                className="bg-slate-50 dark:bg-slate-950"
              />
            </div>
            <Button type="submit" className="w-full h-12 text-base rounded-xl" disabled={isLoggingIn}>
              {isLoggingIn ? "Signing in..." : "Sign In"} <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Not a partner yet? <Link href="/register" className="text-primary font-semibold hover:underline">Apply here</Link>
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}
