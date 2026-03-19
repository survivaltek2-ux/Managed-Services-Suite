import { useState, useEffect } from "react";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { getAuthHeaders } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/Input";
import { formatCurrency } from "@/lib/utils";
import { DollarSign, TrendingUp, Clock, CheckCircle, Search, ArrowUpRight, ArrowDownRight } from "lucide-react";
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
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground">Commissions</h1>
        <p className="text-muted-foreground mt-1">Track your earnings and payment history.</p>
      </div>

      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard title="Total Earned" value={formatCurrency(summary.totalEarned)} icon={DollarSign} color="text-emerald-500" bg="bg-emerald-500/10" />
          <MetricCard title="Paid Out" value={formatCurrency(summary.paid)} icon={CheckCircle} color="text-blue-500" bg="bg-blue-500/10" />
          <MetricCard title="Approved" value={formatCurrency(summary.approved)} icon={ArrowUpRight} color="text-violet-500" bg="bg-violet-500/10" />
          <MetricCard title="Pending" value={formatCurrency(summary.pending)} icon={Clock} color="text-amber-500" bg="bg-amber-500/10" />
        </div>
      )}

      <div className="bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        <div className="p-4 border-b border-border/50 flex items-center gap-4 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search commissions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white dark:bg-slate-950 border-border/50 h-10 rounded-lg shadow-sm"
            />
          </div>
          <span className="text-sm text-muted-foreground">{summary?.totalTransactions || 0} total</span>
        </div>

        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-slate-50/80 dark:bg-slate-900/80 border-b border-border/50">
              <tr>
                <th className="px-6 py-4 font-semibold tracking-wider">Description</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Type</th>
                <th className="px-6 py-4 font-semibold tracking-wider text-right">Amount</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Status</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                <tr><td colSpan={5} className="text-center p-8 text-muted-foreground">Loading commissions...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center p-12 text-muted-foreground">No commissions found yet.</td></tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">{c.description || "Commission payment"}</td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="capitalize bg-white dark:bg-slate-950 shadow-sm">{c.type.replace('_', ' ')}</Badge>
                    </td>
                    <td className="px-6 py-4 font-semibold text-right text-emerald-600 dark:text-emerald-400">{formatCurrency(parseFloat(c.amount))}</td>
                    <td className="px-6 py-4"><CommissionStatus status={c.status} /></td>
                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                      {format(new Date(c.createdAt), 'MMM d, yyyy')}
                    </td>
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

function MetricCard({ title, value, icon: Icon, color, bg }: { title: string; value: string; icon: any; color: string; bg: string }) {
  return (
    <Card className="p-6 rounded-2xl shadow-sm border-border/50 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-2xl font-bold mt-2 text-foreground">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${bg}`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      </div>
    </Card>
  );
}

function CommissionStatus({ status }: { status: string }) {
  const map: Record<string, { variant: any; label: string }> = {
    pending: { variant: "warning", label: "Pending" },
    approved: { variant: "default", label: "Approved" },
    paid: { variant: "success", label: "Paid" },
    rejected: { variant: "destructive", label: "Rejected" },
  };
  const config = map[status] || { variant: "secondary", label: status };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
