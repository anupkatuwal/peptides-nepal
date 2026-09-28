import Link from "next/link";

import { cn } from "@/lib/format";

/** Mark: three linked amino-acid "beads" — a peptide chain — inside a rounded tile. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <rect width="40" height="40" rx="11" fill="#13223D" />
      <path d="M11 26.5 20 13.5l9 13" stroke="#8FC8A8" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <circle cx="11" cy="26.5" r="4" fill="#FBFCFD" />
      <circle cx="20" cy="13.5" r="4" fill="#5FAB83" />
      <circle cx="29" cy="26.5" r="4" fill="#FBFCFD" />
    </svg>
  );
}

export default function Logo({ className, inverted = false }: { className?: string; inverted?: boolean }) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-2.5", className)} aria-label="Peptides Nepal — home">
      <LogoMark className="h-9 w-9 transition-transform duration-300 group-hover:rotate-[-6deg]" />
      <span className="leading-none">
        <span className={cn("block font-display text-[1.2rem] font-medium tracking-tight", inverted ? "text-white" : "text-ink-900")}>
          Peptides Nepal
        </span>
        <span className={cn("mt-1 block text-[0.62rem] font-medium uppercase tracking-[0.2em]", inverted ? "text-sage-300" : "text-sage-600")}>
          Lab-verified purity
        </span>
      </span>
    </Link>
  );
}
