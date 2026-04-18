import { useEffect, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui";
import { CaseStudyCard, CertificationsRow, CompanyStats, type CaseStudy } from "@/components/trust";

export default function CaseStudies() {
  const [items, setItems] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/cms/case-studies")
      .then(r => (r.ok ? r.json() : []))
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <section className="relative pt-32 pb-16 lg:pt-40 lg:pb-20 bg-navy overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-sm mb-6">
              Client Outcomes
            </div>
            <h1 className="text-5xl lg:text-6xl font-display font-extrabold text-white leading-[1.1] mb-6 tracking-tight">
              Real businesses. <br /><span className="text-gradient">Quantified results.</span>
            </h1>
            <p className="text-xl text-white/80 leading-relaxed max-w-2xl">
              Every engagement starts with a clear problem and ends with a measurable outcome. Here's how we help SMBs reduce IT spend, pass security audits, and standardize across multiple sites.
            </p>
          </motion.div>
        </div>
      </section>

      <CompanyStats variant="navy" className="!pt-12 !pb-20 -mt-1" />

      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : items.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">No case studies published yet. Check back soon.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {items.map((cs, i) => <CaseStudyCard key={cs.id} caseStudy={cs} index={i} />)}
            </div>
          )}
        </div>
      </section>

      <CertificationsRow />

      <section className="py-24 bg-primary/5 border-t border-primary/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-display font-bold text-navy mb-6">Ready to write the next one?</h2>
          <p className="text-xl text-muted-foreground mb-10">
            Tell us your toughest IT problem. We'll show you exactly how we'd solve it.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/quote">
              <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg gap-2">Get a Custom Quote <ArrowRight className="w-5 h-5" /></Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 text-lg">Talk to an Engineer</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
