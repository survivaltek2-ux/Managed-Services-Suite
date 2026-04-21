import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  HEADCOUNT_OPTIONS, PAIN_POINT_OPTIONS, COMPLIANCE_OPTIONS,
  PRIORITY_OPTIONS, BUDGET_OPTIONS, TIMELINE_OPTIONS,
} from "@workspace/db/questionnaire";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import {
  Plus, FileText, Clock, CheckCircle, XCircle, Mail, Phone, Eye,
  Download, ChevronLeft, Send, Edit2, RefreshCw, Trash2, X,
  Loader, AlertCircle, CheckSquare, Calendar, User, Building2,
  ChevronDown, ChevronUp, RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

interface PlanContent {
  executiveSummary: string;
  currentEnvironment: string;
  keyFindings: string[];
  recommendedServices: { service: string; description: string }[];
  nextSteps: string[];
}

interface WrittenPlan {
  id: number;
  planNumber: string;
  version: number;
  parentPlanId: number | null;
  clientName: string;
  clientEmail: string;
  clientTitle: string | null;
  clientCompany: string;
  clientPhone: string | null;
  questionnaireAnswers: Record<string, any>;
  planContent: PlanContent;
  status: string;
  reviewToken: string | null;
  expiresAt: string | null;
  validityDays: number;
  personalNote: string | null;
  sentAt: string | null;
  viewedAt: string | null;
  approvedAt: string | null;
  signerName: string | null;
  signerTitle: string | null;
  signatureImage: string | null;
  declineReason: string | null;
  declineNote: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ActivityEvent {
  id: number;
  planId: number;
  eventType: string;
  metadata: Record<string, any>;
  createdAt: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BASE = "/api/partner/plans";

function authHeader() {
  const t = localStorage.getItem("partner_token");
  return t ? { Authorization: `Bearer ${t}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  draft:          { label: "Draft",          color: "text-muted-foreground", bg: "bg-muted",          icon: <FileText className="w-3 h-3" /> },
  sent:           { label: "Sent",           color: "text-blue-600",         bg: "bg-blue-50",        icon: <Mail className="w-3 h-3" /> },
  viewed:         { label: "Viewed",         color: "text-purple-600",       bg: "bg-purple-50",      icon: <Eye className="w-3 h-3" /> },
  approved:       { label: "Approved",       color: "text-green-600",        bg: "bg-green-50",       icon: <CheckCircle className="w-3 h-3" /> },
  declined:       { label: "Declined",       color: "text-red-600",          bg: "bg-red-50",         icon: <XCircle className="w-3 h-3" /> },
  call_requested: { label: "Call Requested", color: "text-orange-600",       bg: "bg-orange-50",      icon: <Phone className="w-3 h-3" /> },
};


// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium", cfg.color, cfg.bg)}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

// ─── Wizard Steps ─────────────────────────────────────────────────────────────

const WIZARD_STEPS = [
  { id: 1, label: "Client Info" },
  { id: 2, label: "Business Details" },
  { id: 3, label: "Pain Points" },
  { id: 4, label: "Review & Generate" },
  { id: 5, label: "Send" },
];

interface WizardAnswers {
  clientName: string;
  clientEmail: string;
  clientTitle: string;
  clientCompany: string;
  clientPhone: string;
  headcount: string;
  locations: string;
  currentItSetup: string;
  currentVendors: string;
  painPoints: string[];
  complianceNeeds: string[];
  priorities: string[];
  budgetRange: string;
  preferredTimeline: string;
  additionalContext: string;
}

const BLANK_ANSWERS: WizardAnswers = {
  clientName: "", clientEmail: "", clientTitle: "", clientCompany: "", clientPhone: "",
  headcount: "", locations: "", currentItSetup: "", currentVendors: "",
  painPoints: [], complianceNeeds: [], priorities: [],
  budgetRange: "", preferredTimeline: "", additionalContext: "",
};

// ─── Multiselect Checkbox ─────────────────────────────────────────────────────

function MultiCheck({ options, value, onChange, columns = 2 }: {
  options: { value: string; label: string }[] | string[];
  value: string[];
  onChange: (v: string[]) => void;
  columns?: number;
}) {
  const items = options.map(o => typeof o === "string" ? { value: o, label: o } : o);
  function toggle(v: string) {
    onChange(value.includes(v) ? value.filter(x => x !== v) : [...value, v]);
  }
  return (
    <div className={cn("grid gap-2", columns === 2 ? "grid-cols-2" : "grid-cols-1")}>
      {items.map(item => (
        <label key={item.value} className={cn(
          "flex items-center gap-2 px-3 py-2 rounded border cursor-pointer transition-colors text-sm",
          value.includes(item.value) ? "border-[#0176d3] bg-[#0176d3]/5 text-[#032d60]" : "border-border hover:border-muted-foreground"
        )}>
          <input type="checkbox" className="accent-[#0176d3] w-3.5 h-3.5"
            checked={value.includes(item.value)} onChange={() => toggle(item.value)} />
          {item.label}
        </label>
      ))}
    </div>
  );
}

function Select({ value, onChange, options, placeholder }: {
  value: string; onChange: (v: string) => void;
  options: string[]; placeholder: string;
}) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-[#0176d3]">
      <option value="">{placeholder}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

// ─── Plan Document View ───────────────────────────────────────────────────────

function PlanDocument({ content, editable, onChange }: {
  content: PlanContent;
  editable?: boolean;
  onChange?: (updated: PlanContent) => void;
}) {
  function updateSection(key: keyof PlanContent, val: any) {
    if (onChange) onChange({ ...content, [key]: val });
  }

  function EditableText({ value, onSave, multiline }: { value: string; onSave: (v: string) => void; multiline?: boolean }) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(value);
    if (!editable) return <p className="text-sm text-gray-700 leading-relaxed">{value}</p>;
    if (editing) return (
      <div className="space-y-1">
        {multiline
          ? <Textarea value={draft} onChange={e => setDraft(e.target.value)} rows={4} className="text-sm" />
          : <Input value={draft} onChange={e => setDraft(e.target.value)} className="text-sm" />}
        <div className="flex gap-1.5">
          <Button size="sm" onClick={() => { onSave(draft); setEditing(false); }}>Save</Button>
          <Button size="sm" variant="ghost" onClick={() => { setDraft(value); setEditing(false); }}>Cancel</Button>
        </div>
      </div>
    );
    return (
      <div className="group relative">
        <p className="text-sm text-gray-700 leading-relaxed">{value}</p>
        <button onClick={() => setEditing(true)} className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded border text-muted-foreground hover:text-foreground">
          <Edit2 className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-sm">
      <section>
        <h3 className="font-bold text-[#032d60] text-base mb-2 border-b border-[#e2e8f0] pb-1">Executive Summary</h3>
        <EditableText value={content.executiveSummary} multiline
          onSave={v => updateSection("executiveSummary", v)} />
      </section>
      <section>
        <h3 className="font-bold text-[#032d60] text-base mb-2 border-b border-[#e2e8f0] pb-1">Current Environment</h3>
        <EditableText value={content.currentEnvironment} multiline
          onSave={v => updateSection("currentEnvironment", v)} />
      </section>
      <section>
        <h3 className="font-bold text-[#032d60] text-base mb-2 border-b border-[#e2e8f0] pb-1">Key Findings</h3>
        <ul className="space-y-1.5">
          {(content.keyFindings || []).map((f, i) => (
            <li key={i} className="flex gap-2 items-start">
              <span className="text-[#0176d3] mt-0.5">▪</span>
              <span className="text-gray-700">{f}</span>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h3 className="font-bold text-[#032d60] text-base mb-3 border-b border-[#e2e8f0] pb-1">Recommended Services</h3>
        <div className="space-y-3">
          {(content.recommendedServices || []).map((s, i) => (
            <div key={i} className="p-3 rounded bg-[#f0f7ff] border border-[#0176d3]/20">
              <p className="font-semibold text-[#032d60]">{s.service}</p>
              <p className="text-gray-600 text-xs mt-1">{s.description}</p>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h3 className="font-bold text-[#032d60] text-base mb-2 border-b border-[#e2e8f0] pb-1">Next Steps</h3>
        <ol className="space-y-1.5">
          {(content.nextSteps || []).map((step, i) => (
            <li key={i} className="flex gap-2 items-start">
              <span className="text-[#0176d3] font-bold shrink-0 w-5">{i + 1}.</span>
              <span className="text-gray-700">{step}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

// ─── Plan Wizard ──────────────────────────────────────────────────────────────

export function PlanWizard({ initial, onComplete, onCancel, onBehalfOfPartnerId }: {
  initial?: { answers: WizardAnswers; planId?: number };
  onComplete: (plan: WrittenPlan) => void;
  onCancel: () => void;
  onBehalfOfPartnerId?: number;
}) {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<WizardAnswers>(initial?.answers || BLANK_ANSWERS);
  const [planId, setPlanId] = useState<number | undefined>(initial?.planId);
  const [generatedPlan, setGeneratedPlan] = useState<WrittenPlan | null>(null);
  const [editedContent, setEditedContent] = useState<PlanContent | null>(null);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendEmail, setSendEmail] = useState(answers.clientEmail);
  const [validityDays, setValidityDays] = useState(30);
  const [personalNote, setPersonalNote] = useState("");

  function upd<K extends keyof WizardAnswers>(k: K, v: WizardAnswers[K]) {
    setAnswers(a => ({ ...a, [k]: v }));
  }

  async function generatePlan() {
    setGenerating(true);
    try {
      const method = planId ? "PUT" : "POST";
      const url = planId ? `${BASE}/${planId}` : BASE;
      const res = await fetch(url, {
        method,
        headers: authHeader(),
        body: JSON.stringify({
          clientName: answers.clientName,
          clientEmail: answers.clientEmail,
          clientTitle: answers.clientTitle,
          clientCompany: answers.clientCompany,
          clientPhone: answers.clientPhone,
          questionnaireAnswers: answers,
          validityDays,
          ...(onBehalfOfPartnerId ? { onBehalfOfPartnerId } : {}),
        }),
      });
      if (!res.ok) throw new Error("Failed");
      const d = await res.json();
      const plan = d.plan || d;
      setPlanId(plan.id);
      setGeneratedPlan(plan);
      setEditedContent(plan.planContent);
      setSendEmail(answers.clientEmail);
      setStep(4);
    } catch {
      toast({ title: "Failed to generate plan", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  }

  async function saveEdits() {
    if (!planId || !editedContent) return;
    setSaving(true);
    try {
      await fetch(`${BASE}/${planId}`, {
        method: "PUT",
        headers: authHeader(),
        body: JSON.stringify({ planContent: editedContent }),
      });
      toast({ title: "Plan saved" });
    } catch {
      toast({ title: "Save failed", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function sendPlan() {
    if (!planId) return;
    setSending(true);
    try {
      if (editedContent) {
        await fetch(`${BASE}/${planId}`, {
          method: "PUT",
          headers: authHeader(),
          body: JSON.stringify({ planContent: editedContent }),
        });
      }
      const res = await fetch(`${BASE}/${planId}/send`, {
        method: "POST",
        headers: authHeader(),
        body: JSON.stringify({ personalNote, validityDays, clientEmail: sendEmail }),
      });
      if (!res.ok) throw new Error("Failed");
      const d = await res.json();
      toast({ title: "Plan sent to client!" });
      onComplete(d.plan);
    } catch {
      toast({ title: "Failed to send plan", variant: "destructive" });
    } finally {
      setSending(false);
    }
  }

  const canProceed: Record<number, boolean> = {
    1: !!(answers.clientName && answers.clientEmail && answers.clientCompany),
    2: !!(answers.headcount && answers.locations && answers.currentItSetup.trim()),
    3: answers.painPoints.length > 0 && answers.complianceNeeds.length > 0,
    4: !!generatedPlan,
    5: !!(sendEmail),
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {WIZARD_STEPS.map(s => (
            <div key={s.id} className="flex-1 text-center">
              <div className={cn("w-8 h-8 rounded-full mx-auto flex items-center justify-center text-sm font-bold mb-1 transition-colors",
                step === s.id ? "bg-[#032d60] text-white" :
                step > s.id ? "bg-[#0176d3] text-white" : "bg-muted text-muted-foreground")}>
                {step > s.id ? "✓" : s.id}
              </div>
              <p className={cn("text-xs hidden sm:block", step === s.id ? "text-[#032d60] font-medium" : "text-muted-foreground")}>{s.label}</p>
            </div>
          ))}
        </div>
        <div className="w-full bg-muted rounded-full h-1.5 mt-2">
          <div className="bg-[#0176d3] h-1.5 rounded-full transition-all" style={{ width: `${((step - 1) / 4) * 100}%` }} />
        </div>
      </div>

      <Card className="p-6">
        {/* Step 1: Client Info */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-[#032d60]">Client Information <span className="text-xs font-normal text-muted-foreground ml-1">(Required)</span></h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Contact Name *</Label>
                <Input value={answers.clientName} onChange={e => upd("clientName", e.target.value)} placeholder="John Smith" />
              </div>
              <div>
                <Label className="text-xs">Title / Role</Label>
                <Input value={answers.clientTitle} onChange={e => upd("clientTitle", e.target.value)} placeholder="IT Manager" />
              </div>
              <div>
                <Label className="text-xs">Company Name *</Label>
                <Input value={answers.clientCompany} onChange={e => upd("clientCompany", e.target.value)} placeholder="Acme Corp" />
              </div>
              <div>
                <Label className="text-xs">Email Address *</Label>
                <Input type="email" value={answers.clientEmail} onChange={e => upd("clientEmail", e.target.value)} placeholder="john@acmecorp.com" />
              </div>
              <div>
                <Label className="text-xs">Phone Number</Label>
                <Input value={answers.clientPhone} onChange={e => upd("clientPhone", e.target.value)} placeholder="+1 (555) 000-0000" />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Business Details */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-[#032d60]">Business & Environment</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Headcount *</Label>
                <Select value={answers.headcount} onChange={v => upd("headcount", v)} options={HEADCOUNT_OPTIONS} placeholder="Select employee count" />
              </div>
              <div>
                <Label className="text-xs">Number of Locations *</Label>
                <Input value={answers.locations} onChange={e => upd("locations", e.target.value)} placeholder="e.g., 2 offices in NYC" />
              </div>
            </div>
            <div>
              <Label className="text-xs">Current IT Setup *</Label>
              <Textarea value={answers.currentItSetup} onChange={e => upd("currentItSetup", e.target.value)}
                placeholder="Describe the current infrastructure — servers, cloud services, devices, managed by whom, etc." rows={3} />
              <p className="text-xs text-muted-foreground mt-1">This helps tailor the plan to the client's actual environment.</p>
            </div>
            <div>
              <Label className="text-xs">Current Vendors / Tools <span className="text-muted-foreground">(optional)</span></Label>
              <Input value={answers.currentVendors} onChange={e => upd("currentVendors", e.target.value)}
                placeholder="e.g., Microsoft 365, Cisco Meraki, AWS" />
            </div>
          </div>
        )}

        {/* Step 3: Pain Points */}
        {step === 3 && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold text-[#032d60]">Pain Points & Priorities</h2>
            <div>
              <Label className="text-xs mb-2 block">Primary Pain Points * <span className="text-muted-foreground font-normal">(select all that apply)</span></Label>
              <MultiCheck options={PAIN_POINT_OPTIONS} value={answers.painPoints} onChange={v => upd("painPoints", v)} />
            </div>
            <div>
              <Label className="text-xs mb-2 block">Compliance Requirements * <span className="text-muted-foreground font-normal">(select 'None / Not applicable' if there are no obligations)</span></Label>
              <MultiCheck options={COMPLIANCE_OPTIONS} value={answers.complianceNeeds} onChange={v => upd("complianceNeeds", v)} />
            </div>
            <div>
              <Label className="text-xs mb-2 block">Top Priorities <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <MultiCheck options={PRIORITY_OPTIONS} value={answers.priorities} onChange={v => upd("priorities", v)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Budget Range <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <Select value={answers.budgetRange} onChange={v => upd("budgetRange", v)} options={BUDGET_OPTIONS} placeholder="Select range" />
              </div>
              <div>
                <Label className="text-xs">Preferred Timeline <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <Select value={answers.preferredTimeline} onChange={v => upd("preferredTimeline", v)} options={TIMELINE_OPTIONS} placeholder="Select timeline" />
              </div>
            </div>
            <div>
              <Label className="text-xs">Additional Context <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Textarea value={answers.additionalContext} onChange={e => upd("additionalContext", e.target.value)}
                placeholder="Any other relevant information about the client's situation or goals" rows={3} />
            </div>
          </div>
        )}

        {/* Step 4: Review & Generate */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#032d60]">Review & Generate Plan</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={generatePlan} disabled={generating} className="gap-1.5">
                  <RefreshCw className={cn("w-3.5 h-3.5", generating && "animate-spin")} /> Regenerate
                </Button>
                {editedContent && (
                  <Button variant="outline" size="sm" onClick={saveEdits} disabled={saving} className="gap-1.5">
                    {saving ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Edit2 className="w-3.5 h-3.5" />} Save Edits
                  </Button>
                )}
              </div>
            </div>

            {!generatedPlan ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <p className="text-muted-foreground text-sm">Click below to generate the written plan from your answers</p>
                <Button onClick={generatePlan} disabled={generating} className="bg-[#032d60] hover:bg-[#0176d3] text-white gap-2">
                  {generating ? <Loader className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                  Generate Written Plan
                </Button>
              </div>
            ) : (
              <div className="border rounded-lg p-5 bg-white shadow-sm">
                <div className="flex items-center gap-3 mb-5 pb-4 border-b">
                  <div>
                    <p className="font-bold text-[#032d60] text-base">{generatedPlan.clientCompany}</p>
                    <p className="text-sm text-muted-foreground">{generatedPlan.planNumber} · Version {generatedPlan.version}</p>
                  </div>
                </div>
                {editedContent && <PlanDocument content={editedContent} editable onChange={setEditedContent} />}
              </div>
            )}
          </div>
        )}

        {/* Step 5: Send */}
        {step === 5 && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold text-[#032d60]">Send to Client</h2>
            <div>
              <Label className="text-xs">Client Email *</Label>
              <Input type="email" value={sendEmail} onChange={e => setSendEmail(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Validity Period</Label>
              <Select value={String(validityDays)} onChange={v => setValidityDays(Number(v))}
                options={["7", "14", "30", "60", "90"]}
                placeholder="30 days" />
              <p className="text-xs text-muted-foreground mt-1">Client has until {format(new Date(Date.now() + validityDays * 86400000), "MMMM d, yyyy")} to sign</p>
            </div>
            <div>
              <Label className="text-xs">Personal Note <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Textarea value={personalNote} onChange={e => setPersonalNote(e.target.value)}
                placeholder="Add a personal message to include with the plan email..." rows={3} />
            </div>
            <div className="bg-[#f0f7ff] rounded-lg p-4 border border-[#0176d3]/20">
              <p className="text-xs font-semibold text-[#032d60] mb-1">What happens next?</p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Client receives a branded email with a secure review link</li>
                <li>• They can sign, request a call, or decline — no login required</li>
                <li>• You'll be notified by email when they take action</li>
                <li>• A reminder is sent automatically if unsigned within 3 days of expiry</li>
              </ul>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6 pt-5 border-t">
          <div className="flex gap-2">
            <Button variant="outline" onClick={step === 1 ? onCancel : () => setStep(s => s - 1)}>
              {step === 1 ? "Cancel" : <><ChevronLeft className="w-4 h-4 mr-1" /> Back</>}
            </Button>
          </div>
          <div className="flex gap-2">
            {step < 4 && (
              <Button onClick={() => step === 3 ? generatePlan() : setStep(s => s + 1)}
                disabled={!canProceed[step] || generating}
                className="bg-[#032d60] hover:bg-[#0176d3] text-white gap-1.5">
                {step === 3 ? (generating ? <><Loader className="w-4 h-4 animate-spin" /> Generating…</> : "Generate Plan →") : "Next →"}
              </Button>
            )}
            {step === 4 && generatedPlan && (
              <Button onClick={() => setStep(5)} className="bg-[#032d60] hover:bg-[#0176d3] text-white gap-1.5">
                <Send className="w-4 h-4" /> Proceed to Send
              </Button>
            )}
            {step === 5 && (
              <Button onClick={sendPlan} disabled={sending || !sendEmail}
                className="bg-[#0176d3] hover:bg-[#015fa3] text-white gap-1.5">
                {sending ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {sending ? "Sending…" : "Send to Client"}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

// ─── Plan Detail View ─────────────────────────────────────────────────────────

function PlanDetail({ planId, onBack, onRevise }: {
  planId: number;
  onBack: () => void;
  onRevise: (plan: WrittenPlan) => void;
}) {
  const { toast } = useToast();
  const [data, setData] = useState<{ plan: WrittenPlan; events: ActivityEvent[]; revisions: WrittenPlan[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [editedContent, setEditedContent] = useState<PlanContent | null>(null);
  const [saving, setSaving] = useState(false);
  const [sendingReminder, setSendingReminder] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${BASE}/${planId}`, { headers: authHeader() });
      if (r.ok) {
        const d = await r.json();
        setData(d);
        setEditedContent(d.plan.planContent);
      }
    } finally { setLoading(false); }
  }, [planId]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="flex justify-center py-20"><Loader className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  if (!data) return <div className="text-center py-20 text-muted-foreground">Plan not found.</div>;

  const { plan, events, revisions } = data;

  async function handleSaveEdits() {
    if (!editedContent) return;
    setSaving(true);
    try {
      await fetch(`${BASE}/${plan.id}`, {
        method: "PUT",
        headers: authHeader(),
        body: JSON.stringify({ planContent: editedContent }),
      });
      toast({ title: "Plan saved" });
    } catch { toast({ title: "Save failed", variant: "destructive" }); }
    finally { setSaving(false); }
  }

  const EVENT_LABELS: Record<string, string> = {
    created: "Plan created", sent: "Sent to client", viewed: "Client viewed plan",
    approved: "Plan approved & signed", declined: "Client declined", call_requested: "Client requested a call",
    revised: "New revision created", reminder_sent: "Expiry reminder sent",
  };

  const canResend = ["draft", "viewed", "sent"].includes(plan.status);
  const canRevise = ["declined", "approved", "call_requested"].includes(plan.status);
  const isEditable = plan.status === "draft";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={onBack}><ChevronLeft className="w-4 h-4 mr-1" /> All Plans</Button>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#032d60]">{plan.clientCompany}</h1>
          <p className="text-muted-foreground text-sm">{plan.planNumber} · v{plan.version} · <StatusBadge status={plan.status} /></p>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          <a href={`/api/partner/plans/${plan.id}/pdf`} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="gap-1.5"><Download className="w-3.5 h-3.5" /> PDF</Button>
          </a>
          {isEditable && (
            <Button variant="outline" size="sm" onClick={handleSaveEdits} disabled={saving} className="gap-1.5">
              {saving ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Edit2 className="w-3.5 h-3.5" />} Save
            </Button>
          )}
          {canRevise && (
            <Button size="sm" onClick={() => onRevise(plan)} className="gap-1.5 bg-[#032d60] hover:bg-[#0176d3] text-white">
              <RotateCcw className="w-3.5 h-3.5" /> Revise & Resend
            </Button>
          )}
        </div>
      </div>

      {/* Client info */}
      <Card className="p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Client</p>
            <p className="font-medium">{plan.clientName}</p>
            {plan.clientTitle && <p className="text-xs text-muted-foreground">{plan.clientTitle}</p>}
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Email</p>
            <p className="font-medium break-all">{plan.clientEmail}</p>
          </div>
          {plan.expiresAt && (
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Expires</p>
              <p className="font-medium">{format(new Date(plan.expiresAt), "MMM d, yyyy")}</p>
            </div>
          )}
          {plan.approvedAt && (
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Signed</p>
              <p className="font-medium">{format(new Date(plan.approvedAt), "MMM d, yyyy")}</p>
              <p className="text-xs text-muted-foreground">{plan.signerName}</p>
            </div>
          )}
          {plan.declineReason && (
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Decline Reason</p>
              <p className="font-medium text-red-600">{plan.declineReason}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Activity Timeline */}
      <Card className="p-4">
        <h2 className="font-bold text-[#032d60] mb-3">Activity Timeline</h2>
        <div className="space-y-2">
          {events.map((ev, i) => (
            <div key={ev.id} className="flex items-start gap-3">
              <div className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0",
                ev.eventType === "approved" ? "bg-green-500" :
                ev.eventType === "declined" ? "bg-red-500" :
                ev.eventType === "call_requested" ? "bg-orange-500" :
                "bg-[#0176d3]")} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{EVENT_LABELS[ev.eventType] || ev.eventType}</p>
                {ev.metadata && Object.keys(ev.metadata).length > 0 && (
                  <p className="text-xs text-muted-foreground">{JSON.stringify(ev.metadata).replace(/[{}"]/g, "").replace(/,/g, " · ")}</p>
                )}
              </div>
              <p className="text-xs text-muted-foreground shrink-0">{format(new Date(ev.createdAt), "MMM d, h:mm a")}</p>
            </div>
          ))}
          {events.length === 0 && <p className="text-sm text-muted-foreground">No activity yet.</p>}
        </div>
      </Card>

      {/* Revision history */}
      {revisions.length > 0 && (
        <Card className="p-4">
          <h2 className="font-bold text-[#032d60] mb-3">Revision History</h2>
          <div className="space-y-2">
            {revisions.map(r => (
              <div key={r.id} className="flex items-center justify-between text-sm py-1.5 border-b last:border-0">
                <span className="text-muted-foreground">v{r.version} · {r.planNumber}</span>
                <StatusBadge status={r.status} />
                <span className="text-xs text-muted-foreground">{format(new Date(r.createdAt), "MMM d, yyyy")}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Plan Content */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-[#032d60] text-base">Plan Content</h2>
          {isEditable && <span className="text-xs text-muted-foreground">Hover over sections to edit inline</span>}
        </div>
        {editedContent && <PlanDocument content={editedContent} editable={isEditable} onChange={setEditedContent} />}
      </Card>

      {/* Signature */}
      {plan.status === "approved" && plan.signatureImage && (
        <Card className="p-4">
          <h2 className="font-bold text-[#032d60] mb-3">Digital Signature</h2>
          <div className="flex items-start gap-4">
            <div>
              <img src={plan.signatureImage} alt="Signature" className="h-16 border rounded bg-white p-1" />
              <p className="text-sm font-medium mt-1">{plan.signerName}</p>
              {plan.signerTitle && <p className="text-xs text-muted-foreground">{plan.signerTitle}</p>}
              <p className="text-xs text-muted-foreground">{plan.clientCompany}</p>
              {plan.approvedAt && <p className="text-xs text-muted-foreground mt-1">Signed {format(new Date(plan.approvedAt), "MMMM d, yyyy 'at' h:mm a")}</p>}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

type View = "list" | "wizard" | "detail";

export default function WrittenPlans() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [view, setView] = useState<View>("list");
  const [plans, setPlans] = useState<WrittenPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [revisionInitial, setRevisionInitial] = useState<{ answers: WizardAnswers; planId?: number } | undefined>();
  const [statusFilter, setStatusFilter] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(BASE, { headers: authHeader() });
      if (r.ok) { const d = await r.json(); setPlans(d.plans || []); }
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleRevise(plan: WrittenPlan) {
    try {
      const createRes = await fetch(`${BASE}/${plan.id}/revise`, { method: "POST", headers: authHeader() });
      if (!createRes.ok) throw new Error("Failed");
      const d = await createRes.json();
      const newPlan: WrittenPlan = d.plan;
      const answers = (plan.questionnaireAnswers as WizardAnswers) || BLANK_ANSWERS;
      setRevisionInitial({ answers, planId: newPlan.id });
      setView("wizard");
    } catch {
      toast({ title: "Failed to create revision", variant: "destructive" });
    }
  }

  async function handleDelete(planId: number) {
    if (!confirm("Delete this plan? This cannot be undone.")) return;
    try {
      await fetch(`${BASE}/${planId}`, { method: "DELETE", headers: authHeader() });
      toast({ title: "Plan deleted" });
      load();
    } catch { toast({ title: "Failed to delete", variant: "destructive" }); }
  }

  function handleWizardComplete(plan: WrittenPlan) {
    setRevisionInitial(undefined);
    load();
    setSelectedPlanId(plan.id);
    setView("detail");
  }

  const filtered = statusFilter === "all" ? plans : plans.filter(p => p.status === statusFilter);

  return (
    <PortalLayout>
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* List View */}
        {view === "list" && (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-[#032d60]">Written Plans</h1>
                <p className="text-muted-foreground text-sm mt-1">IT Assessment Plans for your clients</p>
              </div>
              <Button onClick={() => { setRevisionInitial(undefined); setView("wizard"); }}
                className="bg-[#032d60] hover:bg-[#0176d3] text-white gap-2">
                <Plus className="w-4 h-4" /> New Plan
              </Button>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-4 flex-wrap">
              {["all", "draft", "sent", "viewed", "approved", "declined", "call_requested"].map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={cn("px-3 py-1 rounded-full text-xs font-medium transition-colors",
                    statusFilter === s ? "bg-[#032d60] text-white" : "bg-muted text-muted-foreground hover:bg-muted/80")}>
                  {s === "all" ? "All" : STATUS_CONFIG[s]?.label || s}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex justify-center py-20"><Loader className="w-6 h-6 animate-spin text-muted-foreground" /></div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>{statusFilter === "all" ? "No plans yet. Create your first one!" : "No plans with this status."}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map(plan => (
                  <Card key={plan.id} className="p-4 hover:shadow-sm transition-shadow cursor-pointer"
                    onClick={() => { setSelectedPlanId(plan.id); setView("detail"); }}>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-[#032d60] truncate">{plan.clientCompany}</p>
                          <StatusBadge status={plan.status} />
                          {plan.version > 1 && (
                            <span className="text-xs bg-muted px-1.5 py-0.5 rounded">v{plan.version}</span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{plan.clientName} · {plan.planNumber}</p>
                      </div>
                      <div className="text-right shrink-0 text-xs text-muted-foreground space-y-0.5">
                        <p>Created {format(new Date(plan.createdAt), "MMM d, yyyy")}</p>
                        {plan.expiresAt && plan.status === "sent" && (
                          <p className={cn(new Date(plan.expiresAt) < new Date(Date.now() + 3 * 86400000) ? "text-orange-600 font-medium" : "")}>
                            Expires {format(new Date(plan.expiresAt), "MMM d, yyyy")}
                          </p>
                        )}
                      </div>
                      <Button variant="ghost" size="icon" onClick={e => { e.stopPropagation(); handleDelete(plan.id); }}>
                        <Trash2 className="w-4 h-4 text-muted-foreground hover:text-red-500" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* Wizard */}
        {view === "wizard" && (
          <>
            <div className="flex items-center gap-3 mb-6">
              <Button variant="ghost" onClick={() => { setRevisionInitial(undefined); setView("list"); }}>
                <ChevronLeft className="w-4 h-4 mr-1" /> Back to Plans
              </Button>
              <h1 className="text-xl font-bold text-[#032d60]">
                {revisionInitial?.planId ? "Revise Plan" : "New Written Plan"}
              </h1>
            </div>
            <PlanWizard
              initial={revisionInitial}
              onComplete={handleWizardComplete}
              onCancel={() => { setRevisionInitial(undefined); setView("list"); }}
            />
          </>
        )}

        {/* Detail */}
        {view === "detail" && selectedPlanId && (
          <PlanDetail
            planId={selectedPlanId}
            onBack={() => { setSelectedPlanId(null); setView("list"); load(); }}
            onRevise={handleRevise}
          />
        )}
      </div>
    </PortalLayout>
  );
}
