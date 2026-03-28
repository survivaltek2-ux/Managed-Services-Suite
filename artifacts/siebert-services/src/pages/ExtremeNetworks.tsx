import { motion } from "framer-motion";
import {
  Wifi, Cloud, Shield, Network, Layers, Radio,
  Check, TrendingUp, Zap, Building2, GraduationCap,
  HeartPulse, Hotel, Factory, Sparkles, ArrowRight
} from "lucide-react";
import { Card, CardContent, Button } from "@/components/ui";
import { Link } from "wouter";

const EXTREME_PURPLE = "#6B21A8";
const EXTREME_LIGHT = "#F5F3FF";

const products = [
  {
    icon: <Sparkles className="w-7 h-7" />,
    title: "Extreme Platform ONE™",
    badge: "Flagship AI Platform",
    desc: "The industry's first conversational, multimodal, and agentic AI fully integrated into networking. Turns 6-hour tasks into 6 minutes — unifying wired, wireless, SD-WAN, and security in one experience.",
  },
  {
    icon: <Wifi className="w-7 h-7" />,
    title: "Wi-Fi 7 Wireless",
    badge: "Next-Gen Wireless",
    desc: "Enterprise-class access points (AP4020, AP4060, AP5020) built for high-density environments. AIOps-driven management, WBA OpenRoaming™, and automated federated access across all 6 GHz bands.",
  },
  {
    icon: <Network className="w-7 h-7" />,
    title: "Extreme Fabric Connect",
    badge: "Campus & Data Center",
    desc: "The only end-to-end automated, secure network fabric spanning campus, data center, and branch. Hyper-segmentation and stealth networking proven impenetrable in top US university and government hack-a-thon events.",
  },
  {
    icon: <Cloud className="w-7 h-7" />,
    title: "ExtremeCloud IQ",
    badge: "Cloud Management",
    desc: "Cloud networking management that reduces operating expenses, enhances productivity, and bolsters security across your entire wired, wireless, and WAN environment from a single pane of glass.",
  },
  {
    icon: <Shield className="w-7 h-7" />,
    title: "ExtremeCloud Universal ZTNA",
    badge: "Zero Trust Security",
    desc: "Combined identity-based application and network access solution that unifies cloud network access control and zero trust network access for both remote and on-site users — simultaneously.",
  },
  {
    icon: <Radio className="w-7 h-7" />,
    title: "ExtremeCloud SD-WAN",
    badge: "Branch Connectivity",
    desc: "Extend Extreme Fabric from core to the branch with fully managed SD-WAN devices. Unified policy, visibility, and automation across every site — managed directly from ExtremeCloud IQ.",
  },
];

const whyUs = [
  {
    title: "MSP-Ready Deployment",
    desc: "As an Extreme Partner First member, we provision, configure, and manage your network infrastructure — hardware, cloud, and software — in a single managed engagement.",
  },
  {
    title: "Multi-Tenant Management",
    desc: "We leverage Extreme Platform ONE's built-in multi-tenant workspace to manage your network alongside others, lowering operational overhead and your monthly cost.",
  },
  {
    title: "Consumption-Based Billing",
    desc: "Pay only for activated licenses each month. No upfront capital commitments — an OPEX-friendly model that converts your network infrastructure into a predictable monthly line item.",
  },
  {
    title: "Simplified Licensing",
    desc: "One license per device. Portable across wired and wireless platforms, usable cloud or on-premises, and extendable to integrate third-party devices you already own.",
  },
];

const stats = [
  { value: "90%", label: "Reduction in manual network tasks with AI automation" },
  { value: "6 min", label: "To complete tasks that take competitors 6 hours" },
  { value: "25%", label: "YoY SaaS ARR growth — one of the fastest-growing vendors" },
  { value: "12×", label: "Consecutive years with a 5-star CRN Partner Program rating" },
];

const verticals = [
  { icon: <Building2 className="w-5 h-5" />, name: "Enterprise & Corporate" },
  { icon: <GraduationCap className="w-5 h-5" />, name: "Education" },
  { icon: <HeartPulse className="w-5 h-5" />, name: "Healthcare" },
  { icon: <Hotel className="w-5 h-5" />, name: "Hospitality" },
  { icon: <Factory className="w-5 h-5" />, name: "Manufacturing" },
  { icon: <TrendingUp className="w-5 h-5" />, name: "Sports & Entertainment" },
];

export default function ExtremeNetworks() {
  return (
    <div className="min-h-screen bg-background">

      {/* Hero */}
      <div className="relative pt-24 pb-0 overflow-hidden" style={{ background: `linear-gradient(135deg, #3B0764 0%, ${EXTREME_PURPLE} 50%, #1E1B4B 100%)` }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute right-0 top-0 w-[700px] h-[700px] rounded-full blur-[120px]" style={{ background: "rgba(167,139,250,0.15)" }} />
          <div className="absolute left-0 bottom-0 w-[500px] h-[500px] rounded-full blur-[100px]" style={{ background: "rgba(0,0,0,0.3)" }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center pb-24">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 border border-white/20 text-white text-sm font-semibold mb-8">
              <Zap className="w-4 h-4 text-violet-300" />
              Extreme Partner First™ Member
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-extrabold text-white mb-6 tracking-tight leading-tight">
              AI-Powered Networking<br />
              <span className="text-violet-300">Built for the Future</span>
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto font-medium mb-10">
              Siebert Services delivers, deploys, and manages the full Extreme Networks portfolio — giving your business enterprise-grade connectivity without enterprise-grade complexity.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/quote">
                <Button className="h-12 px-8 text-base bg-white hover:bg-violet-50" style={{ color: EXTREME_PURPLE }}>
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
                  <div className="text-3xl font-display font-extrabold text-violet-300 mb-1">{s.value}</div>
                  <div className="text-xs text-white/60 leading-snug">{s.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Why Siebert for Extreme */}
      <section className="py-24 bg-gray-50 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-6" style={{ background: EXTREME_LIGHT, color: EXTREME_PURPLE }}>
                <Layers className="w-4 h-4" /> Why Siebert Services?
              </div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-navy mb-6">
                Your Extreme Networks solution — fully managed, end to end.
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Extreme's platform is powerful. We make it effortless. As an Extreme Partner First member, Siebert Services handles procurement, deployment, licensing, and ongoing management so you never have to touch a command line.
              </p>
              <ul className="space-y-6">
                {whyUs.map((item, i) => (
                  <li key={i} className="flex gap-4">
                    <div className="mt-1 rounded-full p-1 shrink-0" style={{ background: EXTREME_LIGHT }}>
                      <Check className="w-5 h-5" style={{ color: EXTREME_PURPLE }} />
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
              <h3 className="text-2xl font-display font-bold text-navy mb-2">Extreme Platform ONE™</h3>
              <p className="text-muted-foreground text-sm mb-6">The only networking platform with conversational, multimodal, and agentic AI built in — not bolted on.</p>
              <div className="space-y-3 mb-8">
                {[
                  ["Wired Switching", "Infrastructure"],
                  ["Wi-Fi 7 Wireless", "Wireless"],
                  ["ExtremeCloud IQ", "Cloud Mgmt"],
                  ["Universal ZTNA", "Security"],
                  ["ExtremeCloud SD-WAN", "Branch"],
                  ["AI & AIOps", "Included"],
                ].map(([name, tag]) => {
                  const tagColors: Record<string, string> = {
                    Infrastructure: "bg-slate-100 text-slate-700",
                    Wireless: "bg-blue-100 text-blue-700",
                    "Cloud Mgmt": "bg-violet-100 text-violet-700",
                    Security: "bg-red-100 text-red-700",
                    Branch: "bg-orange-100 text-orange-700",
                    Included: "bg-green-100 text-green-700",
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
                <Button className="w-full h-11 text-base" style={{ background: EXTREME_PURPLE }}>
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
            <h2 className="text-4xl font-display font-bold text-navy mb-4">The Full Extreme Networks Portfolio</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              One unified platform — AI, security, wired, wireless, and cloud management — all delivered and managed by Siebert Services.
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
                <Card className="h-full border-border/60 hover:shadow-lg transition-all hover:border-violet-300 group">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-5">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: EXTREME_LIGHT, color: EXTREME_PURPLE }}>
                        {prod.icon}
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: EXTREME_LIGHT, color: EXTREME_PURPLE }}>
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
            <p className="text-muted-foreground">From NFL stadiums to university campuses and hospital systems — Extreme Networks powers critical infrastructure worldwide.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {verticals.map((v, i) => (
              <div key={i} className="flex items-center gap-2 px-5 py-3 rounded-full border border-border bg-white shadow-sm font-medium text-navy text-sm">
                <span style={{ color: EXTREME_PURPLE }}>{v.icon}</span>
                {v.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24" style={{ background: `linear-gradient(135deg, #3B0764 0%, ${EXTREME_PURPLE} 100%)` }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl font-display font-extrabold text-white mb-4">
              Ready to modernize your network?
            </h2>
            <p className="text-white/70 text-lg mb-10 max-w-2xl mx-auto">
              Let Siebert Services design, deploy, and manage an Extreme Networks infrastructure tailored to your business — with AI-driven automation and zero-touch security built in from day one.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/quote">
                <Button className="h-12 px-8 text-base bg-white hover:bg-violet-50" style={{ color: EXTREME_PURPLE }}>
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
