
import Link from "next/link";

import { logout } from "@/app/auth/actions";
import { requireAdmin } from "@/lib/auth";
import AdminApplicationBadge from "@/components/layout/AdminApplicationBadge";
import { getLocale, translate } from "@/lib/i18n";

const navigation = [
  { href: "/admin" },
  { href: "/admin/jobs" },
  { href: "/admin/applications" },
  { href: "/messages" },
];

export default async function AdminSidebar() {
  const [{ supabase }, locale] = await Promise.all([requireAdmin(), getLocale()]);
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  const { count, error } = await supabase
    .from("applications")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");

  if (error) {
    console.error("PENDING APPLICATION COUNT ERROR:", error.code, error.message);
  }

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-[#17231d] bg-[#17231d] p-4 text-white sm:p-5 md:sticky md:top-0 md:h-screen md:w-64 md:border-b-0 md:p-6">
      <Link href="/admin" className="group inline-flex w-fit items-center gap-3 rounded-xl focus-visible:outline-offset-4">
        <span aria-hidden="true" className="grid size-10 place-items-center rounded-xl bg-[#c9f36a] text-sm font-black text-[#17231d]">H</span>
        <span className="text-xl font-black tracking-tight">HireFlow<span className="ml-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#c9f36a]">Admin</span></span>
      </Link>

      <nav
        aria-label={t("dashboard")}
        className="mt-4 flex max-w-full gap-2 overflow-x-auto pb-1 md:mt-10 md:flex-col md:overflow-visible md:pb-0"
      >
        {navigation.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="shrink-0 rounded-xl px-4 py-3 text-sm font-semibold text-[#d0d7cf] transition hover:bg-white/10 hover:text-white focus-visible:bg-white/10 md:w-full"
          >
            <span className="flex items-center justify-between gap-3">
              {item.href === "/admin" ? t("dashboard") : item.href === "/admin/jobs" ? t("manageJobs") : item.href === "/admin/applications" ? t("applicationsPageTitle") : t("messagesInboxTitle")}
              {item.href === "/admin/applications" && <AdminApplicationBadge count={count ?? 0} locale={locale} />}
            </span>
          </Link>
        ))}
      </nav>

      <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/10 pt-4 sm:mt-4 md:mt-auto md:block md:space-y-4 md:pt-5">
        <Link
          href="/jobs"
          className="text-sm font-medium text-[#aeb8ae] transition hover:text-white"
        >
          ← {locale === "uz" ? "Saytni ko‘rish" : locale === "ru" ? "Открыть сайт" : "View Public Website"}
        </Link>

        <form action={logout}>
          <button
            type="submit"
            className="rounded-full border border-white/15 px-4 py-2.5 text-sm font-semibold text-[#d0d7cf] transition hover:border-white/30 hover:bg-white/10 hover:text-white md:w-full md:rounded-xl md:py-3 md:text-left"
          >
            {t("logout")}
          </button>
        </form>
      </div>
    </aside>
  );
}
