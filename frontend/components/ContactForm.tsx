"use client";

import { useState } from "react";

import { ApiError, apiFetch } from "@/lib/api";

type Fields = { sender_name: string; sender_email: string; subject: string; message_body: string };
type Errors = Partial<Record<keyof Fields, string>>;

const EMPTY: Fields = { sender_name: "", sender_email: "", subject: "", message_body: "" };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Same limits as the API, so people see problems before they submit.
function validate(f: Fields): Errors {
  const e: Errors = {};
  if (f.sender_name.trim().length < 2) e.sender_name = "Please enter your name.";
  if (!EMAIL_RE.test(f.sender_email.trim())) e.sender_email = "Please enter a valid email address.";
  if (f.subject.trim().length < 3) e.subject = "Please add a short subject.";
  const len = f.message_body.trim().length;
  if (len < 20) e.message_body = `Please write at least 20 characters (${len}/20).`;
  if (len > 4000) e.message_body = "Please keep your message under 4,000 characters.";
  return e;
}

export default function ContactForm() {
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [serverMessage, setServerMessage] = useState("");

  const set = (key: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFields((f) => ({ ...f, [key]: e.target.value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const found = validate(fields);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setStatus("sending");
    try {
      const res = await apiFetch<{ detail: string }>("/api/contact", {
        method: "POST",
        body: { ...fields, website: honeypot || undefined },
      });
      setServerMessage(res.detail);
      setStatus("sent");
      setFields(EMPTY);
    } catch (err) {
      setServerMessage(err instanceof ApiError ? err.message : "We couldn’t reach the server. Please try again.");
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="card flex flex-col items-center p-10 text-center" role="status">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-sage-100 text-sage-700">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="m5 12.5 4.5 4.5L19 7.5" />
          </svg>
        </span>
        <h2 className="mt-5 font-display text-2xl text-ink-900">Message sent</h2>
        <p className="mt-2 max-w-sm text-ink-600">{serverMessage}</p>
        <button type="button" className="btn-secondary mt-6" onClick={() => setStatus("idle")}>
          Send another message
        </button>
      </div>
    );
  }

  const message = fields.message_body.trim().length;

  return (
    <form onSubmit={onSubmit} noValidate className="card space-y-5 p-6 sm:p-8">
      {status === "error" && <p className="alert-error" role="alert">{serverMessage}</p>}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="sender_name" label="Full name" error={errors.sender_name}>
          <input id="sender_name" autoComplete="name" maxLength={120} className="field" value={fields.sender_name} onChange={set("sender_name")} aria-invalid={!!errors.sender_name} />
        </Field>
        <Field id="sender_email" label="Email" error={errors.sender_email}>
          <input id="sender_email" type="email" autoComplete="email" maxLength={254} className="field" value={fields.sender_email} onChange={set("sender_email")} aria-invalid={!!errors.sender_email} />
        </Field>
      </div>

      <Field id="subject" label="Subject" error={errors.subject}>
        <input id="subject" maxLength={150} className="field" value={fields.subject} onChange={set("subject")} aria-invalid={!!errors.subject} placeholder="e.g. Question about a batch" />
      </Field>

      <Field id="message_body" label="Message" error={errors.message_body}>
        <textarea id="message_body" rows={6} maxLength={4000} className="field resize-y" value={fields.message_body} onChange={set("message_body")} aria-invalid={!!errors.message_body} />
        <span className="mt-1.5 block text-right text-xs text-ink-400">{message}/4000</span>
      </Field>

      {/* Honeypot: hidden from people and screen readers; bots fill it in. */}
      <div aria-hidden="true" className="absolute left-[-10000px] h-px w-px overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
      </div>

      <button type="submit" className="btn-primary w-full sm:w-auto" disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      {children}
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
