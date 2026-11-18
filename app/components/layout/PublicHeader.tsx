import Link from "next/link";

export default function PublicHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-[#17231d]/10 bg-[#f4f3ec]/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-8 gap-y-3 px-5 py-4 lg:px-8">
        <Link href="/" className="group inline-flex items-center gap-3 text-xl font-black tracking-tight text-[#17231d]">
          <span className="grid size-10 place-items-center rounded-full bg-[#c9f36a] text-lg text-[#17231d] transition group-hover:rotate-6">
            h.
          </span>
          <span>hire<span className="font-normal">flow</span></span>
        </Link>

        <nav aria-label="Public navigation" className="flex flex-wrap items-center gap-1 text-sm font-semibold text-[#526158]">
          <Link href="/" className="rounded-full px-4 py-2 transition hover:bg-[#e8e9df] hover:text-[#17231d]">
            Home
          </Link>

          <Link href="/jobs" className="rounded-full px-4 py-2 transition hover:bg-[#e8e9df] hover:text-[#17231d]">
            Find Jobs
          </Link>

          <Link href="/profile" className="rounded-full px-4 py-2 transition hover:bg-[#e8e9df] hover:text-[#17231d]">
            My Profile
          </Link>

          <Link href="/admin" className="ml-1 rounded-full bg-[#17231d] px-5 py-2.5 text-white transition hover:bg-[#315a42]">
            For employers <span aria-hidden="true">↗</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
