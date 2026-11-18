import Link from "next/link";

import type { Job } from "@/types/job";

type Props = {
  job: Job;
};

const workModeLabels: Record<string, string> = {
  remote: "Remote",
  hybrid: "Hybrid",
  onsite: "On-site",
};

const employmentLabels: Record<string, string> = {
  full_time: "Full-time",
  part_time: "Part-time",
  contract: "Contract",
};

export default function JobCard({ job }: Props) {
  return (
    <article className="job-card-enter group flex h-full flex-col rounded-3xl border border-[#17231d]/10 bg-[#fbfaf5] p-6 shadow-[0_8px_30px_rgba(23,35,29,0.04)] transition-[transform,border-color,box-shadow,background-color] duration-300 hover:-translate-y-1.5 hover:border-[#536c51]/50 hover:bg-white hover:shadow-[0_18px_45px_rgba(23,35,29,0.12)]">
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <div className="mb-4 grid size-12 place-items-center rounded-2xl bg-[#e8ecdf] text-lg font-black text-[#315a42] ring-1 ring-[#536c51]/10">
            {job.company.slice(0, 1)}
          </div>
          <p className="text-sm font-semibold text-[#68736b]">{job.company}</p>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-[#17231d]">{job.title}</h2>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#edf4df] px-3 py-1.5 text-xs font-bold text-[#3d6847] ring-1 ring-[#536c51]/10">
          <span className="size-1.5 rounded-full bg-[#5b9b57]" />
          Hiring
        </span>
      </div>

      <div className="flex flex-wrap gap-2 text-xs font-medium text-[#59665d]">
        <span className="rounded-lg bg-[#eeeee7] px-3 py-2">{job.location}</span>
        <span className="rounded-lg bg-[#eeeee7] px-3 py-2">{workModeLabels[job.workMode]}</span>
        <span className="rounded-lg bg-[#eeeee7] px-3 py-2">{employmentLabels[job.employmentType]}</span>
      </div>

      <p className="mt-5 line-clamp-2 text-sm leading-6 text-[#68736b]">{job.description}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {job.skills.map((skill) => (
          <span key={skill} className="rounded-full border border-[#536c51]/15 bg-[#e8ecdf]/70 px-3 py-1.5 text-xs font-semibold text-[#315a42]">
            {skill}
          </span>
        ))}
      </div>

      <div className="mt-auto flex flex-wrap items-end justify-between gap-4 border-t border-[#17231d]/10 pt-6">
        <p className="font-bold text-[#17231d]">
          <span className="text-lg">${job.salaryMin.toLocaleString("en-US")} – ${job.salaryMax.toLocaleString("en-US")}</span>
          <span className="mt-1 block text-xs font-medium text-[#8b948b]">per month</span>
        </p>

        <Link
          href={`/jobs/${job.id}`}
          className="inline-flex items-center gap-2 rounded-full bg-[#17231d] px-5 py-3 text-sm font-bold text-white transition group-hover:bg-[#315a42]"
        >
          Details <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}
