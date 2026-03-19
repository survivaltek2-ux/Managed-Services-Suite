import { useState, useEffect } from "react";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { getAuthHeaders } from "@/hooks/use-auth";
import { formatCurrency } from "@/lib/utils";
import { DollarSign, TrendingUp, Clock, CheckCircle, Search } from "lucide-react";
import { format } from "date-fns";

interface Commission {
  id: number;
  dealId: number | null;
  type: string;
  amount: string;
  status: string;
  description: string | null;
  paidAt: string | null;
  createdAt: string;
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

  useEffect(() => {
    Promise.all([
      fetch("/api/partner/commissions", { headers: getAuthHeaders() }).then(r => r.ok ? r.json() : []),
      fetch("/api/partner/commissions/summary", { headers: getAuthHeaders() }).then(r => r.ok ? r.json() : null),
    ]).then(([c, s]) => {
      setCommissions(Array.isArray(c) ? c : []);
      setSummary(s);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = commissions.filter(c =>
    (c.description || "").toLowerCase().includes(search.toLowerCase()) ||
    c.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PortalLayout>
      <div className="sf-page-header px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold text-foreground">Commissions</h1>
            <span className="text-xs text-muted-foreground">{summary?.totalTransactions || 0} total</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-4">
        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KpiCard label="Total Earned" value={formatCurrency(summary.totalEarned)} icon={DollarSign} color="#2e844a" />
            <KpiCard label="Paid Out" value={formatCurrency(summary.paid)} icon={CheckCircle} color="#0176d3" />
            <KpiCard label="Approved" value={formatCurrency(summary.approved)} icon={TrendingUp} color="#9050e9" />
            <KpiCard label="Pending" value={formatCurrency(summary.pending)} icon={Clock} color="#fe9339" />
          </div>
        )}

        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input type="text" placeholder="Search commissions..." value={search} onChange={e => setSearch(e.target.value)} className="sf-input pl-8" />
          </div>
        </div>

        <div className="sf-card overflow-x-auto">
          <table className="w-full sf-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Type</th>
                <th className="text-right">Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">No commissions found.</td></tr>
              ) : (
                filtered.map(c => (
                  <tr key={c.id}>
                    <td className="font-medium">{c.description || "Commission payment"}</td>
                    <td><span className="sf-badge sf-badge-default capitalize">{c.type.replace('_', ' ')}</span></td>
                    <td className="text-right font-semibold text-[#2e844a]">{formatCurrency(parseFloat(c.amount))}</td>
                    <td><CommissionStatus status={c.status} /></td>
                    <td className="text-xs text-muted-foreground">{format(new Date(c.createdAt), 'MMM d, yyyy')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
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
  };
  return <span className={`sf-badge ${map[status] || 'sf-badge-default'} capitalize`}>{status}</span>;
}
