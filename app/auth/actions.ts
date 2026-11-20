
"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import type { AuthState } from "@/types/auth-state";

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8),
});

const registerSchema = loginSchema.extend({
  fullName: z.string().trim().min(2).max(80),
});

// =====================================
// REGISTER
// =====================================

export async function register(
  _previousState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const result = registerSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!result.success) {
    return {
      error:
        "Ism, email va parolni to'g'ri kiriting. Parol kamida 8 belgidan iborat bo'lishi kerak.",
      message: "",
    };
  }

  const {
    fullName,
    email,
    password,
  } = result.data;

  const supabase = await createClient();

  const { data, error } =
    await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

  if (error) {
    console.error(
      "REGISTER ERROR:",
      error.code,
      error.message
    );

    return {
      error:
        error.message === "fetch failed"
          ? "Supabase xizmatiga ulanib bo'lmadi. Project URL va internet/DNS ulanishini tekshiring."
          : "Ro'yxatdan o'tish amalga oshmadi. Email va Auth sozlamalarini tekshiring.",
      message: "",
    };
  }

  // Email confirmation o'chirilgan
  // test muhitida session darhol yaratilishi mumkin.
  if (data.session) {
    revalidatePath("/", "layout");
    redirect("/profile");
  }

  // Email confirmation yoqilgan holat
  return {
    error: "",
    message:
      "Ro'yxatdan o'tish so'rovi qabul qilindi. Agar tasdiqlash xati yuborilgan bo'lsa, emailingizni tekshiring.",
  };
}

// =====================================
// LOGIN
// =====================================

export async function login(
  _previousState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const result = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!result.success) {
    return {
      error: "Email yoki parol formati noto'g'ri.",
      message: "",
    };
  }

  const supabase = await createClient();

  const { data, error } =
    await supabase.auth.signInWithPassword({
      email: result.data.email,
      password: result.data.password,
    });

  if (error || !data.user) {
    return {
      error:
        "Tizimga kirib bo'lmadi. Email, parol va email tasdiqlanganini tekshiring.",
      message: "",
    };
  }

  // Login muvaffaqiyatli bo'ldi.
  // Endi rolni database'dan olamiz.
  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profileError || !profile) {
    console.error(
      "LOGIN PROFILE ERROR:",
      profileError
    );
    await supabase.auth.signOut();

    return {
      error:
        "Profil topilmadi. Admin bilan bog'laning.",
      message: "",
    };
  }

  if (profile.role !== "candidate" && profile.role !== "admin") {
    await supabase.auth.signOut();
    return {
      error: "Akkaunt roli noto'g'ri sozlangan. Admin bilan bog'laning.",
      message: "",
    };
  }

  revalidatePath("/", "layout");

  if (profile.role === "admin") {
    redirect("/admin");
  }

  redirect("/profile");
}

// =====================================
// LOGOUT
// =====================================

export async function logout() {
  const supabase = await createClient();

  const { error } =
    await supabase.auth.signOut();

  if (error) {
    throw new Error(
      "Logout failed. Please try again."
    );
  }

  revalidatePath("/", "layout");

  redirect("/login");
}
