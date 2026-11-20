import Link from "next/link";

import { buildJobsUrl } from "@/lib/jobs/filters";
import type { JobsFilters } from "@/lib/jobs/filters";
import { translate, type Locale } from "@/lib/i18n";

type Props = {
  filters: JobsFilters;
  total: number;
  pageSize: number;
  locale: Locale;
};

export default function JobsPagination({ filters, total, pageSize, locale }: Props) {
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  const currentPage = filters.page;
  const startPage = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
  const endPage = Math.min(totalPages, startPage + 4);
  const pages = Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index);
  const controlClass = "inline-flex min-h-10 items-center justify-center rounded-xl border border-[#17231d]/15 bg-white px-3 text-sm font-semibold text-[#315a42] transition hover:border-[#315a42]/40 hover:bg-[#f3f5ed] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315a42]";
  const disabledClass = "inline-flex min-h-10 items-center justify-center rounded-xl border border-[#17231d]/10 px-3 text-sm font-semibold text-[#9aa198]";

  return (
    <nav aria-label="Jobs pagination" className="mt-10 rounded-2xl border border-[#17231d]/10 bg-white/80 p-4 sm:p-5">
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <p aria-live="polite" className="text-sm text-[#68736b]">
          {t("page")} <span className="font-bold text-[#17231d]">{currentPage}</span> {t("of")} <span className="font-bold text-[#17231d]">{totalPages}</span>
          <span className="mx-2 text-[#b4bbb4]">·</span>
          {total} {t("jobCount")}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-1.5">
          {currentPage > 1 ? (
            <Link href={buildJobsUrl(filters, 1)} aria-label={`${t("first")} ${t("page")}`} className={`${controlClass} hidden sm:inline-flex`}>{t("first")}</Link>
          ) : (
            <span aria-disabled="true" className={`${disabledClass} hidden sm:inline-flex`}>{t("first")}</span>
          )}
          {currentPage > 1 ? (
            <Link href={buildJobsUrl(filters, currentPage - 1)} rel="prev" className={controlClass}>← <span className="ml-1 hidden sm:inline">{t("previous")}</span></Link>
          ) : (
            <span aria-disabled="true" className={disabledClass}>← <span className="ml-1 hidden sm:inline">{t("previous")}</span></span>
          )}

          {startPage > 1 && (
            <>
              <Link href={buildJobsUrl(filters, 1)} aria-label="Page 1" className={`${controlClass} hidden sm:inline-flex`}>1</Link>
              {startPage > 2 && <span aria-hidden="true" className="px-1 text-[#8b948b]">…</span>}
            </>
          )}
          {pages.map((pageNumber) => (
            <Link
              key={pageNumber}
              href={buildJobsUrl(filters, pageNumber)}
              aria-label={`Page ${pageNumber}`}
              aria-current={pageNumber === currentPage ? "page" : undefined}
              className={pageNumber === currentPage
                ? "inline-flex min-h-10 min-w-10 items-center justify-center rounded-xl bg-[#315a42] px-3 text-sm font-bold text-white shadow-sm"
                : `${controlClass} min-w-10`}
            >
              {pageNumber}
            </Link>
          ))}
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span aria-hidden="true" className="px-1 text-[#8b948b]">…</span>}
              <Link href={buildJobsUrl(filters, totalPages)} aria-label={`Page ${totalPages}`} className={`${controlClass} hidden sm:inline-flex`}>{totalPages}</Link>
            </>
          )}

          {currentPage < totalPages ? (
            <Link href={buildJobsUrl(filters, currentPage + 1)} rel="next" className={controlClass}><span className="mr-1 hidden sm:inline">{t("next")}</span>→</Link>
          ) : (
            <span aria-disabled="true" className={disabledClass}><span className="mr-1 hidden sm:inline">{t("next")}</span>→</span>
          )}
          {currentPage < totalPages ? (
            <Link href={buildJobsUrl(filters, totalPages)} aria-label={`${t("last")} ${t("page")}`} className={`${controlClass} hidden sm:inline-flex`}>{t("last")}</Link>
          ) : (
            <span aria-disabled="true" className={`${disabledClass} hidden sm:inline-flex`}>{t("last")}</span>
          )}
        </div>
      </div>
    </nav>
  );
}
