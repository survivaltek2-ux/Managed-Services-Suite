import { useState, useEffect } from "react";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { getAuthHeaders } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatCurrency } from "@/lib/utils";
import { Search, Plus, TrendingUp, X, FileText, DollarSign, Clock } from "lucide-react";
import { format } from "date-fns";

interface MdfRequest {
  id: number;
  title: string;
  description: string;
  requestedAmount: string;
  approvedAmount: string | null;
  activityType: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
}

export default function MdfRequests() {
  const [requests, setRequests] = useState<MdfRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const loadRequests = () => {
    fetch("/api/partner/mdf", { headers: getAuthHeaders() })
      .then(r => r.ok ? r.json() : [])
      .then(data => setRequests(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadRequests(); }, []);

  const filtered = requests.filter(r =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.activityType.toLowerCase().includes(search.toLowerCase())
  );

  const totalRequested = requests.reduce((sum, r) => sum + parseFloat(r.requestedAmount || "0"), 0);
  const totalApproved = requests.filter(r => r.status === "approved").reduce((sum, r) => sum + parseFloat(r.approvedAmount || r.requestedAmount || "0"), 0);

  return (
    <PortalLayout>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">MDF Requests</h1>
          <p className="text-muted-foreground mt-1">Market Development Fund requests for co-marketing activities.</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="rounded-xl shadow-md gap-2">
          <Plus className="w-4 h-4" /> New MDF Request
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <SummaryCard title="Total Requested" value={formatCurrency(totalRequested)} icon={FileText} color="text-blue-500" bg="bg-blue-500/10" />
        <SummaryCard title="Total Approved" value={formatCurrency(totalApproved)} icon={DollarSign} color="text-emerald-500" bg="bg-emerald-500/10" />
        <SummaryCard title="Pending Review" value={requests.filter(r => ["submitted", "draft", "pending"].includes(r.status)).length.toString()} icon={Clock} color="text-amber-500" bg="bg-amber-500/10" />
      </div>

      <div className="bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        <div className="p-4 border-b border-border/50 flex items-center gap-4 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search MDF requests..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white dark:bg-slate-950 border-border/50 h-10 rounded-lg shadow-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-slate-50/80 dark:bg-slate-900/80 border-b border-border/50">
              <tr>
                <th className="px-6 py-4 font-semibold tracking-wider">Campaign</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Activity Type</th>
                <th className="px-6 py-4 font-semibold tracking-wider text-right">Requested</th>
                <th className="px-6 py-4 font-semibold tracking-wider text-right">Approved</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Status</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Date Range</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                <tr><td colSpan={6} className="text-center p-8 text-muted-foreground">Loading requests...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center p-12 text-muted-foreground">No MDF requests yet. Submit one to get co-marketing funds.</td></tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{r.title}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{r.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="capitalize bg-white dark:bg-slate-950 shadow-sm">{r.activityType.replace('_', ' ')}</Badge>
                    </td>
                    <td className="px-6 py-4 font-semibold text-right text-foreground">{formatCurrency(parseFloat(r.requestedAmount))}</td>
                    <td className="px-6 py-4 font-semibold text-right text-emerald-600 dark:text-emerald-400">
                      {r.approvedAmount ? formatCurrency(parseFloat(r.approvedAmount)) : "—"}
                    </td>
                    <td className="px-6 py-4"><MdfStatus status={r.status} /></td>
                    <td className="px-6 py-4 text-muted-foreground text-xs whitespace-nowrap">
                      {r.startDate && r.endDate
                        ? `${format(new Date(r.startDate), 'MMM d')} – ${format(new Date(r.endDate), 'MMM d, yyyy')}`
                        : format(new Date(r.createdAt), 'MMM d, yyyy')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showCreate && <CreateMdfModal onClose={() => setShowCreate(false)} onCreated={loadRequests} />}
    </PortalLayout>
  );
}

function SummaryCard({ title, value, icon: Icon, color, bg }: { title: string; value: string; icon: any; color: string; bg: string }) {
  return (
    <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm flex items-center gap-4">
      <div className={`p-3 rounded-xl ${bg}`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{title}</p>
      </div>
    </div>
  );
}

function MdfStatus({ status }: { status: string }) {
  const map: Record<string, { variant: any; label: string }> = {
    draft: { variant: "secondary", label: "Draft" },
    submitted: { variant: "warning", label: "Submitted" },
    pending: { variant: "warning", label: "Pending" },
    approved: { variant: "success", label: "Approved" },
    rejected: { variant: "destructive", label: "Rejected" },
    completed: { variant: "default", label: "Completed" },
    expired: { variant: "secondary", label: "Expired" },
  };
  const config = map[status] || { variant: "secondary", label: status };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

function CreateMdfModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({
    title: "", description: "", requestedAmount: "", activityType: "event",
    startDate: "", endDate: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/partner/mdf", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...form,
          requestedAmount: parseFloat(form.requestedAmount) || 0,
          startDate: form.startDate || null,
          endDate: form.endDate || null,
        }),
      });
      if (res.ok) {
        onCreated();
        onClose();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-lg rounded-3xl shadow-2xl border border-border flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-border flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50 rounded-t-3xl">
          <h2 className="text-xl font-display font-bold">New MDF Request</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          <form id="mdf-form" onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Campaign Title *</label>
              <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Amount Requested ($) *</label>
                <Input type="number" min="0" step="0.01" value={form.requestedAmount} onChange={e => setForm({ ...form, requestedAmount: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Activity Type</label>
                <select className="w-full h-10 px-3 rounded-lg border border-border bg-white dark:bg-slate-950 text-sm" value={form.activityType} onChange={e => setForm({ ...form, activityType: e.target.value })}>
                  <option value="event">Event / Trade Show</option>
                  <option value="digital_marketing">Digital Marketing</option>
                  <option value="webinar">Webinar</option>
                  <option value="content">Content Creation</option>
                  <option value="direct_mail">Direct Mail</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Start Date</label>
                <Input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">End Date</label>
                <Input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Description *</label>
              <textarea className="w-full min-h-[100px] px-3 py-2 rounded-lg border border-border bg-white dark:bg-slate-950 text-sm resize-y"
                value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required
                placeholder="Describe the marketing activity and expected outcomes..." />
            </div>
          </form>
        </div>
        <div className="p-6 border-t border-border bg-slate-50/50 dark:bg-slate-900/50 rounded-b-3xl flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl">Cancel</Button>
          <Button type="submit" form="mdf-form" disabled={submitting} className="rounded-xl px-8 shadow-md">
            {submitting ? "Submitting..." : "Submit Request"}
          </Button>
        </div>
      </div>
    </div>
  );
}
