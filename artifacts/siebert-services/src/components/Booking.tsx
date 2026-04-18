import { useEffect, useState } from "react";
import { Calendar, X } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui";
import { cn } from "@/lib/utils";

const DEFAULT_BOOKING_URL = "https://siebertrservices.zoom.us/zbook/sales-lmo817";

let cachedUrl: string | null = null;
let pendingFetch: Promise<string> | null = null;

async function loadBookingUrl(): Promise<string> {
  if (cachedUrl) return cachedUrl;
  if (pendingFetch) return pendingFetch;
  pendingFetch = fetch("/api/cms/settings")
    .then((r) => (r.ok ? r.json() : {}))
    .then((s: Record<string, string>) => {
      cachedUrl = s.booking_url || DEFAULT_BOOKING_URL;
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
    if (!cachedUrl) loadBookingUrl().then(setUrl);
  }, []);
  return url;
}

interface BookingButtonProps extends Omit<ButtonProps, "onClick"> {
  label?: string;
  showIcon?: boolean;
}

export function BookingButton({ label = "Book a Call", showIcon = true, className, ...rest }: BookingButtonProps) {
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close booking"
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 hover:bg-white shadow flex items-center justify-center text-navy"
        >
          <X className="w-5 h-5" />
        </button>
        <iframe
          src={url}
          title="Schedule a call"
          className="w-full h-full border-0"
          loading="lazy"
        />
      </div>
    </div>
  );
}

export function BookingInline({ height = 700 }: { height?: number }) {
  const url = useBookingUrl();
  return (
    <div className="rounded-2xl overflow-hidden border border-border shadow-lg bg-white">
      <iframe
        src={url}
        title="Schedule a call"
        className="w-full border-0 block"
        style={{ height }}
        loading="lazy"
      />
    </div>
  );
}
