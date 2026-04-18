import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui";
import type { LeadMagnet } from "./leadMagnets";

interface Props {
  magnet: LeadMagnet;
  variant?: "card" | "banner";
  source?: string;
}

export function LeadMagnetCTA({ magnet, variant = "card", source }: Props) {
  const Icon = magnet.icon;
  const href = `/resources/${magnet.slug}${source ? `?source=${encodeURIComponent(source)}` : ""}`;

  if (variant === "banner") {
    return (
      <div className="rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-6 md:p-7 flex flex-col md:flex-row md:items-center gap-5">
        <div className={`w-14 h-14 rounded-xl ${magnet.bg} ${magnet.color} flex items-center justify-center shrink-0`}>
          <Icon className="w-7 h-7" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-bold uppercase tracking-wider text-primary mb-1">Free resource</p>
          <h3 className="text-lg md:text-xl font-display font-bold text-navy leading-snug">{magnet.title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{magnet.description}</p>
        </div>
        <Link href={href}>
          <Button size="lg" className="gap-2 shrink-0">
            {magnet.cta} <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-white shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col h-full">
      <div className={`w-12 h-12 rounded-xl ${magnet.bg} ${magnet.color} flex items-center justify-center mb-4`}>
        <Icon className="w-6 h-6" />
      </div>
      <p className="text-xs font-bold uppercase tracking-wider text-primary mb-1">Free resource</p>
      <h3 className="text-lg font-display font-bold text-navy leading-snug">{magnet.shortTitle}</h3>
      <p className="text-sm text-muted-foreground mt-2 mb-5 flex-1">{magnet.description}</p>
      <Link href={href}>
        <Button variant="outline" className="gap-2 w-full">
          {magnet.cta} <ArrowRight className="w-4 h-4" />
        </Button>
      </Link>
    </div>
  );
}
