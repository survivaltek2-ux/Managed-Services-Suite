import React, { useState, useMemo } from "react";
import { Plus, Trash2, Loader2, Search } from "lucide-react";
import { Button, Input, Textarea, Label, Card, CardHeader, CardTitle, CardContent, Badge } from "@/components/ui";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const LEAD_INTEREST_OPTIONS = [
  "Connectivity (Internet/MPLS)",
  "Voice & UCaaS",
  "Cloud & Hosting",
  "Security",
  "Contact Center",
  "SD-WAN & Networking",
  "Data Center",
  "Mobility & IoT",
  "Collaboration",
  "Managed IT",
  "Expense Management",
  "CPaaS & Messaging",
  "Other",
];

interface Partner {
  id: number;
  companyName: string;
  contactName: string;
  email: string;
}

function AdminLeads({
  partners,
  headers,
  refresh,
  toast,
}: {
  partners: Partner[];
  headers: () => any;
  refresh: () => void;
  toast: any;
}) {
  const [createOpen, setCreateOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    partnerId: "",
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    interest: "",
    source: "admin",
  });
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(
    () =>
      partners.filter((p) => {
        const q = search.toLowerCase();
        return (
          !q ||
          [p.companyName, p.contactName, p.email].some((f: string) =>
            f?.toLowerCase().includes(q)
          )
        );
      }),
    [partners, search]
  );

  const handleCreate = async () => {
    if (!form.partnerId || !form.companyName || !form.contactName || !form.interest) {
      toast({
        title: "Missing Fields",
        description: "Partner, Company Name, Contact Name, and Interest are required.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/partner/leads", {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({
          partnerId: parseInt(form.partnerId),
          companyName: form.companyName.trim(),
          contactName: form.contactName.trim(),
          email: form.email?.trim() || null,
          phone: form.phone?.trim() || null,
          interest: form.interest.trim(),
          source: form.source,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to create lead");
      }

      toast({
        title: "Lead Created",
        description: "Lead has been assigned to the partner.",
      });

      setForm({
        partnerId: "",
        companyName: "",
        contactName: "",
        email: "",
        phone: "",
        interest: "",
        source: "admin",
      });
      setCreateOpen(false);
      refresh();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to create lead",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search partners..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-0 border-0 border-b"
          />
        </div>
        <Button onClick={() => setCreateOpen(true)} variant="default" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Transfer Lead to Partner
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transfer Leads to Partners</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">No partners found.</p>
            ) : (
              <div className="space-y-2">
                {filtered.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                    <div>
                      <p className="font-medium">{p.companyName}</p>
                      <p className="text-sm text-muted-foreground">{p.contactName}</p>
                      <p className="text-xs text-muted-foreground">{p.email}</p>
                    </div>
                    <Button
                      onClick={() => {
                        setForm({ ...form, partnerId: p.id.toString() });
                        setCreateOpen(true);
                      }}
                      variant="outline"
                      size="sm"
                    >
                      Add Lead
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create Lead Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Transfer Lead to Partner</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="partner">Partner *</Label>
              <select
                id="partner"
                value={form.partnerId}
                onChange={(e) => setForm({ ...form, partnerId: e.target.value })}
                className="w-full px-3 py-2 border rounded-md text-sm"
              >
                <option value="">Select a partner...</option>
                {partners.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.companyName} ({p.contactName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                placeholder="Prospect company name"
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="contactName">Contact Name *</Label>
              <Input
                id="contactName"
                placeholder="Contact person name"
                value={form.contactName}
                onChange={(e) => setForm({ ...form, contactName: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="contact@company.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="interest">Interest / Solution *</Label>
              <select
                id="interest"
                value={form.interest}
                onChange={(e) => setForm({ ...form, interest: e.target.value })}
                className="w-full px-3 py-2 border rounded-md text-sm"
              >
                <option value="">Select an interest...</option>
                {LEAD_INTEREST_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={saving}
              variant="default"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Transferring...
                </>
              ) : (
                "Transfer Lead"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminLeads;
