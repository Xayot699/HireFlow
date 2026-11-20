import Link from "next/link";
import { notFound } from "next/navigation";

import JobForm from "@/components/admin/JobForm";
import { requireAdmin } from "@/lib/auth";
import { mapJob } from "@/types/database";
import type { JobRow } from "@/types/database";
import { getLocale, translate } from "@/lib/i18n";

type Props = {
  params: Promise<{ jobId: string }>;
};

export default async function EditJobPage({ params }: Props) {
  const locale = await getLocale();
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  const { jobId } = await params;
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("jobs")
    .select("id, title, company, location, work_mode, employment_type, salary_min, salary_max, description, requirements, skills, status, created_at")
    .eq("id", jobId)
    .maybeSingle();

  if (error) {
    console.error("EDIT JOB LOAD ERROR:", error.code, error.message);
    throw new Error("Failed to load job for editing.");
  }

  if (!data) notFound();

  const job = mapJob(data as JobRow);

  return (
    <main className="site-page-enter mx-auto max-w-5xl p-5 sm:p-8 lg:p-10">
      <Link href="/admin/jobs" className="text-sm font-semibold text-[#315a42] hover:underline">← {t("manageJobs")}</Link>
      <div className="my-8">
        <p className="eyebrow text-[#536c51]">{t("edit")}</p>
        <h1 className="display-serif mt-2 text-4xl text-[#17231d]">{job.title}</h1>
        <p className="mt-3 text-sm text-[#68736b]">{t("manageJobsDescription")}</p>
      </div>
      <JobForm job={job} locale={locale} />
    </main>
  );
}
