
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";

import JobCard from "@/components/jobs/JobCard";
import JobFilters from "@/components/jobs/JobFilters";
import JobsPagination from "@/components/jobs/JobsPagination";

import { searchJobs } from "@/lib/data/jobs";

import {
  parseJobsFilters,
  buildJobsUrl,
} from "@/lib/jobs/filters";

import type {
  RawJobsSearchParams,
} from "@/lib/jobs/filters";

type Props = {
  searchParams: Promise<RawJobsSearchParams>;
};

// =====================================
// DYNAMIC JOBS CONTENT
// =====================================

async function JobsExplorer({
  searchParams,
}: Props) {
  // 1. URL parametrlarini olish
  const rawParams = await searchParams;

  // 2. Parametrlarni tekshirish
  const filters = parseJobsFilters(rawParams);

  // 3. Supabase query bajarish
  const {
    jobs,
    total,
    pageSize,
  } = await searchJobs(filters);

  const totalPages = Math.max(
    1,
    Math.ceil(total / pageSize)
  );

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
      <JobFilters filters={filters} />

      {/* RESULT COUNT */}
      <div className="my-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">
            Available Jobs
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {total} jobs found
          </p>
        </div>

        {total > 0 && (
          <p className="text-sm text-slate-500">
            Showing {start}–{end} of {total}
          </p>
        )}
      </div>

      {/* EMPTY STATE */}
      {jobs.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
          <h3 className="text-2xl font-semibold">
            No jobs found
          </h3>

          <p className="mt-3 text-slate-500">
            Try changing your search
            or removing some filters.
          </p>

          <Link
            href="/jobs"
            className="mt-6 inline-flex rounded-lg bg-blue-700 px-5 py-3 font-medium text-white"
          >
            Clear All Filters
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
            />
          ))}
        </div>
      )}

      {/* PAGINATION */}
      <JobsPagination
      
        filters={filters}
        total={total}
        pageSize={pageSize}
      />
    </>
  );
}

// =====================================
// PAGE
// =====================================

export default function JobsPage({
  searchParams,
}: Props) {
  return (
    <main className="mx-auto max-w-6xl px-5 py-12">
      <div className="mb-10">
        <p className="font-medium text-blue-700">
          Explore Opportunities
        </p>

        <h1 className="mt-2 text-4xl font-bold">
          Find Your Next Job
        </h1>

        <p className="mt-3 max-w-2xl text-slate-600">
          Search and discover career
          opportunities from different
          companies.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="rounded-xl border border-slate-200 bg-white p-8">
            <p className="text-slate-500">
              Loading available jobs...
            </p>
          </div>
        }
      >
        <JobsExplorer
          searchParams={searchParams}
        />
      </Suspense>
    </main>
  );
}