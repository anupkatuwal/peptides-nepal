/* eslint-disable @next/next/no-img-element -- product and COA images can come from any HTTPS host set in the admin API */
"use client";

import { useState } from "react";

const FALLBACK = "/products/vial-default.svg";

export default function ProductImage({ src, alt, className }: { src: string | null; alt: string; className?: string }) {
  const [current, setCurrent] = useState(src || FALLBACK);
  return (
    <img
      src={current}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      onError={() => current !== FALLBACK && setCurrent(FALLBACK)}
    />
  );
}
