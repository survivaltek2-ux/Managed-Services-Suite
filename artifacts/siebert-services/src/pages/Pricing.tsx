import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Check, X, Sparkles, ArrowRight, ChevronDown, MessageSquare, FileText, Download, Building2, Laptop, ShieldCheck, Cloud, Mail, Wifi, HardDrive, User } from "lucide-react";
import { Button, Card, CardContent } from "@/components/ui";
import { SchemaTag } from "@/components/SchemaTag";

interface CmsService {
  id: number;
  title: string;
  description: string;
  icon: string;
  category: string;
  features: string[];
}

const CONSUMER_SERVICE_ICONS: Record<string, React.ElementType> = {
  Laptop,
  ShieldCheck,
  Cloud,
  Mail,
  Wifi,
  HardDrive,
  User,
};

interface PricingTier {
  id: number;
  slug: string;
  name: string;
  tagline: string;
  startingPrice: string;
  annualPrice?: string;
  annualPriceLabel?: string;
  priceUnit: string;
  pricePrefix: string;
  mostPopular: boolean;
  features: string[];
  excludedFeatures: string[];
  ctaLabel: string;
  ctaLink: string;
  sortOrder: number;
  active: boolean;
  autoActivate?: boolean;
}

const FALLBACK_TIERS: PricingTier[] = [
  {
    id: -4, slug: "consumer", name: "Consumer",
    tagline: "Essential remote IT support for individuals and very small home-office setups.",
    startingPrice: "49", annualPrice: "42", annualPriceLabel: "42", priceUnit: "per user / month", pricePrefix: "Starting at",
    mostPopular: false, sortOrder: -1, active: true, autoActivate: true,
    ctaLabel: "Get Started", ctaLink: "/quote",
    features: [
      "Personal Device Support (PCs, Macs & laptops)",
      "Home Office Security & antivirus",
      "Personal Cloud & Backup (OneDrive, Google Drive)",
      "Microsoft 365 Personal setup & support",
      "Remote monitoring & automatic software updates",
      "Email & phone support (M–F 8–5)",
    ],
    excludedFeatures: [
      "24/7 after-hours support",
      "Endpoint Detection & Response (EDR)",
      "vCIO strategic planning",
      "On-site dispatch",
      "Quarterly business reviews",
    ],
  },
  {
    id: -1, slug: "essentials", name: "Essentials",
    tagline: "Core managed IT for small teams that need reliable coverage.",
    startingPrice: "89", annualPrice: "76", annualPriceLabel: "76", priceUnit: "per user / month", pricePrefix: "Starting at",
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
      "On-site dispatch included (New York only)",
    ],
  },
  {
    id: -2, slug: "business", name: "Business",
    tagline: "Full-stack IT, security, and cloud for growing businesses.",
    startingPrice: "149", annualPrice: "127", annualPriceLabel: "127", priceUnit: "per user / month", pricePrefix: "Starting at",
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
      "On-site dispatch (4 hrs / month, New York only)",
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
    startingPrice: "229", annualPrice: "195", annualPriceLabel: "195", priceUnit: "per user / month", pricePrefix: "Starting at",
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
      "Unlimited on-site dispatch (New York only)",
      "Dedicated account team",
    ],
    excludedFeatures: [],
  },
];


type BillingCycle = "monthly" | "annual";
type CustomerType = "business" | "consumer";
const BILLING_STORAGE_KEY = "pricing_billing_cycle";

export default function Pricing() {
  const [tiers, setTiers] = useState<PricingTier[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [consumerServices, setConsumerServices] = useState<CmsService[]>([]);
  const [openMobileTier, setOpenMobileTier] = useState<string | null>(null);
  const [billing, setBilling] = useState<BillingCycle>("monthly");
  const [customerType, setCustomerType] = useState<CustomerType>("business");
  const [, setLocation] = useLocation();
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [seatCounts, setSeatCounts] = useState<Record<string, number>>({
    consumer: 1,
    essentials: 3,
    business: 3,
    enterprise: 3,
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(BILLING_STORAGE_KEY);
      if (saved === "annual" || saved === "monthly") setBilling(saved);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    try { localStorage.setItem(BILLING_STORAGE_KEY, billing); } catch { /* ignore */ }
  }, [billing]);

  const priceFor = (tier: PricingTier): { price: string; hasDiscount: boolean; original: string } => {
    const monthly = tier.startingPrice;
    const annualRaw = (tier.annualPriceLabel ?? tier.annualPrice ?? "").trim();
    const annualNum = Number(annualRaw);
    const monthlyNum = Number(monthly);
    const validAnnual =
      annualRaw !== "" && Number.isFinite(annualNum) && annualNum > 0 && annualNum < monthlyNum;
    if (billing === "annual" && validAnnual) {
      return { price: annualRaw, hasDiscount: true, original: monthly };
    }
    return { price: monthly, hasDiscount: false, original: monthly };
  };

  const getUnitPrice = (tier: PricingTier): number => {
    if (billing === "annual") {
      const annual = Number((tier.annualPriceLabel ?? tier.annualPrice ?? "").trim());
      if (Number.isFinite(annual) && annual > 0) return annual;
    }
    return Number(tier.startingPrice) || 0;
  };

  const formatTotal = (value: number): string =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

  const handleTierCta = async (tier: PricingTier) => {
    const slug = (tier.slug || "").toLowerCase();
    const isConsumer = slug === "consumer";
    const seatQuantity = isConsumer
      ? 1
      : Math.max(3, Math.min(500, seatCounts[slug] || 3));
    window.dataLayer?.push({
      event: "pricing_cta_click",
      tier_slug: slug,
      tier_name: tier.name,
      cta_label: tier.ctaLabel || "Get Started",
    });
    window.dispatchEvent(new CustomEvent("pricing_cta_click", {
      detail: { tierSlug: slug, tierName: tier.name, ctaLabel: tier.ctaLabel },
    }));

    if (slug === "enterprise") {
      setLocation("/contact?plan=enterprise");
      return;
    }

    setCheckoutLoading(slug);
    try {
      const res = await fetch(`/api/checkout/${encodeURIComponent(slug)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billingCycle: billing, seatQuantity, customerType }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else if (data.error === "stripe_not_configured" || data.error === "tier_not_found") {
        const baseLink = tier.ctaLink || "/quote";
        const sep = baseLink.includes("?") ? "&" : "?";
        setLocation(`${baseLink}${sep}tier=${encodeURIComponent(slug)}`);
      } else {
        const baseLink = tier.ctaLink || "/quote";
        const sep = baseLink.includes("?") ? "&" : "?";
        setLocation(`${baseLink}${sep}tier=${encodeURIComponent(slug)}`);
      }
    } catch {
      const baseLink = tier.ctaLink || "/quote";
      const sep = baseLink.includes("?") ? "&" : "?";
      setLocation(`${baseLink}${sep}tier=${encodeURIComponent(slug)}`);
    } finally {
      setCheckoutLoading(null);
    }
  };

  useEffect(() => {
    Promise.all([
      fetch("/api/cms/pricing-tiers").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/cms/services").then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([tiersData, servicesData]: [PricingTier[], any[]]) => {
        setTiers(tiersData && tiersData.length > 0 ? tiersData : FALLBACK_TIERS);
        const consumer = (servicesData || []).filter((s: any) => s.category === "consumer");
        setConsumerServices(
          consumer.map((s: any) => ({
            ...s,
            features: Array.isArray(s.features) ? s.features : JSON.parse(s.features || "[]"),
          }))
        );
        setLoaded(true);
      })
      .catch(() => {
        setTiers(FALLBACK_TIERS);
        setLoaded(true);
      });
  }, []);

  const sorted = useMemo(
    () => [...(loaded ? tiers : FALLBACK_TIERS)].sort((a, b) => a.sortOrder - b.sortOrder),
    [tiers, loaded]
  );

  const filteredTiers = useMemo(
    () =>
      customerType === "consumer"
        ? sorted.filter((t) => t.slug === "consumer")
        : sorted.filter((t) => t.slug !== "consumer"),
    [sorted, customerType]
  );

  const dynamicFeatures = useMemo(() => {
    const seen = new Set<string>();
    const rows: { key: string; in: string[] }[] = [];
    for (const tier of filteredTiers) {
      for (const f of [...tier.features, ...tier.excludedFeatures]) {
        if (!seen.has(f)) {
          seen.add(f);
          rows.push({
            key: f,
            in: filteredTiers.filter((t) => t.features.includes(f)).map((t) => t.slug),
          });
        }
      }
    }
    return rows;
  }, [filteredTiers]);

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

          {/* Customer type selector */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex flex-col items-center gap-3">
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Who is this for?</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setCustomerType("business")}
                  data-testid="customer-type-business"
                  className={
                    "flex items-center gap-3 px-5 py-3.5 rounded-xl border-2 text-sm font-semibold transition-all " +
                    (customerType === "business"
                      ? "border-primary bg-primary/5 text-navy shadow-sm"
                      : "border-border/60 text-muted-foreground hover:border-primary/40 hover:text-navy")
                  }
                >
                  <Building2 className={`w-5 h-5 shrink-0 ${customerType === "business" ? "text-primary" : "text-muted-foreground"}`} />
                  <div className="text-left">
                    <div className="font-bold">Business</div>
                    <div className="text-xs font-normal text-muted-foreground leading-tight">Company or organization</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setCustomerType("consumer")}
                  data-testid="customer-type-consumer"
                  className={
                    "flex items-center gap-3 px-5 py-3.5 rounded-xl border-2 text-sm font-semibold transition-all " +
                    (customerType === "consumer"
                      ? "border-teal-500 bg-teal-50 text-teal-900 shadow-sm"
                      : "border-border/60 text-muted-foreground hover:border-teal-400/40 hover:text-navy")
                  }
                >
                  <User className={`w-5 h-5 shrink-0 ${customerType === "consumer" ? "text-teal-600" : "text-muted-foreground"}`} />
                  <div className="text-left">
                    <div className="font-bold">Individual</div>
                    <div className="text-xs font-normal text-muted-foreground leading-tight">Personal / home use</div>
                  </div>
                </button>
              </div>
              {customerType === "consumer" && (
                <p className="text-xs text-teal-700 bg-teal-50 border border-teal-200 rounded-lg px-3 py-2 max-w-sm text-center">
                  Your contract will use plain, consumer-friendly language with a 3-day cooling-off period.
                </p>
              )}
            </div>
          </div>

          {/* Billing toggle */}
          <div className="flex justify-center mb-10">
            <div
              role="tablist"
              aria-label="Billing cycle"
              className="inline-flex items-center bg-gray-100 rounded-full p-1 border border-border/60"
            >
              <button
                type="button"
                role="tab"
                aria-selected={billing === "monthly"}
                onClick={() => setBilling("monthly")}
                data-testid="billing-toggle-monthly"
                className={
                  "px-5 py-2 rounded-full text-sm font-semibold transition-colors " +
                  (billing === "monthly"
                    ? "bg-white text-navy shadow-sm"
                    : "text-muted-foreground hover:text-navy")
                }
              >
                Monthly
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={billing === "annual"}
                onClick={() => setBilling("annual")}
                data-testid="billing-toggle-annual"
                className={
                  "px-5 py-2 rounded-full text-sm font-semibold transition-colors inline-flex items-center gap-2 " +
                  (billing === "annual"
                    ? "bg-white text-navy shadow-sm"
                    : "text-muted-foreground hover:text-navy")
                }
              >
                Annual
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-bold uppercase tracking-wider">
                  Save ~15%
                </span>
              </button>
            </div>
          </div>

          <div className={`grid grid-cols-1 gap-6 lg:gap-8 items-stretch ${filteredTiers.length === 1 ? "max-w-sm mx-auto" : "md:grid-cols-3"}`}>
            {filteredTiers.map((tier, idx) => (
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

                    {(() => {
                      const p = priceFor(tier);
                      return (
                        <div className="mb-6 pb-6 border-b border-border/50">
                          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                            {tier.pricePrefix}
                          </div>
                          <div className="flex items-baseline gap-2 flex-wrap">
                            <span
                              className="text-4xl font-display font-extrabold text-navy"
                              data-testid={`price-${tier.slug}`}
                            >
                              ${p.price}
                            </span>
                            {p.hasDiscount && (
                              <span className="text-lg text-muted-foreground line-through decoration-muted-foreground/50">
                                ${p.original}
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {tier.priceUnit}
                            {p.hasDiscount && (
                              <span className="ml-1 text-primary font-semibold">· billed annually</span>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                    {tier.slug === "consumer" ? (
                      <div className="mb-6">
                        <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 text-sm text-navy-light">
                          <div className="flex items-center justify-between gap-4">
                            <span>Flat per-user plan — 1 user</span>
                            <span className="font-semibold text-navy">
                              {formatTotal(getUnitPrice(tier))}
                            </span>
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            per user / month · for individuals &amp; home offices
                          </div>
                        </div>
                      </div>
                    ) : (
                    <label className="block mb-6">
                      <span className="block text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                        Seats ({seatCounts[tier.slug] ?? 3})
                      </span>
                      <input
                        type="range"
                        min={3}
                        max={500}
                        step={1}
                        value={seatCounts[tier.slug] ?? 3}
                        onChange={(e) =>
                          setSeatCounts((current) => ({
                            ...current,
                            [tier.slug]: Math.max(3, Math.min(500, parseInt(e.target.value || "3", 10) || 3)),
                          }))
                        }
                        className="w-full mb-3 accent-primary"
                        aria-label={`${tier.name} seat slider`}
                        data-testid={`seat-slider-${tier.slug}`}
                      />
                      <input
                        type="number"
                        min={3}
                        max={500}
                        step={1}
                        value={seatCounts[tier.slug] ?? 3}
                        onChange={(e) =>
                          setSeatCounts((current) => ({
                            ...current,
                            [tier.slug]: Math.max(3, Math.min(500, parseInt(e.target.value || "3", 10) || 3)),
                          }))
                        }
                        className="w-full rounded-xl border border-border/60 px-4 py-3 text-navy bg-white"
                        aria-label={`${tier.name} seats`}
                        data-testid={`seat-count-${tier.slug}`}
                      />
                      <div className="mt-3 rounded-xl bg-gray-50 border border-border/60 px-4 py-3 text-sm text-navy-light">
                        <div className="flex items-center justify-between gap-4">
                          <span>Estimated total</span>
                          <span className="font-semibold text-navy">
                            {formatTotal(getUnitPrice(tier) * (seatCounts[tier.slug] ?? 3))}
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {tier.priceUnit}
                        </div>
                      </div>
                    </label>
                    )}

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

                    <Button
                      size="lg"
                      variant={tier.mostPopular ? "default" : "outline"}
                      className="w-full justify-center gap-2"
                      onClick={() => handleTierCta(tier)}
                      data-testid={`pricing-cta-${tier.slug}`}
                      disabled={checkoutLoading === tier.slug}
                    >
                      {checkoutLoading === tier.slug ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Redirecting...
                        </>
                      ) : (
                        <>{tier.ctaLabel || "Get Started"} <ArrowRight className="w-4 h-4" /></>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CONSUMER SERVICES SPOTLIGHT */}
      {consumerServices.length > 0 && sorted.some((t) => t.slug === "consumer") && (
        <section className="py-16 lg:py-20 bg-gradient-to-b from-sky-50/60 to-white border-b border-border/60">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-100 border border-sky-200 text-sky-700 font-bold text-xs uppercase tracking-wider mb-4">
                <User className="w-3.5 h-3.5" /> Built for home &amp; personal use
              </div>
              <h2 className="text-2xl md:text-3xl font-display font-bold text-navy mb-3">
                What the Consumer plan covers
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                The Consumer plan includes four core services designed for individuals and home offices — no business jargon, no enterprise overhead.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {consumerServices.map((svc, idx) => {
                const Icon = CONSUMER_SERVICE_ICONS[svc.icon] || Laptop;
                return (
                  <motion.div
                    key={svc.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: idx * 0.07 }}
                  >
                    <Card className="h-full border border-sky-100 hover:border-sky-200 hover:shadow-md transition-all bg-white">
                      <CardContent className="p-5 flex flex-col gap-3 h-full">
                        <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center shrink-0">
                          <Icon className="w-5 h-5 text-sky-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-navy text-sm leading-snug mb-1">{svc.title}</h3>
                          <p className="text-xs text-muted-foreground leading-relaxed">{svc.description}</p>
                        </div>
                        <ul className="mt-auto space-y-1.5 pt-2 border-t border-border/40">
                          {svc.features.slice(0, 3).map((f) => (
                            <li key={f} className="flex items-start gap-1.5 text-xs text-navy-light">
                              <Check className="w-3.5 h-3.5 text-sky-500 mt-0.5 shrink-0" />
                              <span>{f}</span>
                            </li>
                          ))}
                          {svc.features.length > 3 && (
                            <li className="text-xs text-muted-foreground pl-5">+{svc.features.length - 3} more</li>
                          )}
                        </ul>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
            <p className="text-center text-xs text-muted-foreground mt-6">
              All services are delivered remotely. On-site dispatch is not included in the Consumer plan.
            </p>
          </div>
        </section>
      )}

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
                  {filteredTiers.map((t) => (
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
                {dynamicFeatures.map((row, i) => (
                  <tr key={row.key} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/40"}>
                    <td className="px-6 py-3.5 text-sm text-navy font-medium">{row.key}</td>
                    {filteredTiers.map((t) => {
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
            {filteredTiers.map((tier) => {
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
                        {dynamicFeatures.map((row) => {
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
                <div className="mt-5 pt-5 border-t border-white/10">
                  <a
                    href={`${import.meta.env.BASE_URL}siebert-msa-template.pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    data-testid="link-download-msa-template"
                    className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-primary transition-colors group"
                  >
                    <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                    <span className="underline-offset-4 group-hover:underline">
                      Download our Managed Services Agreement (PDF)
                    </span>
                  </a>
                  <p className="text-xs text-white/50 mt-1.5">
                    Review the exact agreement our clients sign — no email required.
                  </p>
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
