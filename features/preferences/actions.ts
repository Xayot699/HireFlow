"use server";

import { cookies } from "next/headers";

const allowedLocales = ["uz", "en", "ru"] as const;

export async function setLocale(formData: FormData) {
  const value = formData.get("locale");
  if (typeof value !== "string" || !allowedLocales.includes(value as (typeof allowedLocales)[number])) {
    return;
  }

  const cookieStore = await cookies();
  cookieStore.set("hireflow-locale", value, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}
