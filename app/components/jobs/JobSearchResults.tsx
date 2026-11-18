"use client";

import { useMemo, useState } from "react";

import JobCard from "@/components/jobs/JobCard";
import type { Job } from "@/types/job";

const filters = [
  { label: "All jobs", value: "all" },
  { label: "On-site", value: "onsite" },
  { label: "Hybrid", value: "hybrid" },
  { label: "Remote", value: "remote" },
] as const;

type Props = {
  jobs: Job[];
};

export default function JobSearchResults({ jobs }: Props) {
  const [query, setQuery] = useState("");
  const [workMode, setWorkMode] = useState<(typeof filters)[number]["value"]>("all");

  const filteredJobs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return jobs.filter((job) => {
      const matchesWorkMode = workMode === "all" || job.workMode === workMode;
      const searchableText = [
        job.title,
        job.company,
        job.location,
        job.description,
        ...job.skills,
      ]
        .join(" ")
        .toLowerCase();

      return matchesWorkMode && (!normalizedQuery || searchableText.includes(normalizedQuery));
    });
  }, [jobs, query, workMode]);

  return (
    <>
      <section aria-label="Search and filter jobs" className="relative z-10 -mt-7 rounded-3xl border border-[#17231d]/10 bg-[#fbfaf5] p-3 shadow-[0_16px_50px_rgba(23,35,29,0.1)] sm:p-4">
        <label htmlFor="job-search" className="sr-only">
          Search jobs by title, company, location, or skill
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-[#17231d]/10 bg-white px-4 py-3.5 transition focus-within:border-[#536c51] focus-within:ring-4 focus-within:ring-[#536c51]/10">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="size-5 shrink-0 text-[#536c51]">
              <circle cx="10.8" cy="10.8" r="6.8" stroke="currentColor" strokeWidth="1.7" />
              <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
            <input
              id="job-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Job title, company, skill or location"
              className="min-w-0 flex-1 bg-transparent text-sm font-medium text-[#17231d] outline-none placeholder:text-[#8b948b]"
            />
            <span className="hidden rounded-md border border-[#17231d]/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#8b948b] md:inline">Live</span>
          </div>
          <a href="#job-results" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#c9f36a] px-6 py-3.5 text-sm font-bold text-[#17231d] transition hover:bg-[#b9e653]">
            Find a job <span aria-hidden="true">↗</span>
          </a>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 px-1 pb-1">
          <span className="mr-1 text-xs font-bold uppercase tracking-wider text-[#7b867d]">Work style</span>
          {filters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              aria-pressed={workMode === filter.value}
              onClick={() => setWorkMode(filter.value)}
              className={`rounded-full px-3.5 py-2 text-xs font-bold transition ${
                workMode === filter.value
                  ? "bg-[#17231d] text-white"
                  : "text-[#59665d] hover:bg-[#e8e9df] hover:text-[#17231d]"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </section>

      <div id="job-results" className="mb-5 mt-12 flex flex-wrap items-end justify-between gap-3 scroll-mt-28">
        <div>
          <p className="eyebrow text-[#536c51]">Made for your next chapter</p>
          <h2 className="display-serif mt-2 text-3xl text-[#17231d] sm:text-4xl">Open positions</h2>
        </div>
        <p aria-live="polite" className="text-sm font-medium text-[#68736b]">
          <span className="font-bold text-[#17231d]">{filteredJobs.length}</span> {filteredJobs.length === 1 ? "job" : "jobs"} found
        </p>
      </div>

      {filteredJobs.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-[#17231d]/20 bg-white/70 px-6 py-16 text-center">
          <span aria-hidden="true" className="mx-auto grid size-14 place-items-center rounded-full bg-[#e8ecdf] text-xl text-[#536c51]">⌕</span>
          <h3 className="display-serif mt-5 text-2xl text-[#17231d]">No exact matches. Yet.</h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#68736b]">
            Try a different keyword or clear your filters. The right job might be one search away.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setWorkMode("all");
            }}
            className="mt-5 rounded-full border border-[#17231d]/15 px-5 py-2.5 text-sm font-bold text-[#17231d] transition hover:bg-[#e8e9df]"
          >
            Clear search
          </button>
        </div>
      )}
    </>
  );
}
