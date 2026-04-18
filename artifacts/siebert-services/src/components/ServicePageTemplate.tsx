import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Phone,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui";
import { SchemaTag } from "@/components/SchemaTag";
import { BookingButton } from "@/components/Booking";
import {
  TestimonialsSection,
  CertificationsRow,
  CaseStudyCard,
  type CaseStudy,
} from "@/components/trust";
import { LeadMagnetCTA, getMagnetForService } from "@/components/leadMagnets";

export interface ProcessStep {
  title: string;
  description: string;
}

export interface ServiceFAQ {
  question: string;
  answer: string;
}

export interface ServiceBenefit {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface ComplianceItem {
  label: string;
  description?: string;
}

export interface RelatedLink {
  label: string;
  href: string;
}

export interface ServicePageContent {
  /** URL slug fragment, e.g. "managed-it" */
  slug: string;
  /** Eyebrow above hero title */
  eyebrow: string;
  /** Main hero headline */
  heroTitle: string;
  /** Hero sub-headline */
  heroSubtitle: string;
  /** Short hero description */
  heroDescription: string;
  /** Hero accent icon */
  heroIcon: LucideIcon;
  /** Hero stats (3 max) */
  heroStats?: { value: string; label: string }[];
  /** Who this service is for */
  audience: {
    title: string;
    description: string;
    bullets: string[];
  };
  /** Outcome-led benefits, not feature dumps */
  benefits: ServiceBenefit[];
  /** Process steps (Discovery → Assessment → Onboarding → Ongoing) */
  process: ProcessStep[];
  /** Compliance / standards callouts (optional) */
  compliance?: {
    title: string;
    description: string;
    items: ComplianceItem[];
  };
  /** FAQ block */
  faqs: ServiceFAQ[];
  /** Featured case study slug to highlight */
  relatedCaseStudySlug?: string;
  /** Related cross-links to other service / industry pages */
  relatedLinks?: RelatedLink[];
  /** Final CTA copy override */
  finalCta?: {
    headline?: string;
    subhead?: string;
  };
  /** Schema.org service description */
  schemaDescription: string;
}

interface Props {
  content: ServicePageContent;
  caseStudies?: CaseStudy[];
  children?: ReactNode;
}

export function ServicePageTemplate({ content, caseStudies = [] }: Props) {
  const HeroIcon = content.heroIcon;
  const featuredCase =
    content.relatedCaseStudySlug &&
    caseStudies.find((c) => c.slug === content.relatedCaseStudySlug);
  const fullPath = `/services/${content.slug}`;

  return (
    <div className="w-full bg-background">
      <SchemaTag
        id={`schema-service-${content.slug}`}
        type="Service"
        name={content.heroTitle}
        description={content.schemaDescription}
        serviceType={content.heroTitle}
      />
      <SchemaTag
        id={`schema-breadcrumb-service-${content.slug}`}
        type="BreadcrumbList"
        crumbs={[
          { name: "Home", url: "https://siebertservices.com/" },
          { name: "Services", url: "https://siebertservices.com/services" },
          {
            name: content.heroTitle,
            url: `https://siebertservices.com${fullPath}`,
          },
        ]}
      />
      <SchemaTag
        id={`schema-faq-service-${content.slug}`}
        type="FAQPage"
        faqs={content.faqs}
      />

      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-24 bg-navy overflow-hidden border-b-4 border-primary">
        <div className="absolute inset-0 opacity-[0.06] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:24px_24px]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <Link href="/services" className="inline-flex items-center gap-2 text-white/60 hover:text-primary text-sm font-semibold mb-6 transition-colors">
              ← All services
            </Link>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/15 border border-primary/30 text-primary font-bold text-xs uppercase tracking-wider mb-6">
              <HeroIcon className="w-4 h-4" />
              {content.eyebrow}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold text-white leading-[1.05] mb-5 tracking-tight">
              {content.heroTitle}
            </h1>
            <p className="text-xl md:text-2xl text-white/85 font-medium mb-4">
              {content.heroSubtitle}
            </p>
            <p className="text-base md:text-lg text-white/70 leading-relaxed max-w-2xl mb-9">
              {content.heroDescription}
            </p>
            <div className="flex flex-wrap gap-3">
              <BookingButton label="Book a free assessment" size="lg" />
              <Link href="/quote">
                <Button variant="outline" size="lg" className="bg-white/0 border-white/30 text-white hover:bg-white/10 hover:text-white hover:border-white/50">
                  Request a quote
                </Button>
              </Link>
              <a href="tel:8664849180" className="hidden sm:inline-flex">
                <Button variant="ghost" size="lg" className="text-white hover:bg-white/10 gap-2">
                  <Phone className="w-4 h-4" /> 866-484-9180
                </Button>
              </a>
            </div>
          </motion.div>

          {content.heroStats && content.heroStats.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="grid grid-cols-3 gap-4 sm:gap-6 mt-14 max-w-3xl border-t border-white/15 pt-10"
            >
              {content.heroStats.map((s) => (
                <div key={s.label}>
                  <div className="text-2xl md:text-3xl font-display font-extrabold text-primary">{s.value}</div>
                  <div className="text-xs sm:text-sm text-white/70 mt-1 leading-tight">{s.label}</div>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      <CertificationsRow variant="compact" className="!py-8 bg-white border-b border-border/40" />

      {/* Audience */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[1fr_1.4fr] gap-10 lg:gap-16 items-start">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-primary mb-3 block">Who this is for</span>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-navy leading-tight">
                {content.audience.title}
              </h2>
              <p className="text-muted-foreground mt-4 leading-relaxed">{content.audience.description}</p>
            </div>
            <div className="bg-white rounded-2xl border border-border shadow-lg p-8">
              <h3 className="text-sm font-bold uppercase tracking-wider text-navy mb-5 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                You're a fit if…
              </h3>
              <ul className="space-y-4">
                {content.audience.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-foreground leading-relaxed">{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits — outcomes, not features */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-primary mb-3 block">Why it matters</span>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-navy">Outcomes you can take to leadership</h2>
            <p className="text-muted-foreground mt-4 text-lg">
              We don't sell tools — we sell results. Here's what changes for your business.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {content.benefits.map((b, i) => {
              const Icon = b.icon;
              return (
                <motion.div
                  key={b.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white border border-border rounded-2xl p-7 hover:shadow-xl hover:-translate-y-1 transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-5">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-navy mb-2">{b.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{b.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-24 bg-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-primary mb-3 block">Our process</span>
            <h2 className="text-3xl md:text-4xl font-display font-bold">From first call to ongoing support</h2>
            <p className="text-white/70 mt-4 text-lg">
              A predictable, repeatable engagement — no surprises, no scope creep.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {content.process.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="relative bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors"
              >
                <div className="absolute -top-4 -left-2 w-12 h-12 rounded-xl bg-primary text-navy font-display font-extrabold text-xl flex items-center justify-center shadow-lg">
                  {i + 1}
                </div>
                <div className="pt-4">
                  <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-white/70 leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance */}
      {content.compliance && (
        <section className="py-24 bg-gradient-to-br from-primary/5 via-white to-primary/5 border-y border-primary/10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-[1fr_1.4fr] gap-10 lg:gap-16 items-start">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4">
                  <ShieldCheck className="w-4 h-4" /> Compliance & standards
                </div>
                <h2 className="text-3xl md:text-4xl font-display font-bold text-navy leading-tight">
                  {content.compliance.title}
                </h2>
                <p className="text-muted-foreground mt-4 leading-relaxed">
                  {content.compliance.description}
                </p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {content.compliance.items.map((item) => (
                  <div key={item.label} className="bg-white border border-border rounded-xl p-5 shadow-sm">
                    <div className="flex items-start gap-3">
                      <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-navy">{item.label}</p>
                        {item.description && (
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-primary mb-3 block">FAQ</span>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-navy">
              Common questions
            </h2>
          </div>
          <div className="space-y-3">
            {content.faqs.map((f, i) => (
              <FAQRow key={f.question} faq={f} defaultOpen={i === 0} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialsSection limit={3} background="muted" />

      {/* Related case study */}
      {featuredCase && (
        <section className="py-24 bg-background">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <span className="text-xs font-bold uppercase tracking-widest text-primary mb-3 block">Proof</span>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-navy">A real outcome from this service</h2>
            </div>
            <div className="max-w-2xl mx-auto">
              <CaseStudyCard caseStudy={featuredCase} />
            </div>
            <div className="text-center mt-8">
              <Link href="/case-studies">
                <Button variant="outline" size="lg" className="gap-2">
                  See all case studies <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Lead magnet CTA */}
      {(() => {
        const magnet = getMagnetForService(content.slug);
        if (!magnet) return null;
        return (
          <section className="py-12 bg-white">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <LeadMagnetCTA magnet={magnet} variant="banner" source={`service_${content.slug}`} />
            </div>
          </section>
        );
      })()}

      {/* Related links */}
      {content.relatedLinks && content.relatedLinks.length > 0 && (
        <section className="py-16 bg-gray-50 border-t border-border/40">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-center text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6">
              Often paired with
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              {content.relatedLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white border border-border text-navy text-sm font-semibold hover:border-primary hover:text-primary hover:shadow-md transition-all"
                >
                  {l.label} <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-br from-navy via-navy to-navy-light text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-display font-extrabold mb-5 leading-tight">
            {content.finalCta?.headline ?? `Ready to talk about ${content.heroTitle.toLowerCase()}?`}
          </h2>
          <p className="text-lg text-white/75 mb-10 max-w-2xl mx-auto">
            {content.finalCta?.subhead ??
              "Book a free 30-minute assessment. We'll review your environment, flag risks, and outline a clear path forward — no pressure, no commitment."}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <BookingButton label="Book a free assessment" size="lg" />
            <Link href="/quote">
              <Button variant="outline" size="lg" className="bg-white/0 border-white/30 text-white hover:bg-white/10 hover:text-white hover:border-white/50">
                Request a quote
              </Button>
            </Link>
          </div>
          <div className="mt-5">
            <Link href="/pricing" className="text-sm text-white/70 hover:text-primary font-semibold underline-offset-4 hover:underline transition-colors">
              See pricing →
            </Link>
          </div>
          <p className="text-sm text-white/50 mt-6">
            Hudson Valley · NYC Metro · Remote nationwide · 24/7 support available
          </p>
        </div>
      </section>
    </div>
  );
}

function FAQRow({ faq, defaultOpen }: { faq: ServiceFAQ; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="border border-border rounded-xl bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-4 px-5 py-5 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="font-bold text-navy text-base md:text-lg">{faq.question}</span>
        <ChevronDown
          className={`w-5 h-5 text-primary shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="px-5 pb-5 text-muted-foreground leading-relaxed border-t border-border/60 pt-4">
          {faq.answer}
        </div>
      )}
    </div>
  );
}

export default ServicePageTemplate;
