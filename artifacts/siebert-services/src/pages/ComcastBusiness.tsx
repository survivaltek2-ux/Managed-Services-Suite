import { motion } from "framer-motion";
import {
  Wifi, Phone, Tv, Shield, Zap, Building2, CheckCircle,
  ExternalLink, Server, Globe, ArrowRight, Layers, Radio, Cloud
} from "lucide-react";
import { Link } from "wouter";
import { VendorInquiryForm } from "@/components/forms/VendorInquiryForm";

const COMCAST_RED = "#e52b0e";
const COMCAST_DARK = "#1a1a1a";

const internetPlans = [
  {
    name: "Business Internet 200",
    speed: "200 Mbps",
    upload: "20 Mbps",
    price: "$69/mo",
    priceNote: "12-mo. term agreement",
    highlight: false,
    features: [
      "200 Mbps download / 20 Mbps upload",
      "Unlimited data included",
      "Business Static IP available",
      "99.9% reliability guarantee",
      "Free professional installation",
    ],
  },
  {
    name: "Business Internet 500",
    speed: "500 Mbps",
    upload: "35 Mbps",
    price: "$109/mo",
    priceNote: "12-mo. term agreement",
    highlight: true,
    features: [
      "500 Mbps download / 35 Mbps upload",
      "Unlimited data included",
      "4 Static IPs included",
      "Advanced cybersecurity suite",
      "24/7 business-priority support",
      "Wi-Fi equipment included",
    ],
  },
  {
    name: "Business Internet 1 Gig",
    speed: "1.25 Gbps",
    upload: "35 Mbps",
    price: "$149/mo",
    priceNote: "12-mo. term agreement",
    highlight: false,
    features: [
      "1.25 Gbps download / 35 Mbps upload",
      "Unlimited data included",
      "8 Static IPs included",
      "Full SecurityEdge cybersecurity",
      "Dedicated account manager",
      "SLA-backed uptime",
    ],
  },
];

const services = [
  {
    icon: Wifi,
    title: "Business Internet",
    subtitle: "Xfinity Business",
    description:
      "High-speed cable and fiber internet with plans from 200 Mbps to 1.25 Gbps. Includes Wi-Fi equipment, unlimited data, and business-grade reliability backed by a 99.9% uptime guarantee.",
    highlights: [
      "200 Mbps – 1.25 Gbps",
      "Unlimited data, no overage fees",
      "Wi-Fi equipment included",
      "99.9% reliability SLA",
    ],
    color: COMCAST_RED,
  },
  {
    icon: Phone,
    title: "Business Voice",
    subtitle: "VoiceEdge & SIP Trunking",
    description:
      "Cloud PBX system (VoiceEdge) with unlimited calling, auto-attendant, and voicemail-to-email. Or use SIP trunking to connect your existing PBX to the Comcast network.",
    highlights: [
      "Unlimited US/Canada calling",
      "Cloud PBX (VoiceEdge)",
      "SIP Trunking available",
      "Hunt groups & auto-attendant",
    ],
    color: "#7c3aed",
  },
  {
    icon: Tv,
    title: "Business TV",
    subtitle: "Xfinity for Business",
    description:
      "Commercial-grade TV service for waiting rooms, restaurants, hotels, and office environments. Includes the required commercial licensing and flexible channel packages.",
    highlights: [
      "Commercial licensing included",
      "HD channels & sports packages",
      "Multiple TV locations",
      "No residential-use restrictions",
    ],
    color: "#16a34a",
  },
  {
    icon: Shield,
    title: "SecurityEdge",
    subtitle: "Business Cybersecurity",
    description:
      "Built into Business Internet plans, SecurityEdge protects connected devices from malware, ransomware, phishing, and botnet attacks at the network level — no software to install.",
    highlights: [
      "Network-level threat blocking",
      "Malware & phishing protection",
      "Content filtering available",
      "Automatic threat updates",
    ],
    color: "#dc2626",
  },
  {
    icon: Cloud,
    title: "SD-WAN & Managed Services",
    subtitle: "Enterprise Connectivity",
    description:
      "Software-defined WAN for multi-location businesses. Intelligent traffic routing, centralized management, and carrier-grade failover across multiple internet connections.",
    highlights: [
      "Multi-location SD-WAN",
      "Automatic failover",
      "Centralized cloud management",
      "QoS prioritization",
    ],
    color: "#0891b2",
  },
  {
    icon: Radio,
    title: "Business Mobile",
    subtitle: "Comcast Business Mobile",
    description:
      "Unlimited 5G mobile plans for your team that run on Verizon's network. Bundle with your business internet for simplified billing and a single point of contact.",
    highlights: [
      "5G on Verizon's network",
      "By the Gig or Unlimited data",
      "Bundle discounts with internet",
      "BYOD supported",
    ],
    color: "#ea580c",
  },
];

const whyUs = [
  {
    title: "Largest Business ISP in the U.S.",
    description:
      "Comcast Business serves over 2 million business customers, making it the largest cable ISP for SMBs in the country with the most extensive service footprint.",
  },
  {
    title: "30+ Million Wi-Fi Hotspots",
    description:
      "Business customers get automatic access to Xfinity's 30M+ Wi-Fi hotspot network — keeping you and your team connected wherever you go.",
  },
  {
    title: "Built-In Cybersecurity",
    description:
      "SecurityEdge is included on qualifying plans, protecting all devices on your network from threats without additional software or hardware investment.",
  },
  {
    title: "99.9% Uptime Reliability",
    description:
      "Comcast Business backs its service with a 99.9% uptime SLA and a 30-day money-back guarantee on select plans.",
  },
  {
    title: "4-Hour Rapid Response",
    description:
      "Business customers receive 4-hour response time guarantees for on-site technician visits — faster than residential-grade service.",
  },
  {
    title: "One Provider, Everything Bundled",
    description:
      "Internet, phone, TV, mobile, and cybersecurity all on one bill with one support number. Bundles offer up to 30% savings vs. à la carte pricing.",
  },
];

const idealFor = [
  {
    type: "Small Office / Retail (1–20 seats)",
    plans: "Business Internet 200 or 500 + VoiceEdge",
    icon: Building2,
  },
  {
    type: "Mid-Size Business (20–100 seats)",
    plans: "Business Internet 1 Gig + SIP Trunking + SecurityEdge",
    icon: Layers,
  },
  {
    type: "Multi-Location / Enterprise",
    plans: "SD-WAN + Dedicated Internet + Business Mobile",
    icon: Globe,
  },
];

export default function ComcastBusiness() {
  return (
    <div className="w-full bg-background">
      {/* Hero */}
      <motion.div
        className="text-white py-16 px-4 sm:px-6 lg:px-8"
        style={{ background: `linear-gradient(135deg, ${COMCAST_DARK} 0%, ${COMCAST_RED} 100%)` }}
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
              <div className="text-red-200 text-sm font-semibold uppercase tracking-wide">America's Largest Business ISP</div>
              <h1 className="text-4xl font-bold">Comcast Business</h1>
            </div>
          </div>
          <p className="text-red-100 text-lg mt-4 max-w-2xl leading-relaxed">
            High-speed internet, cloud voice, business TV, mobile, and enterprise SD-WAN — all from one provider serving over 2 million U.S. businesses.
          </p>
          <div className="flex flex-wrap gap-4 mt-8">
            <Link href="/contact">
              <a className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white font-bold hover:bg-red-50 transition-colors" style={{ color: COMCAST_RED }}>
                <ArrowRight className="w-5 h-5" />
                Request a Quote
              </a>
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-6 mt-12 border-t border-white/20 pt-10">
            {[
              { value: "2M+", label: "Business customers" },
              { value: "30M+", label: "Wi-Fi hotspots" },
              { value: "1.25 Gbps", label: "Max download speed" },
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
              Fast, reliable business internet with no data caps, included Wi-Fi equipment, and built-in cybersecurity on every plan.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {internetPlans.map((plan) => (
              <motion.div
                key={plan.name}
                className={`rounded-xl border-2 overflow-hidden transition-all ${
                  plan.highlight
                    ? "border-red-500 ring-2 ring-red-200 shadow-xl"
                    : "border-border"
                }`}
                whileHover={{ y: -4 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                {plan.highlight && (
                  <div className="px-4 py-2 text-xs font-bold text-white text-center" style={{ backgroundColor: COMCAST_RED }}>
                    MOST POPULAR
                  </div>
                )}
                <div className="p-6 bg-card">
                  <h3 className="text-xl font-bold text-foreground mb-1">{plan.name}</h3>
                  <div className="text-3xl font-bold mb-1" style={{ color: COMCAST_RED }}>{plan.price}</div>
                  <p className="text-xs text-muted-foreground mb-4">{plan.priceNote}</p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-5" style={{ backgroundColor: `${COMCAST_RED}15`, color: COMCAST_RED }}>
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
                    <a className="mt-6 block w-full text-center px-4 py-3 rounded-lg font-bold text-white transition-all" style={{ backgroundColor: plan.highlight ? COMCAST_RED : COMCAST_DARK }}>
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
            <h2 className="text-3xl font-bold text-foreground mb-4">Full Suite of Business Services</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              One provider, one bill. Internet, voice, TV, mobile, cybersecurity, and enterprise networking — all from Comcast Business.
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

        {/* Why Comcast */}
        <motion.section
          className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-foreground mb-10 text-center">Why Comcast Business?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyUs.map((item) => (
              <div key={item.title} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: COMCAST_RED }}>
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
                <Icon className="w-8 h-8 mb-4" style={{ color: COMCAST_RED }} />
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
              <h2 className="text-3xl font-bold text-foreground mb-3">Get a Comcast Business Quote</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Tell us what you need and we'll respond within one business day with transparent, competitive pricing — at no cost to you.
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 border border-border">
              <VendorInquiryForm
                vendorName="Comcast Business"
                vendorSlug="comcast-business"
                accentColor={COMCAST_RED}
                accentDark={COMCAST_DARK}
                services={[
                  "Business Internet (Cable / HSD)",
                  "Gigabit Pro Fiber DIA",
                  "Business SD-WAN",
                  "Business VoiceEdge (Cloud PBX)",
                  "SmartOffice IoT & Automation",
                  "Video Surveillance",
                  "Marketing Analytics Wi-Fi",
                ]}
                extraFields={[
                  { id: "locations", label: "Number of Locations", type: "select", options: ["1", "2–5", "6–20", "21–100", "100+"], required: true },
                  { id: "employees", label: "Number of Employees", type: "select", options: ["1–25", "26–100", "101–500", "501–1,000", "1,000+"] },
                  { id: "speed", label: "Desired Internet Speed", type: "select", options: ["Up to 300 Mbps", "Up to 600 Mbps", "1 Gbps (Standard)", "Multi-Gig / DIA", "Not sure — advise me"] },
                ]}
              />
            </div>
            <p className="text-xs text-center text-muted-foreground mt-4">
              * Prices shown are estimated starting rates and vary by location, contract term, and configuration. Contact us for an exact quote.
            </p>
          </div>
        </motion.section>

        {/* CTA */}
        <motion.div
          className="text-white rounded-xl p-12 text-center"
          style={{ background: `linear-gradient(135deg, ${COMCAST_DARK} 0%, ${COMCAST_RED} 100%)` }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-4">Ready to Get Your Business Connected?</h2>
          <p className="text-red-100 text-lg mb-8 max-w-xl mx-auto">
            From a single-location office to a multi-site enterprise network, we'll match you with the right Comcast Business solution.
          </p>
          <Link href="/contact">
            <a className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-white font-bold hover:bg-red-50 transition-colors text-lg" style={{ color: COMCAST_RED }}>
              <ArrowRight className="w-5 h-5" />
              Get a Custom Quote
            </a>
          </Link>
          <p className="text-red-200 text-sm mt-5">Serving over 2 million U.S. businesses · 30-day money-back guarantee on select plans</p>
        </motion.div>

      </div>
    </div>
  );
}
