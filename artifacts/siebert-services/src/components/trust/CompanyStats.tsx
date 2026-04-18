import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";

interface Stat {
  id: number;
  label: string;
  value: string;
  suffix?: string | null;
  icon: string;
}

interface Props {
  title?: string;
  className?: string;
  variant?: "navy" | "light";
}

export function CompanyStats({ title, className = "", variant = "navy" }: Props) {
  const [items, setItems] = useState<Stat[]>([]);

  useEffect(() => {
    fetch("/api/cms/company-stats")
      .then(r => (r.ok ? r.json() : []))
      .then(setItems)
      .catch(() => setItems([]));
  }, []);

  if (items.length === 0) return null;

  const isNavy = variant === "navy";
  const sectionClass = isNavy
    ? "bg-navy text-white"
    : "bg-background";

  return (
    <section className={`py-20 ${sectionClass} ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {title && (
          <h2 className={`text-center text-3xl md:text-4xl font-display font-bold mb-12 ${isNavy ? "text-white" : "text-navy"}`}>
            {title}
          </h2>
        )}
        <div className={`grid grid-cols-2 md:grid-cols-3 ${items.length >= 6 ? "lg:grid-cols-6" : `lg:grid-cols-${items.length}`} gap-6`}>
          {items.map((s, i) => {
            const IconComp = (Icons as any)[s.icon] || Icons.TrendingUp;
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="text-center"
              >
                <div className={`inline-flex w-12 h-12 rounded-xl items-center justify-center mb-3 ${isNavy ? "bg-white/10 text-primary" : "bg-primary/10 text-primary"}`}>
                  <IconComp className="w-5 h-5" />
                </div>
                <div className={`text-3xl md:text-4xl font-display font-extrabold tracking-tight ${isNavy ? "text-white" : "text-navy"}`}>
                  {s.value}
                  {s.suffix && <span className={isNavy ? "text-primary" : "text-primary"}>{s.suffix}</span>}
                </div>
                <p className={`mt-2 text-sm ${isNavy ? "text-white/70" : "text-muted-foreground"}`}>{s.label}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default CompanyStats;
