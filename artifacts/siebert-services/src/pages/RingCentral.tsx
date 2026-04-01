import { motion } from "framer-motion";
import {
  Phone, Video, MessageSquare, Shield, Zap, Building2, CheckCircle,
  ExternalLink, Globe, ArrowRight, Layers, Headphones, BarChart2
} from "lucide-react";
import { Link } from "wouter";
import { VendorInquiryForm } from "@/components/forms/VendorInquiryForm";

const RC_ORANGE = "#ff6600";
const RC_DARK = "#c94f00";

const plans = [
  {
    name: "RingCentral Core",
    price: "$20/user/mo",
    priceNote: "Billed annually · min. 2 users",
    highlight: false,
    features: [
      "Unlimited domestic calling",
      "Business SMS & MMS",
      "Voicemail-to-email",
      "Team messaging",
      "Document sharing",
      "Basic analytics",
    ],
  },
  {
    name: "RingCentral Advanced",
    price: "$25/user/mo",
    priceNote: "Billed annually · min. 2 users",
    highlight: true,
    features: [
      "Everything in Core",
      "Auto call recording",
      "Advanced call handling",
      "CRM integrations (Salesforce, HubSpot)",
      "Multi-site management",
      "Business analytics & reporting",
      "Internet fax included",
    ],
  },
  {
    name: "RingCentral Ultra",
    price: "$35/user/mo",
    priceNote: "Billed annually · min. 2 users",
    highlight: false,
    features: [
      "Everything in Advanced",
      "Unlimited file & message storage",
      "Advanced analytics & custom reports",
      "Enhanced business analytics",
      "Full device status reports",
      "Unlimited international calling (add-on)",
    ],
  },
];

const services = [
  {
    icon: Phone,
    title: "Cloud Business Phone",
    subtitle: "UCaaS Phone System",
    description:
      "Replace your traditional phone system with a cloud PBX. Unlimited calling, auto-attendant, call routing, hunt groups, and a desktop/mobile app — all in one subscription.",
    highlights: [
      "Unlimited US/Canada calling",
      "Auto-attendant & IVR",
      "Hunt groups & call queues",
      "Desktop + mobile apps",
    ],
    color: RC_ORANGE,
  },
  {
    icon: Video,
    title: "RingCentral Video",
    subtitle: "HD Video Meetings",
    description:
      "HD video conferencing with screen sharing, whiteboarding, breakout rooms, and meeting recordings — built directly into the same app as your phone and team messaging.",
    highlights: [
      "HD video meetings",
      "Screen sharing & whiteboard",
      "Breakout rooms",
      "Meeting recordings & transcripts",
    ],
    color: "#7c3aed",
  },
  {
    icon: MessageSquare,
    title: "Team Messaging",
    subtitle: "Business Chat",
    description:
      "Slack-style team messaging built into the RingCentral app. Create channels, share files, mention teammates, and start a call or video meeting from any conversation instantly.",
    highlights: [
      "Unlimited team channels",
      "File sharing & pinning",
      "In-chat call & video launch",
      "1,000+ app integrations",
    ],
    color: "#16a34a",
  },
  {
    icon: Headphones,
    title: "RingCX Contact Center",
    subtitle: "CCaaS / Customer Service",
    description:
      "AI-powered contact center with omni-channel routing (voice, email, chat, social). Built-in IVR, workforce management, quality monitoring, and real-time analytics for customer service teams.",
    highlights: [
      "Omni-channel routing",
      "AI-powered IVR",
      "Real-time analytics",
      "WFM & quality monitoring",
    ],
    color: "#dc2626",
  },
  {
    icon: BarChart2,
    title: "Analytics & Reporting",
    subtitle: "Business Intelligence",
    description:
      "Pre-built and custom dashboards showing call volumes, agent performance, queue wait times, and customer satisfaction scores — all in real time with exportable reports.",
    highlights: [
      "Real-time dashboards",
      "Call quality reports",
      "Agent performance KPIs",
      "Custom report builder",
    ],
    color: "#0891b2",
  },
  {
    icon: Globe,
    title: "Global Reach",
    subtitle: "46+ Countries",
    description:
      "RingCentral is one of the few UCaaS providers with true multi-country PSTN support. Provision numbers and users in 46+ countries from a single admin portal.",
    highlights: [
      "Local numbers in 46+ countries",
      "Single global admin portal",
      "Compliance for global teams",
      "International calling plans",
    ],
    color: "#ea580c",
  },
];

const integrations = [
  "Salesforce", "Microsoft Teams", "Google Workspace", "HubSpot",
  "Zendesk", "ServiceNow", "Slack", "Zoom", "Okta", "Jira",
  "Dropbox", "Box", "Clio", "Epic (healthcare)", "Canvas (education)",
];

const whyUs = [
  {
    title: "Gartner Magic Quadrant Leader",
    description:
      "RingCentral has been named a Leader in the Gartner Magic Quadrant for UCaaS for 10 consecutive years — a record no other vendor has matched.",
  },
  {
    title: "400,000+ Businesses Globally",
    description:
      "From 2-person startups to Fortune 500 enterprises, over 400,000 organizations across 46 countries trust RingCentral for their business communications.",
  },
  {
    title: "99.999% Uptime SLA",
    description:
      "RingCentral's infrastructure is built on a geo-redundant cloud with a 99.999% uptime SLA — equating to less than 6 minutes of downtime per year.",
  },
  {
    title: "AI-Powered Everywhere",
    description:
      "RingSense AI transcribes calls, summarizes meetings, surfaces key insights, coaches agents, and automates follow-up tasks — natively inside the platform.",
  },
  {
    title: "300+ Pre-Built Integrations",
    description:
      "Connect RingCentral to your CRM, helpdesk, ERP, and collaboration tools. The app gallery has 300+ certified integrations with no-code setup options.",
  },
  {
    title: "One App for Everything",
    description:
      "Phone, video, messaging, fax, and analytics — all in a single download. No juggling Zoom for video, Slack for chat, and a separate desk phone system.",
  },
];

const idealFor = [
  {
    type: "Small Business (2–20 seats)",
    plans: "RingCentral Core or Advanced — replace desk phones with the app",
    icon: Building2,
  },
  {
    type: "Growing Business (20–200 seats)",
    plans: "RingCentral Advanced with CRM integrations + Video",
    icon: Layers,
  },
  {
    type: "Enterprise / Contact Center",
    plans: "RingCentral Ultra + RingCX CCaaS + AI analytics",
    icon: Globe,
  },
];

export default function RingCentral() {
  return (
    <div className="w-full bg-background">
      {/* Hero */}
      <motion.div
        className="text-white py-16 px-4 sm:px-6 lg:px-8"
        style={{ background: `linear-gradient(135deg, ${RC_DARK} 0%, ${RC_ORANGE} 100%)` }}
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
              <div className="text-orange-200 text-sm font-semibold uppercase tracking-wide">Gartner Magic Quadrant Leader · 10 Years Running</div>
              <h1 className="text-4xl font-bold">RingCentral</h1>
            </div>
          </div>
          <p className="text-orange-100 text-lg mt-4 max-w-2xl leading-relaxed">
            Cloud phone, video meetings, team messaging, and AI-powered contact center — all in one platform trusted by 400,000+ businesses across 46 countries.
          </p>
          <div className="flex flex-wrap gap-4 mt-8">
            <Link href="/contact">
              <a className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white font-bold hover:bg-orange-50 transition-colors" style={{ color: RC_DARK }}>
                <ArrowRight className="w-5 h-5" />
                Request a Quote
              </a>
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-6 mt-12 border-t border-white/20 pt-10">
            {[
              { value: "400K+", label: "Business customers" },
              { value: "46+", label: "Countries supported" },
              { value: "99.999%", label: "Uptime SLA" },
            ].map(({ value, label }) => (
              <div key={label}>
                <div className="text-2xl font-bold text-white">{value}</div>
                <div className="text-orange-200 text-sm">{label}</div>
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
            <h2 className="text-3xl font-bold text-foreground mb-4">RingCentral MVP Plans</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              All plans include unlimited calling, video, messaging, and a 99.999% uptime SLA. No hardware required.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <motion.div
                key={plan.name}
                className={`rounded-xl border-2 overflow-hidden transition-all ${
                  plan.highlight ? "border-orange-500 ring-2 ring-orange-200 shadow-xl" : "border-border"
                }`}
                whileHover={{ y: -4 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                {plan.highlight && (
                  <div className="px-4 py-2 text-xs font-bold text-white text-center" style={{ backgroundColor: RC_ORANGE }}>
                    MOST POPULAR
                  </div>
                )}
                <div className="p-6 bg-card">
                  <h3 className="text-xl font-bold text-foreground mb-1">{plan.name}</h3>
                  <div className="text-3xl font-bold mb-1" style={{ color: RC_ORANGE }}>{plan.price}</div>
                  <p className="text-xs text-muted-foreground mb-4">{plan.priceNote}</p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-5" style={{ backgroundColor: `${RC_ORANGE}15`, color: RC_ORANGE }}>
                    <Zap className="w-3 h-3" /> All-in-one UCaaS
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
                    <a className="mt-6 block w-full text-center px-4 py-3 rounded-lg font-bold text-white transition-all" style={{ backgroundColor: plan.highlight ? RC_ORANGE : RC_DARK }}>
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
            <h2 className="text-3xl font-bold text-foreground mb-4">Complete Communications Platform</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Phone, video, messaging, contact center, and analytics — all from a single cloud platform with one login.
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

        {/* Integrations */}
        <motion.section
          className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-foreground mb-4 text-center">300+ Integrations</h2>
          <p className="text-center text-muted-foreground mb-8">
            Connect RingCentral with the tools your team already uses. No complex IT setup required.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            {integrations.map((name) => (
              <span key={name} className="px-4 py-2 bg-white border border-orange-200 rounded-full text-sm font-medium text-foreground shadow-sm">
                {name}
              </span>
            ))}
            <span className="px-4 py-2 bg-white border border-orange-200 rounded-full text-sm font-medium text-muted-foreground shadow-sm">
              + 285 more...
            </span>
          </div>
        </motion.section>

        {/* Why RingCentral */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-foreground mb-10 text-center">Why RingCentral?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyUs.map((item) => (
              <div key={item.title} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: RC_ORANGE }}>
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
                <Icon className="w-8 h-8 mb-4" style={{ color: RC_ORANGE }} />
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
              <h2 className="text-3xl font-bold text-foreground mb-3">Get a RingCentral Quote</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Tell us about your team and communication needs — we'll recommend the right RingCentral plan and handle the full deployment for you.
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 border border-border">
              <VendorInquiryForm
                vendorName="RingCentral"
                vendorSlug="ringcentral"
                accentColor={RC_ORANGE}
                accentDark={RC_DARK}
                services={[
                  "RingCentral Core (Phone + Video + Messaging)",
                  "RingCentral Advanced (+ Analytics & Reporting)",
                  "RingCentral Ultra (+ Unlimited Storage & AI)",
                  "RingCX Contact Center",
                  "Microsoft Teams / Google Workspace Integration",
                  "Industry-Specific Plans (Healthcare, Finance, Legal)",
                ]}
                extraFields={[
                  { id: "users", label: "Number of Users (Seats)", type: "select", options: ["1–9", "10–49", "50–199", "200–999", "1,000+"], required: true },
                  { id: "locations", label: "Number of Office Locations", type: "select", options: ["1", "2–5", "6–20", "21+"] },
                  { id: "current_system", label: "Current Phone System", type: "select", options: ["Legacy PBX / On-prem", "Zoom Phone", "Microsoft Teams Phone", "Cisco / Webex", "Another UCaaS platform", "No system yet"] },
                  { id: "contact_center", label: "Contact Center / Call Center Needed?", type: "select", options: ["Yes — inbound only", "Yes — inbound + outbound", "No — internal communications only"] },
                ]}
              />
            </div>
            <p className="text-xs text-center text-muted-foreground mt-4">
              * Prices shown are annual per-user rates. Month-to-month rates are higher. Minimum 2 users. Contact us for volume discounts and enterprise pricing.
            </p>
          </div>
        </motion.section>

        {/* CTA */}
        <motion.div
          className="text-white rounded-xl p-12 text-center"
          style={{ background: `linear-gradient(135deg, ${RC_DARK} 0%, ${RC_ORANGE} 100%)` }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-4">Upgrade Your Business Communications</h2>
          <p className="text-orange-100 text-lg mb-8 max-w-xl mx-auto">
            Replace your desk phones, Zoom subscription, and Slack with one platform that does it all — at a price that scales with your team.
          </p>
          <Link href="/contact">
            <a className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-white font-bold hover:bg-orange-50 transition-colors text-lg" style={{ color: RC_DARK }}>
              <ArrowRight className="w-5 h-5" />
              Get a Custom Quote
            </a>
          </Link>
          <p className="text-orange-200 text-sm mt-5">Starting at $20/user/mo · 99.999% uptime SLA · No hardware required</p>
        </motion.div>

      </div>
    </div>
  );
}
