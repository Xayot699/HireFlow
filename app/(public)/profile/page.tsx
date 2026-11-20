
import { Suspense } from "react";

import CandidateProfileForm from "@/components/profile/CandidateProfileForm";
import type { CandidateProfileValues } from "@/components/profile/CandidateProfileForm";

import {
  requireCandidate,
} from "@/lib/auth";
import { getLocale, translate } from "@/lib/i18n";

export const instant = false;

async function ProfileContent({ locale }: { locale: import("@/lib/i18n").Locale }) {
  const viewer = await requireCandidate();
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  const { data: profile, error } = await viewer.supabase
    .from("profiles")
    .select("full_name, phone, age, city, desired_position, experience_years, previous_company, previous_role, education, skills, portfolio_url, cv_url, about")
    .eq("id", viewer.userId)
    .maybeSingle();

  if (error || !profile) {
    console.error("PROFILE DETAILS ERROR:", error?.code, error?.message);
    throw new Error("Failed to load candidate profile details.");
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
    <>
      <div className="mb-7 flex flex-wrap items-center gap-4 rounded-3xl border border-[#17231d]/10 bg-[#244a39] p-5 text-white shadow-[0_12px_40px_rgba(23,35,29,0.08)] sm:p-6">
        <span aria-hidden="true" className="grid size-14 place-items-center rounded-2xl bg-[#c9f36a] text-xl font-black text-[#17231d]">
          {(viewer.fullName || "C").slice(0, 1).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <p className="eyebrow text-[#c9f36a]">{t("candidateAccount")}</p>
          <h2 className="mt-1 truncate text-xl font-bold">{viewer.fullName || t("candidateRole")}</h2>
          <p className="mt-1 truncate text-sm text-white/70">{viewer.email}</p>
        </div>
        <span className="rounded-full border border-white/20 px-3 py-1.5 text-xs font-bold capitalize text-white/85">{viewer.role}</span>
      </div>

      <CandidateProfileForm initialProfile={initialProfile} locale={locale} />
    </>
  );
}

export default async function ProfilePage() {
  const locale = await getLocale();
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  return (
    <main className="site-page-enter mx-auto max-w-6xl px-5 py-10 sm:py-14">
      <div className="mb-8 max-w-2xl">
        <p className="eyebrow flex items-center gap-3 text-[#536c51]">
          <span className="h-px w-8 bg-[#536c51]" /> {t("profilePageEyebrow")}
        </p>

        <h1 className="display-serif mt-3 text-5xl leading-tight text-[#17231d] sm:text-6xl">
          {t("profilePageTitle")}
        </h1>

        <p className="mt-3 text-base leading-7 text-[#68736b]">
          {t("profilePageDescription")}
        </p>
      </div>

      <Suspense
        fallback={<p className="rounded-2xl border border-[#17231d]/10 bg-[#fbfaf5] p-6 text-sm text-[#68736b]">{t("loadingProfile")}</p>}
      >
        <ProfileContent locale={locale} />
      </Suspense>
    </main>
  );
}
