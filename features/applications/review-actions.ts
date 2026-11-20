"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth";

const reviewApplicationSchema = z.object({
  applicationId: z.string().uuid(),
  status: z.enum(["reviewing", "accepted", "rejected"]),
});

export async function reviewApplication(formData: FormData) {
  const { supabase } = await requireAdmin();
  const result = reviewApplicationSchema.safeParse({
    applicationId: formData.get("applicationId"),
    status: formData.get("status"),
  });

  if (!result.success) {
    throw new Error("Invalid application review request.");
  }

  const { error } = await supabase.rpc("admin_review_application", {
    p_application_id: result.data.applicationId,
    p_status: result.data.status,
  });

  if (error) {
    const details = [error.code, error.message, error.details, error.hint]
      .filter(Boolean)
      .join(" | ");
    console.error("REVIEW APPLICATION ERROR:", details);
    throw new Error(`Could not update application: ${details}`);
  }

  revalidatePath("/admin/applications");
  revalidatePath("/admin/jobs");
  revalidatePath("/jobs");
  revalidatePath("/");
  revalidatePath("/applications");
}
