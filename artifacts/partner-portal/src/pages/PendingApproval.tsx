import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Clock, CheckCircle2, Mail, Phone, Building2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function PendingApproval() {
  const [, setLocation] = useLocation();
  const { user, isLoading } = useAuth();

  const params = new URLSearchParams(window.location.search);
  const companyParam = params.get("company") || "";
  const emailParam = params.get("email") || "";

  const displayCompany = companyParam || user?.companyName || "";
  const displayEmail = emailParam || user?.email || "";

  useEffect(() => {
    if (!isLoading && user && user.status !== "pending") {
      setLocation("/dashboard");
    }
  }, [user, isLoading, setLocation]);

  return (
    <PublicLayout>
      <div className="flex-1 flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-900 min-h-[70vh]">
        <div className="w-full max-w-lg bg-card border border-border shadow-xl rounded-3xl p-8 text-center">

          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 p-4 rounded-2xl">
                <Clock className="w-10 h-10" />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          <h1 className="text-2xl font-display font-bold text-foreground mb-2">
            Application Received
          </h1>
          <p className="text-muted-foreground mb-6">
            Thank you for registering with the Siebert Services Partner Program.
            Your application is currently under review.
          </p>

          {(displayCompany || displayEmail) && (
            <div className="bg-slate-50 dark:bg-slate-800/50 border border-border rounded-2xl p-5 mb-6 text-left space-y-3">
              {displayCompany && (
                <div className="flex items-center gap-3">
                  <Building2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Company</p>
                    <p className="text-sm font-semibold text-foreground">{displayCompany}</p>
                  </div>
                </div>
              )}
              {displayEmail && (
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Email</p>
                    <p className="text-sm font-semibold text-foreground">{displayEmail}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 mb-6 text-left">
            <h2 className="text-sm font-semibold text-foreground mb-3">What happens next?</h2>
            <ol className="space-y-2 text-sm text-muted-foreground list-none">
              <li className="flex items-start gap-2">
                <span className="bg-primary/20 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                Our team reviews your company profile and registration details.
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-primary/20 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                You'll receive an email notification once your account is approved.
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-primary/20 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                After approval, sign in to access your partner dashboard and start submitting deals.
              </li>
            </ol>
          </div>

          <div className="border-t border-border pt-5">
            <p className="text-sm text-muted-foreground mb-3">
              Questions about your application? Contact our partner team:
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="mailto:partners@siebertservices.com"
                className="flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
              >
                <Mail className="w-4 h-4" />
                partners@siebertservices.com
              </a>
              <span className="hidden sm:block text-border">|</span>
              <a
                href="tel:+13477808790"
                className="flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
              >
                <Phone className="w-4 h-4" />
                (347) 780-8790
              </a>
            </div>
          </div>

        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          Already approved?{" "}
          <Link href="/login" className="text-primary font-semibold hover:underline">
            Sign in here
          </Link>
        </p>
      </div>
    </PublicLayout>
  );
}
