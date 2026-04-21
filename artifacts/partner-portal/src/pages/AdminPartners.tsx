import React, { useState, useEffect, useMemo } from "react";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { useAuth, getAuthHeaders } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import {
  Search, Plus, Edit2, Trash2, Loader2, Save, UserCheck, Ban, RefreshCw, Lock, Building2, Mail, CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const TIER_COLORS: Record<string, string> = {
  registered: "bg-gray-100 text-gray-700",
  silver: "bg-slate-200 text-slate-700",
  gold: "bg-yellow-100 text-yellow-700",
  platinum: "bg-purple-100 text-purple-700",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  suspended: "bg-orange-100 text-orange-700",
};

const EMPTY_PARTNER_FORM = {
  companyName: "", contactName: "", email: "", password: "", phone: "",
  website: "", address: "", city: "", state: "", zip: "", country: "US",
  businessType: "", yearsInBusiness: "", employeeCount: "", annualRevenue: "",
  tier: "registered", status: "approved",
};

type PartnerFormData = typeof EMPTY_PARTNER_FORM;

interface PartnerFormProps {
  isCreate: boolean;
  form: PartnerFormData;
  setForm: React.Dispatch<React.SetStateAction<PartnerFormData>>;
}

function PartnerForm({ isCreate, form, setForm }: PartnerFormProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
      <div className="sm:col-span-2 grid grid-cols-2 gap-3">
        <div className="space-y-1"><Label className="text-xs">Company Name *</Label><Input value={form.companyName} onChange={e => setForm(p => ({ ...p, companyName: e.target.value }))} placeholder="Acme Corp" /></div>
        <div className="space-y-1"><Label className="text-xs">Contact Name *</Label><Input value={form.contactName} onChange={e => setForm(p => ({ ...p, contactName: e.target.value }))} placeholder="Jane Doe" /></div>
      </div>
      <div className="space-y-1"><Label className="text-xs">Email *</Label><Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="jane@acme.com" /></div>
      <div className="space-y-1"><Label className="text-xs">Phone</Label><Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+1 555 000 0000" /></div>
      {isCreate && <div className="sm:col-span-2 space-y-1"><Label className="text-xs">Password *</Label><Input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="Min 8 characters" /></div>}
      <div className="space-y-1"><Label className="text-xs">Website</Label><Input value={form.website} onChange={e => setForm(p => ({ ...p, website: e.target.value }))} placeholder="https://acme.com" /></div>
      <div className="space-y-1"><Label className="text-xs">Business Type</Label><Input value={form.businessType} onChange={e => setForm(p => ({ ...p, businessType: e.target.value }))} placeholder="MSP, VAR, Reseller…" /></div>
      <div className="space-y-1"><Label className="text-xs">Address</Label><Input value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} placeholder="123 Main St" /></div>
      <div className="space-y-1"><Label className="text-xs">City</Label><Input value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} /></div>
      <div className="space-y-1"><Label className="text-xs">State</Label><Input value={form.state} onChange={e => setForm(p => ({ ...p, state: e.target.value }))} placeholder="CA" /></div>
      <div className="space-y-1"><Label className="text-xs">ZIP</Label><Input value={form.zip} onChange={e => setForm(p => ({ ...p, zip: e.target.value }))} /></div>
      <div className="space-y-1"><Label className="text-xs">Years in Business</Label><Input value={form.yearsInBusiness} onChange={e => setForm(p => ({ ...p, yearsInBusiness: e.target.value }))} placeholder="5" /></div>
      <div className="space-y-1"><Label className="text-xs">Employee Count</Label><Input value={form.employeeCount} onChange={e => setForm(p => ({ ...p, employeeCount: e.target.value }))} placeholder="10-50" /></div>
      <div className="space-y-1">
        <Label className="text-xs">Tier</Label>
        <select className="w-full border rounded-md px-3 py-2 text-sm" value={form.tier} onChange={e => setForm(p => ({ ...p, tier: e.target.value }))}>
          {["registered", "silver", "gold", "platinum"].map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
        </select>
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Status</Label>
        <select className="w-full border rounded-md px-3 py-2 text-sm" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
          {["pending", "approved", "rejected", "suspended"].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>
    </div>
  );
}

export default function AdminPartners() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterTier, setFilterTier] = useState("all");
  const [filterStripe, setFilterStripe] = useState("all");
  const [sendingReminder, setSendingReminder] = useState<number | null>(null);
  const [sendingBulkReminder, setSendingBulkReminder] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editPartner, setEditPartner] = useState<any | null>(null);
  const [deletePartner, setDeletePartner] = useState<any | null>(null);
  const [pwPartner, setPwPartner] = useState<any | null>(null);
  const [form, setForm] = useState({ ...EMPTY_PARTNER_FORM });
  const [newPw, setNewPw] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const headers = getAuthHeaders();

  const load = () => {
    setLoading(true);
    fetch("/api/admin/partners", { headers })
      .then(r => r.ok ? r.json() : [])
      .then(data => setPartners(Array.isArray(data) ? data : []))
      .catch(() => toast({ title: "Failed to load partners", variant: "destructive" }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => partners.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q || [p.companyName, p.contactName, p.email, p.city, p.state].some((f: string) => f?.toLowerCase().includes(q));
    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    const matchTier = filterTier === "all" || p.tier === filterTier;
    const matchStripe = filterStripe === "all" || (filterStripe === "missing" && !p.stripeConnectAccountId) || (filterStripe === "connected" && !!p.stripeConnectAccountId);
    return matchSearch && matchStatus && matchTier && matchStripe;
  }), [partners, search, filterStatus, filterTier, filterStripe]);

  const stats = useMemo(() => ({
    total: partners.length,
    approved: partners.filter(p => p.status === "approved").length,
    pending: partners.filter(p => p.status === "pending").length,
    suspended: partners.filter(p => p.status === "suspended").length,
    noStripe: partners.filter(p => !p.stripeConnectAccountId).length,
  }), [partners]);

  const handleSendReminder = async (p: any) => {
    setSendingReminder(p.id);
    try {
      const res = await fetch(`/api/admin/partners/${p.id}/send-stripe-reminder`, { method: "POST", headers });
      const d = await res.json();
      if (res.ok) {
        toast({ title: `Reminder sent to ${p.email}` });
        if (d.lastStripeReminderSentAt) {
          setPartners(prev => prev.map(partner =>
            partner.id === p.id ? { ...partner, lastStripeReminderSentAt: d.lastStripeReminderSentAt } : partner
          ));
        }
      } else {
        toast({ title: d.message || "Failed to send reminder", variant: "destructive" });
      }
    } catch { toast({ title: "Error sending reminder", variant: "destructive" }); }
    finally { setSendingReminder(null); }
  };

  const handleSendBulkReminder = async () => {
    setSendingBulkReminder(true);
    try {
      const res = await fetch("/api/admin/partners/send-stripe-reminder-bulk", { method: "POST", headers });
      const d = await res.json();
      if (res.ok) {
        const parts: string[] = [`${d.sent} reminder${d.sent !== 1 ? "s" : ""} sent`];
        if (d.skippedCooldown > 0) parts.push(`${d.skippedCooldown} skipped (sent recently)`);
        toast({ title: parts.join(" · ") });
        load();
      } else {
        toast({ title: d.message || "Failed to send bulk reminders", variant: "destructive" });
      }
    } catch { toast({ title: "Error sending bulk reminders", variant: "destructive" }); }
    finally { setSendingBulkReminder(false); }
  };

  const reminderCooldownHours = 24;
  const isReminderCoolingDown = (p: any): boolean => {
    if (!p.lastStripeReminderSentAt) return false;
    const sentAt = new Date(p.lastStripeReminderSentAt).getTime();
    return Date.now() - sentAt < reminderCooldownHours * 60 * 60 * 1000;
  };
  const formatReminderAge = (ts: string | null | undefined): string => {
    if (!ts) return "";
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const openEdit = (p: any) => { setForm({ ...EMPTY_PARTNER_FORM, ...p, password: "" }); setEditPartner(p); };
  const openCreate = () => { setForm({ ...EMPTY_PARTNER_FORM }); setCreateOpen(true); };

  const handleCreate = async () => {
    if (!form.companyName || !form.contactName || !form.email || !form.password) {
      toast({ title: "Required fields missing", variant: "destructive" }); return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/partners", { method: "POST", headers, body: JSON.stringify(form) });
      const d = await res.json();
      if (res.ok) { toast({ title: "Partner created" }); setCreateOpen(false); load(); }
      else toast({ title: d.message || "Failed to create", variant: "destructive" });
    } catch { toast({ title: "Error", variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const handleUpdate = async () => {
    if (!editPartner) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/partners/${editPartner.id}`, { method: "PUT", headers, body: JSON.stringify(form) });
      const d = await res.json();
      if (res.ok) { toast({ title: "Partner updated" }); setEditPartner(null); load(); }
      else toast({ title: d.message || "Failed to update", variant: "destructive" });
    } catch { toast({ title: "Error", variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deletePartner) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/partners/${deletePartner.id}`, { method: "DELETE", headers });
      if (res.ok) { toast({ title: "Partner deleted" }); setDeletePartner(null); load(); }
      else toast({ title: "Failed to delete", variant: "destructive" });
    } catch { toast({ title: "Error", variant: "destructive" }); }
    finally { setDeleting(false); }
  };

  const handleResetPw = async () => {
    if (!pwPartner || newPw.length < 8) { toast({ title: "Password must be at least 8 characters", variant: "destructive" }); return; }
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/partners/${pwPartner.id}/reset-password`, { method: "POST", headers, body: JSON.stringify({ password: newPw }) });
      if (res.ok) { toast({ title: "Password reset successfully" }); setPwPartner(null); setNewPw(""); }
      else toast({ title: "Failed to reset password", variant: "destructive" });
    } catch { toast({ title: "Error", variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const quickStatus = async (id: number, status: string) => {
    try {
      await fetch(`/api/admin/partners/${id}`, { method: "PUT", headers, body: JSON.stringify({ status }) });
      load();
    } catch { toast({ title: "Error", variant: "destructive" }); }
  };


  if (!user || !user.isAdmin) {
    return (
      <PortalLayout>
        <div className="px-6 py-12 text-center">
          <p className="text-muted-foreground">Access denied. Admin privileges required.</p>
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout>
      <div className="px-6 py-4">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="mb-2">
            <h1 className="text-2xl font-bold">Partner Management</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage partner accounts, approvals, and settings</p>
          </div>

          {/* Stat Cards */}
          {(() => {
            interface StatCard {
              label: string;
              value: number;
              icon: React.ReactNode;
              onClick?: () => void;
              highlight?: boolean;
            }
            const cards: StatCard[] = [
              { label: "Total Partners", value: stats.total, icon: <Building2 className="w-4 h-4 text-primary" /> },
              { label: "Approved", value: stats.approved, icon: <UserCheck className="w-4 h-4 text-green-600" /> },
              { label: "Pending", value: stats.pending, icon: <Loader2 className="w-4 h-4 text-yellow-600" /> },
              { label: "Suspended", value: stats.suspended, icon: <Ban className="w-4 h-4 text-orange-600" /> },
              { label: "No Stripe", value: stats.noStripe, icon: <CreditCard className="w-4 h-4 text-red-500" />, onClick: () => setFilterStripe(filterStripe === "missing" ? "all" : "missing"), highlight: stats.noStripe > 0 },
            ];
            return (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {cards.map(s => (
                  <Card key={s.label} className={s.onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""} onClick={s.onClick}>
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${s.highlight ? "bg-red-50" : "bg-muted"}`}>{s.icon}</div>
                      <div><div className={`text-xl font-bold ${s.highlight ? "text-red-600" : ""}`}>{s.value}</div><div className="text-xs text-muted-foreground">{s.label}</div></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            );
          })()}

          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="flex gap-2 flex-1 flex-wrap">
                  <div className="relative flex-1 min-w-[180px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Search partners…" className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
                  </div>
                  <select className="border rounded-md px-3 py-2 text-sm" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                    <option value="all">All Status</option>
                    {["pending", "approved", "rejected", "suspended"].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                  <select className="border rounded-md px-3 py-2 text-sm" value={filterTier} onChange={e => setFilterTier(e.target.value)}>
                    <option value="all">All Tiers</option>
                    {["registered", "silver", "gold", "platinum"].map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                  <select className="border rounded-md px-3 py-2 text-sm" value={filterStripe} onChange={e => setFilterStripe(e.target.value)}>
                    <option value="all">All Stripe</option>
                    <option value="missing">No Stripe</option>
                    <option value="connected">Stripe Connected</option>
                  </select>
                </div>
                <div className="flex gap-2 shrink-0">
                  {filterStripe === "missing" && (
                    <Button
                      variant="outline"
                      onClick={handleSendBulkReminder}
                      disabled={sendingBulkReminder || filtered.filter(p => !p.stripeConnectAccountId).length === 0}
                      className="text-blue-600 border-blue-300 hover:bg-blue-50"
                    >
                      {sendingBulkReminder ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Mail className="w-4 h-4 mr-2" />}
                      Send Reminders to All
                    </Button>
                  )}
                  <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" />New Partner</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b">
                      <tr>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Company</th>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Contact</th>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Location</th>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tier</th>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Deals</th>
                        <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filtered.map(p => (
                        <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-medium flex items-center gap-2">
                              {p.companyName}
                              {!p.stripeConnectAccountId && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-red-50 text-red-600 border border-red-200">
                                  <CreditCard className="w-3 h-3" />No Stripe
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">{p.email}</div>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            <div>{p.contactName}</div>
                            {p.phone && <div className="text-xs text-muted-foreground">{p.phone}</div>}
                          </td>
                          <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground text-xs">
                            {[p.city, p.state, p.country].filter(Boolean).join(", ") || "—"}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${TIER_COLORS[p.tier] || ""}`}>
                              {p.tier?.charAt(0).toUpperCase() + p.tier?.slice(1)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[p.status] || ""}`}>
                              {p.status?.charAt(0).toUpperCase() + p.status?.slice(1)}
                            </span>
                          </td>
                          <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">{p.totalDeals || 0}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              {p.status === "pending" && (
                                <button title="Approve" onClick={() => quickStatus(p.id, "approved")} className="p-1.5 hover:bg-green-100 rounded text-green-600"><UserCheck className="w-4 h-4" /></button>
                              )}
                              {p.status === "approved" && (
                                <button title="Suspend" onClick={() => quickStatus(p.id, "suspended")} className="p-1.5 hover:bg-orange-100 rounded text-orange-500"><Ban className="w-4 h-4" /></button>
                              )}
                              {p.status === "suspended" && (
                                <button title="Reactivate" onClick={() => quickStatus(p.id, "approved")} className="p-1.5 hover:bg-green-100 rounded text-green-600"><RefreshCw className="w-4 h-4" /></button>
                              )}
                              {!p.stripeConnectAccountId && (
                                <span className="inline-flex items-center gap-1">
                                  <button
                                    title={isReminderCoolingDown(p)
                                      ? `Reminder sent ${formatReminderAge(p.lastStripeReminderSentAt)} — wait ${reminderCooldownHours}h between reminders`
                                      : p.lastStripeReminderSentAt
                                        ? `Send again (last sent ${formatReminderAge(p.lastStripeReminderSentAt)})`
                                        : "Send Stripe Reminder"}
                                    onClick={() => handleSendReminder(p)}
                                    disabled={sendingReminder === p.id || isReminderCoolingDown(p)}
                                    className="p-1.5 hover:bg-blue-100 rounded text-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {sendingReminder === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                                  </button>
                                  {p.lastStripeReminderSentAt && (
                                    <span className="text-xs text-muted-foreground whitespace-nowrap">{formatReminderAge(p.lastStripeReminderSentAt)}</span>
                                  )}
                                </span>
                              )}
                              <button title="Edit" onClick={() => openEdit(p)} className="p-1.5 hover:bg-muted rounded text-muted-foreground"><Edit2 className="w-4 h-4" /></button>
                              <button title="Reset Password" onClick={() => { setPwPartner(p); setNewPw(""); }} className="p-1.5 hover:bg-muted rounded text-muted-foreground"><Lock className="w-4 h-4" /></button>
                              <button title="Delete" onClick={() => setDeletePartner(p)} className="p-1.5 hover:bg-red-100 rounded text-red-500"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filtered.length === 0 && (
                        <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">No partners found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle>Create New Partner</DialogTitle></DialogHeader>
              <PartnerForm isCreate={true} form={form} setForm={setForm} />
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                <Button onClick={handleCreate} disabled={saving}>{saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}Create Partner</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={!!editPartner} onOpenChange={v => !v && setEditPartner(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle>Edit Partner — {editPartner?.companyName}</DialogTitle></DialogHeader>
              <PartnerForm isCreate={false} form={form} setForm={setForm} />
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditPartner(null)}>Cancel</Button>
                <Button onClick={handleUpdate} disabled={saving}>{saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={!!pwPartner} onOpenChange={v => !v && setPwPartner(null)}>
            <DialogContent className="max-w-sm">
              <DialogHeader><DialogTitle>Reset Password — {pwPartner?.companyName}</DialogTitle></DialogHeader>
              <div className="space-y-3 py-2">
                <p className="text-sm text-muted-foreground">Set a new password for this partner's login.</p>
                <div className="space-y-1">
                  <Label className="text-xs">New Password</Label>
                  <Input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="Min 8 characters" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setPwPartner(null)}>Cancel</Button>
                <Button onClick={handleResetPw} disabled={saving || newPw.length < 8}>{saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Lock className="w-4 h-4 mr-2" />}Reset Password</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={!!deletePartner} onOpenChange={v => !v && setDeletePartner(null)}>
            <DialogContent className="max-w-sm">
              <DialogHeader><DialogTitle>Delete Partner</DialogTitle></DialogHeader>
              <p className="text-sm text-muted-foreground py-2">Are you sure you want to permanently delete <strong>{deletePartner?.companyName}</strong>? This cannot be undone.</p>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeletePartner(null)}>Cancel</Button>
                <Button variant="destructive" onClick={handleDelete} disabled={deleting}>{deleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}Delete</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </PortalLayout>
  );
}
