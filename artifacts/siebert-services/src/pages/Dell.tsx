import { motion } from "framer-motion";
import {
  Server, HardDrive, Cloud, Monitor, Shield, Headphones,
  Check, TrendingUp, Zap, Building2, GraduationCap,
  HeartPulse, Factory, Briefcase, Layers, ArrowRight
} from "lucide-react";
import { Card, CardContent, Button } from "@/components/ui";
import { Link } from "wouter";

const DELL_BLUE = "#007DB8";
const DELL_LIGHT = "#E6F3FA";

const products = [
  {
    icon: <Server className="w-7 h-7" />,
    title: "PowerEdge Servers",
    badge: "Compute",
    desc: "Dell's 16th-generation PowerEdge rack, tower, and modular servers feature the OpenManage Enterprise management suite, iDRAC9 remote access, and Cyber Resilient Architecture with BIOS verification and secure boot.",
  },
  {
    icon: <HardDrive className="w-7 h-7" />,
    title: "PowerStore & PowerFlex",
    badge: "Storage",
    desc: "Unified all-flash and software-defined storage built for modern workloads. PowerStore's AppsON technology lets you run applications directly on the array — reducing infrastructure footprint while increasing performance.",
  },
  {
    icon: <Cloud className="w-7 h-7" />,
    title: "Dell APEX Cloud",
    badge: "Cloud Services",
    desc: "Dell APEX delivers a consistent cloud experience across public cloud, on-premises, and edge locations. Consumption-based billing, unified management, and no capital commitment — infrastructure as a service from Dell.",
  },
  {
    icon: <Monitor className="w-7 h-7" />,
    title: "Latitude & Precision Endpoints",
    badge: "Endpoints",
    desc: "Business-class laptops, desktops, and mobile workstations engineered for durability and security. Dell Trusted Device, SafeBIOS, and SafeData provide layers of hardware and software endpoint protection.",
  },
  {
    icon: <Shield className="w-7 h-7" />,
    title: "Dell SafeGuard & Response",
    badge: "Cybersecurity",
    desc: "A comprehensive suite combining endpoint detection and response, data security, and identity threat detection. Powered by CrowdStrike and Secureworks integrations within the Dell Managed Detection and Response service.",
  },
  {
    icon: <Headphones className="w-7 h-7" />,
    title: "ProSupport Plus",
    badge: "Support",
    desc: "Dell's premium support tier with predictive issue resolution, SupportAssist technology, and 24×7 access to advanced engineers. ProSupport Plus reduces unplanned downtime with proactive health monitoring and auto-dispatch.",
  },
];

const whyUs = [
  {
    title: "Dell Partner Program Member",
    desc: "Siebert Services participates in the Dell Technologies Partner Program, giving us access to deal registration, competitive pricing, and partner-exclusive configuration options you won't find at retail.",
  },
  {
    title: "PowerEdge Deployment Expertise",
    desc: "From rack-and-stack to BIOS hardening and iDRAC configuration, our engineers have hands-on experience deploying PowerEdge infrastructure in regulated and mission-critical environments.",
  },
  {
    title: "APEX Migration Planning",
    desc: "Moving to a consumption model? We assess your current environment, right-size the APEX subscription, and manage the migration — delivering cloud economics without sacrificing on-prem control.",
  },
  {
    title: "Lifecycle & Asset Management",
    desc: "We track every Dell asset across its full lifecycle — from procurement and deployment to ProSupport enrollment and certified data-destruction at end of life.",
  },
];

const stats = [
  { value: "#1", label: "Server vendor by worldwide shipments" },
  { value: "40%", label: "Storage performance gain with PowerStore NVMe" },
  { value: "8,000+", label: "Patents held by Dell Technologies" },
  { value: "Gold", label: "Dell Technologies Partner Program tier" },
];

const verticals = [
  { icon: <Building2 className="w-5 h-5" />, name: "Enterprise & Corporate" },
  { icon: <GraduationCap className="w-5 h-5" />, name: "Education" },
  { icon: <HeartPulse className="w-5 h-5" />, name: "Healthcare" },
  { icon: <Factory className="w-5 h-5" />, name: "Manufacturing" },
  { icon: <Briefcase className="w-5 h-5" />, name: "Professional Services" },
  { icon: <TrendingUp className="w-5 h-5" />, name: "Financial Services" },
];

export default function Dell() {
  return (
    <div className="min-h-screen bg-background">

      {/* Hero */}
      <div className="relative pt-24 pb-0 overflow-hidden" style={{ background: `linear-gradient(135deg, #004A70 0%, ${DELL_BLUE} 55%, #003050 100%)` }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute right-0 top-0 w-[700px] h-[700px] rounded-full blur-[120px]" style={{ background: "rgba(0,125,184,0.2)" }} />
          <div className="absolute left-0 bottom-0 w-[500px] h-[500px] rounded-full blur-[100px]" style={{ background: "rgba(0,0,0,0.25)" }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center pb-24">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 border border-white/20 text-white text-sm font-semibold mb-8">
              <Zap className="w-4 h-4 text-cyan-300" />
              Dell Technologies Partner
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-extrabold text-white mb-6 tracking-tight leading-tight">
              Dell Technologies<br />
              <span className="text-cyan-300">Managed Your Way</span>
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto font-medium mb-10">
              Siebert Services sources, deploys, and manages the complete Dell Technologies portfolio — servers, storage, cloud, and endpoints — backed by partner-level expertise and pricing.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/quote">
                <Button className="h-12 px-8 text-base bg-white hover:bg-cyan-50" style={{ color: DELL_BLUE }}>
                  Get an Infrastructure Assessment
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
                  <div className="text-3xl font-display font-extrabold text-cyan-300 mb-1">{s.value}</div>
                  <div className="text-xs text-white/60 leading-snug">{s.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Why Siebert for Dell */}
      <section className="py-24 bg-gray-50 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-6" style={{ background: DELL_LIGHT, color: DELL_BLUE }}>
                <Layers className="w-4 h-4" /> Why Siebert Services?
              </div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-navy mb-6">
                Your Dell solution — fully managed, end to end.
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Dell's breadth of portfolio is unmatched. We narrow the field to exactly what your business needs and manage it throughout its life. As a Dell Technologies partner, Siebert brings certified expertise and purchasing leverage to every engagement.
              </p>
              <ul className="space-y-6">
                {whyUs.map((item, i) => (
                  <li key={i} className="flex gap-4">
                    <div className="mt-1 rounded-full p-1 shrink-0" style={{ background: DELL_LIGHT }}>
                      <Check className="w-5 h-5" style={{ color: DELL_BLUE }} />
                    </div>
                    <div>
                      <h4 className="font-bold text-navy text-lg">{item.title}</h4>
                      <p className="text-muted-foreground">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Portfolio card */}
            <div className="bg-white rounded-3xl shadow-xl border border-border p-8">
              <h3 className="text-2xl font-display font-bold text-navy mb-2">Dell Technologies Portfolio</h3>
              <p className="text-muted-foreground text-sm mb-6">From PowerEdge to APEX — one partner for the complete Dell ecosystem.</p>
              <div className="space-y-3 mb-8">
                {[
                  ["PowerEdge Servers", "Compute"],
                  ["PowerStore / PowerFlex", "Storage"],
                  ["Dell APEX Cloud", "Cloud"],
                  ["Latitude & Precision", "Endpoints"],
                  ["SafeGuard & Response", "Security"],
                  ["ProSupport Plus", "Support"],
                ].map(([name, tag]) => {
                  const tagColors: Record<string, string> = {
                    Compute: "bg-slate-100 text-slate-700",
                    Storage: "bg-purple-100 text-purple-700",
                    Cloud: "bg-cyan-100 text-cyan-700",
                    Endpoints: "bg-blue-100 text-blue-700",
                    Security: "bg-red-100 text-red-700",
                    Support: "bg-green-100 text-green-700",
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
                <Button className="w-full h-11 text-base text-white" style={{ background: DELL_BLUE }}>
                  Request a Proposal <ArrowRight className="w-4 h-4 ml-2" />
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
            <h2 className="text-4xl font-display font-bold text-navy mb-4">The Full Dell Technologies Portfolio</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Compute, storage, cloud, endpoints, and security — all sourced, deployed, and supported by Siebert Services.
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
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: DELL_LIGHT, color: DELL_BLUE }}>
                        {prod.icon}
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: DELL_LIGHT, color: DELL_BLUE }}>
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
            <p className="text-muted-foreground">Dell Technologies powers global infrastructure — from financial data centers to hospital networks and university campuses.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {verticals.map((v, i) => (
              <div key={i} className="flex items-center gap-2 px-5 py-3 rounded-full border border-border bg-white shadow-sm font-medium text-navy text-sm">
                <span style={{ color: DELL_BLUE }}>{v.icon}</span>
                {v.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24" style={{ background: `linear-gradient(135deg, #004A70 0%, ${DELL_BLUE} 100%)` }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl font-display font-extrabold text-white mb-4">
              Ready to modernize your Dell infrastructure?
            </h2>
            <p className="text-white/70 text-lg mb-10 max-w-2xl mx-auto">
              Let Siebert Services design, procure, and manage a Dell Technologies environment tailored to your business — with enterprise-grade security and full lifecycle support included.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/quote">
                <Button className="h-12 px-8 text-base bg-white hover:bg-cyan-50" style={{ color: DELL_BLUE }}>
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
