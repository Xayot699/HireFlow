
import Link from "next/link";

import {
  buildJobsUrl,
} from "@/lib/jobs/filters";

import type {
  JobsFilters,
} from "@/lib/jobs/filters";

type Props = {
  filters: JobsFilters;
  total: number;
  pageSize: number;
};

export default function JobsPagination({
  filters,
  total,
  pageSize,
}: Props) {
  const totalPages = Math.ceil(
    total / pageSize
  );

  if (totalPages <= 1) {
    return null;
  }

  const currentPage = filters.page;

  // 5 tagacha sahifa raqami ko'rsatamiz.
  const startPage = Math.max(
    1,
    Math.min(
      currentPage - 2,
      totalPages - 4
    )
  );

  const endPage = Math.min(
    totalPages,
    startPage + 4
  );

  const pages = Array.from(
    {
      length: endPage - startPage + 1,
    },
    (_, index) => startPage + index
  );

  return (
    <nav
      aria-label="Jobs pagination"
      className="mt-10 flex flex-wrap items-center justify-center gap-2"
    >
      {/* PREVIOUS */}
      {currentPage > 1 ? (
        <Link
          href={buildJobsUrl(
            filters,
            currentPage - 1
          )}
          className="rounded-lg border border-slate-300 px-4 py-2 hover:bg-slate-100"
        >
          Previous
        </Link>
      ) : (
        <span className="rounded-lg border border-slate-200 px-4 py-2 text-slate-400">
          Previous
        </span>
      )}

      {/* PAGE NUMBERS */}
      {pages.map((pageNumber) => {
        const active =
          pageNumber === currentPage;

        return (
          <Link
            key={pageNumber}
            href={buildJobsUrl(
              filters,
              pageNumber
            )}
            aria-current={
              active ? "page" : undefined
            }
            className={
              active
                ? "rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white"
                : "rounded-lg border border-slate-300 px-4 py-2 hover:bg-slate-100"
            }
          >
            {pageNumber}
          </Link>
        );
      })}

      {/* NEXT */}
      {currentPage < totalPages ? (
        <Link
          href={buildJobsUrl(
            filters,
            currentPage + 1
          )}
          className="rounded-lg border border-slate-300 px-4 py-2 hover:bg-slate-100"
        >
          Next
        </Link>
      ) : (
        <span className="rounded-lg border border-slate-200 px-4 py-2 text-slate-400">
          Next
        </span>
      )}
    </nav>
  );
}