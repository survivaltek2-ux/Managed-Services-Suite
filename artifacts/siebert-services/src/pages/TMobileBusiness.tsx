import { motion } from "framer-motion";
import {
  Radio, Wifi, Phone, Shield, Zap, Building2, CheckCircle,
  ExternalLink, Globe, ArrowRight, Layers, Smartphone, Server
} from "lucide-react";
import { Link } from "wouter";

const TMOB_PINK = "#e20074";
const TMOB_DARK = "#8b0042";

const internetPlans = [
  {
    name: "Rely 5G",
    price: "$50/mo",
    priceNote: "Standalone · $35/mo with T-Mobile voice line + AutoPay",
    highlight: false,
    features: [
      "Unlimited 5G & LTE data",
      "Business gateway included",
      "No contracts required",
      "Standard tech support",
      "Basic mobile hotspot",
    ],
  },
  {
    name: "Amplified 5G",
    price: "Contact for pricing",
    priceNote: "Best for growing businesses",
    highlight: true,
    features: [
      "Unlimited 5G & LTE data",
      "Enhanced 5G speeds (deprioritized last)",
      "Business gateway + Wi-Fi 6 router",
      "Advanced mobile hotspot",
      "Priority business support",
      "SLA option available",
    ],
  },
  {
    name: "All-In 5G",
    price: "Contact for pricing",
    priceNote: "Full-featured business internet",
    highlight: false,
    features: [
      "Everything in Amplified",
      "Highest priority 5G data",
      "Wi-Fi 6E gateway included",
      "4G LTE backup line",
      "Dedicated business rep",
      "24/7 priority support",
    ],
  },
];

const services = [
  {
    icon: Wifi,
    title: "5G Business Internet",
    subtitle: "Fixed Wireless Access",
    description:
      "T-Mobile Home Internet for Business delivers 5G fixed wireless internet with no wired installation, no annual contract, and unlimited data — powered by America's largest 5G network.",
    highlights: [
      "No installation required",
      "Unlimited 5G data",
      "No annual contract",
      "Wi-Fi 6 gateway included",
    ],
    color: TMOB_PINK,
  },
  {
    icon: Smartphone,
    title: "Business Mobile Plans",
    subtitle: "5G Nationwide & Ultra Capacity",
    description:
      "T-Mobile for Business mobile plans include unlimited talk, text, and 5G data with hotspot, international options, and device management — on America's largest 5G network by coverage.",
    highlights: [
      "Unlimited 5G nationwide",
      "Mobile hotspot included",
      "International data options",
      "Apple Business Manager integration",
    ],
    color: "#7c3aed",
  },
  {
    icon: Server,
    title: "T-Mobile Edge Computing",
    subtitle: "5G Edge / MEC",
    description:
      "Multi-Access Edge Computing (MEC) brings compute resources to the 5G network edge — enabling ultra-low latency applications like autonomous vehicles, smart manufacturing, and AR/VR.",
    highlights: [
      "Sub-10ms edge latency",
      "Private 5G networks",
      "Manufacturing & logistics",
      "AR/VR & video analytics",
    ],
    color: "#16a34a",
  },
  {
    icon: Shield,
    title: "Business Protect",
    subtitle: "Network-Level Security",
    description:
      "T-Mobile's Business Protect adds network-level scam and phishing blocking to all devices on your business account — without requiring endpoint software or VPN configuration.",
    highlights: [
      "Scam call blocking",
      "Phishing link protection",
      "Network-level (no app needed)",
      "Applies to all business lines",
    ],
    color: "#dc2626",
  },
  {
    icon: Globe,
    title: "IoT & Connected Devices",
    subtitle: "SIM-Based Connectivity",
    description:
      "T-Mobile's IoT connectivity platform supports millions of SIM-based connected devices for fleet tracking, smart meters, POS terminals, digital signage, and remote monitoring — all on one business account.",
    highlights: [
      "Multi-SIM device management",
      "Fleet & asset tracking",
      "POS & kiosk connectivity",
      "Nationwide 4G LTE + 5G",
    ],
    color: "#0891b2",
  },
  {
    icon: Radio,
    title: "Private 5G Networks",
    subtitle: "Dedicated On-Premise 5G",
    description:
      "T-Mobile's private 5G network solution deploys a dedicated 5G network inside your facility — for warehouse automation, manufacturing floors, hospital campuses, and large venues requiring ultra-reliable wireless.",
    highlights: [
      "Dedicated on-premise 5G",
      "Isolated from public network",
      "Ultra-reliable low latency",
      "Managed by T-Mobile",
    ],
    color: "#ea580c",
  },
];

const whyUs = [
  {
    title: "America's Largest 5G Network",
    description:
      "T-Mobile's 5G network covers more geography than any other U.S. carrier — including rural areas where competitors have limited 5G deployment.",
  },
  {
    title: "No Annual Contracts",
    description:
      "T-Mobile for Business does not require annual service agreements on most plans. Month-to-month flexibility for mobile and business internet gives you control.",
  },
  {
    title: "Ultra Capacity 5G in Dense Areas",
    description:
      "In major metros, T-Mobile's Ultra Capacity (UC) 5G delivers download speeds that rival fiber — often 400–1,000+ Mbps — ideal for bandwidth-intensive business applications.",
  },
  {
    title: "Quick Deployment — No Wiring",
    description:
      "5G Business Internet requires no trenching, no fiber pull, and no wired infrastructure — making it perfect for temporary offices, pop-up stores, and locations where fiber isn't available.",
  },
  {
    title: "IoT Leadership",
    description:
      "T-Mobile manages one of the largest commercial IoT connectivity platforms in the U.S., powering fleet management, smart cities, healthcare devices, and manufacturing automation.",
  },
  {
    title: "Private 5G for Enterprise",
    description:
      "For manufacturing, logistics, and critical infrastructure, T-Mobile's private 5G networks deliver enterprise-grade reliability without sharing spectrum with the public network.",
  },
];

const idealFor = [
  {
    type: "Small Business / No-Wire Sites",
    plans: "T-Mobile 5G Business Internet (Rely or Amplified) + Business Mobile",
    icon: Building2,
  },
  {
    type: "Field Force & Fleet Operations",
    plans: "Business Mobile (unlimited) + IoT SIMs + Business Protect",
    icon: Layers,
  },
  {
    type: "Manufacturing & Large Campus",
    plans: "Private 5G Network + T-Mobile Edge Computing (MEC)",
    icon: Globe,
  },
];

export default function TMobileBusiness() {
  return (
    <div className="w-full bg-background">
      {/* Hero */}
      <motion.div
        className="text-white py-16 px-4 sm:px-6 lg:px-8"
        style={{ background: `linear-gradient(135deg, ${TMOB_DARK} 0%, ${TMOB_PINK} 100%)` }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-white/15">
              <Radio className="w-6 h-6" />
            </div>
            <div>
              <div className="text-pink-200 text-sm font-semibold uppercase tracking-wide">America's Largest 5G Network · No Annual Contracts</div>
              <h1 className="text-4xl font-bold">T-Mobile for Business</h1>
            </div>
          </div>
          <p className="text-pink-100 text-lg mt-4 max-w-2xl leading-relaxed">
            5G business internet, mobile plans, IoT connectivity, private 5G networks, and edge computing — all on America's largest 5G network with no annual contract required.
          </p>
          <div className="flex flex-wrap gap-4 mt-8">
            <Link href="/contact">
              <a className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white font-bold hover:bg-pink-50 transition-colors" style={{ color: TMOB_DARK }}>
                <ArrowRight className="w-5 h-5" />
                Request a Quote
              </a>
            </Link>
            <a
              href="https://www.t-mobile.com/business"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold border border-white/40 text-white hover:bg-white/10 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Visit T-Mobile Business
            </a>
          </div>

          <div className="grid grid-cols-3 gap-6 mt-12 border-t border-white/20 pt-10">
            {[
              { value: "#1", label: "5G coverage in U.S." },
              { value: "No", label: "Annual contracts required" },
              { value: "1 Gbps+", label: "UC 5G peak speeds" },
            ].map(({ value, label }) => (
              <div key={label}>
                <div className="text-2xl font-bold text-white">{value}</div>
                <div className="text-pink-200 text-sm">{label}</div>
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
            <h2 className="text-3xl font-bold text-foreground mb-4">5G Business Internet Plans</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              No wiring. No installation. No annual contract. Business-grade 5G internet with unlimited data — starting at $35/mo with a voice line.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {internetPlans.map((plan) => (
              <motion.div
                key={plan.name}
                className={`rounded-xl border-2 overflow-hidden transition-all ${
                  plan.highlight ? "border-pink-500 ring-2 ring-pink-200 shadow-xl" : "border-border"
                }`}
                whileHover={{ y: -4 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                {plan.highlight && (
                  <div className="px-4 py-2 text-xs font-bold text-white text-center" style={{ backgroundColor: TMOB_PINK }}>
                    MOST POPULAR
                  </div>
                )}
                <div className="p-6 bg-card">
                  <h3 className="text-xl font-bold text-foreground mb-1">{plan.name}</h3>
                  <div className="text-2xl font-bold mb-1" style={{ color: TMOB_PINK }}>{plan.price}</div>
                  <p className="text-xs text-muted-foreground mb-4">{plan.priceNote}</p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-5" style={{ backgroundColor: `${TMOB_PINK}15`, color: TMOB_PINK }}>
                    <Zap className="w-3 h-3" /> 5G Fixed Wireless
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
                    <a className="mt-6 block w-full text-center px-4 py-3 rounded-lg font-bold text-white transition-all" style={{ backgroundColor: plan.highlight ? TMOB_PINK : TMOB_DARK }}>
                      Get Started
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
            <h2 className="text-3xl font-bold text-foreground mb-4">Full T-Mobile Business Portfolio</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              5G internet, mobile plans, IoT, private 5G, edge computing, and built-in security — all on America's largest 5G network.
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

        {/* Why T-Mobile */}
        <motion.section
          className="bg-gradient-to-br from-pink-50 to-pink-100 border border-pink-200 rounded-xl p-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-foreground mb-10 text-center">Why T-Mobile for Business?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyUs.map((item) => (
              <div key={item.title} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: TMOB_PINK }}>
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
                <Icon className="w-8 h-8 mb-4" style={{ color: TMOB_PINK }} />
                <h3 className="font-bold text-foreground mb-2">{type}</h3>
                <p className="text-sm text-muted-foreground">{plans}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* CTA */}
        <motion.div
          className="text-white rounded-xl p-12 text-center"
          style={{ background: `linear-gradient(135deg, ${TMOB_DARK} 0%, ${TMOB_PINK} 100%)` }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-4">Go 5G with T-Mobile for Business</h2>
          <p className="text-pink-100 text-lg mb-8 max-w-xl mx-auto">
            No wires, no contracts, no hassle. From a single business internet line to a nationwide IoT deployment — we'll find the right T-Mobile solution for your operation.
          </p>
          <Link href="/contact">
            <a className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-white font-bold hover:bg-pink-50 transition-colors text-lg" style={{ color: TMOB_DARK }}>
              <ArrowRight className="w-5 h-5" />
              Get a Custom Quote
            </a>
          </Link>
          <p className="text-pink-200 text-sm mt-5">America's largest 5G network · No annual contracts · IoT & private 5G available</p>
        </motion.div>

      </div>
    </div>
  );
}
