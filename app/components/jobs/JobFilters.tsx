
import Link from "next/link";

import type {
  JobsFilters,
} from "@/lib/jobs/filters";

type Props = {
  filters: JobsFilters;
};

export default function JobFilters({
  filters,
}: Props) {
  return (
    <form
      key={JSON.stringify(filters)}
      action="/jobs"
      method="GET"
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h2 className="mb-5 text-xl font-semibold">
        Search & Filters
      </h2>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* SEARCH INPUT */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="q"
            className="text-sm font-medium"
          >
            Job Title
          </label>

          <input
            id="q"
            name="q"
            type="search"
            placeholder="Search jobs..."
            defaultValue={filters.q}
            maxLength={80}
            className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
          />
        </div>

        {/* LOCATION */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="location"
            className="text-sm font-medium"
          >
            Location
          </label>

          <select
            id="location"
            name="location"
            defaultValue={filters.location}
            className="rounded-lg border border-slate-300 bg-white px-4 py-3"
          >
            <option value="">All Locations</option>
            <option value="Tashkent">Tashkent</option>
            <option value="Samarkand">Samarkand</option>
            <option value="Remote">Remote</option>
          </select>
        </div>

        {/* WORK MODE */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="mode"
            className="text-sm font-medium"
          >
            Work Mode
          </label>

          <select
            id="mode"
            name="mode"
            defaultValue={filters.workMode}
            className="rounded-lg border border-slate-300 bg-white px-4 py-3"
          >
            <option value="">All Modes</option>
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
            <option value="onsite">On-site</option>
          </select>
        </div>

        {/* EMPLOYMENT TYPE */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="type"
            className="text-sm font-medium"
          >
            Employment Type
          </label>

          <select
            id="type"
            name="type"
            defaultValue={filters.employmentType}
            className="rounded-lg border border-slate-300 bg-white px-4 py-3"
          >
            <option value="">All Types</option>
            <option value="full_time">Full-time</option>
            <option value="part_time">Part-time</option>
            <option value="contract">Contract</option>
          </select>
        </div>

        {/* SORTING */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="sort"
            className="text-sm font-medium"
          >
            Sort By
          </label>

          <select
            id="sort"
            name="sort"
            defaultValue={filters.sort}
            className="rounded-lg border border-slate-300 bg-white px-4 py-3"
          >
            <option value="newest">Newest First</option>
            <option value="salary_high">
              Salary: High to Low
            </option>
            <option value="salary_low">
              Salary: Low to High
            </option>
          </select>
        </div>

        {/* ACTIONS */}
        <div className="flex items-end gap-3">
          <button
            type="submit"
            className="flex-1 rounded-lg bg-blue-700 px-5 py-3 font-medium text-white hover:bg-blue-800"
          >
            Search Jobs
          </button>

          <Link
            href="/jobs"
            className="rounded-lg border border-slate-300 px-5 py-3 font-medium text-slate-700 hover:bg-slate-50"
          >
            Clear
          </Link>
        </div>
      </div>
    </form>
  );
}