"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/format";
import { mainNav } from "@/lib/site";
import type { Category } from "@/lib/types";

import { CartIcon, ChevronDown, CloseIcon, MenuIcon, UserIcon } from "./icons";
import Logo from "./Logo";
import { useAuth, useCart } from "./Providers";

export default function Navbar({ categories }: { categories: Category[] }) {
  const pathname = usePathname();
  const { count } = useCart();
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus on navigation.
  useEffect(() => {
    setMobileOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  // Close the category menu on outside click or Escape.
  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-40">
      <div className="bg-ink-900 text-[0.78rem] text-ink-100">
        <div className="container flex h-9 items-center justify-center gap-2 truncate text-center">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-sage-400" aria-hidden />
          <span>
            Purity and lab report on every product page
            <span className="hidden sm:inline">
              <span className="mx-1.5 text-ink-400">·</span> Pay with eSewa, Khalti or cash on delivery
            </span>
          </span>
        </div>
      </div>

      <nav
        aria-label="Main"
        className={cn(
          "border-b transition-all duration-300",
          scrolled ? "border-line bg-white/85 shadow-soft backdrop-blur-xl" : "border-transparent bg-paper",
        )}
      >
        <div className="container flex h-[4.5rem] items-center justify-between gap-6">
          <Logo />

          <ul className="hidden items-center gap-1 lg:flex">
            {mainNav.map((item) =>
              "hasMenu" in item ? (
                <li key={item.href} className="relative" ref={menuRef}>
                  <button
                    type="button"
                    aria-expanded={menuOpen}
                    aria-haspopup="true"
                    onClick={() => setMenuOpen((o) => !o)}
                    className={cn(
                      "nav-link inline-flex items-center gap-1",
                      (isActive("/shop") || isActive("/products")) && "nav-link-active",
                    )}
                  >
                    {item.label}
                    <ChevronDown className={cn("h-4 w-4 transition-transform", menuOpen && "rotate-180")} />
                  </button>
                  <div
                    className={cn(
                      "absolute left-1/2 top-full w-[34rem] -translate-x-1/2 pt-3 transition-all duration-200",
                      menuOpen ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0",
                    )}
                  >
                    <div className="grid grid-cols-[1fr_1.1fr] overflow-hidden rounded-2xl border border-line bg-white shadow-lift">
                      <ul className="p-3">
                        {categories.map((c) => (
                          <li key={c.slug}>
                            <Link
                              href={`/shop?category=${c.slug}`}
                              className="group flex items-center justify-between rounded-xl px-3 py-2.5 hover:bg-mist"
                            >
                              <span>
                                <span className="block text-[0.95rem] font-medium text-ink-900">{c.name}</span>
                                <span className="text-xs text-ink-500">
                                  {c.product_count} {c.product_count === 1 ? "product" : "products"}
                                </span>
                              </span>
                              <span className="text-sage-600 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100">
                                →
                              </span>
                            </Link>
                          </li>
                        ))}
                        <li className="mt-1 border-t border-line pt-1">
                          <Link href="/shop" className="block rounded-xl px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-mist">
                            View all products
                          </Link>
                        </li>
                      </ul>
                      <div className="flex flex-col justify-between bg-gradient-to-br from-sage-50 to-ink-50 p-6">
                        <div>
                          <p className="eyebrow">Before you buy</p>
                          <p className="mt-2 font-display text-lg leading-snug text-ink-900">
                            Every vial has a lab report. Read it in two minutes.
                          </p>
                        </div>
                        <Link href="/guides/how-to-read-a-coa" className="mt-4 text-sm font-medium text-sage-700 hover:text-sage-800">
                          How to read a COA →
                        </Link>
                      </div>
                    </div>
                  </div>
                </li>
              ) : (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn("nav-link", isActive(item.href) && "nav-link-active")}
                    aria-current={isActive(item.href) ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              ),
            )}
          </ul>

          <div className="flex items-center gap-1.5">
            <Link
              href={user ? "/account" : "/login"}
              className="icon-btn hidden sm:inline-flex"
              aria-label={user ? "Your account" : "Sign in"}
            >
              <UserIcon />
            </Link>
            <Link href="/cart" className="icon-btn relative" aria-label={`Cart, ${count} items`}>
              <CartIcon />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-sage-500 px-1 text-[0.68rem] font-semibold text-white">
                  {count}
                </span>
              )}
            </Link>
            <button
              type="button"
              className="icon-btn lg:hidden"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((o) => !o)}
            >
              {mobileOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile panel */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 top-[calc(2.25rem+4.5rem)] z-30 overflow-y-auto bg-paper transition-all duration-300 lg:hidden",
          mobileOpen ? "visible opacity-100" : "invisible opacity-0",
        )}
      >
        <div className="container py-6">
          <ul className="space-y-1">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "block rounded-xl px-3 py-3 font-display text-2xl text-ink-900",
                    isActive(item.href) && "bg-mist",
                  )}
                >
                  {item.label}
                </Link>
                {"hasMenu" in item && categories.length > 0 && (
                  <ul className="mb-2 ml-3 mt-1 flex flex-wrap gap-2">
                    {categories.map((c) => (
                      <li key={c.slug}>
                        <Link href={`/shop?category=${c.slug}`} className="chip">
                          {c.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
          <div className="mt-6 border-t border-line pt-6">
            <Link href={user ? "/account" : "/login"} className="btn-secondary w-full">
              {user ? `Signed in as ${user.full_name.split(" ")[0]}` : "Sign in / Create account"}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
