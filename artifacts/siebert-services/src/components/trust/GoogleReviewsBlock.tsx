import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui";

interface Review {
  author: string;
  avatar?: string;
  rating: number;
  text: string;
  relativeTime: string;
}

interface Payload {
  configured: boolean;
  name?: string;
  rating: number | null;
  total: number;
  url?: string | null;
  reviews: Review[];
}

interface Props {
  title?: string;
  subtitle?: string;
  className?: string;
}

export function GoogleReviewsBlock({
  title = "Reviewed by clients on Google",
  subtitle = "We're proud of what our clients say. See live reviews on our Google Business profile.",
  className = "",
}: Props) {
  const [data, setData] = useState<Payload | null>(null);

  useEffect(() => {
    fetch("/api/cms/google-reviews")
      .then(r => (r.ok ? r.json() : null))
      .then(setData)
      .catch(() => setData(null));
  }, []);

  const reviews = data?.reviews ?? [];
  const rating = data?.rating ?? null;
  const total = data?.total ?? 0;
  const live = !!data?.configured && reviews.length > 0;

  // Only render when we have real, live Google reviews. We do NOT show
  // placeholder or fabricated testimonials in this block.
  if (!live) return null;

  return (
    <section className={`py-24 bg-background ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white shadow-md border border-border/50 mb-5">
            <GoogleG />
            <span className="font-bold text-navy">Google</span>
            {rating !== null && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-bold text-navy">{rating.toFixed(1)}</span>
              </div>
            )}
            <span className="text-xs text-muted-foreground">({total} reviews)</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-navy mb-4">{title}</h2>
          <p className="text-lg text-muted-foreground">{subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {reviews.slice(0, 4).map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
            >
              <Card className="h-full border-border/50 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-3">
                    {r.avatar ? (
                      <img src={r.avatar} alt={r.author} className="w-10 h-10 rounded-full" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-navy text-white flex items-center justify-center font-bold text-sm">
                        {r.author.split(" ").map(n => n[0]).slice(0, 2).join("")}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-navy text-sm truncate">{r.author}</p>
                      <p className="text-xs text-muted-foreground">{r.relativeTime}</p>
                    </div>
                    <GoogleG small />
                  </div>
                  <div className="flex gap-0.5 mb-3">
                    {Array.from({ length: 5 }).map((_, n) => (
                      <Star key={n} className={`w-3.5 h-3.5 ${n < r.rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"}`} />
                    ))}
                  </div>
                  <p className="text-sm text-foreground/90 leading-relaxed line-clamp-6 flex-1">{r.text}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 text-center text-xs text-muted-foreground">
          <a href={data?.url || "#"} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-navy">
            View all reviews on Google <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </section>
  );
}

function GoogleG({ small }: { small?: boolean }) {
  const size = small ? 14 : 18;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#34A853" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#EA4335" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}

export default GoogleReviewsBlock;
