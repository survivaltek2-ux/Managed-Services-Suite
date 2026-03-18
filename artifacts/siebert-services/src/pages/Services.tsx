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
      description: "24/7 remote and on-site IT support, proactive monitoring, and automated patch management. We act as your entire IT department."
    },
    {
      id: "cloud",
      icon: <Cloud className="w-8 h-8" />,
      title: "Cloud Services",
      description: "Seamless migrations and ongoing management for Microsoft 365, Google Workspace, Azure, and AWS environments."
    },
    {
      id: "cybersecurity",
      icon: <Shield className="w-8 h-8" />,
      title: "Cybersecurity & Compliance",
      description: "Endpoint protection, advanced threat detection, routine security audits, and strict compliance management (HIPAA, PCI)."
    },
    {
      id: "networking",
      icon: <Network className="w-8 h-8" />,
      title: "Networking & Infrastructure",
      description: "Enterprise firewall configuration, VPN setup, structured cabling, WiFi heatmapping, and server deployments."
    },
    {
      id: "bdr",
      icon: <Database className="w-8 h-8" />,
      title: "Backup & Disaster Recovery",
      description: "Comprehensive business continuity planning, immutable cloud backups, and rapid recovery strategies to prevent data loss."
    },
    {
      id: "voip",
      icon: <Video className="w-8 h-8" />,
      title: "VoIP & Telephony",
      description: "Modern business phone systems and hosted VoIP solutions that scale with your team, anywhere in the world."
    },
    {
      id: "hardware",
      icon: <Laptop className="w-8 h-8" />,
      title: "Hardware & Software Reselling",
      description: "Procurement of laptops, desktops, servers, peripherals, and software licensing at competitive partner rates."
    },
    {
      id: "zoom",
      icon: <Video className="w-8 h-8 text-blue-500" />,
      title: "Zoom Partner Solutions",
      description: "Full suite reseller of Zoom Meetings, Phone, Rooms, and Contact Center with bundled IT support and local account management."
    }
  ];

  return (
    <div className="min-h-screen pt-24 pb-20 bg-gray-50">
      <div className="bg-navy py-20 px-4 sm:px-6 lg:px-8 text-center border-b-4 border-primary">
        <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-6">Our Services</h1>
        <p className="text-xl text-white/80 max-w-3xl mx-auto">
          End-to-end technology solutions designed to optimize operations, secure your data, and scale with your business.
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
