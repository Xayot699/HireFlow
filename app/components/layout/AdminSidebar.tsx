import Link from "next/link";

const navigation = [
  { label: "Dashboard", href: "/admin" },
  { label: "Manage Jobs", href: "/admin/jobs" },
  { label: "Applications", href: "/admin/applications" },
];

export default function AdminSidebar() {
  return (
    <aside className="shrink-0 bg-[#17231d] px-5 py-5 text-white md:sticky md:top-0 md:flex md:h-screen md:w-72 md:flex-col md:px-6 md:py-7">
      <Link href="/admin" className="inline-flex items-center gap-3 text-xl font-black tracking-tight">
        <span className="grid size-10 place-items-center rounded-full bg-[#c9f36a] text-base text-[#17231d]">h.</span>
        <span>hireflow<span className="ml-2 text-xs font-semibold uppercase tracking-wider text-white/40">Admin</span></span>
      </Link>

      <p className="eyebrow mt-10 hidden px-3 text-white/40 md:block">Workspace</p>
      <nav aria-label="Admin navigation" className="mt-5 flex gap-2 overflow-x-auto md:flex-col">
        {navigation.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="whitespace-nowrap rounded-xl px-4 py-3 text-sm font-semibold text-white/65 transition hover:bg-white/10 hover:text-white"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="mt-auto hidden border-t border-white/10 pt-5 md:block">
        <p className="mb-4 text-xs leading-5 text-white/40">A clear view of your hiring pipeline.</p>
        <Link href="/jobs" className="inline-flex items-center gap-2 text-sm font-semibold text-white/55 transition hover:text-white">
          <span aria-hidden="true">←</span> Public website
        </Link>
      </div>
    </aside>
  );
}
