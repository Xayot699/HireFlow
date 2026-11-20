
import { redirect } from "next/navigation";
import { connection } from "next/server";

import { createClient } from "@/lib/supabase/server";

export type UserRole = "candidate" | "admin";

export async function getViewer() {
  // Auth state and Supabase token checks are request-specific. Defer them
  // until a real request so Next.js does not run them during prerendering.
  await connection();
  const supabase = await createClient();

  // 1. JWT orqali shaxsni tasdiqlash
  const { data, error } =
    await supabase.auth.getClaims();

  if (error || !data?.claims?.sub) {
    return null;
  }

  const userId = data.claims.sub;

  // 2. User rolini database'dan olish
  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("id", userId)
    .maybeSingle();

  if (profileError) {
    console.error(
      "PROFILE ERROR:",
      profileError
    );

    throw new Error(
      "Failed to load user profile."
    );
  }

  if (!profile) {
    throw new Error(
      "User profile was not created. Check the Auth trigger."
    );
  }

  if (
    profile.role !== "candidate" &&
    profile.role !== "admin"
  ) {
    throw new Error(
      "Invalid user role."
    );
  }

  return {
    supabase,
    userId,
    role: profile.role as UserRole,
    fullName: profile.full_name,
    email:
      typeof data.claims.email === "string"
        ? data.claims.email
        : null,
  };
}

// Login talab qilinadigan sahifalar
export async function requireUser() {
  const viewer = await getViewer();

  if (!viewer) {
    redirect("/login");
  }

  return viewer;
}

// Faqat Candidate
export async function requireCandidate() {
  const viewer = await requireUser();

  if (viewer.role !== "candidate") {
    redirect("/unauthorized");
  }

  return viewer;
}

// Faqat Admin
export async function requireAdmin() {
  const viewer = await requireUser();

  if (viewer.role !== "admin") {
    redirect("/unauthorized");
  }

  return viewer;
}
