import { useState } from "react";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { useAuth } from "@/hooks/use-auth";
import { Save, Building, Mail, User, Shield } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => setSaving(false), 1000);
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
                  <p className="text-sm font-bold">${Number(user.lifetimeRevenue).toLocaleString()}</p>
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
      </div>
    </PortalLayout>
  );
}
