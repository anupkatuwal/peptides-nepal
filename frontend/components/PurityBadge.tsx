import { cn, formatPurity } from "@/lib/format";

export default function PurityBadge({
  purity,
  size = "sm",
  className,
}: {
  purity: number | null;
  size?: "sm" | "lg";
  className?: string;
}) {
  const value = formatPurity(purity);
  if (value === null) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-dashed border-ink-200 bg-white/80 font-medium text-ink-500",
          size === "sm" ? "px-2.5 py-1 text-[0.7rem]" : "px-3.5 py-1.5 text-sm",
          className,
        )}
      >
        Lab report pending
      </span>
    );
  }
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-sage-200 bg-sage-50/90 font-medium text-sage-800 backdrop-blur",
        size === "sm" ? "px-2.5 py-1 text-[0.7rem]" : "px-3.5 py-1.5 text-sm",
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-sage-500" aria-hidden />
      <span className="font-mono">{value}</span> HPLC purity
    </span>
  );
}
