import { motion } from "framer-motion";
import {
  Wifi, Phone, Tv, Shield, Zap, Building2, CheckCircle,
  ExternalLink, Globe, ArrowRight, Layers, Radio
} from "lucide-react";
import { Link } from "wouter";

const SPECTRUM_BLUE = "#0072ce";
const SPECTRUM_DARK = "#003087";

const internetPlans = [
  {
    name: "Business Internet 300",
    speed: "300 Mbps",
    upload: "10 Mbps",
    price: "$49.99/mo",
    priceNote: "For 12 mos w/ Auto Pay. No contracts required.",
    highlight: false,
    features: [
      "300 Mbps download / 10 Mbps upload",
      "No data caps",
      "Free modem — no rental fee",
      "Static IP available",
      "24/7 business support",
    ],
  },
  {
    name: "Business Internet 600",
    speed: "600 Mbps",
    upload: "35 Mbps",
    price: "$69.99/mo",
    priceNote: "For 12 mos w/ Auto Pay. No contracts required.",
    highlight: true,
    features: [
      "600 Mbps download / 35 Mbps upload",
      "No data caps",
      "Free modem — no rental fee",
      "4 Static IPs included",
      "Priority business support",
      "Business Wi-Fi equipment included",
    ],
  },
  {
    name: "Business Internet 1 Gig",
    speed: "1 Gbps",
    upload: "35 Mbps",
    price: "$109.99/mo",
    priceNote: "For 12 mos w/ Auto Pay. No contracts required.",
    highlight: false,
    features: [
      "1 Gbps download / 35 Mbps upload",
      "No data caps",
      "Free modem & router",
      "8 Static IPs included",
      "Dedicated account manager",
      "SLA-backed reliability",
    ],
  },
];

const services = [
  {
    icon: Wifi,
    title: "Business Internet",
    subtitle: "Spectrum Business",
    description:
      "Reliable cable internet with no data caps, free modem included, and no long-term contracts required. Plans from 300 Mbps to 1 Gbps for offices of any size.",
    highlights: [
      "300 Mbps – 1 Gbps",
      "No data caps",
      "Free modem, no rental fee",
      "No annual contract required",
    ],
    color: SPECTRUM_BLUE,
  },
  {
    icon: Phone,
    title: "Business Voice",
    subtitle: "Spectrum Business Voice",
    description:
      "Unlimited nationwide calling with 30+ standard calling features. Cloud-based phone system with voicemail-to-email, call forwarding, and virtual receptionist options.",
    highlights: [
      "Unlimited US calling",
      "30+ calling features standard",
      "Voicemail-to-email",
      "Virtual receptionist available",
    ],
    color: "#7c3aed",
  },
  {
    icon: Tv,
    title: "Business TV",
    subtitle: "Spectrum Business TV",
    description:
      "Commercial TV service with the licensing needed to play programming in public spaces — waiting rooms, restaurants, bars, retail stores, and hotel lobbies.",
    highlights: [
      "Commercial licensing included",
      "200+ HD channels",
      "Sports & entertainment packages",
      "DVR service available",
    ],
    color: "#16a34a",
  },
  {
    icon: Shield,
    title: "Business Connect Security",
    subtitle: "Network-Level Protection",
    description:
      "Advanced cybersecurity add-on that monitors and protects your entire network. Blocks threats before they reach your devices without requiring endpoint software.",
    highlights: [
      "DNS-layer threat blocking",
      "Malware & phishing prevention",
      "Content filtering controls",
      "24/7 security monitoring",
    ],
    color: "#dc2626",
  },
  {
    icon: Radio,
    title: "Business Mobile",
    subtitle: "Spectrum Mobile for Business",
    description:
      "5G mobile lines for your team on Verizon's network. Bundle with your business internet to unlock savings and manage everything from a single account.",
    highlights: [
      "5G on Verizon's network",
      "Unlimited or By the Gig data",
      "Bundle savings with internet",
      "No activation fees",
    ],
    color: "#ea580c",
  },
  {
    icon: Layers,
    title: "Fiber Internet (select markets)",
    subtitle: "Spectrum Business Fiber",
    description:
      "Where available, Spectrum Business fiber delivers symmetric speeds up to 10 Gbps for multi-tenant buildings, enterprise campuses, and high-bandwidth operations.",
    highlights: [
      "Symmetric upload/download",
      "Up to 10 Gbps available",
      "100% fiber infrastructure",
      "Enterprise SLA available",
    ],
    color: "#0891b2",
  },
];

const whyUs = [
  {
    title: "No Annual Contracts",
    description:
      "Unlike many ISPs, Spectrum Business does not require long-term agreements. Month-to-month service available on all standard plans.",
  },
  {
    title: "No Equipment Rental Fees",
    description:
      "A free modem is included with every business internet plan — no monthly equipment rental charge that inflates your bill.",
  },
  {
    title: "No Data Caps",
    description:
      "Spectrum Business never throttles your connection or charges overage fees. Use as much data as your business needs.",
  },
  {
    title: "29 States, 40+ Million Passings",
    description:
      "Charter/Spectrum operates across 29 states with fiber and hybrid coax infrastructure reaching over 40 million homes and businesses.",
  },
  {
    title: "24/7 U.S.-Based Support",
    description:
      "Around-the-clock phone and chat support staffed in the U.S., with dedicated business representatives who understand commercial needs.",
  },
  {
    title: "Simple, Transparent Pricing",
    description:
      "Promotional pricing for 12 months with no surprise fees. After the promo period, standard rates apply with no hidden charges.",
  },
];

const idealFor = [
  {
    type: "Small Business (1–15 employees)",
    plans: "Business Internet 300 or 600 + Business Voice",
    icon: Building2,
  },
  {
    type: "Growing Business (15–75 employees)",
    plans: "Business Internet 1 Gig + Voice + TV + Business Mobile",
    icon: Layers,
  },
  {
    type: "Multi-Location / High-Bandwidth",
    plans: "Fiber Internet (where available) + SD-WAN",
    icon: Globe,
  },
];

export default function SpectrumBusiness() {
  return (
    <div className="w-full bg-background">
      {/* Hero */}
      <motion.div
        className="text-white py-16 px-4 sm:px-6 lg:px-8"
        style={{ background: `linear-gradient(135deg, ${SPECTRUM_DARK} 0%, ${SPECTRUM_BLUE} 100%)` }}
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
              <div className="text-blue-200 text-sm font-semibold uppercase tracking-wide">Charter Communications</div>
              <h1 className="text-4xl font-bold">Spectrum Business</h1>
            </div>
          </div>
          <p className="text-blue-100 text-lg mt-4 max-w-2xl leading-relaxed">
            No contracts. No data caps. No equipment rental fees. Business internet, voice, TV, mobile, and fiber — all from one of the top ISPs in 29 states.
          </p>
          <div className="flex flex-wrap gap-4 mt-8">
            <Link href="/contact">
              <a className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white font-bold hover:bg-blue-50 transition-colors" style={{ color: SPECTRUM_BLUE }}>
                <ArrowRight className="w-5 h-5" />
                Request a Quote
              </a>
            </Link>
            <a
              href="https://www.spectrum.com/business"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold border border-white/40 text-white hover:bg-white/10 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Visit Spectrum Business
            </a>
          </div>

          <div className="grid grid-cols-3 gap-6 mt-12 border-t border-white/20 pt-10">
            {[
              { value: "29", label: "States served" },
              { value: "40M+", label: "Locations passed" },
              { value: "1 Gbps", label: "Max standard speed" },
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
              No contracts. No data caps. No equipment fees. Plans for every business size — with free modem included on every tier.
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
                  <div className="px-4 py-2 text-xs font-bold text-white text-center" style={{ backgroundColor: SPECTRUM_BLUE }}>
                    MOST POPULAR
                  </div>
                )}
                <div className="p-6 bg-card">
                  <h3 className="text-xl font-bold text-foreground mb-1">{plan.name}</h3>
                  <div className="text-3xl font-bold mb-1" style={{ color: SPECTRUM_BLUE }}>{plan.price}</div>
                  <p className="text-xs text-muted-foreground mb-4">{plan.priceNote}</p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-5" style={{ backgroundColor: `${SPECTRUM_BLUE}15`, color: SPECTRUM_BLUE }}>
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
                    <a className="mt-6 block w-full text-center px-4 py-3 rounded-lg font-bold text-white transition-all" style={{ backgroundColor: plan.highlight ? SPECTRUM_BLUE : SPECTRUM_DARK }}>
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
            <h2 className="text-3xl font-bold text-foreground mb-4">Full Business Service Portfolio</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Bundle and save with internet, voice, TV, mobile, and fiber — all on a single Spectrum Business account.
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

        {/* Why Spectrum */}
        <motion.section
          className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-foreground mb-10 text-center">Why Spectrum Business?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyUs.map((item) => (
              <div key={item.title} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: SPECTRUM_BLUE }}>
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
                <Icon className="w-8 h-8 mb-4" style={{ color: SPECTRUM_BLUE }} />
                <h3 className="font-bold text-foreground mb-2">{type}</h3>
                <p className="text-sm text-muted-foreground">{plans}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* CTA */}
        <motion.div
          className="text-white rounded-xl p-12 text-center"
          style={{ background: `linear-gradient(135deg, ${SPECTRUM_DARK} 0%, ${SPECTRUM_BLUE} 100%)` }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-4">Connect Your Business with Spectrum</h2>
          <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
            No contracts. No data caps. No equipment fees. We'll find the right Spectrum Business plan for your team.
          </p>
          <Link href="/contact">
            <a className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-white font-bold hover:bg-blue-50 transition-colors text-lg" style={{ color: SPECTRUM_BLUE }}>
              <ArrowRight className="w-5 h-5" />
              Get a Custom Quote
            </a>
          </Link>
          <p className="text-blue-200 text-sm mt-5">Available in 29 states · Month-to-month plans available</p>
        </motion.div>

      </div>
    </div>
  );
}
