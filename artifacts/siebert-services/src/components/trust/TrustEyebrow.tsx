import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TrustEyebrowProps {
  rating?: number;
  reviewCount?: number;
  text?: string;
  className?: string;
}

export function TrustEyebrow({
  rating = 4.9,
  reviewCount = 80,
  text = "Trusted by 200+ Hudson Valley businesses",
  className,
}: TrustEyebrowProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/10 backdrop-blur border border-white/20 text-white/90 text-sm font-semibold",
        className
      )}
    >
      <div className="flex items-center gap-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star
            key={i}
            className={cn(
              "w-4 h-4",
              i < Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "text-white/30"
            )}
          />
        ))}
      </div>
      <span className="text-white/60">·</span>
      <span>
        {rating.toFixed(1)} from {reviewCount}+ Google reviews
      </span>
      <span className="hidden sm:inline text-white/60">·</span>
      <span className="hidden sm:inline">{text}</span>
    </div>
  );
}
