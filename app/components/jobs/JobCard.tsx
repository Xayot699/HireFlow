import Link from "next/link";

import type { Job } from "@/types/job";
import { translate, type Locale } from "@/lib/messages";
import type { JobFit } from "@/features/jobs/fit";

type Props = {
  job: Job;
  locale?: Locale;
  fit?: JobFit;
};

export default function JobCard({ job, locale = "en", fit }: Props) {
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  return (
    <article className="site-card job-card-enter group flex h-full flex-col rounded-3xl border border-[#17231d]/10 bg-[#fbfaf5] p-6 shadow-[0_8px_30px_rgba(23,35,29,0.04)] transition-[transform,border-color,box-shadow,background-color] duration-300 hover:-translate-y-1.5 hover:border-[#536c51]/50 hover:bg-white hover:shadow-[0_18px_45px_rgba(23,35,29,0.12)] focus-within:border-[#536c51]/50 focus-within:ring-4 focus-within:ring-[#536c51]/10">
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <div className="mb-4 grid size-12 place-items-center rounded-2xl bg-[#e8ecdf] text-lg font-black text-[#315a42] ring-1 ring-[#536c51]/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
            {job.company.slice(0, 1)}
          </div>
          <p className="text-sm font-semibold text-[#68736b]">{job.company}</p>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-[#17231d]">{job.title}</h2>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#edf4df] px-3 py-1.5 text-xs font-bold text-[#3d6847] ring-1 ring-[#536c51]/10">
          <span className="size-1.5 rounded-full bg-[#5b9b57]" />
          {t("hiring")}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 text-xs font-medium text-[#59665d]">
        <span className="rounded-lg bg-[#eeeee7] px-3 py-2">{job.location}</span>
        <span className="rounded-lg bg-[#eeeee7] px-3 py-2">{t(job.workMode as "remote" | "hybrid" | "onsite")}</span>
        <span className="rounded-lg bg-[#eeeee7] px-3 py-2">{t(job.employmentType === "full_time" ? "fullTime" : job.employmentType === "part_time" ? "partTime" : "contract")}</span>
      </div>

      <p className="mt-5 line-clamp-2 text-sm leading-6 text-[#68736b]">{job.description}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {job.skills.map((skill) => (
          <span key={skill} className="rounded-full border border-[#536c51]/15 bg-[#e8ecdf]/70 px-3 py-1.5 text-xs font-semibold text-[#315a42]">
            {skill}
          </span>
        ))}
      </div>

      {fit && (
        <div className="mt-5 rounded-2xl border border-[#536c51]/15 bg-[#f4f6ed] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#536c51]">{t("fitEstimate")}</p>
              <p className="mt-1 text-xs text-[#68736b]">{t("fitBasedOnProfile")}</p>
            </div>
            {fit.score !== null && <span className={`display-serif text-3xl ${fit.score >= 75 ? "text-[#315a42]" : "text-[#765f2e]"}`}>{fit.score}<span className="text-base">%</span></span>}
          </div>
          {fit.score === null ? (
            <p className="mt-3 text-xs leading-5 text-[#68736b]">{t("fitCompleteProfile")} <Link href="/profile" className="font-bold text-[#315a42] underline underline-offset-2">{t("profile")}</Link></p>
          ) : (
            <>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#17231d]/10"><div className="h-full rounded-full bg-[#6f9e3b] transition-[width] duration-700" style={{ width: `${fit.score}%` }} /></div>
              <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-semibold">
                {fit.matchedSkills.length > 0 && <span className="text-[#315a42]">✓ {fit.matchedSkills.join(" · ")}</span>}
                {fit.nextSkill && <span className="text-[#765f2e]">↗ {t("fitNextSkill")}: {fit.nextSkill}</span>}
              </div>
            </>
          )}
        </div>
      )}

      <div className="mt-auto flex flex-wrap items-end justify-between gap-4 border-t border-[#17231d]/10 pt-6">
        <p className="font-bold text-[#17231d]">
          <span className="text-lg">${job.salaryMin.toLocaleString("en-US")} – ${job.salaryMax.toLocaleString("en-US")}</span>
          <span className="mt-1 block text-xs font-medium text-[#8b948b]">{t("salaryMonth")}</span>
        </p>

        <Link
          href={`/jobs/${job.id}`}
          className="site-cta inline-flex min-h-11 items-center gap-2 rounded-full bg-[#17231d] px-5 py-3 text-sm font-bold text-white transition group-hover:bg-[#315a42] group-focus-within:bg-[#315a42]"
        >
          {t("details")} <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}
