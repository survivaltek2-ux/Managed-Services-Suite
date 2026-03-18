import { PortalLayout } from "@/components/layout/PortalLayout";
import { useAuth } from "@/hooks/use-auth";
import { useDeals } from "@/hooks/use-deals";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { Target, TrendingUp, Handshake, ChevronRight, Award } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const MOCK_CHART_DATA = [
  { name: 'Jan', value: 12000 }, { name: 'Feb', value: 19000 }, { name: 'Mar', value: 15000 },
  { name: 'Apr', value: 28000 }, { name: 'May', value: 22000 }, { name: 'Jun', value: 35000 },
];

export default function Dashboard() {
  const { user } = useAuth();
  const { data: deals = [] } = useDeals();

  if (!user) return null;

  const activeDealsCount = deals.filter(d => ['registered', 'in_progress'].includes(d.status)).length;
  const recentDeals = deals.slice(0, 5);

  return (
    <PortalLayout>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Overview</h1>
          <p className="text-muted-foreground mt-1">Welcome back. Here's what's happening with your pipeline.</p>
        </div>
        <div className="flex items-center gap-3 bg-card px-4 py-2 rounded-xl border border-border shadow-sm">
          <Award className="w-5 h-5 text-amber-500" />
          <div className="text-sm">
            <span className="text-muted-foreground mr-2">Current Tier:</span>
            <span className="font-bold text-foreground capitalize">{user.tier}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MetricCard title="Total YTD Revenue" value={formatCurrency(user.ytdRevenue)} icon={TrendingUp} trend="+14% from last year" />
        <MetricCard title="Active Deals" value={activeDealsCount.toString()} icon={Target} trend={`${deals.length} total historical`} />
        <MetricCard title="Total Deal Count" value={user.totalDeals.toString()} icon={Handshake} />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="p-6 h-full flex flex-col rounded-2xl shadow-sm border-border/50">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-foreground font-display">Revenue Pipeline</h3>
              <p className="text-sm text-muted-foreground">Estimated deal value by month</p>
            </div>
            <div className="flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MOCK_CHART_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} tickFormatter={(val) => `$${val/1000}k`} />
                  <Tooltip 
                    cursor={{fill: 'hsl(var(--muted)/0.5)'}}
                    contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(val: number) => [formatCurrency(val), "Revenue"]}
                  />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <div>
          <Card className="p-0 overflow-hidden h-full rounded-2xl shadow-sm border-border/50 flex flex-col">
            <div className="p-6 border-b border-border/50 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="text-lg font-bold text-foreground font-display">Recent Deals</h3>
              <Link href="/deals" className="text-sm text-primary hover:underline font-medium">View all</Link>
            </div>
            <div className="flex-1 overflow-auto">
              {recentDeals.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center h-full">
                  <Handshake className="w-8 h-8 mb-2 opacity-20" />
                  <p className="text-sm">No deals registered yet</p>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {recentDeals.map(deal => (
                    <div key={deal.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors flex items-center justify-between group">
                      <div>
                        <p className="font-semibold text-sm text-foreground">{deal.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{deal.customerName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-foreground">{formatCurrency(deal.estimatedValue)}</p>
                        <Badge variant="outline" className="mt-1 text-[10px] py-0">{deal.stage.replace('_', ' ')}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </PortalLayout>
  );
}

function MetricCard({ title, value, icon: Icon, trend }: any) {
  return (
    <Card className="p-6 rounded-2xl shadow-sm border-border/50 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className="p-2 bg-primary/10 rounded-lg">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>
      <h3 className="text-3xl font-display font-bold text-foreground tracking-tight">{value}</h3>
      {trend && <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-2">{trend}</p>}
    </Card>
  );
}
