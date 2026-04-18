import {
  Network as NetworkIcon,
  Wifi,
  Router,
  Cable,
  ShieldCheck,
  Activity,
  Building,
} from "lucide-react";
import { ServicePageTemplate, type ServicePageContent } from "@/components/ServicePageTemplate";
import { useCaseStudies } from "./useCaseStudies";

const content: ServicePageContent = {
  slug: "network",
  eyebrow: "Network Infrastructure",
  heroTitle: "Network Infrastructure",
  heroSubtitle: "Firewalls, switching, Wi-Fi, and SD-WAN — designed and managed.",
  heroDescription:
    "Enterprise-grade network design, deployment, and management — from single-office Wi-Fi rebuilds to multi-site SD-WAN rollouts. As authorized partners for Cisco/Meraki, Fortinet, Palo Alto, Juniper, Extreme, and HP Aruba, we deliver vendor-grade gear at partner pricing.",
  heroIcon: NetworkIcon,
  heroStats: [
    { value: "6+", label: "Authorized network vendors" },
    { value: "99.99%", label: "Target uptime on managed networks" },
    { value: "<5 min", label: "Avg. critical alert response" },
  ],
  audience: {
    title: "For organizations whose network has outgrown its original design",
    description:
      "We come in when the consumer router can't handle the team anymore, when Wi-Fi keeps dropping in the back of the warehouse, when a new office needs to come online, or when a multi-site company needs real SD-WAN instead of a stack of mismatched firewalls.",
    bullets: [
      "Office moves, expansions, or new branch locations.",
      "Wi-Fi dead zones, slow performance, or constant disconnects.",
      "Aging firewalls past end-of-life or end-of-support.",
      "Multiple sites with inconsistent equipment and no central management.",
      "VoIP, video, or guest networks competing for bandwidth without QoS.",
    ],
  },
  benefits: [
    {
      icon: Wifi,
      title: "Wi-Fi that just works",
      description:
        "Site-survey-backed Wi-Fi 6/6E designs with seamless roaming, segmented guest access, and consistent coverage edge-to-edge.",
    },
    {
      icon: ShieldCheck,
      title: "Next-gen firewall protection",
      description:
        "Cisco Meraki, Fortinet, or Palo Alto NGFWs — with IPS, web filtering, and SSL inspection sized to your throughput.",
    },
    {
      icon: Router,
      title: "SD-WAN across all your sites",
      description:
        "Multi-site, multi-circuit failover with central policy, application-aware routing, and zero-touch deployment.",
    },
    {
      icon: Activity,
      title: "Proactive monitoring",
      description:
        "Every switch, AP, and circuit monitored 24/7. We see the outage before your users open a ticket.",
    },
    {
      icon: Cable,
      title: "Clean cabling & rack work",
      description:
        "Structured cabling, fiber runs, and rack builds executed to standard — labeled, documented, and warrantied.",
    },
    {
      icon: Building,
      title: "Office moves done right",
      description:
        "Turnkey buildouts: design, procurement, low-voltage, deployment, cutover, and post-move support — on schedule.",
    },
  ],
  process: [
    {
      title: "Discovery",
      description:
        "Site walk or virtual tour, current topology review, performance pain points, and growth plans.",
    },
    {
      title: "Assessment",
      description:
        "Wi-Fi survey (predictive or on-site), bandwidth analysis, and a network design with bill of materials and labor.",
    },
    {
      title: "Onboarding",
      description:
        "Equipment procurement at partner pricing, staged in our shop, then deployed with cutover plan and rollback.",
    },
    {
      title: "Ongoing management",
      description:
        "24/7 monitoring, firmware management, configuration change control, capacity reviews, and refresh planning.",
    },
  ],
  compliance: {
    title: "Network controls that satisfy your framework",
    description:
      "Networks are where most compliance findings actually surface — flat networks, default firewall rules, undocumented ACLs. We design with your framework's network requirements in scope from day one.",
    items: [
      { label: "Network segmentation", description: "VLANs and firewall rules separating PCI, PHI, IoT, and guest traffic." },
      { label: "Logging & retention", description: "Firewall and switch logs shipped to SIEM with required retention." },
      { label: "WPA3 / 802.1X Wi-Fi", description: "Modern wireless authentication tied to identity, not pre-shared keys." },
      { label: "Documented topology", description: "Network diagrams, ACL inventory, and change logs auditors expect." },
    ],
  },
  faqs: [
    {
      question: "Which vendors do you sell and support?",
      answer:
        "We're authorized partners for Cisco / Meraki, Fortinet, Palo Alto Networks, Juniper, Extreme Networks, and HP Aruba. We recommend the vendor that best fits your environment, throughput, and budget — not the one with the highest margin.",
    },
    {
      question: "Can you do a Wi-Fi site survey before quoting?",
      answer:
        "Yes. For complex spaces (warehouses, multi-floor offices, healthcare, manufacturing) we do a predictive design from floor plans plus an on-site walkthrough with spectrum analysis. For typical office spaces, predictive surveys are usually sufficient.",
    },
    {
      question: "Do you handle low-voltage cabling and rack work?",
      answer:
        "Yes. We perform structured cabling, fiber runs, IDF/MDF buildouts, and rack & stack — either with our own technicians or vetted partner crews for larger projects. All work is documented and labeled.",
    },
    {
      question: "Can you take over an existing network we didn't build?",
      answer:
        "Yes — that's a common starting point. We perform a takeover assessment (config review, firmware status, license inventory, documentation) and produce a remediation roadmap before assuming management responsibility.",
    },
    {
      question: "How does SD-WAN compare to traditional MPLS?",
      answer:
        "SD-WAN is typically faster to deploy, cheaper, and more flexible than MPLS — especially for organizations with 3+ sites. It uses commodity broadband and cellular circuits with intelligent failover and central policy. We design and manage SD-WAN on Meraki, Fortinet, and Palo Alto Prisma.",
    },
    {
      question: "Is ongoing network management included?",
      answer:
        "It's an option. Many clients buy the project (design + deployment) and bundle ongoing management into their managed IT or managed security plan. Others buy network management standalone.",
    },
  ],
  relatedCaseStudySlug: undefined,
  relatedLinks: [
    { label: "Cisco / Meraki partner page", href: "/cisco-meraki" },
    { label: "Fortinet partner page", href: "/fortinet" },
    { label: "Palo Alto Networks partner page", href: "/palo-alto-networks" },
    { label: "Cybersecurity", href: "/services/cybersecurity" },
    { label: "Managed IT Support", href: "/services/managed-it" },
  ],
  schemaDescription:
    "Network infrastructure design, deployment, and management — firewalls, switching, Wi-Fi, SD-WAN, and structured cabling — using authorized vendor partnerships with Cisco/Meraki, Fortinet, Palo Alto, Juniper, Extreme, and HP Aruba.",
};

export default function NetworkInfrastructure() {
  const caseStudies = useCaseStudies();
  return <ServicePageTemplate content={content} caseStudies={caseStudies} />;
}
