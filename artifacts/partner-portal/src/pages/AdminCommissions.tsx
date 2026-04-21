import React, { useState, useEffect, useMemo } from "react";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { useAuth, getAuthHeaders } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import {
  Search, Plus, Edit2, Download, Loader2, Save, Check, X, AlertTriangle, DollarSign, Send, ExternalLink, Zap
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function AdminCommissions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [commissions, setCommissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState<any | null>(null);
  const [notesText, setNotesText] = useState("");
  const [form, setForm] = useState({ partnerId: "", dealId: "", type: "deal", description: "", amount: "", rate: "10", notes: "" });
  const [exporting, setExporting] = useState(false);
  const [payingOutId, setPayingOutId] = useState<number | null>(null);

  const headers = getAuthHeaders();

  const load = () => {
    setLoading(true);
    fetch("/api/admin/partner/commissions", { headers })
      .then(r => r.ok ? r.json() : [])
      .then(data => setCommissions(Array.isArray(data) ? data : []))
      .catch(() => toast({ title: "Failed to load commissions", variant: "destructive" }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => commissions.filter((c: any) => {
    const matchSearch = !search || [c.description, c.partnerCompany, c.partnerContact].some(f => f?.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    const matchType = typeFilter === "all" || c.type === typeFilter;
    return matchSearch && matchStatus && matchType;
  }), [commissions, search, statusFilter, typeFilter]);

  const totals = useMemo(() => ({
    pending: commissions.filter((c: any) => c.status === "pending").reduce((s: number, c: any) => s + parseFloat(c.amount || 0), 0),
    approved: commissions.filter((c: any) => c.status === "approved").reduce((s: number, c: any) => s + parseFloat(c.amount || 0), 0),
    paid: commissions.filter((c: any) => c.status === "paid").reduce((s: number, c: any) => s + parseFloat(c.amount || 0), 0),
    disputed: commissions.filter((c: any) => c.status === "disputed").reduce((s: number, c: any) => s + parseFloat(c.amount || 0), 0),
    total: commissions.reduce((s: number, c: any) => s + parseFloat(c.amount || 0), 0),
  }), [commissions]);

  const fmt = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });

  const updateStatus = async (id: number, status: string, notes?: string) => {
    try {
      const body: any = { status };
      if (notes !== undefined) body.notes = notes;
      const res = await fetch(`/api/admin/partner/commissions/${id}`, {
        method: "PUT", headers, body: JSON.stringify(body),
      });
      if (res.ok) { toast({ title: `Commission ${status}` }); load(); }
      else { const err = await res.json().catch(() => ({})); toast({ title: err.message || "Failed to update commission", variant: "destructive" }); }
    } catch { toast({ title: "Error updating commission", variant: "destructive" }); }
  };

  const saveNotes = async () => {
    if (!notesOpen) return;
    try {
      const res = await fetch(`/api/admin/partner/commissions/${notesOpen.id}`, {
        method: "PUT", headers, body: JSON.stringify({ notes: notesText }),
      });
      if (res.ok) { toast({ title: "Notes saved" }); setNotesOpen(null); load(); }
      else toast({ title: "Failed to save notes", variant: "destructive" });
    } catch { toast({ title: "Error saving notes", variant: "destructive" }); }
  };

  const createCommission = async () => {
    try {
      const res = await fetch("/api/admin/partner/commissions", {
        method: "POST", headers,
        body: JSON.stringify({ ...form, partnerId: parseInt(form.partnerId), dealId: form.dealId ? parseInt(form.dealId) : null }),
      });
      if (res.ok) { toast({ title: "Commission created" }); setCreateOpen(false); setForm({ partnerId: "", dealId: "", type: "deal", description: "", amount: "", rate: "10", notes: "" }); load(); }
      else toast({ title: "Failed to create commission", variant: "destructive" });
    } catch { toast({ title: "Error creating commission", variant: "destructive" }); }
  };

  const payoutCommission = async (commission: any) => {
    const id = commission.id;
    setPayingOutId(id);
    try {
      const res = await fetch(`/api/admin/commissions/${id}/payout`, {
        method: "POST", headers,
        body: JSON.stringify({ method: "auto" }),
      });
      if (res.ok) {
        const data = await res.json();
        const msg = data.stripeTransferId
          ? `Stripe transfer initiated (${data.stripeTransferId.slice(0, 16)}…)`
          : "Manual payout recorded";
        toast({ title: msg });
        if (data.warning) {
          toast({ title: data.warning, variant: "warning", description: "Follow up with the partner to complete their Stripe onboarding." });
        }
        load();
      } else {
        const err = await res.json().catch(() => ({}));
        toast({ title: err.message || "Payout failed", variant: "destructive" });
      }
    } catch { toast({ title: "Error processing payout", variant: "destructive" }); }
    finally { setPayingOutId(null); }
  };

  const exportCSV = async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/admin/partner/commissions/export", { headers });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = `commissions-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
        URL.revokeObjectURL(url);
        toast({ title: "Commissions exported" });
      } else toast({ title: "Export failed", variant: "destructive" });
    } catch { toast({ title: "Export failed", variant: "destructive" }); } finally { setExporting(false); }
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = { pending: "bg-yellow-100 text-yellow-800", approved: "bg-blue-100 text-blue-800", paid: "bg-emerald-100 text-emerald-800", rejected: "bg-red-100 text-red-800", disputed: "bg-orange-100 text-orange-800" };
    return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-800"}`}>{status}</span>;
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
            <h1 className="text-2xl font-bold">Partner Commissions</h1>
            <p className="text-sm text-muted-foreground mt-1">View and manage all partner commission records</p>
          </div>

          <div className="grid grid-cols-5 gap-3">
            {[
              { label: "Pending", value: fmt(totals.pending), color: "text-yellow-600" },
              { label: "Approved", value: fmt(totals.approved), color: "text-blue-600" },
              { label: "Disputed", value: fmt(totals.disputed), color: "text-orange-600" },
              { label: "Paid", value: fmt(totals.paid), color: "text-emerald-600" },
              { label: "Total", value: fmt(totals.total), color: "text-primary" },
            ].map(m => (
              <Card key={m.label}>
                <CardContent className="pt-4 pb-3 px-4">
                  <p className="text-xs text-muted-foreground">{m.label}</p>
                  <p className={`text-xl font-bold ${m.color}`}>{m.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Partner Commissions</CardTitle>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={exportCSV} disabled={exporting}>
                    {exporting ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Download className="w-4 h-4 mr-1" />} Export CSV
                  </Button>
                  <Button size="sm" onClick={() => setCreateOpen(true)}><Plus className="w-4 h-4 mr-1" /> New Commission</Button>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-3 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search by partner or description..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <select className="h-9 px-3 rounded-md border text-sm bg-background" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="paid">Paid</option>
                  <option value="disputed">Disputed</option>
                  <option value="rejected">Rejected</option>
                </select>
                <select className="h-9 px-3 rounded-md border text-sm bg-background" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                  <option value="all">All Types</option>
                  <option value="deal">Deal</option>
                  <option value="recurring">Recurring</option>
                  <option value="spiff">Spiff</option>
                  <option value="bonus">Bonus</option>
                </select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="px-5 py-3 text-left">Partner</th>
                        <th className="px-5 py-3 text-left">Description</th>
                        <th className="px-5 py-3 text-left">Type</th>
                        <th className="px-5 py-3 text-right">Rate</th>
                        <th className="px-5 py-3 text-right">Amount</th>
                        <th className="px-5 py-3 text-left">Status</th>
                        <th className="px-5 py-3 text-left">Date</th>
                        <th className="px-5 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((c: any) => (
                        <tr key={c.id} className={`border-b last:border-0 hover:bg-muted/50 ${c.status === "disputed" ? "bg-orange-50/50" : ""}`}>
                          <td className="px-5 py-3">
                            <div className="font-medium flex items-center gap-1.5">
                              {c.partnerCompany || "—"}
                              {c.stripeConnectAccountId && c.stripePayoutsEnabled === true && (
                                <span title="Stripe payouts enabled — ready to receive transfers" className="inline-flex items-center gap-0.5 px-1 py-0.5 text-[10px] font-medium rounded bg-green-100 text-green-700">
                                  <Check className="w-2.5 h-2.5" /> Stripe
                                </span>
                              )}
                              {c.stripeConnectAccountId && c.stripePayoutsEnabled === false && (
                                <span title="Stripe account not yet verified — payouts disabled" className="inline-flex items-center gap-0.5 px-1 py-0.5 text-[10px] font-medium rounded bg-amber-100 text-amber-700">
                                  <AlertTriangle className="w-2.5 h-2.5" /> Stripe
                                </span>
                              )}
                              {c.stripeConnectAccountId && c.stripePayoutsEnabled === null && (
                                <span title="Stripe Connect enabled" className="inline-flex items-center gap-0.5 px-1 py-0.5 text-[10px] font-medium rounded bg-violet-100 text-violet-700">
                                  <Zap className="w-2.5 h-2.5" /> Stripe
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">{c.partnerContact}</div>
                          </td>
                          <td className="px-5 py-3 max-w-[220px]">
                            <div className="truncate">{c.description}</div>
                            {c.notes && (
                              <div className="text-xs text-orange-600 truncate mt-0.5" title={c.notes}>
                                <AlertTriangle className="inline w-3 h-3 mr-0.5" />{c.notes}
                              </div>
                            )}
                          </td>
                          <td className="px-5 py-3 capitalize">{c.type}</td>
                          <td className="px-5 py-3 text-right">{c.rate ? `${c.rate}%` : "—"}</td>
                          <td className="px-5 py-3 text-right font-medium">{fmt(parseFloat(c.amount || 0))}</td>
                          <td className="px-5 py-3">{statusBadge(c.status)}</td>
                          <td className="px-5 py-3 text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()}</td>
                          <td className="px-5 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" title="Add notes" onClick={() => { setNotesOpen(c); setNotesText(c.notes || ""); }}>
                                <Edit2 className="w-3.5 h-3.5" />
                              </Button>
                              {c.status === "pending" && (
                                <>
                                  <Button variant="ghost" size="icon" className="h-7 w-7 text-emerald-600" title="Approve" onClick={() => updateStatus(c.id, "approved")}><Check className="w-4 h-4" /></Button>
                                  <Button variant="ghost" size="icon" className="h-7 w-7 text-red-600" title="Reject" onClick={() => updateStatus(c.id, "rejected")}><X className="w-4 h-4" /></Button>
                                </>
                              )}
                              {c.status === "approved" && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`h-7 px-2 text-xs border ${c.stripeConnectAccountId ? "text-violet-700 bg-violet-50 hover:bg-violet-100 border-violet-200" : "text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200"}`}
                                    title={c.stripeConnectAccountId ? "Pay via Stripe Transfer" : "Record Manual Payout"}
                                    onClick={() => payoutCommission(c)}
                                    disabled={payingOutId === c.id}
                                  >
                                    {payingOutId === c.id ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Send className="w-3 h-3 mr-1" />}
                                    {c.stripeConnectAccountId ? "Pay via Stripe" : "Pay Out"}
                                  </Button>
                                </>
                              )}
                          {c.status === "paid" && c.stripeTransferId && (
                                <span className="text-xs text-muted-foreground font-mono flex items-center gap-1" title={c.stripeTransferId}>
                                  <ExternalLink className="w-3 h-3" />
                                  {c.stripeTransferId.slice(0, 12)}…
                                </span>
                              )}
                          {c.status === "paid" && c.payoutMethod && (
                                <span className="text-xs text-muted-foreground capitalize">{c.payoutMethod}</span>
                              )}
                              {c.status === "disputed" && (
                                <>
                                  <Button variant="ghost" size="icon" className="h-7 w-7 text-emerald-600" title="Resolve — Approve" onClick={() => updateStatus(c.id, "approved", "Dispute resolved — commission approved")}><Check className="w-4 h-4" /></Button>
                                  <Button variant="ghost" size="icon" className="h-7 w-7 text-red-600" title="Resolve — Reject" onClick={() => updateStatus(c.id, "rejected", "Dispute resolved — commission rejected")}><X className="w-4 h-4" /></Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filtered.length === 0 && <div className="p-8 text-center text-muted-foreground">No commissions found.</div>}
                </div>
              )}
            </CardContent>
          </Card>

          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Commission</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Partner ID</Label><Input type="number" value={form.partnerId} onChange={e => setForm(p => ({ ...p, partnerId: e.target.value }))} placeholder="Enter partner ID" /></div>
                <div><Label>Deal ID (optional)</Label><Input type="number" value={form.dealId} onChange={e => setForm(p => ({ ...p, dealId: e.target.value }))} placeholder="Associated deal ID" /></div>
                <div><Label>Type</Label>
                  <select className="w-full h-9 px-3 rounded-md border text-sm bg-background mt-1" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                    <option value="deal">Deal</option><option value="recurring">Recurring</option><option value="spiff">Spiff</option><option value="bonus">Bonus</option>
                  </select>
                </div>
                <div><Label>Description</Label><Input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Commission description" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Amount ($)</Label><Input type="number" step="0.01" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} placeholder="0.00" /></div>
                  <div><Label>Rate (%)</Label><Input type="number" step="0.01" value={form.rate} onChange={e => setForm(p => ({ ...p, rate: e.target.value }))} placeholder="10" /></div>
                </div>
                <div><Label>Notes (optional)</Label><Input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Internal notes..." /></div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                <Button onClick={createCommission} disabled={!form.partnerId || !form.description || !form.amount}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={!!notesOpen} onOpenChange={() => setNotesOpen(null)}>
            <DialogContent>
              <DialogHeader><DialogTitle>Commission Notes</DialogTitle></DialogHeader>
              {notesOpen && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{notesOpen.description} — {fmt(parseFloat(notesOpen.amount))}</p>
                  <Textarea value={notesText} onChange={e => setNotesText(e.target.value)} placeholder="Add internal notes..." rows={4} />
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setNotesOpen(null)}>Cancel</Button>
                <Button onClick={saveNotes}><Save className="w-4 h-4 mr-1" /> Save Notes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </PortalLayout>
  );
}
