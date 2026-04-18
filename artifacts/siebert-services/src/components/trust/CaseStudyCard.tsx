import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui";

export interface CaseStudyMetric {
  label: string;
  value: string;
}

export interface CaseStudy {
  id: number;
  slug: string;
  title: string;
  client: string;
  industry: string;
  summary: string;
  problem?: string;
  solution?: string;
  result?: string;
  metrics?: CaseStudyMetric[];
  services?: string[];
  quote?: string | null;
  quoteAuthor?: string | null;
  quoteRole?: string | null;
  coverImage?: string | null;
  logoUrl?: string | null;
  featured?: boolean;
  active?: boolean;
  sortOrder?: number;
}

interface Props {
  caseStudy: CaseStudy;
  index?: number;
  variant?: "default" | "compact";
}

export function CaseStudyCard({ caseStudy: cs, index = 0, variant = "default" }: Props) {
  const compact = variant === "compact";
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
    >
      <Link href={`/case-studies/${cs.slug}`}>
        <Card className="group h-full border-none shadow-lg bg-white hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer overflow-hidden">
          {cs.coverImage && !compact && (
            <div className="aspect-[16/9] overflow-hidden bg-muted">
              <img src={cs.coverImage} alt={cs.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
          )}
          <CardContent className={compact ? "p-6" : "p-8"}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-primary/10 text-primary">
                Case Study
              </span>
              <span className="text-xs text-muted-foreground">{cs.industry}</span>
            </div>
            <h3 className={`font-bold text-navy mb-2 leading-snug ${compact ? "text-lg" : "text-xl"}`}>
              {cs.title}
            </h3>
            <p className="text-xs font-semibold text-muted-foreground mb-4 uppercase tracking-wide">{cs.client}</p>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5 line-clamp-3">{cs.summary}</p>

            {cs.metrics && cs.metrics.length > 0 && (
              <div className={`grid grid-cols-3 gap-2 py-4 border-y border-border/50 mb-4`}>
                {cs.metrics.slice(0, 3).map((m, i) => (
                  <div key={i} className="text-center">
                    <div className="flex items-center justify-center gap-1 text-primary font-display font-extrabold text-base">
                      {m.value}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wide leading-tight">{m.label}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between">
              {cs.services && cs.services.length > 0 ? (
                <span className="text-xs text-muted-foreground truncate max-w-[60%]">{cs.services.slice(0, 2).join(" · ")}</span>
              ) : <span />}
              <span className="inline-flex items-center gap-1 text-primary text-sm font-semibold group-hover:gap-2 transition-all">
                Read story <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

export default CaseStudyCard;
