import { motion } from "framer-motion";
import { CheckCircle2, Shield, Zap, HeartHandshake } from "lucide-react";
import { Card, CardContent } from "@/components/ui";

export default function About() {
  return (
    <div className="min-h-screen pt-24 pb-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-5xl font-display font-extrabold text-navy mb-6">
              Empowering businesses through <span className="text-primary">technology.</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              Siebert Repair Services LLC (DBA Siebert Services) was founded with a singular mission: to demystify enterprise technology for businesses of all sizes. 
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              We believe that IT shouldn't be a roadblock or a black box. It should be the engine that drives your growth. As a hybrid MSP, we combine our own managed IT services with authorized reselling of enterprise products from our vendor partners — HP, Dell, Zoom, Extreme Networks, and Juniper — giving you partner-level pricing, expert deployment, and hands-on support from a single provider.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              Our hybrid MSP model is simple: we bring together the best products from our vendor partners with our own managed services — helpdesk, cybersecurity, cloud management, and more — so you get a complete IT solution from a single partner, backed by SLAs and 24/7 support.
            </p>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <h4 className="text-4xl font-display font-bold text-primary">10+</h4>
                <p className="font-semibold text-navy">Years Experience</p>
              </div>
              <div className="flex flex-col gap-2">
                <h4 className="text-4xl font-display font-bold text-primary">24/7</h4>
                <p className="font-semibold text-navy">Dedicated Support</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative h-[500px] rounded-3xl overflow-hidden shadow-2xl"
          >
            <img 
              src={`${import.meta.env.BASE_URL}images/about-team.png`} 
              alt="Siebert Services Team" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy/80 to-transparent flex items-end p-8">
              <p className="text-white font-bold text-xl">Building the future of IT infrastructure.</p>
            </div>
          </motion.div>
        </div>

        {/* What We Do */}
        <div className="mt-24 bg-navy rounded-3xl p-10 text-white shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-3xl font-display font-bold text-white mb-4">
                Hybrid MSP. One partner for everything.
              </h2>
              <p className="text-white/70 leading-relaxed mb-6">
                We don't just sell products — we build complete IT solutions. As a hybrid MSP, Siebert handles the full lifecycle: procurement from certified vendors, expert deployment, ongoing managed services, and SLA-backed support.
              </p>
            </div>
            <div className="space-y-4">
              {[
                { title: "Certified Vendor Reseller", desc: "Partner-level pricing and access to HP, Dell, Zoom, Extreme Networks, and Juniper products." },
                { title: "Managed Service Provider", desc: "24/7 helpdesk, proactive monitoring, patching, and SLA-backed support plans layered on top." },
                { title: "Full Lifecycle Management", desc: "Procurement, deployment, ongoing management, and secure decommission — the hybrid MSP advantage." }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-white">{item.title}</p>
                    <p className="text-white/60 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="mt-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-display font-bold text-navy">Our Core Values</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-navy text-white border-none shadow-xl">
              <CardContent className="p-8">
                <Shield className="w-10 h-10 text-primary mb-6" />
                <h3 className="text-xl font-bold mb-3">Uncompromising Security</h3>
                <p className="text-white/70">In an era of digital threats, we build fortresses. Security is baked into everything we do, not bolted on.</p>
              </CardContent>
            </Card>
            <Card className="bg-white border-none shadow-xl">
              <CardContent className="p-8">
                <Zap className="w-10 h-10 text-primary mb-6" />
                <h3 className="text-xl font-bold text-navy mb-3">Rapid Response</h3>
                <p className="text-muted-foreground">Downtime costs money. Our systems are built for resilience, and our team is built for speed.</p>
              </CardContent>
            </Card>
            <Card className="bg-white border-none shadow-xl">
              <CardContent className="p-8">
                <HeartHandshake className="w-10 h-10 text-primary mb-6" />
                <h3 className="text-xl font-bold text-navy mb-3">True Partnership</h3>
                <p className="text-muted-foreground">Technology is complex, but our communication isn't. We speak your language and act as true partners.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
