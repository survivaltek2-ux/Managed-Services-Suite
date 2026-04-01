import { motion } from "framer-motion";
import {
  Shield, Camera, Lock, Bell, Building2, CheckCircle,
  ExternalLink, Globe, ArrowRight, Layers, Smartphone, Eye
} from "lucide-react";
import { Link } from "wouter";

const ADT_BLUE = "#00529b";
const ADT_RED = "#d32f2f";

const plans = [
  {
    name: "ADT Secure",
    price: "Custom Quote",
    priceNote: "Contact us for business pricing",
    highlight: false,
    description: "Essential intrusion detection for small businesses and retail locations.",
    features: [
      "Intrusion detection system",
      "Holdup / panic alarm",
      "Temperature monitoring",
      "Flood detection sensors",
      "24/7 ADT monitoring center",
      "Professional installation",
    ],
  },
  {
    name: "ADT Smart",
    price: "Custom Quote",
    priceNote: "Most popular for SMB",
    highlight: true,
    description: "Full smart security with cameras, remote access, and access control.",
    features: [
      "Everything in Secure",
      "Indoor & outdoor cameras",
      "Remote access via mobile app",
      "Smart access control",
      "Two-way audio at entry points",
      "Video verification",
      "Fire & CO detection",
    ],
  },
  {
    name: "ADT Complete",
    price: "Custom Quote",
    priceNote: "Enterprise-grade protection",
    highlight: false,
    description: "Enterprise commercial security with video analytics and managed access.",
    features: [
      "Everything in Smart",
      "AI-powered video analytics",
      "License plate recognition",
      "Enterprise access control",
      "Perimeter protection",
      "Dedicated account manager",
      "SLA-backed response times",
    ],
  },
];

const services = [
  {
    icon: Bell,
    title: "Intrusion Detection",
    subtitle: "24/7 Monitored Alarm System",
    description:
      "Commercial-grade intrusion detection with door/window sensors, motion detectors, glass break sensors, and panic buttons — monitored 24/7 by ADT's six redundant monitoring centers.",
    highlights: [
      "Motion & contact sensors",
      "Glass break detection",
      "Holdup & duress alarms",
      "6 redundant monitoring centers",
    ],
    color: ADT_BLUE,
  },
  {
    icon: Camera,
    title: "Commercial Video Surveillance",
    subtitle: "IP Cameras & Video Analytics",
    description:
      "HD IP security cameras for indoor and outdoor commercial use. AI-powered video analytics detect loitering, perimeter breaches, and object counting — with cloud and on-premise storage options.",
    highlights: [
      "HD indoor & outdoor cameras",
      "AI video analytics",
      "Cloud & local storage",
      "Remote viewing from any device",
    ],
    color: "#7c3aed",
  },
  {
    icon: Lock,
    title: "Access Control",
    subtitle: "Smart Door & Facility Access",
    description:
      "Cloud-managed access control systems for employee badge readers, key fob entry, and mobile credentials. Set schedules, track entry logs, and remotely grant or revoke access in real time.",
    highlights: [
      "Badge, fob & mobile access",
      "Cloud-managed schedules",
      "Real-time entry logs",
      "Remote access grant/revoke",
    ],
    color: "#16a34a",
  },
  {
    icon: Eye,
    title: "Video Verification",
    subtitle: "Visual Alarm Confirmation",
    description:
      "When an alarm triggers, ADT's monitoring center views live or recorded camera footage to visually confirm the threat before dispatching — reducing false alarm dispatch fees significantly.",
    highlights: [
      "Visual alarm confirmation",
      "Reduces false dispatches",
      "Priority police response",
      "Faster verified dispatch",
    ],
    color: ADT_RED,
  },
  {
    icon: Shield,
    title: "Fire & Life Safety",
    subtitle: "Smoke, CO & Suppression",
    description:
      "UL-listed commercial fire alarm systems with smoke detectors, carbon monoxide sensors, heat detectors, and integration with sprinkler systems — monitored 24/7 and compliant with NFPA and local codes.",
    highlights: [
      "UL-listed fire alarm systems",
      "Smoke, CO & heat detection",
      "NFPA code compliant",
      "Sprinkler system integration",
    ],
    color: "#ea580c",
  },
  {
    icon: Smartphone,
    title: "ADT Command (Business App)",
    subtitle: "Remote Management Platform",
    description:
      "ADT Command is the mobile and web platform for remotely arming/disarming your system, viewing live cameras, managing access credentials, receiving alerts, and reviewing event history.",
    highlights: [
      "Arm/disarm remotely",
      "Live camera streaming",
      "Real-time alerts",
      "Multi-location management",
    ],
    color: "#0891b2",
  },
];

const whyUs = [
  {
    title: "150+ Years of Security Experience",
    description:
      "ADT has been protecting homes and businesses since 1874 — more than 150 years of operational security monitoring experience unmatched by any other provider.",
  },
  {
    title: "6 Redundant Monitoring Centers",
    description:
      "ADT operates six monitoring centers across the U.S. — if one goes down, another takes over instantly. This redundancy ensures your alarms are always monitored, even during disasters.",
  },
  {
    title: "6.5 Million+ Business & Home Customers",
    description:
      "ADT protects over 6.5 million customers, making it the largest security company in North America. Scale and infrastructure few competitors can match.",
  },
  {
    title: "Video Verification Reduces False Alarms",
    description:
      "ADT's visual alarm verification cuts false alarm dispatches by up to 90% — saving you money on false alarm fines and ensuring police prioritize your genuine alerts.",
  },
  {
    title: "Multi-Location Management",
    description:
      "ADT Business can manage security across hundreds of locations from a single account — with centralized reporting, unified access credentials, and consolidated billing.",
  },
  {
    title: "Integrated with Smart Building Systems",
    description:
      "ADT integrates with HVAC, lighting, POS systems, and building automation. Lock the doors, turn off the lights, and arm the system automatically at closing time.",
  },
];

const idealFor = [
  {
    type: "Retail & Restaurant (1–10 locations)",
    plans: "ADT Smart — cameras, intrusion & access control per location",
    icon: Building2,
  },
  {
    type: "Healthcare & Financial Services",
    plans: "ADT Complete — video analytics, access control & fire/life safety",
    icon: Layers,
  },
  {
    type: "Multi-Site Enterprise",
    plans: "ADT Enterprise — centralized command, analytics & dedicated account team",
    icon: Globe,
  },
];

export default function ADTBusiness() {
  return (
    <div className="w-full bg-background">
      {/* Hero */}
      <motion.div
        className="text-white py-16 px-4 sm:px-6 lg:px-8"
        style={{ background: `linear-gradient(135deg, #1a1a1a 0%, ${ADT_BLUE} 100%)` }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-white/15">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="text-blue-200 text-sm font-semibold uppercase tracking-wide">150+ Years Protecting Business · America's #1 Security Company</div>
              <h1 className="text-4xl font-bold">ADT Business Security</h1>
            </div>
          </div>
          <p className="text-blue-100 text-lg mt-4 max-w-2xl leading-relaxed">
            Commercial intrusion detection, HD video surveillance, smart access control, fire & life safety, and 24/7 monitoring — all from the most trusted name in American security.
          </p>
          <div className="flex flex-wrap gap-4 mt-8">
            <Link href="/contact">
              <a className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white font-bold hover:bg-blue-50 transition-colors" style={{ color: ADT_BLUE }}>
                <ArrowRight className="w-5 h-5" />
                Get a Security Assessment
              </a>
            </Link>
            <a
              href="https://www.adt.com/business"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold border border-white/40 text-white hover:bg-white/10 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Visit ADT Business
            </a>
          </div>

          <div className="grid grid-cols-3 gap-6 mt-12 border-t border-white/20 pt-10">
            {[
              { value: "150+", label: "Years in security" },
              { value: "6.5M+", label: "Customers protected" },
              { value: "6", label: "Monitoring centers" },
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

        {/* Plans */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">ADT Business Security Plans</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Every business is different. ADT's commercial security plans are customized to your facility size, risk profile, and compliance requirements.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => (
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
                  <div className="px-4 py-2 text-xs font-bold text-white text-center" style={{ backgroundColor: ADT_BLUE }}>
                    MOST POPULAR FOR SMB
                  </div>
                )}
                <div className="p-6 bg-card">
                  <h3 className="text-xl font-bold text-foreground mb-1">{plan.name}</h3>
                  <div className="text-xl font-bold mb-1" style={{ color: ADT_BLUE }}>{plan.price}</div>
                  <p className="text-xs text-muted-foreground mb-2">{plan.priceNote}</p>
                  <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                  <ul className="space-y-2.5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 mt-0.5 shrink-0 text-green-500" />
                        <span className="text-sm text-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/contact">
                    <a className="mt-6 block w-full text-center px-4 py-3 rounded-lg font-bold text-white transition-all" style={{ backgroundColor: plan.highlight ? ADT_BLUE : "#1a1a1a" }}>
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
            <h2 className="text-3xl font-bold text-foreground mb-4">Commercial Security Services</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              From intrusion alarms to AI-powered video analytics and smart access control — ADT Business has every layer of physical security covered.
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

        {/* Why ADT */}
        <motion.section
          className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-foreground mb-10 text-center">Why ADT Business?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyUs.map((item) => (
              <div key={item.title} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: ADT_BLUE }}>
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
                <Icon className="w-8 h-8 mb-4" style={{ color: ADT_BLUE }} />
                <h3 className="font-bold text-foreground mb-2">{type}</h3>
                <p className="text-sm text-muted-foreground">{plans}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* CTA */}
        <motion.div
          className="text-white rounded-xl p-12 text-center"
          style={{ background: `linear-gradient(135deg, #1a1a1a 0%, ${ADT_BLUE} 100%)` }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-4">Protect Your Business with ADT</h2>
          <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
            Start with a free security assessment of your facility. We'll identify vulnerabilities and design a custom ADT system sized for your space, risk level, and budget.
          </p>
          <Link href="/contact">
            <a className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-white font-bold hover:bg-blue-50 transition-colors text-lg" style={{ color: ADT_BLUE }}>
              <ArrowRight className="w-5 h-5" />
              Request a Free Assessment
            </a>
          </Link>
          <p className="text-blue-200 text-sm mt-5">150+ years of security expertise · 24/7 monitoring · Professional installation</p>
        </motion.div>

      </div>
    </div>
  );
}
