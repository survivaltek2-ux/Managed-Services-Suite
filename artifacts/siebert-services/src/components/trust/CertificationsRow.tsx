import { useEffect, useState } from "react";
import { Award } from "lucide-react";

interface Certification {
  id: number;
  name: string;
  category: string;
  logoUrl?: string | null;
  url?: string | null;
}

interface Props {
  title?: string;
  className?: string;
  variant?: "default" | "compact";
}

export function CertificationsRow({
  title = "Certified partners & accreditations",
  className = "",
  variant = "default",
}: Props) {
  const [items, setItems] = useState<Certification[]>([]);

  useEffect(() => {
    fetch("/api/cms/certifications")
      .then(r => (r.ok ? r.json() : []))
      .then(setItems)
      .catch(() => setItems([]));
  }, []);

  if (items.length === 0) return null;

  if (variant === "compact") {
    return (
      <div className={`py-6 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {items.map(c => (
            <CertChip key={c.id} cert={c} compact />
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className={`py-16 bg-white border-y border-border/40 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {title && (
          <p className="text-center text-xs font-bold uppercase tracking-widest text-muted-foreground mb-8">
            {title}
          </p>
        )}
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
          {items.map(c => (
            <CertChip key={c.id} cert={c} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CertChip({ cert, compact }: { cert: Certification; compact?: boolean }) {
  const inner = cert.logoUrl ? (
    <img
      src={cert.logoUrl}
      alt={cert.name}
      className={compact ? "h-8 w-auto object-contain grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition" : "h-12 w-auto object-contain grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition"}
    />
  ) : (
    <span
      className={`inline-flex items-center gap-2 ${compact ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm"} rounded-full bg-primary/5 border border-primary/15 text-navy font-semibold`}
    >
      <Award className={compact ? "w-3.5 h-3.5 text-primary" : "w-4 h-4 text-primary"} />
      {cert.name}
    </span>
  );
  return cert.url ? (
    <a href={cert.url} target="_blank" rel="noreferrer" title={cert.name}>{inner}</a>
  ) : (
    <span title={cert.name}>{inner}</span>
  );
}

export default CertificationsRow;
