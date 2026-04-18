import { useEffect, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Check, X, Sparkles, ArrowRight, ChevronDown, MessageSquare, FileText } from "lucide-react";
import { Button, Card, CardContent } from "@/components/ui";
import { SchemaTag } from "@/components/SchemaTag";

interface PricingTier {
  id: number;
  slug: string;
  name: string;
  tagline: string;
  startingPrice: string;
  priceUnit: string;
  pricePrefix: string;
  mostPopular: boolean;
  features: string[];
  excludedFeatures: string[];
  ctaLabel: string;
  ctaLink: string;
  sortOrder: number;
  active: boolean;
}

const FALLBACK_TIERS: PricingTier[] = [
  {
    id: -1, slug: "essentials", name: "Essentials",
    tagline: "Core managed IT for small teams that need reliable coverage.",
    startingPrice: "89", priceUnit: "per user / month", pricePrefix: "Starting at",
    mostPopular: false, sortOrder: 0, active: true,
    ctaLabel: "Get Started", ctaLink: "/quote",
    features: [
      "Business-hours help desk (M–F 8–5)",
      "Remote monitoring & patching",
      "Endpoint antivirus",
      "Microsoft 365 administration",
      "Quarterly health check",
      "Email & phone support",
    ],
    excludedFeatures: [
      "24/7 after-hours support",
      "Endpoint Detection & Response (EDR)",
      "vCIO strategic planning",
      "On-site dispatch included",
    ],
  },
  {
    id: -2, slug: "business", name: "Business",
    tagline: "Full-stack IT, security, and cloud for growing businesses.",
    startingPrice: "149", priceUnit: "per user / month", pricePrefix: "Starting at",
    mostPopular: true, sortOrder: 1, active: true,
    ctaLabel: "Get Started", ctaLink: "/quote",
    features: [
      "Extended-hours help desk (7am–8pm)",
      "Remote monitoring & patching",
      "Endpoint Detection & Response (EDR)",
      "Microsoft 365 + security hardening",
      "Multi-factor authentication rollout",
      "Backup & disaster-recovery monitoring",
      "Quarterly business reviews (vCIO)",
      "On-site dispatch (4 hrs / month)",
    ],
    excludedFeatures: [
      "24/7 after-hours support",
      "Dedicated SOC analyst",
      "Compliance program management",
    ],
  },
  {
    id: -3, slug: "enterprise", name: "Enterprise",
    tagline: "24/7 coverage, compliance, and a named team for complex orgs.",
    startingPrice: "229", priceUnit: "per user / month", pricePrefix: "Starting at",
    mostPopular: false, sortOrder: 2, active: true,
    ctaLabel: "Talk to Sales", ctaLink: "/quote",
    features: [
      "24/7/365 help desk + emergency line",
      "Full EDR + Managed SOC monitoring",
      "Microsoft 365 E3/E5 management",
      "MFA, conditional access, SSO design",
      "Immutable backup + tested restores",
      "Compliance program (HIPAA, SOC 2, CMMC)",
      "Named vCIO + monthly strategy meetings",
      "Unlimited on-site dispatch",
      "Dedicated account team",
    ],
    excludedFeatures: [],
  },
];

const ALL_FEATURES = [
  { key: "Business-hours help desk (M–F 8–5)", in: ["essentials", "business", "enterprise"] },
  { key: "Extended-hours help desk (7am–8pm)", in: ["business", "enterprise"] },
  { key: "24/7/365 help desk + emergency line", in: ["enterprise"] },
  { key: "Remote monitoring & patching", in: ["essentials", "business", "enterprise"] },
  { key: "Endpoint antivirus", in: ["essentials", "business", "enterprise"] },
  { key: "Endpoint Detection & Response (EDR)", in: ["business", "enterprise"] },
  { key: "Managed SOC monitoring", in: ["enterprise"] },
  { key: "Microsoft 365 administration", in: ["essentials", "business", "enterprise"] },
  { key: "MFA / Conditional Access rollout", in: ["business", "enterprise"] },
  { key: "Backup & disaster-recovery monitoring", in: ["business", "enterprise"] },
  { key: "Immutable backup + tested restores", in: ["enterprise"] },
  { key: "Compliance program management", in: ["enterprise"] },
  { key: "Quarterly health check", in: ["essentials"] },
  { key: "Quarterly business reviews (vCIO)", in: ["business", "enterprise"] },
  { key: "Named vCIO + monthly strategy", in: ["enterprise"] },
  { key: "On-site dispatch (4 hrs / month)", in: ["business"] },
  { key: "Unlimited on-site dispatch", in: ["enterprise"] },
  { key: "Dedicated account team", in: ["enterprise"] },
];

export default function Pricing() {
  const [tiers, setTiers] = useState<PricingTier[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [openMobileTier, setOpenMobileTier] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/cms/pricing-tiers")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: PricingTier[]) => {
        setTiers(data && data.length > 0 ? data : FALLBACK_TIERS);
        setLoaded(true);
      })
      .catch(() => {
        setTiers(FALLBACK_TIERS);
        setLoaded(true);
      });
  }, []);

  const showTiers = loaded ? tiers : FALLBACK_TIERS;
  const sorted = [...showTiers].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <SchemaTag
        id="schema-webpage-pricing"
        type="WebPage"
        name="Pricing — Siebert Services Managed IT"
        description="Transparent monthly pricing for managed IT, cybersecurity, and cloud services. Three tiers — Essentials, Business, and Enterprise — with starting-at pricing and a clear feature comparison."
      />

      {/* HERO */}
      <section className="relative pt-32 pb-16 lg:pt-40 lg:pb-20 bg-navy overflow-hidden border-b-4 border-primary">
        <div className="absolute inset-0 opacity-[0.06] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:24px_24px]" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/15 border border-primary/30 text-primary font-bold text-xs uppercase tracking-wider mb-6">
              <Sparkles className="w-4 h-4" /> Transparent pricing
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold text-white leading-[1.05] mb-5 tracking-tight">
              Real prices. <span className="text-gradient">No mystery quotes.</span>
            </h1>
            <p className="text-lg text-white/80 leading-relaxed max-w-2xl mx-auto">
              Most MSPs hide pricing until they get you on a call. We don't. Here's what
              our managed IT plans actually cost — pick a tier or talk to us about a
              custom build.
            </p>
            <p className="text-white/50 text-sm mt-4">
              Pricing is a starting point. Final quote depends on user count, devices,
              and any one-time onboarding work.
            </p>
          </motion.div>
        </div>
      </section>

      {/* TIER CARDS */}
      <section className="py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
            {sorted.map((tier, idx) => (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className={tier.mostPopular ? "md:-translate-y-3" : ""}
              >
                <Card
                  className={
                    "h-full flex flex-col relative " +
                    (tier.mostPopular
                      ? "border-2 border-primary shadow-2xl shadow-primary/20 ring-1 ring-primary/20"
                      : "border border-border/60")
                  }
                >
                  {tier.mostPopular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-primary/30">
                        <Sparkles className="w-3.5 h-3.5" /> Most Popular
                      </div>
                    </div>
                  )}
                  <CardContent className="p-7 lg:p-8 flex-1 flex flex-col">
                    <div className="mb-5">
                      <h3 className="text-2xl font-display font-extrabold text-navy mb-1">
                        {tier.name}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-snug min-h-[2.5em]">
                        {tier.tagline}
                      </p>
                    </div>

                    <div className="mb-6 pb-6 border-b border-border/50">
                      <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                        {tier.pricePrefix}
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-display font-extrabold text-navy">
                          ${tier.startingPrice}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {tier.priceUnit}
                      </div>
                    </div>

                    <ul className="space-y-2.5 flex-1 mb-7">
                      {tier.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5 text-sm text-navy-light">
                          <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                          <span className="leading-snug">{f}</span>
                        </li>
                      ))}
                      {tier.excludedFeatures.map((f) => (
                        <li key={f} className="flex items-start gap-2.5 text-sm text-muted-foreground/70">
                          <X className="w-4 h-4 text-muted-foreground/40 mt-0.5 shrink-0" />
                          <span className="leading-snug line-through decoration-muted-foreground/30">{f}</span>
                        </li>
                      ))}
                    </ul>

                    <Link href={tier.ctaLink || "/quote"}>
                      <Button
                        size="lg"
                        variant={tier.mostPopular ? "default" : "outline"}
                        className="w-full justify-center gap-2"
                      >
                        {tier.ctaLabel || "Get Started"} <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPARISON TABLE (desktop) / ACCORDION (mobile) */}
      <section className="py-20 bg-gray-50/60 border-y border-border/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-navy mb-3">
              Compare plans, feature by feature
            </h2>
            <p className="text-muted-foreground">
              We show what's <em>not</em> included on each plan, too — so there are no
              surprises after you sign.
            </p>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-2xl border border-border/60 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-navy text-white">
                  <th className="text-left px-6 py-4 text-sm font-bold">Feature</th>
                  {sorted.map((t) => (
                    <th key={t.id} className="text-center px-4 py-4 text-sm font-bold">
                      {t.name}
                      {t.mostPopular && (
                        <div className="text-[10px] uppercase tracking-wider text-primary mt-0.5">Most Popular</div>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ALL_FEATURES.map((row, i) => (
                  <tr key={row.key} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/40"}>
                    <td className="px-6 py-3.5 text-sm text-navy font-medium">{row.key}</td>
                    {sorted.map((t) => {
                      const included = row.in.includes(t.slug);
                      return (
                        <td key={t.id} className="px-4 py-3.5 text-center">
                          {included ? (
                            <Check className="w-5 h-5 text-primary inline" />
                          ) : (
                            <X className="w-4 h-4 text-muted-foreground/40 inline" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile accordion */}
          <div className="md:hidden space-y-3">
            {sorted.map((tier) => {
              const isOpen = openMobileTier === tier.slug;
              return (
                <div key={tier.id} className="bg-white rounded-2xl border border-border/60 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenMobileTier(isOpen ? null : tier.slug)}
                    className="w-full px-5 py-4 flex items-center justify-between text-left"
                  >
                    <div>
                      <div className="font-bold text-navy">{tier.name}</div>
                      {tier.mostPopular && (
                        <div className="text-[10px] uppercase tracking-wider text-primary font-bold mt-0.5">
                          Most Popular
                        </div>
                      )}
                    </div>
                    <ChevronDown className={`w-5 h-5 text-primary transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 border-t border-border/60 pt-4">
                      <ul className="space-y-2">
                        {ALL_FEATURES.map((row) => {
                          const included = row.in.includes(tier.slug);
                          return (
                            <li key={row.key} className="flex items-start gap-2.5 text-sm">
                              {included ? (
                                <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                              ) : (
                                <X className="w-4 h-4 text-muted-foreground/40 mt-0.5 shrink-0" />
                              )}
                              <span className={included ? "text-navy-light" : "text-muted-foreground/70"}>
                                {row.key}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CUSTOM QUOTE SECTION */}
      <section className="py-20 lg:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-navy rounded-3xl overflow-hidden border-4 border-primary/20 shadow-2xl">
            <div className="grid md:grid-cols-2 gap-8 items-center p-8 lg:p-12">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/15 text-primary font-bold text-xs uppercase tracking-wider mb-4">
                  <MessageSquare className="w-3.5 h-3.5" /> Custom build
                </div>
                <h2 className="text-3xl md:text-4xl font-display font-extrabold text-white mb-4 leading-tight">
                  None of these fit?
                  <br />
                  <span className="text-gradient">Get a 24-hour quote.</span>
                </h2>
                <p className="text-white/80 leading-relaxed mb-6">
                  Multi-site rollouts, regulated industries, hybrid co-managed setups,
                  procurement-only engagements — we build custom plans every week.
                  Tell us what you need and we'll send a written quote within one
                  business day.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/quote">
                    <Button size="lg" className="w-full sm:w-auto gap-2">
                      <FileText className="w-4 h-4" /> Build a custom quote
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white/0 border-white/30 text-white hover:bg-white/10 hover:text-white hover:border-white/50">
                      Talk to a human
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="hidden md:block">
                <ul className="space-y-3 text-white/85">
                  {[
                    "Multi-site / multi-state rollouts",
                    "Regulated industries (HIPAA, SOC 2, CMMC, GLBA)",
                    "Co-managed alongside an internal IT team",
                    "Procurement-only or project-only engagements",
                    "Custom SLAs and white-glove support",
                  ].map((line) => (
                    <li key={line} className="flex items-start gap-2.5">
                      <Check className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
