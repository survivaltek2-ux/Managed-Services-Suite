import React, { useState } from "react";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { useAuth, getAuthHeaders } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { FileText, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PLAN_DEFAULT_PRICE: Record<string, { monthly: number; annual: number }> = {
  essentials: { monthly: 89, annual: 76 },
  business: { monthly: 149, annual: 127 },
  enterprise: { monthly: 229, annual: 195 },
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function AdminMSAGenerator() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [form, setForm] = useState({
    companyName: "",
    customerName: "",
    customerEmail: "",
    planSlug: "business" as "essentials" | "business" | "enterprise",
    billingCycle: "monthly" as "monthly" | "annual",
    pricePerUser: PLAN_DEFAULT_PRICE.business.monthly.toString(),
    seats: "10",
    effectiveDate: todayISO(),
    // Optional template fields
    entityType: "",
    customerAddress: "",
    signerTitle: "",
    billingPhone: "",
    initialTerm: "twelve (12) months",
    noticePeriod: "sixty (60) days",
    customerNotice: "",
    changeApprovalThreshold: "two (2) hours",
  });
  const [generating, setGenerating] = useState(false);
  const [priceTouched, setPriceTouched] = useState(false);
  const [showOptional, setShowOptional] = useState(false);

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handlePlanOrCycleChange = (planSlug: typeof form.planSlug, billingCycle: typeof form.billingCycle) => {
    setForm((prev) => ({
      ...prev,
      planSlug,
      billingCycle,
      pricePerUser: priceTouched ? prev.pricePerUser : PLAN_DEFAULT_PRICE[planSlug][billingCycle].toString(),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (generating) return;

    setGenerating(true);
    try {
      const res = await fetch("/api/admin/contracts/generate-msa", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          companyName: form.companyName,
          customerName: form.customerName,
          customerEmail: form.customerEmail,
          planSlug: form.planSlug,
          billingCycle: form.billingCycle,
          pricePerUser: parseFloat(form.pricePerUser),
          seats: parseInt(form.seats, 10),
          effectiveDate: form.effectiveDate,
          entityType: form.entityType || undefined,
          customerAddress: form.customerAddress || undefined,
          signerTitle: form.signerTitle || undefined,
          billingPhone: form.billingPhone || undefined,
          initialTerm: form.initialTerm || undefined,
          noticePeriod: form.noticePeriod || undefined,
          customerNotice: form.customerNotice || undefined,
          changeApprovalThreshold: form.changeApprovalThreshold || undefined,
        }),
      });

      if (!res.ok) {
        let msg = "Failed to generate MSA";
        try {
          const data = await res.json();
          if (data?.details?.length) msg = data.details.join("; ");
          else if (data?.error) msg = data.error;
        } catch { /* not json */ }
        toast({ variant: "destructive", title: "Generation failed", description: msg });
        return;
      }

      const blob = await res.blob();
      const filenameMatch = res.headers.get("content-disposition")?.match(/filename="([^"]+)"/);
      const filename = filenameMatch?.[1] || "siebert-msa.pdf";

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({ title: "MSA generated", description: `Downloaded ${filename}` });
    } catch (err) {
      toast({ variant: "destructive", title: "Network error", description: "Could not reach server." });
    } finally {
      setGenerating(false);
    }
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

  const totalRecurring = (parseFloat(form.pricePerUser) || 0) * (parseInt(form.seats, 10) || 0);
  const interval = form.billingCycle === "annual" ? "year" : "month";

  return (
    <PortalLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">MSA Generator</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Fill in the customer details below to generate a pre-filled Managed Services Agreement PDF, ready to send for signature.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Contract details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5" data-testid="form-msa-generator">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="companyName">Customer legal name *</Label>
                  <Input
                    id="companyName"
                    data-testid="input-company-name"
                    required
                    value={form.companyName}
                    onChange={(e) => update("companyName", e.target.value)}
                    placeholder="Acme Corporation, Inc."
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="customerName">Authorized signer *</Label>
                  <Input
                    id="customerName"
                    data-testid="input-customer-name"
                    required
                    value={form.customerName}
                    onChange={(e) => update("customerName", e.target.value)}
                    placeholder="Jane Smith"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="customerEmail">Signer email *</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    data-testid="input-customer-email"
                    required
                    value={form.customerEmail}
                    onChange={(e) => update("customerEmail", e.target.value)}
                    placeholder="jane@acme.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="effectiveDate">Effective date *</Label>
                  <Input
                    id="effectiveDate"
                    type="date"
                    data-testid="input-effective-date"
                    required
                    value={form.effectiveDate}
                    onChange={(e) => update("effectiveDate", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="planSlug">Service tier *</Label>
                  <select
                    id="planSlug"
                    data-testid="select-plan"
                    value={form.planSlug}
                    onChange={(e) =>
                      handlePlanOrCycleChange(e.target.value as typeof form.planSlug, form.billingCycle)
                    }
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="essentials">Essentials</option>
                    <option value="business">Business</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="billingCycle">Billing cycle *</Label>
                  <select
                    id="billingCycle"
                    data-testid="select-billing-cycle"
                    value={form.billingCycle}
                    onChange={(e) =>
                      handlePlanOrCycleChange(form.planSlug, e.target.value as typeof form.billingCycle)
                    }
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="annual">Annual</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="seats">Seats (users) *</Label>
                  <Input
                    id="seats"
                    data-testid="input-seats"
                    type="number"
                    min={1}
                    required
                    value={form.seats}
                    onChange={(e) => update("seats", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="pricePerUser">
                    Price per user / {interval} (USD) *
                  </Label>
                  <Input
                    id="pricePerUser"
                    data-testid="input-price-per-user"
                    type="number"
                    min={0}
                    step="0.01"
                    required
                    value={form.pricePerUser}
                    onChange={(e) => {
                      setPriceTouched(true);
                      update("pricePerUser", e.target.value);
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    Defaults to the published rate when you change plan or cycle. Override for custom deals.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label>Total recurring</Label>
                  <div className="h-10 rounded-md border border-input bg-muted/40 px-3 flex items-center text-sm font-semibold" data-testid="text-total-recurring">
                    ${totalRecurring.toFixed(2)} / {interval}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Auto-calculated from price × seats.
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <button
                  type="button"
                  onClick={() => setShowOptional((v) => !v)}
                  data-testid="button-toggle-optional"
                  className="text-sm font-medium text-blue-700 hover:text-blue-800"
                >
                  {showOptional ? "− Hide" : "+ Show"} optional template fields
                </button>
                <p className="text-xs text-muted-foreground mt-1">
                  Pre-fills additional bracketed placeholders in the template (entity type,
                  customer address, signer title, term, notice period, etc.). Anything you
                  leave blank will remain as a bracketed placeholder for legal review.
                </p>

                {showOptional && (
                  <div className="mt-4 space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="entityType">Entity type & state of formation</Label>
                        <Input
                          id="entityType"
                          data-testid="input-entity-type"
                          value={form.entityType}
                          onChange={(e) => update("entityType", e.target.value)}
                          placeholder="Delaware corporation"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="signerTitle">Signer title</Label>
                        <Input
                          id="signerTitle"
                          data-testid="input-signer-title"
                          value={form.signerTitle}
                          onChange={(e) => update("signerTitle", e.target.value)}
                          placeholder="Chief Operating Officer"
                        />
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label htmlFor="customerAddress">Customer principal address</Label>
                        <Input
                          id="customerAddress"
                          data-testid="input-customer-address"
                          value={form.customerAddress}
                          onChange={(e) => update("customerAddress", e.target.value)}
                          placeholder="123 Main St, Suite 400, New York, NY 10001"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="billingPhone">Billing contact phone</Label>
                        <Input
                          id="billingPhone"
                          data-testid="input-billing-phone"
                          value={form.billingPhone}
                          onChange={(e) => update("billingPhone", e.target.value)}
                          placeholder="(555) 123-4567"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="initialTerm">Initial term</Label>
                        <Input
                          id="initialTerm"
                          data-testid="input-initial-term"
                          value={form.initialTerm}
                          onChange={(e) => update("initialTerm", e.target.value)}
                          placeholder="twelve (12) months"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="noticePeriod">Non-renewal notice period</Label>
                        <Input
                          id="noticePeriod"
                          data-testid="input-notice-period"
                          value={form.noticePeriod}
                          onChange={(e) => update("noticePeriod", e.target.value)}
                          placeholder="sixty (60) days"
                        />
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label htmlFor="customerNotice">Customer notice address & email</Label>
                        <Input
                          id="customerNotice"
                          data-testid="input-customer-notice"
                          value={form.customerNotice}
                          onChange={(e) => update("customerNotice", e.target.value)}
                          placeholder="Attn: Legal — legal@acme.com"
                        />
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label htmlFor="changeApprovalThreshold">
                          Change-control email approval threshold (§2.8)
                        </Label>
                        <Input
                          id="changeApprovalThreshold"
                          data-testid="input-change-approval-threshold"
                          value={form.changeApprovalThreshold}
                          onChange={(e) => update("changeApprovalThreshold", e.target.value)}
                          placeholder="two (2) hours"
                        />
                        <p className="text-xs text-muted-foreground">
                          Routine work at or below this effort can be approved by the customer's primary contact via email; anything larger requires a written change order.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between border-t">
                <p className="text-xs text-muted-foreground max-w-md">
                  The generated PDF is a pre-filled draft for review and signature. It is not stored in the documents library — generate again if you change anything.
                </p>
                <Button
                  type="submit"
                  disabled={generating}
                  data-testid="button-generate-msa"
                  className="gap-2 sm:shrink-0"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Generating…
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" /> Generate &amp; download PDF
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
}
