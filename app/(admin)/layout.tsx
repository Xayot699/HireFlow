
import {
  Suspense,
  type ReactNode,
} from "react";

import AdminSidebar from "@/components/layout/AdminSidebar";
import ThemeToggle from "@/components/layout/ThemeToggle";
import LanguagePicker from "@/components/layout/LanguagePicker";
import { getLocale, translate } from "@/lib/i18n";
import { requireAdmin } from "@/lib/auth";

type Props = {
  children: ReactNode;
};

async function AdminShell({
  children,
}: Props) {
  // UI ko'rsatilishidan oldin
  // Admin rolini tekshirish
  await requireAdmin();
  const locale = await getLocale();

  return (
    <div className="min-h-screen md:flex">
      <AdminSidebar />

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-[#17231d]/10 bg-[#f4f3ec]/90 px-5 py-4 backdrop-blur-xl sm:px-8">
          <div>
            <h1 className="text-base font-black tracking-tight text-[#17231d]">{translate(locale, "dashboard")}</h1>
          <p className="mt-0.5 text-xs font-medium text-[#68736b]">{translate(locale, "dashboardDescription")}</p>
          </div>
          <div className="flex items-center gap-2">
            <LanguagePicker locale={locale} />
            <ThemeToggle locale={locale} />
          </div>
        </header>

        {children}
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: Props) {
  return (
    <Suspense
      fallback={
        <div className="p-10 text-slate-500">
          Checking permissions...
        </div>
      }
    >
      <AdminShell>
        {children}
      </AdminShell>
    </Suspense>
  );
}
