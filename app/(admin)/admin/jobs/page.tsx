import { jobs } from "@/data/jobs";

const statusStyles: Record<string, string> = {
  draft: "bg-[#f7efd9] text-[#765f2e]",
  published: "bg-[#edf4df] text-[#3d6847]",
  archived: "bg-[#eeeee7] text-[#68736b]",
};

export default function AdminJobsPage() {
  return (
    <main className="mx-auto max-w-7xl p-5 sm:p-8 lg:p-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-[#536c51]">Your openings</p>
          <h1 className="display-serif mt-2 text-4xl text-[#17231d] sm:text-5xl">Manage jobs</h1>
          <p className="mt-2 text-[#68736b]">A complete view of every job in your workspace.</p>
        </div>
        <span className="rounded-full border border-[#17231d]/15 bg-[#fbfaf5] px-4 py-2 text-sm font-semibold text-[#68736b]">
          {jobs.length} total jobs
        </span>
      </div>

      <div className="overflow-hidden rounded-3xl border border-[#17231d]/10 bg-[#fbfaf5] shadow-[0_8px_30px_rgba(23,35,29,0.04)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#17231d]/10 px-6 py-5 sm:px-7">
          <div>
            <h2 className="font-black text-[#17231d]">All vacancies</h2>
            <p className="mt-1 text-sm text-[#68736b]">Draft, published, and archived listings</p>
          </div>
          <span className="rounded-xl bg-[#eeeee7] px-3 py-2 text-xs font-bold uppercase tracking-wider text-[#68736b]">Demo data</span>
        </div>

        <div className="divide-y divide-[#17231d]/10">
          {jobs.map((job) => (
            <div key={job.id} className="flex flex-wrap items-center justify-between gap-4 px-6 py-5 transition hover:bg-[#f4f3ec] sm:px-7">
              <div>
                <div className="flex items-center gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#e8ecdf] font-black text-[#315a42]">{job.company.slice(0, 1)}</span>
                  <div>
                    <h3 className="font-bold text-[#17231d]">{job.title}</h3>
                    <p className="mt-1 text-sm text-[#68736b]">{job.company} <span className="px-1 text-[#a2aaa0]">·</span> {job.location}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 sm:gap-6">
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-bold text-[#334139]">${job.salaryMin.toLocaleString("en-US")} – ${job.salaryMax.toLocaleString("en-US")}</p>
                  <p className="mt-1 text-xs text-[#8b948b]">{job.workMode} · {job.employmentType.replace("_", "-")}</p>
                </div>
                <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold capitalize ${statusStyles[job.status]}`}>
                  <span className="size-1.5 rounded-full bg-current" />
                  {job.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-5 rounded-2xl border border-[#536c51]/15 bg-[#e8ecdf] px-5 py-4 text-sm leading-6 text-[#536c51]">
        <strong>Coming next:</strong> Create, edit, publish, and archive actions will be added in a future lesson.
      </p>
    </main>
  );
}
