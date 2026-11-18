import Link from "next/link";

import JobCard from "@/components/jobs/JobCard";
import { publishedJobs } from "@/data/jobs";

export default function HomePage() {
  const featuredJobs = publishedJobs.slice(0, 3);

  return (
    <main className="overflow-hidden">
      <section className="relative border-b border-[#17231d]/10 bg-[#f4f3ec]">
        <div aria-hidden="true" className="paper-grid absolute inset-0 opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent_80%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-5 pb-16 pt-16 sm:pb-20 sm:pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8 lg:pb-24 lg:pt-24">
          <div className="relative z-10">
            <p className="eyebrow flex items-center gap-3 text-[#536c51]">
              <span className="h-px w-8 bg-[#536c51]" />
              A career, on your terms
            </p>
            <h1 className="display-serif mt-7 max-w-3xl text-[clamp(3.5rem,7.3vw,6.6rem)] leading-[0.94] text-[#17231d]">
              Find work<br />that <span className="relative inline-block italic text-[#536c51]">feels right<span className="absolute -bottom-1 left-0 -z-10 h-3 w-full -rotate-2 bg-[#c9f36a]" /></span>.
            </h1>
            <p className="mt-7 max-w-lg text-base leading-7 text-[#59665d] sm:text-lg sm:leading-8">
              Good work changes things. Find a team that sees what you bring — and a job that takes you where you want to go.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/jobs" className="group inline-flex items-center gap-5 rounded-full bg-[#17231d] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#315a42]">
                Find your next job
                <span aria-hidden="true" className="grid size-7 place-items-center rounded-full bg-[#c9f36a] text-[#17231d] transition group-hover:translate-x-0.5">↗</span>
              </Link>
              <span className="text-sm font-medium text-[#68736b]"><strong className="text-[#17231d]">{publishedJobs.length}</strong> jobs to explore</span>
            </div>
            <div className="mt-12 flex flex-wrap gap-x-7 gap-y-3 border-t border-[#17231d]/15 pt-5 text-xs font-semibold uppercase tracking-wider text-[#68736b]">
              <span className="inline-flex items-center gap-2"><span className="text-[#536c51]">01</span> Be seen</span>
              <span className="inline-flex items-center gap-2"><span className="text-[#536c51]">02</span> Find your fit</span>
              <span className="inline-flex items-center gap-2"><span className="text-[#536c51]">03</span> Move forward</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl lg:ml-auto">
            <div className="relative aspect-[1.08] overflow-hidden rounded-[2rem] bg-[#dfe5cf]">
              <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_65%_35%,rgba(255,255,255,0.82),transparent_43%),linear-gradient(145deg,#dfe5cf_0%,#b4c29d_100%)]" />
              <div aria-hidden="true" className="absolute -right-10 -top-14 size-72 rounded-full border border-[#17231d]/15" />
              <div aria-hidden="true" className="absolute -right-1 -top-5 size-52 rounded-full border border-[#17231d]/15" />
              <div aria-hidden="true" className="absolute bottom-0 left-0 h-[44%] w-full bg-[#536c51]" />
              <div aria-hidden="true" className="absolute bottom-[26%] left-[-10%] h-28 w-[120%] -rotate-[12deg] rounded-[50%] bg-[#718467]" />
              <div aria-hidden="true" className="absolute bottom-[22%] left-[12%] h-24 w-24 rounded-full bg-[#c9f36a] shadow-[0_0_70px_rgba(201,243,106,0.35)]" />
              <div className="absolute inset-x-5 top-5 flex items-start justify-between sm:inset-x-7 sm:top-7">
                <span className="eyebrow rounded-full border border-[#17231d]/10 bg-[#f4f3ec]/75 px-4 py-2 text-[#17231d] backdrop-blur">Find your own way</span>
                <span className="grid size-11 place-items-center rounded-full bg-[#17231d] text-lg text-[#c9f36a]">✳</span>
              </div>
              <div className="absolute inset-x-5 bottom-5 rounded-2xl border border-white/60 bg-[#f8f8f1]/90 p-5 shadow-[0_16px_50px_rgba(23,35,29,0.13)] backdrop-blur-md sm:inset-x-7 sm:bottom-7 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="eyebrow text-[#68736b]">The next chapter</p>
                    <p className="display-serif mt-2 text-2xl text-[#17231d] sm:text-3xl">Starts with a good fit.</p>
                  </div>
                  <span className="hidden text-right sm:block">
                    <span className="block text-2xl font-bold text-[#536c51]">{publishedJobs.length.toString().padStart(2, "0")}</span>
                    <span className="eyebrow text-[#68736b]">open jobs</span>
                  </span>
                </div>
                <div className="mt-5 flex items-center gap-3 border-t border-[#17231d]/10 pt-4">
                  <span className="flex -space-x-2">
                    {["#536c51", "#c5a17a", "#627d8b"].map((color, index) => (
                      <span key={color} className="grid size-8 place-items-center rounded-full border-2 border-[#f8f8f1] text-[10px] font-bold text-white" style={{ backgroundColor: color }}>
                        {["T", "D", "C"][index]}
                      </span>
                    ))}
                  </span>
                  <p className="text-xs font-semibold text-[#59665d]">Teams are looking for people like you.</p>
                </div>
              </div>
            </div>
            <span className="absolute -right-2 top-[42%] hidden -rotate-90 text-[10px] font-bold uppercase tracking-[0.25em] text-[#536c51] xl:block">Make the next move · 2026</span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:py-20 lg:px-8">
        <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-[#536c51]">A good place to start</p>
            <h2 className="display-serif mt-2 text-4xl text-[#17231d] sm:text-5xl">Jobs with room to grow.</h2>
            <p className="mt-3 text-sm text-[#68736b]">Thoughtful teams. Clear expectations. A better next step.</p>
          </div>

          <Link href="/jobs" className="group inline-flex items-center gap-3 rounded-full border border-[#17231d]/15 px-5 py-3 text-sm font-bold text-[#17231d] transition hover:border-[#536c51] hover:bg-[#e9ecdf]">
            See all opportunities <span aria-hidden="true" className="transition group-hover:translate-x-1">↗</span>
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {featuredJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </section>
    </main>
  );
}
