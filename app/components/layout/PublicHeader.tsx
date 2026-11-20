
import Link from "next/link";

import { getViewer } from "@/lib/auth";
import { logout } from "@/app/auth/actions";
import ThemeToggle from "@/components/layout/ThemeToggle";
import LanguagePicker from "@/components/layout/LanguagePicker";
import { getLocale, translate } from "@/lib/i18n";

export default async function PublicHeader() {
  const viewer = await getViewer();
  const locale = await getLocale();
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  const linkClass = "shrink-0 rounded-full px-3.5 py-2 text-sm font-semibold text-[#59665d] transition hover:bg-[#e8ecdf] hover:text-[#17231d] focus-visible:bg-[#e8ecdf]";

  return (
    <header className="sticky top-0 z-40 border-b border-[#17231d]/10 bg-[#f4f3ec]/90 shadow-[0_4px_24px_rgba(23,35,29,0.04)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:py-4 lg:px-8">
        <Link href="/" aria-label={`HireFlow · ${t("home")}`} className="group inline-flex w-fit items-center gap-3 rounded-xl focus-visible:outline-offset-4">
          <span aria-hidden="true" className="grid size-10 place-items-center rounded-xl bg-[#17231d] text-sm font-black text-[#c9f36a] shadow-sm transition group-hover:rotate-[-4deg]">H</span>
          <span className="text-xl font-black tracking-tight text-[#17231d]">Hire<span className="text-[#536c51]">Flow</span></span>
        </Link>

        <nav aria-label={t("home")} className="flex max-w-full items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          <Link href="/" className={linkClass}>{t("home")}</Link>
          <Link href="/jobs" className={linkClass}>{t("jobs")}</Link>

          {!viewer && (
            <>
              <Link href="/login" className={linkClass}>{t("login")}</Link>
              <Link href="/register" className="site-cta ml-1 shrink-0 rounded-full bg-[#c9f36a] px-4 py-2.5 text-sm font-bold text-[#17231d] shadow-sm transition hover:bg-[#b9e653]">{t("register")}</Link>
            </>
          )}

          {viewer?.role === "admin" && (
            <Link href="/messages" className={linkClass}>{t("messagesInboxTitle")}</Link>
          )}

          {viewer?.role === "candidate" && (
            <>
              <Link href="/profile" className={linkClass}>{t("profile")}</Link>
              <Link href="/resume" className={linkClass}>{t("resumeBuilder")}</Link>
              <Link href="/messages" className={linkClass}>{t("messagesInboxTitle")}</Link>
              <Link href="/applications" className={linkClass}>{t("applications")}</Link>
            </>
          )}

          {viewer?.role === "admin" && (
            <Link href="/admin" className={linkClass}>{t("dashboard")}</Link>
          )}

          {viewer && (
            <form action={logout}>
              <button type="submit" className="site-cta ml-1 shrink-0 rounded-full border border-[#17231d]/15 px-4 py-2 text-sm font-bold text-[#59665d] transition hover:border-[#17231d]/30 hover:bg-white hover:text-[#17231d]">{t("logout")}</button>
            </form>
          )}
          <LanguagePicker locale={locale} />
          <ThemeToggle locale={locale} />
        </nav>
      </div>
    </header>
  );
}
