import { motion } from "framer-motion";
import {
  Globe, Server, Shield, Zap, Building2, CheckCircle,
  ExternalLink, ArrowRight, Layers, Cloud, Network, Lock
} from "lucide-react";
import { Link } from "wouter";
import { VendorInquiryForm } from "@/components/forms/VendorInquiryForm";

const LUMEN_PURPLE = "#6b21a8";
const LUMEN_DARK = "#3b0764";

const services = [
  {
    icon: Globe,
    title: "Dedicated Internet Access",
    subtitle: "Fiber DIA — 1 Mbps to 100 Gbps",
    description:
      "Symmetric dedicated internet over Lumen's extensive fiber network. Guaranteed bandwidth, SLA-backed uptime, and diverse path options for mission-critical connectivity across the U.S. and globally.",
    highlights: [
      "1 Mbps – 100 Gbps symmetric",
      "100% fiber backbone",
      "99.99% SLA available",
      "Diverse path / redundant routing",
    ],
    color: LUMEN_PURPLE,
  },
  {
    icon: Network,
    title: "MPLS / Private IP",
    subtitle: "Wide Area Networking",
    description:
      "Lumen's private IP and MPLS network connects your offices, data centers, and cloud environments with guaranteed QoS, low latency, and carrier-grade reliability across North America and 60+ countries.",
    highlights: [
      "Guaranteed QoS by traffic class",
      "North America + 60+ countries",
      "Low-latency backbone",
      "Managed routing included",
    ],
    color: "#7c3aed",
  },
  {
    icon: Cloud,
    title: "SD-WAN",
    subtitle: "Intelligent Multi-Site WAN",
    description:
      "Lumen's SD-WAN solution delivers centralized network management, intelligent application routing, automatic failover, and zero-touch branch provisioning — integrated with Lumen's fiber backbone.",
    highlights: [
      "Application-aware routing",
      "Zero-touch provisioning",
      "Automatic failover",
      "Integrated with Lumen DIA",
    ],
    color: "#16a34a",
  },
  {
    icon: Shield,
    title: "DDoS Mitigation",
    subtitle: "Black Lotus Labs Threat Intel",
    description:
      "Lumen's Black Lotus Labs is one of the most respected cybersecurity research teams globally. Their DDoS scrubbing centers protect enterprise networks from volumetric and application-layer attacks.",
    highlights: [
      "Always-on or on-demand scrubbing",
      "Black Lotus Labs intelligence",
      "Volumetric & app-layer protection",
      "Upstream mitigation (not CPE)",
    ],
    color: "#dc2626",
  },
  {
    icon: Server,
    title: "Edge Computing",
    subtitle: "Lumen Edge Platform",
    description:
      "Lumen's edge computing platform puts compute resources close to your end users and IoT devices — reducing latency for real-time applications, AI inference, and latency-sensitive workloads.",
    highlights: [
      "Sub-5ms latency edge nodes",
      "Bare metal & containerized compute",
      "IoT & AI inference use cases",
      "APIs for programmatic access",
    ],
    color: "#0891b2",
  },
  {
    icon: Lock,
    title: "Managed Security",
    subtitle: "SIEM, Firewall & Threat Mgmt",
    description:
      "Lumen's managed security services include managed firewalls, SIEM, vulnerability management, and endpoint detection — delivered from their SOC with 24/7 threat monitoring and response.",
    highlights: [
      "Managed NGFW",
      "SIEM with threat correlation",
      "Vulnerability management",
      "24/7 SOC response",
    ],
    color: "#ea580c",
  },
];

const whyUs = [
  {
    title: "One of the Longest Fiber Networks",
    description:
      "Lumen's fiber network spans over 400,000 route miles in North America alone — making it one of the most extensive private fiber backbones in the world.",
  },
  {
    title: "Black Lotus Labs Cybersecurity",
    description:
      "Lumen's Black Lotus Labs threat intelligence team operates one of the largest commercial threat sensor networks, tracking botnets and nation-state actors in real time.",
  },
  {
    title: "Global Reach — 60+ Countries",
    description:
      "For multinational businesses, Lumen delivers MPLS, SD-WAN, and DIA services across more than 60 countries with consistent SLAs and centralized management.",
  },
  {
    title: "Edge Computing Leadership",
    description:
      "Lumen's edge platform is positioned at over 100 metropolitan areas, enabling compute workloads to run sub-5ms from end users — critical for AR/VR, IoT, and real-time analytics.",
  },
  {
    title: "Purpose-Built for Enterprise",
    description:
      "Lumen is not a residential ISP serving SMBs on the side — it is purpose-built for enterprise and wholesale, with carrier-grade infrastructure and dedicated account teams.",
  },
  {
    title: "Open Network API Platform",
    description:
      "Lumen's Network-as-a-Service platform exposes APIs that let enterprises and developers provision, manage, and monitor network services programmatically — no manual ticket required.",
  },
];

const idealFor = [
  {
    type: "Enterprise Multi-Site (50+ locations)",
    plans: "MPLS / Private IP + SD-WAN + DDoS mitigation",
    icon: Building2,
  },
  {
    type: "Data Centers & Colocation",
    plans: "Dedicated Fiber DIA + diverse path + managed firewall",
    icon: Layers,
  },
  {
    type: "Latency-Sensitive & Global Ops",
    plans: "Lumen Edge Compute + global MPLS + Black Lotus DDoS",
    icon: Globe,
  },
];

export default function Lumen() {
  return (
    <div className="w-full bg-background">
      {/* Hero */}
      <motion.div
        className="text-white py-16 px-4 sm:px-6 lg:px-8"
        style={{ background: `linear-gradient(135deg, ${LUMEN_DARK} 0%, ${LUMEN_PURPLE} 100%)` }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-white/15">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <div className="text-purple-200 text-sm font-semibold uppercase tracking-wide">Formerly CenturyLink · Enterprise Fiber & Cloud Networking</div>
              <h1 className="text-4xl font-bold">Lumen Technologies</h1>
            </div>
          </div>
          <p className="text-purple-100 text-lg mt-4 max-w-2xl leading-relaxed">
            Enterprise-grade dedicated internet, MPLS, SD-WAN, edge computing, and cybersecurity — built on one of the largest fiber backbones in the world, spanning 400,000 route miles.
          </p>
          <div className="flex flex-wrap gap-4 mt-8">
            <Link href="/contact">
              <a className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white font-bold hover:bg-purple-50 transition-colors" style={{ color: LUMEN_DARK }}>
                <ArrowRight className="w-5 h-5" />
                Request a Quote
              </a>
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-6 mt-12 border-t border-white/20 pt-10">
            {[
              { value: "400K+", label: "Fiber route miles" },
              { value: "60+", label: "Countries served" },
              { value: "100 Gbps", label: "Max DIA speed" },
            ].map(({ value, label }) => (
              <div key={label}>
                <div className="text-2xl font-bold text-white">{value}</div>
                <div className="text-purple-200 text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-16">

        {/* Services */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Enterprise Networking & Security Portfolio</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Dedicated fiber, MPLS, SD-WAN, edge computing, DDoS mitigation, and managed security — built for enterprise scale and global reach.
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

        {/* Why Lumen */}
        <motion.section
          className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-foreground mb-10 text-center">Why Lumen Technologies?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyUs.map((item) => (
              <div key={item.title} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: LUMEN_PURPLE }}>
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
                <Icon className="w-8 h-8 mb-4" style={{ color: LUMEN_PURPLE }} />
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
              <h2 className="text-3xl font-bold text-foreground mb-3">Get a Lumen Enterprise Quote</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Enterprise-grade DIA, MPLS, SD-WAN, and edge computing — tell us about your network requirements and we'll build a Lumen solution tailored to your organization.
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 border border-border">
              <VendorInquiryForm
                vendorName="Lumen Technologies"
                vendorSlug="lumen"
                accentColor={LUMEN_PURPLE}
                accentDark={LUMEN_DARK}
                services={[
                  "Dedicated Internet Access (DIA)",
                  "MPLS / Private IP Network",
                  "SD-WAN (Lumen)",
                  "DDoS Mitigation (Black Lotus Labs)",
                  "Edge Compute Platform",
                  "Managed Security Services / SIEM",
                  "Global Fiber Connectivity",
                ]}
                extraFields={[
                  { id: "locations", label: "Number of Locations / Sites", type: "select", options: ["1–4", "5–19", "20–99", "100–499", "500+"], required: true },
                  { id: "bandwidth", label: "Bandwidth Needed Per Site", type: "select", options: ["10–100 Mbps", "100 Mbps – 1 Gbps", "1 Gbps – 10 Gbps", "10 Gbps+", "Multiple tiers — varies by site"] },
                  { id: "geography", label: "Geographic Footprint", type: "select", options: ["US only", "US + Canada / Mexico", "North America + Europe", "Global (multiple continents)"] },
                  { id: "timeline", label: "Implementation Timeline", type: "select", options: ["ASAP (emergency)", "Within 3 months", "3–6 months", "6–12 months", "Planning stage"] },
                ]}
              />
            </div>
            <p className="text-xs text-center text-muted-foreground mt-4">
              * Lumen enterprise services are custom-quoted based on location, bandwidth, and contract term. All pricing requires a dedicated quote.
            </p>
          </div>
        </motion.section>

        {/* CTA */}
        <motion.div
          className="text-white rounded-xl p-12 text-center"
          style={{ background: `linear-gradient(135deg, ${LUMEN_DARK} 0%, ${LUMEN_PURPLE} 100%)` }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-4">Scale Your Enterprise on Lumen</h2>
          <p className="text-purple-100 text-lg mb-8 max-w-xl mx-auto">
            From dedicated fiber for a single data center to global MPLS across 60 countries — we'll design and source the right Lumen solution for your enterprise requirements.
          </p>
          <Link href="/contact">
            <a className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-white font-bold hover:bg-purple-50 transition-colors text-lg" style={{ color: LUMEN_DARK }}>
              <ArrowRight className="w-5 h-5" />
              Get a Custom Quote
            </a>
          </Link>
          <p className="text-purple-200 text-sm mt-5">Enterprise-grade fiber · 60+ countries · Black Lotus Labs security</p>
        </motion.div>

      </div>
    </div>
  );
}
