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
      // Strip any embed flag — we drive the full page to avoid token errors
      cachedUrl = raw.replace(/[?&]embed=true/g, "").replace(/\?$/, "");
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
  const url = useBookingUrl();

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
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl flex flex-col"
        style={{ width: "min(96vw, 1000px)", height: "min(96vh, 900px)" }}
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

        {/* External link */}
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="absolute top-3 left-3 z-10 inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-2 text-xs font-semibold text-navy shadow hover:bg-white"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Open in new tab
        </a>

        <iframe
          src={url}
          title="Schedule a call"
          className="w-full flex-1 border-0 block rounded-2xl"
          allow={IFRAME_ALLOW}
          allowFullScreen
          loading="eager"
        />
      </div>
    </div>
  );
}

export function BookingInline({ height = 1200 }: { height?: number }) {
  const url = useBookingUrl();

  return (
    <div className="rounded-2xl border border-border shadow-lg bg-white relative">
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="absolute top-3 right-3 z-10 inline-flex items-center gap-1 rounded-full bg-white/80 border border-border px-3 py-1.5 text-xs font-semibold text-navy shadow hover:bg-white"
      >
        <ExternalLink className="w-3 h-3" />
        Open in new tab
      </a>
      <iframe
        src={url}
        title="Schedule a call"
        className="w-full border-0 block rounded-2xl"
        style={{ height }}
        allow={IFRAME_ALLOW}
        allowFullScreen
        loading="eager"
      />
    </div>
  );
}
