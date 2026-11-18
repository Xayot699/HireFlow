import CandidateProfileForm from "@/components/profile/CandidateProfileForm";

export default function ProfilePage() {
  return (
    <main className="mx-auto max-w-7xl px-5 py-12 sm:py-16 lg:px-8">
      <section className="relative overflow-hidden rounded-4xl bg-[#244a39] px-7 py-9 text-white sm:px-10 sm:py-12">
        <div aria-hidden="true" className="paper-grid absolute inset-0 opacity-10" />
        <div aria-hidden="true" className="absolute -right-10 -top-32 size-96 rounded-full border border-white/15" />
        <div className="relative max-w-3xl">
          <p className="eyebrow text-[#c9f36a]">Candidate space</p>
          <h1 className="display-serif mt-3 text-4xl text-white sm:text-5xl">Make your next move count.</h1>
          <p className="mt-4 max-w-2xl leading-7 text-white/75">
            Build a profile that tells your story. Your experience and skills help employers see where you can make an impact.
          </p>
        </div>
      </section>

      <div className="my-6 flex items-start gap-3 rounded-2xl border border-[#9f874d]/20 bg-[#f7efd9] px-5 py-4 text-sm leading-6 text-[#655127]">
        <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-[#eddfb9] font-bold">i</span>
        <p><strong>Demo profile:</strong> use sample information only. Authentication and database saving will be added later.</p>
      </div>

      <CandidateProfileForm />
    </main>
  );
}
