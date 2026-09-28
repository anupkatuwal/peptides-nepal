export const site = {
  name: "Peptides Nepal",
  tagline: "Lab-verified research peptides, delivered across Nepal.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  whatsappNumber: (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "").replace(/\D/g, ""),
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "",
  instagram: "https://www.instagram.com/peptidesnepal/",
  educationSite: "https://peptides.anup-katuwal.com.np/",
};

export function whatsappLink(message?: string): string | null {
  if (!site.whatsappNumber) return null;
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${site.whatsappNumber}${text}`;
}

export const mainNav = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop by Category", hasMenu: true },
  { href: "/lab-results", label: "Lab Results / COA" },
  { href: "/guides", label: "Protocols & Guides" },
  { href: "/contact", label: "Contact Us" },
] as const;
