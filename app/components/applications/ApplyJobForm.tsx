"use client";

import { useActionState } from "react";
import Link from "next/link";

import { applyToJob } from "@/features/applications/actions";
import { initialApplyState } from "@/features/applications/action-state";
import { translate, type Locale } from "@/lib/messages";

type Props = {
  jobId: string;
  defaultName: string;
  defaultEmail: string;
  locale: Locale;
};

const inputClass = "w-full rounded-xl border border-[#17231d]/15 bg-white px-4 py-3 text-sm outline-none focus:border-[#536c51] focus:ring-4 focus:ring-[#536c51]/10";

export default function ApplyJobForm({ jobId, defaultName, defaultEmail, locale }: Props) {
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  const actionForJob = applyToJob.bind(null, jobId);
  const [state, action, pending] = useActionState(actionForJob, initialApplyState);

  return (
    <form action={action} className="site-card space-y-5 rounded-2xl bg-[#fbfaf5] p-5 text-[#17231d]">
      <div>
        <h2 className="text-xl font-black">{t("applicationFormTitle")}</h2>
        <p className="mt-1 text-sm text-[#68736b]">{t("applicationFormHint")}</p>
      </div>
      <div>
        <label htmlFor="candidateName" className="mb-2 block text-sm font-bold">{t("fullName")}</label>
        <input id="candidateName" value={defaultName} readOnly aria-readonly="true" className={`${inputClass} bg-[#f4f3ec] text-[#68736b]`} />
      </div>
      <div>
        <label htmlFor="contactEmail" className="mb-2 block text-sm font-bold">{t("contactEmail")}</label>
        <input id="contactEmail" type="email" value={defaultEmail} readOnly aria-readonly="true" className={`${inputClass} bg-[#f4f3ec] text-[#68736b]`} />
      </div>
      <div>
        <label htmlFor="cvUrl" className="mb-2 block text-sm font-bold">{t("cvUrl")}</label>
        <input id="cvUrl" name="cvUrl" type="url" placeholder="https://example.com/cv" className={inputClass} />
        <p className="mt-2 text-xs leading-5 text-[#68736b]">{t("cvOptionalHint")} <Link href="/resume" className="font-bold text-[#315a42] underline underline-offset-2">{t("openResumeBuilder")}</Link></p>
      </div>
      <div>
        <label htmlFor="coverLetter" className="mb-2 block text-sm font-bold">{t("coverLetter")}</label>
        <textarea id="coverLetter" name="coverLetter" rows={4} maxLength={1500} placeholder={t("coverLetterPlaceholder")} className={inputClass} />
      </div>
      {state.error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{state.error}</p>}
      <button type="submit" disabled={pending} className="site-cta w-full rounded-full bg-[#c9f36a] px-5 py-3 font-black text-[#17231d] transition hover:bg-[#d3fa7d] disabled:cursor-wait disabled:opacity-60">
        {pending ? t("submitting") : t("submitApplication")}
      </button>
    </form>
  );
}
