import { motion } from "framer-motion";
import {
  Wifi, Phone, Shield, Zap, Building2, CheckCircle,
  ExternalLink, Globe, ArrowRight, Layers, Radio, Server
} from "lucide-react";
import { Link } from "wouter";
import { VendorInquiryForm } from "@/components/forms/VendorInquiryForm";

const VZ_RED = "#cd040b";
const VZ_DARK = "#1a1a1a";

const internetPlans = [
  {
    name: "Fios Business 300",
    speed: "300 Mbps",
    symmetric: true,
    price: "$69/mo",
    priceNote: "2-yr price guarantee w/ Auto Pay",
    highlight: false,
    features: [
      "300 Mbps symmetrical fiber",
      "No data caps",
      "Router included",
      "Business Wi-Fi available",
      "24/7 support line",
    ],
  },
  {
    name: "Fios Business 500",
    speed: "500 Mbps",
    symmetric: true,
    price: "$89/mo",
    priceNote: "2-yr price guarantee w/ Auto Pay",
    highlight: true,
    features: [
      "500 Mbps symmetrical fiber",
      "No data caps",
      "Advanced router included",
      "Static IP add-on available",
      "Business Wi-Fi equipment",
      "Priority business support",
    ],
  },
  {
    name: "Fios Business 940",
    speed: "940 Mbps",
    symmetric: true,
    price: "$149/mo",
    priceNote: "2-yr price guarantee w/ Auto Pay",
    highlight: false,
    features: [
      "940 Mbps symmetrical fiber",
      "No data caps",
      "Multi-device Wi-Fi router",
      "5 static IPs included",
      "Dedicated account team",
      "SLA-backed uptime",
    ],
  },
];

const services = [
  {
    icon: Wifi,
    title: "Fios Business Internet",
    subtitle: "100% Fiber Optic",
    description:
      "Verizon Fios delivers 100% fiber-optic internet from the network to your building — not copper in the last mile. Symmetric speeds with a guaranteed 2-year price lock and no data caps.",
    highlights: [
      "300 Mbps – 940 Mbps symmetric",
      "100% fiber, no coax last mile",
      "2-year price guarantee",
      "No data caps",
    ],
    color: VZ_RED,
  },
  {
    icon: Radio,
    title: "5G Business Internet",
    subtitle: "Verizon Ultra Wideband 5G",
    description:
      "Where Verizon Ultra Wideband 5G is available, get ultra-fast wireless internet with no wired installation needed. Ideal for pop-up locations, temporary offices, and fiber-unavailable sites.",
    highlights: [
      "No installation required",
      "Ultra Wideband 5G speeds",
      "LTE fallback where needed",
      "Plug-and-play gateway",
    ],
    color: "#7c3aed",
  },
  {
    icon: Phone,
    title: "Business Digital Voice",
    subtitle: "VoIP & Unified Communications",
    description:
      "Cloud-based voice over fiber with unlimited nationwide calling, auto-attendant, voicemail-to-email, and Microsoft Teams Direct Routing integration. Replaces traditional PBX.",
    highlights: [
      "Unlimited US/Canada calling",
      "Cloud PBX & auto-attendant",
      "MS Teams Direct Routing",
      "HD voice quality on fiber",
    ],
    color: "#16a34a",
  },
  {
    icon: Shield,
    title: "Business Security",
    subtitle: "Network & Cyber Protection",
    description:
      "Verizon's security portfolio includes network-based threat intelligence, managed endpoint security, DDoS mitigation, and the Verizon Threat Research Advisory Center (VTRAC) for incident response.",
    highlights: [
      "DDoS mitigation",
      "Managed endpoint protection",
      "VTRAC incident response",
      "Network threat intelligence",
    ],
    color: "#dc2626",
  },
  {
    icon: Server,
    title: "Private Networking / MPLS",
    subtitle: "Enterprise WAN Solutions",
    description:
      "Private IP and MPLS networking for multi-site enterprises needing secure, high-performance connections between offices, data centers, and cloud environments — with SLA-backed QoS.",
    highlights: [
      "Private IP & MPLS",
      "Multi-site interconnect",
      "SLA-backed QoS",
      "Cloud on-ramp available",
    ],
    color: "#0891b2",
  },
  {
    icon: Globe,
    title: "Business Mobile",
    subtitle: "Nation's Most Reliable 5G",
    description:
      "Verizon's business mobile plans run on their award-winning 5G network. Unlimited data, hotspot, international add-ons, and shared plans available — with business account management.",
    highlights: [
      "#1 rated 5G reliability",
      "Unlimited data plans",
      "Mobile hotspot included",
      "Business account portal",
    ],
    color: "#ea580c",
  },
];

const whyUs = [
  {
    title: "#1 Rated 5G Network",
    description:
      "Verizon's 5G network has been independently rated as the most reliable in the U.S. by multiple third-party testing organizations, including Opensignal and Ookla.",
  },
  {
    title: "100% Fiber — Not Hybrid",
    description:
      "Fios Business is true fiber-to-the-premises. Unlike cable competitors that use coax in the last mile, Verizon's fiber delivers full symmetric performance at every speed tier.",
  },
  {
    title: "2-Year Price Guarantee",
    description:
      "Fios Business plans come with a 2-year price lock — your rate doesn't change for two full years with AutoPay, giving you predictable IT budgeting.",
  },
  {
    title: "Enterprise Security Expertise",
    description:
      "Verizon's annual Data Breach Investigations Report (DBIR) is the industry gold standard for cybersecurity intelligence. Their VTRAC team provides incident response to major enterprises.",
  },
  {
    title: "Global Reach for Enterprises",
    description:
      "For multi-national operations, Verizon's global MPLS and SD-WAN network reaches over 150 countries — giving you a single vendor for domestic and international connectivity.",
  },
  {
    title: "Award-Winning Business Support",
    description:
      "Verizon Business has dedicated support teams, 24/7 phone and chat, and enterprise account managers — separate from the consumer support lines.",
  },
];

const idealFor = [
  {
    type: "Fios Coverage Area Businesses",
    plans: "Fios Business 500 or 940 + Digital Voice + Business Mobile",
    icon: Building2,
  },
  {
    type: "Mobile Workforce / Remote Sites",
    plans: "5G Business Internet + Business Mobile (Unlimited)",
    icon: Layers,
  },
  {
    type: "Enterprise / Multi-National",
    plans: "Private IP / MPLS + Verizon Cybersecurity + SD-WAN",
    icon: Globe,
  },
];

export default function VerizonBusiness() {
  return (
    <div className="w-full bg-background">
      {/* Hero */}
      <motion.div
        className="text-white py-16 px-4 sm:px-6 lg:px-8"
        style={{ background: `linear-gradient(135deg, ${VZ_DARK} 0%, ${VZ_RED} 100%)` }}
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
              <div className="text-red-200 text-sm font-semibold uppercase tracking-wide">Fios Fiber · 5G · Enterprise WAN</div>
              <h1 className="text-4xl font-bold">Verizon Business</h1>
            </div>
          </div>
          <p className="text-red-100 text-lg mt-4 max-w-2xl leading-relaxed">
            America's most reliable 5G network combined with 100% fiber Fios, private IP networking, cloud voice, and enterprise cybersecurity — from a global telecommunications leader.
          </p>
          <div className="flex flex-wrap gap-4 mt-8">
            <Link href="/contact">
              <a className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white font-bold hover:bg-red-50 transition-colors" style={{ color: VZ_RED }}>
                <ArrowRight className="w-5 h-5" />
                Request a Quote
              </a>
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-6 mt-12 border-t border-white/20 pt-10">
            {[
              { value: "#1", label: "Rated 5G reliability" },
              { value: "940 Mbps", label: "Max Fios speed" },
              { value: "150+", label: "Countries with MPLS" },
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
            <h2 className="text-3xl font-bold text-foreground mb-4">Fios Business Internet Plans</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              100% fiber-optic symmetric speeds with a 2-year price guarantee. No data caps, no throttling, and no coax in the last mile.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {internetPlans.map((plan) => (
              <motion.div
                key={plan.name}
                className={`rounded-xl border-2 overflow-hidden transition-all ${
                  plan.highlight ? "border-red-500 ring-2 ring-red-200 shadow-xl" : "border-border"
                }`}
                whileHover={{ y: -4 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                {plan.highlight && (
                  <div className="px-4 py-2 text-xs font-bold text-white text-center" style={{ backgroundColor: VZ_RED }}>
                    MOST POPULAR
                  </div>
                )}
                <div className="p-6 bg-card">
                  <h3 className="text-xl font-bold text-foreground mb-1">{plan.name}</h3>
                  <div className="text-3xl font-bold mb-1" style={{ color: VZ_RED }}>{plan.price}</div>
                  <p className="text-xs text-muted-foreground mb-4">{plan.priceNote}</p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-5" style={{ backgroundColor: `${VZ_RED}15`, color: VZ_RED }}>
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
                    <a className="mt-6 block w-full text-center px-4 py-3 rounded-lg font-bold text-white transition-all" style={{ backgroundColor: plan.highlight ? VZ_RED : VZ_DARK }}>
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
            <h2 className="text-3xl font-bold text-foreground mb-4">Full Verizon Business Portfolio</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Fios fiber, 5G wireless, enterprise networking, cloud voice, mobile, and world-class cybersecurity — all from one provider.
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

        {/* Why Verizon */}
        <motion.section
          className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-foreground mb-10 text-center">Why Verizon Business?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyUs.map((item) => (
              <div key={item.title} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: VZ_RED }}>
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
                <Icon className="w-8 h-8 mb-4" style={{ color: VZ_RED }} />
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
              <h2 className="text-3xl font-bold text-foreground mb-3">Get a Verizon Business Quote</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                From 100% fiber Fios to the nation's #1 5G network — tell us what you need and we'll deliver a tailored Verizon solution within one business day.
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 border border-border">
              <VendorInquiryForm
                vendorName="Verizon Business"
                vendorSlug="verizon-business"
                accentColor={VZ_RED}
                accentDark={VZ_DARK}
                services={[
                  "Fios Business Internet (Fiber)",
                  "5G Business Internet (Fixed Wireless)",
                  "Business Digital Voice (VoIP)",
                  "Private IP / MPLS",
                  "Business Mobile Plans",
                  "Verizon Business Security (MDR / EDR)",
                ]}
                extraFields={[
                  { id: "locations", label: "Number of Locations", type: "select", options: ["1", "2–5", "6–20", "21–100", "100+"], required: true },
                  { id: "speed", label: "Internet Speed Needed", type: "select", options: ["300 Mbps (Fios Business)", "500 Mbps (Fios Business)", "940 Mbps (Fios Business)", "5G Fixed Wireless (no fiber needed)", "Enterprise / Multi-Gig quote"] },
                  { id: "mobile_lines", label: "Mobile Lines Needed", type: "select", options: ["None", "1–9 lines", "10–49 lines", "50–199 lines", "200+ lines"] },
                ]}
              />
            </div>
            <p className="text-xs text-center text-muted-foreground mt-4">
              * Prices shown are estimated rates with a 2-year agreement and AutoPay. Fios availability varies by location. Contact us for exact pricing and availability.
            </p>
          </div>
        </motion.section>

        {/* CTA */}
        <motion.div
          className="text-white rounded-xl p-12 text-center"
          style={{ background: `linear-gradient(135deg, ${VZ_DARK} 0%, ${VZ_RED} 100%)` }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-4">Power Your Business with Verizon</h2>
          <p className="text-red-100 text-lg mb-8 max-w-xl mx-auto">
            From 100% fiber Fios to the nation's #1 5G network and global enterprise MPLS — we'll find the right Verizon solution for your business.
          </p>
          <Link href="/contact">
            <a className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-white font-bold hover:bg-red-50 transition-colors text-lg" style={{ color: VZ_RED }}>
              <ArrowRight className="w-5 h-5" />
              Get a Custom Quote
            </a>
          </Link>
          <p className="text-red-200 text-sm mt-5">America's #1 5G network · 2-year price guarantee on Fios</p>
        </motion.div>

      </div>
    </div>
  );
}
