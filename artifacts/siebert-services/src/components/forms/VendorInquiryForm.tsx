import { useState } from "react";
import { motion } from "framer-motion";
import { Send, CheckCircle, Phone, Mail, Building2, User, ChevronDown } from "lucide-react";
import { useSubmitContact } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

export interface ExtraField {
  id: string;
  label: string;
  type: "text" | "select" | "number" | "tel";
  placeholder?: string;
  options?: string[];
  required?: boolean;
}

export interface VendorInquiryFormProps {
  vendorName: string;
  vendorSlug: string;
  accentColor: string;
  accentDark: string;
  services: string[];
  extraFields?: ExtraField[];
}

export function VendorInquiryForm({
  vendorName,
  vendorSlug,
  accentColor,
  accentDark,
  services,
  extraFields = [],
}: VendorInquiryFormProps) {
  const { toast } = useToast();
  const contactMutation = useSubmitContact();
  const [submitted, setSubmitted] = useState(false);

  const [fields, setFields] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: "",
  });

  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());
  const [extraValues, setExtraValues] = useState<Record<string, string>>({});

  const toggleService = (svc: string) => {
    setSelectedServices((prev) => {
      const next = new Set(prev);
      if (next.has(svc)) next.delete(svc);
      else next.add(svc);
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const servicesList = Array.from(selectedServices).join(", ") || "General inquiry";
    const extrasText = extraFields
      .filter((f) => extraValues[f.id])
      .map((f) => `${f.label}: ${extraValues[f.id]}`)
      .join("\n");

    const fullMessage = [
      `Vendor of Interest: ${vendorName}`,
      `Services Requested: ${servicesList}`,
      extrasText ? `\nAdditional Details:\n${extrasText}` : "",
      fields.message ? `\nMessage:\n${fields.message}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    try {
      await contactMutation.mutateAsync({
        data: {
          name: fields.name,
          email: fields.email,
          phone: fields.phone || undefined,
          company: fields.company || undefined,
          service: `${vendorName} Inquiry`,
          message: fullMessage,
        },
      });
      setSubmitted(true);
      toast({ title: "Inquiry sent!", description: "We'll follow up with a tailored quote within one business day." });
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to send. Please try again or call 866-484-9180." });
    }
  };

  if (submitted) {
    return (
      <motion.div
        className="rounded-2xl p-12 text-center flex flex-col items-center gap-5"
        style={{ background: `linear-gradient(135deg, ${accentDark} 0%, ${accentColor} 100%)` }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-white">Inquiry Received!</h3>
        <p className="text-white/80 text-lg max-w-md">
          Thank you! A Siebert Services specialist will review your {vendorName} inquiry and reach out within one business day with a customized quote.
        </p>
        <p className="text-white/60 text-sm">Need immediate help? Call us at 866-484-9180.</p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {/* Services Selection */}
      <div>
        <h4 className="font-bold text-foreground mb-1">Services of Interest</h4>
        <p className="text-sm text-muted-foreground mb-4">Select all that apply — we'll tailor the quote to your selection.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {services.map((svc) => {
            const isSelected = selectedServices.has(svc);
            return (
              <button
                key={svc}
                type="button"
                onClick={() => toggleService(svc)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-sm font-semibold text-left transition-all"
                style={{
                  borderColor: isSelected ? accentColor : undefined,
                  backgroundColor: isSelected ? `${accentColor}12` : undefined,
                  color: isSelected ? accentColor : undefined,
                }}
              >
                <div
                  className="w-4 h-4 rounded shrink-0 border-2 flex items-center justify-center transition-all"
                  style={{
                    borderColor: isSelected ? accentColor : "#d1d5db",
                    backgroundColor: isSelected ? accentColor : "transparent",
                  }}
                >
                  {isSelected && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                {svc}
              </button>
            );
          })}
        </div>
      </div>

      {/* Standard Fields */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">
            <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Full Name *</span>
          </label>
          <input
            type="text"
            required
            placeholder="Jane Smith"
            value={fields.name}
            onChange={(e) => setFields((f) => ({ ...f, name: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all text-sm"
            style={{ "--tw-ring-color": accentColor } as React.CSSProperties}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">
            <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" /> Company Name</span>
          </label>
          <input
            type="text"
            placeholder="Acme Corp"
            value={fields.company}
            onChange={(e) => setFields((f) => ({ ...f, company: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">
            <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Business Email *</span>
          </label>
          <input
            type="email"
            required
            placeholder="jane@company.com"
            value={fields.email}
            onChange={(e) => setFields((f) => ({ ...f, email: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">
            <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Phone Number</span>
          </label>
          <input
            type="tel"
            placeholder="(555) 555-5555"
            value={fields.phone}
            onChange={(e) => setFields((f) => ({ ...f, phone: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all text-sm"
          />
        </div>
      </div>

      {/* Extra Vendor-Specific Fields */}
      {extraFields.length > 0 && (
        <div>
          <h4 className="font-bold text-foreground mb-4">Additional Details</h4>
          <div className="grid sm:grid-cols-2 gap-4">
            {extraFields.map((field) => (
              <div key={field.id}>
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  {field.label}{field.required && " *"}
                </label>
                {field.type === "select" && field.options ? (
                  <div className="relative">
                    <select
                      required={field.required}
                      value={extraValues[field.id] ?? ""}
                      onChange={(e) => setExtraValues((v) => ({ ...v, [field.id]: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 transition-all text-sm appearance-none"
                    >
                      <option value="">Select…</option>
                      {field.options.map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                ) : (
                  <input
                    type={field.type}
                    required={field.required}
                    placeholder={field.placeholder ?? ""}
                    value={extraValues[field.id] ?? ""}
                    onChange={(e) => setExtraValues((v) => ({ ...v, [field.id]: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all text-sm"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Message */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-1.5">Additional Notes or Questions</label>
        <textarea
          rows={4}
          placeholder="Any specific requirements, current setup details, timeline, or questions…"
          value={fields.message}
          onChange={(e) => setFields((f) => ({ ...f, message: e.target.value }))}
          className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all text-sm resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={contactMutation.isPending}
        className="w-full py-4 rounded-xl font-bold text-white text-base flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-60"
        style={{ background: `linear-gradient(135deg, ${accentDark} 0%, ${accentColor} 100%)` }}
      >
        {contactMutation.isPending ? (
          <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Sending…</span>
        ) : (
          <span className="flex items-center gap-2"><Send className="w-4 h-4" /> Request a Quote from {vendorName}</span>
        )}
      </button>
      <p className="text-xs text-center text-muted-foreground">
        We typically respond within 1 business day. You can also reach us at <strong>866-484-9180</strong>.
      </p>
    </form>
  );
}
