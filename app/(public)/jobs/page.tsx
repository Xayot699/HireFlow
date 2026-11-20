
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";

import JobCard from "@/components/jobs/JobCard";
import JobFilters from "@/components/jobs/JobFilters";
import JobsPagination from "@/components/jobs/JobsPagination";

import { searchJobs } from "@/lib/data/jobs";
import { getViewer } from "@/lib/auth";
import { analyzeJobFit, type CandidateFitProfile } from "@/features/jobs/fit";

import {
  parseJobsFilters,
  buildJobsUrl,
} from "@/lib/jobs/filters";

import type {
  RawJobsSearchParams,
} from "@/lib/jobs/filters";
import { getLocale, translate } from "@/lib/i18n";

type Props = {
  searchParams: Promise<RawJobsSearchParams>;
};
type ExplorerProps = Props & { locale: import("@/lib/i18n").Locale };

export const instant = false;

// =====================================
// DYNAMIC JOBS CONTENT
// =====================================

async function JobsExplorer({
  searchParams,
  locale,
}: ExplorerProps) {
  // Supabase's auth/session checks use the current time; run them per request.
  await connection();

  // 1. URL parametrlarini olish
  const rawParams = await searchParams;

  // 2. Parametrlarni tekshirish
  const filters = parseJobsFilters(rawParams);

  // 3. Supabase query bajarish
  const [{ jobs, total, pageSize }, viewer] = await Promise.all([searchJobs(filters), getViewer()]);
  let fitProfile: CandidateFitProfile | null = null;
  if (viewer?.role === "candidate") {
    const { data, error } = await viewer.supabase.from("profiles").select("desired_position, city, skills").eq("id", viewer.userId).maybeSingle();
    if (error) console.error("JOBS FIT PROFILE ERROR:", error.code, error.message);
    if (data) fitProfile = { desiredPosition: data.desired_position, city: data.city, skills: data.skills };
  }

  const totalPages = Math.max(
    1,
    Math.ceil(total / pageSize)
  );
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);

  // Juda katta page yuborilgan bo'lsa,
  // mavjud oxirgi sahifaga o'tkazamiz.
  if (
    total > 0 &&
    filters.page > totalPages
  ) {
    redirect(
      buildJobsUrl(filters, totalPages)
    );
  }

  const start =
    total === 0
      ? 0
      : (filters.page - 1) * pageSize + 1;

  const end = Math.min(
    filters.page * pageSize,
    total
  );

  return (
    <>
      {/* SEARCH AND FILTER */}
      <JobFilters filters={filters} locale={locale} />

      {/* RESULT COUNT */}
      <div className="my-8 flex flex-wrap items-end justify-between gap-4 border-b border-[#17231d]/10 pb-4">
        <div>
          <p className="eyebrow text-[#536c51]">{t("resultsEyebrow")}</p>
          <h2 className="display-serif mt-1 text-3xl text-[#17231d]">{t("availableJobs")}</h2>

          <p className="mt-1 text-sm text-[#68736b]">
            {total} {total === 1 ? t("opportunities") : t("opportunitiesPlural")} {locale === "uz" ? "topildi" : locale === "ru" ? "найдено" : "found"}
          </p>
        </div>

        {total > 0 && (
          <p className="rounded-full bg-[#e8ecdf] px-4 py-2 text-sm font-semibold text-[#315a42]">
            {t("showing")} {start}–{end} {t("of")} {total}
          </p>
        )}
      </div>

      {/* EMPTY STATE */}
      {jobs.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[#17231d]/20 bg-[#fbfaf5] px-6 py-16 text-center">
          <span aria-hidden="true" className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#e8ecdf] text-2xl text-[#536c51]">⌕</span>
          <h3 className="display-serif mt-5 text-3xl text-[#17231d]">
            {t("emptyJobsTitle")}
          </h3>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#68736b]">
            {t("emptyJobsDescription")}
          </p>

          <Link
            href="/jobs"
            className="mt-6 inline-flex min-h-12 items-center rounded-full bg-[#c9f36a] px-6 text-sm font-bold text-[#17231d] transition hover:bg-[#b9e653]"
          >
            {t("clearAllFilters")}
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              locale={locale}
              fit={fitProfile ? analyzeJobFit(job, fitProfile) : undefined}
            />
          ))}
        </div>
      )}

      {/* PAGINATION */}
      <JobsPagination
        filters={filters}
        total={total}
        pageSize={pageSize}
        locale={locale}
      />
    </>
  );
}

// =====================================
// PAGE
// =====================================

export default async function JobsPage({
  searchParams,
}: Props) {
  const locale = await getLocale();
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  return (
    <main className="site-page-enter mx-auto max-w-7xl px-5 py-10 sm:py-14 lg:px-8">
      <div className="mb-9 max-w-3xl sm:mb-12">
        <p className="eyebrow flex items-center gap-3 text-[#536c51]">
          <span className="h-px w-8 bg-[#536c51]" /> {t("jobsPageEyebrow")}
        </p>

        <h1 className="display-serif mt-4 text-5xl leading-[0.98] tracking-tight text-[#17231d] sm:text-6xl">
          {t("jobsPageTitle")}
        </h1>

        <p className="mt-4 max-w-2xl text-base leading-7 text-[#68736b] sm:text-lg">
          {t("jobsPageDescription")}
        </p>
      </div>

      <Suspense
        fallback={
          <div className="rounded-3xl border border-[#17231d]/10 bg-[#fbfaf5] p-8">
            <p className="text-[#68736b]">
              {t("loadingJobs")}
            </p>
          </div>
        }
      >
        <JobsExplorer
          searchParams={searchParams}
          locale={locale}
        />
      </Suspense>
    </main>
  );
}
