import { useState, useEffect } from "react";
import { KeyRound, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { Card, CardContent, Input, Button, Label } from "@/components/ui";
import { Layout } from "@/components/layout/Layout";

const API_BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

function getApiUrl(path: string) {
  return `${API_BASE}/api${path}`;
}

export default function ResetPassword() {
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
      const res = await fetch(getApiUrl("/auth/reset-password"), {
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
    <Layout>
      <div className="min-h-screen flex items-center justify-center pt-24 pb-20 px-4 bg-gray-50">
        <div className="w-full max-w-md">
          <Card className="shadow-xl border-0 rounded-3xl overflow-hidden">
            <CardContent className="p-8">
              <div className="flex justify-center mb-6">
                <div className="bg-primary/10 text-primary p-3 rounded-2xl">
                  <KeyRound className="w-8 h-8" />
                </div>
              </div>
              <h1 className="text-2xl font-display font-bold text-center text-foreground mb-2">Set New Password</h1>
              <p className="text-center text-muted-foreground mb-6">Enter a new password for your client account.</p>

              {success ? (
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <CheckCircle2 className="w-12 h-12 text-green-500" />
                  </div>
                  <p className="text-foreground font-semibold">Password reset successfully!</p>
                  <p className="text-muted-foreground text-sm">You can now sign in with your new password.</p>
                  <Button
                    className="w-full h-12 text-base mt-4"
                    onClick={() => window.location.href = `${API_BASE}/portal`}
                  >
                    Go to Sign In <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <>
                  {error && (
                    <div className="flex items-start gap-2.5 bg-red-50 text-red-700 text-sm p-3.5 rounded-xl mb-4 border border-red-200 font-medium">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}
                  {token && (
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="space-y-2">
                        <Label>New Password</Label>
                        <Input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          minLength={8}
                          placeholder="••••••••"
                        />
                        <p className="text-xs text-muted-foreground">Must be at least 8 characters</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Confirm New Password</Label>
                        <Input
                          type="password"
                          value={confirm}
                          onChange={(e) => setConfirm(e.target.value)}
                          required
                          placeholder="••••••••"
                        />
                      </div>
                      <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
                        {loading ? "Resetting..." : "Reset Password"} <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </form>
                  )}
                  <div className="text-center mt-5">
                    <a href={`${API_BASE}/portal`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      Back to Sign In
                    </a>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
