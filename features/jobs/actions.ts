"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth";
import type { JobActionState } from "./action-state";
import { createJobSchema, updateJobSchema } from "./schema";

function createJobId(title: string) {
  const slug = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "") || "job";

  return `${slug}-${randomUUID()}`;
}

function linesToArray(value: string) {
  return value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}

export async function createJob(
  _previousState: JobActionState,
  formData: FormData,
): Promise<JobActionState> {
  const { supabase, userId } = await requireAdmin();
  const result = createJobSchema.safeParse({
    title: formData.get("title"),
    company: formData.get("company"),
    location: formData.get("location"),
    workMode: formData.get("workMode"),
    employmentType: formData.get("employmentType"),
    salaryMin: formData.get("salaryMin"),
    salaryMax: formData.get("salaryMax"),
    description: formData.get("description"),
    requirements: formData.get("requirements"),
    skills: formData.get("skills"),
    status: formData.get("status"),
  });

  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Invalid job information." };
  }

  const values = result.data;
  const requirements = linesToArray(values.requirements);
  const skills = values.skills.split(",").map((skill) => skill.trim()).filter(Boolean);

  if (requirements.length === 0 || requirements.length > 15 || skills.length === 0 || skills.length > 20) {
    return { error: "Provide 1–15 requirements and 1–20 skills." };
  }

  if (requirements.some((item) => item.length > 200) || skills.some((skill) => skill.length > 60)) {
    return { error: "Some requirements or skills are too long." };
  }

  const { error } = await supabase.from("jobs").insert({
    id: createJobId(values.title),
    title: values.title,
    company: values.company,
    location: values.location,
    work_mode: values.workMode,
    employment_type: values.employmentType,
    salary_min: values.salaryMin,
    salary_max: values.salaryMax,
    description: values.description,
    requirements,
    skills,
    status: values.status,
    created_by: userId,
  });

  if (error) {
    console.error("CREATE JOB ERROR:", error.code, error.message);
    return { error: "Failed to create job. Check the job table and admin permissions." };
  }

  revalidatePath("/admin/jobs");
  revalidatePath("/jobs");
  revalidatePath("/");
  redirect("/admin/jobs?created=1");
}

export async function updateJob(
  _previousState: JobActionState,
  formData: FormData,
): Promise<JobActionState> {
  const { supabase } = await requireAdmin();
  const result = updateJobSchema.safeParse({
    jobId: formData.get("jobId"),
    title: formData.get("title"),
    company: formData.get("company"),
    location: formData.get("location"),
    workMode: formData.get("workMode"),
    employmentType: formData.get("employmentType"),
    salaryMin: formData.get("salaryMin"),
    salaryMax: formData.get("salaryMax"),
    description: formData.get("description"),
    requirements: formData.get("requirements"),
    skills: formData.get("skills"),
    status: formData.get("status"),
  });

  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Invalid job information." };
  }

  const values = result.data;
  const requirements = linesToArray(values.requirements);
  const skills = values.skills.split(",").map((skill) => skill.trim()).filter(Boolean);

  if (requirements.length === 0 || requirements.length > 15 || skills.length === 0 || skills.length > 20) {
    return { error: "Provide 1–15 requirements and 1–20 skills." };
  }
  if (requirements.some((item) => item.length > 200) || skills.some((skill) => skill.length > 60)) {
    return { error: "Some requirements or skills are too long." };
  }

  const { error } = await supabase
    .from("jobs")
    .update({
      title: values.title,
      company: values.company,
      location: values.location,
      work_mode: values.workMode,
      employment_type: values.employmentType,
      salary_min: values.salaryMin,
      salary_max: values.salaryMax,
      description: values.description,
      requirements,
      skills,
      status: values.status,
    })
    .eq("id", values.jobId);

  if (error) {
    console.error("UPDATE JOB ERROR:", error.code, error.message);
    return { error: "Failed to update job. Check the jobs table and admin permissions." };
  }

  revalidatePath("/admin/jobs");
  revalidatePath(`/jobs/${values.jobId}`);
  revalidatePath("/jobs");
  revalidatePath("/");
  redirect("/admin/jobs?updated=1");
}


