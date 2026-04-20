import {
  Headphones,
  Activity,
  ShieldCheck,
  Users,
  Clock,
  TrendingDown,
  Wallet,
} from "lucide-react";
import { ServicePageTemplate, type ServicePageContent } from "@/components/ServicePageTemplate";
import { useCaseStudies } from "./useCaseStudies";

const content: ServicePageContent = {
  slug: "managed-it",
  eyebrow: "Managed IT Support",
  heroTitle: "Managed IT Support & Help Desk",
  heroSubtitle: "Predictable per-seat IT — co-managed or fully outsourced.",
  heroDescription:
    "A fully staffed help desk, proactive monitoring, patching, and on-site dispatch — bundled into one monthly per-seat price. Whether you have no internal IT or a small team that needs backup, we plug in cleanly.",
  heroIcon: Headphones,
  heroStats: [
    { value: "<15 min", label: "Avg. ticket response" },
    { value: "24/7", label: "Help desk coverage" },
    { value: "98%", label: "First-touch resolution" },
  ],
  audience: {
    title: "Built for SMBs that can't afford downtime — and don't want to hire a full IT department",
    description:
      "Most of our managed IT clients are 10–250 person organizations across professional services, healthcare, finance, and light manufacturing — throughout North America. They've outgrown a part-time tech and need real coverage without enterprise pricing.",
    bullets: [
      "You have 10–500 employees and rely on technology to operate every day.",
      "You're tired of break-fix surprises and unpredictable IT bills.",
      "You want a single accountable partner — not a rotating cast of contractors.",
      "You need true 24/7 coverage, including evenings and weekends.",
      "You'd rather your in-house IT focus on strategy, not Outlook tickets.",
    ],
  },
  benefits: [
    {
      icon: Wallet,
      title: "Predictable monthly spend",
      description:
        "One per-seat price covers help desk, monitoring, patching, and routine on-site work. No surprise invoices.",
    },
    {
      icon: Clock,
      title: "Faster ticket resolution",
      description:
        "Tickets answered in under 15 minutes on average, with 98% resolved on the first touch by tier-2 engineers.",
    },
    {
      icon: TrendingDown,
      title: "Fewer fires, more focus",
      description:
        "Proactive monitoring and automated patching catch issues before users notice — measurable drop in tickets within 60 days.",
    },
    {
      icon: ShieldCheck,
      title: "Security baked in",
      description:
        "Endpoint protection, MFA, and patch SLAs come standard — not as a surprise add-on after an audit.",
    },
    {
      icon: Users,
      title: "Co-managed friendly",
      description:
        "Already have an internal IT lead? We slot in beside them — taking the night-shift, vendor wrangling, and tier-1 load.",
    },
    {
      icon: Activity,
      title: "Quarterly business reviews",
      description:
        "You get a real strategy meeting every quarter — roadmap, risks, and budget — not just a stack of tickets.",
    },
  ],
  process: [
    {
      title: "Discovery",
      description:
        "30-minute scoping call. We map your stack, headcount, hours, and pain points — no obligation.",
    },
    {
      title: "Assessment",
      description:
        "Free environment review covering endpoints, network, identity, and backup. You get a written findings doc.",
    },
    {
      title: "Onboarding",
      description:
        "30–45 day rollout: agents deployed, documentation captured, users introduced to the help desk, runbooks written.",
    },
    {
      title: "Ongoing support",
      description:
        "24/7 help desk, proactive patching, monthly reporting, and quarterly business reviews with a named vCIO.",
    },
  ],
  compliance: {
    title: "Built on the same controls auditors expect",
    description:
      "Even if you're not in a regulated industry today, our managed IT baseline already satisfies the core controls used in HIPAA, SOC 2, PCI, and NY SHIELD audits — so you're not scrambling when a customer questionnaire lands.",
    items: [
      { label: "MFA enforced", description: "Conditional access on email, VPN, and admin accounts." },
      { label: "Endpoint protection", description: "Managed EDR with 24/7 SOC monitoring on every device." },
      { label: "Patch SLAs", description: "Critical patches deployed within 7 days, tracked and reported." },
      { label: "Backup verified", description: "Daily backups with quarterly restore tests, documented." },
    ],
  },
  faqs: [
    {
      question: "What's actually included in the per-seat price?",
      answer:
        "Unlimited remote help desk, 24/7 monitoring, automated patch management, endpoint AV/EDR, asset inventory, documentation, and a quarterly business review. On-site dispatch is included for clients within our standard service area; travel is pre-quoted for sites outside it.",
    },
    {
      question: "Can you co-manage with our internal IT person or team?",
      answer:
        "Yes — about a third of our clients are co-managed. You keep your internal lead for strategy and vendor relationships; we handle the help desk, after-hours, monitoring, and the project work that would otherwise burn them out.",
    },
    {
      question: "How fast can you onboard us?",
      answer:
        "Standard onboarding is 30–45 days from contract signing to full coverage. We can stand up emergency help-desk coverage within a week if your current provider is exiting.",
    },
    {
      question: "Are you a true 24/7 shop, or do you outsource overnight?",
      answer:
        "We staff our own US-based help desk during business hours and partner with a vetted, US-based 24/7 NOC for after-hours triage. Tier-2 and tier-3 escalations route to our engineers — not to a script-following call center.",
    },
    {
      question: "Do you require a multi-year contract?",
      answer:
        "No. Our standard managed IT agreement is month-to-month after an initial 90-day stabilization window. We earn the renewal every month.",
    },
    {
      question: "How is pricing calculated?",
      answer:
        "Per active user/seat, with a small per-server line item if applicable. Pricing scales down as you grow. See the pricing page for current ranges, or request a quote for an exact figure.",
    },
  ],
  relatedCaseStudySlug: undefined,
  relatedLinks: [
    { label: "Cybersecurity", href: "/services/cybersecurity" },
    { label: "Cloud & Microsoft 365", href: "/services/cloud" },
    { label: "Backup & Disaster Recovery", href: "/services/backup-disaster-recovery" },
    { label: "Pricing", href: "/quote" },
  ],
  schemaDescription:
    "Fully managed and co-managed IT support for SMBs across North America. 24/7 help desk, proactive monitoring, patching, and on-site dispatch (Orange County, NY area) on a predictable per-seat plan.",
};

export default function ManagedIT() {
  const caseStudies = useCaseStudies();
  return <ServicePageTemplate content={content} caseStudies={caseStudies} />;
}
