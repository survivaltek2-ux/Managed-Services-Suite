import { Link } from "wouter";
import { motion } from "framer-motion";
import { Shield, Cloud, Server, Headphones, Video, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button, Card, CardContent } from "@/components/ui";

export default function Home() {
  const features = [
    { icon: <Headphones className="w-6 h-6"/>, title: "24/7 IT Support", desc: "Round-the-clock monitoring and helpdesk for your team." },
    { icon: <Cloud className="w-6 h-6"/>, title: "Cloud Services", desc: "Microsoft 365, AWS, and Azure migrations and management." },
    { icon: <Shield className="w-6 h-6"/>, title: "Cybersecurity", desc: "Enterprise-grade protection against modern digital threats." },
    { icon: <Server className="w-6 h-6"/>, title: "Infrastructure", desc: "Robust networking, firewall, and server deployments." }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-navy">
        {/* Background Image */}
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
                Premier Technology Partner
              </div>
              <h1 className="text-5xl lg:text-7xl font-display font-extrabold text-white leading-[1.1] mb-6 tracking-tight">
                Technology Solutions. <br/>
                <span className="text-gradient">Delivered Simply.</span>
              </h1>
              <p className="text-xl text-white/80 leading-relaxed mb-10 max-w-2xl">
                Siebert Services is your dedicated MSP, providing enterprise-grade IT support, cybersecurity, cloud architecture, and unified communications for modern businesses.
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
            <h2 className="text-3xl md:text-4xl font-display font-bold text-navy mb-4">Comprehensive IT Solutions</h2>
            <p className="text-lg text-muted-foreground">We handle the complex technology so you can focus on growing your business. From helpdesk to infrastructure, we've got you covered.</p>
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

      {/* ZOOM PARTNER HIGHLIGHT */}
      <section className="py-24 bg-navy relative overflow-hidden">
        {/* Background visual */}
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
                As a fully certified Zoom Partner, Siebert Services provides the complete suite of Zoom products with local, white-glove support. Move beyond simple meetings to unified communications.
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
               {/* Decorative floating elements for tech feel */}
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

      {/* CTA SECTION */}
      <section className="py-24 bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-display font-bold text-navy mb-6">Ready to upgrade your IT?</h2>
          <p className="text-xl text-muted-foreground mb-10">
            Let's discuss how Siebert Services can streamline your technology, secure your data, and empower your workforce.
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
