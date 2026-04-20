import { useEffect, useState } from "react";
import { useSearch, useLocation } from "wouter";
import { CheckCircle, ArrowRight, Phone, Mail, Calendar } from "lucide-react";
import { Button } from "@/components/ui";

export default function Welcome() {
  const search = useSearch();
  const [, setLocation] = useLocation();
  const params = new URLSearchParams(search);
  const plan = params.get("plan") || "";
  const sessionId = params.get("session_id");
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (sessionId) {
      setConfirmed(true);
    }
  }, [sessionId]);

  const planNames: Record<string, string> = {
    essentials: "Essentials",
    business: "Business",
    enterprise: "Enterprise",
  };

  const planName = planNames[plan.toLowerCase()] || plan || "your plan";

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hero */}
      <section className="relative pt-32 pb-20 bg-navy overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:24px_24px]" />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-extrabold text-white leading-tight mb-4">
            Welcome aboard!
          </h1>
          <p className="text-xl text-white/80 mb-2">
            You've subscribed to the <span className="text-primary font-bold">{planName}</span> plan.
          </p>
          {confirmed && (
            <p className="text-white/60 text-sm">
              Your payment was confirmed. You'll receive a receipt at your email shortly.
            </p>
          )}
        </div>
      </section>

      {/* Next steps */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center mb-10">What happens next?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: "1",
                icon: Mail,
                title: "Check your email",
                desc: "We'll send you a welcome email with your account details, onboarding checklist, and next steps within 24 hours.",
              },
              {
                step: "2",
                icon: Phone,
                title: "Onboarding call",
                desc: "Our team will reach out to schedule a kickoff call to understand your environment and begin setup.",
              },
              {
                step: "3",
                icon: Calendar,
                title: "Go live",
                desc: "Monitoring, security, and support services are typically fully active within 5–10 business days.",
              },
            ].map(item => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="flex flex-col items-center text-center p-6 rounded-xl border border-border bg-card">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-xs font-bold uppercase tracking-wider text-primary mb-1">Step {item.step}</div>
                  <h3 className="text-base font-bold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-12 text-center space-y-4">
            <p className="text-muted-foreground">Have questions? We're here to help.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button onClick={() => setLocation("/contact")} className="gap-2">
                <Phone className="w-4 h-4" /> Contact Us
              </Button>
              <Button variant="outline" onClick={() => setLocation("/")} className="gap-2">
                <ArrowRight className="w-4 h-4" /> Back to Home
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
