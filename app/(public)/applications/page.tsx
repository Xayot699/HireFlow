import Link from "next/link";
import { Suspense } from "react";

import { getMyApplications, type ApplicationStatus } from "@/features/applications/queries";
import ApplicationChat from "@/components/applications/ApplicationChat";
import ApplicationMessagesRealtime from "@/components/applications/ApplicationMessagesRealtime";
import { getLocale, translate, type Locale } from "@/lib/i18n";

const statusStyles: Record<ApplicationStatus, string> = {
  pending: "bg-[#f7efd9] text-[#765f2e] ring-1 ring-[#765f2e]/10",
  reviewing: "bg-[#e8ecdf] text-[#315a42] ring-1 ring-[#315a42]/10",
  accepted: "bg-[#edf4df] text-[#3d6847] ring-1 ring-[#3d6847]/10",
  rejected: "bg-[#f5e6e1] text-[#8a5042] ring-1 ring-[#8a5042]/10",
};

type Props = { searchParams: Promise<{ submitted?: string }>; locale: Locale };

async function ApplicationsContent({ searchParams, locale }: Props) {
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  const [{ submitted }, applicationData] = await Promise.all([
    searchParams,
    getMyApplications(),
  ]);
  const { applications, userId } = applicationData;

  return (
    <>
      <ApplicationMessagesRealtime />
      {submitted === "1" && (
        <p role="status" className="mb-6 rounded-2xl border border-[#3d6847]/15 bg-[#edf4df] p-4 text-sm font-semibold text-[#315a42]">
          {t("applicationSubmitted")}
        </p>
      )}

      {applications.length === 0 ? (
        <div className="rounded-3xl border border-[#17231d]/10 bg-[#fbfaf5] p-10 text-center">
          <h2 className="text-2xl font-black text-[#17231d]">{t("noApplications")}</h2>
          <p className="mt-3 text-sm text-[#68736b]">{t("applicationsEmptyHint")}</p>
          <Link href="/jobs" className="site-cta mt-6 inline-flex rounded-full bg-[#17231d] px-5 py-3 text-sm font-bold text-white hover:bg-[#315a42]">
            {t("exploreJobs")}
          </Link>
        </div>
      ) : (
        <div className="stagger-enter space-y-4">
          {applications.map((application) => (
            <article key={application.id} className="site-card rounded-3xl border border-[#17231d]/10 bg-[#fbfaf5] p-5 shadow-[0_8px_30px_rgba(23,35,29,0.035)] transition hover:border-[#536c51]/25 hover:shadow-[0_14px_40px_rgba(23,35,29,0.07)] sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-[#17231d]">{application.job?.title ?? t("archivedUnavailable")}</h2>
                  <p className="mt-2 text-sm text-[#68736b]">{application.job?.company ?? t("jobUnavailable")}</p>
                </div>
                <span className={`rounded-full px-3 py-1.5 text-xs font-bold capitalize ${statusStyles[application.status]}`}>
                  {t(application.status)}
                </span>
              </div>
              <p className="mt-5 text-sm text-[#68736b]">
                {t("appliedOn")} {new Date(application.created_at).toLocaleDateString(locale === "uz" ? "uz-UZ" : locale === "ru" ? "ru-RU" : "en-GB", {
                  day: "2-digit", month: "short", year: "numeric",
                })}
              </p>
              <div className="mt-5 border-t border-[#17231d]/10 pt-4">
                <h3 className="text-sm font-bold text-[#17231d]">{t("applicationHistory")}</h3>
                {application.statusHistory.length === 0 ? (
                  <p className="mt-2 text-xs text-[#8b948b]">{t("noHistory")}</p>
                ) : (
                  <ol className="mt-3 space-y-2">
                    {application.statusHistory.map((entry, index) => (
                      <li key={`${entry.application_id}-${entry.changed_at}-${index}`} className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#68736b]">
                        <span>
                          {entry.previous_status
                            ? `${t(entry.previous_status)} → ${t(entry.new_status)}`
                            : `${t("submittedStatus")} · ${t(entry.new_status)}`}
                        </span>
                        <time dateTime={entry.changed_at}>
                          {new Date(entry.changed_at).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </time>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
              {application.followups.length > 0 && (
                <div className="mt-5 rounded-2xl border border-[#315a42]/15 bg-[#f7f8f2] p-4">
                  <h3 className="text-sm font-bold text-[#17231d]">{t("invitationsNextSteps")}</h3>
                  <ol className="mt-3 space-y-3">
                    {application.followups.map((entry) => (
                      <li key={entry.id} className="rounded-xl border border-[#17231d]/10 bg-white p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <strong className="text-sm capitalize text-[#315a42]">{entry.kind === "interview" ? t("interviewInvitation") : entry.kind === "offer" ? t("jobOffer") : t("recommendation")}</strong>
                          <time className="text-xs text-[#8b948b]" dateTime={entry.created_at}>{new Date(entry.created_at).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</time>
                        </div>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#59665d]">{entry.message}</p>
                        {entry.interview_at && <p className="mt-3 text-sm font-semibold text-[#17231d]">{t("interviewTime")} {new Date(entry.interview_at).toLocaleString(locale === "uz" ? "uz-UZ" : locale === "ru" ? "ru-RU" : "en-GB", { dateStyle: "full", timeStyle: "short", timeZone: "Asia/Tashkent" })}</p>}
                        {entry.location && <p className="mt-1 text-sm text-[#68736b]">{t("location")}: {entry.location}</p>}
                        {entry.meeting_url && <a className="mt-2 inline-block text-sm font-bold text-[#315a42] underline" href={entry.meeting_url} target="_blank" rel="noreferrer">{t("joinInterview")}</a>}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
              <ApplicationChat applicationId={application.id} messages={application.messages} userId={userId} role="candidate" locale={locale} live={false} />
              {application.job && (
                <Link href={`/jobs/${application.job.id}`} className="mt-4 inline-block text-sm font-bold text-[#315a42] hover:underline">
                  {t("viewJobDetails")}
                </Link>
              )}
            </article>
          ))}
        </div>
      )}
    </>
  );
}

async function MyApplicationsPageContent({ searchParams }: Omit<Props, "locale">) {
  const locale = await getLocale();
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  return (
    <main className="site-page-enter mx-auto max-w-5xl px-5 py-10 sm:py-14">
      <div className="mb-8 max-w-2xl sm:mb-10">
        <p className="eyebrow flex items-center gap-3 text-[#536c51]"><span className="h-px w-8 bg-[#536c51]" /> {t("candidateArea")}</p>
        <h1 className="display-serif mt-3 text-5xl leading-tight text-[#17231d] sm:text-6xl">{t("myApplicationsTitle")}</h1>
        <p className="mt-3 text-base leading-7 text-[#68736b]">{t("applicationsIntro")}</p>
      </div>
      <Suspense fallback={<p className="text-sm text-[#68736b]">{t("loadingApplications")}</p>}>
        <ApplicationsContent searchParams={searchParams} locale={locale} />
      </Suspense>
    </main>
  );
}

export default function MyApplicationsPage({ searchParams }: Omit<Props, "locale">) {
  return (
    <Suspense fallback={<main className="mx-auto max-w-5xl px-5 py-10 sm:py-14"><p className="text-sm text-[#68736b]">Loading applications...</p></main>}>
      <MyApplicationsPageContent searchParams={searchParams} />
    </Suspense>
  );
}
