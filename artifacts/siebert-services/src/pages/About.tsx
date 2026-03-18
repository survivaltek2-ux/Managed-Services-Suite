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
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              We believe that IT shouldn't be a roadblock or a black box. It should be the engine that drives your growth. As a premier Managed Service Provider and reseller, we combine deep technical expertise with a commitment to human-centric support.
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

        {/* Values */}
        <div className="mt-32">
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
                <h3 className="text-xl font-bold text-navy mb-3">Human Connection</h3>
                <p className="text-muted-foreground">Technology is complex, but our communication isn't. We speak your language and act as true partners.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
