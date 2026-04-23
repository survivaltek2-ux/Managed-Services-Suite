export type QuestionType = "text" | "email" | "tel" | "select" | "multicheck" | "textarea";

export interface QuestionConfig {
  id: string;
  label: string;
  type: QuestionType;
  required: boolean;
  placeholder?: string;
  helpText?: string;
  options?: string[];
  columns?: number;
}

export interface WizardStepConfig {
  id: number;
  label: string;
  questions: QuestionConfig[];
}

export const HEADCOUNT_OPTIONS = [
  "1-5", "6-10", "11-25", "26-50", "51-100", "101-250", "251-500", "500+"
];

export const LOCATIONS_OPTIONS = [
  "1", "2-3", "4-5", "6-10", "10+",
];

export const WORKSTATION_OPTIONS = [
  "Under 10", "10-25", "26-50", "51-100", "101-250", "250+",
];

export const SERVER_OPTIONS = [
  "0 (cloud-only)", "1-2", "3-5", "6-10", "10+",
];

export const CLOUD_PLATFORM_OPTIONS = [
  "Microsoft 365",
  "Google Workspace",
  "Microsoft Azure",
  "Amazon Web Services (AWS)",
  "Google Cloud (GCP)",
  "Other SaaS apps",
  "None",
];

export const EXISTING_IT_OPTIONS = [
  "In-house IT staff",
  "Existing MSP / managed provider",
  "Break/fix vendor",
  "Mix of in-house & vendor",
  "No formal IT support",
];

export const PAIN_POINT_OPTIONS = [
  { value: "downtime",    label: "Frequent downtime / outages" },
  { value: "security",    label: "Security threats / breaches" },
  { value: "compliance",  label: "Compliance & regulatory gaps" },
  { value: "backup",      label: "Backup / disaster recovery" },
  { value: "email",       label: "Email / Microsoft 365 issues" },
  { value: "remote",      label: "Remote workforce challenges" },
  { value: "hardware",    label: "Aging hardware / end-of-life" },
  { value: "cloud",       label: "Cloud adoption / migration" },
  { value: "voip",        label: "Phone / VoIP modernisation" },
  { value: "vendor",      label: "Too many unmanaged vendors" },
];

export const COMPLIANCE_OPTIONS = [
  "None / Not applicable",
  "HIPAA",
  "SOC 2",
  "CMMC / DFARS",
  "PCI-DSS",
  "GDPR",
  "NIST CSF",
  "ISO 27001",
];

export const PRIORITY_OPTIONS = [
  "Reduce IT costs",
  "Improve security posture",
  "Minimise downtime",
  "Enable remote work",
  "Modernise infrastructure",
  "Scale IT with growth",
  "Improve compliance",
  "Consolidate vendors",
];

export const BUDGET_OPTIONS = [
  "Under $1,000/mo",
  "$1,000-$2,500/mo",
  "$2,500-$5,000/mo",
  "$5,000-$10,000/mo",
  "$10,000+/mo",
  "Not yet defined",
];

export const TIMELINE_OPTIONS = [
  "Immediately",
  "Within 30 days",
  "1-3 months",
  "3-6 months",
  "6-12 months",
  "Evaluating / no deadline",
];

export const MFA_OPTIONS = [
  "Yes — enforced everywhere",
  "Partial — some users / apps",
  "No",
  "Unsure",
];

export const LAST_ASSESSMENT_OPTIONS = [
  "Within last 6 months",
  "6-12 months ago",
  "More than a year ago",
  "Never",
  "Unsure",
];

export const CYBER_INSURANCE_OPTIONS = [
  "Yes — current policy",
  "Exploring / renewing",
  "No",
  "Unsure",
];

export const HOURS_OPTIONS = [
  "Standard business hours (8x5)",
  "Extended hours",
  "24x7 operations",
];

export const AFTER_HOURS_OPTIONS = [
  "Yes — required",
  "Occasionally",
  "No",
];

export const TICKET_VOLUME_OPTIONS = [
  "Under 10 / month",
  "10-50 / month",
  "50-150 / month",
  "150+ / month",
  "Unsure",
];

export const QUESTIONNAIRE_STEPS: WizardStepConfig[] = [
  {
    id: 1,
    label: "Client Info",
    questions: [
      { id: "clientName",    label: "Contact Name",    type: "text",  required: true,  placeholder: "John Smith" },
      { id: "clientTitle",   label: "Title / Role",    type: "text",  required: false, placeholder: "IT Manager" },
      { id: "clientCompany", label: "Company Name",    type: "text",  required: true,  placeholder: "Acme Corp" },
      { id: "clientEmail",   label: "Email Address",   type: "email", required: true,  placeholder: "john@acmecorp.com" },
      { id: "clientPhone",   label: "Phone Number",    type: "tel",   required: false, placeholder: "+1 (555) 000-0000" },
    ],
  },
  {
    id: 2,
    label: "Business Details",
    questions: [
      { id: "headcount",       label: "Headcount",            type: "select",     required: true,  placeholder: "Select employee count", options: HEADCOUNT_OPTIONS },
      { id: "locations",       label: "Number of Locations",  type: "select",     required: true,  placeholder: "Select", options: LOCATIONS_OPTIONS },
      { id: "workstations",    label: "Workstations / Laptops", type: "select",   required: true,  placeholder: "Select count", options: WORKSTATION_OPTIONS },
      { id: "servers",         label: "On-prem Servers",      type: "select",     required: true,  placeholder: "Select count", options: SERVER_OPTIONS },
      { id: "cloudPlatforms",  label: "Cloud Platforms in Use", type: "multicheck", required: true, options: CLOUD_PLATFORM_OPTIONS, columns: 2, helpText: "Select all that apply." },
      { id: "existingItSupport", label: "Existing IT Support", type: "select",    required: true,  placeholder: "Select", options: EXISTING_IT_OPTIONS },
      { id: "currentItSetup",  label: "Additional Environment Notes", type: "textarea", required: false, placeholder: "Anything specific about the network, key apps, custom setups, etc.", helpText: "Optional — useful for unusual or custom environments." },
      { id: "currentVendors",  label: "Current Vendors / Tools", type: "text",    required: false, placeholder: "e.g., Microsoft 365, Cisco Meraki, AWS" },
    ],
  },
  {
    id: 3,
    label: "Security & Compliance",
    questions: [
      { id: "mfaStatus",        label: "Multi-Factor Authentication", type: "select", required: true, placeholder: "Select", options: MFA_OPTIONS },
      { id: "endpointProtection", label: "Endpoint Protection in Use", type: "text", required: false, placeholder: "e.g., Microsoft Defender, SentinelOne, none" },
      { id: "backupSolution",   label: "Backup Solution in Use",      type: "text",   required: false, placeholder: "e.g., Veeam, Datto, Microsoft 365 backup, none" },
      { id: "lastAssessment",   label: "Last Security Assessment",     type: "select", required: true, placeholder: "Select", options: LAST_ASSESSMENT_OPTIONS },
      { id: "cyberInsurance",   label: "Cyber Insurance",              type: "select", required: true, placeholder: "Select", options: CYBER_INSURANCE_OPTIONS },
      { id: "complianceNeeds",  label: "Compliance Requirements",      type: "multicheck", required: true, options: COMPLIANCE_OPTIONS, columns: 2, helpText: "Select 'None / Not applicable' if there are no compliance obligations." },
    ],
  },
  {
    id: 4,
    label: "Support & Operations",
    questions: [
      { id: "hoursOfOperation",  label: "Hours of Operation",         type: "select", required: true,  placeholder: "Select", options: HOURS_OPTIONS },
      { id: "afterHoursSupport", label: "After-hours Support Needed", type: "select", required: true,  placeholder: "Select", options: AFTER_HOURS_OPTIONS },
      { id: "ticketVolume",      label: "Estimated Monthly Tickets",  type: "select", required: false, placeholder: "Select", options: TICKET_VOLUME_OPTIONS },
      { id: "growthHeadcount",   label: "Expected Headcount in 12 Months", type: "text", required: false, placeholder: "e.g., 75 (or N/A)" },
      { id: "plannedProjects",   label: "Major IT Projects in Next 12 Months", type: "textarea", required: false, placeholder: "e.g., office relocation, M365 migration, ERP rollout" },
    ],
  },
  {
    id: 5,
    label: "Pain Points & Priorities",
    questions: [
      { id: "painPoints",        label: "Primary Pain Points", type: "multicheck", required: true, options: PAIN_POINT_OPTIONS.map(p => p.value), columns: 2, helpText: "Select all that apply." },
      { id: "priorities",        label: "Top Priorities",      type: "multicheck", required: false, options: PRIORITY_OPTIONS, columns: 2 },
      { id: "budgetRange",       label: "Budget Range",        type: "select", required: false, options: BUDGET_OPTIONS, placeholder: "Select range" },
      { id: "preferredTimeline", label: "Preferred Timeline",  type: "select", required: false, options: TIMELINE_OPTIONS, placeholder: "Select timeline" },
      { id: "additionalContext", label: "Additional Context",  type: "textarea", required: false, placeholder: "Any other relevant information about the client's situation or goals" },
    ],
  },
  { id: 6, label: "Review & Generate", questions: [] },
  { id: 7, label: "Send",              questions: [] },
];

export const REQUIRED_QUESTIONNAIRE_FIELDS: string[] = QUESTIONNAIRE_STEPS
  .flatMap(s => s.questions)
  .filter(q => q.required)
  .map(q => q.id);

export function validateQuestionnaireAnswers(answers: Record<string, unknown>): string[] {
  const errors: string[] = [];
  for (const fieldId of REQUIRED_QUESTIONNAIRE_FIELDS) {
    const val = answers[fieldId];
    if (!val || (Array.isArray(val) && val.length === 0) || val === "") {
      const cfg = QUESTIONNAIRE_STEPS.flatMap(s => s.questions).find(q => q.id === fieldId);
      errors.push(`${cfg?.label ?? fieldId} is required`);
    }
  }
  return errors;
}
