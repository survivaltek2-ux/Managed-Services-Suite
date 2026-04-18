import {
  Database,
  History,
  ShieldCheck,
  Timer,
  RefreshCcw,
  CloudOff,
  FileCheck,
} from "lucide-react";
import { ServicePageTemplate, type ServicePageContent } from "@/components/ServicePageTemplate";
import { useCaseStudies } from "./useCaseStudies";

const content: ServicePageContent = {
  slug: "backup-disaster-recovery",
  eyebrow: "Backup & Disaster Recovery",
  heroTitle: "Backup & Disaster Recovery",
  heroSubtitle: "Immutable backups, tested recoveries, guaranteed RTOs.",
  heroDescription:
    "Business continuity delivered as a managed service — for servers, endpoints, Microsoft 365, and SaaS. Immutable cloud backups, ransomware-resistant snapshots, and quarterly recovery tests so you know it works before you need it.",
  heroIcon: Database,
  heroStats: [
    { value: "<1 hr", label: "Typical RTO for critical systems" },
    { value: "Daily", label: "Backup verification" },
    { value: "Quarterly", label: "Live recovery tests" },
  ],
  audience: {
    title: "For organizations whose business stops if their data does",
    description:
      "If a ransomware event, hardware failure, or accidental deletion would cost you customers, revenue, or compliance posture, your backup setup needs to be more than a USB drive in a closet.",
    bullets: [
      "Critical line-of-business apps you can't operate without (EHR, ERP, CRM, file shares).",
      "Microsoft 365 or Google Workspace as your system of record.",
      "Compliance or insurance requirements specifying RTO/RPO and offsite copies.",
      "Past experience of \"the backup didn't work\" — or never being sure if it would.",
      "Multiple sites or remote workers whose data isn't centrally protected.",
    ],
  },
  benefits: [
    {
      icon: ShieldCheck,
      title: "Ransomware-proof backups",
      description:
        "Immutable cloud copies attackers can't encrypt or delete — even with full domain admin credentials.",
    },
    {
      icon: Timer,
      title: "Guaranteed RTOs in writing",
      description:
        "Tiered recovery objectives by system, contractually committed and rehearsed every quarter.",
    },
    {
      icon: RefreshCcw,
      title: "Microsoft 365 & SaaS coverage",
      description:
        "Mail, OneDrive, SharePoint, Teams, and major SaaS apps backed up — Microsoft's native retention is not a backup.",
    },
    {
      icon: History,
      title: "Granular point-in-time restore",
      description:
        "Roll back a single file, mailbox, VM, or entire site to a specific moment in time — not just \"last night.\"",
    },
    {
      icon: FileCheck,
      title: "Verified, not assumed",
      description:
        "Daily automated backup verification plus quarterly live restore tests — with documented results you can hand an auditor.",
    },
    {
      icon: CloudOff,
      title: "True disaster recovery",
      description:
        "Cloud failover spins critical workloads back up in our DR cloud while we rebuild your primary site.",
    },
  ],
  process: [
    {
      title: "Discovery",
      description:
        "We catalog systems, data volumes, RTO/RPO needs, compliance requirements, and existing backup tools.",
    },
    {
      title: "Assessment",
      description:
        "Backup audit + business impact analysis. You get a written BC/DR plan with priorities, RTOs, and cost.",
    },
    {
      title: "Onboarding",
      description:
        "Backup agents deployed, immutable cloud targets configured, runbooks written, first restore test executed.",
    },
    {
      title: "Ongoing protection",
      description:
        "Daily verification, monthly reporting, quarterly recovery drills, and annual BC/DR plan refresh.",
    },
  ],
  compliance: {
    title: "Backup & DR controls auditors and insurers expect",
    description:
      "Cyber insurance carriers and regulators are no longer satisfied with \"yes we have backups.\" Our service produces the documentation, immutability, and test evidence they require.",
    items: [
      { label: "Immutable / air-gapped copies", description: "Object-lock cloud storage that resists encryption and deletion." },
      { label: "3-2-1 backup rule", description: "Three copies, two media, one offsite — automatically maintained." },
      { label: "HIPAA contingency plan", description: "Backup, disaster recovery, and emergency mode operations documented." },
      { label: "Cyber insurance evidence", description: "Test logs, RTO commitments, and immutability proof for renewals." },
    ],
  },
  faqs: [
    {
      question: "Isn't Microsoft 365 already backed up by Microsoft?",
      answer:
        "No — and Microsoft says so explicitly. Their shared responsibility model covers infrastructure availability, not your data. Recycle bin and retention policies are not backups: a malicious admin, ransomware, or a misconfigured retention rule can destroy data in ways Microsoft cannot recover. We back up Exchange, OneDrive, SharePoint, and Teams to a separate cloud.",
    },
    {
      question: "What's an RTO and RPO and what should mine be?",
      answer:
        "RTO (Recovery Time Objective) is how fast you need a system back. RPO (Recovery Point Objective) is how much data you can afford to lose. We help you set realistic targets per system — typically <1 hour RTO and <15 min RPO for critical line-of-business systems, longer for everything else.",
    },
    {
      question: "How does the immutability piece actually work?",
      answer:
        "Backups are written to object-locked cloud storage with a retention period that nobody — including us, including a compromised admin — can shorten. Even if attackers achieve full network and identity compromise, the cloud copy survives.",
    },
    {
      question: "Do you actually test the restores or just the backups?",
      answer:
        "Both. Daily we verify backup integrity. Quarterly we perform live restores — typically a sample VM, mailbox, and file set — and document the results. Annually we run a full DR tabletop with your team.",
    },
    {
      question: "What happens if our office is destroyed?",
      answer:
        "Critical workloads spin up in our DR cloud within the contracted RTO while we work with you on permanent rebuild. Users connect via VPN or published apps and keep operating.",
    },
    {
      question: "Can this be added to an existing IT setup?",
      answer:
        "Yes. BDR is sold standalone or bundled with managed IT. Many clients start here after an audit or insurance renewal flags their current backup as insufficient.",
    },
  ],
  relatedCaseStudySlug: undefined,
  relatedLinks: [
    { label: "Cybersecurity", href: "/services/cybersecurity" },
    { label: "Compliance", href: "/services/compliance" },
    { label: "Cloud & Microsoft 365", href: "/services/cloud" },
    { label: "Managed IT Support", href: "/services/managed-it" },
  ],
  schemaDescription:
    "Managed backup and disaster recovery for SMBs — immutable cloud backups for servers, endpoints, Microsoft 365, and SaaS, with guaranteed RTOs and quarterly recovery testing.",
};

export default function BackupDR() {
  const caseStudies = useCaseStudies();
  return <ServicePageTemplate content={content} caseStudies={caseStudies} />;
}
