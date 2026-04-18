import { Shield, Calculator, FileCheck, BookOpen, type LucideIcon } from "lucide-react";

export type LeadMagnetSlug =
  | "cybersecurity-assessment"
  | "downtime-calculator"
  | "hipaa-checklist"
  | "buyers-guide";

export type LeadMagnetKey =
  | "cybersecurity_assessment"
  | "downtime_calculator"
  | "hipaa_checklist"
  | "buyers_guide";

export interface LeadMagnet {
  slug: LeadMagnetSlug;
  key: LeadMagnetKey;
  title: string;
  shortTitle: string;
  description: string;
  cta: string;
  icon: LucideIcon;
  color: string;
  bg: string;
  audiences: string[];
}

export const LEAD_MAGNETS: Record<LeadMagnetSlug, LeadMagnet> = {
  "cybersecurity-assessment": {
    slug: "cybersecurity-assessment",
    key: "cybersecurity_assessment",
    title: "Free Cybersecurity Risk Assessment",
    shortTitle: "Cybersecurity Risk Assessment",
    description: "Answer 7 quick questions and we'll email you a tailored security posture score with the top fixes for your business.",
    cta: "Get my free assessment",
    icon: Shield,
    color: "text-red-600",
    bg: "bg-red-50",
    audiences: ["cybersecurity", "compliance", "managed-it"],
  },
  "downtime-calculator": {
    slug: "downtime-calculator",
    key: "downtime_calculator",
    title: "Cost of Downtime Calculator",
    shortTitle: "Downtime Cost Calculator",
    description: "See exactly how much an outage costs your business — by employees, hourly cost, and hours offline. Get a PDF summary in your inbox.",
    cta: "Calculate my downtime cost",
    icon: Calculator,
    color: "text-amber-600",
    bg: "bg-amber-50",
    audiences: ["managed-it", "backup-disaster-recovery", "network"],
  },
  "hipaa-checklist": {
    slug: "hipaa-checklist",
    key: "hipaa_checklist",
    title: "HIPAA Compliance Checklist",
    shortTitle: "HIPAA Checklist",
    description: "Every administrative, physical, and technical safeguard you need to document — built for medical and dental practices.",
    cta: "Send me the checklist",
    icon: FileCheck,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    audiences: ["compliance", "cybersecurity"],
  },
  "buyers-guide": {
    slug: "buyers-guide",
    key: "buyers_guide",
    title: "Buyer's Guide: 10 Questions to Ask Before Hiring an MSP",
    shortTitle: "MSP Buyer's Guide",
    description: "The vetting framework our highest-performing clients used to evaluate Siebert and 30+ other providers.",
    cta: "Download the guide",
    icon: BookOpen,
    color: "text-blue-600",
    bg: "bg-blue-50",
    audiences: ["managed-it", "cloud", "all"],
  },
};

export const ALL_MAGNETS: LeadMagnet[] = Object.values(LEAD_MAGNETS);

export function getMagnetForService(serviceSlug: string): LeadMagnet | null {
  return ALL_MAGNETS.find(m => m.audiences.includes(serviceSlug)) || LEAD_MAGNETS["buyers-guide"];
}
