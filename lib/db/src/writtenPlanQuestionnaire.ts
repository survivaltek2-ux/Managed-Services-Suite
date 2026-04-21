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
      { id: "headcount",      label: "Headcount",           type: "select",   required: true,  placeholder: "Select employee count", options: HEADCOUNT_OPTIONS },
      { id: "locations",      label: "Number of Locations", type: "text",     required: true,  placeholder: "e.g., 2 offices in NYC" },
      { id: "currentItSetup", label: "Current IT Setup",    type: "textarea", required: true,  placeholder: "Describe the current infrastructure — servers, cloud services, devices, managed by whom, etc.", helpText: "This helps us tailor the plan to your client's actual environment." },
      { id: "currentVendors", label: "Current Vendors / Tools", type: "text", required: false, placeholder: "e.g., Microsoft 365, Cisco Meraki, AWS" },
    ],
  },
  {
    id: 3,
    label: "Pain Points",
    questions: [
      { id: "painPoints",      label: "Primary Pain Points",      type: "multicheck", required: true,  options: PAIN_POINT_OPTIONS.map(p => p.value), columns: 2, helpText: "Select all that apply." },
      { id: "complianceNeeds", label: "Compliance Requirements",  type: "multicheck", required: true,  options: COMPLIANCE_OPTIONS, columns: 2, helpText: "Select 'None / Not applicable' if there are no compliance obligations." },
      { id: "priorities",      label: "Top Priorities",           type: "multicheck", required: false, options: PRIORITY_OPTIONS, columns: 2 },
      { id: "budgetRange",     label: "Budget Range",             type: "select",     required: false, options: BUDGET_OPTIONS, placeholder: "Select range" },
      { id: "preferredTimeline", label: "Preferred Timeline",     type: "select",     required: false, options: TIMELINE_OPTIONS, placeholder: "Select timeline" },
      { id: "additionalContext", label: "Additional Context",      type: "textarea",   required: false, placeholder: "Any other relevant information about the client's situation or goals" },
    ],
  },
  { id: 4, label: "Review & Generate", questions: [] },
  { id: 5, label: "Send",             questions: [] },
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
