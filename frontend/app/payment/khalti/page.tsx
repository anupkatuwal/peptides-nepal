import type { Metadata } from "next";

import PaymentReturn from "@/components/PaymentReturn";

export const metadata: Metadata = { title: "Khalti payment", robots: { index: false } };

type SearchParams = Promise<{ pidx?: string }>;

// Khalti redirects here with ?pidx=...&status=... The status in the URL is not trusted;
// the server looks the payment up with Khalti.
export default async function KhaltiReturnPage({ searchParams }: { searchParams: SearchParams }) {
  const { pidx } = await searchParams;
  const valid = pidx && /^[A-Za-z0-9]{5,100}$/.test(pidx);
  return <PaymentReturn gateway="Khalti" confirm={valid ? { path: "/api/payments/khalti/confirm", body: { pidx } } : null} />;
}
