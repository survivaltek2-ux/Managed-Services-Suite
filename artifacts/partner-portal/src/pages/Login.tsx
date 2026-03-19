import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/hooks/use-auth";
import { Building2, ArrowRight } from "lucide-react";

function MicrosoftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="9" height="9" fill="#F25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
      <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
      <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
    </svg>
  );
}

export default function Login() {
  const { login, isLoggingIn } = useAuth();
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [ssoLoading, setSsoLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ssoToken = params.get("sso_token");
    const ssoError = params.get("sso_error");

    if (ssoToken) {
      setSsoLoading(true);
      localStorage.setItem("partner_token", ssoToken);
      window.history.replaceState({}, "", window.location.pathname);
      setLocation("/dashboard");
      return;
    }

    if (ssoError) {
      const messages: Record<string, string> = {
        access_denied: "Microsoft sign-in was cancelled.",
        token_failed: "Could not complete Microsoft sign-in. Please try again.",
        profile_failed: "Could not retrieve your Microsoft profile.",
        no_account: "No partner account found for your Microsoft email. Please register first.",
        server_error: "An error occurred during sign-in. Please try again.",
        no_email: "Could not retrieve your email from Microsoft.",
      };
      setError(messages[ssoError] || "Sign-in failed. Please try again.");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login({ email, password });
    } catch (err: any) {
      setError(err.message || "Failed to login. Check credentials.");
    }
  };

  const handleMicrosoftSSO = () => {
    setSsoLoading(true);
    window.location.href = "/api/auth/sso/microsoft?type=partner";
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

          <button
            type="button"
            onClick={handleMicrosoftSSO}
            disabled={ssoLoading || isLoggingIn}
            className="w-full flex items-center justify-center gap-3 h-12 px-4 mb-6 border border-border rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-semibold text-sm text-foreground disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
          >
            <MicrosoftIcon />
            {ssoLoading ? "Signing in..." : "Sign in with Microsoft"}
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 border-t border-border" />
            <span className="text-xs text-muted-foreground font-medium">or sign in with email</span>
            <div className="flex-1 border-t border-border" />
          </div>

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
            <Button type="submit" className="w-full h-12 text-base rounded-xl" disabled={isLoggingIn || ssoLoading}>
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
