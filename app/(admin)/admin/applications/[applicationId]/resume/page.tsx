import Link from "next/link";
import { notFound } from "next/navigation";

import PrintResumeButton from "@/components/applications/PrintResumeButton";
import { requireAdmin } from "@/lib/auth";
import { getLocale, translate } from "@/lib/i18n";

type Props = { params: Promise<{ applicationId: string }> };
type ResumeSnapshot = {
  fullName?: string; email?: string; phone?: string; city?: string;
  desired_position?: string; experience_years?: number | null;
  previous_company?: string | null; previous_role?: string | null;
  education?: string | null; skills?: string; portfolio_url?: string | null; about?: string | null;
};

export default async function ApplicationResumePage({ params }: Props) {
  const [{ applicationId }, locale, { supabase }] = await Promise.all([params, getLocale(), requireAdmin()]);
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  const { data, error } = await supabase
    .from("applications")
    .select("id, candidate_name, contact_email, resume_snapshot")
    .eq("id", applicationId)
    .maybeSingle();

  if (error) {
    console.error("APPLICATION RESUME LOAD ERROR:", error.code, error.message);
    throw new Error("Could not load this candidate's resume.");
  }
  if (!data) notFound();

  const resume = (data.resume_snapshot ?? {}) as ResumeSnapshot;
  const skills = typeof resume.skills === "string" ? resume.skills.split(",").map((skill) => skill.trim()).filter(Boolean) : [];
  const experienceYears = typeof resume.experience_years === "number" ? resume.experience_years : null;

  return (
    <main className="mx-auto max-w-4xl px-5 py-10 sm:py-14">
      <div className="print-hide mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin/applications" className="text-sm font-bold text-[#315a42] hover:underline">← {t("applicationsPageTitle")}</Link>
        <PrintResumeButton locale={locale} />
      </div>
      <article className="resume-print-sheet overflow-hidden rounded-3xl border border-[#17231d]/10 bg-white shadow-[0_18px_55px_rgba(23,35,29,0.1)]">
        <header className="relative overflow-hidden bg-[#17231d] px-8 py-10 text-white sm:px-12 sm:py-14">
          <span aria-hidden="true" className="absolute -right-12 -top-20 size-72 rounded-full border border-white/10" />
          <span aria-hidden="true" className="absolute -right-2 -top-12 size-52 rounded-full border border-white/10" />
          <p className="eyebrow relative text-[#c9f36a]">{t("resumePreview")}</p>
          <h1 className="display-serif relative mt-4 break-words text-4xl leading-tight text-white sm:text-6xl">{resume.fullName || data.candidate_name}</h1>
          <p className="relative mt-2 text-lg font-semibold text-[#d0d7cf]">{resume.desired_position || t("candidateRole")}</p>
          <div className="relative mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs text-white/65">
            {resume.city && <span>{resume.city}</span>}{resume.phone && <span>{resume.phone}</span>}<span>{resume.email || data.contact_email}</span>
          </div>
        </header>
        <div className="space-y-8 px-8 py-9 sm:px-12 sm:py-12">
          {resume.about && <section><h2 className="eyebrow text-[#536c51]">{t("aboutMe")}</h2><p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#59665d]">{resume.about}</p></section>}
          <section>
            <h2 className="eyebrow text-[#536c51]">{t("experience")}</h2>
            <div className="mt-3 border-l-2 border-[#c9f36a] pl-4">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1"><h3 className="font-black text-[#17231d]">{resume.previous_role || resume.desired_position || t("previousPosition")}</h3>{experienceYears !== null && <span className="text-xs font-semibold text-[#68736b]">{experienceYears} {t("yearsExperience")}</span>}</div>
              {resume.previous_company && <p className="mt-1 text-sm font-semibold text-[#536c51]">{resume.previous_company}</p>}
            </div>
          </section>
          {resume.education && <section><h2 className="eyebrow text-[#536c51]">{t("education")}</h2><p className="mt-3 text-sm font-semibold text-[#17231d]">{resume.education}</p></section>}
          {skills.length > 0 && <section><h2 className="eyebrow text-[#536c51]">{t("skills")}</h2><div className="mt-3 flex flex-wrap gap-2">{skills.map((skill) => <span key={skill} className="rounded-full bg-[#edf4df] px-3 py-1.5 text-xs font-bold text-[#315a42]">{skill}</span>)}</div></section>}
          {resume.portfolio_url && <section><h2 className="eyebrow text-[#536c51]">{t("portfolioUrl")}</h2><p className="mt-2 break-all text-sm font-semibold text-[#315a42]">{resume.portfolio_url}</p></section>}
        </div>
        <footer className="border-t border-[#17231d]/10 px-8 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[#8b948b] sm:px-12">HireFlow · {t("resumeFooter")}</footer>
      </article>
    </main>
  );
}
