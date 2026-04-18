import {
  Cloud as CloudIcon,
  Mail,
  Users2,
  GitBranch,
  TrendingUp,
  Settings2,
  ShieldCheck,
} from "lucide-react";
import { ServicePageTemplate, type ServicePageContent } from "@/components/ServicePageTemplate";
import { useCaseStudies } from "./useCaseStudies";

const content: ServicePageContent = {
  slug: "cloud",
  eyebrow: "Cloud Services",
  heroTitle: "Cloud & Microsoft 365",
  heroSubtitle: "Migrate cleanly. Run efficiently. License correctly.",
  heroDescription:
    "Microsoft 365, Azure, Google Workspace, and AWS — planned, migrated, and managed by certified engineers. We handle licensing, identity, security baselines, and day-two operations so your team can focus on the business.",
  heroIcon: CloudIcon,
  heroStats: [
    { value: "500+", label: "Mailboxes migrated" },
    { value: "0", label: "Data loss events on cutover" },
    { value: "20–35%", label: "Avg. license waste recovered" },
  ],
  audience: {
    title: "For teams ready to leave on-prem behind — or fix a messy cloud setup",
    description:
      "We work with growing SMBs that need a clean migration off legacy Exchange, file servers, or competing platforms — and with cloud-native teams who inherited a tangle of overlapping licenses, weak identity, and undocumented tenant settings.",
    bullets: [
      "You're still running on-prem Exchange, file servers, or aging hardware.",
      "Microsoft 365 was set up years ago and no one really owns it.",
      "Licensing has crept up and you're not sure what you're paying for.",
      "You want to consolidate Google Workspace + M365 + Dropbox into one stack.",
      "You're moving workloads to Azure or AWS and need a partner who's actually done it.",
    ],
  },
  benefits: [
    {
      icon: Mail,
      title: "Zero-downtime migrations",
      description:
        "Coexistence-based mailbox, file, and SharePoint migrations cut over without lost mail or disrupted users.",
    },
    {
      icon: TrendingUp,
      title: "Right-sized licensing",
      description:
        "Most new clients recover 20–35% of license spend in the first 60 days through SKU optimization and add-on cleanup.",
    },
    {
      icon: ShieldCheck,
      title: "Secure by default",
      description:
        "Conditional access, MFA, Defender, Intune, and DLP turned on and configured to your business — not left at vendor defaults.",
    },
    {
      icon: GitBranch,
      title: "Identity, done right",
      description:
        "Entra ID (Azure AD) hardened with SSO, role-based access, lifecycle automation, and joiner/leaver workflows.",
    },
    {
      icon: Users2,
      title: "Adoption that sticks",
      description:
        "Teams, SharePoint, and OneDrive rollouts paired with end-user training so the platform actually gets used.",
    },
    {
      icon: Settings2,
      title: "Day-two operations",
      description:
        "Tenant monitoring, backup, license tracking, and quarterly health reviews — so the cloud doesn't drift.",
    },
  ],
  process: [
    {
      title: "Discovery",
      description:
        "We learn your current platforms, users, mailboxes, file shares, identity setup, and business goals.",
    },
    {
      title: "Assessment",
      description:
        "Tenant + license audit, security posture review, and a written migration plan with timeline, risk, and cost.",
    },
    {
      title: "Onboarding",
      description:
        "Phased migration — identity, mail, files, Teams — with coexistence so users keep working through cutover.",
    },
    {
      title: "Ongoing support",
      description:
        "Managed M365/Azure operations, license optimization, tenant monitoring, and roadmap reviews.",
    },
  ],
  compliance: {
    title: "Cloud configurations that hold up under audit",
    description:
      "Microsoft 365 and Azure can either be your strongest compliance asset or your biggest gap — depending on how they're configured. We deploy to baselines that satisfy the controls auditors actually check.",
    items: [
      { label: "Microsoft 365 Secure Score", description: "Tenant configured to recommended security baseline, not vendor defaults." },
      { label: "CIS Microsoft 365 Benchmark", description: "Hardening aligned to the CIS L1/L2 controls." },
      { label: "HIPAA-eligible workloads", description: "BAA in place; PHI segregated; Defender and Purview configured." },
      { label: "Data residency & retention", description: "Retention policies, eDiscovery holds, and DLP tuned to your regulator." },
    ],
  },
  faqs: [
    {
      question: "We're still on Exchange Server. How risky is the migration?",
      answer:
        "With proper planning, low. We use a hybrid coexistence approach so mailboxes move in batches over nights and weekends — users keep sending and receiving mail throughout. Cutover risk is mitigated with rollback plans and pre-staged DNS.",
    },
    {
      question: "Are you a Microsoft Cloud Solution Provider (CSP)?",
      answer:
        "Yes. As a licensed Microsoft CSP partner we sell, deploy, and support Microsoft 365, Azure, Defender, Intune, and Copilot — with month-to-month or annual licensing and direct billing through us.",
    },
    {
      question: "Can you migrate from Google Workspace to Microsoft 365?",
      answer:
        "Yes. We handle Gmail, Drive, Calendar, Contacts, and shared drive migrations into Exchange Online, OneDrive, and SharePoint with content fidelity and minimal user disruption.",
    },
    {
      question: "Do you support Azure and AWS in addition to M365?",
      answer:
        "Yes. We design and operate Azure and AWS workloads — landing zones, IaC, identity federation, networking, and FinOps — typically in support of line-of-business apps or hybrid workloads.",
    },
    {
      question: "Will you help us reduce our M365 license bill?",
      answer:
        "Absolutely. License optimization is part of every onboarding. We routinely uncover Business Premium seats sitting idle, redundant standalone SKUs, and add-ons that overlap with bundled features.",
    },
    {
      question: "Do we need to bundle this with managed IT?",
      answer:
        "No, but most clients do. Cloud + managed IT is where you get the most value — one team owning identity, endpoints, email, and security end-to-end.",
    },
  ],
  relatedCaseStudySlug: undefined,
  relatedLinks: [
    { label: "Microsoft 365 partner page", href: "/microsoft-365" },
    { label: "Cybersecurity", href: "/services/cybersecurity" },
    { label: "Backup & Disaster Recovery", href: "/services/backup-disaster-recovery" },
    { label: "Managed IT Support", href: "/services/managed-it" },
  ],
  schemaDescription:
    "Cloud migration and managed services for Microsoft 365, Azure, Google Workspace, and AWS. Licensing, identity, security, and day-two operations from certified engineers.",
};

export default function CloudServices() {
  const caseStudies = useCaseStudies();
  return <ServicePageTemplate content={content} caseStudies={caseStudies} />;
}
