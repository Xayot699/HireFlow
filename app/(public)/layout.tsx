
import {
  Suspense,
  type ReactNode,
} from "react";

import Link from "next/link";
import PublicHeader from "@/components/layout/PublicHeader";
import { getLocale, translate } from "@/lib/i18n";

async function LocalizedFooter() {
  const locale = await getLocale();
  return (
    <footer className="border-t border-[#17231d]/10 bg-[#fbfaf5] px-5 py-7 text-center text-sm text-[#68736b]">
      <span className="font-bold text-[#17231d]">HireFlow</span> <span className="mx-1 text-[#a6aea5]">·</span> {translate(locale, "footer")}
    </footer>
  );
}

export default function PublicLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Suspense
        fallback={
          <header className="border-b border-[#17231d]/10 bg-[#f4f3ec]/90 px-5 py-4 backdrop-blur-xl">
            <div className="mx-auto max-w-6xl">
              <Link
                href="/"
                className="text-xl font-black tracking-tight text-[#17231d]"
              >
                Hire<span className="text-[#536c51]">Flow</span>
              </Link>
            </div>
          </header>
        }
      >
        <PublicHeader />
      </Suspense>

      <div className="flex-1">
        {children}
      </div>

      <Suspense fallback={<footer className="border-t border-[#17231d]/10 bg-[#fbfaf5] px-5 py-7 text-center text-sm text-[#68736b]">HireFlow · Find your next opportunity</footer>}>
        <LocalizedFooter />
      </Suspense>
    </div>
  );
}
