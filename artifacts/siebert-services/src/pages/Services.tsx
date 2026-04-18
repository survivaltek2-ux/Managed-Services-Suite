import { motion } from "framer-motion";
import {
  Shield,
  Cloud,
  Headphones,
  Video,
  Database,
  Network,
  Laptop,
  ClipboardCheck,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, Button } from "@/components/ui";
import { Link } from "wouter";

import { SchemaTag } from "@/components/SchemaTag";
import { BookingButton } from "@/components/Booking";
import { CertificationsRow } from "@/components/trust";

interface ServiceTile {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
  highlight?: boolean;
}

const coreServices: ServiceTile[] = [
  {
    id: "managed-it",
    icon: <Headphones className="w-8 h-8" />,
    title: "Managed IT Support / Help Desk",
    description:
      "Fully managed or co-managed IT — 24/7 help desk, proactive monitoring, automated patching, and on-site dispatch. One predictable per-seat price.",
    href: "/services/managed-it",
    ctaLabel: "Explore managed IT",
    highlight: true,
  },
  {
    id: "cybersecurity",
    icon: <Shield className="w-8 h-8" />,
    title: "Cybersecurity",
    description:
      "Layered security for SMBs — managed EDR, 24/7 SOC, identity protection, awareness training, and a fractional vCISO when you need one.",
    href: "/services/cybersecurity",
    ctaLabel: "Explore cybersecurity",
  },
  {
    id: "cloud",
    icon: <Cloud className="w-8 h-8" />,
    title: "Cloud Services / Microsoft 365",
    description:
      "Migrations and managed operations for Microsoft 365, Azure, Google Workspace, and AWS — licensing, identity, and security baselined correctly.",
    href: "/services/cloud",
    ctaLabel: "Explore cloud services",
  },
  {
    id: "bdr",
    icon: <Database className="w-8 h-8" />,
    title: "Backup & Disaster Recovery",
    description:
      "Immutable cloud backups for servers, endpoints, and Microsoft 365 — with guaranteed RTOs and quarterly recovery tests you can show an auditor.",
    href: "/services/backup-disaster-recovery",
    ctaLabel: "Explore backup & DR",
  },
  {
    id: "compliance",
    icon: <ClipboardCheck className="w-8 h-8" />,
    title: "Compliance (HIPAA · CMMC · GLBA)",
    description:
      "Gap assessments, control deployment, policy authoring, and ongoing evidence collection for HIPAA, CMMC L2, GLBA, SOC 2, PCI, and NY SHIELD.",
    href: "/services/compliance",
    ctaLabel: "Explore compliance",
  },
  {
    id: "network",
    icon: <Network className="w-8 h-8" />,
    title: "Network Infrastructure",
    description:
      "Firewalls, switching, Wi-Fi, SD-WAN, and structured cabling — designed and managed using authorized partner gear from Cisco/Meraki, Fortinet, Palo Alto, and more.",
    href: "/services/network",
    ctaLabel: "Explore network services",
  },
];

const adjacentServices: ServiceTile[] = [
  {
    id: "voip",
    icon: <Video className="w-8 h-8" />,
    title: "VoIP & Telephony",
    description:
      "Cloud business phones — Zoom Phone, RingCentral, 8x8, Microsoft Teams Phone — replacing legacy PBX with predictable per-seat pricing and managed support.",
    href: "/recommended",
    ctaLabel: "See phone partners",
  },
  {
    id: "hardware",
    icon: <Laptop className="w-8 h-8" />,
    title: "Hardware & Software Reselling",
    description:
      "Authorized HP, Dell, Microsoft, and Adobe reseller. We procure, configure, deploy, and bundle hardware and licensing into our managed services.",
    href: "/recommended",
    ctaLabel: "See vendor partners",
  },
];

const industryShortcuts = [
  { slug: "healthcare", name: "Healthcare" },
  { slug: "legal", name: "Legal" },
  { slug: "financial-services", name: "Financial Services" },
  { slug: "dental", name: "Dental" },
  { slug: "government-contractors", name: "Government Contractors" },
  { slug: "manufacturing", name: "Manufacturing" },
];

export default function Services() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SchemaTag
        id="schema-service-list"
        type="Service"
        name="Managed IT, Cybersecurity, Cloud & Network Services"
        description="Comprehensive managed IT services for Hudson Valley and NYC metro businesses — managed IT, cybersecurity, cloud, backup, compliance, and network infrastructure."
        serviceType="Managed IT Services"
      />
      <SchemaTag
        id="schema-breadcrumb-services"
        type="BreadcrumbList"
        crumbs={[
          { name: "Home", url: "https://siebertservices.com/" },
          { name: "Services", url: "https://siebertservices.com/services" },
        ]}
      />

      {/* Hero */}
      <section className="bg-navy pt-32 pb-20 px-4 sm:px-6 lg:px-8 text-center border-b-4 border-primary">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/15 border border-primary/30 text-primary font-bold text-xs uppercase tracking-wider mb-6">
            Our Services
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-extrabold text-white mb-6 leading-[1.05] tracking-tight">
            One partner. <span className="text-gradient">Six core services.</span>
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto mb-8 leading-relaxed">
            Hybrid MSP services purpose-built for Hudson Valley and NYC-metro SMBs — backed by SLAs, delivered by certified engineers, and priced for predictable monthly spend.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <BookingButton label="Book a free assessment" size="lg" />
            <Link href="/quote">
              <Button variant="outline" size="lg" className="bg-white/0 border-white/30 text-white hover:bg-white/10 hover:text-white hover:border-white/50">
                Request a quote
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <CertificationsRow variant="compact" className="!py-8 bg-white border-b border-border/40" />

      {/* Core services */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-primary mb-3 block">Core managed services</span>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-navy">Each service has its own dedicated page</h2>
            <p className="text-muted-foreground mt-4 text-lg">
              Pick what matters most to your business — or let us bundle the right combination into a single, predictable monthly plan.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {coreServices.map((srv, idx) => (
              <motion.div
                key={srv.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
              >
                <Link href={srv.href}>
                  <Card className="group h-full hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-none bg-white cursor-pointer">
                    <CardHeader>
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform duration-300">
                        {srv.icon}
                      </div>
                      <CardTitle>{srv.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed mb-6">{srv.description}</p>
                      <span className="inline-flex items-center gap-2 text-primary font-bold text-sm group-hover:gap-3 transition-all">
                        {srv.ctaLabel} <ArrowRight className="w-4 h-4" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* By industry — cross-link to industry pages */}
      <section className="py-16 bg-white border-y border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-gray-50 border border-border shadow-sm p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-2">
                  By industry
                </p>
                <h2 className="text-2xl md:text-3xl font-display font-bold text-navy">
                  Looking for help in your industry?
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Each page covers the regulations, software, and pain points specific to that vertical.
                </p>
              </div>
              <Link href="/industries">
                <Button variant="outline" className="shrink-0">
                  All industries <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {industryShortcuts.map((i) => (
                <Link
                  key={i.slug}
                  href={`/industries/${i.slug}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-primary/5 border border-primary/20 text-sm font-semibold text-navy hover:bg-primary/10 hover:border-primary transition-colors"
                >
                  {i.name}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Adjacent services */}
      <section className="py-16 bg-white border-y border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-primary mb-3 block">Plus the rest of your stack</span>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-navy">Vendor procurement & telephony, sourced and supported</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-7 max-w-4xl mx-auto">
            {adjacentServices.map((srv) => (
              <Link key={srv.id} href={srv.href}>
                <Card className="group h-full hover:shadow-xl hover:-translate-y-0.5 transition-all border border-border/60 bg-white cursor-pointer">
                  <CardContent className="p-7 flex gap-5 items-start">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:scale-110 transition-transform">
                      {srv.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-navy mb-2">{srv.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-3">{srv.description}</p>
                      <span className="inline-flex items-center gap-2 text-primary font-bold text-sm group-hover:gap-3 transition-all">
                        {srv.ctaLabel} <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Bundle CTA */}
      <section className="py-20 bg-gradient-to-br from-navy via-navy to-navy-light text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-extrabold mb-5">Not sure which services you need?</h2>
          <p className="text-lg text-white/75 mb-8 max-w-2xl mx-auto">
            Book a free 30-minute assessment. We'll review your environment, flag the highest-impact gaps, and recommend the right bundle — no pressure, no commitment.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <BookingButton label="Book a free assessment" size="lg" />
            <Link href="/contact">
              <Button variant="outline" size="lg" className="bg-white/0 border-white/30 text-white hover:bg-white/10 hover:text-white hover:border-white/50">
                Talk to an engineer
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
