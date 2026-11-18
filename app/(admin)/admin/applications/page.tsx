import { applications } from "@/data/applications";
import { jobs } from "@/data/jobs";

const statusStyles: Record<string, string> = {
  pending: "bg-[#f7efd9] text-[#765f2e]",
  reviewing: "bg-[#e7eee2] text-[#315a42]",
  accepted: "bg-[#edf4df] text-[#3d6847]",
  rejected: "bg-[#f5e6e1] text-[#8a5042]",
};  

export default function AdminApplicationsPage() {
  return (
    <main className="mx-auto max-w-7xl p-5 sm:p-8 lg:p-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-[#536c51]">Candidate pipeline</p>
          <h1 className="display-serif mt-2 text-4xl text-[#17231d] sm:text-5xl">Applications</h1>
          <p className="mt-2 text-[#68736b]">Review candidate interest across your open jobs.</p>
        </div>
        <span className="rounded-full border border-[#17231d]/15 bg-[#fbfaf5] px-4 py-2 text-sm font-semibold text-[#68736b]">
          {applications.length} candidates
        </span>
      </div>

      <div className="overflow-hidden rounded-3xl border border-[#17231d]/10 bg-[#fbfaf5] shadow-[0_8px_30px_rgba(23,35,29,0.04)]">
        <div className="border-b border-[#17231d]/10 px-6 py-5 sm:px-7">
          <h2 className="font-black text-[#17231d]">All candidates</h2>
          <p className="mt-1 text-sm text-[#68736b]">Application details and current review stage</p>
        </div>
        <div className="divide-y divide-[#17231d]/10">
          {applications.map((application) => {
            const job = jobs.find((item) => item.id === application.jobId);

            return (
              <div key={application.id} className="flex flex-wrap items-center justify-between gap-4 p-6 transition hover:bg-[#f4f3ec] sm:px-7">
                <div className="flex min-w-0 items-center gap-4">
                  <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#e8ecdf] text-lg font-black text-[#315a42]">
                    {application.candidateName.slice(0, 1)}
                  </span>
                  <div className="min-w-0">
                    <h2 className="font-bold text-[#17231d]">{application.candidateName}</h2>
                    <p className="mt-1 truncate text-sm text-[#68736b]">{application.candidateEmail}</p>
                    <p className="mt-2 text-sm text-[#59665d]">
                      Applied for <span className="font-bold text-[#334139]">{job?.title ?? "Unknown Job"}</span>
                    </p>
                  </div>
                </div>

                <div className="ml-16 flex items-center gap-3 sm:ml-0 sm:gap-5">
                  <div className="text-right">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#8b948b]">Applied</p>
                    <p className="mt-1 text-sm font-semibold text-[#59665d]">{application.appliedAt}</p>
                  </div>
                  <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold capitalize ${statusStyles[application.status]}`}>
                    <span className="size-1.5 rounded-full bg-current" />
                    {application.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p className="mt-5 rounded-2xl border border-[#536c51]/15 bg-[#e8ecdf] px-5 py-4 text-sm leading-6 text-[#536c51]">
        <strong>Demo workspace:</strong> status updates will be enabled in a future lesson.
      </p>
    </main>
  );
}
