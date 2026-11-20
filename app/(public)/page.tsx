import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import type { ReactNode } from "react";

import JobCard from "@/components/jobs/JobCard";
import { getViewer } from "@/lib/auth";
import { getPublishedJobs } from "@/lib/data/jobs";
import { getLocale, translate } from "@/lib/i18n";
import { analyzeJobFit, type CandidateFitProfile } from "@/features/jobs/fit";

function typeLetters(text: string, startAt = 0): ReactNode[] {
  return Array.from(text).map((letter, index) => (
    <span
      key={`${startAt}-${index}`}
      aria-hidden="true"
      className="hero-letter"
      style={{ animationDelay: `${180 + (startAt + index) * 52}ms` }}
    >
      {letter === " " ? "\u00a0" : letter}
    </span>
  ));
}

async function HomeContent() {
  await connection();
  const [publishedJobs, locale, viewer] = await Promise.all([getPublishedJobs(), getLocale(), getViewer()]);
  let fitProfile: CandidateFitProfile | null = null;
  if (viewer?.role === "candidate") {
    const { data, error } = await viewer.supabase.from("profiles").select("desired_position, city, skills").eq("id", viewer.userId).maybeSingle();
    if (error) console.error("HOME JOB FIT PROFILE ERROR:", error.code, error.message);
    if (data) fitProfile = { desiredPosition: data.desired_position, city: data.city, skills: data.skills };
  }
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  const featuredJobs = publishedJobs.slice(0, 3);
  const companyCount = new Set(publishedJobs.map((job) => job.company)).size;
  const remoteCount = publishedJobs.filter((job) => job.workMode === "remote").length;
  const titleStart = t("heroFirst");
  const titlePrefix = t("heroSecondPrefix");
  const titleAccent = t("heroAccent");
  const titleStartIndex = Array.from(titleStart).length + 1;
  const titleAccentIndex = titleStartIndex + Array.from(titlePrefix).length;
  const titleEndIndex = titleAccentIndex + Array.from(titleAccent).length;

  return (
    <main className="site-page-enter overflow-hidden">
      <section className="relative border-b border-[#17231d]/10 bg-[#f4f3ec]">
        <div aria-hidden="true" className="paper-grid absolute inset-0 opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent_80%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-5 pb-16 pt-16 sm:pb-20 sm:pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8 lg:pb-24 lg:pt-24">
          <div className="relative z-10">
            <p className="eyebrow flex items-center gap-3 text-[#536c51]">
              <span className="h-px w-8 bg-[#536c51]" />
              {t("heroEyebrow")}
            </p>
            <h1 aria-label={`${titleStart} ${titlePrefix}${titleAccent}.`} className="display-serif mt-7 max-w-3xl text-[clamp(3.5rem,7.3vw,6.6rem)] leading-[0.94] text-[#17231d]">
              <span aria-hidden="true">{typeLetters(titleStart)}</span><br />
              <span aria-hidden="true">{typeLetters(titlePrefix, titleStartIndex)}<span className="hero-highlight relative inline-block italic text-[#536c51]">{typeLetters(titleAccent, titleAccentIndex)}<span aria-hidden="true" className="hero-highlight-mark absolute -bottom-1 left-0 -z-10 h-3 w-full -rotate-2 bg-[#c9f36a]" /></span>{typeLetters(".", titleEndIndex)}</span>
            </h1>
            <p className="mt-7 max-w-lg text-base leading-7 text-[#59665d] sm:text-lg sm:leading-8">
              {t("heroParagraph")}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/jobs" className="site-cta group inline-flex items-center gap-5 rounded-full bg-[#17231d] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#315a42]">
                {t("heroCta")}
                <span aria-hidden="true" className="grid size-7 place-items-center rounded-full bg-[#c9f36a] text-[#17231d] transition group-hover:translate-x-0.5">↗</span>
              </Link>
              <span className="text-sm font-medium text-[#68736b]"><strong className="text-[#17231d]">{publishedJobs.length}</strong> {t("jobsExplore")}</span>
            </div>
            <div className="mt-12 flex flex-wrap gap-x-7 gap-y-3 border-t border-[#17231d]/15 pt-5 text-xs font-semibold uppercase tracking-wider text-[#68736b]">
              <span className="inline-flex items-center gap-2"><span className="text-[#536c51]">01</span> {t("stepOne")}</span>
              <span className="inline-flex items-center gap-2"><span className="text-[#536c51]">02</span> {t("stepTwo")}</span>
              <span className="inline-flex items-center gap-2"><span className="text-[#536c51]">03</span> {t("stepThree")}</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl lg:ml-auto">
            <div className="hero-art relative isolate aspect-[1.08] overflow-hidden rounded-[2rem] bg-[#dfe5cf] shadow-[0_28px_80px_rgba(23,35,29,0.14)]">
              <div aria-hidden="true" className="hero-art-sky absolute inset-0" />
              <div aria-hidden="true" className="hero-orbit hero-orbit-outer absolute -right-10 -top-14 size-[22rem] rounded-full border border-[#17231d]/15" />
              <div aria-hidden="true" className="hero-orbit hero-orbit-inner absolute -right-1 -top-5 size-64 rounded-full border border-[#17231d]/15" />
              <div aria-hidden="true" className="hero-hill hero-hill-back absolute bottom-[13%] -left-[12%] h-[35%] w-[125%] rounded-[50%] bg-[#718467]" />
              <div aria-hidden="true" className="hero-hill hero-hill-front absolute -bottom-[12%] -left-[8%] h-[48%] w-[120%] rounded-[48%] bg-[#536c51]" />
              <div aria-hidden="true" className="hero-sun absolute bottom-[27%] left-[14%] size-24 rounded-full bg-[#c9f36a] shadow-[0_0_80px_rgba(201,243,106,0.48)] sm:size-28" />
              <span aria-hidden="true" className="hero-art-spark absolute right-[25%] top-[27%] text-2xl text-[#536c51]">✳</span>
              <div className="absolute inset-x-5 top-5 z-10 flex items-start justify-between gap-3 sm:inset-x-7 sm:top-7">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#17231d]/10 bg-[#f8f8f1]/85 px-4 py-2.5 text-xs font-black uppercase tracking-[0.14em] text-[#17231d] shadow-sm backdrop-blur-md">
                  <span aria-hidden="true" className="hero-live-dot size-2 rounded-full bg-[#6f9e3b]" />
                  {publishedJobs.length} {t("artOpen")}
                </span>
                <span aria-hidden="true" className="hero-compass grid size-11 shrink-0 place-items-center rounded-full bg-[#17231d] text-lg text-[#c9f36a] shadow-lg sm:size-12">✳</span>
              </div>
              <p aria-hidden="true" className="absolute right-4 top-[42%] z-10 hidden -rotate-90 text-[9px] font-black uppercase tracking-[0.24em] text-[#315a42]/80 sm:block">{t("artDirection")}</p>

              <div className="hero-feature-card absolute inset-x-4 bottom-4 z-20 rounded-2xl border border-white/70 bg-[#fbfaf5]/95 p-4 shadow-[0_20px_55px_rgba(23,35,29,0.2)] backdrop-blur-xl sm:inset-x-7 sm:bottom-7 sm:p-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="eyebrow text-[#536c51]">{t("artExplore")}</p>
                  <span className="rounded-full bg-[#e8ecdf] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#315a42]">{t("artFeatured")}</span>
                </div>
                {featuredJobs[0] ? (
                  <Link href={`/jobs/${featuredJobs[0].id}`} className="group flex items-center gap-3 rounded-xl outline-none transition hover:bg-[#f0f2e9] focus-visible:ring-2 focus-visible:ring-[#536c51] sm:gap-4">
                    <span aria-hidden="true" className="grid size-12 shrink-0 place-items-center rounded-xl bg-[#17231d] text-lg font-black text-[#c9f36a] shadow-sm sm:size-14">{featuredJobs[0].company.slice(0, 1)}</span>
                    <span className="min-w-0 flex-1 py-1">
                      <span className="block truncate text-base font-black tracking-tight text-[#17231d] sm:text-lg">{featuredJobs[0].title}</span>
                      <span className="mt-1 block truncate text-xs font-semibold text-[#68736b]">{featuredJobs[0].company} <span aria-hidden="true">·</span> {featuredJobs[0].location}</span>
                      <span className="mt-1.5 block text-xs font-bold text-[#315a42]">${featuredJobs[0].salaryMin.toLocaleString("en-US")} – ${featuredJobs[0].salaryMax.toLocaleString("en-US")} {t("artPerMonth")}</span>
                    </span>
                    <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-full bg-[#c9f36a] text-lg font-bold text-[#17231d] transition group-hover:translate-x-1 group-hover:bg-[#b9e653]">↗</span>
                  </Link>
                ) : (
                  <div className="flex items-center justify-between gap-4">
                    <p className="display-serif text-2xl text-[#17231d] sm:text-3xl">{t("artNoJobs")}</p>
                    <Link href="/jobs" className="grid size-10 shrink-0 place-items-center rounded-full bg-[#c9f36a] font-bold text-[#17231d]">↗</Link>
                  </div>
                )}
                <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#17231d]/10 pt-3">
                  <span className="text-xs font-semibold text-[#68736b]">{t("sectionDescription")}</span>
                  <Link href="/jobs" className="shrink-0 text-xs font-black text-[#315a42] underline decoration-[#315a42]/30 underline-offset-4 transition hover:decoration-[#315a42]">{t("artAll")}</Link>
                </div>
              </div>
            </div>
            <span aria-hidden="true" className="absolute -right-2 top-[42%] hidden -rotate-90 text-[10px] font-bold uppercase tracking-[0.25em] text-[#536c51] xl:block">{t("artNextMove")}</span>
          </div>
        </div>
      </section>

      <section aria-label={t("proofTitle")} className="relative mx-auto -mt-1 max-w-7xl px-5 pb-4 lg:px-8">
        <div className="overflow-hidden rounded-[1.75rem] border border-[#17231d]/10 bg-[#17231d] text-white shadow-[0_24px_60px_rgba(23,35,29,0.15)]">
          <div className="grid sm:grid-cols-[1.1fr_2fr]">
            <div className="relative overflow-hidden p-6 sm:p-8">
              <span aria-hidden="true" className="absolute -right-8 -top-12 size-40 rounded-full border border-white/10" />
              <span aria-hidden="true" className="absolute -right-1 -top-5 size-24 rounded-full border border-white/10" />
              <p className="eyebrow relative text-[#c9f36a]">{t("proofEyebrow")}</p>
              <h2 className="display-serif relative mt-3 max-w-xs text-3xl leading-tight text-white sm:text-4xl">{t("proofTitle")}</h2>
            </div>
            <div className="grid grid-cols-3 border-t border-white/10 sm:border-l sm:border-t-0">
              {[
                { value: publishedJobs.length, label: t("proofJobs"), icon: "↗" },
                { value: companyCount, label: t("proofCompanies"), icon: "◉" },
                { value: remoteCount, label: t("proofRemote"), icon: "⌘" },
              ].map((metric, index) => (
                <div key={metric.label} className={`relative flex min-h-32 flex-col justify-between p-4 sm:min-h-40 sm:p-7 ${index > 0 ? "border-l border-white/10" : ""}`}>
                  <span aria-hidden="true" className="text-lg text-[#c9f36a]">{metric.icon}</span>
                  <div>
                    <p className="display-serif text-4xl leading-none text-white sm:text-5xl">{metric.value}</p>
                    <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.12em] text-white/60 sm:text-xs">{metric.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:py-20 lg:px-8">
        <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-[#536c51]">{t("sectionEyebrow")}</p>
            <h2 className="display-serif mt-2 text-4xl text-[#17231d] sm:text-5xl">{t("sectionTitle")}</h2>
            <p className="mt-3 text-sm text-[#68736b]">{t("sectionDescription")}</p>
          </div>

          <Link href="/jobs" className="group inline-flex items-center gap-3 rounded-full border border-[#17231d]/15 px-5 py-3 text-sm font-bold text-[#17231d] transition hover:border-[#536c51] hover:bg-[#e9ecdf]">
            {t("seeAll")} <span aria-hidden="true" className="transition group-hover:translate-x-1">↗</span>
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {featuredJobs.length > 0 ? (
            featuredJobs.map((job) => (
              <JobCard key={job.id} job={job} locale={locale} fit={fitProfile ? analyzeJobFit(job, fitProfile) : undefined} />
            ))
          ) : (
            <p className="rounded-3xl border border-[#17231d]/10 bg-[#fbfaf5] p-6 text-sm text-[#68736b] md:col-span-2 lg:col-span-3">
              {t("noJobs")}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
          <p className="text-sm text-[#68736b]">Loading opportunities...</p>
        </main>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
