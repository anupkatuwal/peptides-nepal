"use client";

import Link from "next/link";
import { useState } from "react";

import { ApiError, apiFetch } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setStatus("sending");
    try {
      const res = await apiFetch<{ detail: string }>("/api/auth/forgot-password", { method: "POST", body: { email: email.trim() } });
      setMessage(res.detail);
      setStatus("sent");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "We couldn’t reach the server. Please try again.");
      setStatus("idle");
    }
  }

  return (
    <section className="container flex justify-center py-16 md:py-24">
      <div className="w-full max-w-md">
        <div className="text-center">
          <h1 className="font-display text-display-md text-ink-950">Forgot your password?</h1>
          <p className="mt-2 text-ink-600">Enter your email. We’ll send a link to choose a new one.</p>
        </div>
        {status === "sent" ? (
          <div className="alert-success mt-8" role="status">
            {message} Check your inbox and spam folder. The link works for one hour.
          </div>
        ) : (
          <form onSubmit={onSubmit} className="card mt-8 space-y-5 p-6 sm:p-8">
            {error && <p className="alert-error" role="alert">{error}</p>}
            <div>
              <label htmlFor="email" className="field-label">Email</label>
              <input id="email" type="email" required maxLength={254} autoComplete="email" className="field" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={status === "sending"}>
              {status === "sending" ? "Sending…" : "Send reset link"}
            </button>
          </form>
        )}
        <p className="mt-6 text-center text-sm text-ink-600">
          <Link href="/login" className="font-medium text-ink-900 underline underline-offset-4">Back to sign in</Link>
        </p>
      </div>
    </section>
  );
}
