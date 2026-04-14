import { motion } from "framer-motion";
import {
  Mail, Video, FileText, Shield, Zap, Building2, CheckCircle,
  ExternalLink, Globe, ArrowRight, Layers, Cloud, Lock, BarChart2
} from "lucide-react";
import { Link } from "wouter";
import { VendorInquiryForm } from "@/components/forms/VendorInquiryForm";
import { usePageContent } from "@/hooks/usePageContent";

const MS_BLUE = "#0078d4";
const MS_DARK = "#004578";

const plans = [
  {
    name: "Microsoft 365 Business Basic",
    price: "$6/user/mo",
    priceNote: "Billed annually · web & mobile apps only",
    highlight: false,
    features: [
      "Web & mobile Office apps",
      "Exchange email (50 GB mailbox)",
      "1 TB OneDrive storage",
      "Teams: chat, video & meetings",
      "SharePoint team sites",
      "Microsoft Forms & Lists",
    ],
  },
  {
    name: "Microsoft 365 Business Standard",
    price: "$12.50/user/mo",
    priceNote: "Billed annually · desktop + web + mobile",
    highlight: true,
    features: [
      "Full desktop Office suite (Word, Excel, PowerPoint, Outlook)",
      "Exchange email (50 GB mailbox)",
      "1 TB OneDrive storage",
      "Teams + video conferencing",
      "Microsoft Bookings & Publisher",
      "Webinar hosting (1,000 attendees)",
      "Workflow automation (Power Automate)",
    ],
  },
  {
    name: "Microsoft 365 Business Premium",
    price: "$22/user/mo",
    priceNote: "Billed annually · full productivity + advanced security",
    highlight: false,
    features: [
      "Everything in Business Standard",
      "Microsoft Intune device management",
      "Azure AD P1 (Conditional Access)",
      "Microsoft Defender for Business",
      "Information protection & DLP",
      "Azure Information Protection P1",
      "Advanced threat protection",
    ],
  },
];

const services = [
  {
    icon: Mail,
    title: "Exchange Online",
    subtitle: "Business Email",
    description:
      "Enterprise-class email with a 50 GB mailbox, calendar, contacts, and a custom domain. Protected by Microsoft Defender and compliant with HIPAA, SOC2, ISO27001, and GDPR.",
    highlights: [
      "Custom domain email",
      "50 GB mailbox per user",
      "Advanced spam & threat filtering",
      "Mobile sync (iOS & Android)",
    ],
    color: MS_BLUE,
  },
  {
    icon: Video,
    title: "Microsoft Teams",
    subtitle: "Chat, Meetings & Voice",
    description:
      "All-in-one collaboration hub with team chat, HD video meetings, screen sharing, and Microsoft Teams Phone for cloud calling — replacing your traditional phone system.",
    highlights: [
      "Video meetings up to 1,000 attendees",
      "Teams Phone (cloud PBX)",
      "Channel-based team collaboration",
      "Deep Office integration",
    ],
    color: "#7c3aed",
  },
  {
    icon: FileText,
    title: "Office Suite",
    subtitle: "Word, Excel, PowerPoint & More",
    description:
      "The full Microsoft Office suite — Word, Excel, PowerPoint, Outlook, OneNote, Access, and Publisher — available on desktop, web, and mobile with real-time co-authoring.",
    highlights: [
      "Up to 5 devices per user",
      "Real-time co-authoring",
      "Offline access",
      "Regular feature updates",
    ],
    color: "#16a34a",
  },
  {
    icon: Cloud,
    title: "OneDrive & SharePoint",
    subtitle: "Cloud Storage & Intranet",
    description:
      "1 TB OneDrive storage per user for personal files, plus SharePoint team sites for shared document libraries, intranets, and workflows — all with version history and access controls.",
    highlights: [
      "1 TB per user (OneDrive)",
      "Team document libraries",
      "Version history",
      "External sharing controls",
    ],
    color: "#0891b2",
  },
  {
    icon: Shield,
    title: "Microsoft Defender for Business",
    subtitle: "Endpoint Security (Premium)",
    description:
      "Next-generation antivirus, endpoint detection and response (EDR), and attack surface reduction built directly into Microsoft 365 Business Premium — no third-party AV needed.",
    highlights: [
      "Endpoint detection & response",
      "Next-gen antivirus",
      "Threat & vulnerability management",
      "Automated investigation & remediation",
    ],
    color: "#dc2626",
  },
  {
    icon: Lock,
    title: "Intune & Azure AD",
    subtitle: "Device & Identity Management (Premium)",
    description:
      "Microsoft Intune manages and secures all employee devices (BYOD and corporate) while Azure Active Directory P1 enables conditional access, SSO, and multi-factor authentication.",
    highlights: [
      "Mobile device management (MDM)",
      "Conditional access policies",
      "Single sign-on (SSO)",
      "MFA enforcement",
    ],
    color: "#ea580c",
  },
];

const whyUs = [
  {
    title: "Used by 400M+ Daily Active Users",
    description:
      "Microsoft 365 is the most widely deployed productivity suite in the world, with over 400 million monthly active users across organizations of every size and industry.",
  },
  {
    title: "Security & Compliance Built In",
    description:
      "Business Premium includes Microsoft Defender for Business, Intune, and Azure AD — giving SMBs enterprise-grade security at a fraction of the cost of assembling separate tools.",
  },
  {
    title: "Teams Phone Replaces Your PBX",
    description:
      "With Teams Phone added, Microsoft 365 becomes a complete UCaaS platform — eliminating the need for a separate phone system, desk phones, or PBX hardware.",
  },
  {
    title: "Deep Ecosystem Integration",
    description:
      "Every app integrates natively. Files in SharePoint open in Word. Emails in Outlook attach OneDrive files. Teams calls start from any conversation. Everything works together.",
  },
  {
    title: "99.9% Uptime SLA",
    description:
      "Microsoft backs all commercial Microsoft 365 plans with a financially guaranteed 99.9% uptime SLA — ensuring your email, Teams, and file storage stay available.",
  },
  {
    title: "Copilot AI Integration",
    description:
      "Microsoft 365 Copilot (available as an add-on) brings AI-generated drafts, meeting summaries, Excel data analysis, and PowerPoint creation to every Microsoft 365 app.",
  },
];

const idealFor = [
  {
    type: "Small Business (1–20 users)",
    plans: "Microsoft 365 Business Standard — full Office + Teams + email",
    icon: Building2,
  },
  {
    type: "Security-Conscious SMB (20–300 users)",
    plans: "Microsoft 365 Business Premium — adds Defender + Intune + Azure AD",
    icon: Layers,
  },
  {
    type: "Enterprise / Regulated Industries",
    plans: "Microsoft 365 E3 or E5 — advanced compliance, eDiscovery, SIEM",
    icon: Globe,
  },
];

export default function Microsoft365() {
  const content = usePageContent("microsoft-365", {
    heroTitle: "Microsoft 365",
    heroSubtitle: "Productivity · Security · Collaboration",
    heroDescription: "The world's leading cloud productivity platform — Office apps, Exchange email, Teams, SharePoint, OneDrive, and enterprise-grade security — all in one subscription.",
  });
  return (
    <div className="w-full bg-background">
      {/* Hero */}
      <motion.div
        className="text-white py-16 px-4 sm:px-6 lg:px-8"
        style={{ background: `linear-gradient(135deg, ${MS_DARK} 0%, ${MS_BLUE} 100%)` }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-white/15">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <div className="text-blue-200 text-sm font-semibold uppercase tracking-wide">{content.heroSubtitle}</div>
              <h1 className="text-4xl font-bold">{content.heroTitle}</h1>
            </div>
          </div>
          <p className="text-blue-100 text-lg mt-4 max-w-2xl leading-relaxed">
            {content.heroDescription}
          </p>
          <div className="flex flex-wrap gap-4 mt-8">
            <button
              onClick={() => document.getElementById('inquiry-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white font-bold hover:bg-blue-50 transition-colors" style={{ color: MS_DARK }}
            >
              <ArrowRight className="w-5 h-5" />
              Request a Quote
            </button>
          </div>

          <div className="grid grid-cols-3 gap-6 mt-12 border-t border-white/20 pt-10">
            {[
              { value: "400M+", label: "Monthly active users" },
              { value: "$6/mo", label: "Starting price per user" },
              { value: "99.9%", label: "Uptime SLA" },
            ].map(({ value, label }) => (
              <div key={label}>
                <div className="text-2xl font-bold text-white">{value}</div>
                <div className="text-blue-200 text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-16">

        {/* Plans */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Microsoft 365 Business Plans</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              All plans include Teams, Exchange email, OneDrive, and SharePoint. Business Standard adds desktop Office apps. Business Premium adds enterprise security.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <motion.div
                key={plan.name}
                className={`rounded-xl border-2 overflow-hidden transition-all ${
                  plan.highlight ? "border-blue-500 ring-2 ring-blue-200 shadow-xl" : "border-border"
                }`}
                whileHover={{ y: -4 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                {plan.highlight && (
                  <div className="px-4 py-2 text-xs font-bold text-white text-center" style={{ backgroundColor: MS_BLUE }}>
                    MOST POPULAR
                  </div>
                )}
                <div className="p-6 bg-card">
                  <h3 className="text-xl font-bold text-foreground mb-1">{plan.name}</h3>
                  <div className="text-3xl font-bold mb-1" style={{ color: MS_BLUE }}>{plan.price}</div>
                  <p className="text-xs text-muted-foreground mb-4">{plan.priceNote}</p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-5" style={{ backgroundColor: `${MS_BLUE}15`, color: MS_BLUE }}>
                    <Zap className="w-3 h-3" /> Per user / month
                  </div>
                  <ul className="space-y-2.5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 mt-0.5 shrink-0 text-green-500" />
                        <span className="text-sm text-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/contact">
                    <a className="mt-6 block w-full text-center px-4 py-3 rounded-lg font-bold text-white transition-all" style={{ backgroundColor: plan.highlight ? MS_BLUE : MS_DARK }}>
                      Get Started
                    </a>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Services */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">What's Included</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Every Microsoft 365 subscription includes a full suite of productivity, collaboration, and security tools — deeply integrated with each other.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={service.title}
                  className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-shadow"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <div className="w-11 h-11 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: `${service.color}15` }}>
                    <Icon className="w-5 h-5" style={{ color: service.color }} />
                  </div>
                  <div className="mb-3">
                    <h3 className="font-bold text-foreground text-lg">{service.title}</h3>
                    <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: service.color }}>{service.subtitle}</p>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{service.description}</p>
                  <ul className="space-y-1.5">
                    {service.highlights.map((h) => (
                      <li key={h} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle className="w-3.5 h-3.5 shrink-0 text-green-500" />
                        {h}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* Why Microsoft 365 */}
        <motion.section
          className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-foreground mb-10 text-center">Why Microsoft 365?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyUs.map((item) => (
              <div key={item.title} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: MS_BLUE }}>
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Ideal For */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-foreground mb-8">Who Is This Right For?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {idealFor.map(({ type, plans, icon: Icon }) => (
              <motion.div
                key={type}
                className="bg-card border border-border rounded-xl p-6"
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3 }}
              >
                <Icon className="w-8 h-8 mb-4" style={{ color: MS_BLUE }} />
                <h3 className="font-bold text-foreground mb-2">{type}</h3>
                <p className="text-sm text-muted-foreground">{plans}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Inquiry Form */}
        <motion.section
          className="py-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-foreground mb-3">Get a Microsoft 365 Quote</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                As a licensed Microsoft CSP partner, we handle licensing, migration, and ongoing support. Tell us about your team and we'll get you set up the right way.
              </p>
            </div>
            <div id="inquiry-form" className="bg-white rounded-2xl shadow-xl p-8 md:p-10 border border-border">
              <VendorInquiryForm
                vendorName="Microsoft 365"
                vendorSlug="microsoft-365"
                accentColor={MS_BLUE}
                accentDark={MS_DARK}
                services={[
                  "Microsoft 365 Business Basic ($6/user/mo)",
                  "Microsoft 365 Business Standard ($12.50/user/mo)",
                  "Microsoft 365 Business Premium ($22/user/mo)",
                  "Microsoft 365 E3 / E5 (Enterprise)",
                  "Microsoft Teams Phone Add-on",
                  "Microsoft 365 Copilot (AI Add-on)",
                  "Microsoft Defender for Business",
                ]}
                extraFields={[
                  { id: "users", label: "Number of Users (Seats)", type: "select", options: ["1–9", "10–49", "50–199", "200–999", "1,000+"], required: true },
                  { id: "migration", label: "Migration Needed?", type: "select", options: ["Yes — migrating from Google Workspace", "Yes — migrating from on-prem Exchange / Outlook", "Yes — migrating from another platform", "No — new deployment", "Already on M365, need a better plan"] },
                  { id: "industry", label: "Industry", type: "select", options: ["Healthcare (HIPAA compliance needed)", "Finance / Legal (compliance needs)", "Education / Nonprofit", "Government", "Retail / Hospitality", "Technology", "Manufacturing", "Other"] },
                ]}
              />
            </div>
            <p className="text-xs text-center text-muted-foreground mt-4">
              * Prices shown are annual commitment rates per user per month. Monthly billing is available at a higher rate. Contact us for nonprofit / education discounts.
            </p>
          </div>
        </motion.section>

        {/* CTA */}
        <motion.div
          className="text-white rounded-xl p-12 text-center"
          style={{ background: `linear-gradient(135deg, ${MS_DARK} 0%, ${MS_BLUE} 100%)` }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-4">Modernize Your Workplace with Microsoft 365</h2>
          <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
            From setting up business email to deploying enterprise security, we handle the licensing, migration, and ongoing management of your Microsoft 365 environment.
          </p>
          <Link href="/contact">
            <a className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-white font-bold hover:bg-blue-50 transition-colors text-lg" style={{ color: MS_DARK }}>
              <ArrowRight className="w-5 h-5" />
              Get a Custom Quote
            </a>
          </Link>
          <p className="text-blue-200 text-sm mt-5">Starting at $6/user/mo · Licensed CSP partner · Migration support included</p>
        </motion.div>

      </div>
    </div>
  );
}
