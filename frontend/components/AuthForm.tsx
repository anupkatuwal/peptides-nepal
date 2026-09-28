"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { ApiError } from "@/lib/api";

import { useAuth } from "./Providers";

/** Only allow redirects to paths on this site. */
function safeNext(value: string | null): string {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/account";
}

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const { login, register, user, ready } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (ready && user) router.replace(next);
  }, [ready, user, next, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (mode === "register") {
      if (password.length < 8 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
        setError("Use at least 8 characters with a letter and a number.");
        return;
      }
    }
    setBusy(true);
    try {
      if (mode === "login") await login(email.trim(), password);
      else await register(fullName.trim(), email.trim(), password);
      router.replace(next);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "We couldn’t reach the server. Please try again.");
      setBusy(false);
    }
  }

  const isLogin = mode === "login";
  const otherHref = `${isLogin ? "/register" : "/login"}${next !== "/account" ? `?next=${encodeURIComponent(next)}` : ""}`;

  return (
    <section className="container flex justify-center py-16 md:py-24">
      <div className="w-full max-w-md">
        <div className="text-center">
          <h1 className="font-display text-display-md text-ink-950">{isLogin ? "Welcome back" : "Create your account"}</h1>
          <p className="mt-2 text-ink-600">{isLogin ? "Sign in to check out and track orders." : "You’ll need an account to place and track orders."}</p>
        </div>

        <form onSubmit={onSubmit} className="card mt-8 space-y-5 p-6 sm:p-8">
          {error && <p className="alert-error" role="alert">{error}</p>}
          {!isLogin && (
            <div>
              <label htmlFor="full_name" className="field-label">Full name</label>
              <input id="full_name" required minLength={2} maxLength={120} autoComplete="name" className="field" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
          )}
          <div>
            <label htmlFor="email" className="field-label">Email</label>
            <input id="email" type="email" required maxLength={254} autoComplete="email" className="field" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label htmlFor="password" className="field-label">Password</label>
            <input
              id="password"
              type="password"
              required
              minLength={isLogin ? 1 : 8}
              maxLength={72}
              autoComplete={isLogin ? "current-password" : "new-password"}
              className="field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {!isLogin && <p className="mt-1.5 text-xs text-ink-500">At least 8 characters, with a letter and a number.</p>}
          </div>
          <button type="submit" className="btn-primary w-full" disabled={busy}>
            {busy ? "Please wait…" : isLogin ? "Sign in" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-600">
          {isLogin ? "New here? " : "Already have an account? "}
          <Link href={otherHref} className="font-medium text-ink-900 underline underline-offset-4">
            {isLogin ? "Create an account" : "Sign in"}
          </Link>
        </p>
      </div>
    </section>
  );
}
