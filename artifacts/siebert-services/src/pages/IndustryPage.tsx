import { useEffect, useState } from "react";
import { Link, useRoute } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Layers,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";
import { Button, Card, CardContent } from "@/components/ui";
import { SchemaTag } from "@/components/SchemaTag";
import { BookingButton } from "@/components/Booking";
import { TestimonialsSection, CaseStudyCard, type CaseStudy } from "@/components/trust";
import { LeadMagnetCTA, LEAD_MAGNETS } from "@/components/leadMagnets";
import { getIndustry, industries as staticIndustries, type Industry } from "@/data/industries";
import NotFound from "./not-found";

export default function IndustryPage() {
  const [, params] = useRoute<{ slug: string }>("/industries/:slug");
  const slug = params?.slug ?? "";

  const [allIndustries, setAllIndustries] = useState<Industry[]>(staticIndustries);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/cms/industries")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: Industry[] | null) => {
        if (cancelled) return;
        if (Array.isArray(d) && d.length > 0) setAllIndustries(d);
        setLoaded(true);
      })
      .catch(() => !cancelled && setLoaded(true));
    return () => {
      cancelled = true;
    };
  }, []);

  const industry = loaded
    ? allIndustries.find((i) => i.slug === slug)
    : (allIndustries.find((i) => i.slug === slug) ?? getIndustry(slug));

  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  useEffect(() => {
    if (!industry) return;
    fetch("/api/cms/case-studies")
      .then((r) => (r.ok ? r.json() : []))
      .then((d: CaseStudy[]) => {
        const matched = d.filter((c) =>
          (c.industry || "").toLowerCase().includes(industry.name.toLowerCase())
        );
        setCaseStudies(matched.slice(0, 2));
      })
      .catch(() => setCaseStudies([]));
  }, [industry]);

  if (!industry) {
    if (!loaded) return null;
    return <NotFound />;
  }

  const url = `https://siebertservices.com/industries/${industry.slug}`;
  const otherIndustries = allIndustries.filter((i) => i.slug !== industry.slug);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <SchemaTag
        id={`schema-industry-${industry.slug}`}
        type="WebPage"
        name={`${industry.navTitle} — Siebert Services`}
        description={industry.metaDescription}
      />
      <SchemaTag
        id={`schema-industry-breadcrumb-${industry.slug}`}
        type="BreadcrumbList"
        crumbs={[
          { name: "Home", url: "https://siebertservices.com/" },
          { name: "Industries", url: "https://siebertservices.com/industries" },
          { name: industry.name, url },
        ]}
      />

      {/* HERO */}
      <section className="relative pt-28 pb-16 lg:pt-32 lg:pb-20 bg-navy text-white border-b-4 border-primary overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_30%_20%,white,transparent_60%)]" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/industries"
            className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> All industries
          </Link>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-4">
            {industry.hero.eyebrow}
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight mb-6">
            {industry.hero.title}
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-3xl mb-10">
            {industry.hero.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/quote">
              <Button size="lg" className="w-full sm:w-auto">
                {industry.ctaLabel}
              </Button>
            </Link>
            <BookingButton
              size="lg"
              variant="outline"
              className="w-full sm:w-auto bg-transparent border-white/30 text-white hover:bg-white/10"
              label="Book a 15-min discovery call"
            />
          </div>
        </div>
      </section>

      {/* PAIN POINTS */}
      <section className="py-20 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3">
              What we hear most
            </p>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-navy">
              The IT problems {industry.name.toLowerCase()} leaders bring to us
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {industry.painPoints.map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="h-full border-none shadow-md bg-white">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-navy mb-2">{p.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {p.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT WE DO */}
      <section className="py-20 bg-primary/5 border-y border-primary/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3">
              How we help
            </p>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-navy mb-6">
              A managed stack tuned for {industry.shortLabel.toLowerCase()}.
            </h2>
            <p className="text-lg text-muted-foreground">
              We pair vendor-grade products with our own managed services so every control
              has someone behind it. One partner, one invoice, one number to call when the
              schedule, the line, or the deal is on the clock.
            </p>
          </div>
          <ul className="space-y-4">
            {industry.whatWeDo.map((item, i) => (
              <li key={i} className="flex gap-3 bg-white rounded-2xl p-5 shadow-sm border border-border/50">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <p className="text-navy text-sm font-medium leading-relaxed">{item}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* REGULATIONS */}
      <section className="py-20 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3">
              Regulations & standards
            </p>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-navy mb-4">
              The rulebook we help you follow
            </h2>
            <p className="text-lg text-muted-foreground">
              Compliance is a moving target. We translate the controls into systems, document
              the evidence, and keep it current between audits.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {industry.regulations.map((r, i) => (
              <div
                key={i}
                className="rounded-2xl bg-white border border-border p-6 flex gap-4 shadow-sm"
              >
                <div className="w-10 h-10 rounded-xl bg-navy/10 text-navy flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-navy mb-1.5">{r.name}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {r.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SOFTWARE STACKS */}
      <section className="py-20 bg-navy text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3">
              Software stacks we support
            </p>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              We already know your tools
            </h2>
            <p className="text-lg text-white/70">
              These are the platforms our team installs, integrates, and supports for{" "}
              {industry.shortLabel.toLowerCase()} every week.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {industry.softwareStacks.map((s, i) => (
              <div key={i} className="rounded-2xl bg-white/5 border border-white/10 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
                    <Layers className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-white">{s.category}</h3>
                </div>
                <ul className="space-y-2">
                  {s.items.map((it, j) => (
                    <li key={j} className="text-sm text-white/80 flex gap-2">
                      <span className="text-primary mt-1.5 w-1 h-1 rounded-full bg-primary shrink-0" />
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="text-xs text-white/50 mt-6 max-w-3xl">
            Don't see your platform? We support most line-of-business software in{" "}
            {industry.name.toLowerCase()} — ask us about yours.
          </p>
        </div>
      </section>

      {/* CASE STUDIES (matched on industry) */}
      {caseStudies.length > 0 ? (
        <section className="py-20 bg-background">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3">
                  Proof
                </p>
                <h2 className="text-3xl md:text-4xl font-display font-bold text-navy">
                  {industry.name} client outcomes
                </h2>
              </div>
              <Link href="/case-studies">
                <Button variant="link" className="text-lg">
                  All case studies <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {caseStudies.map((cs, i) => (
                <CaseStudyCard key={cs.id} caseStudy={cs} index={i} />
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className="py-16 bg-background">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-dashed border-border bg-white p-8 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3">
                Case study in progress
              </p>
              <p className="text-navy font-semibold mb-2">{industry.caseStudyHint}</p>
              <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
                We're writing this one up now. Ask us during your consultation and we'll walk
                you through the engagement and the metrics in person.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* SHARED TESTIMONIALS */}
      <TestimonialsSection
        background="muted"
        limit={3}
        title="What clients across industries say"
        subtitle="Real outcomes from businesses that trust Siebert as their hybrid MSP partner."
      />

      {/* RELATED SERVICES */}
      <section className="py-20 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3">
              Related services
            </p>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-navy mb-4">
              How we deliver this for {industry.shortLabel.toLowerCase()}
            </h2>
            <p className="text-lg text-muted-foreground">
              Every {industry.name.toLowerCase()} engagement is a mix of these managed services
              — sized to your team, your tools, and your risk profile.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {industry.relatedServices.map((svc, i) => (
              <Link key={i} href={svc.href}>
                <Card className="h-full border-none shadow-md bg-white hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-navy mb-2">{svc.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      {svc.description}
                    </p>
                    <span className="inline-flex items-center gap-1 text-primary text-sm font-semibold">
                      Explore service <ArrowRight className="w-4 h-4" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* LEAD MAGNET */}
      <section className="py-12 bg-white border-t">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <LeadMagnetCTA
            magnet={
              industry.slug === "healthcare" || industry.slug === "dental" || industry.slug === "medical"
                ? LEAD_MAGNETS["hipaa-checklist"]
                : LEAD_MAGNETS["buyers-guide"]
            }
            variant="banner"
            source={`industry_${industry.slug}`}
          />
        </div>
      </section>

      {/* OTHER INDUSTRIES */}
      <section className="py-16 bg-primary/5 border-t border-primary/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-lg font-bold text-navy mb-5">Explore other industries</h3>
          <div className="flex flex-wrap gap-2">
            {otherIndustries.map((i) => (
              <Link
                key={i.slug}
                href={`/industries/${i.slug}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-border text-sm font-semibold text-navy hover:border-primary hover:text-primary transition-colors"
              >
                {i.name}
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 bg-navy text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
            Ready to talk specifics?
          </h2>
          <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto">
            Tell us about your environment and the regulations you're working under. We'll
            give you a no-pressure read on what's working, what's not, and what we'd
            tackle first.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/quote">
              <Button size="lg" className="w-full sm:w-auto">
                {industry.ctaLabel}
              </Button>
            </Link>
            <BookingButton
              size="lg"
              variant="outline"
              className="w-full sm:w-auto bg-transparent border-white/30 text-white hover:bg-white/10"
              label="Book a 15-min call"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
