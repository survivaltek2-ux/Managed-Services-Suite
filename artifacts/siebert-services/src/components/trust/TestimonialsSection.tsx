import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui";

interface Testimonial {
  id: number;
  name: string;
  company: string;
  role?: string | null;
  content: string;
  rating: number;
}

interface Props {
  title?: string;
  subtitle?: string;
  limit?: number;
  className?: string;
  background?: "light" | "muted" | "navy";
}

export function TestimonialsSection({
  title = "What our clients say",
  subtitle = "Real outcomes from businesses that trust Siebert as their hybrid MSP partner.",
  limit,
  className = "",
  background = "light",
}: Props) {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/cms/testimonials")
      .then(r => (r.ok ? r.json() : []))
      .then((d: Testimonial[]) => {
        const sorted = [...d].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        setItems(limit ? sorted.slice(0, limit) : sorted);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [limit]);

  if (loading || items.length === 0) return null;

  const bgClasses =
    background === "navy"
      ? "bg-navy text-white"
      : background === "muted"
      ? "bg-primary/5 border-y border-primary/10"
      : "bg-background";
  const titleColor = background === "navy" ? "text-white" : "text-navy";
  const subColor = background === "navy" ? "text-white/70" : "text-muted-foreground";

  return (
    <section className={`py-24 ${bgClasses} ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className={`text-3xl md:text-4xl font-display font-bold mb-4 ${titleColor}`}>{title}</h2>
          <p className={`text-lg ${subColor}`}>{subtitle}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Card className="h-full border-none shadow-lg bg-white hover:shadow-xl hover:-translate-y-1 transition-all">
                <CardContent className="p-7 flex flex-col h-full">
                  <Quote className="w-7 h-7 text-primary/30 mb-3" />
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: 5 }).map((_, n) => (
                      <Star
                        key={n}
                        className={`w-4 h-4 ${n < (t.rating ?? 5) ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"}`}
                      />
                    ))}
                  </div>
                  <p className="text-foreground leading-relaxed mb-6 flex-1">"{t.content}"</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-navy text-white flex items-center justify-center font-bold text-sm shrink-0">
                      {t.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-navy truncate">{t.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {t.role ? `${t.role}, ` : ""}{t.company}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TestimonialsSection;
