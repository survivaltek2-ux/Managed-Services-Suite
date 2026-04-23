import { useEffect, useState } from "react";
import { useRoute, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ArrowRight, FileText, LifeBuoy, Receipt, UserCircle, Sparkles } from "lucide-react";

interface DashboardData {
  client: { name: string; email: string; company: string };
  accountManager: { name: string; email: string; phone: string | null; companyName: string | null } | null;
  plans: Array<{
    id: number; planNumber: string; status: string; clientCompany: string;
    approvedAt: string | null; sentAt: string | null; reviewToken: string | null;
    expiresAt: string | null;
  }>;
  tickets: { open: number; recent: Array<{ id: number; subject: string; status: string; createdAt: string | null }> };
  invoices: Array<{ id: number; invoiceNumber: string; status: string; total: string | number; dueDate: string | null; paidAt: string | null }>;
  subscription: { planName: string; status: string; amount: string | number | null; currentPeriodEnd: string | null; cancelAtPeriodEnd: boolean } | null;
  onboarding: { id: number; status: string; currentStep: string; planId: number | null; startedAt: string | null; completedAt: string | null } | null;
}

const fmtMoney = (n: string | number | null | undefined) => {
  if (n == null) return "—";
  const v = typeof n === "string" ? parseFloat(n) : n;
  if (Number.isNaN(v)) return String(n);
  return v.toLocaleString("en-US", { style: "currency", currency: "USD" });
};
const fmtDate = (d: string | null | undefined) => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

export default function ClientDashboard() {
  const [, params] = useRoute("/c/:token");
  const token = params?.token ?? "";
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetch(`/api/public/client-portal/${token}`)
      .then(async r => {
        if (!r.ok) {
          const j = await r.json().catch(() => ({}));
          throw new Error(j.error || `HTTP ${r.status}`);
        }
        return r.json();
      })
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading your portal…</div>;
  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <Card className="max-w-md w-full">
          <CardHeader><CardTitle>Link not valid</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">This portal link is invalid or has expired. Please reply to your most recent email from Siebert Services and we'll send a fresh link.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const onboardingPending = data.onboarding && data.onboarding.status !== "completed";
  const latestPlan = data.plans[0];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-12">
      <header className="bg-gradient-to-r from-[#032d60] to-[#0176d3] text-white">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <p className="text-sm text-white/70">Welcome back</p>
          <h1 className="text-3xl font-bold">{data.client.name}</h1>
          <p className="text-white/80">{data.client.company}</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 -mt-6 space-y-6">
        {onboardingPending && (
          <Card className="border-amber-300 bg-amber-50 dark:bg-amber-950/20" data-testid="card-onboarding-callout">
            <CardContent className="flex items-center justify-between gap-4 py-5">
              <div className="flex items-start gap-3">
                <Sparkles className="text-amber-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-900 dark:text-amber-200">Finish setting up your account</p>
                  <p className="text-sm text-amber-800 dark:text-amber-300/80">
                    Complete your onboarding so we can schedule your kickoff. Currently on step: <strong>{data.onboarding!.currentStep}</strong>.
                  </p>
                </div>
              </div>
              <Link href={`/c/${token}/onboarding`}>
                <Button data-testid="button-start-onboarding">
                  {data.onboarding!.currentStep === "welcome" ? "Start" : "Resume"} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card data-testid="card-plan">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2"><FileText className="h-4 w-4" /> Latest Plan</CardTitle></CardHeader>
            <CardContent>
              {latestPlan ? (
                <>
                  <p className="font-semibold">{latestPlan.planNumber}</p>
                  <Badge variant="secondary" className="mt-1 capitalize">{latestPlan.status}</Badge>
                  {latestPlan.reviewToken && (
                    <a href={`/partners/plan-review/${latestPlan.reviewToken}`} className="block mt-3 text-sm text-blue-600 hover:underline">View plan →</a>
                  )}
                </>
              ) : <p className="text-sm text-slate-500">No plans yet.</p>}
            </CardContent>
          </Card>

          <Card data-testid="card-account-manager">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2"><UserCircle className="h-4 w-4" /> Your Account Manager</CardTitle></CardHeader>
            <CardContent>
              {data.accountManager ? (
                <>
                  <p className="font-semibold">{data.accountManager.name}</p>
                  {data.accountManager.companyName && <p className="text-xs text-slate-500">{data.accountManager.companyName}</p>}
                  {data.accountManager.email && <a href={`mailto:${data.accountManager.email}`} className="block mt-2 text-sm text-blue-600 hover:underline">{data.accountManager.email}</a>}
                  {data.accountManager.phone && <p className="text-sm text-slate-600 mt-1">{data.accountManager.phone}</p>}
                </>
              ) : <p className="text-sm text-slate-500">A team member will be assigned soon.</p>}
            </CardContent>
          </Card>

          <Card data-testid="card-subscription">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-500">Current Service</CardTitle></CardHeader>
            <CardContent>
              {data.subscription ? (
                <>
                  <p className="font-semibold">{data.subscription.planName}</p>
                  <p className="text-sm text-slate-600">{fmtMoney(data.subscription.amount)} / month</p>
                  <Badge variant="outline" className="mt-2 capitalize">{data.subscription.status}</Badge>
                  {data.subscription.currentPeriodEnd && (
                    <p className="text-xs text-slate-500 mt-2">Renews {fmtDate(data.subscription.currentPeriodEnd)}</p>
                  )}
                </>
              ) : <p className="text-sm text-slate-500">No active subscription.</p>}
            </CardContent>
          </Card>

          <Card data-testid="card-tickets">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2"><LifeBuoy className="h-4 w-4" /> Support Tickets</CardTitle></CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{data.tickets.open}</p>
              <p className="text-xs text-slate-500 mb-3">open</p>
              {data.tickets.recent.length > 0 && (
                <ul className="space-y-1">
                  {data.tickets.recent.map(t => (
                    <li key={t.id} className="text-sm flex justify-between gap-2">
                      <span className="truncate">{t.subject}</span>
                      <Badge variant="outline" className="text-[10px] capitalize">{t.status}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className="md:col-span-2" data-testid="card-invoices">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2"><Receipt className="h-4 w-4" /> Recent Invoices</CardTitle></CardHeader>
            <CardContent>
              {data.invoices.length === 0 ? (
                <p className="text-sm text-slate-500">No invoices yet.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="text-xs text-slate-500 uppercase">
                    <tr><th className="text-left py-1">Invoice</th><th className="text-left">Status</th><th className="text-right">Amount</th><th className="text-right">Due</th></tr>
                  </thead>
                  <tbody>
                    {data.invoices.map(inv => (
                      <tr key={inv.id} className="border-t">
                        <td className="py-2 font-medium">{inv.invoiceNumber}</td>
                        <td><Badge variant="outline" className="capitalize text-[10px]">{inv.status}</Badge></td>
                        <td className="text-right">{fmtMoney(inv.total)}</td>
                        <td className="text-right text-slate-500">{fmtDate(inv.dueDate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </div>

        <p className="text-xs text-center text-slate-400 pt-4">
          Need help? Email your account manager{data.accountManager?.email ? <> at <a className="text-blue-600 hover:underline" href={`mailto:${data.accountManager.email}`}>{data.accountManager.email}</a></> : ""}.
        </p>
      </main>
    </div>
  );
}
