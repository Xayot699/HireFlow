"use client";

import { setLocale } from "@/features/preferences/actions";
import type { Locale } from "@/lib/i18n";
import { translate } from "@/lib/messages";

type Props = { locale: Locale };

export default function LanguagePicker({ locale }: Props) {
  return (
    <form key={locale} action={setLocale}>
      <label className="sr-only" htmlFor="site-language">{translate(locale, "chooseLanguage")}</label>
      <select
        id="site-language"
        name="locale"
        defaultValue={locale}
        onChange={(event) => {
          const nextLocale = event.currentTarget.value;
          document.documentElement.lang = nextLocale;
          try {
            window.localStorage.setItem("hireflow-locale", nextLocale);
          } catch {
            // The server cookie still stores the choice if storage is unavailable.
          }
          event.currentTarget.form?.requestSubmit();
        }}
        className="min-h-10 rounded-full border border-[#17231d]/15 bg-transparent px-3 text-xs font-black uppercase tracking-wide text-[#59665d] outline-none transition hover:bg-[#e8ecdf] focus-visible:ring-2 focus-visible:ring-[#536c51]"
      >
        <option value="uz">UZ</option>
        <option value="en">EN</option>
        <option value="ru">RU</option>
      </select>
    </form>
  );
}
