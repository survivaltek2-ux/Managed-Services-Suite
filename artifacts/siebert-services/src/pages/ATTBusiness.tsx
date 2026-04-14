import { motion } from "framer-motion";
import {
  Wifi, Phone, Shield, Zap, Building2, CheckCircle,
  ExternalLink, Globe, ArrowRight, Layers, Radio, Satellite
} from "lucide-react";
import { Link } from "wouter";
import { VendorInquiryForm } from "@/components/forms/VendorInquiryForm";
import { usePageContent } from "@/hooks/usePageContent";

const ATT_BLUE = "#00a8e0";
const ATT_DARK = "#0057a8";

const internetPlans = [
  {
    name: "AT&T Business Fiber 300",
    speed: "300 Mbps",
    symmetric: true,
    price: "$55/mo",
    priceNote: "12-mo. agreement. No equipment fee w/ AutoPay & Paperless Bill.",
    highlight: false,
    features: [
      "300 Mbps symmetrical fiber",
      "No data caps",
      "99% reliability guarantee",
      "24/7 business support",
      "Gateway included",
    ],
  },
  {
    name: "AT&T Business Fiber 1 Gig",
    speed: "1 Gbps",
    symmetric: true,
    price: "$85/mo",
    priceNote: "12-mo. agreement. No equipment fee w/ AutoPay & Paperless Bill.",
    highlight: true,
    features: [
      "1 Gbps symmetrical fiber",
      "No data caps",
      "99% reliability guarantee",
      "Static IP available",
      "Business security add-ons",
      "Priority business support",
    ],
  },
  {
    name: "AT&T Business Fiber 2 Gig",
    speed: "2 Gbps",
    symmetric: true,
    price: "$145/mo",
    priceNote: "12-mo. agreement. No equipment fee w/ AutoPay & Paperless Bill.",
    highlight: false,
    features: [
      "2 Gbps symmetrical fiber",
      "No data caps",
      "Multi-gig Wi-Fi gateway",
      "Static IP included",
      "Advanced security suite",
      "Dedicated account support",
    ],
  },
];

const services = [
  {
    icon: Wifi,
    title: "Business Fiber Internet",
    subtitle: "Symmetrical Fiber",
    description:
      "True fiber-to-the-premises (FTTP) internet with symmetric upload and download speeds. Plans from 300 Mbps to 5 Gbps — no throttling, no data caps, and a 99% uptime guarantee.",
    highlights: [
      "300 Mbps – 5 Gbps symmetric",
      "100% fiber (not cable or DSL)",
      "No data caps or throttling",
      "99% uptime guarantee",
    ],
    color: ATT_BLUE,
  },
  {
    icon: Radio,
    title: "5G Business Internet",
    subtitle: "AT&T Fixed Wireless",
    description:
      "5G fixed wireless internet for businesses where fiber isn't yet available. Upload and download speeds vary by location and network conditions, with no wired installation required.",
    highlights: [
      "No wired installation needed",
      "AT&T 5G & LTE network",
      "Plug-and-play gateway",
      "Great for temporary sites",
    ],
    color: "#7c3aed",
  },
  {
    icon: Satellite,
    title: "FirstNet for Business",
    subtitle: "Priority Public Safety Network",
    description:
      "FirstNet is AT&T's dedicated communications network built for first responders, hospitals, utilities, and critical infrastructure. Preemptive priority over commercial traffic during emergencies.",
    highlights: [
      "Built for first responders",
      "Network preemption in emergencies",
      "Nationwide hardened coverage",
      "Eligible for government pricing",
    ],
    color: "#dc2626",
  },
  {
    icon: Phone,
    title: "Business Phone",
    subtitle: "AT&T Office@Hand",
    description:
      "Cloud-based UCaaS phone system with unlimited calling, video conferencing, SMS, and team messaging. Powered by RingCentral and deeply integrated with AT&T's network.",
    highlights: [
      "Unlimited US/Canada calling",
      "Cloud PBX + video + SMS",
      "Microsoft Teams integration",
      "Powered by RingCentral",
    ],
    color: "#16a34a",
  },
  {
    icon: Shield,
    title: "AT&T Cybersecurity",
    subtitle: "Network & Endpoint Security",
    description:
      "Network-based threat detection, SIEM, managed firewalls, and endpoint protection. AT&T's security operations center monitors threats around the clock with AI-driven detection.",
    highlights: [
      "Network-level threat detection",
      "Managed SIEM & firewall",
      "24/7 SOC monitoring",
      "AI-driven threat intelligence",
    ],
    color: "#0891b2",
  },
  {
    icon: Globe,
    title: "SD-WAN & MPLS",
    subtitle: "Enterprise Networking",
    description:
      "Software-defined WAN for multi-site businesses with intelligent traffic routing, centralized policy management, and seamless failover between fiber, 5G, and LTE connections.",
    highlights: [
      "Intelligent traffic routing",
      "Multi-cloud connectivity",
      "MPLS & hybrid WAN",
      "Centralized management portal",
    ],
    color: "#ea580c",
  },
];

const whyUs = [
  {
    title: "Largest Wireless Network in the U.S.",
    description:
      "AT&T's wireless network covers 99% of Americans, with first-in-class 5G reaching over 300 million people — giving your business nationwide mobile coverage.",
  },
  {
    title: "True Symmetric Fiber",
    description:
      "AT&T Business Fiber delivers equal upload and download speeds — not hybrid coax — which is essential for video conferencing, cloud storage, VoIP, and remote work.",
  },
  {
    title: "FirstNet — Mission-Critical Priority",
    description:
      "The only carrier with a dedicated nationwide public safety network. If you serve public safety or critical infrastructure, FirstNet delivers preemptive network access.",
  },
  {
    title: "Office@Hand (UCaaS + RingCentral)",
    description:
      "AT&T's cloud phone system is co-developed with RingCentral and integrates natively with Microsoft Teams, Google Workspace, Salesforce, and 300+ business apps.",
  },
  {
    title: "Integrated Security Stack",
    description:
      "From network-level threat blocking to managed endpoint protection, AT&T's cybersecurity portfolio covers SMB to enterprise with 24/7 SOC support.",
  },
  {
    title: "One Nationwide Vendor",
    description:
      "Fiber internet, 5G wireless, fixed wireless, mobile, voice, SD-WAN, and cybersecurity — all from a single provider with national reach and one point of contact.",
  },
];

const idealFor = [
  {
    type: "Fiber-Ready Businesses (1–50 seats)",
    plans: "AT&T Business Fiber 300–1 Gig + Office@Hand UCaaS",
    icon: Building2,
  },
  {
    type: "Mobile Workforce / Field Teams",
    plans: "5G Business Internet + FirstNet + Business Mobile",
    icon: Layers,
  },
  {
    type: "Enterprise & Multi-Site",
    plans: "SD-WAN + MPLS + AT&T Cybersecurity",
    icon: Globe,
  },
];

export default function ATTBusiness() {
  const content = usePageContent("att-business", {
    heroTitle: "AT&T Business",
    heroSubtitle: "Fiber · 5G · FirstNet · UCaaS",
    heroDescription: "Symmetric fiber internet, 5G wireless, FirstNet for public safety, cloud voice, SD-WAN, and enterprise security — all from America's largest telecommunications company.",
  });
  return (
    <div className="w-full bg-background">
      {/* Hero */}
      <motion.div
        className="text-white py-16 px-4 sm:px-6 lg:px-8"
        style={{ background: `linear-gradient(135deg, ${ATT_DARK} 0%, ${ATT_BLUE} 100%)` }}
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
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white font-bold hover:bg-blue-50 transition-colors" style={{ color: ATT_DARK }}
            >
              <ArrowRight className="w-5 h-5" />
              Request a Quote
            </button>
          </div>

          <div className="grid grid-cols-3 gap-6 mt-12 border-t border-white/20 pt-10">
            {[
              { value: "300M+", label: "5G coverage reach" },
              { value: "5 Gbps", label: "Max fiber speed" },
              { value: "FirstNet", label: "Public safety network" },
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
            <h2 className="text-3xl font-bold text-foreground mb-4">Business Fiber Internet Plans</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              True fiber-to-the-premises with symmetric speeds. No data caps, no throttling, and no equipment fee with AutoPay and paperless billing.
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
                  <div className="px-4 py-2 text-xs font-bold text-white text-center" style={{ backgroundColor: ATT_BLUE }}>
                    MOST POPULAR
                  </div>
                )}
                <div className="p-6 bg-card">
                  <h3 className="text-xl font-bold text-foreground mb-1">{plan.name}</h3>
                  <div className="text-3xl font-bold mb-1" style={{ color: ATT_BLUE }}>{plan.price}</div>
                  <p className="text-xs text-muted-foreground mb-4">{plan.priceNote}</p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-5" style={{ backgroundColor: `${ATT_BLUE}15`, color: ATT_BLUE }}>
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
                    <a className="mt-6 block w-full text-center px-4 py-3 rounded-lg font-bold text-white transition-all" style={{ backgroundColor: plan.highlight ? ATT_BLUE : ATT_DARK }}>
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
            <h2 className="text-3xl font-bold text-foreground mb-4">Complete AT&T Business Portfolio</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Fiber, 5G, FirstNet, UCaaS, SD-WAN, and cybersecurity — all from a single nationwide provider.
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

        {/* Why AT&T */}
        <motion.section
          className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-foreground mb-10 text-center">Why AT&T Business?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyUs.map((item) => (
              <div key={item.title} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: ATT_BLUE }}>
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
                <Icon className="w-8 h-8 mb-4" style={{ color: ATT_BLUE }} />
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
              <h2 className="text-3xl font-bold text-foreground mb-3">Get an AT&T Business Quote</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Fiber, 5G, FirstNet, or enterprise networking — tell us what you need and we'll build a tailored AT&T solution within one business day.
              </p>
            </div>
            <div id="inquiry-form" className="bg-white rounded-2xl shadow-xl p-8 md:p-10 border border-border">
              <VendorInquiryForm
                vendorName="AT&T Business"
                vendorSlug="att-business"
                accentColor={ATT_BLUE}
                accentDark={ATT_DARK}
                services={[
                  "AT&T Business Fiber (300 Mbps – 5 Gbps)",
                  "5G Business Internet (Fixed Wireless)",
                  "FirstNet (First Responders & Public Safety)",
                  "MPLS / Private IP Network",
                  "AT&T Business Phone",
                  "Business Mobile Plans",
                  "AT&T Cybersecurity / Managed Security",
                ]}
                extraFields={[
                  { id: "locations", label: "Number of Locations", type: "select", options: ["1", "2–5", "6–20", "21–100", "100+"], required: true },
                  { id: "bandwidth", label: "Bandwidth Needed", type: "select", options: ["Up to 300 Mbps", "300 Mbps – 1 Gbps", "1 Gbps – 5 Gbps", "5 Gbps+ / Enterprise", "Not sure — advise me"] },
                  { id: "industry", label: "Industry / Organization Type", type: "select", options: ["Healthcare", "Education", "Government / Public Safety", "Retail", "Finance", "Manufacturing", "Real Estate", "Technology", "Other"] },
                ]}
              />
            </div>
            <p className="text-xs text-center text-muted-foreground mt-4">
              * Prices shown are estimated starting rates with a 12-month agreement, AutoPay, and Paperless Bill. Prices vary by location and configuration.
            </p>
          </div>
        </motion.section>

        {/* CTA */}
        <motion.div
          className="text-white rounded-xl p-12 text-center"
          style={{ background: `linear-gradient(135deg, ${ATT_DARK} 0%, ${ATT_BLUE} 100%)` }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-4">Ready to Build on AT&T Business?</h2>
          <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
            Fiber, 5G, FirstNet, and enterprise networking — we'll help you get the right AT&T solution for your organization's needs.
          </p>
          <Link href="/contact">
            <a className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-white font-bold hover:bg-blue-50 transition-colors text-lg" style={{ color: ATT_DARK }}>
              <ArrowRight className="w-5 h-5" />
              Get a Custom Quote
            </a>
          </Link>
          <p className="text-blue-200 text-sm mt-5">Nationwide coverage · FirstNet authority · Enterprise-grade SLAs</p>
        </motion.div>

      </div>
    </div>
  );
}
