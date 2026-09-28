import Link from "next/link";

import { site, whatsappLink } from "@/lib/site";
import type { Category } from "@/lib/types";

import { InstagramIcon, MailIcon, WhatsAppIcon } from "./icons";
import Logo from "./Logo";

export default function Footer({ categories }: { categories: Category[] }) {
  const wa = whatsappLink();
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-24 overflow-hidden bg-ink-950 text-ink-200">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 -top-40 h-[28rem] w-[28rem] rounded-full bg-sage-500/10 blur-3xl"
      />
      <div className="container relative">
        <div className="grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="max-w-sm">
            <Logo inverted />
            <p className="mt-5 text-sm leading-relaxed text-ink-300">
              Research peptides with the lab report on the page. Check the purity and identity of the batch before you
              order.
            </p>
            <div className="mt-6 flex gap-2">
              <a href={site.instagram} target="_blank" rel="noopener noreferrer" className="footer-icon" aria-label="Instagram">
                <InstagramIcon />
              </a>
              {wa && (
                <a href={wa} target="_blank" rel="noopener noreferrer" className="footer-icon" aria-label="WhatsApp">
                  <WhatsAppIcon className="h-5 w-5" />
                </a>
              )}
              {site.email && (
                <a href={`mailto:${site.email}`} className="footer-icon" aria-label="Email">
                  <MailIcon />
                </a>
              )}
            </div>
          </div>

          <FooterColumn title="Shop">
            {categories.map((c) => (
              <FooterLink key={c.slug} href={`/shop?category=${c.slug}`}>
                {c.name}
              </FooterLink>
            ))}
            <FooterLink href="/shop">All products</FooterLink>
            <FooterLink href="/cart">Your cart</FooterLink>
          </FooterColumn>

          <FooterColumn title="Quality">
            <FooterLink href="/lab-results">Lab results / COA</FooterLink>
            <FooterLink href="/guides/how-to-read-a-coa">How to read a COA</FooterLink>
            <FooterLink href="/guides">Protocols & guides</FooterLink>
            <FooterLink href={site.educationSite} external>
              Peptide research guide
            </FooterLink>
          </FooterColumn>

          <FooterColumn title="Help">
            <FooterLink href="/contact">Contact us</FooterLink>
            <FooterLink href="/account">Your orders</FooterLink>
            <FooterLink href="/login">Sign in</FooterLink>
            {site.email && <FooterLink href={`mailto:${site.email}`}>{site.email}</FooterLink>}
          </FooterColumn>
        </div>

        <div className="flex flex-col gap-4 border-t border-white/10 py-7 text-xs text-ink-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Peptides Nepal. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1">We accept</span>
            {["eSewa", "Khalti", "Cash on delivery"].map((m) => (
              <span key={m} className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-ink-200">
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-sage-300">{title}</h3>
      <ul className="mt-5 space-y-3 text-sm">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children, external }: { href: string; children: React.ReactNode; external?: boolean }) {
  const cls = "text-ink-200 transition-colors hover:text-white";
  return (
    <li>
      {external || href.startsWith("mailto:") ? (
        <a href={href} className={cls} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
          {children}
          {external && <span aria-hidden> ↗</span>}
        </a>
      ) : (
        <Link href={href} className={cls}>
          {children}
        </Link>
      )}
    </li>
  );
}
