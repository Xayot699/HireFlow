
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getPublishedJobById}  from "@/lib/data/jobs";
import { connection } from "next/server";

type Props = {
  params: Promise<{
    jobId: string;
  }>;
};

async function JobDetailsContent({
  params,
}: Props) {
  await connection();
  const { jobId } = await params;

  const job = await getPublishedJobById(jobId);

  if (!job) {
    notFound();
  }

  return (
    <div className="mt-8 grid items-start gap-6 lg:grid-cols-[1fr_320px]">
      <article className="overflow-hidden rounded-4xl border border-[#17231d]/10 bg-[#fbfaf5] shadow-[0_12px_40px_rgba(23,35,29,0.05)]">
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
              <span className="size-1.5 rounded-full bg-[#5b9b57]" /> Hiring
            </span>
          </div>

          <div className="mt-7 flex flex-wrap gap-2">
            {[job.location, job.workMode, job.employmentType.replace("_", "-")].map((item) => (
              <span key={item} className="rounded-lg bg-[#eeeee7] px-3 py-2 text-xs font-bold text-[#59665d]">
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="p-6 sm:p-9">
          <section>
            <p className="eyebrow text-[#536c51]">The role</p>
            <h2 className="display-serif mt-2 text-2xl text-[#17231d]">Job description</h2>
            <p className="mt-4 leading-7 text-[#68736b]">{job.description}</p>
          </section>

          <section className="mt-9 border-t border-[#17231d]/10 pt-8">
            <p className="eyebrow text-[#536c51]">What we need</p>
            <h2 className="display-serif mt-2 text-2xl text-[#17231d]">Requirements</h2>
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
            <p className="eyebrow text-[#536c51]">Your toolkit</p>
            <h2 className="display-serif mt-2 text-2xl text-[#17231d]">Required skills</h2>
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
        <p className="eyebrow text-[#c9f36a]">Salary range</p>
        <p className="mt-3 text-3xl font-black">
          ${job.salaryMin.toLocaleString("en-US")} – ${job.salaryMax.toLocaleString("en-US")}
        </p>
        <p className="mt-1 text-xs font-semibold text-white/60">per month</p>

        <div className="my-6 h-px bg-white/10" />
        <p className="text-sm font-bold">Ready to make your next move?</p>
        <Link
          href="/profile"
          className="group mt-4 flex items-center justify-center gap-3 rounded-full bg-[#c9f36a] px-5 py-3.5 text-sm font-black text-[#17231d] transition hover:-translate-y-0.5 hover:bg-[#d3fa7d]"
        >
          Complete profile <span aria-hidden="true" className="transition group-hover:translate-x-0.5">→</span>
        </Link>
        <p className="mt-4 text-xs leading-5 text-white/55">
          Job application functionality will be added in a later lesson.
        </p>
      </aside>
    </div>
  );
}

export default  function JobDetailsPage({
  params,
}: Props) {
  return (
    <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
      <Link
        href="/jobs"
        className="group inline-flex items-center gap-2 rounded-full border border-[#17231d]/15 bg-[#fbfaf5] px-4 py-2.5 text-sm font-bold text-[#59665d] transition hover:border-[#536c51] hover:text-[#17231d]"
      >
        <span aria-hidden="true" className="transition group-hover:-translate-x-0.5">←</span> Back to jobs
      </Link>

      <Suspense
        fallback={
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]" aria-label="Loading job details">
            <div className="h-[620px] animate-pulse rounded-4xl border border-[#17231d]/10 bg-[#fbfaf5]" />
            <div className="h-64 animate-pulse rounded-4xl bg-[#244a39]/20" />
          </div>
        }
      >
        <JobDetailsContent params={params} />
      </Suspense>
    </main>
  );
}