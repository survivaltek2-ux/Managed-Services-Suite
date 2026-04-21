import { useState } from "react";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { useAuth, getAuthHeaders } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ShieldCheck, Plus, KeyRound, Copy, Check, Loader2, UserX, ClockIcon, Mail, AlertTriangle } from "lucide-react";

interface AdminUser {
  id: number;
  name: string;
  email: string;
  mustChangePassword: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

interface TempPasswordModal {
  open: boolean;
  name: string;
  tempPassword: string;
  copied: boolean;
  emailSent: boolean | null;
}

interface ApiError {
  message?: string;
  error?: string;
}

interface AddAdminModal {
  open: boolean;
  name: string;
  email: string;
  submitting: boolean;
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "Never";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function AdminUsers() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const headers = getAuthHeaders();

  const [resetingId, setResetingId] = useState<number | null>(null);
  const [tempModal, setTempModal] = useState<TempPasswordModal>({ open: false, name: "", tempPassword: "", copied: false, emailSent: null });
  const [addModal, setAddModal] = useState<AddAdminModal>({ open: false, name: "", email: "", submitting: false });

  const { data: admins = [], isLoading } = useQuery<AdminUser[]>({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users", { headers });
      if (!res.ok) throw new Error("Failed to load admin users");
      return res.json();
    },
    enabled: !!user?.isAdmin,
  });

  const handleResetPassword = async (admin: AdminUser) => {
    setResetingId(admin.id);
    try {
      const res = await fetch(`/api/admin/users/${admin.id}/reset-password`, {
        method: "POST",
        headers,
      });
      if (res.ok) {
        const data = await res.json();
        queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
        setTempModal({ open: true, name: admin.name, tempPassword: data.tempPassword, copied: false, emailSent: data.emailSent ?? null });
      } else {
        const err = await res.json().catch(() => ({}));
        toast({ title: (err as ApiError).message || "Failed to reset password", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error resetting password", variant: "destructive" });
    } finally {
      setResetingId(null);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddModal(m => ({ ...m, submitting: true }));
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers,
        body: JSON.stringify({ name: addModal.name, email: addModal.email }),
      });
      if (res.ok) {
        const data = await res.json();
        queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
        setAddModal({ open: false, name: "", email: "", submitting: false });
        setTempModal({ open: true, name: data.user.name, tempPassword: data.tempPassword, copied: false, emailSent: data.emailSent ?? null });
      } else {
        const err = await res.json().catch(() => ({}));
        toast({ title: (err as ApiError).message || "Failed to create admin", variant: "destructive" });
        setAddModal(m => ({ ...m, submitting: false }));
      }
    } catch {
      toast({ title: "Error creating admin", variant: "destructive" });
      setAddModal(m => ({ ...m, submitting: false }));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setTempModal(m => ({ ...m, copied: true }));
      setTimeout(() => setTempModal(m => ({ ...m, copied: false })), 2000);
    });
  };

  if (!user?.isAdmin) return null;

  return (
    <PortalLayout>
      <div className="sf-page-header px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#0176d3]" />
            <h1 className="text-lg font-bold text-foreground">Admin Users</h1>
          </div>
          <button
            onClick={() => setAddModal({ open: true, name: "", email: "", submitting: false })}
            className="sf-btn sf-btn-primary"
          >
            <Plus className="w-3.5 h-3.5" /> Add Admin
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-4">
        <div className="sf-card overflow-hidden">
          <div className="sf-card-header">
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5" /> All Admin Accounts
            </span>
            <span className="text-xs text-muted-foreground font-normal">
              {admins.length} account{admins.length !== 1 ? "s" : ""}
            </span>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground text-sm">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading admin accounts...
            </div>
          ) : admins.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground text-sm gap-2">
              <UserX className="w-8 h-8 text-muted-foreground/40" />
              No admin accounts found.
            </div>
          ) : (
            <div className="divide-y divide-[#d8dde6]">
              {admins.map(admin => (
                <div key={admin.id} className="flex items-center gap-4 px-4 py-3">
                  <div className="w-8 h-8 rounded-full bg-[#032d60]/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-[#032d60]">
                      {admin.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{admin.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{admin.email}</p>
                  </div>
                  <div className="hidden sm:flex flex-col items-end gap-0.5 min-w-[180px]">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <ClockIcon className="w-3 h-3" />
                      {formatDate(admin.lastLoginAt)}
                    </div>
                    <span className={`sf-badge text-[10px] ${admin.mustChangePassword ? "sf-badge-warning" : "sf-badge-success"}`}>
                      {admin.mustChangePassword ? "Needs Reset" : "Active"}
                    </span>
                  </div>
                  <button
                    onClick={() => handleResetPassword(admin)}
                    disabled={resetingId === admin.id}
                    className="sf-btn sf-btn-outline text-xs shrink-0"
                    title="Reset password"
                  >
                    {resetingId === admin.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <KeyRound className="w-3.5 h-3.5" />
                    )}
                    Reset Password
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground mt-3 text-center">
          Resetting a password generates a secure temporary password and requires the admin to set a new one on their next login.
        </p>
      </div>

      {/* Temp Password Modal */}
      {tempModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-[#d8dde6] bg-amber-50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                  <KeyRound className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">Temporary Password Generated</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">For {tempModal.name}</p>
                </div>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-sm text-muted-foreground">
                Share this temporary password securely. The admin will be required to set a new password on their next login.
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-[#fafaf9] border border-[#d8dde6] rounded px-3 py-2 font-mono text-sm font-semibold text-foreground select-all">
                  {tempModal.tempPassword}
                </div>
                <button
                  onClick={() => copyToClipboard(tempModal.tempPassword)}
                  className="sf-btn sf-btn-outline shrink-0"
                  title="Copy to clipboard"
                >
                  {tempModal.copied ? (
                    <><Check className="w-3.5 h-3.5 text-emerald-600" /> Copied</>
                  ) : (
                    <><Copy className="w-3.5 h-3.5" /> Copy</>
                  )}
                </button>
              </div>
              {tempModal.emailSent === true && (
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded p-3 text-xs text-emerald-800">
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  Credentials emailed to {tempModal.name}. They will receive login instructions shortly.
                </div>
              )}
              {tempModal.emailSent === false && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded p-3 text-xs text-red-800">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>Email delivery failed — please share this password manually. Check the SMTP settings if the problem persists.</span>
                </div>
              )}
              <div className="bg-amber-50 border border-amber-200 rounded p-3 text-xs text-amber-800">
                This password will not be shown again. Copy it before closing this window.
              </div>
            </div>
            <div className="px-5 pb-5 flex justify-end">
              <button
                onClick={() => setTempModal({ open: false, name: "", tempPassword: "", copied: false, emailSent: null })}
                className="sf-btn sf-btn-primary"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Admin Modal */}
      {addModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-[#d8dde6]">
              <h2 className="font-semibold text-foreground">Add Admin Account</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                A temporary password will be generated for the new admin.
              </p>
            </div>
            <form onSubmit={handleAddAdmin}>
              <div className="p-5 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="sf-input"
                    placeholder="e.g. Jane Smith"
                    value={addModal.name}
                    onChange={e => setAddModal(m => ({ ...m, name: e.target.value }))}
                    required
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="sf-input"
                    placeholder="admin@example.com"
                    value={addModal.email}
                    onChange={e => setAddModal(m => ({ ...m, email: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="px-5 pb-5 flex gap-2 justify-end border-t border-[#d8dde6] pt-4">
                <button
                  type="button"
                  onClick={() => setAddModal({ open: false, name: "", email: "", submitting: false })}
                  className="sf-btn sf-btn-outline"
                  disabled={addModal.submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addModal.submitting}
                  className="sf-btn sf-btn-primary"
                >
                  {addModal.submitting ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Creating...</>
                  ) : (
                    <><Plus className="w-3.5 h-3.5" /> Create Admin</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
