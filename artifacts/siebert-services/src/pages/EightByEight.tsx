import { motion } from "framer-motion";
import {
  Phone, Video, MessageSquare, Headphones, BarChart2, Globe, Building2, CheckCircle,
  ExternalLink, ArrowRight, Layers, Zap, Shield
} from "lucide-react";
import { Link } from "wouter";
import { VendorInquiryForm } from "@/components/forms/VendorInquiryForm";

const EBE_GREEN = "#00a550";
const EBE_DARK = "#006633";

const plans = [
  {
    name: "8x8 X2",
    price: "$24/user/mo",
    priceNote: "Billed annually · UCaaS voice, video & chat",
    highlight: false,
    features: [
      "Unlimited calling to 14 countries",
      "HD video meetings (up to 500 participants)",
      "Team messaging & file sharing",
      "Voicemail with transcription",
      "Auto-attendant & IVR",
      "Mobile & desktop apps",
    ],
  },
  {
    name: "8x8 X4",
    price: "$44/user/mo",
    priceNote: "Billed annually · UCaaS + analytics + supervisor tools",
    highlight: true,
    features: [
      "Everything in X2",
      "Unlimited calling to 48 countries",
      "Advanced call analytics",
      "Supervisor monitoring & coaching",
      "Call recording (30-day retention)",
      "CRM integrations (Salesforce, HubSpot, Zendesk)",
      "Priority support",
    ],
  },
  {
    name: "8x8 X6 (CCaaS)",
    price: "Custom Quote",
    priceNote: "UCaaS + Contact Center in one platform",
    highlight: false,
    features: [
      "Everything in X4",
      "Omni-channel contact center",
      "IVR, ACD & skills-based routing",
      "Real-time & historical reporting",
      "Workforce management",
      "AI-powered agent assistance",
      "Quality management",
    ],
  },
];

const services = [
  {
    icon: Phone,
    title: "Cloud Phone System",
    subtitle: "UCaaS Voice",
    description:
      "Replace your PBX with 8x8's cloud phone system. Unlimited calling to 14–48 countries, auto-attendant, call queues, ring groups, and voicemail with transcription — accessible from any device.",
    highlights: [
      "Unlimited calling (14–48 countries)",
      "Auto-attendant & ring groups",
      "Voicemail with AI transcription",
      "Number porting supported",
    ],
    color: EBE_GREEN,
  },
  {
    icon: Video,
    title: "Video Meetings",
    subtitle: "8x8 Video",
    description:
      "HD video conferencing for up to 500 participants with screen sharing, virtual backgrounds, meeting recordings, transcripts, and in-meeting chat — included in every plan.",
    highlights: [
      "Up to 500 participants",
      "Screen sharing & whiteboard",
      "Meeting recording & transcripts",
      "No time limit on meetings",
    ],
    color: "#7c3aed",
  },
  {
    icon: MessageSquare,
    title: "Team Chat",
    subtitle: "Business Messaging",
    description:
      "Persistent team messaging with channels, direct messages, file sharing, and the ability to instantly start a call or video meeting from any conversation — no app switching needed.",
    highlights: [
      "Unlimited message history",
      "File & screen sharing",
      "One-click call launch",
      "Searchable conversation history",
    ],
    color: "#16a34a",
  },
  {
    icon: Headphones,
    title: "Contact Center (CCaaS)",
    subtitle: "8x8 Contact Center",
    description:
      "Omni-channel contact center on the same platform as your UCaaS — voice, email, chat, social, and messaging. ACD routing, IVR, workforce management, and AI agent assistance built in.",
    highlights: [
      "Omni-channel ACD routing",
      "IVR & skills-based routing",
      "Workforce management",
      "AI agent assistance",
    ],
    color: "#dc2626",
  },
  {
    icon: BarChart2,
    title: "Analytics & Reporting",
    subtitle: "8x8 Analyze",
    description:
      "Pre-built and custom dashboards showing call volume, queue KPIs, agent performance, first-call resolution, and customer satisfaction scores — all in real time with historical drill-down.",
    highlights: [
      "Real-time supervisor dashboards",
      "Agent & queue performance",
      "Custom report builder",
      "API data export",
    ],
    color: "#0891b2",
  },
  {
    icon: Globe,
    title: "Global Reach",
    subtitle: "48+ Countries",
    description:
      "8x8 supports local phone numbers and PSTN calling in 48+ countries from a single cloud platform — making it ideal for international businesses managing global teams from one admin portal.",
    highlights: [
      "Local numbers in 48+ countries",
      "Unlimited calling internationally",
      "Single global management portal",
      "Compliance for regulated markets",
    ],
    color: "#ea580c",
  },
];

const whyUs = [
  {
    title: "One Platform: UCaaS + CCaaS",
    description:
      "8x8 is one of very few vendors offering UCaaS and CCaaS on a single platform with shared data — agents and back-office staff communicate seamlessly without crossing systems.",
  },
  {
    title: "Unlimited Calling to 48 Countries",
    description:
      "No other UCaaS provider includes unlimited calling to as many countries at comparable price points — making 8x8 the go-to for businesses with global teams or international customers.",
  },
  {
    title: "Gartner Magic Quadrant Recognition",
    description:
      "8x8 is recognized in Gartner's Magic Quadrant for both UCaaS and CCaaS — one of only a handful of vendors able to claim leadership recognition in both categories simultaneously.",
  },
  {
    title: "99.999% Uptime SLA",
    description:
      "8x8's platform is built on a geo-redundant infrastructure with a 99.999% uptime guarantee — less than 6 minutes of downtime per year for your entire communications platform.",
  },
  {
    title: "AI-Powered Everywhere",
    description:
      "8x8 Intelligent Customer Experience uses AI for real-time agent coaching, automated call summaries, predictive routing, voicemail transcription, and customer intent detection.",
  },
  {
    title: "Simple, Predictable Per-User Pricing",
    description:
      "No per-minute charges, no surprise overages. 8x8's per-user monthly pricing makes budgeting predictable — with international calling included rather than charged separately.",
  },
];

const idealFor = [
  {
    type: "International / Global Teams",
    plans: "8x8 X4 — unlimited calling to 48 countries + analytics",
    icon: Building2,
  },
  {
    type: "Customer-Facing SMB (with agents)",
    plans: "8x8 X2 or X4 for back-office + X6 CCaaS for customer service",
    icon: Layers,
  },
  {
    type: "Enterprise Unified Communications",
    plans: "8x8 X6/X8 — full UCaaS + CCaaS + workforce management",
    icon: Globe,
  },
];

export default function EightByEight() {
  return (
    <div className="w-full bg-background">
      {/* Hero */}
      <motion.div
        className="text-white py-16 px-4 sm:px-6 lg:px-8"
        style={{ background: `linear-gradient(135deg, ${EBE_DARK} 0%, ${EBE_GREEN} 100%)` }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-white/15">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <div className="text-green-200 text-sm font-semibold uppercase tracking-wide">UCaaS + CCaaS · 48 Countries · Gartner Recognized</div>
              <h1 className="text-4xl font-bold">8x8</h1>
            </div>
          </div>
          <p className="text-green-100 text-lg mt-4 max-w-2xl leading-relaxed">
            Cloud phone, video, team chat, and contact center on a single platform — with unlimited calling to 48 countries and 99.999% uptime. Built for global teams.
          </p>
          <div className="flex flex-wrap gap-4 mt-8">
            <Link href="/contact">
              <a className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white font-bold hover:bg-green-50 transition-colors" style={{ color: EBE_DARK }}>
                <ArrowRight className="w-5 h-5" />
                Request a Quote
              </a>
            </Link>
            <a
              href="https://www.8x8.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold border border-white/40 text-white hover:bg-white/10 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Visit 8x8.com
            </a>
          </div>

          <div className="grid grid-cols-3 gap-6 mt-12 border-t border-white/20 pt-10">
            {[
              { value: "48+", label: "Countries, unlimited calling" },
              { value: "99.999%", label: "Uptime SLA" },
              { value: "1 Platform", label: "UCaaS + CCaaS" },
            ].map(({ value, label }) => (
              <div key={label}>
                <div className="text-2xl font-bold text-white">{value}</div>
                <div className="text-green-200 text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-16">

        {/* Plans */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">8x8 Plans</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              All plans include phone, video, and team messaging. Upgrade for more countries, analytics, call recording, and contact center capabilities.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <motion.div
                key={plan.name}
                className={`rounded-xl border-2 overflow-hidden transition-all ${
                  plan.highlight ? "border-green-500 ring-2 ring-green-200 shadow-xl" : "border-border"
                }`}
                whileHover={{ y: -4 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                {plan.highlight && (
                  <div className="px-4 py-2 text-xs font-bold text-white text-center" style={{ backgroundColor: EBE_GREEN }}>
                    MOST POPULAR
                  </div>
                )}
                <div className="p-6 bg-card">
                  <h3 className="text-xl font-bold text-foreground mb-1">{plan.name}</h3>
                  <div className="text-2xl font-bold mb-1" style={{ color: EBE_GREEN }}>{plan.price}</div>
                  <p className="text-xs text-muted-foreground mb-4">{plan.priceNote}</p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-5" style={{ backgroundColor: `${EBE_GREEN}15`, color: EBE_GREEN }}>
                    <Zap className="w-3 h-3" /> Per user / month
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
                    <a className="mt-6 block w-full text-center px-4 py-3 rounded-lg font-bold text-white transition-all" style={{ backgroundColor: plan.highlight ? EBE_GREEN : EBE_DARK }}>
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
            <h2 className="text-3xl font-bold text-foreground mb-4">Complete 8x8 Platform</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Phone, video, chat, contact center, analytics, and global calling — unified on one platform with one admin portal and one vendor.
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

        {/* Why 8x8 */}
        <motion.section
          className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-foreground mb-10 text-center">Why 8x8?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyUs.map((item) => (
              <div key={item.title} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: EBE_GREEN }}>
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
                <Icon className="w-8 h-8 mb-4" style={{ color: EBE_GREEN }} />
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
              <h2 className="text-3xl font-bold text-foreground mb-3">Get an 8x8 Quote</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                One platform for voice, video, chat, and contact center — globally. Tell us about your team and we'll recommend the right 8x8 plan.
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 border border-border">
              <VendorInquiryForm
                vendorName="8x8"
                vendorSlug="8x8"
                accentColor={EBE_GREEN}
                accentDark={EBE_DARK}
                services={[
                  "8x8 X2 — UCaaS (Phone + Video + Chat, $24/user/mo)",
                  "8x8 X4 — UCaaS + Supervisor Analytics ($44/user/mo)",
                  "8x8 X6 — UCaaS + Contact Center (Custom Quote)",
                  "8x8 X7 / X8 — Full CCaaS Platform (Custom Quote)",
                  "Global Calling (48-Country Coverage)",
                  "AI Agent Assist / Intelligent IVR",
                ]}
                extraFields={[
                  { id: "users", label: "Number of Users (Seats)", type: "select", options: ["1–9", "10–49", "50–199", "200–999", "1,000+"], required: true },
                  { id: "international", label: "International Calling Needed?", type: "select", options: ["No — US domestic only", "Yes — US + Canada / Mexico", "Yes — Europe / EMEA", "Yes — Asia-Pacific", "Yes — multiple regions globally"] },
                  { id: "contact_center", label: "Contact Center Needed?", type: "select", options: ["No — internal/business calling only", "Yes — small call center (under 25 agents)", "Yes — mid-size contact center (25–200 agents)", "Yes — large enterprise contact center"] },
                ]}
              />
            </div>
            <p className="text-xs text-center text-muted-foreground mt-4">
              * Prices shown are annual per-user rates. Month-to-month rates are higher. Contact us for volume discounts across large deployments.
            </p>
          </div>
        </motion.section>

        {/* CTA */}
        <motion.div
          className="text-white rounded-xl p-12 text-center"
          style={{ background: `linear-gradient(135deg, ${EBE_DARK} 0%, ${EBE_GREEN} 100%)` }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-4">Unify Your Communications with 8x8</h2>
          <p className="text-green-100 text-lg mb-8 max-w-xl mx-auto">
            Phone, video, team chat, and contact center on one platform — with unlimited calling to 48 countries. We'll help you migrate from your current system with zero downtime.
          </p>
          <Link href="/contact">
            <a className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-white font-bold hover:bg-green-50 transition-colors text-lg" style={{ color: EBE_DARK }}>
              <ArrowRight className="w-5 h-5" />
              Get a Custom Quote
            </a>
          </Link>
          <p className="text-green-200 text-sm mt-5">Starting at $24/user/mo · 48-country calling · 99.999% uptime</p>
        </motion.div>

      </div>
    </div>
  );
}
