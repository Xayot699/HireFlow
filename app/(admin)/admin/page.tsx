import Link from "next/link";

import { applications } from "@/data/applications";
import { jobs } from "@/data/jobs";

export default function AdminDashboard() {
  const stats = [
    { label: "Total jobs", value: jobs.length, note: "Across all statuses", tone: "bg-[#e8ecdf] text-[#315a42]" },
    { label: "Published jobs", value: jobs.filter((job) => job.status === "published").length, note: "Visible to candidates", tone: "bg-[#edf4df] text-[#3d6847]" },
    { label: "Applications", value: applications.length, note: "Candidate submissions", tone: "bg-sky-50 text-sky-700" },
    { label: "In review", value: applications.filter((app) => app.status === "reviewing").length, note: "Needs your attention", tone: "bg-amber-50 text-amber-700" },
  ];

  return (
    <main className="mx-auto max-w-7xl p-5 sm:p-8 lg:p-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-[#536c51]">Overview</p>
          <h1 className="display-serif mt-2 text-4xl text-[#17231d] sm:text-5xl">Dashboard</h1>
          <p className="mt-2 text-slate-500">Here’s what’s happening with your hiring pipeline.</p>
        </div>
        <span className="rounded-full border border-[#17231d]/15 bg-[#fbfaf5] px-4 py-2 text-sm font-semibold text-[#68736b]">Demo workspace</span>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-3xl border border-[#17231d]/10 bg-[#fbfaf5] p-6 shadow-[0_8px_30px_rgba(23,35,29,0.04)]">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-semibold text-[#68736b]">{stat.label}</p>
              <span className={`grid size-10 place-items-center rounded-xl text-lg font-black ${stat.tone}`}>{stat.value}</span>
            </div>
            <p className="mt-5 text-4xl font-black tracking-tight">{stat.value}</p>
            <p className="mt-2 text-xs font-medium text-[#8b948b]">{stat.note}</p>
          </div>
        ))}
      </div>

      <div className="mt-7 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="relative overflow-hidden rounded-4xl bg-[#244a39] p-7 text-white sm:p-9">
          <div aria-hidden="true" className="paper-grid absolute inset-0 opacity-10" />
          <div aria-hidden="true" className="absolute -right-20 -top-32 size-80 rounded-full border border-white/15" />
          <div className="relative">
            <p className="eyebrow text-[#c9f36a]">Keep your team moving</p>
            <h2 className="display-serif mt-3 max-w-lg text-4xl text-white">Great hires start with a clear view.</h2>
            <p className="mt-3 max-w-xl leading-7 text-slate-300">
              Manage jobs and review candidates from one place. Your current demo data is ready to explore.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/admin/jobs" className="rounded-full bg-[#c9f36a] px-5 py-3 text-sm font-bold text-[#17231d] transition hover:bg-[#b9e653]">
                Manage jobs <span aria-hidden="true">→</span>
              </Link>
              <Link href="/admin/applications" className="rounded-full border border-white/20 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10">
                Review candidates
              </Link>
            </div>
          </div>
        </section>

        <section className="rounded-4xl border border-[#17231d]/10 bg-[#fbfaf5] p-7 sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="eyebrow text-[#536c51]">Latest activity</p>
              <h2 className="display-serif mt-2 text-2xl text-[#17231d]">Recent applications</h2>
            </div>
            <Link href="/admin/applications" className="text-sm font-bold text-[#315a42] hover:text-[#17231d]">See all →</Link>
          </div>
          <div className="mt-5 divide-y divide-slate-100">
            {applications.slice(0, 3).map((application) => {
              const job = jobs.find((item) => item.id === application.jobId);
              return (
                <div key={application.id} className="flex items-center gap-3 py-4">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#e8ecdf] font-bold text-[#315a42]">
                    {application.candidateName.slice(0, 1)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-[#17231d]">{application.candidateName}</p>
                    <p className="mt-0.5 truncate text-xs text-[#68736b]">{job?.title ?? "Unknown Job"}</p>
                  </div>
                  <span className="text-xs font-semibold capitalize text-slate-400">{application.status}</span>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
