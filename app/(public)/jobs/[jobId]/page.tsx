
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getPublishedJobById}  from "@/lib/data/jobs";
import { connection } from "next/server";
import ApplyJobForm from "@/components/applications/ApplyJobForm";
import { getViewer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getLocale, translate, type Locale } from "@/lib/i18n";

export const instant = false;

type Props = {
  params: Promise<{
    jobId: string;
  }>;
};
type LocalizedProps = Props & { locale: Locale };

async function JobDetailsContent({
  params,
  locale,
}: LocalizedProps) {
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  await connection();
  const { jobId } = await params;

  const [job, viewer] = await Promise.all([
    getPublishedJobById(jobId),
    getViewer(),
  ]);

  if (!job) {
    notFound();
  }

  if (viewer?.role !== "admin") {
    const supabase = viewer?.supabase ?? await createClient();
    const { error: viewError } = await supabase.rpc("record_job_view", {
      p_job_id: job.id,
    });
    if (viewError) {
      console.error("RECORD JOB VIEW ERROR:", viewError.code, viewError.message);
    }
  }

  let existingApplication: { id: string; status: string } | null = null;
  if (viewer?.role === "candidate") {
    const { data, error } = await viewer.supabase
      .from("applications")
      .select("id, status")
      .eq("candidate_id", viewer.userId)
      .eq("job_id", job.id)
      .maybeSingle();

    if (error) {
      console.error("CHECK APPLICATION ERROR:", error.code, error.message);
      throw new Error("Could not check application status.");
    }
    existingApplication = data;
  }

  return (
    <div className="mt-8 grid items-start gap-6 lg:grid-cols-[1fr_320px]">
      <article className="site-card overflow-hidden rounded-4xl border border-[#17231d]/10 bg-[#fbfaf5] shadow-[0_12px_40px_rgba(23,35,29,0.05)]">
        <div className="border-b border-[#17231d]/10 p-6 sm:p-9">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="flex items-start gap-4">
              <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[#e8ecdf] text-xl font-black text-[#315a42]">
                {job.company.slice(0, 1)}
              </span>
              <div>
                <p className="eyebrow text-[#536c51]">{job.company}</p>
                <h1 className="display-serif mt-2 text-3xl text-[#17231d] sm:text-4xl">{job.title}</h1>
              </div>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-[#edf4df] px-3 py-2 text-xs font-bold text-[#3d6847]">
              <span className="size-1.5 rounded-full bg-[#5b9b57]" /> {t("hiring")}
            </span>
          </div>

          <div className="mt-7 flex flex-wrap gap-2">
            {[job.location, t(job.workMode as "remote" | "hybrid" | "onsite"), t(job.employmentType === "full_time" ? "fullTime" : job.employmentType === "part_time" ? "partTime" : "contract")].map((item) => (
              <span key={item} className="rounded-lg bg-[#eeeee7] px-3 py-2 text-xs font-bold text-[#59665d]">
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="p-6 sm:p-9">
          <section>
            <p className="eyebrow text-[#536c51]">{t("jobRole")}</p>
            <h2 className="display-serif mt-2 text-2xl text-[#17231d]">{t("jobDescription")}</h2>
            <p className="mt-4 leading-7 text-[#68736b]">{job.description}</p>
          </section>

          <section className="mt-9 border-t border-[#17231d]/10 pt-8">
            <p className="eyebrow text-[#536c51]">{t("requirements")}</p>
            <h2 className="display-serif mt-2 text-2xl text-[#17231d]">{t("requirements")}</h2>
            <ul className="mt-5 space-y-3">
              {job.requirements.map((requirement) => (
                <li key={requirement} className="flex items-start gap-3 text-sm leading-6 text-[#59665d]">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#6f9e3b]" />
                  {requirement}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-9 border-t border-[#17231d]/10 pt-8">
            <p className="eyebrow text-[#536c51]">{t("toolkit")}</p>
            <h2 className="display-serif mt-2 text-2xl text-[#17231d]">{t("requiredSkills")}</h2>
            <div className="mt-5 flex flex-wrap gap-2">
              {job.skills.map((skill) => (
                <span key={skill} className="rounded-full border border-[#536c51]/15 bg-[#e8ecdf]/70 px-3.5 py-2 text-sm font-bold text-[#315a42]">
                  {skill}
                </span>
              ))}
            </div>
          </section>
        </div>
      </article>

      <aside className="rounded-4xl border border-[#17231d]/10 bg-[#244a39] p-6 text-white shadow-[0_12px_40px_rgba(23,35,29,0.1)] lg:sticky lg:top-28">
        <p className="eyebrow text-[#c9f36a]">{t("salaryRange")}</p>
        <p className="mt-3 text-3xl font-black">
          ${job.salaryMin.toLocaleString("en-US")} – ${job.salaryMax.toLocaleString("en-US")}
        </p>
        <p className="mt-1 text-xs font-semibold text-white/60">{t("salaryMonth")}</p>

        <div className="my-6 h-px bg-white/10" />
        {!viewer && (
          <div className="mt-4 rounded-2xl bg-white/10 p-5">
            <p className="text-sm leading-6 text-white/80">{t("signInCandidate")}</p>
            <Link href="/login" className="mt-4 inline-flex rounded-full bg-[#c9f36a] px-5 py-3 text-sm font-black text-[#17231d] transition hover:bg-[#d3fa7d]">
              {t("loginToApply")}
            </Link>
          </div>
        )}

        {viewer?.role === "candidate" && existingApplication && (
          <div className="mt-4 rounded-2xl border border-white/15 bg-white/10 p-5">
            <p className="font-black">{t("alreadyApplied")}</p>
            <p className="mt-2 text-sm text-white/75">{t("applicationStatus")} {t(existingApplication.status as "pending" | "reviewing" | "accepted" | "rejected")}</p>
            <Link href="/applications" className="mt-4 inline-block text-sm font-bold text-[#c9f36a] underline">{t("applications")}</Link>
          </div>
        )}

        {viewer?.role === "candidate" && !existingApplication && (
          <div className="mt-5">
            <ApplyJobForm
              jobId={job.id}
              defaultName={viewer.fullName ?? ""}
              defaultEmail={viewer.email ?? ""}
              locale={locale}
            />
          </div>
        )}

        {viewer?.role === "admin" && (
          <p className="mt-4 rounded-2xl bg-white/10 p-5 text-sm leading-6 text-white/80">
            {t("signInCandidate")}
          </p>
        )}
      </aside>
    </div>
  );
}

export default async function JobDetailsPage({
  params,
}: Props) {
  const locale = await getLocale();
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  return (
    <main className="site-page-enter mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
      <Link
        href="/jobs"
        className="group inline-flex items-center gap-2 rounded-full border border-[#17231d]/15 bg-[#fbfaf5] px-4 py-2.5 text-sm font-bold text-[#59665d] transition hover:border-[#536c51] hover:text-[#17231d]"
      >
        <span aria-hidden="true" className="transition group-hover:-translate-x-0.5">←</span> {t("jobs")}
      </Link>

      <Suspense
        fallback={
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]" aria-label="Loading job details">
            <div className="h-[620px] animate-pulse rounded-4xl border border-[#17231d]/10 bg-[#fbfaf5]" />
            <div className="h-64 animate-pulse rounded-4xl bg-[#244a39]/20" />
          </div>
        }
      >
        <JobDetailsContent params={params} locale={locale} />
      </Suspense>
    </main>
  );
}
