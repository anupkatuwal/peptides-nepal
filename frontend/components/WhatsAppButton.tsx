"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { site, whatsappLink } from "@/lib/site";
import { cn } from "@/lib/format";

import { WhatsAppIcon } from "./icons";

export default function WhatsAppButton() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  // Fade in after first paint so it doesn't compete with the hero.
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 600);
    return () => clearTimeout(t);
  }, []);

  const href = whatsappLink(
    pathname.startsWith("/products/")
      ? `Hi ${site.name}, I have a question about ${site.url}${pathname}`
      : `Hi ${site.name}, I have a question.`,
  );
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className={cn(
        "group fixed bottom-5 right-5 z-50 flex items-center gap-3 transition-all duration-500 sm:bottom-7 sm:right-7",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0",
      )}
    >
      <span className="hidden rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-ink-800 opacity-0 shadow-soft transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 sm:block sm:translate-x-2">
        Chat with us
      </span>
      <span className="relative grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-lift transition-transform duration-300 group-hover:scale-105">
        <span aria-hidden className="absolute inset-0 rounded-full bg-[#25D366] motion-safe:animate-pulse-ring" />
        <WhatsAppIcon className="relative h-7 w-7" />
      </span>
    </a>
  );
}
