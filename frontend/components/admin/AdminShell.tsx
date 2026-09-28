"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";

import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/format";

import { useAuth } from "../Providers";

const nav = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/products", label: "Products & lab results" },
  { href: "/admin/messages", label: "Messages" },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (ready && !user) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [ready, user, router, pathname]);

  if (!ready || !user) return <div className="container py-24 text-center text-ink-500">Loading…</div>;
  if (user.role !== "Admin") {
    return (
      <section className="container py-24 text-center">
        <h1 className="font-display text-display-md text-ink-900">Admins only</h1>
        <p className="mt-2 text-ink-600">This account doesn’t have admin access.</p>
        <Link href="/" className="btn-secondary mt-6">
          Back to the shop
        </Link>
      </section>
    );
  }

  const active = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  return (
    <div className="container grid gap-8 py-10 lg:grid-cols-[14rem_1fr]">
      <aside>
        <p className="eyebrow">Admin</p>
        <nav aria-label="Admin" className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:gap-1">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              aria-current={active(n.href) ? "page" : undefined}
              className={cn(
                "whitespace-nowrap rounded-xl px-3.5 py-2.5 text-sm font-medium transition",
                active(n.href) ? "bg-ink-900 text-white" : "text-ink-700 hover:bg-mist",
              )}
            >
              {n.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

/** Authenticated API calls for admin pages. */
export function useAdminApi() {
  const { token } = useAuth();
  return useCallback(
    <T,>(path: string, opts: { method?: "GET" | "POST" | "PATCH"; body?: unknown } = {}) =>
      apiFetch<T>(path, { ...opts, token }),
    [token],
  );
}

export function AdminHeading({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <h1 className="font-display text-display-md text-ink-950">{title}</h1>
      {children}
    </div>
  );
}
