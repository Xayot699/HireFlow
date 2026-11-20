import Link from "next/link";

import type { JobsFilters } from "@/lib/jobs/filters";
import { translate, type Locale } from "@/lib/i18n";

type Props = { filters: JobsFilters; locale?: Locale };

const controlClass = "min-h-12 w-full rounded-xl border border-[#17231d]/15 bg-white px-4 py-3 text-sm font-medium text-[#17231d] outline-none transition placeholder:text-[#9aa198] focus:border-[#536c51] focus:ring-4 focus:ring-[#536c51]/10";
const labelClass = "mb-2 block text-xs font-bold uppercase tracking-[0.08em] text-[#68736b]";

export default function JobFilters({ filters, locale = "en" }: Props) {
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  return (
    <form
      key={JSON.stringify(filters)}
      action="/jobs"
      method="GET"
      className="rounded-3xl border border-[#17231d]/10 bg-[#fbfaf5] p-5 shadow-[0_12px_40px_rgba(23,35,29,0.05)] sm:p-7"
    >
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-[#17231d]/10 pb-4">
        <div>
          <p className="eyebrow text-[#536c51]">{t("filterEyebrow")}</p>
          <h2 className="display-serif mt-1 text-2xl text-[#17231d]">{t("filterTitle")}</h2>
        </div>
        <p className="text-xs font-medium text-[#8b948b]">{t("filterHint")}</p>
      </div>

      <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label htmlFor="q" className={labelClass}>{t("jobTitle")}</label>
          <input id="q" name="q" type="search" placeholder={t("jobTitlePlaceholder")} defaultValue={filters.q} maxLength={80} className={controlClass} />
        </div>

        <div>
          <label htmlFor="location" className={labelClass}>{t("location")}</label>
          <select id="location" name="location" defaultValue={filters.location} className={controlClass}>
            <option value="">{t("allLocations")}</option>
            <option value="Tashkent">Tashkent</option>
            <option value="Samarkand">Samarkand</option>
            <option value="Remote">{t("remote")}</option>
          </select>
        </div>

        <div>
          <label htmlFor="mode" className={labelClass}>{t("workMode")}</label>
          <select id="mode" name="mode" defaultValue={filters.workMode} className={controlClass}>
            <option value="">{t("anyWorkMode")}</option>
            <option value="remote">{t("remote")}</option>
            <option value="hybrid">{t("hybrid")}</option>
            <option value="onsite">{t("onsite")}</option>
          </select>
        </div>

        <div>
          <label htmlFor="type" className={labelClass}>{t("employmentType")}</label>
          <select id="type" name="type" defaultValue={filters.employmentType} className={controlClass}>
            <option value="">{t("anyEmploymentType")}</option>
            <option value="full_time">{t("fullTime")}</option>
            <option value="part_time">{t("partTime")}</option>
            <option value="contract">{t("contract")}</option>
          </select>
        </div>

        <div>
          <label htmlFor="sort" className={labelClass}>{t("sortResults")}</label>
          <select id="sort" name="sort" defaultValue={filters.sort} className={controlClass}>
            <option value="newest">{t("newestFirst")}</option>
            <option value="salary_high">{t("salaryHigh")}</option>
            <option value="salary_low">{t("salaryLow")}</option>
          </select>
        </div>

        <div>
          <label htmlFor="perPage" className={labelClass}>{t("jobsPerPage")}</label>
          <select id="perPage" name="perPage" defaultValue={String(filters.pageSize)} className={controlClass}>
            <option value="3">3</option>
            <option value="6">6</option>
            <option value="9">9</option>
          </select>
        </div>
      </div>

      <div className="mt-6 flex flex-col-reverse gap-3 border-t border-[#17231d]/10 pt-5 sm:flex-row sm:justify-end">
        <Link href="/jobs" className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#17231d]/15 px-6 text-sm font-bold text-[#59665d] transition hover:bg-[#eeeee7] hover:text-[#17231d]">
          {t("clearFilters")}
        </Link>
        <button type="submit" className="site-cta inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#17231d] px-7 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#315a42] hover:shadow-md">
          {t("searchJobs")} <span aria-hidden="true">↗</span>
        </button>
      </div>
    </form>
  );
}
