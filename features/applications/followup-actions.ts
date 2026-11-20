"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth";

const followupSchema = z.object({
  applicationId: z.string().uuid(),
  kind: z.enum(["interview", "offer", "recommendation"]),
  message: z.string().trim().min(1, "Izoh yoki xabar kiriting.").max(2000),
  interviewAt: z.string().optional(),
  location: z.string().trim().max(300).optional(),
  meetingUrl: z.string().trim().optional(),
}).superRefine((value, context) => {
  if (value.kind === "interview" && !value.interviewAt) {
    context.addIssue({ code: "custom", path: ["interviewAt"], message: "Suhbat vaqtini belgilang." });
  }
  if (value.interviewAt && Number.isNaN(Date.parse(`${value.interviewAt}:00+05:00`))) {
    context.addIssue({ code: "custom", path: ["interviewAt"], message: "Suhbat vaqtini tekshiring." });
  }
  if (value.meetingUrl && !/^https?:\/\//i.test(value.meetingUrl)) {
    context.addIssue({ code: "custom", path: ["meetingUrl"], message: "Havola http:// yoki https:// bilan boshlansin." });
  }
});

export async function createApplicationFollowup(formData: FormData) {
  const { supabase, userId } = await requireAdmin();
  const parsed = followupSchema.safeParse({
    applicationId: formData.get("applicationId"),
    kind: formData.get("kind"),
    message: formData.get("message"),
    interviewAt: formData.get("interviewAt") || undefined,
    location: formData.get("location") || undefined,
    meetingUrl: formData.get("meetingUrl") || undefined,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Taklif ma'lumotlarini tekshiring.");
  }

  const entry = parsed.data;
  const { error } = await supabase.from("application_followups").insert({
    application_id: entry.applicationId,
    kind: entry.kind,
    message: entry.message,
    interview_at: entry.interviewAt ? new Date(`${entry.interviewAt}:00+05:00`).toISOString() : null,
    location: entry.location || null,
    meeting_url: entry.meetingUrl || null,
    created_by: userId,
  });

  if (error) {
    console.error("CREATE APPLICATION FOLLOWUP ERROR:", error.code, error.message);
    throw new Error("Taklifni saqlab bo‘lmadi. README’dagi follow-up SQL sozlamasini bajaring.");
  }

  revalidatePath("/admin/applications");
  revalidatePath("/applications");
}
