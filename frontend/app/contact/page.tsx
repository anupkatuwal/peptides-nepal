import type { Metadata } from "next";

import ContactForm from "@/components/ContactForm";
import { InstagramIcon, MailIcon, WhatsAppIcon } from "@/components/icons";
import { formatPhone, site, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact us",
  description: "Questions about a batch, a lab report or an order? Message Peptides Nepal.",
};

export default function ContactPage() {
  const wa = whatsappLink();
  const channels = [
    wa && { icon: WhatsAppIcon, label: "WhatsApp", value: `${formatPhone(site.whatsappNumber)} · fastest reply`, href: wa },
    site.email && { icon: MailIcon, label: "Email", value: site.email, href: `mailto:${site.email}` },
    { icon: InstagramIcon, label: "Instagram", value: "@peptidesnepal", href: site.instagram },
  ].filter(Boolean) as { icon: typeof MailIcon; label: string; value: string; href: string }[];

  return (
    <section className="relative">
      <div aria-hidden className="absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-mist to-paper" />
      <div className="container relative grid gap-12 py-14 md:py-20 lg:grid-cols-[1fr_1.35fr]">
        <div>
          <p className="eyebrow">Contact us</p>
          <h1 className="mt-4 font-display text-display-lg text-ink-950">Ask before you order.</h1>
          <p className="mt-4 max-w-md leading-relaxed text-ink-600">
            Questions about a batch, a lab report, payment or delivery. Send a message and we’ll reply by email.
          </p>

          <ul className="mt-10 space-y-3">
            {channels.map(({ icon: Icon, label, value, href }) => (
              <li key={label}>
                <a
                  href={href}
                  target={href.startsWith("mailto:") ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 rounded-2xl border border-line bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-soft"
                >
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-mist text-ink-800 group-hover:bg-sage-50 group-hover:text-sage-700">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-sm font-medium text-ink-900">{label}</span>
                    <span className="block text-sm text-ink-500">{value}</span>
                  </span>
                  <span className="ml-auto text-ink-300 transition group-hover:translate-x-0.5 group-hover:text-ink-700">→</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
