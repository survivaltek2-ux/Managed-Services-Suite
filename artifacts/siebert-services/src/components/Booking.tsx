import { useEffect, useState } from "react";
import { Calendar, ExternalLink, X } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui";
import { cn } from "@/lib/utils";

const DEFAULT_BOOKING_URL = "https://siebertrservices.zoom.us/zbook/sales-lmo817/sales";

let cachedUrl: string | null = null;
let pendingFetch: Promise<string> | null = null;

async function loadBookingUrl(): Promise<string> {
  if (cachedUrl) return cachedUrl;
  if (pendingFetch) return pendingFetch;
  pendingFetch = fetch("/api/cms/settings")
    .then((r) => (r.ok ? r.json() : {}))
    .then((s: Record<string, string>) => {
      const raw = s.booking_url || DEFAULT_BOOKING_URL;
      cachedUrl = raw.replace(/[?&]embed=true/g, "");
      return cachedUrl;
    })
    .catch(() => {
      cachedUrl = DEFAULT_BOOKING_URL;
      return cachedUrl;
    })
    .finally(() => {
      pendingFetch = null;
    });
  return pendingFetch;
}

export function useBookingUrl() {
  const [url, setUrl] = useState<string>(cachedUrl ?? DEFAULT_BOOKING_URL);
  useEffect(() => {
    loadBookingUrl().then(setUrl);
  }, []);
  return url;
}

const IFRAME_ALLOW =
  "payment; clipboard-write; camera; microphone; fullscreen; geolocation";

interface BookingButtonProps extends Omit<ButtonProps, "onClick"> {
  label?: string;
  showIcon?: boolean;
}

export function BookingButton({
  label = "Book a Call",
  showIcon = true,
  className,
  ...rest
}: BookingButtonProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        type="button"
        onClick={() => setOpen(true)}
        className={cn("gap-2", className)}
        {...rest}
      >
        {showIcon && <Calendar className="w-4 h-4" />}
        {label}
      </Button>
      {open && <BookingModal onClose={() => setOpen(false)} />}
    </>
  );
}

export function BookingModal({ onClose }: { onClose: () => void }) {
  const base = useBookingUrl();
  const embedUrl = `${base}?embed=true`;

  useEffect(() => {
    const orig = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = orig;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden"
        style={{ height: "min(90vh, 820px)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close booking"
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 hover:bg-white shadow flex items-center justify-center text-navy"
        >
          <X className="w-5 h-5" />
        </button>

        {/* External fallback */}
        <a
          href={base}
          target="_blank"
          rel="noreferrer"
          className="absolute top-3 left-3 z-10 inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-2 text-xs font-semibold text-navy shadow hover:bg-white"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Open in new tab
        </a>

        <iframe
          src={embedUrl}
          title="Schedule a call"
          className="w-full h-full border-0 block"
          allow={IFRAME_ALLOW}
          allowFullScreen
          loading="eager"
        />
      </div>
    </div>
  );
}

export function BookingInline({ height = 820 }: { height?: number }) {
  const base = useBookingUrl();
  const embedUrl = `${base}?embed=true`;

  return (
    <div className="rounded-2xl overflow-hidden border border-border shadow-lg bg-white relative">
      <a
        href={base}
        target="_blank"
        rel="noreferrer"
        className="absolute top-3 right-3 z-10 inline-flex items-center gap-1 rounded-full bg-white/80 border border-border px-3 py-1.5 text-xs font-semibold text-navy shadow hover:bg-white"
      >
        <ExternalLink className="w-3 h-3" />
        Open in new tab
      </a>
      <iframe
        src={embedUrl}
        title="Schedule a call"
        className="w-full border-0 block"
        style={{ height }}
        allow={IFRAME_ALLOW}
        allowFullScreen
        loading="eager"
      />
    </div>
  );
}
