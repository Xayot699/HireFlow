"use client";

import { useActionState, useState } from "react";

import { saveCandidateProfile } from "@/features/profile/actions";
import { initialProfileActionState } from "@/features/profile/action-state";
import type { CandidateProfileValues } from "@/components/profile/CandidateProfileForm";
import { translate, type Locale } from "@/lib/messages";

type Props = { initialProfile: CandidateProfileValues; locale: Locale };

const fields = [
  ["fullName", "fullName", "Ali Karimov"],
  ["desiredPosition", "desiredPosition", "Frontend Developer"],
  ["city", "city", "Tashkent"],
  ["phone", "phone", "+998 90 123 45 67"],
  ["experienceYears", "yearsExperience", "3"],
  ["previousCompany", "previousCompany", "Company name"],
  ["previousRole", "previousPosition", "Your role"],
  ["education", "education", "University or qualification"],
  ["skills", "skills", "React, TypeScript, Product thinking"],
  ["portfolioUrl", "portfolioUrl", "https://..."],
] as const;

export default function ResumeStudio({ initialProfile, locale }: Props) {
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  const [profile, setProfile] = useState(initialProfile);
  const [state, action, pending] = useActionState(saveCandidateProfile, initialProfileActionState);
  const update = (field: keyof CandidateProfileValues, value: string) => setProfile((current) => ({ ...current, [field]: value }));
  const label = (field: (typeof fields)[number][0], key: string) => t(key as Parameters<typeof translate>[1]);

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <form action={action} className="print-hide rounded-3xl border border-[#17231d]/10 bg-[#fbfaf5] p-5 shadow-[0_12px_40px_rgba(23,35,29,0.05)] sm:p-7">
        <input type="hidden" name="email" value={profile.email} />
        <input type="hidden" name="age" value={profile.age} />
        <input type="hidden" name="cvUrl" value={profile.cvUrl} />
        <div className="mb-6 border-b border-[#17231d]/10 pb-5">
          <p className="eyebrow text-[#536c51]">{t("resumeEditor")}</p>
          <h2 className="display-serif mt-2 text-3xl text-[#17231d]">{t("resumeDetails")}</h2>
          <p className="mt-2 text-sm leading-6 text-[#68736b]">{t("resumeDetailsHint")}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map(([field, messageKey, placeholder]) => (
            <label key={field} className={`flex flex-col gap-1.5 text-xs font-bold text-[#68736b] ${field === "skills" || field === "education" ? "sm:col-span-2" : ""}`}>
              {label(field, messageKey)}
              <input
                name={field}
                value={profile[field]}
                onChange={(event) => update(field, event.target.value)}
                required={["fullName", "desiredPosition", "city", "experienceYears", "skills"].includes(field)}
                type={field === "portfolioUrl" ? "url" : field === "experienceYears" ? "number" : "text"}
                min={field === "experienceYears" ? 0 : undefined}
                max={field === "experienceYears" ? 60 : undefined}
                maxLength={field === "skills" ? 500 : 200}
                placeholder={placeholder}
                className="rounded-xl border border-[#17231d]/15 bg-white px-3.5 py-3 text-sm font-medium text-[#17231d] outline-none focus:border-[#536c51] focus:ring-4 focus:ring-[#536c51]/10"
              />
            </label>
          ))}
          <label className="flex flex-col gap-1.5 text-xs font-bold text-[#68736b] sm:col-span-2">
            {t("aboutMe")}
            <textarea name="about" value={profile.about} onChange={(event) => update("about", event.target.value)} rows={4} maxLength={2000} placeholder={t("aboutPlaceholder")} className="resize-y rounded-xl border border-[#17231d]/15 bg-white px-3.5 py-3 text-sm font-medium leading-6 text-[#17231d] outline-none focus:border-[#536c51] focus:ring-4 focus:ring-[#536c51]/10" />
          </label>
        </div>
        {state.error && <p role="alert" className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-800">{state.error}</p>}
        {state.message && <p role="status" className="mt-4 rounded-xl bg-[#edf4df] p-3 text-sm font-semibold text-[#315a42]">{state.message}</p>}
        <div className="mt-6 flex flex-wrap gap-3 border-t border-[#17231d]/10 pt-5">
          <button type="submit" disabled={pending} className="site-cta rounded-full bg-[#17231d] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#315a42] disabled:opacity-60">{pending ? t("savingProfile") : t("saveResume")}</button>
          <button type="button" onClick={() => window.print()} className="rounded-full bg-[#c9f36a] px-5 py-3 text-sm font-black text-[#17231d] transition hover:bg-[#b9e653]">{t("downloadResume")}</button>
        </div>
      </form>

      <article className="resume-print-sheet overflow-hidden rounded-3xl border border-[#17231d]/10 bg-white shadow-[0_18px_55px_rgba(23,35,29,0.1)]">
        <header className="relative overflow-hidden bg-[#17231d] px-7 py-9 text-white sm:px-10 sm:py-12">
          <span aria-hidden="true" className="absolute -right-10 -top-20 size-64 rounded-full border border-white/10" />
          <span aria-hidden="true" className="absolute -right-2 -top-12 size-48 rounded-full border border-white/10" />
          <p className="eyebrow relative text-[#c9f36a]">{t("resumePreview")}</p>
          <h2 className="display-serif relative mt-4 break-words text-4xl leading-tight text-white sm:text-5xl">{profile.fullName || t("fullName")}</h2>
          <p className="relative mt-2 text-lg font-semibold text-[#d0d7cf]">{profile.desiredPosition || t("desiredPosition")}</p>
          <div className="relative mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs text-white/65">
            {profile.city && <span>{profile.city}</span>}{profile.phone && <span>{profile.phone}</span>}{profile.email && <span>{profile.email}</span>}
          </div>
        </header>
        <div className="space-y-7 px-7 py-8 sm:px-10 sm:py-10">
          {profile.about && <section><h3 className="eyebrow text-[#536c51]">{t("aboutMe")}</h3><p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#59665d]">{profile.about}</p></section>}
          <section>
            <h3 className="eyebrow text-[#536c51]">{t("experience")}</h3>
            <div className="mt-3 border-l-2 border-[#c9f36a] pl-4">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h4 className="font-black text-[#17231d]">{profile.previousRole || profile.desiredPosition || t("previousPosition")}</h4>
                {profile.experienceYears && <span className="text-xs font-semibold text-[#68736b]">{profile.experienceYears} {t("yearsExperience")}</span>}
              </div>
              {profile.previousCompany && <p className="mt-1 text-sm font-semibold text-[#536c51]">{profile.previousCompany}</p>}
            </div>
          </section>
          {profile.education && <section><h3 className="eyebrow text-[#536c51]">{t("education")}</h3><p className="mt-3 text-sm font-semibold text-[#17231d]">{profile.education}</p></section>}
          {profile.skills && <section><h3 className="eyebrow text-[#536c51]">{t("skills")}</h3><div className="mt-3 flex flex-wrap gap-2">{profile.skills.split(",").map((skill) => skill.trim()).filter(Boolean).map((skill) => <span key={skill} className="rounded-full bg-[#edf4df] px-3 py-1.5 text-xs font-bold text-[#315a42]">{skill}</span>)}</div></section>}
          {profile.portfolioUrl && <section><h3 className="eyebrow text-[#536c51]">{t("portfolioUrl")}</h3><p className="mt-2 break-all text-sm font-semibold text-[#315a42]">{profile.portfolioUrl}</p></section>}
        </div>
        <footer className="border-t border-[#17231d]/10 px-7 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[#8b948b] sm:px-10">HireFlow · {t("resumeFooter")}</footer>
      </article>
    </div>
  );
}
