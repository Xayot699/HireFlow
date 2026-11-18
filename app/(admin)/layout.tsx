import type { ReactNode } from "react";

import Link from "next/link";
import AdminSidebar from "@/components/layout/AdminSidebar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f4f3ec] md:flex">
      <AdminSidebar />

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-10 hidden items-center justify-between border-b border-[#17231d]/10 bg-[#f4f3ec]/90 px-8 py-4 backdrop-blur-xl md:flex">
          <div>
            <p className="eyebrow text-[#536c51]">HireFlow / Workspace</p>
            <p className="mt-1 text-sm font-semibold text-[#334139]">Recruitment overview</p>
          </div>
          <Link href="/jobs" className="rounded-full border border-[#17231d]/15 px-4 py-2 text-sm font-semibold text-[#59665d] transition hover:border-[#536c51] hover:text-[#315a42]">
            View public site <span aria-hidden="true">↗</span>
          </Link>
        </header>

        {children}
      </div>
    </div>
  );
}
