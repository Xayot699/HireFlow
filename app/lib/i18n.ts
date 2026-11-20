import { cookies } from "next/headers";
import type { Locale } from "@/lib/messages";
export { translate } from "@/lib/messages";
export type { Locale } from "@/lib/messages";

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const value = cookieStore.get("hireflow-locale")?.value;
  return value === "uz" || value === "ru" ? value : "en";
}
