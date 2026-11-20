"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth";

const updateJobStatusSchema = z.object({
  jobId: z.string().min(1).max(160),
  status: z.enum(["draft", "published", "archived"]),
});

export async function updateJobStatus(formData: FormData) {
  const { supabase } = await requireAdmin();
  const result = updateJobStatusSchema.safeParse({
    jobId: formData.get("jobId"),
    status: formData.get("status"),
  });

  if (!result.success) {
    throw new Error("Invalid job status update.");
  }

  const { error } = await supabase.rpc("admin_set_job_status", {
    p_job_id: result.data.jobId,
    p_status: result.data.status,
  });

  if (error) {
    console.error("UPDATE JOB STATUS ERROR:", error.code, error.message);
    throw new Error("Could not update job status. Check the admin_set_job_status Supabase function.");
  }

  revalidatePath("/admin/jobs");
  revalidatePath("/admin/applications");
  revalidatePath("/jobs");
  revalidatePath("/");
}
