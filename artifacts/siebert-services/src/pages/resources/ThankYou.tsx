import { Link, useRoute } from "wouter";
import { motion } from "framer-motion";
import { CheckCircle2, Mail, Calendar, ArrowRight } from "lucide-react";
import { Card, CardContent, Button } from "@/components/ui";
import { LEAD_MAGNETS, type LeadMagnetSlug } from "@/components/leadMagnets";

export default function ResourceThankYou() {
  const [, params] = useRoute("/resources/:slug/thanks");
  const slug = (params?.slug || "buyers-guide") as LeadMagnetSlug;
  const magnet = LEAD_MAGNETS[slug] || LEAD_MAGNETS["buyers-guide"];
  const isPdf = slug === "hipaa-checklist" || slug === "buyers-guide";

  return (
    <div className="min-h-screen pt-28 pb-20 bg-gradient-to-b from-green-50/40 via-white to-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 text-green-700 rounded-full mb-4">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-navy mb-3">
              You're all set!
            </h1>
            <p className="text-lg text-muted-foreground">
              We just sent <span className="font-semibold text-navy">{magnet.shortTitle}</span> to your inbox.
            </p>
          </div>

          <Card className="border-none shadow-xl">
            <CardContent className="p-6 md:p-8 space-y-5">
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 bg-blue-50 text-blue-700 rounded-lg flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-navy">Check your inbox in the next few minutes</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {isPdf
                      ? "The email contains a link to your printable PDF — open it on any device, save it, or print it."
                      : "Your personalized report is on its way. If you don't see it, check your spam folder and add sales@siebertrservices.com to your safe-senders."}
                  </p>
                </div>
              </div>

              {isPdf && (
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 bg-amber-50 text-amber-700 rounded-lg flex items-center justify-center shrink-0">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-navy">Want it right now?</p>
                    <p className="text-sm text-muted-foreground mt-0.5 mb-3">Open the printable version directly:</p>
                    <Link href={`/resources/${slug}/download`}>
                      <Button variant="outline" className="gap-2">
                        Open the PDF <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              )}

              <div className="flex gap-4 items-start border-t pt-5">
                <div className="w-10 h-10 bg-purple-50 text-purple-700 rounded-lg flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-navy">Want a deeper conversation?</p>
                  <p className="text-sm text-muted-foreground mt-0.5 mb-3">
                    Book a free 30-minute consultation with a Siebert specialist — no pitch, just answers.
                  </p>
                  <Link href={`/contact?source=${magnet.key}_thankyou`}>
                    <Button className="gap-2">
                      Book my consultation <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-muted-foreground mt-8">
            <Link href="/" className="hover:underline text-primary font-semibold">← Back to homepage</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
