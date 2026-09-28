"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

const sorts = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "name", label: "Name A–Z" },
];

export default function ShopControls() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(params.get("q") ?? "");

  useEffect(() => setQ(params.get("q") ?? ""), [params]);

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    startTransition(() => router.push(`${pathname}?${next.toString()}`, { scroll: false }));
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center" aria-busy={pending}>
      <form
        role="search"
        className="relative"
        onSubmit={(e) => {
          e.preventDefault();
          update("q", q.trim());
        }}
      >
        <label htmlFor="shop-search" className="sr-only">
          Search products
        </label>
        <input
          id="shop-search"
          type="search"
          value={q}
          maxLength={80}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search peptides…"
          className="field w-full rounded-full py-2.5 pl-4 pr-10 sm:w-64"
        />
        <button type="submit" className="absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-ink-500 hover:bg-mist" aria-label="Search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
        </button>
      </form>
      <label className="flex items-center gap-2 text-sm text-ink-600">
        <span className="whitespace-nowrap">Sort by</span>
        <select
          value={params.get("sort") ?? "newest"}
          onChange={(e) => update("sort", e.target.value === "newest" ? "" : e.target.value)}
          className="field rounded-full py-2.5 pl-4 pr-9"
        >
          {sorts.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
