"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getViewer } from "@/lib/auth";

const messageSchema = z.object({
  applicationId: z.string().uuid(),
  body: z.string().trim().min(1).max(3000),
});

export type ChatActionState = { error: string; sentAt: number };

export async function sendApplicationMessage(
  _previousState: ChatActionState,
  formData: FormData,
): Promise<ChatActionState> {
  const viewer = await getViewer();
  if (!viewer) return { error: "Please sign in to send a message.", sentAt: 0 };

  const parsed = messageSchema.safeParse({
    applicationId: formData.get("applicationId"),
    body: formData.get("body"),
  });
  if (!parsed.success) return { error: "Write a message of up to 3000 characters.", sentAt: 0 };

  const { error } = await viewer.supabase.from("application_messages").insert({
    application_id: parsed.data.applicationId,
    sender_id: viewer.userId,
    body: parsed.data.body,
    is_system: false,
  });

  if (error) {
    console.error("SEND APPLICATION MESSAGE ERROR:", error.code, error.message);
    return { error: "Message could not be sent. Check that the application chat SQL setup has been run.", sentAt: 0 };
  }

  revalidatePath("/applications");
  revalidatePath("/admin/applications");
  revalidatePath("/messages");
  return { error: "", sentAt: Date.now() };
}
