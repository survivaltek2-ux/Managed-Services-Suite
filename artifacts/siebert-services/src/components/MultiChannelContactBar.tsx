import { useEffect, useState } from "react";
import { Phone, MessageSquare, Calendar } from "lucide-react";
import { BookingModal } from "./Booking";

interface Props {
  phone?: string;
  variant?: "sticky" | "inline";
}

export function MultiChannelContactBar({ phone = "866-484-9180", variant = "sticky" }: Props) {
  const [bookOpen, setBookOpen] = useState(false);

  const openChat = () => {
    window.dispatchEvent(new CustomEvent("siebert:open-chat"));
  };

  if (variant === "inline") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <a href={`tel:${phone.replace(/[^\d]/g, "")}`} className="flex items-center justify-center gap-2 h-12 rounded-xl bg-navy text-white font-semibold hover:bg-navy-light transition-colors">
          <Phone className="w-4 h-4" /> Call {phone}
        </a>
        <button onClick={openChat} className="flex items-center justify-center gap-2 h-12 rounded-xl bg-white text-navy border-2 border-navy/10 font-semibold hover:border-primary hover:text-primary transition-colors">
          <MessageSquare className="w-4 h-4" /> Chat with Zoom
        </button>
        <button onClick={() => setBookOpen(true)} className="flex items-center justify-center gap-2 h-12 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors">
          <Calendar className="w-4 h-4" /> Book a Call
        </button>
        {bookOpen && <BookingModal onClose={() => setBookOpen(false)} />}
      </div>
    );
  }

  return (
    <>
      {/* Mobile sticky bar — bottom of viewport */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-border shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
        <div className="grid grid-cols-3 divide-x divide-border">
          <a href={`tel:${phone.replace(/[^\d]/g, "")}`} className="flex flex-col items-center gap-0.5 py-2 text-navy hover:text-primary">
            <Phone className="w-4 h-4" />
            <span className="text-[10px] font-bold">Call</span>
          </a>
          <button onClick={openChat} className="flex flex-col items-center gap-0.5 py-2 text-navy hover:text-primary">
            <MessageSquare className="w-4 h-4" />
            <span className="text-[10px] font-bold">Chat</span>
          </button>
          <button onClick={() => setBookOpen(true)} className="flex flex-col items-center gap-0.5 py-2 text-primary">
            <Calendar className="w-4 h-4" />
            <span className="text-[10px] font-bold">Book</span>
          </button>
        </div>
      </div>

      {/* Desktop floating contact pill — bottom-right, three channels */}
      <div className="hidden lg:flex fixed bottom-6 right-6 z-40 flex-col gap-2 items-end">
        <div className="flex items-center gap-2 bg-white/95 backdrop-blur rounded-full shadow-2xl border border-border p-1.5">
          <a
            href={`tel:${phone.replace(/[^\d]/g, "")}`}
            className="flex items-center gap-2 px-3 py-2 rounded-full text-navy hover:bg-navy/5 text-sm font-semibold transition-colors"
            aria-label={`Call ${phone}`}
          >
            <Phone className="w-4 h-4 text-primary" />
            <span>{phone}</span>
          </a>
          <span className="w-px h-6 bg-border" aria-hidden="true" />
          <button
            onClick={openChat}
            className="flex items-center gap-2 px-3 py-2 rounded-full text-navy hover:bg-navy/5 text-sm font-semibold transition-colors"
            aria-label="Open Zoom chat"
          >
            <MessageSquare className="w-4 h-4 text-primary" />
            Zoom Chat
          </button>
          <span className="w-px h-6 bg-border" aria-hidden="true" />
          <button
            onClick={() => setBookOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            <Calendar className="w-4 h-4" />
            Book a Call
          </button>
        </div>
      </div>

      {bookOpen && <BookingModal onClose={() => setBookOpen(false)} />}
    </>
  );
}
