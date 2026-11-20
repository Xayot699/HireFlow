"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireCandidate } from "@/lib/auth";
import type { ApplyActionState } from "./action-state";
import { applyJobSchema } from "./schema";

export async function applyToJob(
  jobId: string,
  _previousState: ApplyActionState,
  formData: FormData,
): Promise<ApplyActionState> {
  const { supabase, userId, fullName, email } = await requireCandidate();
  const result = applyJobSchema.safeParse({
    cvUrl: formData.get("cvUrl"),
    coverLetter: formData.get("coverLetter") ?? "",
  });

  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Invalid application information." };
  }

  const candidateName = fullName?.trim();
  const contactEmail = email?.trim();
  if (!candidateName || !contactEmail) {
    return { error: "Your account is missing a name or email. Update your profile before applying." };
  }

  const { data: resume, error: resumeError } = await supabase
    .from("profiles")
    .select("phone, city, desired_position, experience_years, previous_company, previous_role, education, skills, portfolio_url, about")
    .eq("id", userId)
    .maybeSingle();

  if (resumeError || !resume) {
    console.error("LOAD APPLICATION RESUME ERROR:", resumeError?.code, resumeError?.message);
    return { error: "Could not load your profile for the application. Save your profile and try again." };
  }

  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select("id")
    .eq("id", jobId)
    .eq("status", "published")
    .maybeSingle();

  if (jobError) {
    console.error("CHECK JOB ERROR:", jobError.code, jobError.message);
    return { error: "Could not verify the vacancy." };
  }
  if (!job) return { error: "This vacancy is not available." };

  const { error } = await supabase.from("applications").insert({
    id: randomUUID(),
    job_id: job.id,
    candidate_id: userId,
    candidate_name: candidateName,
    contact_email: contactEmail,
    cv_url: result.data.cvUrl || "/resume",
    resume_snapshot: {
      fullName: candidateName,
      email: contactEmail,
      ...resume,
    },
    cover_letter: result.data.coverLetter,
    status_text: "pending",
    status: "pending",
    created_at: new Date().toISOString(),
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "You have already applied for this job." };
    }
    console.error("APPLY ERROR:", error.code, error.message);

    if (error.code === "42501") {
      return { error: "Supabase RLS arizani saqlashga ruxsat bermadi. applications_candidate_insert policy sozlamasini tekshirish kerak." };
    }
    if (error.code === "23503") {
      return { error: "Ariza vakansiyaga yoki foydalanuvchi profiliga ulanmayapti. applications jadvalidagi foreign key sozlamasini tekshirish kerak." };
    }
    if (error.code === "23502") {
      return { error: "applications jadvalidagi majburiy ustunlardan biri bo‘sh qolgan. Server terminalidagi APPLY ERROR tafsilotini tekshiring." };
    }
    if (error.code === "22P02") {
      return { error: "Vakansiya ID turi applications.job_id bilan mos emas. Supabase jadval ustunlari turini tekshirish kerak." };
    }

    return { error: "Application could not be submitted." };
  }

  revalidatePath("/applications");
  revalidatePath(`/jobs/${jobId}`);
  redirect("/applications?submitted=1");
}
