
import Link from "next/link";
import { getLocale, translate } from "@/lib/i18n";

export const instant = false;

export default async function UnauthorizedPage() {
  const locale = await getLocale();
  return (
    <main className="site-page-enter mx-auto max-w-xl px-5 py-20 text-center">
      <h1 className="text-3xl font-bold">
        {translate(locale, "unauthorizedTitle")}
      </h1>

      <p className="mt-4 text-slate-600">
        {translate(locale, "unauthorizedDescription")}
      </p>

      <Link
        href="/jobs"
        className="mt-6 inline-flex rounded-lg bg-blue-700 px-5 py-3 text-white"
      >
        {translate(locale, "jobs")}
      </Link>
    </main>
  );
}
