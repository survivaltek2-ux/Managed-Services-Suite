import { motion } from "framer-motion";
import {
  Wifi, Phone, Tv, Shield, Zap, Building2, CheckCircle,
  ExternalLink, Globe, ArrowRight, Layers, Server
} from "lucide-react";
import { Link } from "wouter";
import { VendorInquiryForm } from "@/components/forms/VendorInquiryForm";

const COX_BLUE = "#0076ce";
const COX_DARK = "#004899";

const internetPlans = [
  {
    name: "Cox Business Internet 150",
    speed: "150 Mbps",
    upload: "15 Mbps",
    price: "$49.99/mo",
    priceNote: "12-mo. agreement. Prices may vary by location.",
    highlight: false,
    features: [
      "150 Mbps download / 15 Mbps upload",
      "No data caps",
      "Static IP add-on available",
      "Business support 24/7",
      "Free professional installation",
    ],
  },
  {
    name: "Cox Business Internet 500",
    speed: "500 Mbps",
    upload: "50 Mbps",
    price: "$89.99/mo",
    priceNote: "12-mo. agreement. Prices may vary by location.",
    highlight: true,
    features: [
      "500 Mbps download / 50 Mbps upload",
      "No data caps",
      "5 Static IPs included",
      "Built-in security monitoring",
      "24/7 priority support",
      "Wi-Fi equipment available",
    ],
  },
  {
    name: "Cox Business Internet 1 Gig",
    speed: "1 Gbps",
    upload: "100 Mbps",
    price: "$129.99/mo",
    priceNote: "12-mo. agreement. Prices may vary by location.",
    highlight: false,
    features: [
      "1 Gbps download / 100 Mbps upload",
      "No data caps",
      "5 Static IPs included",
      "Advanced security suite",
      "Dedicated account manager",
      "SLA-backed reliability",
    ],
  },
];

const services = [
  {
    icon: Wifi,
    title: "Business Internet",
    subtitle: "Cox Business",
    description:
      "High-speed cable and fiber internet plans from 150 Mbps to 2 Gbps (dedicated fiber up to 100 Gbps). Unlimited data with business-grade static IPs and priority support available.",
    highlights: [
      "150 Mbps – 2 Gbps",
      "No data caps",
      "Static IP included on higher tiers",
      "99.9% uptime SLA",
    ],
    color: COX_BLUE,
  },
  {
    icon: Phone,
    title: "Business Phone",
    subtitle: "Hosted VoIP & SIP Trunking",
    description:
      "Cloud-hosted voice with unlimited local and long-distance calling, auto-attendant, call recording, voicemail-to-email, and full hunt group configuration for your team.",
    highlights: [
      "Unlimited US/Canada calling",
      "Auto-attendant & hunt groups",
      "Call recording & analytics",
      "SIP Trunking for existing PBX",
    ],
    color: "#7c3aed",
  },
  {
    icon: Tv,
    title: "Business TV",
    subtitle: "Cox Business TV",
    description:
      "Commercial-licensed TV service for businesses. Restaurant, retail, hotel, and office deployments supported with flexible channel packages and advanced DVR capabilities.",
    highlights: [
      "Commercial licensing included",
      "200+ HD channels",
      "Sports & news packages",
      "Multi-location available",
    ],
    color: "#16a34a",
  },
  {
    icon: Shield,
    title: "Business Security Suite",
    subtitle: "Network Protection",
    description:
      "Cox Business security includes intrusion detection, firewall management, content filtering, and a 24/7 managed security operations center for threat monitoring and response.",
    highlights: [
      "Managed firewall & IDS",
      "Content filtering",
      "24/7 SOC monitoring",
      "DDoS mitigation",
    ],
    color: "#dc2626",
  },
  {
    icon: Server,
    title: "Dedicated Fiber",
    subtitle: "Enterprise DIA",
    description:
      "Dedicated Internet Access over 100% fiber for enterprises needing symmetric bandwidth with guaranteed SLAs. Available from 10 Mbps to 100 Gbps at select locations.",
    highlights: [
      "10 Mbps – 100 Gbps",
      "Symmetric dedicated bandwidth",
      "99.99% SLA available",
      "Private Ethernet circuits",
    ],
    color: COX_DARK,
  },
  {
    icon: Globe,
    title: "SD-WAN",
    subtitle: "Multi-Site Networking",
    description:
      "Software-defined WAN for businesses with multiple locations. Centralized management, intelligent path selection, automatic failover, and QoS prioritization for critical applications.",
    highlights: [
      "Centralized cloud management",
      "Intelligent path selection",
      "Automatic failover",
      "QoS for VoIP & video",
    ],
    color: "#0891b2",
  },
];

const whyUs = [
  {
    title: "18-State Footprint",
    description:
      "Cox serves over 6 million residential and 350,000+ business customers across 18 states, primarily in the South, West, and Mid-Atlantic regions.",
  },
  {
    title: "Proactive Network Monitoring",
    description:
      "Cox Business watches your connection 24/7 and often identifies and resolves issues before you notice them — reducing downtime and support calls.",
  },
  {
    title: "Dedicated Business Support",
    description:
      "Cox Business customers have access to a separate, dedicated business support team — not the residential call center — with faster response times.",
  },
  {
    title: "Scalable from SMB to Enterprise",
    description:
      "Whether you're a single-location small business on cable internet or a multi-site enterprise on dedicated fiber, Cox Business has a solution that scales with you.",
  },
  {
    title: "Bundled Savings",
    description:
      "Bundling internet, phone, and TV with Cox Business can save up to 30% vs. purchasing services separately. One bill, one point of contact.",
  },
  {
    title: "No Data Caps",
    description:
      "Cox Business never charges overage fees or throttles your business connection. Use as much bandwidth as your operations require.",
  },
];

const idealFor = [
  {
    type: "Small Business (1–25 employees)",
    plans: "Business Internet 150 or 500 + Business Phone",
    icon: Building2,
  },
  {
    type: "Mid-Market (25–200 employees)",
    plans: "Business Internet 1 Gig + Hosted VoIP + Business TV",
    icon: Layers,
  },
  {
    type: "Enterprise / High Availability",
    plans: "Dedicated Fiber DIA + SD-WAN + Managed Security",
    icon: Globe,
  },
];

export default function CoxBusiness() {
  return (
    <div className="w-full bg-background">
      {/* Hero */}
      <motion.div
        className="text-white py-16 px-4 sm:px-6 lg:px-8"
        style={{ background: `linear-gradient(135deg, ${COX_DARK} 0%, ${COX_BLUE} 100%)` }}
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
              <div className="text-blue-200 text-sm font-semibold uppercase tracking-wide">Internet · Voice · TV · Fiber</div>
              <h1 className="text-4xl font-bold">Cox Business</h1>
            </div>
          </div>
          <p className="text-blue-100 text-lg mt-4 max-w-2xl leading-relaxed">
            Internet, phone, TV, dedicated fiber, and SD-WAN from a leading regional provider serving 350,000+ businesses across 18 states.
          </p>
          <div className="flex flex-wrap gap-4 mt-8">
            <Link href="/contact">
              <a className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white font-bold hover:bg-blue-50 transition-colors" style={{ color: COX_DARK }}>
                <ArrowRight className="w-5 h-5" />
                Request a Quote
              </a>
            </Link>
            <a
              href="https://www.cox.com/business/home.html"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold border border-white/40 text-white hover:bg-white/10 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Visit Cox Business
            </a>
          </div>

          <div className="grid grid-cols-3 gap-6 mt-12 border-t border-white/20 pt-10">
            {[
              { value: "350K+", label: "Business customers" },
              { value: "18", label: "States served" },
              { value: "100 Gbps", label: "Max dedicated fiber" },
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
            <h2 className="text-3xl font-bold text-foreground mb-4">Business Internet Plans</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              No data caps, static IPs on higher tiers, and 99.9% uptime SLA — with dedicated business support around the clock.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {internetPlans.map((plan) => (
              <motion.div
                key={plan.name}
                className={`rounded-xl border-2 overflow-hidden transition-all ${
                  plan.highlight ? "border-blue-500 ring-2 ring-blue-200 shadow-xl" : "border-border"
                }`}
                whileHover={{ y: -4 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                {plan.highlight && (
                  <div className="px-4 py-2 text-xs font-bold text-white text-center" style={{ backgroundColor: COX_BLUE }}>
                    MOST POPULAR
                  </div>
                )}
                <div className="p-6 bg-card">
                  <h3 className="text-xl font-bold text-foreground mb-1">{plan.name}</h3>
                  <div className="text-3xl font-bold mb-1" style={{ color: COX_BLUE }}>{plan.price}</div>
                  <p className="text-xs text-muted-foreground mb-4">{plan.priceNote}</p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-5" style={{ backgroundColor: `${COX_BLUE}15`, color: COX_BLUE }}>
                    <Zap className="w-3 h-3" /> {plan.speed} download
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
                    <a className="mt-6 block w-full text-center px-4 py-3 rounded-lg font-bold text-white transition-all" style={{ backgroundColor: plan.highlight ? COX_BLUE : COX_DARK }}>
                      Get This Plan
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
            <h2 className="text-3xl font-bold text-foreground mb-4">Complete Business Service Suite</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Internet, voice, TV, dedicated fiber, SD-WAN, and managed security — all from Cox Business.
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

        {/* Why Cox */}
        <motion.section
          className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-foreground mb-10 text-center">Why Cox Business?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyUs.map((item) => (
              <div key={item.title} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: COX_BLUE }}>
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
                <Icon className="w-8 h-8 mb-4" style={{ color: COX_BLUE }} />
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
              <h2 className="text-3xl font-bold text-foreground mb-3">Get a Cox Business Quote</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                From cable internet and dedicated fiber to SD-WAN and managed security — tell us what you need and we'll put together a Cox Business solution within one business day.
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 border border-border">
              <VendorInquiryForm
                vendorName="Cox Business"
                vendorSlug="cox-business"
                accentColor={COX_BLUE}
                accentDark={COX_DARK}
                services={[
                  "Business Internet (Coax Cable)",
                  "Dedicated Fiber DIA",
                  "Business Phone (VoiceManager)",
                  "Business TV",
                  "SD-WAN & Managed Networking",
                  "Managed Network Security",
                ]}
                extraFields={[
                  { id: "locations", label: "Number of Locations", type: "select", options: ["1", "2–5", "6–20", "21–100", "100+"], required: true },
                  { id: "employees", label: "Number of Employees", type: "select", options: ["1–25", "26–100", "101–500", "501–1,000", "1,000+"] },
                  { id: "need_dedicated", label: "Do You Need Dedicated / Guaranteed Bandwidth?", type: "select", options: ["No — shared business internet is fine", "Yes — we need a dedicated SLA-backed circuit", "Not sure — advise me"] },
                ]}
              />
            </div>
            <p className="text-xs text-center text-muted-foreground mt-4">
              * Prices shown are estimated starting rates with a 12-month agreement. Prices vary by location and configuration. Contact us for exact pricing.
            </p>
          </div>
        </motion.section>

        {/* CTA */}
        <motion.div
          className="text-white rounded-xl p-12 text-center"
          style={{ background: `linear-gradient(135deg, ${COX_DARK} 0%, ${COX_BLUE} 100%)` }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-4">Connect Your Business with Cox</h2>
          <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
            From a small office on fast cable internet to a multi-site enterprise on dedicated fiber, we'll find the right Cox Business solution.
          </p>
          <Link href="/contact">
            <a className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-white font-bold hover:bg-blue-50 transition-colors text-lg" style={{ color: COX_DARK }}>
              <ArrowRight className="w-5 h-5" />
              Get a Custom Quote
            </a>
          </Link>
          <p className="text-blue-200 text-sm mt-5">Serving 350,000+ businesses across 18 states · No data caps</p>
        </motion.div>

      </div>
    </div>
  );
}
