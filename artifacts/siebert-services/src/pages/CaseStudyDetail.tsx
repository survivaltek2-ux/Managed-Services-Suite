import { useEffect, useState } from "react";
import { Link, useRoute } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, Quote as QuoteIcon, Loader2 } from "lucide-react";
import { Button, Card, CardContent } from "@/components/ui";
import { CaseStudyCard, GoogleReviewsBlock, type CaseStudy } from "@/components/trust";

export default function CaseStudyDetail() {
  const [, params] = useRoute<{ slug: string }>("/case-studies/:slug");
  const slug = params?.slug;
  const [cs, setCs] = useState<CaseStudy | null>(null);
  const [related, setRelated] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true); setNotFound(false);
    fetch(`/api/cms/case-studies/${slug}`)
      .then(async r => {
        if (r.status === 404) { setNotFound(true); return null; }
        return r.ok ? r.json() : null;
      })
      .then((d) => { if (d) setCs(d); })
      .finally(() => setLoading(false));

    fetch("/api/cms/case-studies")
      .then(r => (r.ok ? r.json() : []))
      .then((all: CaseStudy[]) => setRelated(all.filter(c => c.slug !== slug).slice(0, 3)));
  }, [slug]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }
  if (notFound || !cs) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <h1 className="text-3xl font-bold text-navy mb-3">Case study not found</h1>
        <Link href="/case-studies"><Button variant="outline">Back to all case studies</Button></Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <section className="relative pt-32 pb-16 lg:pt-40 lg:pb-20 bg-navy overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Link href="/case-studies" className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-6">
            <ArrowLeft className="w-4 h-4" /> All case studies
          </Link>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-primary/15 text-primary border border-primary/30">Case Study</span>
              <span className="text-sm text-white/60">{cs.industry}</span>
              <span className="text-white/30">·</span>
              <span className="text-sm font-semibold text-white/80">{cs.client}</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-display font-extrabold text-white leading-[1.15] mb-6 tracking-tight">
              {cs.title}
            </h1>
            <p className="text-xl text-white/80 leading-relaxed max-w-3xl">{cs.summary}</p>
          </motion.div>
        </div>
      </section>

      {cs.metrics && cs.metrics.length > 0 && (
        <section className="bg-white border-b border-border/50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {cs.metrics.map((m, i) => (
                <div key={i} className="text-center p-6 rounded-2xl bg-primary/5 border border-primary/10">
                  <div className="text-4xl font-display font-extrabold text-primary tracking-tight">{m.value}</div>
                  <p className="text-sm text-muted-foreground mt-2 font-medium">{m.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-20 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {cs.problem && <Block heading="The problem" body={cs.problem} />}
          {cs.solution && <Block heading="What we did" body={cs.solution} />}
          {cs.result && <Block heading="The result" body={cs.result} />}

          {cs.services && cs.services.length > 0 && (
            <Card className="border-none shadow-md">
              <CardContent className="p-6">
                <h4 className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-3">Services delivered</h4>
                <div className="flex flex-wrap gap-2">
                  {cs.services.map((s, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {s}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {cs.quote && (
            <Card className="border-none shadow-xl bg-navy text-white">
              <CardContent className="p-8 md:p-10">
                <QuoteIcon className="w-10 h-10 text-primary mb-4" />
                <p className="text-xl md:text-2xl font-display leading-relaxed mb-6">"{cs.quote}"</p>
                {(cs.quoteAuthor || cs.quoteRole) && (
                  <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                    <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
                      {cs.quoteAuthor
                        ? cs.quoteAuthor.split(" ").map(n => n[0]).slice(0, 2).join("")
                        : "—"}
                    </div>
                    <div>
                      {cs.quoteAuthor && <p className="font-bold text-white">{cs.quoteAuthor}</p>}
                      {cs.quoteRole && <p className="text-xs text-white/60">{cs.quoteRole}</p>}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {related.length > 0 && (
        <section className="py-20 bg-primary/5 border-y border-primary/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-navy mb-8 text-center">More client outcomes</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((r, i) => <CaseStudyCard key={r.id} caseStudy={r} index={i} variant="compact" />)}
            </div>
          </div>
        </section>
      )}

      <GoogleReviewsBlock />

      <section className="py-20 bg-navy text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Want results like these?</h2>
          <p className="text-lg text-white/80 mb-8">Tell us about your environment. We'll scope a fixed-price assessment in 48 hours.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/quote"><Button size="lg" className="gap-2">Get a Custom Quote <ArrowRight className="w-5 h-5" /></Button></Link>
            <Link href="/contact"><Button variant="outline" size="lg" className="bg-transparent border-white/20 text-white hover:bg-white/10">Talk to an Engineer</Button></Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function Block({ heading, body }: { heading: string; body: string }) {
  return (
    <div>
      <h3 className="text-xs uppercase tracking-widest text-primary font-bold mb-3">{heading}</h3>
      <div className="prose prose-lg max-w-none text-foreground/90 leading-relaxed whitespace-pre-line">{body}</div>
    </div>
  );
}
