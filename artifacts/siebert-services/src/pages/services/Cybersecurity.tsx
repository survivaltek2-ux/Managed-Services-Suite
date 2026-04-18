import {
  Shield,
  Lock,
  Eye,
  AlertTriangle,
  GraduationCap,
  FileSearch,
  Building2,
} from "lucide-react";
import { ServicePageTemplate, type ServicePageContent } from "@/components/ServicePageTemplate";
import { useCaseStudies } from "./useCaseStudies";

const content: ServicePageContent = {
  slug: "cybersecurity",
  eyebrow: "Cybersecurity",
  heroTitle: "Cybersecurity for SMBs",
  heroSubtitle: "Stop ransomware. Pass audits. Sleep at night.",
  heroDescription:
    "A layered security program — endpoint detection, email defense, identity protection, awareness training, and 24/7 SOC monitoring — built for organizations that can't afford a CISO but can't afford a breach either.",
  heroIcon: Shield,
  heroStats: [
    { value: "24/7", label: "SOC monitoring" },
    { value: "<8 min", label: "Avg. threat containment" },
    { value: "0", label: "Successful ransomware events on managed clients" },
  ],
  audience: {
    title: "Built for SMBs in the crosshairs — without the enterprise price tag",
    description:
      "Attackers don't skip you because you're small — they target you because they assume you're undefended. Our cybersecurity service gives you enterprise-grade controls priced for a 25–500 person business.",
    bullets: [
      "You handle PHI, financial data, customer PII, or trade secrets.",
      "Cyber insurance carriers are asking harder questions every renewal.",
      "Your CRM, ERP, or email is the heartbeat of the business.",
      "You've had a near-miss — phishing, BEC, or a ransomware scare.",
      "Customers, partners, or auditors are asking for security attestations.",
    ],
  },
  benefits: [
    {
      icon: Eye,
      title: "Threats caught in minutes, not months",
      description:
        "24/7 SOC analysts respond to alerts in under 8 minutes — isolating endpoints before attackers can move laterally.",
    },
    {
      icon: Lock,
      title: "Identity-first protection",
      description:
        "MFA, conditional access, and privilege controls stop the #1 attack vector — stolen credentials — at the front door.",
    },
    {
      icon: AlertTriangle,
      title: "Ransomware readiness",
      description:
        "Immutable backups, EDR rollback, and tested incident response runbooks mean an attack is a bad day, not the end of your business.",
    },
    {
      icon: GraduationCap,
      title: "Trained, tested users",
      description:
        "Quarterly phishing simulations and bite-sized training measurably reduce click rates inside 90 days.",
    },
    {
      icon: FileSearch,
      title: "Audit & insurance ready",
      description:
        "We map controls to your framework — HIPAA, CMMC, SOC 2, NY SHIELD, PCI — and supply the evidence carriers and auditors require.",
    },
    {
      icon: Building2,
      title: "Vendor & supply-chain hygiene",
      description:
        "Third-party risk reviews, SaaS posture monitoring, and least-privilege access keep partner risk from becoming your incident.",
    },
  ],
  process: [
    {
      title: "Discovery",
      description:
        "30-minute risk conversation. We learn your data, regulators, customers, and current controls.",
    },
    {
      title: "Assessment",
      description:
        "Free posture assessment: external scan, M365/Google review, identity audit, and a written risk report with prioritized recommendations.",
    },
    {
      title: "Onboarding",
      description:
        "Phased rollout — identity hardening first, then endpoint, email, monitoring, and training. Most clients reach baseline in 30 days.",
    },
    {
      title: "Ongoing defense",
      description:
        "24/7 SOC, monthly threat reports, quarterly tabletop exercises, and an annual penetration test — with a named security lead.",
    },
  ],
  compliance: {
    title: "Mapped to the frameworks your customers and regulators care about",
    description:
      "Whether you're a healthcare provider, government contractor, financial firm, or B2B SaaS chasing enterprise deals, our controls are pre-mapped to the standards you'll be measured against.",
    items: [
      { label: "HIPAA Security Rule", description: "Administrative, physical, and technical safeguards mapped end-to-end." },
      { label: "CMMC Level 2 / NIST 800-171", description: "DoD contractor controls for CUI handling and reporting." },
      { label: "SOC 2 Type II", description: "Evidence collection and continuous control monitoring for your auditor." },
      { label: "NY SHIELD & GLBA", description: "Reasonable safeguards for NY businesses and financial institutions." },
      { label: "PCI DSS 4.0", description: "Cardholder data environment scoping, segmentation, and quarterly scans." },
      { label: "Cyber insurance questionnaires", description: "We complete the long-form questions with documented evidence." },
    ],
  },
  faqs: [
    {
      question: "Do I need a CISO to use this service?",
      answer:
        "No. Our security service includes a fractional vCISO who participates in your leadership and risk meetings, owns the security roadmap, and represents you to auditors and insurers.",
    },
    {
      question: "What's the difference between this and the antivirus my IT person already runs?",
      answer:
        "Traditional antivirus is signature-based and reactive. Our managed EDR uses behavioral detection plus 24/7 human SOC analysts who triage alerts, isolate compromised devices, and run remediation — not just send you an email.",
    },
    {
      question: "Can you help us pass a HIPAA, SOC 2, or CMMC audit?",
      answer:
        "Yes — that's a core part of what we do. We'll perform a gap assessment, deploy the missing controls, and supply the policies, procedures, and evidence your auditor or assessor requires.",
    },
    {
      question: "What happens if we get breached anyway?",
      answer:
        "Incident response is included for managed security clients. We have pre-staged runbooks, forensic partners, and breach-counsel relationships — and we're at the keyboard the moment an alert fires.",
    },
    {
      question: "Do you offer security as a standalone service or only with managed IT?",
      answer:
        "Both. You can buy managed security on top of your existing IT setup, or bundle it into a full managed IT plan at a discounted rate.",
    },
    {
      question: "How are you priced?",
      answer:
        "Per protected user/endpoint, with optional add-ons for vCISO time, penetration testing, and compliance evidence collection. Request a quote for an itemized proposal.",
    },
  ],
  relatedCaseStudySlug: undefined,
  relatedLinks: [
    { label: "Compliance (HIPAA, CMMC, GLBA)", href: "/services/compliance" },
    { label: "Backup & Disaster Recovery", href: "/services/backup-disaster-recovery" },
    { label: "Managed IT Support", href: "/services/managed-it" },
    { label: "Network Infrastructure", href: "/services/network" },
  ],
  schemaDescription:
    "Managed cybersecurity for SMBs — 24/7 SOC, EDR, MFA, awareness training, vCISO, and audit readiness for HIPAA, SOC 2, CMMC, PCI, and NY SHIELD.",
};

export default function Cybersecurity() {
  const caseStudies = useCaseStudies();
  return <ServicePageTemplate content={content} caseStudies={caseStudies} />;
}
