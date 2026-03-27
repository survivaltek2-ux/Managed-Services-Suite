import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Server, Wifi, Video, Cloud, Shield, Package,
  ArrowRight, ArrowLeft, CheckCircle2,
  Calculator, Users, Building, Phone, Mail, MessageSquare
} from "lucide-react";
import { Card, CardContent, Input, Textarea, Button, Label } from "@/components/ui";
import { useSubmitQuote, QuoteRequestInputCompanySize } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";

// ─── Service Category Definitions ──────────────────────────────────────────

const CATEGORIES = [
  {
    id: "managed_it",
    icon: Server,
    title: "Managed IT & Helpdesk",
    description: "Full IT support, monitoring, and helpdesk services",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    selectedBorder: "border-blue-500",
    questions: [
      { id: "users", label: "How many users need support?", type: "select" as const, options: ["1–10", "11–25", "26–50", "51–100", "100+"] },
      { id: "devices", label: "How many devices to manage?", type: "select" as const, options: ["Under 10", "10–25", "26–50", "51–100", "100+"] },
      { id: "support_hours", label: "Support hours needed?", type: "select" as const, options: ["Business hours (M–F 8–5)", "Extended hours (M–F 7am–8pm)", "24/7 critical support"] },
    ],
  },
  {
    id: "networking",
    icon: Wifi,
    title: "Networking & Infrastructure",
    description: "Switches, firewalls, Wi-Fi, and cabling",
    color: "text-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-200",
    selectedBorder: "border-orange-500",
    questions: [
      { id: "sites", label: "How many locations?", type: "select" as const, options: ["1", "2–3", "4–10", "10+"] },
      { id: "scope", label: "What do you need?", type: "multicheck" as const, options: ["Firewall / Security appliance", "Managed switches", "Wi-Fi access points", "SD-WAN / remote sites", "Cabling / physical infrastructure"] },
    ],
  },
  {
    id: "zoom",
    icon: Video,
    title: "Zoom & Unified Communications",
    description: "Meetings, Phone, Rooms, Webinars, and Contact Center",
    color: "text-sky-600",
    bg: "bg-sky-50",
    border: "border-sky-200",
    selectedBorder: "border-sky-500",
    questions: [
      { id: "zoom_users", label: "How many Zoom users?", type: "select" as const, options: ["1–10", "11–25", "26–50", "51–100", "100+"] },
      { id: "zoom_products", label: "Which products are you interested in?", type: "multicheck" as const, options: ["Zoom Meetings", "Zoom Phone", "Zoom Rooms", "Zoom Webinars", "Zoom Contact Center"] },
    ],
  },
  {
    id: "cloud",
    icon: Cloud,
    title: "Cloud Services",
    description: "Microsoft 365, Azure, AWS, or Google Workspace",
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-200",
    selectedBorder: "border-violet-500",
    questions: [
      { id: "cloud_users", label: "How many cloud users?", type: "select" as const, options: ["1–10", "11–25", "26–50", "51–100", "100+"] },
      { id: "cloud_platforms", label: "Which platforms?", type: "multicheck" as const, options: ["Microsoft 365", "Azure", "AWS", "Google Workspace", "Other"] },
      { id: "migration", label: "Migration needed?", type: "radio" as const, options: ["Yes – migrating from on-prem", "Yes – migrating between clouds", "No – already in the cloud", "Not sure yet"] },
    ],
  },
  {
    id: "cybersecurity",
    icon: Shield,
    title: "Cybersecurity & Compliance",
    description: "Endpoint protection, compliance, and monitoring",
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
    selectedBorder: "border-red-500",
    questions: [
      { id: "compliance", label: "Compliance requirements?", type: "multicheck" as const, options: ["HIPAA", "PCI-DSS", "SOC 2", "CMMC / NIST", "None / Not sure"] },
      { id: "security_needs", label: "What security areas concern you most?", type: "multicheck" as const, options: ["Ransomware / malware protection", "Email security", "Vulnerability scanning", "Security awareness training", "Incident response planning", "Dark web monitoring"] },
    ],
  },
  {
    id: "hardware",
    icon: Package,
    title: "Hardware Procurement",
    description: "Laptops, servers, phones, and peripheral equipment",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    selectedBorder: "border-emerald-500",
    questions: [
      { id: "hardware_types", label: "What hardware do you need?", type: "multicheck" as const, options: ["Laptops / Desktops", "Servers / NAS", "Network equipment", "IP Phones / Headsets", "Monitors / Peripherals", "Printers / Scanners"] },
      { id: "hardware_qty", label: "Estimated quantity?", type: "select" as const, options: ["1–5 units", "6–15 units", "16–30 units", "30+ units"] },
    ],
  },
];

type CategoryId = typeof CATEGORIES[number]["id"];

// ─── Step Progress Bar ──────────────────────────────────────────────────────

function StepIndicator({ step }: { step: number }) {
  const steps = ["Services", "Details", "Contact"];
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {steps.map((label, i) => {
        const num = i + 1;
        const isCompleted = step > num;
        const isActive = step === num;
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                isCompleted ? "bg-primary text-white" : isActive ? "bg-navy text-white" : "bg-gray-200 text-gray-500"
              }`}>
                {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : num}
              </div>
              <span className={`text-xs mt-1 font-medium ${isActive ? "text-navy" : "text-muted-foreground"}`}>{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-16 sm:w-24 h-0.5 mx-2 mb-5 transition-all duration-500 ${step > num ? "bg-primary" : "bg-gray-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── MultiCheck component ───────────────────────────────────────────────────

function MultiCheck({ options, selected, onChange }: { options: string[]; selected: string[]; onChange: (v: string[]) => void }) {
  const toggle = (opt: string) => {
    onChange(selected.includes(opt) ? selected.filter(s => s !== opt) : [...selected, opt]);
  };
  return (
    <div className="flex flex-wrap gap-2 mt-1">
      {options.map(opt => (
        <button
          key={opt}
          type="button"
          onClick={() => toggle(opt)}
          className={`px-3 py-2 text-sm rounded-lg border font-medium transition-all ${
            selected.includes(opt) ? "bg-primary text-white border-primary" : "border-border bg-white text-foreground hover:border-primary/50"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function Quote() {
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const quoteMutation = useSubmitQuote();

  const [step, setStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);

  const [selectedCats, setSelectedCats] = useState<CategoryId[]>([]);
  const [answers, setAnswers] = useState<Record<string, Record<string, any>>>({});

  const [contact, setContact] = useState({
    name: isAuthenticated && user ? (user as any).name || "" : "",
    email: isAuthenticated && user ? (user as any).email || "" : "",
    phone: "",
    company: isAuthenticated && user ? (user as any).company || "" : "",
    companySize: "1-10" as QuoteRequestInputCompanySize,
    budget: "",
    timeline: "",
    details: "",
  });

  const toggleCategory = (id: CategoryId) => {
    setSelectedCats(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  const setAnswer = (catId: string, qId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [catId]: { ...(prev[catId] || {}), [qId]: value } }));
  };

  const buildDetailsSummary = () => {
    const lines: string[] = [];
    for (const catId of selectedCats) {
      const cat = CATEGORIES.find(c => c.id === catId);
      if (!cat) continue;
      lines.push(`=== ${cat.title} ===`);
      for (const q of cat.questions) {
        const ans = answers[catId]?.[q.id];
        if (ans && (typeof ans === "string" ? ans : ans.length > 0)) {
          lines.push(`${q.label} ${Array.isArray(ans) ? ans.join(", ") : ans}`);
        }
      }
    }
    if (contact.details.trim()) {
      lines.push(`\n=== Additional Notes ===`);
      lines.push(contact.details.trim());
    }
    return lines.join("\n");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact.name || !contact.email || !contact.company) {
      toast({ variant: "destructive", title: "Missing info", description: "Please fill in your name, email, and company." });
      return;
    }
    try {
      await quoteMutation.mutateAsync({
        data: {
          name: contact.name,
          email: contact.email,
          phone: contact.phone || undefined,
          company: contact.company,
          companySize: contact.companySize,
          budget: contact.budget || undefined,
          timeline: contact.timeline || undefined,
          details: buildDetailsSummary() || undefined,
          services: selectedCats.map(id => CATEGORIES.find(c => c.id === id)?.title ?? id),
        },
      });
      setIsSuccess(true);
      window.scrollTo(0, 0);
    } catch {
      toast({ variant: "destructive", title: "Submission failed", description: "Please try again or contact us directly." });
    }
  };

  // ── Success ────────────────────────────────────────────────────────────────
  if (isSuccess) {
    return (
      <div className="min-h-screen pt-32 pb-20 bg-gray-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-lg mx-auto">
          <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h1 className="text-3xl font-bold text-navy mb-3">Quote Request Submitted!</h1>
          <p className="text-muted-foreground mb-2 leading-relaxed">
            Thanks, <strong>{contact.name}</strong>! We've received your configuration for{" "}
            <strong>{selectedCats.length} service{selectedCats.length !== 1 ? "s" : ""}</strong>. A specialist will review your needs and respond within 1 business day.
          </p>
          {!isAuthenticated ? (
            <p className="text-sm text-blue-900 bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4">
              <strong>Tip:</strong> Log in to the{" "}
              <a href="/portal" className="text-primary font-semibold underline">Client Portal</a>{" "}
              with this email to track your quote and view any proposals we send.
            </p>
          ) : (
            <p className="text-sm text-blue-900 bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4">
              Track this quote in your{" "}
              <a href="/portal" className="text-primary font-semibold underline">Client Portal</a>{" "}
              under the My Quotes tab.
            </p>
          )}
          <Button className="mt-8 h-12 px-8" onClick={() => window.location.href = "/"}>Return to Home</Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 bg-gray-50">
      <div className="bg-navy py-14 px-4 text-center border-b-4 border-primary">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-3">Build Your Quote</h1>
        <p className="text-lg text-white/80 max-w-2xl mx-auto">
          Tell us what you need in a few steps. We'll put together a tailored proposal and respond within 1 business day.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-[-32px] relative z-10">
        <Card className="border-none shadow-2xl">
          <CardContent className="p-6 md:p-10">
            <StepIndicator step={step} />

            <AnimatePresence mode="wait">

              {/* ── Step 1: Service Selection ─────────────────────────────── */}
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
                  <h2 className="text-2xl font-bold text-navy mb-1">What services do you need?</h2>
                  <p className="text-muted-foreground mb-6">Select all that apply — you'll configure details in the next step.</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {CATEGORIES.map(cat => {
                      const Icon = cat.icon;
                      const selected = selectedCats.includes(cat.id as CategoryId);
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => toggleCategory(cat.id as CategoryId)}
                          className={`text-left p-5 rounded-2xl border-2 transition-all duration-200 hover:shadow-md ${
                            selected ? `${cat.selectedBorder} ${cat.bg} shadow-md` : "border-gray-200 bg-white hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-xl ${cat.bg} flex items-center justify-center flex-shrink-0`}>
                              <Icon className={`w-6 h-6 ${cat.color}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <h3 className="font-bold text-navy text-sm leading-tight">{cat.title}</h3>
                                <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                                  selected ? "bg-primary border-primary" : "border-gray-300"
                                }`}>
                                  {selected && <CheckCircle2 className="w-4 h-4 text-white" />}
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{cat.description}</p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-8 flex flex-col items-end gap-2">
                    <Button size="lg" className="px-8 gap-2 text-base" disabled={selectedCats.length === 0} onClick={() => setStep(2)}>
                      Next: Configure Details <ArrowRight className="w-5 h-5" />
                    </Button>
                    {selectedCats.length === 0 && (
                      <p className="text-sm text-muted-foreground">Select at least one service to continue</p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ── Step 2: Configuration Details ────────────────────────── */}
              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
                  <h2 className="text-2xl font-bold text-navy mb-1">Configure your services</h2>
                  <p className="text-muted-foreground mb-6">Answer a few quick questions so we can tailor your proposal.</p>

                  <div className="space-y-8">
                    {selectedCats.map(catId => {
                      const cat = CATEGORIES.find(c => c.id === catId)!;
                      const Icon = cat.icon;
                      return (
                        <div key={catId} className={`p-6 rounded-2xl border-2 ${cat.border} ${cat.bg}`}>
                          <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                              <Icon className={`w-5 h-5 ${cat.color}`} />
                            </div>
                            <h3 className="font-bold text-navy text-lg">{cat.title}</h3>
                          </div>
                          <div className="space-y-5">
                            {cat.questions.map(q => {
                              const val = answers[catId]?.[q.id];
                              return (
                                <div key={q.id}>
                                  <Label className="text-sm font-semibold text-navy mb-2 block">{q.label}</Label>
                                  {q.type === "select" && (
                                    <select
                                      value={val || ""}
                                      onChange={e => setAnswer(catId, q.id, e.target.value)}
                                      className="flex h-11 w-full max-w-xs rounded-xl border border-input bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
                                    >
                                      <option value="">Select…</option>
                                      {q.options.map(o => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                  )}
                                  {q.type === "multicheck" && (
                                    <MultiCheck options={q.options} selected={val || []} onChange={v => setAnswer(catId, q.id, v)} />
                                  )}
                                  {q.type === "radio" && (
                                    <div className="flex flex-col gap-2 mt-1">
                                      {q.options.map(o => (
                                        <label key={o} className={`flex items-center gap-3 px-4 py-2.5 border rounded-xl cursor-pointer transition-all ${val === o ? "bg-white border-primary" : "border-border bg-white/60 hover:border-primary/40"}`}>
                                          <input type="radio" name={`${catId}_${q.id}`} checked={val === o} onChange={() => setAnswer(catId, q.id, o)} className="accent-primary" />
                                          <span className="text-sm font-medium text-navy">{o}</span>
                                        </label>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-8 flex justify-between">
                    <Button variant="outline" size="lg" className="gap-2" onClick={() => setStep(1)}>
                      <ArrowLeft className="w-4 h-4" /> Back
                    </Button>
                    <Button size="lg" className="px-8 gap-2" onClick={() => setStep(3)}>
                      Next: Your Information <ArrowRight className="w-5 h-5" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* ── Step 3: Contact Info ──────────────────────────────────── */}
              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
                  <h2 className="text-2xl font-bold text-navy mb-1">Your information</h2>
                  <p className="text-muted-foreground mb-6">We'll use this to build your proposal and get in touch.</p>

                  <div className="bg-gray-50 rounded-2xl border p-4 mb-7">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Services selected</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedCats.map(catId => {
                        const cat = CATEGORIES.find(c => c.id === catId)!;
                        const Icon = cat.icon;
                        return (
                          <span key={catId} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${cat.bg} ${cat.color} border ${cat.border}`}>
                            <Icon className="w-3.5 h-3.5" /> {cat.title}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2"><Users className="w-4 h-4 text-muted-foreground" /> Full Name *</Label>
                        <Input required value={contact.name} onChange={e => setContact({ ...contact, name: e.target.value })} placeholder="Jane Smith" />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2"><Mail className="w-4 h-4 text-muted-foreground" /> Work Email *</Label>
                        <Input type="email" required value={contact.email} onChange={e => setContact({ ...contact, email: e.target.value })} placeholder="jane@company.com" />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2"><Building className="w-4 h-4 text-muted-foreground" /> Company *</Label>
                        <Input required value={contact.company} onChange={e => setContact({ ...contact, company: e.target.value })} placeholder="Acme Corp" />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2"><Phone className="w-4 h-4 text-muted-foreground" /> Phone</Label>
                        <Input type="tel" value={contact.phone} onChange={e => setContact({ ...contact, phone: e.target.value })} placeholder="(555) 000-0000" />
                      </div>
                      <div className="space-y-2">
                        <Label>Company Size</Label>
                        <select
                          value={contact.companySize}
                          onChange={e => setContact({ ...contact, companySize: e.target.value as QuoteRequestInputCompanySize })}
                          className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
                        >
                          <option value="1-10">1–10 employees</option>
                          <option value="11-50">11–50 employees</option>
                          <option value="51-200">51–200 employees</option>
                          <option value="200+">200+ employees</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Monthly Budget Range</Label>
                        <select
                          value={contact.budget}
                          onChange={e => setContact({ ...contact, budget: e.target.value })}
                          className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
                        >
                          <option value="">Prefer not to say</option>
                          <option value="Under $1,000 / mo">Under $1,000 / mo</option>
                          <option value="$1,000–$5,000 / mo">$1,000–$5,000 / mo</option>
                          <option value="$5,000–$10,000 / mo">$5,000–$10,000 / mo</option>
                          <option value="$10,000+ / mo">$10,000+ / mo</option>
                          <option value="One-time project">One-time project</option>
                        </select>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>Timeline</Label>
                        <select
                          value={contact.timeline}
                          onChange={e => setContact({ ...contact, timeline: e.target.value })}
                          className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
                        >
                          <option value="">Select a timeline</option>
                          <option value="ASAP (Urgent)">ASAP (Urgent)</option>
                          <option value="Within 30 days">Within 30 days</option>
                          <option value="1–3 months">1–3 months</option>
                          <option value="Just exploring">Just exploring</option>
                        </select>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label className="flex items-center gap-2"><MessageSquare className="w-4 h-4 text-muted-foreground" /> Additional notes or requirements</Label>
                        <Textarea
                          value={contact.details}
                          onChange={e => setContact({ ...contact, details: e.target.value })}
                          className="min-h-[100px]"
                          placeholder="Current setup, pain points, anything else we should know…"
                        />
                      </div>
                    </div>

                    {!isAuthenticated && (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-900">
                        <strong>Want to track your quote?</strong>{" "}
                        <a href="/portal" className="underline font-semibold text-primary">Create a free Client Portal account</a> with this email. Your quote and any proposals will appear there automatically.
                      </div>
                    )}

                    <div className="flex justify-between pt-4 border-t">
                      <Button type="button" variant="outline" size="lg" className="gap-2" onClick={() => setStep(2)}>
                        <ArrowLeft className="w-4 h-4" /> Back
                      </Button>
                      <Button type="submit" size="lg" className="px-10 gap-2 shadow-lg shadow-primary/20" disabled={quoteMutation.isPending}>
                        {quoteMutation.isPending ? (
                          <><span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> Submitting…</>
                        ) : (
                          <><Calculator className="w-5 h-5" /> Submit Quote Request</>
                        )}
                      </Button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
