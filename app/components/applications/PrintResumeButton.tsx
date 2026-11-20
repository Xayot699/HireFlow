"use client";

import { translate, type Locale } from "@/lib/messages";

export default function PrintResumeButton({ locale }: { locale: Locale }) {
  return <button type="button" onClick={() => window.print()} className="print-hide rounded-full bg-[#c9f36a] px-5 py-3 text-sm font-black text-[#17231d] transition hover:bg-[#b9e653]">{translate(locale, "downloadResume")}</button>;
}
