import { motion } from "framer-motion";
import {
  Server, Monitor, Printer, Cloud, Shield, Wifi,
  Check, TrendingUp, Zap, Building2, GraduationCap,
  HeartPulse, Factory, Briefcase, Layers, ArrowRight
} from "lucide-react";
import { Card, CardContent, Button } from "@/components/ui";
import { Link } from "wouter";

const HP_BLUE = "#0096D6";
const HP_LIGHT = "#E6F4FB";

const products = [
  {
    icon: <Server className="w-7 h-7" />,
    title: "HPE ProLiant Servers",
    badge: "Compute",
    desc: "From the ProLiant DL Gen11 rack servers to HPE Synergy composable infrastructure, ProLiant delivers enterprise performance with Silicon Root of Trust security and iLO 6 management built in.",
  },
  {
    icon: <Cloud className="w-7 h-7" />,
    title: "HPE GreenLake Cloud",
    badge: "Cloud Services",
    desc: "A unified cloud platform that brings the cloud experience to your data center and edge. Pay per use, scale on demand, and manage everything from the HPE GreenLake Central console.",
  },
  {
    icon: <Monitor className="w-7 h-7" />,
    title: "HP EliteBook & ZBook",
    badge: "Endpoints",
    desc: "Business-class laptops and mobile workstations built for security and performance. HP Sure Start, Sure Click, and Wolf Security provide layered endpoint protection for modern workforces.",
  },
  {
    icon: <Printer className="w-7 h-7" />,
    title: "HP+ & Instant Ink",
    badge: "Managed Print",
    desc: "Smart printing solutions with HP+ subscription services and Instant Ink automatic replenishment. Reduce print costs by up to 50% with usage-based billing and proactive cartridge delivery.",
  },
  {
    icon: <Shield className="w-7 h-7" />,
    title: "HP Wolf Security",
    badge: "Endpoint Security",
    desc: "The world's most secure PCs and printers. HP Wolf Security features hardware-enforced protection, self-healing BIOS, and threat containment that isolates attacks below the OS.",
  },
  {
    icon: <Wifi className="w-7 h-7" />,
    title: "HPE Aruba Networking",
    badge: "Networking",
    desc: "HPE Aruba's AI-powered networking portfolio — including Aruba Central cloud management, CX switching, and Aruba EdgeConnect SD-WAN — delivers secure, self-optimizing campus and branch connectivity with built-in Zero Trust and SASE enforcement.",
  },
  {
    icon: <Shield className="w-7 h-7" />,
    title: "HPE Care Pack Services",
    badge: "Support",
    desc: "Extend and enhance your HP hardware warranty with flexible Care Pack options — next business day on-site response, 24×7 phone support, proactive monitoring, and hardware replacement to minimize unplanned downtime.",
  },
];

const whyUs = [
  {
    title: "HP Amplify Partner",
    desc: "As a member of the HP Amplify partner program, Siebert Services has access to HP demo units, deal registration, and market development funds — savings we pass directly to you.",
  },
  {
    title: "Full Lifecycle Management",
    desc: "We handle procurement, imaging, deployment, and asset disposal. From first boot to secure decommission, Siebert manages every stage of your HP hardware lifecycle.",
  },
  {
    title: "Managed Print & Toner",
    desc: "Stop running out of toner. Our managed print service integrates HP Instant Ink with on-site support — monitoring usage, dispatching supplies, and handling repairs automatically.",
  },
  {
    title: "GreenLake Migration",
    desc: "Move your on-prem workloads to HPE GreenLake's consumption-based cloud. We design the architecture, migrate workloads, and manage the environment day to day.",
  },
];

const stats = [
  { value: "#1", label: "PC vendor worldwide by market share" },
  { value: "50%", label: "Typical cost reduction with HP Managed Print" },
  { value: "60B+", label: "Security threats blocked by HP Wolf Security annually" },
  { value: "5-Star", label: "CRN rating for the HP Amplify Partner Program" },
];

const verticals = [
  { icon: <Building2 className="w-5 h-5" />, name: "Enterprise & Corporate" },
  { icon: <GraduationCap className="w-5 h-5" />, name: "Education" },
  { icon: <HeartPulse className="w-5 h-5" />, name: "Healthcare" },
  { icon: <Factory className="w-5 h-5" />, name: "Manufacturing" },
  { icon: <Briefcase className="w-5 h-5" />, name: "Professional Services" },
  { icon: <TrendingUp className="w-5 h-5" />, name: "Financial Services" },
];

export default function HP() {
  return (
    <div className="min-h-screen bg-background">

      {/* Hero */}
      <div className="relative pt-24 pb-0 overflow-hidden" style={{ background: `linear-gradient(135deg, #004080 0%, ${HP_BLUE} 55%, #003060 100%)` }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute right-0 top-0 w-[700px] h-[700px] rounded-full blur-[120px]" style={{ background: "rgba(0,150,214,0.2)" }} />
          <div className="absolute left-0 bottom-0 w-[500px] h-[500px] rounded-full blur-[100px]" style={{ background: "rgba(0,0,0,0.25)" }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center pb-24">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 border border-white/20 text-white text-sm font-semibold mb-8">
              <Zap className="w-4 h-4 text-sky-300" />
              HP Amplify Partner
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-extrabold text-white mb-6 tracking-tight leading-tight">
              HP Solutions<br />
              <span className="text-sky-300">Delivered End to End</span>
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto font-medium mb-10">
              Siebert Services procures, deploys, and manages the full HP portfolio — servers, workstations, printers, and cloud — so your team can focus on what matters.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/quote">
                <Button className="h-12 px-8 text-base bg-white hover:bg-sky-50" style={{ color: HP_BLUE }}>
                  Get a Hardware Assessment
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
                  <div className="text-3xl font-display font-extrabold text-sky-300 mb-1">{s.value}</div>
                  <div className="text-xs text-white/60 leading-snug">{s.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Why Siebert for HP */}
      <section className="py-24 bg-gray-50 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-6" style={{ background: HP_LIGHT, color: HP_BLUE }}>
                <Layers className="w-4 h-4" /> Why Siebert Services?
              </div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-navy mb-6">
                Your HP solution — fully managed, end to end.
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                HP's portfolio is vast. We make choosing, deploying, and managing it simple. As an HP Amplify partner, Siebert Services combines procurement leverage with hands-on technical expertise — so you get the right hardware at the right price, configured and supported from day one.
              </p>
              <ul className="space-y-6">
                {whyUs.map((item, i) => (
                  <li key={i} className="flex gap-4">
                    <div className="mt-1 rounded-full p-1 shrink-0" style={{ background: HP_LIGHT }}>
                      <Check className="w-5 h-5" style={{ color: HP_BLUE }} />
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
              <h3 className="text-2xl font-display font-bold text-navy mb-2">HP Portfolio Overview</h3>
              <p className="text-muted-foreground text-sm mb-6">From endpoints to edge compute — one partner for the complete HP ecosystem.</p>
              <div className="space-y-3 mb-8">
                {[
                  ["HPE ProLiant Servers", "Compute"],
                  ["HPE GreenLake", "Cloud"],
                  ["HP EliteBook & ZBook", "Endpoints"],
                  ["HP DesignJet & LaserJet", "Print"],
                  ["HPE Aruba Networking", "Networking"],
                  ["HP Wolf Security", "Security"],
                  ["HPE Care Pack Services", "Support"],
                ].map(([name, tag]) => {
                  const tagColors: Record<string, string> = {
                    Compute: "bg-slate-100 text-slate-700",
                    Cloud: "bg-sky-100 text-sky-700",
                    Endpoints: "bg-blue-100 text-blue-700",
                    Print: "bg-orange-100 text-orange-700",
                    Networking: "bg-teal-100 text-teal-700",
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
                <Button className="w-full h-11 text-base text-white" style={{ background: HP_BLUE }}>
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
            <h2 className="text-4xl font-display font-bold text-navy mb-4">The Full HP Portfolio</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Servers, endpoints, print, cloud, and security — all procured, deployed, and supported by Siebert Services.
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
                <Card className="h-full border-border/60 hover:shadow-lg transition-all group">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-5">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: HP_LIGHT, color: HP_BLUE }}>
                        {prod.icon}
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: HP_LIGHT, color: HP_BLUE }}>
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
            <p className="text-muted-foreground">HP powers workforces in every sector — from hospitals to headquarters, Siebert ensures your HP environment runs flawlessly.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {verticals.map((v, i) => (
              <div key={i} className="flex items-center gap-2 px-5 py-3 rounded-full border border-border bg-white shadow-sm font-medium text-navy text-sm">
                <span style={{ color: HP_BLUE }}>{v.icon}</span>
                {v.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24" style={{ background: `linear-gradient(135deg, #004080 0%, ${HP_BLUE} 100%)` }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl font-display font-extrabold text-white mb-4">
              Ready to modernize your HP environment?
            </h2>
            <p className="text-white/70 text-lg mb-10 max-w-2xl mx-auto">
              Let Siebert Services design, procure, and manage an HP infrastructure tailored to your business — with enterprise-grade security and lifecycle support built in from day one.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/quote">
                <Button className="h-12 px-8 text-base bg-white hover:bg-sky-50" style={{ color: HP_BLUE }}>
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
