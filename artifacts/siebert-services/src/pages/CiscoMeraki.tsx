import { motion } from "framer-motion";
import {
  Wifi, Shield, Server, Building2, CheckCircle,
  ExternalLink, Globe, ArrowRight, Layers, Camera, Network, Cloud
} from "lucide-react";
import { Link } from "wouter";

const CISCO_BLUE = "#00bceb";
const CISCO_DARK = "#005073";

const productLines = [
  {
    name: "Meraki MR (Wireless)",
    category: "Wi-Fi Access Points",
    description: "Wi-Fi 6/6E access points with built-in security, automatic firmware updates, and cloud management. Deploy hundreds of APs from a single dashboard with no controller hardware.",
    specs: "Wi-Fi 6E · Indoor & outdoor APs · RF optimization · Guest network segmentation",
    highlight: false,
  },
  {
    name: "Meraki MS (Switching)",
    category: "Cloud-Managed Switches",
    description: "Stackable and access layer switches managed entirely from the Meraki cloud dashboard. PoE+, VLAN segmentation, port scheduling, and cable diagnostics — all remotely configurable.",
    specs: "8–384 ports · PoE+ & PoE++ · Layer 2 & Layer 3 · Remote cable diagnostics",
    highlight: true,
  },
  {
    name: "Meraki MX (Security)",
    category: "Security Appliances & SD-WAN",
    description: "Next-generation firewall and SD-WAN in one device. Stateful firewall, content filtering, Cisco Advanced Malware Protection (AMP), and automatic VPN tunnel provisioning.",
    specs: "NGFW · SD-WAN · Cisco AMP · Auto VPN · Content filtering",
    highlight: false,
  },
];

const services = [
  {
    icon: Wifi,
    title: "Meraki Wireless (MR)",
    subtitle: "Wi-Fi 6 & 6E Access Points",
    description:
      "Enterprise Wi-Fi access points with automatic channel planning, RF optimization, and built-in security scanning. Centrally managed from the Meraki dashboard — no WLAN controller required.",
    highlights: [
      "Wi-Fi 6 & 6E (802.11ax)",
      "Indoor and outdoor APs",
      "Guest network isolation",
      "Automatic RF management",
    ],
    color: CISCO_BLUE,
  },
  {
    icon: Network,
    title: "Meraki Switching (MS)",
    subtitle: "Cloud-Managed Switches",
    description:
      "PoE-capable access and aggregation switches with port-level visibility, VLAN management, and remote troubleshooting. Deploy, configure, and monitor from anywhere via the Meraki dashboard.",
    highlights: [
      "PoE+ / PoE++ support",
      "VLAN & QoS management",
      "Remote cable diagnostics",
      "Port schedules & alerts",
    ],
    color: "#7c3aed",
  },
  {
    icon: Shield,
    title: "Meraki Security (MX)",
    subtitle: "NGFW & SD-WAN Appliance",
    description:
      "Enterprise-grade security and SD-WAN in one device. Stateful firewall, intrusion prevention, Cisco AMP for malware protection, and site-to-site Auto VPN with zero-touch provisioning.",
    highlights: [
      "Stateful NGFW & IPS",
      "Cisco Advanced Malware Protection",
      "SD-WAN with multi-uplink failover",
      "Auto VPN (zero-touch)",
    ],
    color: "#dc2626",
  },
  {
    icon: Camera,
    title: "Meraki MV (Cameras)",
    subtitle: "Smart Cloud-Managed Cameras",
    description:
      "IP security cameras with onboard storage, cloud archiving, and AI-powered motion search. Review footage from any browser without NVR hardware — and share video clips via secure link.",
    highlights: [
      "Onboard SSD storage",
      "AI motion search",
      "Cloud archiving available",
      "No NVR required",
    ],
    color: "#16a34a",
  },
  {
    icon: Cloud,
    title: "Meraki Dashboard",
    subtitle: "Unified Cloud Management",
    description:
      "A single cloud dashboard that manages all Meraki devices — APs, switches, security appliances, cameras, and IoT sensors — with real-time visibility, alerting, and API access.",
    highlights: [
      "Single pane of glass",
      "Real-time network health",
      "RESTful API access",
      "Multi-site management",
    ],
    color: "#0891b2",
  },
  {
    icon: Globe,
    title: "Cisco Catalyst (Enterprise)",
    subtitle: "On-Prem & Hybrid Networking",
    description:
      "For enterprises needing traditional on-premises infrastructure, Cisco Catalyst switches and routers deliver carrier-grade reliability with Cisco DNA Center for centralized management.",
    highlights: [
      "Cisco Catalyst 9000 series",
      "Cisco DNA Center automation",
      "High availability clustering",
      "MPLS & segment routing",
    ],
    color: "#ea580c",
  },
];

const whyUs = [
  {
    title: "Single Dashboard for Everything",
    description:
      "Meraki's cloud dashboard manages your entire network — Wi-Fi, switching, security, cameras, and IoT — from one browser-based interface accessible from anywhere.",
  },
  {
    title: "Zero-Touch Provisioning",
    description:
      "Ship Meraki devices to remote offices and they automatically phone home to the dashboard and configure themselves. No on-site IT required for multi-site deployments.",
  },
  {
    title: "Cisco's Threat Intelligence",
    description:
      "Meraki MX appliances are backed by Cisco Talos — one of the largest commercial threat intelligence teams in the world — blocking millions of threats daily.",
  },
  {
    title: "Automatic Updates & No Refresh Cycles",
    description:
      "Firmware updates are pushed automatically from the cloud. Your Meraki hardware stays current without scheduled maintenance windows or manual update procedures.",
  },
  {
    title: "Built for Multi-Site Businesses",
    description:
      "Deploy consistent network policies across 5 or 5,000 locations from a single dashboard. Meraki Auto VPN connects sites securely in minutes, not weeks.",
  },
  {
    title: "Gartner Magic Quadrant Leader",
    description:
      "Cisco is consistently recognized as a Leader in Gartner's Magic Quadrant for both wired and wireless LAN infrastructure — a testament to reliability and market reach.",
  },
];

const idealFor = [
  {
    type: "Retail / Distributed Locations",
    plans: "Meraki MX (security) + MR (Wi-Fi) + MS (switching) per branch",
    icon: Building2,
  },
  {
    type: "Healthcare / Education Campuses",
    plans: "Meraki MR + MV cameras + MS switches + dashboard compliance tools",
    icon: Layers,
  },
  {
    type: "Enterprise / Multi-National",
    plans: "Cisco Catalyst + Meraki cloud management + DNA Center + Auto VPN",
    icon: Globe,
  },
];

export default function CiscoMeraki() {
  return (
    <div className="w-full bg-background">
      {/* Hero */}
      <motion.div
        className="text-white py-16 px-4 sm:px-6 lg:px-8"
        style={{ background: `linear-gradient(135deg, ${CISCO_DARK} 0%, ${CISCO_BLUE} 100%)` }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-white/15">
              <Network className="w-6 h-6" />
            </div>
            <div>
              <div className="text-cyan-200 text-sm font-semibold uppercase tracking-wide">Cloud-Managed Networking · Gartner Leader</div>
              <h1 className="text-4xl font-bold">Cisco Meraki</h1>
            </div>
          </div>
          <p className="text-cyan-100 text-lg mt-4 max-w-2xl leading-relaxed">
            The world's leading cloud-managed networking platform. Wi-Fi, switching, security, cameras, and SD-WAN — all managed from a single Meraki dashboard with zero-touch provisioning.
          </p>
          <div className="flex flex-wrap gap-4 mt-8">
            <Link href="/contact">
              <a className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white font-bold hover:bg-cyan-50 transition-colors" style={{ color: CISCO_DARK }}>
                <ArrowRight className="w-5 h-5" />
                Request a Quote
              </a>
            </Link>
            <a
              href="https://meraki.cisco.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold border border-white/40 text-white hover:bg-white/10 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Visit Cisco Meraki
            </a>
          </div>

          <div className="grid grid-cols-3 gap-6 mt-12 border-t border-white/20 pt-10">
            {[
              { value: "500K+", label: "Networks deployed" },
              { value: "1 Dashboard", label: "Manages everything" },
              { value: "Wi-Fi 6E", label: "Latest wireless standard" },
            ].map(({ value, label }) => (
              <div key={label}>
                <div className="text-2xl font-bold text-white">{value}</div>
                <div className="text-cyan-200 text-sm">{label}</div>
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
            <h2 className="text-3xl font-bold text-foreground mb-4">Core Meraki Product Lines</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Every Meraki product is cloud-managed, self-updating, and centrally monitored from the same dashboard.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {productLines.map((product) => (
              <motion.div
                key={product.name}
                className={`rounded-xl border-2 overflow-hidden transition-all ${
                  product.highlight ? "border-cyan-500 ring-2 ring-cyan-200 shadow-xl" : "border-border"
                }`}
                whileHover={{ y: -4 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                {product.highlight && (
                  <div className="px-4 py-2 text-xs font-bold text-white text-center" style={{ backgroundColor: CISCO_BLUE }}>
                    MOST DEPLOYED
                  </div>
                )}
                <div className="p-6 bg-card">
                  <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: CISCO_BLUE }}>{product.category}</p>
                  <h3 className="text-xl font-bold text-foreground mb-3">{product.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{product.description}</p>
                  <div className="text-xs text-muted-foreground bg-muted rounded-lg p-3 leading-relaxed">
                    {product.specs}
                  </div>
                  <Link href="/contact">
                    <a className="mt-5 block w-full text-center px-4 py-3 rounded-lg font-bold text-white transition-all" style={{ backgroundColor: product.highlight ? CISCO_BLUE : CISCO_DARK }}>
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
            <h2 className="text-3xl font-bold text-foreground mb-4">Complete Cisco / Meraki Portfolio</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              From cloud-managed access points to enterprise Catalyst switching and traditional Cisco infrastructure — we source and deploy the full Cisco portfolio.
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

        {/* Why Cisco Meraki */}
        <motion.section
          className="bg-gradient-to-br from-cyan-50 to-cyan-100 border border-cyan-200 rounded-xl p-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-foreground mb-10 text-center">Why Cisco Meraki?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyUs.map((item) => (
              <div key={item.title} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: CISCO_BLUE }}>
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
                <Icon className="w-8 h-8 mb-4" style={{ color: CISCO_BLUE }} />
                <h3 className="font-bold text-foreground mb-2">{type}</h3>
                <p className="text-sm text-muted-foreground">{plans}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* CTA */}
        <motion.div
          className="text-white rounded-xl p-12 text-center"
          style={{ background: `linear-gradient(135deg, ${CISCO_DARK} 0%, ${CISCO_BLUE} 100%)` }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-4">Build Your Network on Cisco Meraki</h2>
          <p className="text-cyan-100 text-lg mb-8 max-w-xl mx-auto">
            From a single-office Wi-Fi deployment to a 500-site enterprise network with cameras and SD-WAN — we design, deploy, and support Cisco Meraki solutions.
          </p>
          <Link href="/contact">
            <a className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-white font-bold hover:bg-cyan-50 transition-colors text-lg" style={{ color: CISCO_DARK }}>
              <ArrowRight className="w-5 h-5" />
              Get a Custom Quote
            </a>
          </Link>
          <p className="text-cyan-200 text-sm mt-5">Authorized Cisco / Meraki partner · Design, supply & deployment</p>
        </motion.div>

      </div>
    </div>
  );
}
