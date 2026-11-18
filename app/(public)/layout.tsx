import type { ReactNode } from "react";

import Link from "next/link";
import PublicHeader from "@/components/layout/PublicHeader";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />

      <div className="flex-1">{children}</div>

      <footer className="border-t border-[#17231d]/10 bg-[#f4f3ec] px-5 py-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 text-sm text-[#66736a]">
          <span className="font-bold tracking-tight text-[#17231d]">hireflow<span className="text-[#829851]">®</span></span>
          <span>© 2026 HireFlow. Find work that feels like you.</span>
          <Link href="/jobs" className="font-semibold text-[#315a42] hover:text-[#17231d]">Explore jobs <span aria-hidden="true">↗</span></Link>
        </div>
      </footer>
    </div>
  );
}
