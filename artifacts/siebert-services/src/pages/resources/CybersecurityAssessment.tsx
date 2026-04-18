import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Shield, CheckCircle2, ArrowRight, ArrowLeft, Clock } from "lucide-react";
import { Card, CardContent, Button } from "@/components/ui";
import { LeadMagnetForm, LEAD_MAGNETS } from "@/components/leadMagnets";

const QUESTIONS: { id: string; label: string; help?: string }[] = [
  { id: "backups", label: "Do you have automated, off-site backups that are regularly tested?" },
  { id: "mfa", label: "Is multi-factor authentication (MFA) enforced on email, VPN, and admin accounts?" },
  { id: "training", label: "Do all employees go through phishing training and simulations at least quarterly?" },
  { id: "edr", label: "Are all endpoints protected by EDR/MDR (not just legacy antivirus)?" },
  { id: "patching", label: "Are operating systems and third-party apps patched on an automated schedule?" },
  { id: "response_plan", label: "Do you have a documented and tested incident response plan?" },
  { id: "vendor_review", label: "Do you review the security posture of your vendors / SaaS providers annually?" },
];

const OPTIONS: { value: string; label: string }[] = [
  { value: "yes", label: "Yes" },
  { value: "partial", label: "Partial" },
  { value: "no", label: "No" },
  { value: "unsure", label: "Not sure" },
];

export default function CybersecurityAssessment() {
  const magnet = LEAD_MAGNETS["cybersecurity-assessment"];
  const [step, setStep] = useState<"intro" | "quiz" | "form">("intro");
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const allAnswered = QUESTIONS.every(q => answers[q.id]);

  return (
    <div className="min-h-screen pt-28 pb-20 bg-gradient-to-b from-red-50/40 via-white to-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {step === "intro" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                <Shield className="w-3.5 h-3.5" /> Free resource
              </div>
              <h1 className="text-3xl md:text-5xl font-display font-bold text-navy mb-4 leading-tight">
                {magnet.title}
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                Answer 7 questions about how your business handles email, endpoints, backups, and access — and we'll email you a tailored security score with the highest-impact fixes.
              </p>
            </div>

            <Card className="border-none shadow-xl">
              <CardContent className="p-6 md:p-8">
                <div className="grid sm:grid-cols-3 gap-4 mb-6">
                  {[
                    { num: "2 min", label: "to complete" },
                    { num: "7", label: "quick questions" },
                    { num: "100%", label: "free, no spam" },
                  ].map(s => (
                    <div key={s.label} className="text-center p-4 bg-gray-50 rounded-xl">
                      <p className="text-2xl font-bold text-navy">{s.num}</p>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
                <ul className="space-y-2 mb-6 text-sm">
                  {[
                    "Get a posture score (0–100) with risk band",
                    "Get the top 3–5 fixes prioritized for your business",
                    "Optional 30-min consult with a security specialist",
                  ].map(l => (
                    <li key={l} className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" /> {l}</li>
                  ))}
                </ul>
                <Button size="lg" className="w-full gap-2" onClick={() => setStep("quiz")}>
                  Start the assessment <ArrowRight className="w-5 h-5" />
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-3">
                  <Clock className="inline w-3 h-3 mr-1" /> Takes about 2 minutes
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === "quiz" && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-navy mb-2">Quick security check</h1>
            <p className="text-muted-foreground mb-6">Answer honestly — your responses stay private.</p>

            <Card className="border-none shadow-xl">
              <CardContent className="p-6 md:p-8 space-y-6">
                {QUESTIONS.map((q, idx) => (
                  <div key={q.id} className="border-b last:border-b-0 pb-5 last:pb-0">
                    <p className="font-semibold text-navy text-sm mb-3">
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-navy text-white rounded-full text-xs mr-2">{idx + 1}</span>
                      {q.label}
                    </p>
                    <div className="flex flex-wrap gap-2 ml-8">
                      {OPTIONS.map(o => {
                        const selected = answers[q.id] === o.value;
                        return (
                          <button
                            key={o.value}
                            type="button"
                            onClick={() => setAnswers({ ...answers, [q.id]: o.value })}
                            className={`px-4 py-2 text-sm rounded-lg border font-medium transition-all ${
                              selected ? "bg-primary text-white border-primary" : "border-border bg-white text-foreground hover:border-primary/50"
                            }`}
                          >
                            {o.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="flex justify-between mt-6">
              <Button variant="outline" size="lg" className="gap-2" onClick={() => setStep("intro")}>
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
              <Button
                size="lg"
                className="gap-2"
                disabled={!allAnswered}
                onClick={() => setStep("form")}
              >
                See my results <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        )}

        {step === "form" && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-green-100 text-green-700 rounded-full mb-3">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-navy mb-2">Where should we send your report?</h1>
              <p className="text-muted-foreground">We'll email your tailored score and top fixes within minutes.</p>
            </div>
            <Card className="border-none shadow-xl">
              <CardContent className="p-6 md:p-8">
                <LeadMagnetForm
                  magnet={magnet}
                  payload={answers}
                  source="cybersecurity_assessment_quiz"
                  cta="Email me my report"
                />
              </CardContent>
            </Card>

            <p className="text-center text-sm text-muted-foreground mt-6">
              <Link href="/services/cybersecurity" className="text-primary font-semibold hover:underline">
                Read about our cybersecurity services →
              </Link>
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
