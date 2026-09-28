import type { Metadata, Viewport } from "next";
import { DM_Sans, Fraunces, IBM_Plex_Mono } from "next/font/google";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";
import WhatsAppButton from "@/components/WhatsAppButton";
import { getCategories } from "@/lib/api";
import { site } from "@/lib/site";

import "./globals.css";

const sans = DM_Sans({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  axes: ["opsz", "SOFT"],
});
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} — Lab-verified research peptides`, template: `%s · ${site.name}` },
  description:
    "Research peptides with HPLC purity and the Certificate of Analysis on every product page. Pay with eSewa, Khalti or cash on delivery.",
  openGraph: { type: "website", siteName: site.name, locale: "en_US" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#FBFCFD",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const categories = await getCategories();

  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${sans.variable} ${display.variable} ${mono.variable}`}>
      <body className="flex min-h-screen flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-ink-900 focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <Providers>
          <Navbar categories={categories} />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer categories={categories} />
          <WhatsAppButton />
        </Providers>
      </body>
    </html>
  );
}
