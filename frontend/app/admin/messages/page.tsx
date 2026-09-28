"use client";

import { useEffect, useState } from "react";

import { AdminHeading, useAdminApi } from "@/components/admin/AdminShell";
import { ApiError } from "@/lib/api";
import { cn, formatDate } from "@/lib/format";
import type { ContactMessage } from "@/lib/types";

export default function AdminMessagesPage() {
  const api = useAdminApi();
  const [messages, setMessages] = useState<ContactMessage[] | null>(null);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setMessages(null);
    api<ContactMessage[]>(`/api/contact${unreadOnly ? "?unread_only=true" : ""}`)
      .then(setMessages)
      .catch((e) => setError(e instanceof ApiError ? e.message : "Couldn’t load messages."));
  }, [api, unreadOnly]);

  async function markRead(m: ContactMessage) {
    try {
      const updated = await api<ContactMessage>(`/api/contact/${m.id}/read`, { method: "PATCH" });
      setMessages((list) => list?.map((x) => (x.id === updated.id ? updated : x)) ?? null);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Couldn’t update the message.");
    }
  }

  return (
    <>
      <AdminHeading title="Messages">
        <div className="flex gap-2">
          <button type="button" className={cn("chip", !unreadOnly && "chip-active")} onClick={() => setUnreadOnly(false)}>All</button>
          <button type="button" className={cn("chip", unreadOnly && "chip-active")} onClick={() => setUnreadOnly(true)}>Unread</button>
        </div>
      </AdminHeading>

      {error && <p className="alert-error mb-4">{error}</p>}
      {messages === null && !error && <p className="text-ink-500">Loading…</p>}
      {messages?.length === 0 && <p className="rounded-2xl border border-dashed border-line bg-white p-10 text-center text-ink-500">No messages.</p>}

      <ul className="space-y-3">
        {messages?.map((m) => (
          <li key={m.id} className={cn("card p-5", !m.is_read && "border-l-4 border-l-sage-500")}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium text-ink-900">{m.subject}</p>
                <p className="mt-0.5 text-sm text-ink-600">
                  {m.sender_name} · {m.sender_email} · {formatDate(m.submitted_at)}
                </p>
              </div>
              <div className="flex gap-2">
                <a
                  href={`mailto:${m.sender_email}?subject=${encodeURIComponent(`Re: ${m.subject}`)}`}
                  className="btn-secondary px-4 py-2 text-sm"
                  onClick={() => !m.is_read && markRead(m)}
                >
                  Reply by email
                </a>
                {!m.is_read && (
                  <button type="button" className="btn-secondary px-4 py-2 text-sm" onClick={() => markRead(m)}>
                    Mark read
                  </button>
                )}
              </div>
            </div>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-ink-800">{m.message_body}</p>
          </li>
        ))}
      </ul>
    </>
  );
}
