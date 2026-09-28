"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { ApiError, apiFetch } from "@/lib/api";
import { startPayment, type PaymentResult } from "@/lib/payments";

import { useAuth } from "./Providers";

type Props =
  | { gateway: "eSewa"; confirm: { path: "/api/payments/esewa/confirm"; body: { data: string } } | null; failedOrderId?: undefined }
  | { gateway: "Khalti"; confirm: { path: "/api/payments/khalti/confirm"; body: { pidx: string } } | null; failedOrderId?: undefined }
  | { gateway: "eSewa"; confirm: null; failedOrderId: number };

export default function PaymentReturn(props: Props) {
  const { token } = useAuth();
  const [result, setResult] = useState<PaymentResult | null>(null);
  const [error, setError] = useState("");
  const [retrying, setRetrying] = useState(false);
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return; // confirm once, even under React strict mode
    sent.current = true;
    if (props.failedOrderId) {
      setResult({ order_id: props.failedOrderId, paid: false, detail: "The payment wasn’t completed. No money was taken." });
      return;
    }
    if (!props.confirm) {
      setError("This page was opened without payment details.");
      return;
    }
    apiFetch<PaymentResult>(props.confirm.path, { method: "POST", body: props.confirm.body })
      .then(setResult)
      .catch((e) => setError(e instanceof ApiError ? e.message : "We couldn’t confirm the payment. Please refresh."));
  }, [props]);

  async function retry() {
    if (!result) return;
    setRetrying(true);
    setError("");
    try {
      await startPayment(result.order_id, token);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Couldn’t start the payment.");
      setRetrying(false);
    }
  }

  return (
    <section className="container flex justify-center py-20 md:py-28">
      <div className="card w-full max-w-lg p-8 text-center sm:p-10">
        <p className="eyebrow">{props.gateway} payment</p>
        {!result && !error && (
          <>
            <div className="mx-auto mt-6 h-10 w-10 animate-spin rounded-full border-2 border-ink-100 border-t-sage-500" aria-hidden />
            <p className="mt-4 text-ink-600" role="status">Confirming your payment with {props.gateway}…</p>
          </>
        )}
        {result && (
          <>
            <span
              className={`mx-auto mt-6 grid h-14 w-14 place-items-center rounded-full ${result.paid ? "bg-sage-100 text-sage-700" : "bg-amber-50 text-amber-700"}`}
              aria-hidden
            >
              {result.paid ? "✓" : "!"}
            </span>
            <h1 className="mt-5 font-display text-2xl text-ink-900">
              {result.paid ? `Order #${result.order_id} is paid` : `Order #${result.order_id} isn’t paid yet`}
            </h1>
            <p className="mt-2 text-ink-600" role="status">{result.detail}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {!result.paid && token && (
                <button type="button" className="btn-primary" onClick={retry} disabled={retrying}>
                  {retrying ? "Opening…" : `Try ${props.gateway} again`}
                </button>
              )}
              <Link href={`/account?order=${result.order_id}`} className={result.paid ? "btn-primary" : "btn-secondary"}>
                View your orders
              </Link>
            </div>
          </>
        )}
        {error && (
          <>
            <p className="alert-error mt-6" role="alert">{error}</p>
            <Link href="/account" className="btn-secondary mt-6">View your orders</Link>
          </>
        )}
      </div>
    </section>
  );
}
