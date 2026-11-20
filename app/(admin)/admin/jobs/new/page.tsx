import Link from "next/link";
import { Suspense } from "react";

import JobForm from "@/components/admin/JobForm";
import { requireAdmin } from "@/lib/auth";
import { getLocale, translate, type Locale } from "@/lib/i18n";

async function ProtectedForm({ locale }: { locale: Locale }) {
  await requireAdmin();
  return <JobForm locale={locale} />;
}

export default async function NewJobPage() {
  const locale = await getLocale();
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  return (
    <main className="site-page-enter mx-auto max-w-5xl p-5 sm:p-8 lg:p-10">
      <Link href="/admin/jobs" className="text-sm font-semibold text-[#315a42] hover:underline">← {t("manageJobs")}</Link>
      <div className="my-8">
        <p className="eyebrow text-[#536c51]">{t("createJob")}</p>
        <h1 className="display-serif mt-2 text-4xl text-[#17231d]">{t("jobFormTitle")}</h1>
        <p className="mt-3 text-sm text-[#68736b]">{t("publishingStatus")}</p>
      </div>
      <Suspense fallback={<p className="text-sm text-[#68736b]">Checking admin access...</p>}>
        <ProtectedForm locale={locale} />
      </Suspense>
    </main>
  );
}
