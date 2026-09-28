import type { Metadata } from "next";
import { notFound } from "next/navigation";

import PaymentReturn from "@/components/PaymentReturn";

export const metadata: Metadata = { title: "eSewa payment", robots: { index: false } };

export default async function EsewaFailedPage({ params }: { params: Promise<{ order: string }> }) {
  const orderId = Number.parseInt((await params).order, 10);
  if (!Number.isInteger(orderId) || orderId <= 0) notFound();
  return <PaymentReturn gateway="eSewa" confirm={null} failedOrderId={orderId} />;
}
