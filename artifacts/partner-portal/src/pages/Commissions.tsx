import { useState, useEffect } from "react";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { getAuthHeaders } from "@/hooks/use-auth";
import { formatCurrency } from "@/lib/utils";
import { DollarSign, TrendingUp, Clock, CheckCircle, Search, AlertTriangle, Copy, Check } from "lucide-react";
import { format } from "date-fns";

interface Commission {
  id: number;
  dealId: number | null;
  type: string;
  amount: string;
  rate: string | null;
  status: string;
  description: string | null;
  notes: string | null;
  paidAt: string | null;
  createdAt: string;
  stripeTransferId: string | null;
}

interface CommissionSummary {
  totalEarned: number;
  pending: number;
  paid: number;
  approved: number;
  monthlyEarnings: Record<string, number>;
  totalTransactions: number;
}

export default function Commissions() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [summary, setSummary] = useState<CommissionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [disputeOpen, setDisputeOpen] = useState<Commission | null>(null);
  const [disputeReason, setDisputeReason] = useState("");
  const [disputing, setDisputing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const load = () => {
    Promise.all([
      fetch("/api/partner/commissions", { headers: getAuthHeaders() }).then(r => r.ok ? r.json() : []),
      fetch("/api/partner/commissions/summary", { headers: getAuthHeaders() }).then(r => r.ok ? r.json() : null),
    ]).then(([c, s]) => {
      setCommissions(Array.isArray(c) ? c : []);
      setSummary(s);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const copyTransferId = (commissionId: number, transferId: string) => {
    navigator.clipboard.writeText(transferId).then(() => {
      setCopiedId(commissionId);
      setTimeout(() => setCopiedId(null), 2000);
    }).catch(() => showToast("Could not copy to clipboard"));
  };

  const filtered = commissions.filter(c => {
    const matchSearch = !search || (c.description || "").toLowerCase().includes(search.toLowerCase()) || c.type.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    const matchType = typeFilter === "all" || c.type === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  const handleDispute = async () => {
    if (!disputeOpen) return;
    setDisputing(true);
    try {
      const res = await fetch(`/api/partner/commissions/${disputeOpen.id}/dispute`, {
        method: "POST",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ reason: disputeReason }),
      });
      if (res.ok) {
        showToast("Commission disputed — our team will review it");
        setDisputeOpen(null);
        setDisputeReason("");
        load();
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.message || "Failed to dispute commission");
      }
    } catch { showToast("Dispute failed"); } finally { setDisputing(false); }
  };

  const monthlyChart = summary?.monthlyEarnings
    ? Object.entries(summary.monthlyEarnings).sort(([a], [b]) => a.localeCompare(b)).slice(-6)
    : [];
  const maxEarning = Math.max(...monthlyChart.map(([, v]) => v), 1);

  return (
    <PortalLayout>
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-[#032d60] text-white px-4 py-2.5 rounded shadow-lg text-sm font-medium">
          {toast}
        </div>
      )}

      <div className="sf-page-header px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold text-foreground">Commissions</h1>
            <span className="text-xs text-muted-foreground">{summary?.totalTransactions || 0} total</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-4 space-y-5">
        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard label="Total Earned" value={formatCurrency(summary.totalEarned)} icon={DollarSign} color="#2e844a" />
            <KpiCard label="Paid Out" value={formatCurrency(summary.paid)} icon={CheckCircle} color="#0176d3" />
            <KpiCard label="Approved" value={formatCurrency(summary.approved)} icon={TrendingUp} color="#9050e9" />
            <KpiCard label="Pending" value={formatCurrency(summary.pending)} icon={Clock} color="#fe9339" />
          </div>
        )}

        {monthlyChart.length > 0 && (
          <div className="sf-card p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4">Monthly Earnings</h2>
            <div className="flex items-end gap-2 h-28">
              {monthlyChart.map(([month, value]) => (
                <div key={month} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-medium text-[#0176d3]">{value > 0 ? formatCurrency(value) : ""}</span>
                  <div
                    className="w-full bg-[#0176d3] rounded-t transition-all"
                    style={{ height: `${(value / maxEarning) * 72}px`, minHeight: value > 0 ? "4px" : "0" }}
                  />
                  <span className="text-[10px] text-muted-foreground">{month.slice(5)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="sf-card overflow-x-auto">
          <div className="p-4 border-b flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input type="text" placeholder="Search commissions..." value={search} onChange={e => setSearch(e.target.value)} className="sf-input pl-8 text-sm" />
            </div>
            <select className="sf-input w-auto text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="paid">Paid</option>
              <option value="disputed">Disputed</option>
              <option value="rejected">Rejected</option>
            </select>
            <select className="sf-input w-auto text-sm" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              <option value="all">All Types</option>
              <option value="deal">Deal</option>
              <option value="recurring">Recurring</option>
              <option value="spiff">Spiff</option>
              <option value="bonus">Bonus</option>
            </select>
          </div>
          <table className="w-full sf-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Type</th>
                <th>Rate</th>
                <th className="text-right">Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-muted-foreground">No commissions found.</td></tr>
              ) : (
                filtered.map(c => (
                  <tr key={c.id}>
                    <td className="font-medium max-w-[260px]">
                      <div className="truncate">{c.description || "Commission payment"}</div>
                      {c.notes && <div className="text-xs text-muted-foreground truncate">{c.notes}</div>}
                    </td>
                    <td><span className="sf-badge sf-badge-default capitalize">{c.type.replace('_', ' ')}</span></td>
                    <td className="text-sm text-muted-foreground">{c.rate ? `${c.rate}%` : "—"}</td>
                    <td className="text-right font-semibold text-[#2e844a]">{formatCurrency(parseFloat(c.amount))}</td>
                    <td>
                      <div className="flex flex-col gap-1">
                        <CommissionStatus status={c.status} />
                        {c.status === "paid" && c.stripeTransferId && (
                          <div className="flex items-center gap-1 flex-wrap">
                            <span className="sf-badge bg-[#635bff1a] text-[#635bff] border border-[#635bff33] text-[10px] font-semibold tracking-wide">Stripe</span>
                            <button
                              type="button"
                              className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono hover:text-foreground transition-colors group"
                              title={`Copy transfer ID: ${c.stripeTransferId}`}
                              onClick={() => copyTransferId(c.id, c.stripeTransferId!)}
                            >
                              <span>{c.stripeTransferId.slice(0, 14)}…</span>
                              {copiedId === c.id
                                ? <Check className="w-2.5 h-2.5 text-[#2e844a]" />
                                : <Copy className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                              }
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="text-xs text-muted-foreground whitespace-nowrap">{format(new Date(c.createdAt), 'MMM d, yyyy')}</td>
                    <td className="text-right">
                      {["pending", "approved"].includes(c.status) && (
                        <button
                          className="text-xs text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1 ml-auto"
                          onClick={() => { setDisputeOpen(c); setDisputeReason(""); }}
                          title="Dispute this commission"
                        >
                          <AlertTriangle className="w-3 h-3" /> Dispute
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {disputeOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b">
              <h2 className="text-base font-semibold">Dispute Commission</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {formatCurrency(parseFloat(disputeOpen.amount))} — {disputeOpen.description}
              </p>
            </div>
            <div className="px-6 py-4">
              <label className="block text-xs font-medium text-muted-foreground mb-1">Reason for dispute (optional)</label>
              <textarea
                className="sf-input resize-none w-full"
                rows={3}
                placeholder="Please explain why you are disputing this commission..."
                value={disputeReason}
                onChange={e => setDisputeReason(e.target.value)}
              />
            </div>
            <div className="px-6 py-3 border-t flex justify-end gap-2">
              <button className="sf-btn sf-btn-secondary text-sm" onClick={() => setDisputeOpen(null)}>Cancel</button>
              <button className="sf-btn sf-btn-danger text-sm" onClick={handleDispute} disabled={disputing}>
                {disputing ? "Submitting..." : "Submit Dispute"}
              </button>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}

function KpiCard({ label, value, icon: Icon, color }: { label: string; value: string; icon: any; color: string }) {
  return (
    <div className="sf-card p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
        </div>
        <div className="w-8 h-8 rounded flex items-center justify-center" style={{ backgroundColor: `${color}10` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
      </div>
    </div>
  );
}

function CommissionStatus({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "sf-badge-warning",
    approved: "sf-badge-info",
    paid: "sf-badge-success",
    rejected: "sf-badge-error",
    disputed: "bg-orange-100 text-orange-700",
  };
  return <span className={`sf-badge ${map[status] || 'sf-badge-default'} capitalize`}>{status}</span>;
}
