import { Link } from "wouter";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui";
import { LeadMagnetForm, LEAD_MAGNETS, type LeadMagnet } from "@/components/leadMagnets";

interface Props {
  magnet: LeadMagnet;
  highlights: string[];
  whoFor: string;
}

export function GatedDownloadLanding({ magnet, highlights, whoFor }: Props) {
  const Icon = magnet.icon;
  return (
    <div className="min-h-screen pt-28 pb-20 bg-gradient-to-b from-gray-50 via-white to-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">

          {/* Left: pitch */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-3">
            <div className={`inline-flex items-center gap-2 px-3 py-1 ${magnet.bg} ${magnet.color} rounded-full text-xs font-bold uppercase tracking-wider mb-4`}>
              <Icon className="w-3.5 h-3.5" /> Free PDF · No credit card
            </div>
            <h1 className="text-3xl md:text-5xl font-display font-bold text-navy mb-4 leading-tight">
              {magnet.title}
            </h1>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              {magnet.description}
            </p>

            <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-3">
              What's inside
            </p>
            <ul className="space-y-2.5 mb-8">
              {highlights.map(h => (
                <li key={h} className="flex gap-2.5 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                  <span className="text-foreground">{h}</span>
                </li>
              ))}
            </ul>

            <div className="rounded-xl border bg-white p-5 text-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-primary mb-1">Who it's for</p>
              <p className="text-muted-foreground">{whoFor}</p>
            </div>
          </motion.div>

          {/* Right: form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 lg:sticky lg:top-28"
          >
            <Card className="border-none shadow-2xl">
              <CardContent className="p-6 md:p-8">
                <h2 className="text-xl font-display font-bold text-navy mb-1">Get the PDF</h2>
                <p className="text-sm text-muted-foreground mb-5">Delivered to your inbox in under 60 seconds.</p>
                <LeadMagnetForm magnet={magnet} source={`landing_${magnet.slug}`} />
              </CardContent>
            </Card>

            <p className="text-center text-xs text-muted-foreground mt-4">
              <Link href="/contact" className="hover:underline">Prefer to talk? Contact our team <ArrowRight className="inline w-3 h-3" /></Link>
            </p>
          </motion.div>

        </div>
      </div>
    </div>
  );
}

export function HipaaChecklistPage() {
  const magnet = LEAD_MAGNETS["hipaa-checklist"];
  return (
    <GatedDownloadLanding
      magnet={magnet}
      whoFor="Medical practices, dental offices, behavioral health clinics, and any covered entity or business associate handling PHI."
      highlights={[
        "Complete HIPAA Security Rule safeguards mapped to controls",
        "Administrative, physical, and technical safeguards (164.308–312)",
        "Documentation requirements and retention timelines",
        "Workforce training and sanction-policy requirements",
        "Risk analysis and risk management worksheet templates",
        "Breach notification readiness checklist",
        "Bonus: BAA (Business Associate Agreement) review checklist",
      ]}
    />
  );
}

export function BuyersGuidePage() {
  const magnet = LEAD_MAGNETS["buyers-guide"];
  return (
    <GatedDownloadLanding
      magnet={magnet}
      whoFor="Business owners, IT directors, and operations leaders evaluating a managed service provider — whether you're switching from in-house IT or replacing an under-performing MSP."
      highlights={[
        "10 questions that separate strategic MSPs from break-fix shops",
        "Red flags to watch for in pricing and SLAs",
        "What a real response-time SLA looks like (with examples)",
        "How to evaluate cybersecurity stacks (EDR, MDR, SOC)",
        "Onboarding-process benchmarks and what to demand",
        "Sample scoring rubric to compare 3–5 MSPs side-by-side",
        "Bonus: questions for current customers / references",
      ]}
    />
  );
}
