import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { useAuth, getAuthHeaders } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Save, Building, Mail, User, Shield, Lock, CreditCard, CheckCircle, Loader2, Unlink, ExternalLink, AlertCircle } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [location] = useLocation();
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  const [connectStatus, setConnectStatus] = useState<{ connected: boolean; payoutsEnabled: boolean; detailsSubmitted: boolean; accountId: string | null; accountType: string | null; accountInvalid: boolean; stripeConfigured: boolean } | null>(null);
  const [connectLoading, setConnectLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [connectStatusLoading, setConnectStatusLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);
  const [stripeNotConfigured, setStripeNotConfigured] = useState(false);
  const [oauthNotConfigured, setOauthNotConfigured] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);

  const headers = getAuthHeaders();

  useEffect(() => {
    fetchConnectStatus();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("stripe_connect_return") === "1") {
      toast({ title: "Stripe account connected!", description: "Your Stripe account has been linked for commission payouts." });
      fetchConnectStatus();
      window.history.replaceState({}, "", window.location.pathname);
    } else if (params.get("stripe_connect_refresh") === "1") {
      toast({ title: "Stripe onboarding incomplete", description: "Please connect your Stripe account to receive payouts.", variant: "destructive" });
      fetchConnectStatus();
      window.history.replaceState({}, "", window.location.pathname);
    } else if (params.get("stripe_connect_error")) {
      const errCode = params.get("stripe_connect_error") || "unknown_error";
      const errMsg = errCode === "access_denied"
        ? "You cancelled the Stripe account connection. Click 'Link Existing Account' to try again."
        : errCode === "state_expired"
        ? "The account linking session expired (10 minute limit). Please click 'Link Existing Account' to start again."
        : `There was a problem connecting your Stripe account (${errCode}). Please try again or contact support.`;
      setStripeError(errMsg);
      fetchConnectStatus();
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const fetchConnectStatus = async () => {
    setConnectStatusLoading(true);
    try {
      const res = await fetch("/api/partner/stripe-connect/status", { headers });
      if (res.ok) {
        const data = await res.json();
        setConnectStatus(data);
        if (data.stripeConfigured === false) {
          setStripeNotConfigured(true);
        } else if (data.stripeConfigured === true) {
          setStripeNotConfigured(false);
        }
      }
    } catch (err) {
      console.error("Failed to fetch Stripe Connect status", err);
    } finally {
      setConnectStatusLoading(false);
    }
  };

  const handleConnectStripe = async () => {
    setConnectLoading(true);
    setStripeNotConfigured(false);
    try {
      const res = await fetch("/api/partner/stripe-connect/onboard", {
        method: "POST",
        headers,
      });
      if (res.ok) {
        const data = await res.json();
        window.location.href = data.url;
      } else {
        const err = await res.json().catch(() => ({}));
        if (err.error === "stripe_not_configured") {
          setStripeNotConfigured(true);
        } else {
          toast({ title: err.message || "Failed to start Stripe onboarding", variant: "destructive" });
        }
      }
    } catch (err) {
      toast({ title: "Error connecting Stripe", variant: "destructive" });
    } finally {
      setConnectLoading(false);
    }
  };

  const handleOAuthStripe = async () => {
    setOauthLoading(true);
    setStripeNotConfigured(false);
    setOauthNotConfigured(false);
    setStripeError(null);
    try {
      const res = await fetch("/api/partner/stripe-connect/oauth/start", {
        method: "POST",
        headers,
      });
      if (res.ok) {
        const data = await res.json();
        window.location.href = data.url;
      } else {
        const err = await res.json().catch(() => ({}));
        if (err.error === "stripe_not_configured") {
          setStripeNotConfigured(true);
        } else if (err.error === "oauth_not_configured") {
          setOauthNotConfigured(true);
        } else {
          toast({ title: err.message || "Failed to start Stripe OAuth", variant: "destructive" });
        }
      }
    } catch (err) {
      toast({ title: "Error starting Stripe OAuth", variant: "destructive" });
    } finally {
      setOauthLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm("Are you sure you want to disconnect your Stripe account? Future payouts will be processed manually.")) return;
    setDisconnecting(true);
    try {
      const res = await fetch("/api/partner/stripe-connect/disconnect", {
        method: "POST",
        headers,
      });
      if (res.ok) {
        toast({ title: "Stripe account disconnected" });
        setConnectStatus({ connected: false, payoutsEnabled: false, detailsSubmitted: false, accountId: null, stripeConfigured: true, accountType: null, accountInvalid: false });
      } else {
        toast({ title: "Failed to disconnect", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error disconnecting", variant: "destructive" });
    } finally {
      setDisconnecting(false);
    }
  };

  if (!user) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => setSaving(false), 1000);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast({ title: "Password must be at least 8 characters", variant: "destructive" });
      return;
    }

    setChangingPassword(true);
    try {
      const res = await fetch("/api/partner/auth/change-password", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("partner_token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      if (res.ok) {
        toast({ title: "Password changed successfully" });
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setShowPasswordForm(false);
      } else {
        const data = await res.json();
        toast({ title: data.message || "Failed to change password", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error changing password", variant: "destructive" });
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <PortalLayout>
      <div className="sf-page-header px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold text-foreground">Company Profile</h1>
          </div>
          <span className="sf-badge sf-badge-info font-semibold uppercase text-[10px]">{user.tier} Partner</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-4">
        <form onSubmit={handleSave}>
          <div className="sf-card overflow-hidden">
            <div className="sf-card-header">
              <span className="flex items-center gap-2"><Building className="w-3.5 h-3.5" /> Business Information</span>
            </div>
            <div className="p-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Company Name</label>
                  <input className="sf-input bg-[#fafaf9] cursor-not-allowed" defaultValue={user.companyName} disabled />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Partner Tier</label>
                  <input className="sf-input bg-[#fafaf9] cursor-not-allowed font-semibold text-[#0176d3]" defaultValue={user.tier.toUpperCase()} disabled />
                </div>
              </div>
            </div>
          </div>

          <div className="sf-card overflow-hidden mt-4">
            <div className="sf-card-header">
              <span className="flex items-center gap-2"><User className="w-3.5 h-3.5" /> Contact Details</span>
            </div>
            <div className="p-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Primary Contact</label>
                  <input className="sf-input" defaultValue={user.contactName} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Email Address</label>
                  <input className="sf-input bg-[#fafaf9] cursor-not-allowed" defaultValue={user.email} disabled />
                </div>
              </div>
            </div>
          </div>

          <div className="sf-card overflow-hidden mt-4">
            <div className="sf-card-header">
              <span className="flex items-center gap-2"><Shield className="w-3.5 h-3.5" /> Account Status</span>
            </div>
            <div className="p-4">
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Status</p>
                  <span className={`sf-badge ${user.status === "approved" ? "sf-badge-success" : user.status === "pending" ? "sf-badge-warning" : "sf-badge-error"} capitalize`}>{user.status}</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">YTD Revenue</p>
                  <p className="text-sm font-bold">${Number(user.ytdRevenue).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Lifetime Revenue</p>
                  <p className="text-sm font-bold">${Number(user.totalRevenue || 0).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button type="submit" disabled={saving} className="sf-btn sf-btn-primary">
              <Save className="w-3.5 h-3.5" /> {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>

        {/* ─── Stripe Connect / Payout Settings ─────────────────────────────── */}
        {!user.isMainSiteAdmin && (
          <div className="sf-card overflow-hidden mt-4">
            <div className="sf-card-header">
              <span className="flex items-center gap-2"><CreditCard className="w-3.5 h-3.5" /> Payout Settings</span>
            </div>
            <div className="p-4">
              {connectStatusLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Checking connection status...
                </div>
              ) : stripeNotConfigured ? (
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-red-800">Stripe payouts are not enabled</p>
                      <p className="text-xs text-red-700 mt-1">
                        Stripe Connect has not been configured on this platform. Commission payouts are currently on hold until your account administrator enables Stripe.
                      </p>
                      <p className="text-xs text-red-700 mt-2">
                        Please contact your account administrator for assistance with enabling payouts.
                      </p>
                    </div>
                  </div>
                </div>
              ) : connectStatus?.connected ? (
                <div className="space-y-3">
                  {connectStatus.accountInvalid ? (
                    <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-red-800">Stripe account unreachable</p>
                        <p className="text-xs text-red-700 mt-0.5">
                          The stored Stripe account ({connectStatus.accountId}) could not be retrieved. It may have been deleted or become invalid. Contact your administrator to update or clear the account.
                        </p>
                      </div>
                    </div>
                  ) : connectStatus.payoutsEnabled ? (
                    <div className="flex items-start gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-emerald-800">Stripe account connected — payouts active</p>
                        <p className="text-xs text-emerald-700 mt-0.5">
                          Commission payouts will be sent directly to your bank account via Stripe.
                        </p>
                        {connectStatus.accountId && (
                          <p className="text-xs text-emerald-600 font-mono mt-1">{connectStatus.accountId}</p>
                        )}
                      </div>
                    </div>
                  ) : connectStatus.accountType === "standard" ? (
                    <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-amber-800">Stripe account linked — setup required</p>
                        <p className="text-xs text-amber-700 mt-0.5">
                          Your existing Stripe account is linked but payouts are not yet active. Log into your Stripe dashboard directly to complete any required setup steps.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-amber-800">Stripe account connected — onboarding incomplete</p>
                        <p className="text-xs text-amber-700 mt-0.5">
                          Your account is linked but Stripe requires more information before payouts can be sent. Click "Complete Setup" to finish.
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2">
                    {connectStatus.accountType === "standard" ? (
                      <a
                        href="https://dashboard.stripe.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="sf-btn sf-btn-outline text-xs"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Open Stripe Dashboard
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={handleConnectStripe}
                        disabled={connectLoading}
                        className="sf-btn sf-btn-outline text-xs"
                      >
                        {connectLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ExternalLink className="w-3.5 h-3.5" />}
                        {connectStatus.payoutsEnabled ? "Update Stripe Account" : "Complete Setup"}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleDisconnect}
                      disabled={disconnecting}
                      className="sf-btn sf-btn-outline text-xs text-red-600 hover:bg-red-50 border-red-200"
                    >
                      {disconnecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Unlink className="w-3.5 h-3.5" />}
                      Disconnect
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-amber-800">No payout account connected</p>
                      <p className="text-xs text-amber-700 mt-0.5">
                        Connect your Stripe account to receive commission payouts directly to your bank. Without a connected account, payouts are processed manually.
                      </p>
                    </div>
                  </div>
                  {stripeError && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-red-700">{stripeError}</p>
                    </div>
                  )}
                  {oauthNotConfigured && (
                    <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-700">
                        Linking an existing Stripe account via OAuth is not available on this platform. You can still set up a new payout account using the button below.
                      </p>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleConnectStripe}
                      disabled={connectLoading || oauthLoading}
                      className="sf-btn sf-btn-primary"
                    >
                      {connectLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CreditCard className="w-3.5 h-3.5" />}
                      {connectLoading ? "Redirecting to Stripe..." : "Set Up New Payout Account"}
                    </button>
                    {!oauthNotConfigured && (
                      <button
                        type="button"
                        onClick={handleOAuthStripe}
                        disabled={connectLoading || oauthLoading}
                        className="sf-btn sf-btn-outline"
                      >
                        {oauthLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ExternalLink className="w-3.5 h-3.5" />}
                        {oauthLoading ? "Redirecting..." : "Link Existing Stripe Account"}
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <strong>New account:</strong> Creates a Stripe Express sub-account linked to your email for payouts.{!oauthNotConfigured && <> <strong>Existing account:</strong> Links your current Stripe account directly via Stripe's OAuth flow.</>}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {!showPasswordForm && (
          <div className="mt-4 flex justify-center">
            <button onClick={() => setShowPasswordForm(true)} className="sf-btn sf-btn-outline">
              <Lock className="w-3.5 h-3.5" /> Change Password
            </button>
          </div>
        )}

        {showPasswordForm && (
          <form onSubmit={handleChangePassword} className="mt-4">
            <div className="sf-card overflow-hidden">
              <div className="sf-card-header">
                <span className="flex items-center gap-2"><Lock className="w-3.5 h-3.5" /> Change Password</span>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase block mb-2">Current Password</label>
                  <input
                    type="password"
                    className="sf-input"
                    placeholder="Enter current password"
                    value={passwordForm.currentPassword}
                    onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase block mb-2">New Password</label>
                  <input
                    type="password"
                    className="sf-input"
                    placeholder="Enter new password (min 8 characters)"
                    value={passwordForm.newPassword}
                    onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase block mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    className="sf-input"
                    placeholder="Confirm new password"
                    value={passwordForm.confirmPassword}
                    onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="p-4 border-t flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
                  }}
                  className="sf-btn sf-btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="sf-btn sf-btn-primary"
                >
                  {changingPassword ? "Updating..." : "Update Password"}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </PortalLayout>
  );
}
