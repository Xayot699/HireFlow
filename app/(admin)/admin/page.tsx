import Link from "next/link";

import { requireAdmin } from "@/lib/auth";
import { getLocale, translate } from "@/lib/i18n";

type JobRow = { id: string; title: string; status: string; views_count: number };
type ApplicationRow = { id: string; job_id: string; candidate_name: string; status: string; created_at: string };
type JobSummary = { id: string; title: string; company: string };

export default async function AdminDashboard() {
  const [{ supabase }, locale] = await Promise.all([requireAdmin(), getLocale()]);
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  const [jobsResult, applicationsResult, totalApplicationsResult, acceptedApplicationsResult] = await Promise.all([
    supabase.from("jobs").select("id, title, status, views_count"),
    supabase.from("applications").select("id, job_id, candidate_name, status, created_at").order("created_at", { ascending: false }).limit(5),
    supabase.from("applications").select("id", { count: "exact", head: true }),
    supabase.from("applications").select("id", { count: "exact", head: true }).eq("status", "accepted"),
  ]);

  if (jobsResult.error) {
    console.error("DASHBOARD JOB STATS ERROR:", jobsResult.error.code, jobsResult.error.message);
    throw new Error("Failed to load dashboard job statistics.");
  }
  if (applicationsResult.error) {
    console.error("DASHBOARD APPLICATION STATS ERROR:", applicationsResult.error.code, applicationsResult.error.message);
    throw new Error("Failed to load dashboard application statistics.");
  }
  if (totalApplicationsResult.error || acceptedApplicationsResult.error) {
    const error = totalApplicationsResult.error ?? acceptedApplicationsResult.error;
    console.error("DASHBOARD APPLICATION COUNT ERROR:", error?.code, error?.message);
    throw new Error("Failed to count applications.");
  }

  const jobs = (jobsResult.data ?? []) as JobRow[];
  const recentApplications = (applicationsResult.data ?? []) as ApplicationRow[];
  const recentJobIds = [...new Set(recentApplications.map((application) => application.job_id))];
  const { data: relatedJobs, error: relatedJobsError } = recentJobIds.length
    ? await supabase.from("jobs").select("id, title, company").in("id", recentJobIds)
    : { data: [], error: null };

  if (relatedJobsError) {
    console.error("DASHBOARD RECENT JOB ERROR:", relatedJobsError.code, relatedJobsError.message);
    throw new Error("Failed to load recent application jobs.");
  }

  const jobMap = new Map(((relatedJobs ?? []) as JobSummary[]).map((job) => [job.id, job]));
  const stats = [
    { label: t("totalJobs"), value: jobs.length, note: t("allStatuses"), tone: "bg-[#e8ecdf] text-[#315a42]" },
    { label: t("publishedJobs"), value: jobs.filter((job) => job.status === "published").length, note: t("visibleCandidates"), tone: "bg-[#edf4df] text-[#3d6847]" },
    { label: t("jobViews"), value: jobs.reduce((total, job) => total + (Number(job.views_count) || 0), 0), note: t("jobDetailVisits"), tone: "bg-sky-50 text-sky-700" },
    { label: t("totalApplications"), value: totalApplicationsResult.count ?? 0, note: t("candidateSubmissions"), tone: "bg-amber-50 text-amber-700" },
    { label: t("accepted"), value: acceptedApplicationsResult.count ?? 0, note: t("hiredCandidates"), tone: "bg-green-50 text-green-700" },
  ];

  return (
    <main className="site-page-enter mx-auto max-w-7xl p-5 sm:p-8 lg:p-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-[#536c51]">{t("overview")}</p>
          <h1 className="display-serif mt-2 text-4xl text-[#17231d] sm:text-5xl">{t("dashboard")}</h1>
          <p className="mt-2 text-slate-500">{t("liveHiringActivity")}</p>
        </div>
        <Link href="/admin/jobs/new" className="site-cta rounded-full bg-[#17231d] px-5 py-3 text-sm font-bold text-white hover:bg-[#315a42]">+ {t("createJob")}</Link>
      </div>

      <div className="stagger-enter grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map((stat) => (
          <div key={stat.label} className="site-card rounded-3xl border border-[#17231d]/10 bg-[#fbfaf5] p-5 shadow-[0_8px_30px_rgba(23,35,29,0.04)]">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-semibold text-[#68736b]">{stat.label}</p>
              <span className={`grid size-10 place-items-center rounded-xl text-sm font-black ${stat.tone}`}>{stat.value.toLocaleString()}</span>
            </div>
            <p className="mt-5 text-3xl font-black tracking-tight">{stat.value.toLocaleString()}</p>
            <p className="mt-2 text-xs font-medium text-[#8b948b]">{stat.note}</p>
          </div>
        ))}
      </div>

      <div className="mt-7 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="site-card relative overflow-hidden rounded-4xl bg-[#244a39] p-7 text-white sm:p-9">
          <div aria-hidden="true" className="paper-grid absolute inset-0 opacity-10" />
          <div className="relative">
            <p className="eyebrow text-[#c9f36a]">{t("hiringWorkspace")}</p>
            <h2 className="display-serif mt-3 max-w-lg text-4xl text-white">{t("manageJobsTitle")}</h2>
            <p className="mt-3 max-w-xl leading-7 text-slate-300">{t("dashboardDescription")}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/admin/jobs" className="rounded-full bg-[#c9f36a] px-5 py-3 text-sm font-bold text-[#17231d] hover:bg-[#b9e653]">{t("manageJobs")} →</Link>
              <Link href="/admin/applications" className="rounded-full border border-white/20 px-5 py-3 text-sm font-bold text-white hover:bg-white/10">{t("reviewCandidates")}</Link>
            </div>
          </div>
        </section>

        <section className="site-card rounded-4xl border border-[#17231d]/10 bg-[#fbfaf5] p-7 sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <div><p className="eyebrow text-[#536c51]">{t("latestActivity")}</p><h2 className="display-serif mt-2 text-2xl text-[#17231d]">{t("recentApplications")}</h2></div>
            <Link href="/admin/applications" className="text-sm font-bold text-[#315a42] hover:text-[#17231d]">{t("adminSeeAll")}</Link>
          </div>
          <div className="stagger-enter mt-5 divide-y divide-slate-100">
            {recentApplications.length === 0 ? <p className="py-5 text-sm text-[#8b948b]">{t("noRecentApplications")}</p> : recentApplications.map((application) => {
              const job = jobMap.get(application.job_id);
              return (
                <div key={application.id} className="flex items-center gap-3 py-4">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#e8ecdf] font-bold text-[#315a42]">{application.candidate_name.slice(0, 1) || "?"}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-[#17231d]">{application.candidate_name}</p>
                    <p className="mt-0.5 truncate text-xs text-[#68736b]">{job?.title ?? t("archivedUnavailable")}</p>
                  </div>
                  <span className="text-xs font-semibold capitalize text-slate-500">{t(application.status as "pending" | "reviewing" | "accepted" | "rejected")}</span>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
