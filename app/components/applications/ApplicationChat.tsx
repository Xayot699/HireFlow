"use client";

import { useActionState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

import { sendApplicationMessage, type ChatActionState } from "@/features/applications/chat-actions";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { translate, type Locale } from "@/lib/messages";

export type ApplicationMessage = {
  id: string;
  application_id: string;
  sender_id: string | null;
  body: string;
  is_system: boolean;
  created_at: string;
};

type Props = {
  applicationId: string;
  messages: ApplicationMessage[];
  userId: string;
  role: "candidate" | "admin";
  locale: Locale;
  live?: boolean;
};

const initialState: ChatActionState = { error: "", sentAt: 0 };

export default function ApplicationChat({ applicationId, messages, userId, role, locale, live = true }: Props) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(sendApplicationMessage, initialState);
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);

  useEffect(() => {
    if (state.sentAt) formRef.current?.reset();
  }, [state.sentAt]);

  useEffect(() => {
    if (!live) return;
    const { url, publishableKey } = getSupabaseConfig();
    const supabase = createBrowserClient(url, publishableKey);
    const channel = supabase
      .channel(`application-chat-${applicationId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "application_messages",
        filter: `application_id=eq.${applicationId}`,
      }, () => router.refresh())
      .subscribe();

    return () => { void supabase.removeChannel(channel); };
  }, [applicationId, live, router]);

  return (
    <section className="mt-5 overflow-hidden rounded-2xl border border-[#17231d]/10 bg-white">
      <div className="flex items-center justify-between border-b border-[#17231d]/10 px-4 py-3">
        <div>
          <h3 className="text-sm font-black text-[#17231d]">{t("applicationChat")}</h3>
          <p className="mt-0.5 text-xs text-[#8b948b]">{t("chatPrivateHint")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/messages?conversation=${applicationId}`} className="rounded-full border border-[#17231d]/10 px-3 py-1.5 text-[10px] font-bold text-[#315a42] transition hover:bg-[#e8ecdf]">{t("openFullChat")} ↗</Link>
          <span className="hidden items-center gap-1.5 rounded-full bg-[#edf4df] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#315a42] sm:inline-flex"><span className="size-1.5 animate-pulse rounded-full bg-[#5b9b57]" />{t("chatLive")}</span>
        </div>
      </div>

      <ol aria-live="polite" className="max-h-72 space-y-3 overflow-y-auto bg-[#f8f8f2] p-4">
        {messages.length === 0 && <li className="py-6 text-center text-xs text-[#8b948b]">{t("chatStart")}</li>}
        {messages.map((message) => {
          const own = message.sender_id === userId;
          return (
            <li key={message.id} className={`flex ${message.is_system ? "justify-center" : own ? "justify-end" : "justify-start"}`}>
              {message.is_system ? (
                <p className="max-w-[90%] rounded-full border border-[#17231d]/10 bg-white px-4 py-2 text-center text-xs font-semibold text-[#68736b]">✦ {t("applicationSubmitted")}</p>
              ) : (
                <div className={`max-w-[88%] rounded-2xl px-4 py-3 ${own ? "rounded-br-md bg-[#244a39] text-white" : "rounded-bl-md border border-[#17231d]/10 bg-white text-[#17231d]"}`}>
                  <p className={`mb-1 text-[10px] font-bold uppercase tracking-wider ${own ? "text-[#c9f36a]" : "text-[#536c51]"}`}>{own ? t("chatYou") : role === "admin" ? t("chatCandidate") : t("chatHiringTeam")}</p>
                  <p className="whitespace-pre-wrap break-words text-sm leading-5">{message.body}</p>
                  <time className={`mt-1.5 block text-right text-[10px] ${own ? "text-white/60" : "text-[#8b948b]"}`} dateTime={message.created_at}>{new Date(message.created_at).toLocaleString(locale === "uz" ? "uz-UZ" : locale === "ru" ? "ru-RU" : "en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</time>
                </div>
              )}
            </li>
          );
        })}
      </ol>

      <form ref={formRef} action={action} className="border-t border-[#17231d]/10 p-3">
        <input type="hidden" name="applicationId" value={applicationId} />
        <label htmlFor={`chat-${applicationId}`} className="sr-only">{t("chatMessagePlaceholder")}</label>
        <div className="flex items-end gap-2">
          <textarea id={`chat-${applicationId}`} name="body" required maxLength={3000} rows={2} placeholder={t("chatMessagePlaceholder")} className="min-h-11 flex-1 resize-y rounded-xl border border-[#17231d]/15 bg-[#fbfaf5] px-3 py-2.5 text-sm text-[#17231d] outline-none focus:border-[#536c51] focus:ring-4 focus:ring-[#536c51]/10" />
          <button type="submit" disabled={pending} className="site-cta grid size-11 shrink-0 place-items-center rounded-xl bg-[#17231d] text-lg font-bold text-[#c9f36a] transition hover:bg-[#315a42] disabled:opacity-50" aria-label={t("chatSend")}>{pending ? "…" : "↗"}</button>
        </div>
        {state.error && <p role="alert" className="mt-2 text-xs font-semibold text-rose-700">{state.error}</p>}
      </form>
    </section>
  );
}
