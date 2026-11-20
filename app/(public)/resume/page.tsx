import Link from "next/link";

import ResumeStudio from "@/components/profile/ResumeStudio";
import type { CandidateProfileValues } from "@/components/profile/CandidateProfileForm";
import { requireCandidate } from "@/lib/auth";
import { getLocale, translate } from "@/lib/i18n";

export const instant = false;

export default async function ResumePage() {
  const [viewer, locale] = await Promise.all([requireCandidate(), getLocale()]);
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  const { data: profile, error } = await viewer.supabase
    .from("profiles")
    .select("full_name, phone, age, city, desired_position, experience_years, previous_company, previous_role, education, skills, portfolio_url, cv_url, about")
    .eq("id", viewer.userId)
    .maybeSingle();

  if (error || !profile) {
    console.error("RESUME PROFILE ERROR:", error?.code, error?.message);
    throw new Error("Could not load your resume details.");
  }

  const initialProfile: CandidateProfileValues = {
    fullName: profile.full_name ?? "",
    email: viewer.email ?? "",
    phone: profile.phone ?? "",
    age: profile.age == null ? "" : String(profile.age),
    city: profile.city ?? "",
    desiredPosition: profile.desired_position ?? "",
    experienceYears: profile.experience_years == null ? "" : String(profile.experience_years),
    previousCompany: profile.previous_company ?? "",
    previousRole: profile.previous_role ?? "",
    education: profile.education ?? "",
    skills: profile.skills ?? "",
    portfolioUrl: profile.portfolio_url ?? "",
    cvUrl: profile.cv_url ?? "",
    about: profile.about ?? "",
  };

  return (
    <main className="site-page-enter mx-auto max-w-7xl px-5 py-10 sm:py-14 lg:px-8">
      <div className="print-hide mb-8 flex flex-wrap items-end justify-between gap-5">
        <div className="max-w-2xl">
          <p className="eyebrow flex items-center gap-3 text-[#536c51]"><span className="h-px w-8 bg-[#536c51]" />{t("resumeEyebrow")}</p>
          <h1 className="display-serif mt-3 text-5xl leading-tight text-[#17231d] sm:text-6xl">{t("resumeTitle")}</h1>
          <p className="mt-3 text-base leading-7 text-[#68736b]">{t("resumeDescription")}</p>
        </div>
        <Link href="/profile" className="rounded-full border border-[#17231d]/15 px-5 py-3 text-sm font-bold text-[#315a42] transition hover:bg-[#e8ecdf]">{t("profile")}</Link>
      </div>
      <ResumeStudio initialProfile={initialProfile} locale={locale} />
    </main>
  );
}
