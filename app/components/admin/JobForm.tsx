"use client";

import { useActionState } from "react";

import { createJob, updateJob } from "@/features/jobs/actions";
import { initialJobState } from "@/features/jobs/action-state";
import type { Job } from "@/types/job";
import { translate, type Locale } from "@/lib/messages";

type Props = { job?: Job; locale: Locale };

const inputClass = "w-full rounded-xl border border-[#17231d]/15 bg-white px-4 py-3 text-sm outline-none focus:border-[#536c51] focus:ring-4 focus:ring-[#536c51]/10";
const labelClass = "mb-2 block text-sm font-bold text-[#334139]";

export default function JobForm({ job, locale }: Props) {
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  const [state, action, pending] = useActionState(
    job ? updateJob : createJob,
    initialJobState,
  );

  return (
    <form action={action} className="site-card space-y-6 rounded-3xl border border-[#17231d]/10 bg-[#fbfaf5] p-6 shadow-[0_8px_30px_rgba(23,35,29,0.04)] sm:p-8">
      {job && <input type="hidden" name="jobId" value={job.id} />}
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="title" className={labelClass}>{t("jobFormTitle")}</label>
          <input id="title" name="title" required minLength={3} maxLength={100} defaultValue={job?.title ?? ""} placeholder="React Developer" className={inputClass} />
        </div>
        <div>
          <label htmlFor="company" className={labelClass}>{t("company")}</label>
          <input id="company" name="company" required minLength={2} maxLength={80} defaultValue={job?.company ?? ""} placeholder="TechNova" className={inputClass} />
        </div>
        <div>
          <label htmlFor="location" className={labelClass}>{t("location")}</label>
          <input id="location" name="location" required minLength={2} maxLength={80} defaultValue={job?.location ?? ""} placeholder="Tashkent" className={inputClass} />
        </div>
        <div>
          <label htmlFor="workMode" className={labelClass}>{t("workMode")}</label>
          <select id="workMode" name="workMode" defaultValue={job?.workMode ?? "hybrid"} className={inputClass}>
            <option value="remote">{t("remote")}</option>
            <option value="hybrid">{t("hybrid")}</option>
            <option value="onsite">{t("onsite")}</option>
          </select>
        </div>
        <div>
          <label htmlFor="employmentType" className={labelClass}>{t("employment")}</label>
          <select id="employmentType" name="employmentType" defaultValue={job?.employmentType ?? "full_time"} className={inputClass}>
            <option value="full_time">{t("fullTime")}</option>
            <option value="part_time">{t("partTime")}</option>
            <option value="contract">{t("contract")}</option>
          </select>
        </div>
        <div>
          <label htmlFor="status" className={labelClass}>{t("publishingStatus")}</label>
          <select id="status" name="status" defaultValue={job?.status ?? "draft"} className={inputClass}>
            <option value="draft">{t("draft")}</option>
            <option value="published">{t("published")}</option>
            {job && <option value="archived">{t("archived")}</option>}
          </select>
        </div>
        <div>
          <label htmlFor="salaryMin" className={labelClass}>{t("minimumSalary")}</label>
          <input id="salaryMin" name="salaryMin" type="number" min={0} step="0.01" required defaultValue={job?.salaryMin ?? ""} placeholder="900" className={inputClass} />
        </div>
        <div>
          <label htmlFor="salaryMax" className={labelClass}>{t("maximumSalary")}</label>
          <input id="salaryMax" name="salaryMax" type="number" min={0} step="0.01" required defaultValue={job?.salaryMax ?? ""} placeholder="1600" className={inputClass} />
        </div>
      </div>

      <div>
        <label htmlFor="description" className={labelClass}>{t("description")}</label>
        <textarea id="description" name="description" rows={5} minLength={30} maxLength={5000} required defaultValue={job?.description ?? ""} placeholder={t("descriptionPlaceholder")} className={inputClass} />
      </div>
      <div>
        <label htmlFor="requirements" className={labelClass}>{t("requirements")}</label>
        <textarea id="requirements" name="requirements" rows={5} minLength={5} maxLength={2000} required defaultValue={job?.requirements.join("\n") ?? ""} placeholder={"React experience\nTypeScript knowledge\nREST API experience"} className={inputClass} />
        <p className="mt-2 text-xs text-[#68736b]">{t("oneRequirementPerLine")}</p>
      </div>
      <div>
        <label htmlFor="skills" className={labelClass}>{t("skills")}</label>
        <input id="skills" name="skills" required minLength={2} maxLength={500} defaultValue={job?.skills.join(", ") ?? ""} placeholder="React, TypeScript, Next.js" className={inputClass} />
        <p className="mt-2 text-xs text-[#68736b]">{t("commaSeparatedSkills")}</p>
      </div>

      {state.error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{state.error}</p>}
      <button type="submit" disabled={pending} className="site-cta rounded-full bg-[#17231d] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#315a42] disabled:cursor-wait disabled:opacity-60">
        {pending ? t(job ? "saving" : "creating") : job ? t("saveChanges") : t("createJob")}
      </button>
    </form>
  );
}
