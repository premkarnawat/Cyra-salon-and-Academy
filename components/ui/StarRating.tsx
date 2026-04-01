import { Star } from "lucide-react";

export function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of ${max} stars`}>
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          size={14}
          className={i < rating ? "star-filled fill-[var(--gold)]" : "star-empty"}
          fill={i < rating ? "var(--gold)" : "none"}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}
