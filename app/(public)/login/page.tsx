
import AuthForm from "@/components/auth/AuthForm";
import { getLocale } from "@/lib/i18n";

export const instant = false;

export default async function LoginPage() {
  const locale = await getLocale();
  return (
    <main className="site-page-enter flex min-h-[75vh] items-center justify-center bg-[radial-gradient(ellipse_at_50%_25%,rgba(201,243,106,0.16),transparent_42%)] px-5 py-12 sm:py-16">
      <AuthForm mode="login" locale={locale} />
    </main>
  );
}
