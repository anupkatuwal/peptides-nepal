import type { Metadata } from "next";

import PaymentReturn from "@/components/PaymentReturn";

export const metadata: Metadata = { title: "eSewa payment", robots: { index: false } };

type SearchParams = Promise<{ data?: string }>;

// eSewa redirects here with ?data=<base64 signed JSON>.
export default async function EsewaReturnPage({ searchParams }: { searchParams: SearchParams }) {
  const { data } = await searchParams;
  return <PaymentReturn gateway="eSewa" confirm={data ? { path: "/api/payments/esewa/confirm", body: { data } } : null} />;
}
