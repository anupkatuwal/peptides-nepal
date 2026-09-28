export const site = {
  name: "Peptides Nepal",
  tagline: "Lab-verified research peptides, delivered in Kathmandu.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  // +977 974-594-7888. NEXT_PUBLIC_WHATSAPP_NUMBER overrides it (digits with country code).
  whatsappNumber: (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "9779745947888").replace(/\D/g, ""),
  deliveryArea: "Kathmandu",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "",
  instagram: "https://www.instagram.com/peptidesnepal/",
  educationSite: "https://peptides.anup-katuwal.com.np/",
};

/** "9779745947888" -> "+977 974-594-7888" (other formats: "+" and the digits). */
export function formatPhone(digits: string): string {
  const np = digits.match(/^977(\d{3})(\d{3})(\d{4})$/);
  return np ? `+977 ${np[1]}-${np[2]}-${np[3]}` : `+${digits}`;
}

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
