"use client";

import { useEffect } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseConfig } from "@/lib/supabase/config";
import { translate, type Locale } from "@/lib/messages";

type Props = { count: number; locale: Locale };

export default function AdminApplicationBadge({ count, locale }: Props) {
  const router = useRouter();
  const [notice, setNotice] = useState(false);

  useEffect(() => {
    const { url, publishableKey } = getSupabaseConfig();
    const supabase = createBrowserClient(url, publishableKey);
    let dismissTimer: number | undefined;
    const channel = supabase
      .channel("admin-applications-count")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "applications",
      }, (payload) => {
        router.refresh();
        if (payload.eventType === "INSERT") {
          setNotice(true);
          if (dismissTimer) window.clearTimeout(dismissTimer);
          dismissTimer = window.setTimeout(() => setNotice(false), 12_000);
        }
      })
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "application_messages",
      }, () => router.refresh())
      .subscribe();

    return () => {
      if (dismissTimer) window.clearTimeout(dismissTimer);
      void supabase.removeChannel(channel);
    };
  }, [router]);

  return <>
    {count > 0 && <span className="rounded-full bg-[#c9f36a] px-2 py-0.5 text-xs font-black text-[#17231d]" aria-label={`${count} ${translate(locale, "pendingApplications")}`}>{count > 99 ? "99+" : count}</span>}
    {notice && <div role="status" aria-live="polite" className="fixed right-4 top-4 z-[80] flex max-w-sm items-start gap-4 rounded-2xl border border-[#c9f36a]/30 bg-[#17231d] p-4 text-white shadow-[0_20px_65px_rgba(0,0,0,0.25)] sm:right-6 sm:top-6">
      <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#c9f36a] text-lg font-black text-[#17231d]">✦</span>
      <div className="min-w-0 flex-1"><p className="text-sm font-black">{translate(locale, "newApplicationNotice")}</p><Link href="/admin/applications" onClick={() => setNotice(false)} className="mt-1 inline-block text-xs font-bold text-[#c9f36a] underline underline-offset-2">{translate(locale, "applicationsPageTitle")} ↗</Link></div>
      <button type="button" onClick={() => setNotice(false)} aria-label={translate(locale, "dismissNotice")} className="rounded-full px-2 text-white/60 hover:bg-white/10 hover:text-white">×</button>
    </div>}
  </>;
}
