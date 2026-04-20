import React, { useState, useEffect } from "react";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { useAuth, getAuthHeaders } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, FileText, CheckCircle, Clock, AlertTriangle, Loader2, ExternalLink, Calendar, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";

interface Invoice {
  id: number;
  invoiceNumber: string;
  title: string;
  status: string;
  total: string;
  dueDate: string | null;
  paidAt: string | null;
  createdAt: string;
  items: any[];
}

interface Subscription {
  id: number;
  planName: string;
  planId: string;
  status: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  billingCycle: string;
  amount: string | null;
}

function StatusBadge({ status }: { status: string }) {
  const classes: Record<string, string> = {
    paid: "bg-emerald-100 text-emerald-800",
    sent: "bg-blue-100 text-blue-800",
    viewed: "bg-purple-100 text-purple-800",
    overdue: "bg-red-100 text-red-800",
    draft: "bg-gray-100 text-gray-800",
    void: "bg-gray-100 text-gray-500",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${classes[status] || "bg-gray-100 text-gray-800"}`}>
      {status}
    </span>
  );
}

function SubStatusBadge({ status }: { status: string }) {
  const classes: Record<string, string> = {
    active: "bg-emerald-100 text-emerald-800",
    trialing: "bg-blue-100 text-blue-800",
    past_due: "bg-red-100 text-red-800",
    canceled: "bg-gray-100 text-gray-500",
    incomplete: "bg-yellow-100 text-yellow-800",
    paused: "bg-orange-100 text-orange-800",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${classes[status] || "bg-gray-100 text-gray-800"}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

export default function Billing() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<number | null>(null);

  const headers = getAuthHeaders();
  const fmt = (n: string | number) => Number(n).toLocaleString("en-US", { style: "currency", currency: "USD" });
  const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/partner/billing/invoices", { headers });
      if (res.ok) {
        const data = await res.json();
        setInvoices(Array.isArray(data.invoices) ? data.invoices : []);
        setSubscription(data.subscription || null);
      }
    } catch {
      toast({ title: "Failed to load billing info", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const payInvoice = async (invoice: Invoice) => {
    setPayingId(invoice.id);
    try {
      const res = await fetch(`/api/invoices/${invoice.id}/pay`, { method: "POST", headers });
      if (res.ok) {
        const data = await res.json();
        if (data.url) window.location.href = data.url;
      } else {
        const err = await res.json().catch(() => ({}));
        toast({ title: err.message || "Failed to initiate payment", variant: "destructive" });
      }
    } catch {
      toast({ title: "Payment error", variant: "destructive" });
    } finally {
      setPayingId(null);
    }
  };

  const outstanding = invoices.filter(i => ["sent", "viewed", "overdue"].includes(i.status));
  const paid = invoices.filter(i => i.status === "paid");

  return (
    <PortalLayout>
      <div className="px-6 py-4">
        <div className="max-w-5xl mx-auto space-y-5">
          <div>
            <h1 className="text-2xl font-bold">Billing</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage your invoices and subscription plan</p>
          </div>

          {/* Subscription Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="w-4 h-4" /> Current Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</div>
              ) : subscription ? (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <p className="text-xl font-bold capitalize">{subscription.planName}</p>
                      <SubStatusBadge status={subscription.status} />
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Renews {fmtDate(subscription.currentPeriodEnd)}
                      </span>
                      {subscription.amount && (
                        <span className="flex items-center gap-1">
                          <CreditCard className="w-3.5 h-3.5" />
                          {fmt(subscription.amount)} / {subscription.billingCycle === "annual" ? "year" : "month"}
                        </span>
                      )}
                    </div>
                    {subscription.cancelAtPeriodEnd && (
                      <p className="text-sm text-orange-600 mt-2 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Cancels at end of billing period
                      </p>
                    )}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => toast({ title: "Contact support to manage your plan" })}>
                    Manage Plan
                  </Button>
                </div>
              ) : (
                <div className="py-4 text-center">
                  <CreditCard className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-50" />
                  <p className="text-sm text-muted-foreground">No active subscription</p>
                  <a href="/pricing" className="mt-3 inline-flex items-center gap-1 text-sm text-primary font-medium hover:underline">
                    View plans <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-4 pb-3 px-4">
                <p className="text-xs text-muted-foreground">Outstanding</p>
                <p className="text-2xl font-bold text-orange-600">
                  {fmt(outstanding.reduce((s, i) => s + parseFloat(i.total || "0"), 0))}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{outstanding.length} invoice{outstanding.length !== 1 ? "s" : ""}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3 px-4">
                <p className="text-xs text-muted-foreground">Total Paid</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {fmt(paid.reduce((s, i) => s + parseFloat(i.total || "0"), 0))}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{paid.length} invoice{paid.length !== 1 ? "s" : ""}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3 px-4">
                <p className="text-xs text-muted-foreground">Total Invoices</p>
                <p className="text-2xl font-bold">{invoices.length}</p>
                <p className="text-xs text-muted-foreground mt-0.5">all time</p>
              </CardContent>
            </Card>
          </div>

          {/* Invoices Table */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="w-4 h-4" /> Invoices
                </CardTitle>
                <Button size="sm" variant="ghost" onClick={load} disabled={loading}>
                  <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loading ? "animate-spin" : ""}`} /> Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : invoices.length === 0 ? (
                <div className="py-12 text-center">
                  <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-40" />
                  <p className="text-sm text-muted-foreground">No invoices yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="px-5 py-3 text-left">Invoice</th>
                        <th className="px-5 py-3 text-left">Description</th>
                        <th className="px-5 py-3 text-left">Status</th>
                        <th className="px-5 py-3 text-right">Amount</th>
                        <th className="px-5 py-3 text-left">Due</th>
                        <th className="px-5 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map(invoice => (
                        <tr key={invoice.id} className="border-b last:border-0 hover:bg-muted/30">
                          <td className="px-5 py-3">
                            <p className="font-mono text-xs text-muted-foreground">{invoice.invoiceNumber}</p>
                          </td>
                          <td className="px-5 py-3">
                            <p className="font-medium">{invoice.title}</p>
                            <p className="text-xs text-muted-foreground">{fmtDate(invoice.createdAt)}</p>
                          </td>
                          <td className="px-5 py-3">
                            <StatusBadge status={invoice.status} />
                          </td>
                          <td className="px-5 py-3 text-right font-semibold">{fmt(invoice.total)}</td>
                          <td className="px-5 py-3 text-sm text-muted-foreground">
                            {invoice.status === "paid"
                              ? <span className="text-emerald-600 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Paid {fmtDate(invoice.paidAt)}</span>
                              : invoice.dueDate
                                ? <span className={`flex items-center gap-1 ${new Date(invoice.dueDate) < new Date() ? "text-red-600" : ""}`}>
                                    <Clock className="w-3.5 h-3.5" /> {fmtDate(invoice.dueDate)}
                                  </span>
                                : "—"
                            }
                          </td>
                          <td className="px-5 py-3 text-right">
                            {["sent", "viewed", "overdue"].includes(invoice.status) && (
                              <Button
                                size="sm"
                                onClick={() => payInvoice(invoice)}
                                disabled={payingId === invoice.id}
                              >
                                {payingId === invoice.id ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <CreditCard className="w-3.5 h-3.5 mr-1" />}
                                Pay Now
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PortalLayout>
  );
}
