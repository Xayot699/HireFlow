"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseConfig } from "@/lib/supabase/config";

export default function ApplicationMessagesRealtime() {
  const router = useRouter();

  useEffect(() => {
    const { url, publishableKey } = getSupabaseConfig();
    const supabase = createBrowserClient(url, publishableKey);
    const channel = supabase
      .channel("application-message-inbox")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "application_messages",
      }, () => router.refresh())
      .subscribe();

    return () => { void supabase.removeChannel(channel); };
  }, [router]);

  return null;
}
