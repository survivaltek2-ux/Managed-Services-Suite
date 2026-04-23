import { useEffect, useState } from "react";
import { useRoute, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";

const STEPS = ["welcome", "contacts", "billing", "kickoff"] as const;
type Step = typeof STEPS[number];

interface OnboardingRow {
  id: number;
  status: string;
  currentStep: Step | "complete";
  stepData: Record<string, any>;
}

export default function ClientOnboarding() {
  const [, params] = useRoute("/c/:token/onboarding");
  const token = params?.token ?? "";
  const [row, setRow] = useState<OnboardingRow | null>(null);
  const [client, setClient] = useState<{ name: string; company: string } | null>(null);
  const [step, setStep] = useState<Step>("welcome");
  const [stepData, setStepData] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/public/client-portal/${token}/onboarding`)
      .then(async r => {
        if (!r.ok) { const j = await r.json().catch(() => ({})); throw new Error(j.error || `HTTP ${r.status}`); }
        return r.json();
      })
      .then(json => {
        setRow(json.onboarding);
        setClient(json.client);
        setStepData(json.onboarding.stepData ?? {});
        if (json.onboarding.status === "completed") setDone(true);
        else if (STEPS.includes(json.onboarding.currentStep)) setStep(json.onboarding.currentStep);
      })
      .catch(e => setError(e.message));
  }, [token]);

  const stepIndex = STEPS.indexOf(step);

  async function save(nextStep: Step | null, complete = false) {
    setSaving(true);
    try {
      const res = await fetch(`/api/public/client-portal/${token}/onboarding`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stepData,
          currentStep: nextStep ?? step,
          complete,
        }),
      });
      if (!res.ok) { const j = await res.json().catch(() => ({})); throw new Error(j.error || `HTTP ${res.status}`); }
      const json = await res.json();
      setRow(json.onboarding);
      if (complete) setDone(true);
      else if (nextStep) setStep(nextStep);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  function update(key: string, value: any) {
    setStepData(prev => ({ ...prev, [key]: value }));
  }

  if (error) return <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6"><Card className="max-w-md"><CardContent className="py-6 text-sm text-red-600">{error}</CardContent></Card></div>;
  if (!row || !client) return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading…</div>;

  if (done) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <Card className="max-w-lg w-full">
          <CardContent className="py-10 text-center">
            <CheckCircle2 className="h-14 w-14 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">You're all set!</h2>
            <p className="text-slate-600 mb-6">Thanks for completing onboarding. Your account manager will reach out shortly to confirm your kickoff details.</p>
            <Link href={`/c/${token}`}>
              <Button data-testid="button-back-to-portal">Return to Portal</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-12">
      <header className="bg-gradient-to-r from-[#032d60] to-[#0176d3] text-white">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <p className="text-sm text-white/70">Onboarding · {client.company}</p>
          <h1 className="text-2xl font-bold">Welcome aboard, {client.name}</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 -mt-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <CardTitle className="capitalize" data-testid="text-step-title">Step {stepIndex + 1} of {STEPS.length}: {step}</CardTitle>
              <div className="flex gap-1">
                {STEPS.map((s, i) => (
                  <span key={s} className={`h-1.5 w-8 rounded-full ${i <= stepIndex ? "bg-blue-600" : "bg-slate-200"}`} />
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === "welcome" && (
              <div className="space-y-3">
                <p className="text-slate-700">We're thrilled to have <strong>{client.company}</strong> aboard. This short onboarding takes about 5 minutes and covers:</p>
                <ul className="list-disc pl-6 text-slate-600 text-sm space-y-1">
                  <li>Primary contacts on your team</li>
                  <li>Billing & service address</li>
                  <li>Scheduling your kickoff call</li>
                </ul>
                <p className="text-sm text-slate-500">You can save and resume anytime — your link works for 180 days.</p>
              </div>
            )}

            {step === "contacts" && (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="primary-name">Primary contact name</Label>
                    <Input id="primary-name" data-testid="input-primary-name" value={stepData.primaryContactName ?? ""} onChange={e => update("primaryContactName", e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="primary-email">Primary contact email</Label>
                    <Input id="primary-email" type="email" data-testid="input-primary-email" value={stepData.primaryContactEmail ?? ""} onChange={e => update("primaryContactEmail", e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="primary-phone">Primary contact phone</Label>
                    <Input id="primary-phone" data-testid="input-primary-phone" value={stepData.primaryContactPhone ?? ""} onChange={e => update("primaryContactPhone", e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="primary-role">Title / Role</Label>
                    <Input id="primary-role" data-testid="input-primary-role" value={stepData.primaryContactRole ?? ""} onChange={e => update("primaryContactRole", e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="tech-contact">Technical / IT contact (optional)</Label>
                  <Input id="tech-contact" data-testid="input-tech-contact" placeholder="Name and email" value={stepData.technicalContact ?? ""} onChange={e => update("technicalContact", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="billing-contact">Billing contact (optional)</Label>
                  <Input id="billing-contact" data-testid="input-billing-contact" placeholder="Name and email" value={stepData.billingContact ?? ""} onChange={e => update("billingContact", e.target.value)} />
                </div>
              </div>
            )}

            {step === "billing" && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="legal-name">Legal company name</Label>
                  <Input id="legal-name" data-testid="input-legal-name" value={stepData.legalName ?? client.company} onChange={e => update("legalName", e.target.value)} />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="addr-line1">Service address</Label>
                    <Input id="addr-line1" data-testid="input-addr-line1" value={stepData.addressLine1 ?? ""} onChange={e => update("addressLine1", e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="addr-line2">Suite / Unit</Label>
                    <Input id="addr-line2" data-testid="input-addr-line2" value={stepData.addressLine2 ?? ""} onChange={e => update("addressLine2", e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="addr-city">City</Label>
                    <Input id="addr-city" data-testid="input-addr-city" value={stepData.city ?? ""} onChange={e => update("city", e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="addr-state">State</Label>
                      <Input id="addr-state" data-testid="input-addr-state" value={stepData.state ?? ""} onChange={e => update("state", e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="addr-zip">ZIP</Label>
                      <Input id="addr-zip" data-testid="input-addr-zip" value={stepData.zip ?? ""} onChange={e => update("zip", e.target.value)} />
                    </div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="po">PO number for invoices (optional)</Label>
                  <Input id="po" data-testid="input-po" value={stepData.poNumber ?? ""} onChange={e => update("poNumber", e.target.value)} />
                </div>
              </div>
            )}

            {step === "kickoff" && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="preferred-date">Preferred kickoff date</Label>
                  <Input id="preferred-date" type="date" data-testid="input-preferred-date" value={stepData.preferredDate ?? ""} onChange={e => update("preferredDate", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="preferred-time">Preferred time window</Label>
                  <Input id="preferred-time" data-testid="input-preferred-time" placeholder="e.g. Tuesday afternoons, 2–4 PM ET" value={stepData.preferredTime ?? ""} onChange={e => update("preferredTime", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="attendees">Who should attend? (names + roles)</Label>
                  <Textarea id="attendees" data-testid="input-attendees" rows={3} value={stepData.attendees ?? ""} onChange={e => update("attendees", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="notes">Anything else we should know?</Label>
                  <Textarea id="notes" data-testid="input-notes" rows={3} value={stepData.notes ?? ""} onChange={e => update("notes", e.target.value)} />
                </div>
              </div>
            )}
          </CardContent>
          <div className="flex justify-between p-6 pt-0">
            <Button
              variant="outline"
              disabled={stepIndex === 0 || saving}
              onClick={() => save(STEPS[stepIndex - 1])}
              data-testid="button-back"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            {stepIndex < STEPS.length - 1 ? (
              <Button onClick={() => save(STEPS[stepIndex + 1])} disabled={saving} data-testid="button-next">
                {saving ? "Saving…" : "Save & Continue"} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={() => save(null, true)} disabled={saving} data-testid="button-finish">
                {saving ? "Submitting…" : "Finish Onboarding"} <CheckCircle2 className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
}
