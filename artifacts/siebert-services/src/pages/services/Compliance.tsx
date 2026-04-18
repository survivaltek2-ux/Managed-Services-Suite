import {
  ClipboardCheck,
  ShieldCheck,
  FileText,
  ScrollText,
  GraduationCap,
  Gauge,
  UserCheck,
} from "lucide-react";
import { ServicePageTemplate, type ServicePageContent } from "@/components/ServicePageTemplate";
import { useCaseStudies } from "./useCaseStudies";

const content: ServicePageContent = {
  slug: "compliance",
  eyebrow: "Compliance",
  heroTitle: "HIPAA, CMMC & GLBA Compliance",
  heroSubtitle: "Pass your audit. Win the contract. Sleep at night.",
  heroDescription:
    "A practical compliance program for SMBs — gap assessment, control deployment, policy authoring, evidence collection, and audit support. We translate frameworks into the controls and paperwork your auditor will actually accept.",
  heroIcon: ClipboardCheck,
  heroStats: [
    { value: "100%", label: "First-time HIPAA audit pass rate" },
    { value: "60–90 days", label: "Typical time to audit-ready" },
    { value: "5+", label: "Frameworks we routinely deliver" },
  ],
  audience: {
    title: "For SMBs facing audits, customer questionnaires, or regulator scrutiny",
    description:
      "We work with healthcare practices, defense contractors, financial advisors, law firms, and B2B vendors who suddenly need to prove their security program — usually because a customer, regulator, or insurer is asking pointed questions.",
    bullets: [
      "You handle PHI, CUI, NPI, cardholder data, or other regulated information.",
      "You're chasing an enterprise deal that requires SOC 2 or a long security questionnaire.",
      "You're a DoD contractor preparing for CMMC Level 2.",
      "Your cyber insurance renewal is asking far harder questions than last year.",
      "You've never had a real compliance program and don't know where to start.",
    ],
  },
  benefits: [
    {
      icon: ShieldCheck,
      title: "Audit-ready in 60–90 days",
      description:
        "A focused engagement closes gaps and produces evidence in the timeframes auditors and customers expect.",
    },
    {
      icon: FileText,
      title: "Policies that match reality",
      description:
        "Custom-authored policies that reflect what you actually do — not generic templates auditors immediately discount.",
    },
    {
      icon: ScrollText,
      title: "Evidence collected continuously",
      description:
        "Automated control monitoring and an evidence library that's ready when the auditor asks — not scrambled together quarterly.",
    },
    {
      icon: UserCheck,
      title: "Vendor risk under control",
      description:
        "Third-party risk assessments, BAAs, DPAs, and supply-chain reviews that satisfy your framework's vendor management clause.",
    },
    {
      icon: GraduationCap,
      title: "Trained, tested staff",
      description:
        "Annual security and privacy training, role-based modules, and phishing simulations — with completion records auditors require.",
    },
    {
      icon: Gauge,
      title: "Continuous, not one-time",
      description:
        "Compliance is a posture, not a project. Quarterly reviews, control updates, and renewal-cycle support keep you ready.",
    },
  ],
  process: [
    {
      title: "Discovery",
      description:
        "We learn your business, regulators, customer commitments, current controls, and target framework(s).",
    },
    {
      title: "Assessment",
      description:
        "Formal gap assessment against your framework. You get a written report with prioritized remediation, scope, and cost.",
    },
    {
      title: "Onboarding",
      description:
        "Remediation: technical controls deployed, policies authored, training rolled out, evidence collection automated.",
    },
    {
      title: "Ongoing program",
      description:
        "Continuous monitoring, quarterly control reviews, annual risk assessment, and audit / assessor support.",
    },
  ],
  compliance: {
    title: "Frameworks we routinely deliver",
    description:
      "We don't pretend to do every framework on earth. We focus on the standards SMBs in healthcare, defense, finance, and B2B SaaS actually face — and we deliver them end-to-end.",
    items: [
      { label: "HIPAA / HITECH", description: "Privacy, Security, and Breach Notification rules — for covered entities and business associates." },
      { label: "CMMC Level 2 (NIST 800-171)", description: "DoD contractor compliance for handling Controlled Unclassified Information." },
      { label: "GLBA Safeguards Rule", description: "Financial institution data protection, including the 2023 amendments." },
      { label: "SOC 2 Type II", description: "Trust Services Criteria implementation and audit readiness for B2B SaaS." },
      { label: "PCI DSS 4.0", description: "Cardholder data scoping, segmentation, and ASV scanning." },
      { label: "NY SHIELD Act", description: "Reasonable safeguards required of any business holding NY residents' private info." },
    ],
  },
  faqs: [
    {
      question: "Are you the auditor or the consultant?",
      answer:
        "Consultant. We are not your auditor or assessor — that would be a conflict of interest. We prepare you, deploy controls, author documentation, and represent you through the audit. We coordinate closely with your chosen auditor or C3PAO.",
    },
    {
      question: "How long does it take to get HIPAA-compliant?",
      answer:
        "If you have nothing in place today, plan on 60–90 days for a small-to-mid practice to reach a defensible posture: risk analysis complete, technical safeguards deployed, policies authored, training delivered, BAAs in place, and an incident response plan tested.",
    },
    {
      question: "We're a DoD subcontractor. Can you get us to CMMC Level 2?",
      answer:
        "Yes. We perform the NIST 800-171 gap assessment, generate your System Security Plan (SSP) and Plan of Action & Milestones (POA&M), deploy the technical controls, and prepare you for assessment by a C3PAO. Engagement length depends on your starting baseline.",
    },
    {
      question: "Do you provide the actual policies and procedures?",
      answer:
        "Yes — and we customize them to your business. Generic templates fail audits. Our policies reference your actual systems, roles, and processes so an auditor can trace policy → procedure → evidence.",
    },
    {
      question: "What if we already have an MSP / IT person?",
      answer:
        "We work with them. Many clients keep their existing IT for day-to-day support and add us purely for the compliance program. We coordinate technical control deployment with your existing team.",
    },
    {
      question: "How is this priced?",
      answer:
        "Two components: an initial gap assessment + remediation engagement (fixed-fee), then an ongoing managed compliance retainer covering continuous monitoring, evidence, training, and annual reviews. Request a quote for a framework-specific estimate.",
    },
  ],
  relatedCaseStudySlug: undefined,
  relatedLinks: [
    { label: "Cybersecurity", href: "/services/cybersecurity" },
    { label: "Backup & Disaster Recovery", href: "/services/backup-disaster-recovery" },
    { label: "Managed IT Support", href: "/services/managed-it" },
    { label: "Cloud & Microsoft 365", href: "/services/cloud" },
  ],
  schemaDescription:
    "Managed compliance services for SMBs — HIPAA, CMMC Level 2, GLBA, SOC 2, PCI DSS, and NY SHIELD. Gap assessments, control deployment, policy authoring, evidence collection, and audit support.",
};

export default function Compliance() {
  const caseStudies = useCaseStudies();
  return <ServicePageTemplate content={content} caseStudies={caseStudies} />;
}
