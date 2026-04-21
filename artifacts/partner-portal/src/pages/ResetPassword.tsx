import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { KeyRound, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";

export default function ResetPassword() {
  const [, setLocation] = useLocation();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    if (t) {
      setToken(t);
    } else {
      setError("No reset token found. Please request a new reset link.");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/partner/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const d = await res.json();
      if (res.ok) {
        setSuccess(true);
      } else {
        setError(d.message || "Failed to reset password. The link may have expired.");
      }
    } catch {
      setError("Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div className="flex-1 flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-900">
        <div className="w-full max-w-md bg-card border border-border shadow-xl rounded-3xl p-8">
          <div className="flex justify-center mb-8">
            <div className="bg-primary/10 text-primary p-3 rounded-2xl">
              <KeyRound className="w-8 h-8" />
            </div>
          </div>
          <h2 className="text-2xl font-display font-bold text-center text-foreground mb-2">Set New Password</h2>
          <p className="text-center text-muted-foreground mb-6">Enter a new password for your partner account.</p>

          {success ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
              </div>
              <p className="text-foreground font-semibold">Password reset successfully!</p>
              <p className="text-muted-foreground text-sm">You can now sign in with your new password.</p>
              <Button className="w-full h-12 text-base rounded-xl mt-4" onClick={() => setLocation("/login")}>
                Go to Sign In <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          ) : (
            <>
              {error && (
                <div className="flex items-start gap-2.5 bg-destructive/10 text-destructive text-sm p-3.5 rounded-xl mb-4 border border-destructive/20 font-medium">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span className="flex-1">{error}</span>
                </div>
              )}
              {!token && !error ? null : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground ml-1">New Password</label>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      placeholder="••••••••"
                      className="bg-slate-50 dark:bg-slate-950"
                      disabled={!token}
                    />
                    <p className="text-xs text-muted-foreground ml-1">Must be at least 8 characters</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground ml-1">Confirm New Password</label>
                    <Input
                      type="password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="bg-slate-50 dark:bg-slate-950"
                      disabled={!token}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-12 text-base rounded-xl"
                    disabled={loading || !token}
                  >
                    {loading ? "Resetting..." : "Reset Password"} <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </form>
              )}
              <button
                type="button"
                onClick={() => setLocation("/login")}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors mt-5 text-center block"
              >
                Back to Sign In
              </button>
            </>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
