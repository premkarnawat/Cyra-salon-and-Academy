import { GoldDivider } from "./GoldDivider";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  tag?: string;
  title: React.ReactNode;
  subtitle?: string;
  centered?: boolean;
  className?: string;
}

export function SectionHeader({
  tag,
  title,
  subtitle,
  centered = true,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn(centered && "text-center", "mb-12 md:mb-16", className)}>
      {tag && <span className="section-tag">{tag}</span>}
      <h2 className="font-cormorant text-4xl md:text-5xl lg:text-6xl font-semibold text-[var(--dark-900)] dark:text-[#F0E8D8] leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-sm font-light tracking-wide text-[var(--dark-600)] dark:text-[rgba(240,232,216,0.85)] max-w-xl mx-auto">
          {subtitle}
        </p>
      )}
      {centered && <GoldDivider />}
    </div>
  );
}
