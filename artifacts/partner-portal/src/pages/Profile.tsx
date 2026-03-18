import { useState } from "react";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Save } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    // Mock save delay
    setTimeout(() => setSaving(false), 1000);
  };

  return (
    <PortalLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground">Company Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your partner account details.</p>
      </div>

      <div className="max-w-3xl bg-card border border-border/50 rounded-3xl shadow-sm overflow-hidden">
        <form onSubmit={handleSave}>
          <div className="p-8 space-y-8">
            <div>
              <h3 className="text-lg font-bold text-foreground mb-4 font-display border-b border-border/50 pb-2">Business Information</h3>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Company Name</label>
                  <Input defaultValue={user.companyName} disabled className="bg-slate-50 dark:bg-slate-900 opacity-70" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Partner Tier</label>
                  <Input defaultValue={user.tier.toUpperCase()} disabled className="bg-slate-50 dark:bg-slate-900 opacity-70 font-bold text-primary" />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-foreground mb-4 font-display border-b border-border/50 pb-2">Contact Details</h3>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Primary Contact</label>
                  <Input defaultValue={user.contactName} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Email Address</label>
                  <Input defaultValue={user.email} disabled className="bg-slate-50 dark:bg-slate-900 opacity-70" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-6 border-t border-border/50 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end">
            <Button type="submit" disabled={saving} className="rounded-xl px-8 shadow-md">
              <Save className="w-4 h-4 mr-2" /> {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </PortalLayout>
  );
}
