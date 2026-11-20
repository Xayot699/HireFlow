import Link from "next/link";
import { Suspense } from "react";

import { requireAdmin } from "@/lib/auth";
import { updateJobStatus } from "@/features/jobs/status-actions";
import { getLocale, translate, type Locale } from "@/lib/i18n";

type AdminJob = {
  id: string;
  title: string;
  company: string;
  location: string;
  status: "draft" | "published" | "archived";
  created_at: string;
  views_count: number;
};

const statusStyles: Record<AdminJob["status"], string> = {
  draft: "bg-[#f7efd9] text-[#765f2e]",
  published: "bg-[#edf4df] text-[#3d6847]",
  archived: "bg-[#eeeee7] text-[#68736b]",
};

async function JobsTable({ locale }: { locale: Locale }) {
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("jobs")
    .select("id, title, company, location, status, created_at, views_count")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("ADMIN JOBS ERROR:", error.code, error.message);
    throw new Error("Failed to load jobs.");
  }

  const jobs = (data ?? []) as AdminJob[];

  const { data: applicationRows, error: applicationError } = await supabase
    .from("applications")
    .select("job_id, status");

  if (applicationError) {
    console.error("ADMIN JOB APPLICATION COUNTS ERROR:", applicationError.code, applicationError.message);
    throw new Error("Failed to load job application counts.");
  }

  const applicationsByJob = new Map<string, { total: number; accepted: number }>();
  for (const application of (applicationRows ?? []) as { job_id: string; status: string }[]) {
    const counts = applicationsByJob.get(application.job_id) ?? { total: 0, accepted: 0 };
    counts.total += 1;
    if (application.status === "accepted") counts.accepted += 1;
    applicationsByJob.set(application.job_id, counts);
  }

  if (jobs.length === 0) {
    return <p className="p-8 text-sm text-[#68736b]">{t("noVacancies")}</p>;
  }

  return (
    <div className="stagger-enter divide-y divide-[#17231d]/10">
      {jobs.map((job) => (
        <article key={job.id} className="site-card flex flex-wrap items-center justify-between gap-4 p-6 transition hover:bg-[#f4f3ec]">
          <div className="min-w-48">
            <h2 className="font-bold text-[#17231d]">{job.title}</h2>
            <p className="mt-1 text-sm text-[#68736b]">{job.company} · {job.location}</p>
            <p className="mt-2 text-xs font-medium text-[#8b948b]">
              {(Number(job.views_count) || 0).toLocaleString()} {t("views")} · {applicationsByJob.get(job.id)?.total ?? 0} {t("applicationCount")} · {applicationsByJob.get(job.id)?.accepted ?? 0} {t("acceptedCount")}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className={`rounded-full px-3 py-1.5 text-xs font-bold capitalize ${statusStyles[job.status]}`}>
              {t(job.status)}
            </span>
            <form action={updateJobStatus} className="flex flex-wrap items-center gap-2">
              <input type="hidden" name="jobId" value={job.id} />
              <label className="sr-only" htmlFor={`status-${job.id}`}>{t("status")}: {job.title}</label>
              <select
                id={`status-${job.id}`}
                name="status"
                defaultValue={job.status}
                className="rounded-lg border border-[#17231d]/15 bg-white px-3 py-2 text-sm text-[#17231d]"
              >
                <option value="draft">{t("draft")}</option>
                <option value="published">{t("published")}</option>
                <option value="archived">{t("archived")}</option>
              </select>
              <button type="submit" className="rounded-full border border-[#17231d]/15 px-4 py-2 text-sm font-bold text-[#315a42] transition hover:bg-[#e8ecdf]">
                {t("saveStatus")}
              </button>
            </form>
            <Link
              href={`/admin/jobs/${encodeURIComponent(job.id)}/edit`}
              className="rounded-full border border-[#17231d]/15 px-4 py-2 text-sm font-bold text-[#315a42] transition hover:bg-[#e8ecdf]"
            >
              {t("edit")}
            </Link>
            {job.status === "archived" ? (
              <form action={updateJobStatus}>
                <input type="hidden" name="jobId" value={job.id} />
                <input type="hidden" name="status" value="published" />
                <button type="submit" className="rounded-full bg-[#edf4df] px-4 py-2 text-sm font-bold text-[#3d6847] transition hover:bg-[#dcebc7]">
                  {t("restorePublish")}
                </button>
              </form>
            ) : (
              <form action={updateJobStatus}>
                <input type="hidden" name="jobId" value={job.id} />
                <input type="hidden" name="status" value="archived" />
                <button type="submit" className="rounded-full border border-[#17231d]/15 px-4 py-2 text-sm font-bold text-[#68736b] transition hover:bg-[#eeeee7]">
                  {t("archive")}
                </button>
              </form>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}

export default async function AdminJobsPage() {
  const locale = await getLocale();
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  return (
    <main className="site-page-enter mx-auto max-w-7xl p-5 sm:p-8 lg:p-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-[#536c51]">{t("yourOpenings")}</p>
          <h1 className="display-serif mt-2 text-4xl text-[#17231d] sm:text-5xl">{t("manageJobsTitle")}</h1>
          <p className="mt-2 text-[#68736b]">{t("manageJobsDescription")}</p>
        </div>
        <Link href="/admin/jobs/new" className="site-cta rounded-full bg-[#17231d] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#315a42]">
          + {t("createJob")}
        </Link>
      </div>

      <section className="overflow-hidden rounded-3xl border border-[#17231d]/10 bg-[#fbfaf5] shadow-[0_8px_30px_rgba(23,35,29,0.04)]">
        <div className="border-b border-[#17231d]/10 px-6 py-5 sm:px-7">
          <h2 className="font-black text-[#17231d]">{t("allVacancies")}</h2>
          <p className="mt-1 text-sm text-[#68736b]">{t("workspaceJobs")}</p>
        </div>
        <Suspense fallback={<p className="p-8 text-sm text-[#68736b]">{t("loadingJobs")}</p>}>
          <JobsTable locale={locale} />
        </Suspense>
      </section>
    </main>
  );
}
