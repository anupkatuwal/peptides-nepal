"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { ApiError, apiFetch } from "@/lib/api";

import { useAuth } from "./Providers";

export default function ResetPasswordForm() {
  const token = useSearchParams().get("token") ?? "";
  const { logout } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      setError("Use at least 8 characters with a letter and a number.");
      return;
    }
    if (password !== confirm) {
      setError("The two passwords don’t match.");
      return;
    }
    setBusy(true);
    try {
      await apiFetch("/api/auth/reset-password", { method: "POST", body: { token, password } });
      logout(); // any saved session on this device is no longer valid
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "We couldn’t reach the server. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="container flex justify-center py-16 md:py-24">
      <div className="w-full max-w-md">
        <h1 className="text-center font-display text-display-md text-ink-950">Choose a new password</h1>
        {!token ? (
          <p className="alert-error mt-8">
            This link is missing its code. <Link href="/forgot-password" className="underline">Request a new link</Link>.
          </p>
        ) : done ? (
          <div className="mt-8 text-center">
            <p className="alert-success" role="status">Your password has been changed. You’ve been signed out everywhere.</p>
            <Link href="/login" className="btn-primary mt-6">Sign in</Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="card mt-8 space-y-5 p-6 sm:p-8">
            {error && (
              <p className="alert-error" role="alert">
                {error}{" "}
                {error.includes("expired") || error.includes("used") ? (
                  <Link href="/forgot-password" className="underline">Request a new link</Link>
                ) : null}
              </p>
            )}
            <div>
              <label htmlFor="password" className="field-label">New password</label>
              <input id="password" type="password" required minLength={8} maxLength={72} autoComplete="new-password" className="field" value={password} onChange={(e) => setPassword(e.target.value)} />
              <p className="mt-1.5 text-xs text-ink-500">At least 8 characters, with a letter and a number.</p>
            </div>
            <div>
              <label htmlFor="confirm" className="field-label">Repeat new password</label>
              <input id="confirm" type="password" required maxLength={72} autoComplete="new-password" className="field" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={busy}>
              {busy ? "Saving…" : "Change password"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
