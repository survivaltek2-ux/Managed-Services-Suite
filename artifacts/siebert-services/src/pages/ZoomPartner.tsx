import { motion } from "framer-motion";
import { usePageContent } from "@/hooks/usePageContent";
import { Video, Phone, MonitorPlay, CalendarDays, Headset, Sparkles, TrendingUp, MessageSquare, Check } from "lucide-react";
import { Card, CardContent, Button } from "@/components/ui";
import { Link } from "wouter";
import { BookingInline } from "@/components/Booking";

export default function ZoomPartner() {
  const content = usePageContent("zoom-partner", {
    heroBadge: "Official Certified Partner",
    heroTitle: "Powering Modern Communication",
    heroDescription: "Siebert Services is your dedicated partner for deploying, managing, and supporting the entire Zoom ecosystem.",
  });
  const products = [
    { icon: <Video className="w-8 h-8"/>, title: "Zoom Meetings", desc: "Enterprise-grade video conferencing with flawless quality for teams of all sizes." },
    { icon: <Phone className="w-8 h-8"/>, title: "Zoom Phone", desc: "A modern cloud-based phone system replacing outdated, expensive PBX hardware." },
    { icon: <MonitorPlay className="w-8 h-8"/>, title: "Zoom Rooms", desc: "Turn any conference room or huddle space into a one-touch video collaboration hub." },
    { icon: <CalendarDays className="w-8 h-8"/>, title: "Zoom Events & Webinars", desc: "Host engaging virtual events, town halls, and massive scalable webinars." },
    { icon: <Headset className="w-8 h-8"/>, title: "Zoom Contact Center", desc: "Omnichannel customer engagement platform built for the video-first era." },
    { icon: <Sparkles className="w-8 h-8"/>, title: "AI Companion", desc: "Smart AI meeting summaries, automatic notes, action items, and conversational Q&A." },
    { icon: <TrendingUp className="w-8 h-8"/>, title: "Revenue Accelerator", desc: "Conversation intelligence that helps sales teams close more deals faster." },
    { icon: <MessageSquare className="w-8 h-8"/>, title: "Zoom Team Chat", desc: "Persistent, secure messaging platform seamlessly integrated with your meetings." },
  ];

  return (
    <div className="min-h-screen pt-24 pb-20 bg-background">
      {/* Header */}
      <div className="relative py-24 bg-[#0B5CFF] overflow-hidden">
        <div className="absolute inset-0 z-0">
          {/* Zoom specific abstract pattern */}
          <div className="absolute right-0 top-0 w-[800px] h-[800px] bg-white/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="absolute left-0 bottom-0 w-[600px] h-[600px] bg-black/20 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3 pointer-events-none" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white text-[#0B5CFF] font-bold text-sm mb-8 shadow-lg">
              <Sparkles className="w-4 h-4" /> {content.heroBadge}
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-extrabold text-white mb-6 tracking-tight">
              {content.heroTitle}
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto font-medium">
              {content.heroDescription}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Why buy from us */}
      <section className="py-20 bg-gray-50 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-display font-bold text-navy mb-6">Why partner with Siebert for Zoom?</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Don't just buy licenses. Buy a complete, supported solution. When you procure Zoom through Siebert Services, you gain an IT partner invested in your communication success.
              </p>
              <ul className="space-y-6">
                {[
                  { title: "White-Glove Onboarding", desc: "We handle the entire migration from legacy systems (like old PBX) directly to Zoom." },
                  { title: "Bundled IT Support", desc: "Zoom issues? Call us. We provide dedicated, local support for all your communication needs." },
                  { title: "Simplified Billing", desc: "Consolidate your IT services and software licensing into one predictable monthly invoice." },
                  { title: "Hardware Procurement", desc: "We supply, configure, and install the physical hardware required for Zoom Rooms." }
                ].map((item, i) => (
                  <li key={i} className="flex gap-4">
                    <div className="mt-1 bg-blue-100 p-1 rounded-full text-[#0B5CFF] shrink-0">
                      <Check className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-navy text-lg">{item.title}</h4>
                      <p className="text-muted-foreground">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-border">
              <h3 className="text-2xl font-bold text-navy mb-6 font-display">The Complete Platform</h3>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-gray-50 border border-border flex justify-between items-center">
                  <span className="font-semibold">Zoom Meetings + Chat</span>
                  <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">Core</span>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 border border-border flex justify-between items-center">
                  <span className="font-semibold">Zoom Phone</span>
                  <span className="text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded">Add-on</span>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 border border-border flex justify-between items-center">
                  <span className="font-semibold">Zoom Rooms</span>
                  <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded">Hardware</span>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 border border-border flex justify-between items-center">
                  <span className="font-semibold">AI Companion</span>
                  <span className="text-sm bg-[#0B5CFF] text-white px-2 py-1 rounded shadow-sm flex gap-1 items-center"><Sparkles className="w-3 h-3"/> Included</span>
                </div>
              </div>
              <Link href="/quote">
                <Button className="w-full mt-8 h-12 text-base bg-[#0B5CFF] hover:bg-blue-600">Get a Custom Zoom Quote</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold text-navy mb-4">Discover the Zoom Suite</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">One unified platform for all your communication and collaboration needs.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((prod, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: idx * 0.05 }}>
                <Card className="h-full border-border/60 hover:border-[#0B5CFF]/50 hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center text-[#0B5CFF] mb-6">
                      {prod.icon}
                    </div>
                    <h3 className="text-xl font-bold text-navy mb-2">{prod.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{prod.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Reseller CTA */}
      <section className="py-20 bg-[#0B5CFF]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="flex flex-col md:flex-row gap-10 items-center justify-between text-left">
              <div className="flex-1">
                <p className="text-white/60 text-sm font-bold uppercase tracking-widest mb-3">Certified Zoom Partner</p>
                <h2 className="text-3xl font-display font-bold text-white mb-3">Get Zoom deployed and supported by your hybrid MSP.</h2>
                <p className="text-white/70 leading-relaxed">
                  Siebert handles licensing, deployment, migration, and ongoing management of Zoom products — bundled with our managed IT services for a complete communications solution.
                </p>
              </div>
              <div className="flex flex-col gap-3 shrink-0">
                <Link href="/quote">
                  <Button className="h-12 px-8 bg-white text-[#0B5CFF] hover:bg-blue-50 font-bold">
                    Get a Zoom Quote
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline" className="h-12 px-8 border-white/30 text-white hover:bg-white/10">
                    Contact Us
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-background border-t border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-display font-bold text-navy mb-3">Schedule your Zoom consultation</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Choose a time below and we’ll walk you through the next steps for licensing, deployment, or migration.
            </p>
          </div>
          <BookingInline height={680} />
        </div>
      </section>
    </div>
  );
}
