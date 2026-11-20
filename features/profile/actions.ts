"use server";

import { revalidatePath } from "next/cache";

import { requireCandidate } from "@/lib/auth";
import type { ProfileActionState } from "./action-state";
import { candidateProfileSchema } from "./schema";

export async function saveCandidateProfile(
  _previousState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const { supabase, userId } = await requireCandidate();
  const result = candidateProfileSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    age: formData.get("age"),
    city: formData.get("city"),
    desiredPosition: formData.get("desiredPosition"),
    experienceYears: formData.get("experienceYears"),
    previousCompany: formData.get("previousCompany"),
    previousRole: formData.get("previousRole"),
    education: formData.get("education"),
    skills: formData.get("skills"),
    portfolioUrl: formData.get("portfolioUrl"),
    cvUrl: formData.get("cvUrl"),
    about: formData.get("about"),
  });

  if (!result.success) {
    return {
      error: result.error.issues[0]?.message ?? "Profil ma'lumotlarini tekshiring.",
      message: "",
    };
  }

  const profile = result.data;
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: profile.fullName,
      phone: profile.phone,
      age: profile.age,
      city: profile.city,
      desired_position: profile.desiredPosition,
      experience_years: profile.experienceYears,
      previous_company: profile.previousCompany,
      previous_role: profile.previousRole,
      education: profile.education,
      skills: profile.skills,
      portfolio_url: profile.portfolioUrl,
      cv_url: profile.cvUrl,
      about: profile.about,
    })
    .eq("id", userId);

  if (error) {
    console.error("SAVE PROFILE ERROR:", error.code, error.message);
    return {
      error: "Profilni saqlab bo‘lmadi. profiles jadvali va Candidate UPDATE RLS policy’sini tekshiring.",
      message: "",
    };
  }

  revalidatePath("/profile");
  revalidatePath("/resume");
  revalidatePath("/applications");
  return { error: "", message: "Profil Supabase’da saqlandi." };
}
