import { motion } from "framer-motion";
import {
  Shield, Globe, Cloud, Lock, Eye, Zap, Building2, CheckCircle,
  ExternalLink, ArrowRight, Layers, Server, Network
} from "lucide-react";
import { Link } from "wouter";
import { VendorInquiryForm } from "@/components/forms/VendorInquiryForm";
import { usePageContent } from "@/hooks/usePageContent";

const PA_BLUE = "#0070c0";
const PA_DARK = "#003d6b";

const productPillars = [
  {
    name: "Strata (Network Security)",
    category: "NGFW & SD-WAN",
    description: "The world's most comprehensive next-generation firewall platform — physical, virtual, and cloud-delivered. Includes PA-Series hardware, VM-Series virtual firewalls, CN-Series for containers, and Prisma SD-WAN.",
    specs: "PA-Series NGFW · VM-Series · CN-Series · Prisma SD-WAN · Advanced Threat Prevention",
    highlight: true,
  },
  {
    name: "Prisma SASE",
    category: "Cloud-Delivered Security",
    description: "Palo Alto's SASE platform combines Prisma Access (cloud NGFW for remote users), SD-WAN (Prisma SD-WAN), and AI-powered CASB/SWG — all managed from a single cloud portal.",
    specs: "Prisma Access · ZTNA 2.0 · CASB · SWG · DLP · Autonomous Digital Experience Management",
    highlight: false,
  },
  {
    name: "Cortex (AI-Powered SOC)",
    category: "XDR, XSOAR & XSIAM",
    description: "AI-driven security operations platform. Cortex XDR unifies endpoint, network, and cloud detection. XSOAR automates incident response. XSIAM is Palo Alto's AI-powered SOC platform that replaces traditional SIEM.",
    specs: "Cortex XDR · XSOAR (SOAR) · XSIAM (AI SOC) · Cortex Xpanse (attack surface mgmt)",
    highlight: false,
  },
];

const services = [
  {
    icon: Shield,
    title: "PA-Series NGFW",
    subtitle: "On-Premises Firewall",
    description:
      "Industry-leading hardware firewalls from the PA-220 for small offices to the PA-7000 series for data centers. Every model runs PAN-OS with App-ID, User-ID, Content-ID, and Device-ID for unparalleled visibility.",
    highlights: [
      "App-ID application control",
      "User-ID identity awareness",
      "Advanced Threat Prevention (ATP)",
      "ML-powered real-time protection",
    ],
    color: PA_BLUE,
  },
  {
    icon: Cloud,
    title: "Prisma Access",
    subtitle: "SASE / Cloud-Delivered NGFW",
    description:
      "Cloud-delivered NGFW for remote users and branch offices. Prisma Access applies the same security policies as your on-prem PA-Series firewall — regardless of where users connect from.",
    highlights: [
      "Cloud-delivered NGFW for remote users",
      "ZTNA 2.0 — continuous trust verification",
      "Global POP network (100+ locations)",
      "Unified with on-prem NGFW policy",
    ],
    color: "#7c3aed",
  },
  {
    icon: Globe,
    title: "Prisma SD-WAN",
    subtitle: "AI-Powered Intelligent WAN",
    description:
      "Palo Alto's AI-powered SD-WAN delivers zero-delay failover, application-aware path selection, and autonomous troubleshooting — integrated with Prisma SASE for security-first networking.",
    highlights: [
      "Zero-delay WAN failover",
      "AI-driven path selection",
      "Autonomous troubleshooting",
      "Full SASE integration",
    ],
    color: "#16a34a",
  },
  {
    icon: Eye,
    title: "Cortex XDR",
    subtitle: "Extended Detection & Response",
    description:
      "AI-powered XDR that unifies prevention, detection, and response across endpoint, network, cloud, and third-party data. Reduces mean time to respond by up to 88% vs. traditional SIEM + AV approaches.",
    highlights: [
      "Cross-source threat correlation",
      "Behavioral analytics (UEBA)",
      "Automated root cause analysis",
      "Response playbook automation",
    ],
    color: "#dc2626",
  },
  {
    icon: Lock,
    title: "Zero Trust Network Access",
    subtitle: "ZTNA 2.0 via Prisma Access",
    description:
      "Palo Alto's ZTNA 2.0 goes beyond traditional ZTNA — continuously verifying trust after connection, inspecting all traffic including encrypted tunnels, and preventing lateral movement.",
    highlights: [
      "Continuous trust verification",
      "Least-privilege access enforcement",
      "Encrypted traffic inspection",
      "Prevents lateral movement",
    ],
    color: "#0891b2",
  },
  {
    icon: Server,
    title: "VM-Series & CN-Series",
    subtitle: "Cloud & Container NGFW",
    description:
      "Deploy the same PA-Series NGFW capabilities as a virtual machine in AWS, Azure, Google Cloud, or as a CN-Series container firewall in Kubernetes — identical policy, identical security.",
    highlights: [
      "AWS, Azure, GCP deployment",
      "Kubernetes container security",
      "Same PAN-OS everywhere",
      "API-driven automation",
    ],
    color: "#ea580c",
  },
];

const whyUs = [
  {
    title: "Gartner Magic Quadrant Leader — Network Firewall",
    description:
      "Palo Alto Networks has been named a Leader in Gartner's Magic Quadrant for Network Firewalls for 13+ consecutive years — widely regarded as the gold standard in enterprise security.",
  },
  {
    title: "ML-Powered Inline Protection",
    description:
      "PAN-OS uses machine learning to identify and block zero-day threats in real time — inline, without a sandbox delay. Traditional firewalls only block known threats.",
  },
  {
    title: "App-ID: Application Awareness",
    description:
      "Palo Alto's App-ID technology identifies over 3,000 applications by traffic characteristics — not just port and protocol — giving you granular control over exactly what flows through your network.",
  },
  {
    title: "One Platform Across Every Surface",
    description:
      "Strata NGFW, Prisma SASE, and Cortex AI SOC are all deeply integrated — sharing telemetry, policies, and threat intelligence across on-premises, cloud, remote, and endpoint environments.",
  },
  {
    title: "Unit 42 Threat Intelligence",
    description:
      "Palo Alto's Unit 42 research team is one of the most respected threat intelligence organizations in the world — tracking nation-state actors, ransomware groups, and zero-day vulnerabilities.",
  },
  {
    title: "Cortex XSIAM — AI-Powered SOC",
    description:
      "Cortex XSIAM replaces traditional SIEM with AI-driven detection that reduces alert noise by 98% and mean time to respond from hours to minutes — the only platform of its kind.",
  },
];

const idealFor = [
  {
    type: "Enterprise (500+ employees)",
    plans: "PA-Series NGFW + Prisma Access + Cortex XDR for full coverage",
    icon: Building2,
  },
  {
    type: "Cloud-First / Hybrid Workforce",
    plans: "Prisma SASE (Prisma Access + SD-WAN + CASB) for anywhere access",
    icon: Layers,
  },
  {
    type: "SOC & Security Operations Teams",
    plans: "Cortex XSIAM or XDR + XSOAR automation + Unit 42 intel",
    icon: Globe,
  },
];

export default function PaloAltoNetworks() {
  const content = usePageContent("palo-alto-networks", {
    heroTitle: "Palo Alto Networks",
    heroSubtitle: "Gartner Leader · 13+ Years · NGFW, SASE & AI SOC",
    heroDescription: "The world's most comprehensive cybersecurity platform — covering network firewall (Strata), cloud-delivered SASE (Prisma), and AI-powered security operations (Cortex) — all from one vendor.",
  });
  return (
    <div className="w-full bg-background">
      {/* Hero */}
      <motion.div
        className="text-white py-16 px-4 sm:px-6 lg:px-8"
        style={{ background: `linear-gradient(135deg, ${PA_DARK} 0%, ${PA_BLUE} 100%)` }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-white/15">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="text-blue-200 text-sm font-semibold uppercase tracking-wide">{content.heroSubtitle}</div>
              <h1 className="text-4xl font-bold">{content.heroTitle}</h1>
            </div>
          </div>
          <p className="text-blue-100 text-lg mt-4 max-w-2xl leading-relaxed">
            {content.heroDescription}
          </p>
          <div className="flex flex-wrap gap-4 mt-8">
            <button
              onClick={() => document.getElementById('inquiry-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white font-bold hover:bg-blue-50 transition-colors" style={{ color: PA_DARK }}
            >
              <ArrowRight className="w-5 h-5" />
              Request a Quote
            </button>
          </div>

          <div className="grid grid-cols-3 gap-6 mt-12 border-t border-white/20 pt-10">
            {[
              { value: "13+", label: "Years Gartner MQ Leader" },
              { value: "80K+", label: "Enterprise customers" },
              { value: "3", label: "Integrated platforms" },
            ].map(({ value, label }) => (
              <div key={label}>
                <div className="text-2xl font-bold text-white">{value}</div>
                <div className="text-blue-200 text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-16">

        {/* Platform Pillars */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Three Integrated Security Platforms</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Strata, Prisma, and Cortex work together — sharing telemetry and threat intelligence so your security improves the more of the platform you use.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {productPillars.map((product) => (
              <motion.div
                key={product.name}
                className={`rounded-xl border-2 overflow-hidden transition-all ${
                  product.highlight ? "border-blue-500 ring-2 ring-blue-200 shadow-xl" : "border-border"
                }`}
                whileHover={{ y: -4 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                {product.highlight && (
                  <div className="px-4 py-2 text-xs font-bold text-white text-center" style={{ backgroundColor: PA_BLUE }}>
                    GARTNER MQ LEADER
                  </div>
                )}
                <div className="p-6 bg-card">
                  <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: PA_BLUE }}>{product.category}</p>
                  <h3 className="text-xl font-bold text-foreground mb-3">{product.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{product.description}</p>
                  <div className="text-xs text-muted-foreground bg-muted rounded-lg p-3 leading-relaxed">
                    {product.specs}
                  </div>
                  <Link href="/contact">
                    <a className="mt-5 block w-full text-center px-4 py-3 rounded-lg font-bold text-white transition-all" style={{ backgroundColor: product.highlight ? PA_BLUE : PA_DARK }}>
                      Get a Quote
                    </a>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Services */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Complete Security Portfolio</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              From hardware NGFWs to cloud-delivered SASE to AI-powered XDR — we source, size, and deploy the full Palo Alto Networks stack.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={service.title}
                  className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-shadow"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <div className="w-11 h-11 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: `${service.color}15` }}>
                    <Icon className="w-5 h-5" style={{ color: service.color }} />
                  </div>
                  <div className="mb-3">
                    <h3 className="font-bold text-foreground text-lg">{service.title}</h3>
                    <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: service.color }}>{service.subtitle}</p>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{service.description}</p>
                  <ul className="space-y-1.5">
                    {service.highlights.map((h) => (
                      <li key={h} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle className="w-3.5 h-3.5 shrink-0 text-green-500" />
                        {h}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* Why Palo Alto */}
        <motion.section
          className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-foreground mb-10 text-center">Why Palo Alto Networks?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyUs.map((item) => (
              <div key={item.title} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: PA_BLUE }}>
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Ideal For */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-foreground mb-8">Who Is This Right For?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {idealFor.map(({ type, plans, icon: Icon }) => (
              <motion.div
                key={type}
                className="bg-card border border-border rounded-xl p-6"
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3 }}
              >
                <Icon className="w-8 h-8 mb-4" style={{ color: PA_BLUE }} />
                <h3 className="font-bold text-foreground mb-2">{type}</h3>
                <p className="text-sm text-muted-foreground">{plans}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Inquiry Form */}
        <motion.section
          className="py-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-foreground mb-3">Get a Palo Alto Networks Quote</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                The leader in cybersecurity — tell us about your environment and we'll design a Palo Alto Networks solution that consolidates your security across network, cloud, and endpoint.
              </p>
            </div>
            <div id="inquiry-form" className="bg-white rounded-2xl shadow-xl p-8 md:p-10 border border-border">
              <VendorInquiryForm
                vendorName="Palo Alto Networks"
                vendorSlug="palo-alto-networks"
                accentColor={PA_BLUE}
                accentDark={PA_DARK}
                services={[
                  "PA-Series NGFW (On-Premises Firewall)",
                  "VM-Series / CN-Series (Cloud & Container Firewall)",
                  "Prisma Access (SASE / Cloud-Delivered Security)",
                  "Prisma SD-WAN (Autonomous SD-WAN)",
                  "Cortex XDR (Endpoint Detection & Response)",
                  "Cortex XSIAM (AI-Powered Security Operations)",
                  "Unit 42 Threat Intelligence & IR Retainer",
                ]}
                extraFields={[
                  { id: "users", label: "Number of Users / Endpoints", type: "select", options: ["Under 100", "100–500", "500–2,000", "2,000–10,000", "10,000+"], required: true },
                  { id: "locations", label: "Number of Locations / Sites", type: "select", options: ["1", "2–5", "6–20", "21–100", "100+"] },
                  { id: "priority", label: "Primary Security Objective", type: "select", options: ["Replace legacy firewall (Cisco ASA, Fortinet, etc.)", "Secure remote users / SASE", "Protect cloud workloads (AWS / Azure / GCP)", "Build or modernize SOC", "Endpoint / XDR consolidation", "Full platform consolidation (Strata + Prisma + Cortex)"] },
                  { id: "existing_stack", label: "Current Security Stack", type: "text", placeholder: "e.g. Cisco ASA, Fortinet, CrowdStrike, SentinelOne…" },
                ]}
              />
            </div>
            <p className="text-xs text-center text-muted-foreground mt-4">
              * Palo Alto Networks pricing is based on platform, throughput, and subscription tier. All solutions require a custom quote — contact us to start a detailed assessment.
            </p>
          </div>
        </motion.section>

        {/* CTA */}
        <motion.div
          className="text-white rounded-xl p-12 text-center"
          style={{ background: `linear-gradient(135deg, ${PA_DARK} 0%, ${PA_BLUE} 100%)` }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-4">Secure Your Enterprise with Palo Alto Networks</h2>
          <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
            From a single NGFW deployment to a full Strata + Prisma + Cortex consolidation — we'll design and source the right Palo Alto solution for your security requirements.
          </p>
          <Link href="/contact">
            <a className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-white font-bold hover:bg-blue-50 transition-colors text-lg" style={{ color: PA_DARK }}>
              <ArrowRight className="w-5 h-5" />
              Get a Custom Quote
            </a>
          </Link>
          <p className="text-blue-200 text-sm mt-5">Authorized Palo Alto Networks partner · NGFW, SASE & Cortex XDR deployments</p>
        </motion.div>

      </div>
    </div>
  );
}
