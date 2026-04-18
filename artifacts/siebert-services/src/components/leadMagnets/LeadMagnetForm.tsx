import { useState } from "react";
import { useLocation } from "wouter";
import { Loader2, ShieldCheck, Mail, Building, User, Phone } from "lucide-react";
import { Input, Label, Button } from "@/components/ui";
import { useToast } from "@/hooks/use-toast";
import type { LeadMagnet } from "./leadMagnets";

interface Props {
  magnet: LeadMagnet;
  payload?: Record<string, any>;
  source?: string;
  /** Render extra fields above the contact fields */
  beforeContact?: React.ReactNode;
  /** Override default success behavior */
  onSuccess?: (data: any) => void;
  /** Custom CTA copy (else uses magnet.cta) */
  cta?: string;
  /** Require company / phone fields (default: company yes, phone optional) */
  requireCompany?: boolean;
}

export function LeadMagnetForm({
  magnet,
  payload = {},
  source,
  beforeContact,
  onSuccess,
  cta,
  requireCompany = true,
}: Props) {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || (requireCompany && !company.trim())) {
      toast({ variant: "destructive", title: "Missing info", description: "Please fill in the required fields." });
      return;
    }
    setSubmitting(true);
    try {
      const resp = await fetch("/api/lead-magnets/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          magnet: magnet.key,
          name: name.trim(),
          email: email.trim(),
          company: company.trim() || null,
          phone: phone.trim() || null,
          payload,
          source: source || null,
        }),
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.message || "Submission failed");
      }
      const data = await resp.json();
      if (onSuccess) {
        onSuccess(data);
      } else {
        navigate(`/resources/${magnet.slug}/thanks`);
      }
    } catch (err: any) {
      toast({ variant: "destructive", title: "Something went wrong", description: err.message || "Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {beforeContact}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-sm"><User className="w-4 h-4 text-muted-foreground" /> Full name *</Label>
          <Input required value={name} onChange={e => setName(e.target.value)} placeholder="Jane Smith" />
        </div>
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-sm"><Mail className="w-4 h-4 text-muted-foreground" /> Work email *</Label>
          <Input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jane@company.com" />
        </div>
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-sm"><Building className="w-4 h-4 text-muted-foreground" /> Company {requireCompany ? "*" : ""}</Label>
          <Input required={requireCompany} value={company} onChange={e => setCompany(e.target.value)} placeholder="Acme Corp" />
        </div>
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-sm"><Phone className="w-4 h-4 text-muted-foreground" /> Phone (optional)</Label>
          <Input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(555) 000-0000" />
        </div>
      </div>

      <Button type="submit" size="lg" className="w-full gap-2" disabled={submitting}>
        {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : cta || magnet.cta}
      </Button>

      <p className="text-xs text-muted-foreground flex items-center gap-1.5 justify-center">
        <ShieldCheck className="w-3.5 h-3.5" />
        We respect your inbox. Unsubscribe anytime.
      </p>
    </form>
  );
}
