import { useEffect, useState } from "react";
import { Link } from "wouter";
import { X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui";
import { LEAD_MAGNETS } from "./leadMagnets";

const STORAGE_KEY = "ss_exit_magnet_dismissed_v1";

interface Props {
  /** Optional override of magnet slug shown */
  magnetSlug?: keyof typeof LEAD_MAGNETS;
}

export function ExitIntentPopup({ magnetSlug = "buyers-guide" }: Props) {
  const magnet = LEAD_MAGNETS[magnetSlug];
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(STORAGE_KEY)) return;

    let triggered = false;
    const trigger = () => {
      if (triggered) return;
      triggered = true;
      setOpen(true);
    };
    const onMouseLeave = (e: MouseEvent) => {
      // Mouse moved to top of viewport (likely heading to tab/close)
      if (e.clientY <= 0) trigger();
    };
    // Mobile fallback: trigger after 45s if user is still around but inactive
    const timer = window.setTimeout(trigger, 45_000);

    document.addEventListener("mouseleave", onMouseLeave);
    return () => {
      document.removeEventListener("mouseleave", onMouseLeave);
      window.clearTimeout(timer);
    };
  }, []);

  function dismiss() {
    setOpen(false);
    try { localStorage.setItem(STORAGE_KEY, String(Date.now())); } catch {}
  }

  if (!open) return null;
  const Icon = magnet.icon;

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 animate-in fade-in" onClick={dismiss}>
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden relative animate-in zoom-in-95"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-gray-100 text-muted-foreground"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="bg-navy text-white px-7 pt-7 pb-5">
          <div className={`w-14 h-14 rounded-xl ${magnet.bg} ${magnet.color} flex items-center justify-center mb-3`}>
            <Icon className="w-7 h-7" />
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-primary mb-1">Wait — before you go</p>
          <h3 className="text-2xl font-display font-bold leading-snug">{magnet.title}</h3>
        </div>
        <div className="px-7 py-6">
          <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{magnet.description}</p>
          <Link href={`/resources/${magnet.slug}?source=exit_intent`}>
            <Button size="lg" className="w-full gap-2" onClick={() => setOpen(false)}>
              {magnet.cta} <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <button
            onClick={dismiss}
            className="block w-full text-center text-xs text-muted-foreground mt-3 hover:underline"
          >
            No thanks, I'll keep browsing
          </button>
        </div>
      </div>
    </div>
  );
}
