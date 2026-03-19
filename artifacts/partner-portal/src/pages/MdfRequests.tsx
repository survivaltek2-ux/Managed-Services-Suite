import { useState, useEffect } from "react";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { getAuthHeaders } from "@/hooks/use-auth";
import { formatCurrency } from "@/lib/utils";
import { Search, Plus, X, FileText, DollarSign, Clock } from "lucide-react";
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
  const pendingCount = requests.filter(r => ["submitted", "draft", "pending"].includes(r.status)).length;

  return (
    <PortalLayout>
      <div className="sf-page-header px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold text-foreground">MDF Requests</h1>
            <span className="text-xs text-muted-foreground">{requests.length} total</span>
          </div>
          <button onClick={() => setShowCreate(true)} className="sf-btn sf-btn-primary">
            <Plus className="w-3.5 h-3.5" /> New Request
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="sf-card p-4 flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Requested</p>
              <p className="text-2xl font-bold text-foreground mt-1">{formatCurrency(totalRequested)}</p>
            </div>
            <div className="w-8 h-8 rounded flex items-center justify-center bg-[#0176d3]/10">
              <FileText className="w-4 h-4 text-[#0176d3]" />
            </div>
          </div>
          <div className="sf-card p-4 flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Approved</p>
              <p className="text-2xl font-bold text-foreground mt-1">{formatCurrency(totalApproved)}</p>
            </div>
            <div className="w-8 h-8 rounded flex items-center justify-center bg-[#2e844a]/10">
              <DollarSign className="w-4 h-4 text-[#2e844a]" />
            </div>
          </div>
          <div className="sf-card p-4 flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Pending Review</p>
              <p className="text-2xl font-bold text-foreground mt-1">{pendingCount}</p>
            </div>
            <div className="w-8 h-8 rounded flex items-center justify-center bg-[#fe9339]/10">
              <Clock className="w-4 h-4 text-[#fe9339]" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input type="text" placeholder="Search MDF requests..." value={search} onChange={e => setSearch(e.target.value)} className="sf-input pl-8" />
          </div>
        </div>

        <div className="sf-card overflow-x-auto">
          <table className="w-full sf-table">
            <thead>
              <tr>
                <th>Campaign</th>
                <th>Activity Type</th>
                <th className="text-right">Requested</th>
                <th className="text-right">Approved</th>
                <th>Status</th>
                <th>Date Range</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">No MDF requests yet.</td></tr>
              ) : (
                filtered.map(r => (
                  <tr key={r.id}>
                    <td>
                      <div className="font-medium text-[#0176d3]">{r.title}</div>
                      <div className="text-[11px] text-muted-foreground line-clamp-1">{r.description}</div>
                    </td>
                    <td><span className="sf-badge sf-badge-default capitalize">{r.activityType.replace('_', ' ')}</span></td>
                    <td className="text-right font-semibold">{formatCurrency(parseFloat(r.requestedAmount))}</td>
                    <td className="text-right font-semibold text-[#2e844a]">{r.approvedAmount ? formatCurrency(parseFloat(r.approvedAmount)) : "—"}</td>
                    <td><MdfStatus status={r.status} /></td>
                    <td className="text-xs text-muted-foreground">
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

function MdfStatus({ status }: { status: string }) {
  const map: Record<string, string> = {
    draft: "sf-badge-default", submitted: "sf-badge-warning", pending: "sf-badge-warning",
    approved: "sf-badge-success", rejected: "sf-badge-error",
    completed: "sf-badge-info", expired: "sf-badge-default",
  };
  return <span className={`sf-badge ${map[status] || 'sf-badge-default'} capitalize`}>{status}</span>;
}

function CreateMdfModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({
    title: "", description: "", requestedAmount: "", activityType: "event", startDate: "", endDate: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/partner/mdf", {
        method: "POST", headers: getAuthHeaders(),
        body: JSON.stringify({
          ...form, requestedAmount: parseFloat(form.requestedAmount) || 0,
          startDate: form.startDate || null, endDate: form.endDate || null,
        }),
      });
      if (res.ok) { onCreated(); onClose(); }
    } finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-16 px-4" role="dialog" aria-modal="true" aria-labelledby="mdf-modal-title" onKeyDown={(e) => e.key === "Escape" && onClose()}>
      <div className="bg-white w-full max-w-lg rounded shadow-xl border border-[#d8dde6] flex flex-col max-h-[80vh]">
        <div className="px-4 py-3 border-b border-[#d8dde6] flex justify-between items-center bg-[#fafaf9]">
          <h2 id="mdf-modal-title" className="text-base font-bold">New MDF Request</h2>
          <button onClick={onClose} aria-label="Close" className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-4 overflow-y-auto flex-1">
          <form id="mdf-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Campaign Title *</label>
              <input className="sf-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Amount ($) *</label>
                <input className="sf-input" type="number" min="0" step="0.01" value={form.requestedAmount} onChange={e => setForm({ ...form, requestedAmount: e.target.value })} required />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Activity Type</label>
                <select className="sf-input" value={form.activityType} onChange={e => setForm({ ...form, activityType: e.target.value })}>
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
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Start Date</label>
                <input className="sf-input" type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">End Date</label>
                <input className="sf-input" type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Description *</label>
              <textarea className="sf-input min-h-[80px] py-2 resize-y" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required placeholder="Describe the activity and expected outcomes..." />
            </div>
          </form>
        </div>
        <div className="px-4 py-3 border-t border-[#d8dde6] bg-[#fafaf9] flex justify-end gap-2">
          <button type="button" onClick={onClose} className="sf-btn sf-btn-neutral">Cancel</button>
          <button type="submit" form="mdf-form" disabled={submitting} className="sf-btn sf-btn-primary">
            {submitting ? "Saving..." : "Submit Request"}
          </button>
        </div>
      </div>
    </div>
  );
}
