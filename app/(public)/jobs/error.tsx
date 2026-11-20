"use client";

export default function JobsError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="rounded-2xl border border-red-200 bg-white p-8 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">
          Jobs could not be loaded
        </h1>
        <p className="mt-3 text-sm text-slate-600">
          Please try again. If the issue continues, verify that
          the Supabase environment variables are configured.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded-lg bg-blue-700 px-5 py-3 font-medium text-white hover:bg-blue-800"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
