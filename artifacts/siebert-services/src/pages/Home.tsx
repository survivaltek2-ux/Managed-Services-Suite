import { useEffect, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  Shield,
  Cloud,
  Server,
  Headphones,
  ArrowRight,
  CheckCircle2,
  Building2,
  Stethoscope,
  Scale,
  GraduationCap,
} from "lucide-react";
import { Button, Card, CardContent } from "@/components/ui";
import { SchemaTag } from "@/components/SchemaTag";
import { BookingButton } from "@/components/Booking";
import { MultiChannelContactBar } from "@/components/MultiChannelContactBar";
import { LeadMagnetCTA, ALL_MAGNETS } from "@/components/leadMagnets";
import {
  TestimonialsSection,
  CompanyStats,
  CertificationsRow,
  GoogleReviewsBlock,
  CaseStudyCard,
  type CaseStudy,
} from "@/components/trust";

export default function Home() {
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  useEffect(() => {
    fetch("/api/cms/case-studies")
      .then((r) => (r.ok ? r.json() : []))
      .then((d: CaseStudy[]) => setCaseStudies(d.slice(0, 3)))
      .catch(() => setCaseStudies([]));
  }, []);

  const features = [
    {
      icon: <Headphones className="w-6 h-6" />,
      title: "Managed IT & Helpdesk",
      desc: "24/7 monitoring, proactive maintenance, and tiered support plans with guaranteed SLAs.",
    },
    {
      icon: <Cloud className="w-6 h-6" />,
      title: "Cloud Services",
      desc: "Microsoft 365, AWS, and Azure migrations and ongoing management — fully managed or co-managed.",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Cybersecurity",
      desc: "Enterprise-grade endpoint protection, compliance management, and threat detection.",
    },
    {
      icon: <Server className="w-6 h-6" />,
      title: "Infrastructure",
      desc: "Networking, firewalls, and server deployments from certified vendor partners.",
    },
  ];

  const industries = [
    { icon: <Stethoscope className="w-5 h-5" />, label: "Healthcare & medical", href: "/industries/healthcare" },
    { icon: <Scale className="w-5 h-5" />, label: "Legal & professional services", href: "/industries/legal" },
    { icon: <Building2 className="w-5 h-5" />, label: "Manufacturing & distribution", href: "/industries/manufacturing" },
    { icon: <GraduationCap className="w-5 h-5" />, label: "Financial services & RIAs", href: "/industries/financial-services" },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <SchemaTag id="schema-localbusiness" type="LocalBusiness" />
      <SchemaTag
        id="schema-webpage-home"
        type="WebPage"
        name="Siebert Services — Managed IT, Internet & Security for North American Businesses"
        description="Managed IT, internet, and cybersecurity for businesses across North America. 24/7 helpdesk, < 15 minute response, and one partner for procurement, deployment, and support."
      />

      {/* HERO — first 5 seconds: who, what, why, what to do next */}
      <section className="relative pt-24 pb-12 lg:pt-32 lg:pb-16 overflow-hidden bg-navy">
        <div className="absolute inset-0 z-0">
          <img
            src={`${import.meta.env.BASE_URL}images/hero-bg.png`}
            alt=""
            className="w-full h-full object-cover opacity-30 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/85 to-navy/40" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-7"
            >
              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-display font-extrabold text-white leading-[1.05] mb-5 tracking-tight">
                Managed IT, Internet & Security for{" "}
                <span className="text-gradient">businesses across North America.</span>
              </h1>
              <p className="text-lg text-white/80 leading-relaxed mb-7 max-w-2xl">
                One trusted partner for your helpdesk, cloud, cybersecurity, phones, and
                connectivity — with a 15-minute response SLA, remote support across North
                America, and on-site dispatch in New York.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                <Link href="/quote">
                  <Button size="lg" className="w-full sm:w-auto gap-2 h-14 px-7 text-base">
                    Get a Free IT Assessment <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button
                    variant="link"
                    className="text-white hover:text-primary text-base font-semibold"
                  >
                    See Pricing →
                  </Button>
                </Link>
              </div>

              <p className="text-white/50 text-sm mt-4">
                No-obligation 30-minute call. We'll review your stack and send a written plan
                the same day.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:col-span-5 hidden lg:block"
            >
              <div className="relative">
                <div className="absolute -inset-6 bg-primary/20 rounded-3xl blur-3xl" />
                <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-navy-light/50">
                  <img
                    src={`${import.meta.env.BASE_URL}images/about-team.png`}
                    alt="Siebert Services engineers supporting a client"
                    className="w-full h-[380px] object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-navy via-navy/80 to-transparent p-6">
                    <p className="text-white font-bold text-lg">
                      Local engineers. Real response times.
                    </p>
                    <p className="text-white/70 text-sm">
                      Headquartered in Washingtonville, NY
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* COMPANY STATS — visible directly below hero */}
      <CompanyStats variant="navy" />

      {/* SERVICES SNAPSHOT */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-navy mb-4">
              Everything your business technology needs — under one roof.
            </h2>
            <p className="text-lg text-muted-foreground">
              We pair our own managed services with the best products from our authorized
              vendor partners. One invoice, one support number, one accountable partner.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="h-full border-none shadow-lg hover:shadow-xl transition-shadow bg-white hover:-translate-y-1 duration-300">
                  <CardContent className="p-8">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold text-navy mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link href="/services">
              <Button variant="link" className="text-lg">
                View all services <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <TestimonialsSection background="muted" limit={3} />

      {/* CASE STUDY HIGHLIGHT */}
      {caseStudies.length > 0 && (
        <section className="py-24 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
              <div>
                <h2 className="text-3xl md:text-4xl font-display font-bold text-navy mb-3">
                  Client outcomes
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl">
                  Quantified results from businesses across North America that trust Siebert as
                  their hybrid MSP partner.
                </p>
              </div>
              <Link href="/case-studies">
                <Button variant="link" className="text-lg">
                  View all case studies <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {caseStudies.map((cs, i) => (
                <CaseStudyCard key={cs.id} caseStudy={cs} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* INDUSTRIES SNAPSHOT */}
      <section className="py-24 bg-white border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-navy mb-4">
              Specialized support for the industries we know best.
            </h2>
            <p className="text-lg text-muted-foreground">
              Compliance, uptime, and tooling vary by vertical. We tailor our managed stack to the businesses and regulations of every industry we serve.
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {industries.map((ind, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  href={ind.href}
                  className="block h-full rounded-2xl bg-background border border-border p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-primary transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                    {ind.icon}
                  </div>
                  <p className="font-semibold text-navy">{ind.label}</p>
                  <span className="inline-flex items-center gap-1 text-primary text-xs font-semibold mt-2">
                    Explore <ArrowRight className="w-3 h-3" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/industries">
              <Button variant="outline" size="lg">
                See all industries we serve <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* GOOGLE REVIEWS */}
      <GoogleReviewsBlock />

      {/* CERTIFICATIONS */}
      <CertificationsRow />

      {/* VENDOR PARTNERS */}
      <section className="py-20 bg-primary/5 border-y border-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-navy mb-4">
              Our Vendor Partners
            </h2>
            <p className="text-lg text-muted-foreground">
              As a hybrid MSP, we pair our managed services with products from our authorized
              vendor partners. Partner-level pricing, priority support, and expert deployment
              — all included.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {[
              { name: "Comcast Business", href: "/comcast-business", desc: "ISP Partner" },
              { name: "Spectrum Business", href: "/spectrum-business", desc: "ISP Partner" },
              { name: "AT&T Business", href: "/att-business", desc: "ISP Partner" },
              { name: "Verizon Business", href: "/verizon-business", desc: "Fiber + 5G" },
              { name: "Cox Business", href: "/cox-business", desc: "ISP Partner" },
              { name: "Altice / Optimum", href: "/altice", desc: "ISP Partner" },
              { name: "Lumen Technologies", href: "/lumen", desc: "Enterprise Fiber" },
              { name: "T-Mobile Business", href: "/t-mobile-business", desc: "5G Network" },
              { name: "Zoom", href: "/zoom", desc: "Certified Partner" },
              { name: "RingCentral", href: "/ringcentral", desc: "UCaaS Partner" },
              { name: "Microsoft 365", href: "/microsoft-365", desc: "CSP Partner" },
              { name: "8x8", href: "/8x8", desc: "UCaaS + CCaaS" },
              { name: "Cisco / Meraki", href: "/cisco-meraki", desc: "Gold Partner" },
              { name: "Fortinet", href: "/fortinet", desc: "NGFW Partner" },
              { name: "Palo Alto Networks", href: "/palo-alto-networks", desc: "Security Partner" },
              { name: "Extreme Networks", href: "/extreme-networks", desc: "Partner First" },
              { name: "Juniper Networks", href: "/juniper-networks", desc: "Partner Advantage" },
              { name: "HP", href: "/hp", desc: "Amplify Partner" },
              { name: "Dell", href: "/dell", desc: "Partner Program" },
              { name: "Vivint", href: "/vivint", desc: "Smart Home Partner" },
              { name: "ADT Business", href: "/adt-business", desc: "Security Partner" },
            ].map((vendor, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: Math.min(i, 10) * 0.04 }}
              >
                <Link href={vendor.href}>
                  <div className="bg-white rounded-2xl p-5 text-center shadow-sm border border-border hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full">
                    <h3 className="font-bold text-navy text-base mb-1">{vendor.name}</h3>
                    <p className="text-xs text-primary font-semibold">{vendor.desc}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY HYBRID MSP */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-navy mb-6">
                Why work with a hybrid MSP?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                With Siebert, you don't just get products — you get a complete solution. We
                combine vendor procurement with our own managed services, so every purchase
                comes with expert deployment, ongoing management, and SLA-backed support.
              </p>
              <ul className="space-y-5">
                {[
                  {
                    title: "Partner-Level Pricing",
                    desc: "Our vendor partnerships give us access to pricing, promotions, and deal registration that you can't get buying direct.",
                  },
                  {
                    title: "Bundled Managed Services",
                    desc: "Pair any hardware or software purchase with our managed IT plans — one invoice, one support number, one partner.",
                  },
                  {
                    title: "Expert Deployment & Migration",
                    desc: "We don't just ship boxes. We design, configure, deploy, and migrate — with certified engineers on your project.",
                  },
                  {
                    title: "Ongoing Support & SLAs",
                    desc: "After deployment, we manage and support your technology with guaranteed SLAs and 24/7 helpdesk access.",
                  },
                ].map((item, i) => (
                  <li key={i} className="flex gap-4">
                    <CheckCircle2 className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-navy">{item.title}</span>
                      <p className="text-muted-foreground text-sm">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-navy rounded-3xl p-8 text-white shadow-xl">
              <h3 className="text-xl font-bold mb-6 font-display">The Hybrid MSP Advantage</h3>
              <div className="space-y-4">
                {[
                  { label: "Procurement", desc: "We source hardware and software at partner pricing from HP, Dell, Zoom, and more." },
                  { label: "Deployment", desc: "Certified engineers handle design, configuration, and installation." },
                  { label: "Management", desc: "Ongoing monitoring, patching, and support with tiered SLA plans." },
                  { label: "Lifecycle", desc: "From first boot to secure decommission — we manage the full lifecycle." },
                ].map((t, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-white">{t.label}</p>
                      <p className="text-white/60 text-sm">{t.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Free resources / lead magnets */}
      <section className="py-20 bg-white border-t border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-xs uppercase tracking-widest text-primary font-bold mb-2">Free resources</p>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-navy mb-3">
              Tools and guides for IT decision-makers
            </h2>
            <p className="text-base text-muted-foreground max-w-xl mx-auto">
              Assess your security posture, calculate downtime cost, or vet your next MSP — no sales call required.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {ALL_MAGNETS.map(m => (
              <LeadMagnetCTA key={m.slug} magnet={m} />
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/resources" className="text-sm text-primary font-semibold hover:underline">
              See all resources →
            </Link>
          </div>
        </div>
      </section>

      {/* FINAL CTA + multi-channel contact bar */}
      <section className="py-24 bg-primary/5 border-t border-primary/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-display font-bold text-navy mb-6">
            Ready for an IT partner that picks up the phone?
          </h2>
          <p className="text-xl text-muted-foreground mb-10">
            Pick whichever way to reach us is easiest — call, chat, or book a 15-minute
            discovery call. We'll respond the same business day.
          </p>
          <div className="max-w-3xl mx-auto mb-8">
            <MultiChannelContactBar variant="inline" />
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/quote">
              <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg">
                Get a Free IT Assessment
              </Button>
            </Link>
            <BookingButton
              size="lg"
              variant="outline"
              className="w-full sm:w-auto h-14 px-8 text-lg"
              label="Book a 15-Min Call"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
