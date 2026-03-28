import { motion } from "framer-motion";
import { Server, Shield, Cloud, Headphones, Video, Database, Network, Laptop, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, Button } from "@/components/ui";
import { Link } from "wouter";

export default function Services() {
  const allServices = [
    {
      id: "helpdesk",
      icon: <Headphones className="w-8 h-8" />,
      title: "Managed IT & Helpdesk",
      description: "Fully managed or co-managed IT support with tiered SLA plans. 24/7 remote and on-site helpdesk, proactive monitoring, automated patch management, and endpoint management — billed as a predictable monthly per-seat rate."
    },
    {
      id: "cloud",
      icon: <Cloud className="w-8 h-8" />,
      title: "Cloud Services",
      description: "Managed migrations and ongoing operations for Microsoft 365, Google Workspace, Azure, and AWS. We handle licensing, deployment, and day-to-day management so your team can focus on the business."
    },
    {
      id: "cybersecurity",
      icon: <Shield className="w-8 h-8" />,
      title: "Cybersecurity & Compliance",
      description: "Endpoint protection, advanced threat detection, security awareness training, and compliance management for HIPAA, PCI, and SOC 2. Available as standalone managed security or bundled into a comprehensive IT plan."
    },
    {
      id: "networking",
      icon: <Network className="w-8 h-8" />,
      title: "Networking & Infrastructure",
      description: "Enterprise firewall configuration, SD-WAN, structured cabling, and WiFi deployments. As an authorized reseller for Extreme Networks, Juniper, and HP Aruba, we deliver partner-level pricing and expert deployment."
    },
    {
      id: "bdr",
      icon: <Database className="w-8 h-8" />,
      title: "Backup & Disaster Recovery",
      description: "Business continuity as a managed service. Immutable cloud backups, recovery testing, and rapid restore capabilities with guaranteed RTOs and tiered BDR plans."
    },
    {
      id: "voip",
      icon: <Video className="w-8 h-8" />,
      title: "VoIP & Telephony",
      description: "Cloud-based business phone systems — including Zoom Phone — that replace legacy PBX hardware with a predictable monthly per-seat model. We handle procurement, porting, and ongoing support."
    },
    {
      id: "hardware",
      icon: <Laptop className="w-8 h-8" />,
      title: "Hardware & Software Reselling",
      description: "As a certified reseller of HP, Dell, and more, we procure hardware at partner pricing and bundle it with our managed services. Software licensing for Microsoft, Adobe, and line-of-business applications — sourced, configured, and deployed by our team."
    },
    {
      id: "zoom",
      icon: <Video className="w-8 h-8 text-blue-500" />,
      title: "Zoom Partner Solutions",
      description: "Full suite reseller of Zoom Meetings, Phone, Rooms, Webinars, and Contact Center with bundled IT support and local account management. We deploy, manage, and support Zoom so you get the platform and the partner."
    }
  ];

  return (
    <div className="min-h-screen pt-24 pb-20 bg-gray-50">
      <div className="bg-navy py-20 px-4 sm:px-6 lg:px-8 text-center border-b-4 border-primary">
        <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-6">Our Services</h1>
        <p className="text-xl text-white/80 max-w-3xl mx-auto">
          Hybrid MSP services — from hardware procurement and cloud migrations to cybersecurity and 24/7 support. We pair vendor products with our own managed services, all backed by SLAs and delivered by certified engineers.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {allServices.map((srv, idx) => (
            <motion.div
              key={srv.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="h-full hover:shadow-2xl transition-all duration-300 border-none bg-white group">
                <CardHeader>
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform duration-300">
                    {srv.icon}
                  </div>
                  <CardTitle>{srv.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {srv.description}
                  </p>
                  {srv.id === 'zoom' ? (
                    <Link href="/zoom">
                      <Button variant="link" className="p-0 h-auto text-blue-600 font-bold">
                        Learn about our Zoom partnership <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/quote">
                      <Button variant="link" className="p-0 h-auto font-bold text-primary">
                        Request a quote <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
