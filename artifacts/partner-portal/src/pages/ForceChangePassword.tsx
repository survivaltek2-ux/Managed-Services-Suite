import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Lock, ShieldAlert, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface ApiError {
  message?: string;
  error?: string;
}

export default function ForceChangePassword() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ newPassword: "", confirmPassword: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user && !user.mustChangePassword) {
      setLocation("/dashboard");
    }
  }, [user]);

  if (!user || !user.mustChangePassword) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    if (form.newPassword.length < 8) {
      toast({ title: "Password must be at least 8 characters", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("partner_token");
      const res = await fetch("/api/auth/set-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ newPassword: form.newPassword }),
      });

      if (res.ok) {
        await queryClient.invalidateQueries({ queryKey: ["/api/partner/auth/me"] });
        toast({ title: "Password updated successfully" });
        setLocation("/dashboard");
      } else {
        const data = await res.json().catch(() => ({}));
        toast({ title: (data as ApiError).message || "Failed to update password", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error updating password", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#032d60] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-amber-400/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <ShieldAlert className="w-7 h-7 text-amber-300" />
          </div>
          <h1 className="text-2xl font-bold text-white">Set a New Password</h1>
          <p className="text-white/70 text-sm mt-1">
            Your account requires a new password before you can continue.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="password"
                    className="sf-input pl-9"
                    placeholder="Minimum 8 characters"
                    value={form.newPassword}
                    onChange={e => setForm({ ...form, newPassword: e.target.value })}
                    required
                    autoFocus
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="password"
                    className="sf-input pl-9"
                    placeholder="Re-enter your new password"
                    value={form.confirmPassword}
                    onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="sf-btn sf-btn-primary w-full justify-center mt-2"
              >
                {saving ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                ) : (
                  "Set Password & Continue"
                )}
              </button>
            </form>
          </div>
          <div className="px-6 pb-4 border-t border-[#d8dde6] pt-3 bg-[#fafaf9]">
            <p className="text-xs text-muted-foreground text-center">
              Signed in as <span className="font-medium">{user.email}</span>.{" "}
              <button onClick={logout} className="text-[#0176d3] underline underline-offset-2">
                Sign out
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
