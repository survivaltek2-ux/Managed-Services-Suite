import { useEffect, useRef, useState } from "react";
import { Calendar, ExternalLink, X } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui";
import { cn } from "@/lib/utils";

const DEFAULT_BOOKING_BASE = "https://siebertrservices.zoom.us/zbook/sales-lmo817/sales";

let cachedBase: string | null = null;
let pendingFetch: Promise<string> | null = null;

/** Returns the base URL (no embed flag) — the embed flag is appended where needed. */
async function loadBookingBase(): Promise<string> {
  if (cachedBase) return cachedBase;
  if (pendingFetch) return pendingFetch;
  pendingFetch = fetch("/api/cms/settings")
    .then((r) => (r.ok ? r.json() : {}))
    .then((s: Record<string, string>) => {
      const raw = s.booking_url || DEFAULT_BOOKING_BASE;
      cachedBase = raw.replace(/[?&]embed=true/g, "").replace(/\?$/, "");
      return cachedBase!;
    })
    .catch(() => {
      cachedBase = DEFAULT_BOOKING_BASE;
      return cachedBase!;
    })
    .finally(() => {
      pendingFetch = null;
    });
  return pendingFetch;
}

function useBookingBase() {
  const [base, setBase] = useState<string>(cachedBase ?? DEFAULT_BOOKING_BASE);
  useEffect(() => {
    loadBookingBase().then(setBase);
  }, []);
  return base;
}

/** Returns the plain Zoom booking URL (no embed flag) for opening in a new tab. */
export function useBookingUrl() {
  return useBookingBase();
}

const IFRAME_ALLOW =
  "payment; clipboard-write; camera; microphone; fullscreen; geolocation";

// ---------------------------------------------------------------------------
// Button
// ---------------------------------------------------------------------------
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
  const base = useBookingBase();
  return (
    <Button
      type="button"
      onClick={() => window.open(base, "_blank", "noopener,noreferrer")}
      className={cn("gap-2", className)}
      {...rest}
    >
      {showIcon && <Calendar className="w-4 h-4" />}
      {label}
    </Button>
  );
}

// ---------------------------------------------------------------------------
// Modal — near-fullscreen so every step has room
// ---------------------------------------------------------------------------
export function BookingModal({ onClose }: { onClose: () => void }) {
  const base = useBookingBase();
  const embedUrl = `${base}?embed=true`;

  useEffect(() => {
    const orig = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = orig;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl flex flex-col w-full"
        style={{ height: "calc(100vh - 32px)", maxWidth: 1000, maxHeight: 920 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close booking"
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 hover:bg-white shadow flex items-center justify-center text-navy"
        >
          <X className="w-5 h-5" />
        </button>
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
          key={embedUrl}
          src={embedUrl}
          title="Schedule a call"
          className="w-full flex-1 border-0 rounded-2xl"
          allow={IFRAME_ALLOW}
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
          loading="eager"
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Inline — auto-expands height via postMessage from Zoom
// ---------------------------------------------------------------------------
const MIN_HEIGHT = 700;
const DEFAULT_HEIGHT = 900;

export function BookingInline({ height }: { height?: number }) {
  const base = useBookingBase();
  const embedUrl = `${base}?embed=true`;
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeHeight, setIframeHeight] = useState(height ?? DEFAULT_HEIGHT);

  // Listen for resize postMessages from Zoom's embed
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (!iframeRef.current) return;
      // Zoom sends {type:"resize",height:N} or {event:"resize",height:N}
      try {
        const d = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
        const h = d?.height ?? d?.data?.height;
        if (typeof h === "number" && h > MIN_HEIGHT) {
          setIframeHeight(Math.max(h + 40, MIN_HEIGHT));
        }
      } catch {
        // ignore non-JSON messages
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  return (
    <div ref={containerRef} className="rounded-2xl border border-border shadow-lg bg-white relative">
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
        ref={iframeRef}
        key={embedUrl}
        src={embedUrl}
        title="Schedule a call"
        className="w-full border-0 block rounded-2xl"
        style={{ height: iframeHeight }}
        allow={IFRAME_ALLOW}
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
        loading="eager"
      />
    </div>
  );
}
