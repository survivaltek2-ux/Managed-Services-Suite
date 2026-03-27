import { motion } from "framer-motion";
import {
  Wifi, Network, Shield, Cloud, Radio, Brain,
  Check, TrendingUp, Zap, Building2, GraduationCap,
  HeartPulse, Factory, Hotel, Layers, ArrowRight
} from "lucide-react";
import { Card, CardContent, Button } from "@/components/ui";
import { Link } from "wouter";

const JUNIPER_GREEN = "#84BD00";
const JUNIPER_DARK = "#2B3A1F";
const JUNIPER_LIGHT = "#F0F7E0";

const products = [
  {
    icon: <Brain className="w-7 h-7" />,
    title: "Mist AI & AIOps",
    badge: "AI Platform",
    desc: "Juniper's Mist AI is the industry's most advanced AI for networking — purpose-built, not retrofitted. Patented virtual network assistant Marvis resolves issues before users notice them, reducing helpdesk tickets by up to 90%.",
  },
  {
    icon: <Wifi className="w-7 h-7" />,
    title: "Wireless LAN (Wi-Fi 6/6E)",
    badge: "Wireless",
    desc: "Juniper's Wi-Fi 6 and 6E access points are managed by Mist AI through the cloud, delivering dynamic packet capture, proactive anomaly detection, and automated RF optimization without manual intervention.",
  },
  {
    icon: <Network className="w-7 h-7" />,
    title: "EX Series Switching",
    badge: "Campus Switching",
    desc: "Juniper EX Series campus switches provide high-performance, cloud-managed access, aggregation, and core layers. Unified with Mist AI for wired assurance — delivering per-client SLE metrics and root-cause analysis at every port.",
  },
  {
    icon: <Shield className="w-7 h-7" />,
    title: "SRX Series Security",
    badge: "NGFW / Security",
    desc: "Juniper SRX next-generation firewalls combine advanced threat prevention, unified threat management, and automated policy enforcement across campus, branch, and data center — all managed from a single console.",
  },
  {
    icon: <Radio className="w-7 h-7" />,
    title: "Session Smart WAN / SD-WAN",
    badge: "WAN / SD-WAN",
    desc: "Juniper's Session Smart Router eliminates stateful sessions and complex failover logic, reducing WAN bandwidth costs by up to 50% while providing sub-second failover and application-aware traffic steering.",
  },
  {
    icon: <Cloud className="w-7 h-7" />,
    title: "Juniper Mist Cloud",
    badge: "Cloud Management",
    desc: "A single cloud management plane for wired, wireless, WAN, and security. Mist Cloud provides microservices-based architecture with open APIs, enabling integration with ITSM, CMDB, and business intelligence platforms.",
  },
];

const whyUs = [
  {
    title: "Juniper Partner Advantage Member",
    desc: "Siebert Services is enrolled in the Juniper Partner Advantage program, giving us access to deal registration, NFR equipment, and the Juniper Learning Portal to keep our engineers current on every platform.",
  },
  {
    title: "Mist AI Deployment Specialists",
    desc: "We are trained on Juniper Mist AI onboarding, wired assurance, and wireless assurance — ensuring your deployment captures the full value of AI-driven operations from day one.",
  },
  {
    title: "Unified Wired + Wireless + WAN",
    desc: "We design and deploy Juniper's full AI-Native Networking stack — wireless, switching, WAN, and security — from a single project plan with a single point of accountability.",
  },
  {
    title: "Ongoing AI-Ops Management",
    desc: "Post-deployment, we monitor your Mist AI dashboards, review SLE trends, and act on proactive anomaly alerts — keeping your network healthy without burdening your internal IT team.",
  },
];

const stats = [
  { value: "90%", label: "Reduction in helpdesk tickets with Mist AI" },
  { value: "50%", label: "WAN bandwidth savings with Session Smart Router" },
  { value: "1M+", label: "Access points managed by Mist AI globally" },
  { value: "Sub-sec", label: "WAN failover with Session Smart SD-WAN" },
];

const verticals = [
  { icon: <Building2 className="w-5 h-5" />, name: "Enterprise & Corporate" },
  { icon: <GraduationCap className="w-5 h-5" />, name: "Education" },
  { icon: <HeartPulse className="w-5 h-5" />, name: "Healthcare" },
  { icon: <Hotel className="w-5 h-5" />, name: "Hospitality" },
  { icon: <Factory className="w-5 h-5" />, name: "Manufacturing" },
  { icon: <TrendingUp className="w-5 h-5" />, name: "Retail" },
];

export default function JuniperNetworks() {
  return (
    <div className="min-h-screen bg-background">

      {/* Hero */}
      <div className="relative pt-24 pb-0 overflow-hidden" style={{ background: `linear-gradient(135deg, ${JUNIPER_DARK} 0%, #3D5A1A 50%, #1A2B0D 100%)` }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute right-0 top-0 w-[700px] h-[700px] rounded-full blur-[120px]" style={{ background: "rgba(132,189,0,0.15)" }} />
          <div className="absolute left-0 bottom-0 w-[500px] h-[500px] rounded-full blur-[100px]" style={{ background: "rgba(0,0,0,0.3)" }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center pb-24">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 border border-white/20 text-white text-sm font-semibold mb-8">
              <Zap className="w-4 h-4" style={{ color: JUNIPER_GREEN }} />
              Juniper Partner Advantage Member
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-extrabold text-white mb-6 tracking-tight leading-tight">
              AI-Native Networking<br />
              <span style={{ color: JUNIPER_GREEN }}>Powered by Mist AI</span>
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto font-medium mb-10">
              Siebert Services designs, deploys, and manages Juniper's AI-Native Networking Platform — giving your business self-driving network operations with Mist AI at the core.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/quote">
                <Button className="h-12 px-8 text-base bg-white hover:bg-lime-50" style={{ color: JUNIPER_DARK }}>
                  Get a Network Assessment
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" className="h-12 px-8 text-base border-white/30 text-white hover:bg-white/10">
                  Talk to an Expert
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Stats bar */}
        <div className="bg-white/5 border-t border-white/10 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {stats.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.08 }}
                >
                  <div className="text-3xl font-display font-extrabold mb-1" style={{ color: JUNIPER_GREEN }}>{s.value}</div>
                  <div className="text-xs text-white/60 leading-snug">{s.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Why Siebert for Juniper */}
      <section className="py-24 bg-gray-50 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-6" style={{ background: JUNIPER_LIGHT, color: JUNIPER_DARK }}>
                <Layers className="w-4 h-4" /> Why Siebert Services?
              </div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-navy mb-6">
                Your Juniper solution — fully managed, end to end.
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Juniper's AI-Native Networking Platform is the most intelligent in the industry. We make it operational for your business. As a Juniper Partner Advantage member, Siebert Services handles design, procurement, deployment, and ongoing AI-ops so you realize the full value of Mist AI from day one.
              </p>
              <ul className="space-y-6">
                {whyUs.map((item, i) => (
                  <li key={i} className="flex gap-4">
                    <div className="mt-1 rounded-full p-1 shrink-0" style={{ background: JUNIPER_LIGHT }}>
                      <Check className="w-5 h-5" style={{ color: JUNIPER_GREEN }} />
                    </div>
                    <div>
                      <h4 className="font-bold text-navy text-lg">{item.title}</h4>
                      <p className="text-muted-foreground">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Platform card */}
            <div className="bg-white rounded-3xl shadow-xl border border-border p-8">
              <h3 className="text-2xl font-display font-bold text-navy mb-2">AI-Native Networking Platform</h3>
              <p className="text-muted-foreground text-sm mb-6">Mist AI unifies wired, wireless, WAN, and security — managed from a single cloud pane of glass.</p>
              <div className="space-y-3 mb-8">
                {[
                  ["Mist AI & AIOps", "AI Platform"],
                  ["Wi-Fi 6 / 6E APs", "Wireless"],
                  ["EX Series Switching", "Switching"],
                  ["SRX Firewalls", "Security"],
                  ["Session Smart WAN", "SD-WAN"],
                  ["Mist Cloud Portal", "Management"],
                ].map(([name, tag]) => {
                  const tagColors: Record<string, string> = {
                    "AI Platform": "bg-lime-100 text-lime-700",
                    Wireless: "bg-blue-100 text-blue-700",
                    Switching: "bg-slate-100 text-slate-700",
                    Security: "bg-red-100 text-red-700",
                    "SD-WAN": "bg-orange-100 text-orange-700",
                    Management: "bg-green-100 text-green-700",
                  };
                  return (
                    <div key={name} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-border">
                      <span className="font-semibold text-navy text-sm">{name}</span>
                      <span className={`text-xs px-2 py-1 rounded font-medium ${tagColors[tag]}`}>{tag}</span>
                    </div>
                  );
                })}
              </div>
              <Link href="/quote">
                <Button className="w-full h-11 text-base text-white" style={{ background: JUNIPER_GREEN }}>
                  Request a Network Design <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold text-navy mb-4">The Full Juniper Networks Portfolio</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              AI, wireless, switching, security, and WAN — one unified platform delivered and managed by Siebert Services.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((prod, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.07 }}
              >
                <Card className="h-full border-border/60 hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-5">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: JUNIPER_LIGHT, color: JUNIPER_GREEN }}>
                        {prod.icon}
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: JUNIPER_LIGHT, color: JUNIPER_DARK }}>
                        {prod.badge}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-navy mb-2">{prod.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{prod.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Verticals */}
      <section className="py-16 bg-gray-50 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-display font-bold text-navy mb-2">Trusted Across Every Industry</h2>
            <p className="text-muted-foreground">Juniper Mist AI powers networks at Fortune 500 enterprises, top-ranked universities, hotel chains, and hospital systems worldwide.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {verticals.map((v, i) => (
              <div key={i} className="flex items-center gap-2 px-5 py-3 rounded-full border border-border bg-white shadow-sm font-medium text-navy text-sm">
                <span style={{ color: JUNIPER_GREEN }}>{v.icon}</span>
                {v.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24" style={{ background: `linear-gradient(135deg, ${JUNIPER_DARK} 0%, #3D5A1A 100%)` }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl font-display font-extrabold text-white mb-4">
              Ready to experience AI-Native Networking?
            </h2>
            <p className="text-white/70 text-lg mb-10 max-w-2xl mx-auto">
              Let Siebert Services design, deploy, and manage a Juniper Mist AI environment tailored to your business — with self-driving operations and zero-touch troubleshooting from day one.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/quote">
                <Button className="h-12 px-8 text-base bg-white hover:bg-lime-50" style={{ color: JUNIPER_DARK }}>
                  Get a Free Assessment
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" className="h-12 px-8 text-base border-white/30 text-white hover:bg-white/10">
                  Contact Us
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
