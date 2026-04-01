import { motion } from "framer-motion";
import {
  Shield, Wifi, Globe, Building2, CheckCircle,
  ExternalLink, ArrowRight, Layers, Server, Lock, Eye, Zap
} from "lucide-react";
import { Link } from "wouter";
import { VendorInquiryForm } from "@/components/forms/VendorInquiryForm";

const FORT_RED = "#ee3124";
const FORT_DARK = "#8b0000";

const productLines = [
  {
    name: "FortiGate NGFW",
    category: "Next-Gen Firewall",
    description: "The world's most deployed network firewall with over 50% global market share. Consolidates firewall, IPS, application control, SSL inspection, and SD-WAN in a single appliance.",
    specs: "Gartner MQ Leader · SD-WAN built-in · ASIC-accelerated · Up to 100 Gbps throughput",
    highlight: true,
  },
  {
    name: "FortiSASE",
    category: "SASE / Cloud Security",
    description: "Cloud-delivered Secure Access Service Edge (SASE) that brings FortiGate security to remote users and branch offices — no hardware required, managed through FortiCloud.",
    specs: "ZTNA · CASB · SWG · FWaaS · Cloud-managed · Agent-based & agentless",
    highlight: false,
  },
  {
    name: "FortiSwitch & FortiAP",
    category: "LAN & Wireless",
    description: "Fortinet-managed network switches and Wi-Fi access points that integrate directly with FortiGate for unified policy enforcement and Security Fabric visibility across your entire LAN.",
    specs: "FortiLink integration · PoE+ switches · Wi-Fi 6 APs · VLAN & microsegmentation",
    highlight: false,
  },
];

const services = [
  {
    icon: Shield,
    title: "FortiGate Firewall",
    subtitle: "Next-Generation Firewall",
    description:
      "Enterprise NGFW with ASIC-accelerated threat inspection, application control, IPS, antivirus, web filtering, and sandboxing — all in a single FortiOS operating system at every tier from desktop to data center.",
    highlights: [
      "ASIC-accelerated SSL inspection",
      "IPS, antivirus & web filtering",
      "Application control",
      "SD-WAN built-in (no add-on cost)",
    ],
    color: FORT_RED,
  },
  {
    icon: Globe,
    title: "SD-WAN",
    subtitle: "Secure SD-WAN (Built into FortiGate)",
    description:
      "Fortinet SD-WAN is included in every FortiGate at no additional license cost. Intelligent path selection, SLA-based routing, automatic failover, and centralized management via FortiManager.",
    highlights: [
      "Included in all FortiGate models",
      "SLA-based application routing",
      "Multi-link failover",
      "Centralized policy via FortiManager",
    ],
    color: "#7c3aed",
  },
  {
    icon: Lock,
    title: "Zero Trust Network Access",
    subtitle: "ZTNA / FortiSASE",
    description:
      "ZTNA replaces VPN with identity-verified, device-posture-checked application access. FortiSASE delivers this as a cloud service for remote and hybrid workforces — with no hardware at the edge.",
    highlights: [
      "Identity & device verification",
      "Per-application access control",
      "Agentless ZTNA available",
      "Cloud-managed via FortiSASE",
    ],
    color: "#dc2626",
  },
  {
    icon: Eye,
    title: "FortiSIEM & SOC",
    subtitle: "Threat Detection & SIEM",
    description:
      "AI-driven SIEM that correlates logs from your entire Fortinet Security Fabric and third-party tools, detecting threats and automating incident response — with UEBA for insider threat detection.",
    highlights: [
      "AI-powered threat correlation",
      "UEBA (user behavior analytics)",
      "Automated incident response",
      "Third-party log ingestion",
    ],
    color: "#0891b2",
  },
  {
    icon: Wifi,
    title: "FortiSwitch & FortiAP",
    subtitle: "Secure LAN & Wireless",
    description:
      "Fortinet switches and Wi-Fi 6 access points integrate with FortiGate via FortiLink — enabling consistent security policies, VLAN management, and automatic device quarantine across your wired and wireless network.",
    highlights: [
      "FortiLink-managed from FortiGate",
      "Wi-Fi 6 access points",
      "VLAN & microsegmentation",
      "Automatic device quarantine",
    ],
    color: "#16a34a",
  },
  {
    icon: Server,
    title: "OT / Industrial Security",
    subtitle: "ICS & SCADA Protection",
    description:
      "Fortinet is one of the few vendors with purpose-built OT security — hardened FortiGate appliances for industrial environments, passive OT asset discovery, and ICS/SCADA protocol inspection.",
    highlights: [
      "ICS & SCADA protocol inspection",
      "Passive OT asset discovery",
      "Hardened industrial FortiGate",
      "Air-gap & purdue model support",
    ],
    color: "#ea580c",
  },
];

const whyUs = [
  {
    title: "50%+ Global Firewall Market Share",
    description:
      "FortiGate is the most deployed network firewall in the world, recognized as a Gartner Magic Quadrant Leader in Hybrid Mesh Firewall for 2025.",
  },
  {
    title: "Security Fabric — Single Platform",
    description:
      "Fortinet's Security Fabric integrates all Fortinet products — firewall, switches, APs, endpoint, SIEM, and cloud security — into one unified management and threat intelligence ecosystem.",
  },
  {
    title: "SD-WAN Included at No Extra Cost",
    description:
      "Unlike Palo Alto Networks, Cisco, and others, Fortinet's SD-WAN is a native feature of FortiOS — no separate license, no extra appliance, and no hidden fees.",
  },
  {
    title: "ASIC-Powered Performance",
    description:
      "Fortinet's proprietary NP and CP ASICs deliver SSL/TLS inspection at wire speed without the performance degradation seen on competing firewalls — often 5–10x faster.",
  },
  {
    title: "Gartner Leader: 15 Consecutive Years",
    description:
      "Fortinet has appeared in Gartner's Magic Quadrant for enterprise firewalls for 15 consecutive years, with consistent recognition for its security effectiveness and price-to-performance.",
  },
  {
    title: "OT & Critical Infrastructure Ready",
    description:
      "For manufacturing, utilities, healthcare, and industrial environments, Fortinet's OT security portfolio protects ICS and SCADA systems where most competitors have no purpose-built solution.",
  },
];

const idealFor = [
  {
    type: "SMB & Branch Offices",
    plans: "FortiGate 40F/60F (NGFW + SD-WAN) + FortiAP Wi-Fi",
    icon: Building2,
  },
  {
    type: "Mid-Market (Distributed Sites)",
    plans: "FortiGate 100F + FortiSwitch + FortiSASE for remote users",
    icon: Layers,
  },
  {
    type: "Enterprise / OT / Data Center",
    plans: "FortiGate 1000F + FortiSIEM + Security Fabric + OT security",
    icon: Globe,
  },
];

export default function Fortinet() {
  return (
    <div className="w-full bg-background">
      {/* Hero */}
      <motion.div
        className="text-white py-16 px-4 sm:px-6 lg:px-8"
        style={{ background: `linear-gradient(135deg, ${FORT_DARK} 0%, ${FORT_RED} 100%)` }}
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
              <div className="text-red-200 text-sm font-semibold uppercase tracking-wide">Gartner Leader · World's #1 Firewall</div>
              <h1 className="text-4xl font-bold">Fortinet</h1>
            </div>
          </div>
          <p className="text-red-100 text-lg mt-4 max-w-2xl leading-relaxed">
            The world's most deployed network firewall platform. FortiGate NGFW, SD-WAN (included), SASE, Zero Trust, and OT security — all on one operating system with unified management.
          </p>
          <div className="flex flex-wrap gap-4 mt-8">
            <button
              onClick={() => document.getElementById('inquiry-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white font-bold hover:bg-red-50 transition-colors" style={{ color: FORT_DARK }}
            >
              <ArrowRight className="w-5 h-5" />
              Request a Quote
            </button>
          </div>

          <div className="grid grid-cols-3 gap-6 mt-12 border-t border-white/20 pt-10">
            {[
              { value: "50%+", label: "Global firewall market share" },
              { value: "15 yrs", label: "Gartner MQ Leader" },
              { value: "100 Gbps", label: "Max throughput (high-end)" },
            ].map(({ value, label }) => (
              <div key={label}>
                <div className="text-2xl font-bold text-white">{value}</div>
                <div className="text-red-200 text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-16">

        {/* Product Lines */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Core Fortinet Products</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Every Fortinet product runs on FortiOS and integrates into the Security Fabric — giving you unified visibility and policy across your entire infrastructure.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {productLines.map((product) => (
              <motion.div
                key={product.name}
                className={`rounded-xl border-2 overflow-hidden transition-all ${
                  product.highlight ? "border-red-500 ring-2 ring-red-200 shadow-xl" : "border-border"
                }`}
                whileHover={{ y: -4 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                {product.highlight && (
                  <div className="px-4 py-2 text-xs font-bold text-white text-center" style={{ backgroundColor: FORT_RED }}>
                    WORLD'S #1 NGFW
                  </div>
                )}
                <div className="p-6 bg-card">
                  <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: FORT_RED }}>{product.category}</p>
                  <h3 className="text-xl font-bold text-foreground mb-3">{product.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{product.description}</p>
                  <div className="text-xs text-muted-foreground bg-muted rounded-lg p-3 leading-relaxed">
                    {product.specs}
                  </div>
                  <Link href="/contact">
                    <a className="mt-5 block w-full text-center px-4 py-3 rounded-lg font-bold text-white transition-all" style={{ backgroundColor: product.highlight ? FORT_RED : FORT_DARK }}>
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
            <h2 className="text-3xl font-bold text-foreground mb-4">Full Fortinet Security Portfolio</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              NGFW, SD-WAN, SASE, Zero Trust, SIEM, OT security, and managed switches — all from one vendor on one operating system.
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

        {/* Why Fortinet */}
        <motion.section
          className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-foreground mb-10 text-center">Why Fortinet?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyUs.map((item) => (
              <div key={item.title} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: FORT_RED }}>
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
                <Icon className="w-8 h-8 mb-4" style={{ color: FORT_RED }} />
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
              <h2 className="text-3xl font-bold text-foreground mb-3">Get a Fortinet Quote</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                The world's #1 deployed network security platform — tell us about your environment and we'll size the right Fortinet Security Fabric for your organization.
              </p>
            </div>
            <div id="inquiry-form" className="bg-white rounded-2xl shadow-xl p-8 md:p-10 border border-border">
              <VendorInquiryForm
                vendorName="Fortinet"
                vendorSlug="fortinet"
                accentColor={FORT_RED}
                accentDark={FORT_DARK}
                services={[
                  "FortiGate NGFW (Next-Gen Firewall)",
                  "Fortinet SD-WAN (built into FortiGate)",
                  "FortiSASE / ZTNA (Zero Trust Network Access)",
                  "FortiSwitch (LAN Access)",
                  "FortiAP (Wi-Fi Access Points)",
                  "FortiSIEM / FortiSOAR (Security Operations)",
                  "OT / Industrial Security (FortiGuard OT)",
                ]}
                extraFields={[
                  { id: "locations", label: "Number of Sites / Locations", type: "select", options: ["1", "2–5", "6–20", "21–100", "100+"], required: true },
                  { id: "users", label: "Number of Users / Endpoints", type: "select", options: ["Under 50", "50–200", "200–1,000", "1,000–5,000", "5,000+"] },
                  { id: "environment", label: "Environment Type", type: "select", options: ["Corporate office", "Distributed branch offices", "Data center / hybrid cloud", "Industrial / OT (manufacturing, utilities)", "K-12 or higher education", "Healthcare"] },
                  { id: "existing_firewall", label: "Existing Firewall / Security Stack", type: "text", placeholder: "e.g. Cisco ASA, Palo Alto, pfSense, none…" },
                ]}
              />
            </div>
            <p className="text-xs text-center text-muted-foreground mt-4">
              * Fortinet pricing varies by hardware model, throughput tier, and FortiCare / FortiGuard subscription. Contact us for a full BOM and licensing quote.
            </p>
          </div>
        </motion.section>

        {/* CTA */}
        <motion.div
          className="text-white rounded-xl p-12 text-center"
          style={{ background: `linear-gradient(135deg, ${FORT_DARK} 0%, ${FORT_RED} 100%)` }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-4">Secure Your Network with Fortinet</h2>
          <p className="text-red-100 text-lg mb-8 max-w-xl mx-auto">
            From a branch-office FortiGate to a full enterprise Security Fabric deployment — we design, size, and deploy Fortinet solutions that fit your risk profile and budget.
          </p>
          <Link href="/contact">
            <a className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-white font-bold hover:bg-red-50 transition-colors text-lg" style={{ color: FORT_DARK }}>
              <ArrowRight className="w-5 h-5" />
              Get a Custom Quote
            </a>
          </Link>
          <p className="text-red-200 text-sm mt-5">Authorized Fortinet partner · NGFW, SD-WAN & SASE deployments</p>
        </motion.div>

      </div>
    </div>
  );
}
