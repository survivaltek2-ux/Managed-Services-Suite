import { Link } from "wouter";
import { motion } from "framer-motion";
import { Shield, Cloud, Server, Headphones, Video, ArrowRight, CheckCircle2, Wifi } from "lucide-react";
import { Button, Card, CardContent } from "@/components/ui";
import { SchemaTag } from "@/components/SchemaTag";
import { BookingButton } from "@/components/Booking";

export default function Home() {
  const features = [
    { icon: <Headphones className="w-6 h-6"/>, title: "Managed IT & Helpdesk", desc: "24/7 monitoring, proactive maintenance, and tiered support plans with guaranteed SLAs." },
    { icon: <Cloud className="w-6 h-6"/>, title: "Cloud Services", desc: "Microsoft 365, AWS, and Azure migrations and ongoing management — fully managed or co-managed." },
    { icon: <Shield className="w-6 h-6"/>, title: "Cybersecurity", desc: "Enterprise-grade endpoint protection, compliance management, and threat detection." },
    { icon: <Server className="w-6 h-6"/>, title: "Infrastructure", desc: "Networking, firewalls, and server deployments from certified vendor partners." }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <SchemaTag id="schema-localbusiness" type="LocalBusiness" />
      <SchemaTag id="schema-webpage-home" type="WebPage" name="Siebert Services — Hudson Valley Managed IT & Technology Reseller" description="Managed IT services, cybersecurity, cloud, and authorized vendor reselling for Hudson Valley businesses. 24/7 support and rapid response." />
      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-navy">
        <div className="absolute inset-0 z-0">
          <img 
            src={`${import.meta.env.BASE_URL}images/hero-bg.png`} 
            alt="Hero abstract technology background" 
            className="w-full h-full object-cover opacity-30 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/80 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-sm mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Hybrid MSP & Technology Reseller
              </div>
              <h1 className="text-5xl lg:text-7xl font-display font-extrabold text-white leading-[1.1] mb-6 tracking-tight">
                Technology Solutions. <br/>
                <span className="text-gradient">Delivered Simply.</span>
              </h1>
              <p className="text-xl text-white/80 leading-relaxed mb-10 max-w-2xl">
                Siebert Services is a hybrid MSP — combining our own managed IT services with authorized reselling of enterprise products from our authorized vendor partners. One partner for procurement, deployment, management, and support.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/quote">
                  <Button size="lg" className="w-full sm:w-auto gap-2">
                    Get a Custom Quote <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/services">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto bg-transparent border-white/20 text-white hover:bg-white/10 hover:border-white hover:text-white">
                    Explore Services
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CORE SERVICES GRID */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-navy mb-4">Hybrid MSP Services</h2>
            <p className="text-lg text-muted-foreground">We pair our own managed IT services with the best products from our vendor partners — so you get a complete technology solution without the complexity. Every service backed by SLAs and 24/7 support.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="h-full border-none shadow-lg hover:shadow-xl transition-shadow bg-white hover:-translate-y-1 duration-300">
                  <CardContent className="p-8">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold text-navy mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link href="/services">
              <Button variant="link" className="text-lg">View all services <ArrowRight className="w-4 h-4 ml-2" /></Button>
            </Link>
          </div>
        </div>
      </section>

      {/* INTERNET PLANS FINDER */}
      <section className="py-24 bg-gradient-to-r from-[#032d60] to-[#0176d3] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex justify-center mb-6">
              <Wifi className="w-16 h-16 text-white/80" />
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Find Internet Providers in Your Area</h2>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Search available ISPs and plans at your address. Compare speeds, technologies, and pricing from multiple providers.
            </p>
            <Link href="/internet-plans">
              <Button 
                size="lg" 
                className="bg-white text-[#0176d3] hover:bg-white/90 h-14 px-10 text-lg font-semibold"
              >
                Search Internet Plans <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <p className="text-sm text-white/70 mt-4">💡 Tip: Use our referral link to get a $50 bill credit on Optimum residential internet service</p>
          </motion.div>
        </div>
      </section>

      {/* VENDOR PARTNERS */}
      <section className="py-20 bg-primary/5 border-y border-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-navy mb-4">Our Vendor Partners</h2>
            <p className="text-lg text-muted-foreground">
              As a hybrid MSP, we pair our managed services with products from our authorized vendor partners. Partner-level pricing, priority support, and expert deployment — all included.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {[
              { name: "Comcast Business", href: "/comcast-business", desc: "ISP Partner" },
              { name: "Spectrum Business", href: "/spectrum-business", desc: "ISP Partner" },
              { name: "AT&T Business", href: "/att-business", desc: "ISP Partner" },
              { name: "Verizon Business", href: "/verizon-business", desc: "Fiber + 5G" },
              { name: "Cox Business", href: "/cox-business", desc: "ISP Partner" },
              { name: "Altice / Optimum", href: "/altice", desc: "ISP Partner" },
              { name: "Lumen Technologies", href: "/lumen", desc: "Enterprise Fiber" },
              { name: "T-Mobile Business", href: "/t-mobile-business", desc: "5G Network" },
              { name: "Zoom", href: "/zoom", desc: "Certified Partner" },
              { name: "RingCentral", href: "/ringcentral", desc: "UCaaS Partner" },
              { name: "Microsoft 365", href: "/microsoft-365", desc: "CSP Partner" },
              { name: "8x8", href: "/8x8", desc: "UCaaS + CCaaS" },
              { name: "Cisco / Meraki", href: "/cisco-meraki", desc: "Gold Partner" },
              { name: "Fortinet", href: "/fortinet", desc: "NGFW Partner" },
              { name: "Palo Alto Networks", href: "/palo-alto-networks", desc: "Security Partner" },
              { name: "Extreme Networks", href: "/extreme-networks", desc: "Partner First" },
              { name: "Juniper Networks", href: "/juniper-networks", desc: "Partner Advantage" },
              { name: "HP", href: "/hp", desc: "Amplify Partner" },
              { name: "Dell", href: "/dell", desc: "Partner Program" },
              { name: "Vivint", href: "/vivint", desc: "Smart Home Partner" },
              { name: "ADT Business", href: "/adt-business", desc: "Security Partner" },
            ].map((vendor, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Link href={vendor.href}>
                  <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-border hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                    <h3 className="font-bold text-navy text-lg mb-1">{vendor.name}</h3>
                    <p className="text-xs text-primary font-semibold">{vendor.desc}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ZOOM PARTNER HIGHLIGHT */}
      <section className="py-24 bg-navy relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={`${import.meta.env.BASE_URL}images/zoom-bg.png`} 
            alt="Zoom abstract tech" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/90 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 text-blue-400 font-bold text-sm mb-6 border border-blue-500/30">
                <Video className="w-4 h-4" /> Certified Zoom Partner
              </div>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
                Elevate your team's communication.
              </h2>
              <p className="text-lg text-white/70 mb-8 leading-relaxed">
                As a certified Zoom Partner, Siebert Services sells, deploys, and supports the complete Zoom suite — bundled with our managed IT services for a seamless, fully supported communications solution.
              </p>
              
              <ul className="space-y-4 mb-10">
                {[
                  "Zoom Meetings & Team Chat",
                  "Zoom Phone (Cloud PBX replacement)",
                  "Zoom Rooms Hardware Setup",
                  "AI Companion Integration"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-white/90 font-medium">
                    <CheckCircle2 className="w-6 h-6 text-blue-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <Link href="/zoom">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 gap-2">
                  Explore Zoom Solutions <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative hidden lg:block"
            >
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-blue-500/20 rounded-full blur-[100px] -z-10" />
               <div className="relative glass-dark rounded-3xl p-8 border border-white/10 shadow-2xl">
                 <div className="flex items-center gap-4 mb-6 border-b border-white/10 pb-6">
                   <div className="w-16 h-16 rounded-2xl bg-blue-500 flex items-center justify-center">
                     <Video className="w-8 h-8 text-white" />
                   </div>
                   <div>
                     <div className="text-2xl font-bold text-white font-display">Zoom</div>
                     <div className="text-blue-400 font-medium">Full Suite Deployment</div>
                   </div>
                 </div>
                 <div className="space-y-4">
                   <div className="h-4 w-3/4 bg-white/10 rounded-full" />
                   <div className="h-4 w-full bg-white/10 rounded-full" />
                   <div className="h-4 w-5/6 bg-white/10 rounded-full" />
                 </div>
               </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* WHY BUY FROM A RESELLER */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-navy mb-6">
                Why work with a hybrid MSP?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                With Siebert, you don't just get products — you get a complete solution. We combine vendor procurement with our own managed services, so every purchase comes with expert deployment, ongoing management, and SLA-backed support.
              </p>
              <ul className="space-y-5">
                {[
                  { title: "Partner-Level Pricing", desc: "Our vendor partnerships give us access to pricing, promotions, and deal registration that you can't get buying direct." },
                  { title: "Bundled Managed Services", desc: "Pair any hardware or software purchase with our managed IT plans — one invoice, one support number, one partner." },
                  { title: "Expert Deployment & Migration", desc: "We don't just ship boxes. We design, configure, deploy, and migrate — with certified engineers on your project." },
                  { title: "Ongoing Support & SLAs", desc: "After deployment, we manage and support your technology with guaranteed SLAs and 24/7 helpdesk access." }
                ].map((item, i) => (
                  <li key={i} className="flex gap-4">
                    <CheckCircle2 className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-navy">{item.title}</span>
                      <p className="text-muted-foreground text-sm">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-navy rounded-3xl p-8 text-white shadow-xl">
              <h3 className="text-xl font-bold mb-6 font-display">The Hybrid MSP Advantage</h3>
              <div className="space-y-4">
                {[
                  { label: "Procurement", desc: "We source hardware and software at partner pricing from HP, Dell, Zoom, and more." },
                  { label: "Deployment", desc: "Certified engineers handle design, configuration, and installation." },
                  { label: "Management", desc: "Ongoing monitoring, patching, and support with tiered SLA plans." },
                  { label: "Lifecycle", desc: "From first boot to secure decommission — we manage the full lifecycle." }
                ].map((t, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-white">{t.label}</p>
                      <p className="text-white/60 text-sm">{t.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-24 bg-primary/5 border-t border-primary/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-display font-bold text-navy mb-6">Ready to upgrade your IT?</h2>
          <p className="text-xl text-muted-foreground mb-10">
            Let's discuss how Siebert Services can source, deploy, and manage the right technology for your business — at partner pricing with expert support.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/quote">
              <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg">Request a Quote</Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 text-lg">Contact Us</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
