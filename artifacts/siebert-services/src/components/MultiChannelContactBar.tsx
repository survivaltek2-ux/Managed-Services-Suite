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
    // Try common chat widget triggers (existing AI ChatWidget button + Zoom widget)
    const aiBtn = document.querySelector<HTMLButtonElement>('button[aria-label="Open AI chat"]');
    if (aiBtn) {
      aiBtn.click();
      return;
    }
    // Fallback: scroll to a chat anchor or do nothing
    window.dispatchEvent(new CustomEvent("siebert:open-chat"));
  };

  if (variant === "inline") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <a href={`tel:${phone.replace(/[^\d]/g, "")}`} className="flex items-center justify-center gap-2 h-12 rounded-xl bg-navy text-white font-semibold hover:bg-navy-light transition-colors">
          <Phone className="w-4 h-4" /> Call {phone}
        </a>
        <button onClick={openChat} className="flex items-center justify-center gap-2 h-12 rounded-xl bg-white text-navy border-2 border-navy/10 font-semibold hover:border-primary hover:text-primary transition-colors">
          <MessageSquare className="w-4 h-4" /> Chat with us
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
      {/* Mobile sticky bar — bottom of viewport, hidden on lg */}
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
      {bookOpen && <BookingModal onClose={() => setBookOpen(false)} />}
    </>
  );
}
