import { motion } from "framer-motion";
import {
  Wifi, Phone, Tv, Shield, Zap, Building2, CheckCircle,
  ExternalLink, Server, Globe, ArrowRight, Layers, Radio
} from "lucide-react";
import { Link } from "wouter";
import { VendorInquiryForm } from "@/components/forms/VendorInquiryForm";

const ALTICE_BLUE = "#00a0e3";
const ALTICE_DARK = "#003087";

const internetPlans = [
  {
    name: "Secure Fiber 500",
    speed: "500 Mbps",
    symmetric: true,
    price: "$65/mo",
    priceNote: "24-mo. promo w/ Auto Pay",
    highlight: false,
    features: [
      "500 Mbps download & upload",
      "Symmetrical fiber speeds",
      "Built-in network security",
      "Optional connection backup",
      "No data caps",
    ],
  },
  {
    name: "Secure Fiber 1 Gig",
    speed: "1 Gbps",
    symmetric: true,
    price: "$145/mo",
    priceNote: "24-mo. promo w/ Auto Pay",
    highlight: true,
    features: [
      "940 Mbps download & upload",
      "Symmetrical fiber speeds",
      "Built-in network security",
      "Optional connection backup ($30/mo)",
      "No data caps",
      "Priority support",
    ],
  },
  {
    name: "Secure Fiber 2–8 Gig",
    speed: "Up to 8 Gbps",
    symmetric: true,
    price: "Custom Quote",
    priceNote: "Contact us for pricing",
    highlight: false,
    features: [
      "2, 5, or 8 Gbps tiers available",
      "Symmetrical fiber speeds",
      "Built-in network security",
      "Dedicated account manager",
      "SLA-backed uptime guarantees",
      "Enterprise-grade support",
    ],
  },
];

const services = [
  {
    icon: Wifi,
    title: "Business Internet",
    subtitle: "Optimum Business",
    description: "Symmetrical fiber internet with built-in security protection. No throttling, no data caps, and optional 4G LTE backup to keep your business online when it matters most.",
    highlights: ["500 Mbps – 8 Gbps symmetric", "Built-in DDoS & threat protection", "Optional 4G LTE backup", "Static IP available"],
    color: ALTICE_BLUE,
  },
  {
    icon: Phone,
    title: "Business Voice",
    subtitle: "SIP, PRI & Hosted VoIP",
    description: "Flat-rate unlimited calling to the US, Canada, Puerto Rico, and USVI. Choose from traditional business lines, SIP trunking for your PBX, or a fully hosted cloud VoIP system.",
    highlights: ["Unlimited US/Canada calling", "SIP Trunking & PRI available", "Hosted VoIP (cloud PBX)", "Auto-attendant & voicemail"],
    color: "#7c3aed",
  },
  {
    icon: Tv,
    title: "Business TV",
    subtitle: "Optimum Business TV",
    description: "Keep customers and employees entertained with flexible business TV packages. From waiting rooms to break rooms, streaming and commercial-grade channels available.",
    highlights: ["Commercial licensing included", "HD channels & sports packages", "Stream to multiple locations", "No residential restrictions"],
    color: "#16a34a",
  },
  {
    icon: Server,
    title: "Dedicated Fiber (Lightpath)",
    subtitle: "Enterprise & Midmarket",
    description: "Lightpath, Altice's enterprise arm, delivers 100% fiber dedicated internet access from 20 Mbps to 100 Gbps with guaranteed SLAs, symmetrical bandwidth, and managed services.",
    highlights: ["20 Mbps – 100 Gbps dedicated", "100% fiber, SLA-backed", "Managed SD-WAN available", "Private Ethernet & MPLS"],
    color: ALTICE_DARK,
  },
  {
    icon: Shield,
    title: "Managed Security",
    subtitle: "Network & Endpoint",
    description: "Built-in network-level threat protection comes with every Secure Fiber plan. Enterprise-grade firewall management, DDoS mitigation, and 24/7 monitoring available as add-ons.",
    highlights: ["DDoS mitigation included", "Managed firewall option", "24/7 network monitoring", "Threat intelligence alerts"],
    color: "#dc2626",
  },
  {
    icon: Radio,
    title: "Business Mobile",
    subtitle: "Optimum Mobile for Business",
    description: "Mobile lines for your team with flexible data plans and the ability to bundle with internet and voice for simplified billing and one point of contact for all connectivity.",
    highlights: ["Unlimited data plans", "Bundle with internet & voice", "BYOD supported", "Business account management"],
    color: "#ea580c",
  },
];

const whyUs = [
  {
    title: "21-State Footprint",
    description: "One of the largest broadband providers in the U.S. — 375,000+ business customers across the East Coast and beyond.",
  },
  {
    title: "True Symmetric Fiber",
    description: "Unlike cable-based competitors, Optimum Business fiber delivers equal upload and download speeds — critical for video conferencing, cloud backups, and VoIP.",
  },
  {
    title: "Built-In Security",
    description: "Every Secure Fiber plan includes network-level threat protection with no additional fee. Your connection is monitored and protected from day one.",
  },
  {
    title: "No Long-Term Contracts",
    description: "Month-to-month flexibility available. No early termination fees trapping your business into outdated plans.",
  },
  {
    title: "Connection Backup",
    description: "Optional 4G LTE failover add-on ensures your business stays online even if your primary connection experiences an outage.",
  },
  {
    title: "Scalable From SMB to Enterprise",
    description: "From a single office on 500 Mbps fiber to a multi-site enterprise on Lightpath dedicated 100G fiber — one provider grows with you.",
  },
];

const idealFor = [
  { type: "Small Business (1–20 employees)", plans: "Secure Fiber 500 or 1 Gig + Business Phone", icon: Building2 },
  { type: "Mid-Market (20–200 employees)", plans: "Secure Fiber 1–8 Gig + SIP Trunking + TV", icon: Layers },
  { type: "Enterprise / Multi-Site", plans: "Lightpath Dedicated Fiber + SD-WAN + MPLS", icon: Globe },
];

export default function Altice() {
  return (
    <div className="w-full bg-background">
      {/* Hero */}
      <motion.div
        className="text-white py-16 px-4 sm:px-6 lg:px-8"
        style={{ background: `linear-gradient(135deg, ${ALTICE_DARK} 0%, ${ALTICE_BLUE} 100%)` }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-white/15">
              <Wifi className="w-6 h-6" />
            </div>
            <div>
              <div className="text-blue-200 text-sm font-semibold uppercase tracking-wide">Formerly Altice Business</div>
              <h1 className="text-4xl font-bold">Optimum Business</h1>
            </div>
          </div>
          <p className="text-blue-100 text-lg mt-4 max-w-2xl leading-relaxed">
            Symmetric fiber internet, business voice, TV, mobile, and enterprise dedicated fiber — all from one of the largest connectivity providers on the East Coast.
          </p>
          <div className="flex flex-wrap gap-4 mt-8">
            <Link href="/contact">
              <a className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white font-bold hover:bg-blue-50 transition-colors" style={{ color: ALTICE_DARK }}>
                <ArrowRight className="w-5 h-5" />
                Request a Quote
              </a>
            </Link>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-6 mt-12 border-t border-white/20 pt-10">
            {[
              { value: "375K+", label: "Business customers" },
              { value: "21", label: "States served" },
              { value: "100 Gbps", label: "Max enterprise speed" },
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

        {/* Internet Plans */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Fiber Internet Plans</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Symmetric fiber with equal upload and download speeds. No throttling. No data caps. Built-in security on every plan.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {internetPlans.map((plan) => (
              <motion.div
                key={plan.name}
                className={`rounded-xl border-2 overflow-hidden transition-all ${
                  plan.highlight
                    ? "border-blue-500 ring-2 ring-blue-200 shadow-xl"
                    : "border-border"
                }`}
                whileHover={{ y: -4 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                {plan.highlight && (
                  <div className="px-4 py-2 text-xs font-bold text-white text-center" style={{ backgroundColor: ALTICE_BLUE }}>
                    MOST POPULAR
                  </div>
                )}
                <div className="p-6 bg-card">
                  <h3 className="text-xl font-bold text-foreground mb-1">{plan.name}</h3>
                  <div className="text-3xl font-bold mb-1" style={{ color: ALTICE_BLUE }}>{plan.price}</div>
                  <p className="text-xs text-muted-foreground mb-4">{plan.priceNote}</p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-5" style={{ backgroundColor: `${ALTICE_BLUE}15`, color: ALTICE_BLUE }}>
                    <Zap className="w-3 h-3" /> {plan.speed} symmetric
                  </div>
                  <ul className="space-y-2.5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 mt-0.5 shrink-0 text-green-500" />
                        <span className="text-sm text-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/contact">
                    <a className="mt-6 block w-full text-center px-4 py-3 rounded-lg font-bold text-white transition-all" style={{ backgroundColor: plan.highlight ? ALTICE_BLUE : ALTICE_DARK }}>
                      Get This Plan
                    </a>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Services Overview */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Full Suite of Business Services</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              One provider, one bill. Internet, voice, TV, mobile, and enterprise fiber — all from Optimum Business.
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

        {/* Why Optimum Business */}
        <motion.section
          className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-foreground mb-10 text-center">Why Optimum Business?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyUs.map((item) => (
              <div key={item.title} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: ALTICE_BLUE }}>
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

        {/* Ideal Use Cases */}
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
                <Icon className="w-8 h-8 mb-4" style={{ color: ALTICE_BLUE }} />
                <h3 className="font-bold text-foreground mb-2">{type}</h3>
                <p className="text-sm text-muted-foreground">{plans}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Lightpath Callout */}
        <motion.section
          className="rounded-xl overflow-hidden border border-border"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="px-8 py-5 text-white" style={{ backgroundColor: ALTICE_DARK }}>
            <div className="flex items-center gap-3">
              <Server className="w-5 h-5" />
              <h2 className="text-xl font-bold">Lightpath — Enterprise Dedicated Fiber</h2>
            </div>
          </div>
          <div className="p-8 bg-card">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Lightpath is Altice's enterprise-grade fiber arm, jointly operated with Morgan Stanley Infrastructure Partners. For over 30 years, Lightpath has served enterprises, governments, and educational institutions across the Northeast with 100% fiber infrastructure.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Lightpath delivers Dedicated Internet Access (DIA), Ethernet, SD-WAN, MPLS, and managed services — with bandwidth from 20 Mbps all the way to 100 Gbps on a fiber network spanning 14,000+ lit locations.
                </p>
              </div>
              <div className="space-y-3">
                {[
                  ["Bandwidth", "20 Mbps – 100 Gbps symmetric dedicated"],
                  ["Network", "100% fiber, 14,000+ lit locations"],
                  ["SLA", "Guaranteed uptime with financial-backed SLA"],
                  ["Services", "DIA, Ethernet, MPLS, SD-WAN, managed"],
                  ["Pricing", "Custom quote — contact us"],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-start gap-3 text-sm border-b border-border pb-3 last:border-0">
                    <span className="font-bold text-foreground w-24 shrink-0">{label}:</span>
                    <span className="text-muted-foreground">{value}</span>
                  </div>
                ))}
                <Link href="/contact">
                  <a className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-white text-sm" style={{ backgroundColor: ALTICE_DARK }}>
                    <ArrowRight className="w-4 h-4" /> Get a Lightpath Quote
                  </a>
                </Link>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Residential Services Section */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Optimum Residential Services</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Looking for home internet, TV, or phone service? Optimum (formerly Altice) offers competitive residential plans for homeowners and renters across their service footprint.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Optimum Internet 300",
                speed: "300 Mbps",
                price: "$40/mo",
                priceNote: "12-mo. promotion · no annual contract",
                color: ALTICE_BLUE,
                features: [
                  "300 Mbps download",
                  "Unlimited data",
                  "Free modem included",
                  "Access to Wi-Fi hotspots",
                  "Stream HD on 4+ devices",
                ],
              },
              {
                name: "Optimum Internet 500",
                speed: "500 Mbps",
                price: "$55/mo",
                priceNote: "12-mo. promotion · no annual contract",
                color: ALTICE_BLUE,
                highlight: true,
                features: [
                  "500 Mbps download",
                  "Unlimited data",
                  "Free modem included",
                  "Wi-Fi equipment upgrade available",
                  "Stream 4K on 8+ devices",
                ],
              },
              {
                name: "Optimum 1 Gig",
                speed: "1 Gbps",
                price: "$70/mo",
                priceNote: "12-mo. promotion · no annual contract",
                color: ALTICE_BLUE,
                features: [
                  "1 Gbps download",
                  "Unlimited data",
                  "Advanced Wi-Fi 6 router available",
                  "Whole-home coverage add-on",
                  "Ideal for smart home & gaming",
                ],
              },
            ].map((plan) => (
              <motion.div
                key={plan.name}
                className={`rounded-xl border-2 overflow-hidden ${plan.highlight ? "border-blue-500 ring-2 ring-blue-200 shadow-xl" : "border-border"}`}
                whileHover={{ y: -4 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                {plan.highlight && (
                  <div className="px-4 py-2 text-xs font-bold text-white text-center" style={{ backgroundColor: ALTICE_BLUE }}>
                    MOST POPULAR HOME PLAN
                  </div>
                )}
                <div className="p-6 bg-card">
                  <h3 className="text-xl font-bold text-foreground mb-1">{plan.name}</h3>
                  <div className="text-3xl font-bold mb-1" style={{ color: ALTICE_BLUE }}>{plan.price}</div>
                  <p className="text-xs text-muted-foreground mb-4">{plan.priceNote}</p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-5" style={{ backgroundColor: `${ALTICE_BLUE}15`, color: ALTICE_BLUE }}>
                    <Wifi className="w-3 h-3" /> {plan.speed} · Home Internet
                  </div>
                  <ul className="space-y-2.5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 mt-0.5 shrink-0 text-green-500" />
                        <span className="text-sm text-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/contact">
                    <a className="mt-6 block w-full text-center px-4 py-3 rounded-lg font-bold text-white transition-all" style={{ backgroundColor: plan.highlight ? ALTICE_BLUE : ALTICE_DARK }}>
                      Get This Plan
                    </a>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Residential bundles */}
          <div className="mt-10 grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Tv,
                title: "Optimum TV",
                desc: "Optimum TV packages for home include 125–420+ channels with sports, news, and entertainment. Stream on TV and mobile with the Optimum TV app.",
                bullets: ["125–420+ channels", "4K streaming on select channels", "DVR service available", "Stream on up to 3 devices"],
              },
              {
                icon: Phone,
                title: "Home Phone",
                desc: "Unlimited local and long-distance calling with caller ID, voicemail, call waiting, and 3-way calling — starting under $15/mo when bundled.",
                bullets: ["Unlimited US/Canada calling", "Caller ID & voicemail", "International calling available", "Bundles save up to $20/mo"],
              },
              {
                icon: Radio,
                title: "Optimum Mobile",
                desc: "Home customers get access to Optimum Mobile — wireless plans that piggyback on their existing Optimum internet account for simplified billing.",
                bullets: ["Unlimited data plans", "Powered by partner 5G network", "No switching fees", "BYOD or new device options"],
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="bg-card border border-border rounded-xl p-6">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: `${ALTICE_BLUE}15` }}>
                    <Icon className="w-5 h-5" style={{ color: ALTICE_BLUE }} />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{item.desc}</p>
                  <ul className="space-y-1.5">
                    {item.bullets.map((b) => (
                      <li key={b} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle className="w-3.5 h-3.5 shrink-0 text-green-500" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </motion.section>

        {/* Brand Note */}
        <motion.div
          className="border border-blue-200 bg-blue-50 rounded-xl px-8 py-6 text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <p>
            <strong className="text-foreground">Brand Note:</strong> Altice USA officially rebranded as <strong className="text-foreground">Optimum Communications</strong> in November 2025. Business services are now marketed under <strong className="text-foreground">Optimum Business</strong> (SMB) and <strong className="text-foreground">Lightpath</strong> (enterprise). Both brands operate under the same network infrastructure and service organization.
          </p>
        </motion.div>

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
              <h2 className="text-3xl font-bold text-foreground mb-3">Get an Optimum / Altice Quote</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Business or residential — tell us what you need and we'll put together an Optimum Business or Lightpath solution within one business day.
              </p>
            </div>
            <div id="inquiry-form" className="bg-white rounded-2xl shadow-xl p-8 md:p-10 border border-border">
              <VendorInquiryForm
                vendorName="Optimum / Altice"
                vendorSlug="altice"
                accentColor={ALTICE_BLUE}
                accentDark={ALTICE_DARK}
                services={[
                  "Optimum Business Internet (SMB)",
                  "Optimum Business Phone",
                  "Optimum Business TV",
                  "Lightpath Dedicated Fiber DIA (Enterprise)",
                  "Lightpath MPLS / Private Network",
                  "Residential Internet (Optimum 300/500/1Gig)",
                  "Residential TV / Phone / Optimum Mobile",
                ]}
                extraFields={[
                  { id: "service_type", label: "Service Type", type: "select", options: ["Business (SMB)", "Enterprise (Lightpath)", "Residential", "Both Business + Residential"], required: true },
                  { id: "locations", label: "Number of Business Locations", type: "select", options: ["1", "2–5", "6–20", "21–100", "100+"] },
                  { id: "bandwidth", label: "Bandwidth Needed", type: "select", options: ["Up to 300 Mbps", "Up to 500 Mbps", "Up to 1 Gbps", "Dedicated 1 Gbps – 10 Gbps (Lightpath)", "Residential — advise me"] },
                ]}
              />
            </div>
            <p className="text-xs text-center text-muted-foreground mt-4">
              * Prices shown are estimated starting rates and vary by location and plan. Optimum Business / Lightpath availability is primarily in the Tri-State area (NY, NJ, CT).
            </p>
          </div>
        </motion.section>

        {/* Final CTA */}
        <motion.div
          className="text-white rounded-xl p-12 text-center"
          style={{ background: `linear-gradient(135deg, ${ALTICE_DARK} 0%, ${ALTICE_BLUE} 100%)` }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-4">Ready to Connect Your Business?</h2>
          <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
            Whether you need a fast fiber connection for a single office or dedicated 100G fiber for your enterprise, we'll find the right Optimum Business plan for you.
          </p>
          <button
            onClick={() => document.getElementById('inquiry-form')?.scrollIntoView({ behavior: 'smooth' })}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-white font-bold hover:bg-blue-50 transition-colors text-lg" style={{ color: ALTICE_DARK }}
          >
            <ArrowRight className="w-5 h-5" />
            Get a Custom Quote
          </button>
          <p className="text-blue-200 text-sm mt-5">Serving businesses across 21 states · No long-term contracts required</p>
        </motion.div>

        {/* Residential Optimum Offer */}
        <motion.div
          className="text-white rounded-xl p-8 text-center mt-12"
          style={{ background: `linear-gradient(135deg, #071225 0%, #0C172B 100%)` }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <p className="text-sm text-gray-200 mb-4">🏠 Looking for residential service?</p>
          <h3 className="text-2xl font-bold mb-2">Save on Optimum Residential Internet</h3>
          <p className="text-gray-300 mb-6 max-w-lg mx-auto">
            Get a <span className="font-bold text-[#E66262]">$50 bill credit</span> on Optimum residential internet service using our exclusive referral link.
          </p>
          <a
            href="https://refer.optimum.com/Richard0!b719e743b0!a"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-[#E66262] font-bold hover:bg-[#d45252] transition-colors text-lg"
          >
            Check Optimum Availability
            <ExternalLink className="w-5 h-5" />
          </a>
        </motion.div>

      </div>
    </div>
  );
}
