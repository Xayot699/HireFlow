import Link from "next/link";
import { Suspense } from "react";

import { reviewApplication } from "@/features/applications/review-actions";
import { createApplicationFollowup } from "@/features/applications/followup-actions";
import ApplicationChat, { type ApplicationMessage } from "@/components/applications/ApplicationChat";
import { requireAdmin } from "@/lib/auth";
import type { ApplicationFollowup, ApplicationStatus, ApplicationStatusHistory } from "@/features/applications/queries";
import { getLocale, translate, type Locale } from "@/lib/i18n";

type ApplicationRow = {
  id: string;
  job_id: string;
  candidate_name: string;
  contact_email: string;
  cv_url: string;
  resume_snapshot: unknown;
  cover_letter: string;
  status: ApplicationStatus;
  created_at: string;
};
type JobInfo = { id: string; title: string; company: string };
type SearchParams = Promise<{ status?: string | string[]; job?: string | string[]; from?: string | string[]; to?: string | string[]; q?: string | string[] }>;
type Props = { searchParams: SearchParams; locale: Locale };

const statuses: ApplicationStatus[] = ["pending", "reviewing", "accepted", "rejected"];
const statusStyles: Record<ApplicationStatus, string> = {
  pending: "bg-[#f7efd9] text-[#765f2e]",
  reviewing: "bg-[#e7eee2] text-[#315a42]",
  accepted: "bg-[#edf4df] text-[#3d6847]",
  rejected: "bg-[#f5e6e1] text-[#8a5042]",
};

function validDate(value?: string) {
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : undefined;
}

async function ApplicationsList({ searchParams, locale }: Props) {
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  const params = await searchParams;
  const statusParam = typeof params.status === "string" ? params.status : undefined;
  const jobParam = typeof params.job === "string" ? params.job : undefined;
  const fromParam = typeof params.from === "string" ? params.from : undefined;
  const toParam = typeof params.to === "string" ? params.to : undefined;
  const searchParam = typeof params.q === "string" ? params.q : undefined;
  const status = statuses.includes(statusParam as ApplicationStatus)
    ? (statusParam as ApplicationStatus)
    : undefined;
  const jobId = jobParam?.trim() || undefined;
  const search = searchParam?.replace(/[^a-zA-Z0-9@._+\s-]/g, "").trim().slice(0, 80) || undefined;
  const from = validDate(fromParam);
  const to = validDate(toParam);

  const { supabase, userId } = await requireAdmin();
  const { data: jobsData, error: jobsError } = await supabase
    .from("jobs")
    .select("id, title, company")
    .order("title", { ascending: true });

  if (jobsError) {
    console.error("ADMIN APPLICATION JOB FILTER ERROR:", jobsError.code, jobsError.message);
    throw new Error("Failed to load job filter options.");
  }

  let query = supabase
    .from("applications")
    .select("id, job_id, candidate_name, contact_email, cv_url, resume_snapshot, cover_letter, status, created_at")
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);
  if (jobId) query = query.eq("job_id", jobId);
  if (from) query = query.gte("created_at", `${from}T00:00:00.000Z`);
  if (to) query = query.lte("created_at", `${to}T23:59:59.999Z`);
  if (search) query = query.or(`candidate_name.ilike.%${search}%,contact_email.ilike.%${search}%`);

  const { data, error } = await query;
  if (error) {
    console.error("ADMIN APPLICATIONS ERROR:", error.code, error.message);
    throw new Error("Failed to load applications.");
  }

  const applications = (data ?? []) as ApplicationRow[];
  const applicationIds = applications.map((application) => application.id);
  const { data: historyData, error: historyError } = applicationIds.length
    ? await supabase
        .from("application_status_history")
        .select("application_id, previous_status, new_status, changed_at")
        .in("application_id", applicationIds)
        .order("changed_at", { ascending: true })
    : { data: [], error: null };

  if (historyError) {
    console.error("ADMIN APPLICATION HISTORY ERROR:", historyError.code, historyError.message);
    throw new Error("Failed to load application history.");
  }

  const { data: followupData, error: followupError } = applicationIds.length
    ? await supabase
        .from("application_followups")
        .select("id, application_id, kind, message, interview_at, location, meeting_url, created_at")
        .in("application_id", applicationIds)
        .order("created_at", { ascending: true })
    : { data: [], error: null };

  if (followupError) {
    console.error("ADMIN APPLICATION FOLLOWUPS ERROR:", followupError.code, followupError.message);
    throw new Error("Failed to load candidate invitations and interview details.");
  }

  const { data: messageData, error: messageError } = applicationIds.length
    ? await supabase
        .from("application_messages")
        .select("id, application_id, sender_id, body, is_system, created_at")
        .in("application_id", applicationIds)
        .order("created_at", { ascending: true })
    : { data: [], error: null };

  if (messageError) {
    console.error("ADMIN APPLICATION CHAT ERROR:", messageError.code, messageError.message);
    throw new Error("Failed to load application messages. Run the application chat SQL setup.");
  }

  const historyByApplication = new Map<string, ApplicationStatusHistory[]>();
  for (const entry of (historyData ?? []) as ApplicationStatusHistory[]) {
    const entries = historyByApplication.get(entry.application_id) ?? [];
    entries.push(entry);
    historyByApplication.set(entry.application_id, entries);
  }

  const followupsByApplication = new Map<string, ApplicationFollowup[]>();
  for (const entry of (followupData ?? []) as ApplicationFollowup[]) {
    const entries = followupsByApplication.get(entry.application_id) ?? [];
    entries.push(entry);
    followupsByApplication.set(entry.application_id, entries);
  }

  const messagesByApplication = new Map<string, ApplicationMessage[]>();
  for (const entry of (messageData ?? []) as ApplicationMessage[]) {
    const entries = messagesByApplication.get(entry.application_id) ?? [];
    entries.push(entry);
    messagesByApplication.set(entry.application_id, entries);
  }

  const jobMap = new Map(((jobsData ?? []) as JobInfo[]).map((job) => [job.id, job]));

  return (
    <>
      <form method="get" className="grid gap-3 border-b border-[#17231d]/10 bg-white/70 p-5 sm:grid-cols-2 lg:grid-cols-6">
        <label className="flex flex-col gap-1 text-xs font-bold text-[#68736b]">
          {t("candidateSearch")}
          <input type="search" name="q" defaultValue={search} placeholder={t("nameOrEmail")} className="rounded-lg border border-[#17231d]/15 bg-white px-3 py-2.5 text-sm font-medium text-[#17231d]" />
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold text-[#68736b]">
          {t("status")}
          <select name="status" defaultValue={status ?? ""} className="rounded-lg border border-[#17231d]/15 bg-white px-3 py-2.5 text-sm font-medium text-[#17231d]">
            <option value="">{t("allStatusesOption")}</option>
            {statuses.map((value) => <option key={value} value={value}>{t(value)}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold text-[#68736b]">
          {t("job")}
          <select name="job" defaultValue={jobId ?? ""} className="rounded-lg border border-[#17231d]/15 bg-white px-3 py-2.5 text-sm font-medium text-[#17231d]">
            <option value="">{t("allVacanciesOption")}</option>
            {((jobsData ?? []) as JobInfo[]).map((job) => <option key={job.id} value={job.id}>{job.title}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold text-[#68736b]">
          {t("appliedFrom")}
          <input type="date" name="from" defaultValue={from} className="rounded-lg border border-[#17231d]/15 bg-white px-3 py-2.5 text-sm font-medium text-[#17231d]" />
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold text-[#68736b]">
          {t("appliedTo")}
          <input type="date" name="to" defaultValue={to} className="rounded-lg border border-[#17231d]/15 bg-white px-3 py-2.5 text-sm font-medium text-[#17231d]" />
        </label>
        <div className="flex items-end gap-2">
          <button type="submit" className="rounded-full bg-[#17231d] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#315a42]">{t("filter")}</button>
          <Link href="/admin/applications" className="rounded-full border border-[#17231d]/15 px-4 py-2.5 text-sm font-bold text-[#315a42] hover:bg-[#e8ecdf]">{t("clearFilters")}</Link>
        </div>
      </form>

      <p className="border-b border-[#17231d]/10 px-6 py-3 text-xs text-[#8b948b]">{applications.length} {t("applicationsMatch")}</p>
      {applications.length === 0 ? (
        <p className="p-8 text-sm text-[#68736b]">{t("noMatchingApplications")}</p>
      ) : (
        <div className="stagger-enter divide-y divide-[#17231d]/10">
          {applications.map((application) => {
            const job = jobMap.get(application.job_id);
            const isFinalDecision = application.status === "accepted" || application.status === "rejected";
            const history = historyByApplication.get(application.id) ?? [];
            const followups = followupsByApplication.get(application.id) ?? [];
            return (
              <article key={application.id} className="site-card p-6 transition hover:bg-[#f4f3ec] sm:p-7">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-4">
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#e8ecdf] font-black text-[#315a42]">{application.candidate_name.slice(0, 1) || "?"}</span>
                    <div className="min-w-0">
                      <h2 className="font-bold text-[#17231d]">{application.candidate_name}</h2>
                      <a href={`mailto:${application.contact_email}`} className="mt-1 block truncate text-sm text-[#536c51] hover:underline">{application.contact_email}</a>
                      <p className="mt-2 text-sm text-[#59665d]">{t("appliedFor")} <span className="font-bold">{job?.title ?? t("archivedUnavailable")}</span>{job && <span className="text-[#68736b]"> · {job.company}</span>}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className="text-right">
                      <p className="text-xs font-bold uppercase tracking-wider text-[#8b948b]">{t("applied")}</p>
                      <p className="mt-1 text-sm font-semibold text-[#59665d]">{new Date(application.created_at).toLocaleDateString(locale === "uz" ? "uz-UZ" : locale === "ru" ? "ru-RU" : "en-GB", { day: "2-digit", month: "short", year: "numeric" })}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1.5 text-xs font-bold capitalize ${statusStyles[application.status]}`}>{t(application.status)}</span>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto]">
                  <div className="rounded-2xl border border-[#17231d]/10 bg-white p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#8b948b]">{t("coverLetterLabel")}</p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#59665d]">{application.cover_letter || t("noCoverLetter")}</p>
                  </div>
                  <div className="flex flex-col justify-between gap-3 rounded-2xl border border-[#17231d]/10 bg-white p-4 sm:min-w-52">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#8b948b]">{t("cvPortfolio")}</p>
                    {application.resume_snapshot && typeof application.resume_snapshot === "object" && Object.keys(application.resume_snapshot as Record<string, unknown>).length > 0 ? (
                      <Link href={`/admin/applications/${application.id}/resume`} className="inline-flex items-center justify-center rounded-full bg-[#17231d] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#315a42]">{t("viewResume")}</Link>
                    ) : application.cv_url?.startsWith("http") ? (
                      <a href={application.cv_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-full bg-[#17231d] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#315a42]">{t("openCandidateCv")}</a>
                    ) : <p className="text-xs leading-5 text-[#8b948b]">{t("resumeUnavailable")}</p>}
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-[#17231d]/10 bg-white p-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#8b948b]">{t("statusHistory")}</h3>
                  {history.length === 0 ? <p className="mt-2 text-xs text-[#8b948b]">{t("noHistory")}</p> : (
                    <ol className="mt-3 space-y-2">
                      {history.map((entry, index) => <li key={`${entry.changed_at}-${index}`} className="flex flex-wrap justify-between gap-2 text-xs text-[#68736b]"><span>{entry.previous_status ? `${t(entry.previous_status)} → ${t(entry.new_status)}` : `${t("submittedStatus")} · ${t(entry.new_status)}`}</span><time dateTime={entry.changed_at}>{new Date(entry.changed_at).toLocaleString(locale === "uz" ? "uz-UZ" : locale === "ru" ? "ru-RU" : "en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</time></li>)}
                    </ol>
                  )}
                </div>

                <div className="mt-4 rounded-2xl border border-[#315a42]/15 bg-[#f7f8f2] p-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#536c51]">{t("invitationsNextSteps")}</h3>
                  {followups.length > 0 && (
                    <ol className="mt-3 space-y-3">
                      {followups.map((entry) => (
                        <li key={entry.id} className="rounded-xl border border-[#17231d]/10 bg-white p-3">
                          <div className="flex flex-wrap justify-between gap-2">
                            <strong className="text-sm capitalize text-[#17231d]">{entry.kind === "interview" ? t("interviewInvitation") : entry.kind === "offer" ? t("jobOffer") : t("recommendation")}</strong>
                            <time className="text-xs text-[#8b948b]" dateTime={entry.created_at}>{new Date(entry.created_at).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</time>
                          </div>
                          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#59665d]">{entry.message}</p>
                          {entry.interview_at && <p className="mt-2 text-xs font-semibold text-[#315a42]">{t("interviewTime")} {new Date(entry.interview_at).toLocaleString(locale === "uz" ? "uz-UZ" : locale === "ru" ? "ru-RU" : "en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Tashkent" })}</p>}
                          {entry.location && <p className="mt-1 text-xs text-[#68736b]">{t("location")}: {entry.location}</p>}
                          {entry.meeting_url && <a className="mt-1 inline-block text-xs font-bold text-[#315a42] underline" href={entry.meeting_url} target="_blank" rel="noreferrer">{t("onlineMeetingUrl")}</a>}
                        </li>
                      ))}
                    </ol>
                  )}
                  {application.status !== "rejected" && (
                    <form action={createApplicationFollowup} className="mt-4 grid gap-3 rounded-xl border border-[#17231d]/10 bg-white p-4 sm:grid-cols-2">
                      <input type="hidden" name="applicationId" value={application.id} />
                      <label className="flex flex-col gap-1 text-xs font-bold text-[#68736b]">
                        {t("updateType")}
                        <select name="kind" defaultValue="interview" className="rounded-lg border border-[#17231d]/15 px-3 py-2.5 text-sm text-[#17231d]">
                          <option value="interview">{t("inviteInterview")}</option>
                          <option value="offer">{t("jobOffer")}</option>
                          <option value="recommendation">{t("recommendationNextStep")}</option>
                        </select>
                      </label>
                      <label className="flex flex-col gap-1 text-xs font-bold text-[#68736b]">
                        {t("interviewDateTime")}
                        <input type="datetime-local" name="interviewAt" className="rounded-lg border border-[#17231d]/15 px-3 py-2.5 text-sm text-[#17231d]" />
                      </label>
                      <label className="flex flex-col gap-1 text-xs font-bold text-[#68736b]">
                        {t("addressLocation")}
                        <input name="location" maxLength={300} placeholder={t("addressLocation")} className="rounded-lg border border-[#17231d]/15 px-3 py-2.5 text-sm text-[#17231d]" />
                      </label>
                      <label className="flex flex-col gap-1 text-xs font-bold text-[#68736b]">
                        {t("onlineMeetingUrl")}
                        <input name="meetingUrl" type="url" placeholder="https://..." className="rounded-lg border border-[#17231d]/15 px-3 py-2.5 text-sm text-[#17231d]" />
                      </label>
                      <label className="flex flex-col gap-1 text-xs font-bold text-[#68736b] sm:col-span-2">
                        {t("messageToCandidate")}
                        <textarea name="message" required maxLength={2000} rows={3} placeholder={t("interviewDetailsPlaceholder")} className="rounded-lg border border-[#17231d]/15 px-3 py-2.5 text-sm text-[#17231d]" />
                      </label>
                      <div className="sm:col-span-2 sm:text-right">
                        <button type="submit" className="rounded-full bg-[#315a42] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#244a39]">{t("sendUpdate")}</button>
                      </div>
                    </form>
                  )}
                </div>

                <ApplicationChat applicationId={application.id} messages={messagesByApplication.get(application.id) ?? []} userId={userId} role="admin" locale={locale} live={false} />

                {!isFinalDecision && (
                  <div className="mt-4 flex flex-wrap justify-end gap-3">
                    {application.status !== "reviewing" && <form action={reviewApplication}><input type="hidden" name="applicationId" value={application.id} /><input type="hidden" name="status" value="reviewing" /><button type="submit" className="rounded-full border border-[#315a42]/25 px-5 py-2.5 text-sm font-bold text-[#315a42] hover:bg-[#e7eee2]">{t("markReviewing")}</button></form>}
                    <form action={reviewApplication}><input type="hidden" name="applicationId" value={application.id} /><input type="hidden" name="status" value="rejected" /><button type="submit" className="rounded-full border border-[#8a5042]/25 px-5 py-2.5 text-sm font-bold text-[#8a5042] transition hover:bg-[#f5e6e1]">{t("reject")}</button></form>
                    <form action={reviewApplication}><input type="hidden" name="applicationId" value={application.id} /><input type="hidden" name="status" value="accepted" /><button type="submit" className="rounded-full bg-[#315a42] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#244a39]">{t("acceptCandidate")}</button></form>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}

export default async function AdminApplicationsPage({ searchParams }: Omit<Props, "locale">) {
  const locale = await getLocale();
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  return (
    <main className="site-page-enter mx-auto max-w-7xl p-5 sm:p-8 lg:p-10">
      <div className="mb-8">
        <p className="eyebrow text-[#536c51]">{t("candidatePipeline")}</p>
        <h1 className="display-serif mt-2 text-4xl text-[#17231d] sm:text-5xl">{t("applicationsPageTitle")}</h1>
        <p className="mt-2 text-[#68736b]">{t("applicationsPageDescription")}</p>
      </div>
      <section className="overflow-hidden rounded-3xl border border-[#17231d]/10 bg-[#fbfaf5] shadow-[0_8px_30px_rgba(23,35,29,0.04)]">
        <div className="border-b border-[#17231d]/10 px-6 py-5 sm:px-7">
          <h2 className="font-black text-[#17231d]">{t("allCandidates")}</h2>
          <p className="mt-1 text-sm text-[#68736b]">{t("applicationDetails")}</p>
        </div>
        <Suspense fallback={<p className="p-8 text-sm text-[#68736b]">{t("loadingApplications")}</p>}>
          <ApplicationsList searchParams={searchParams} locale={locale} />
        </Suspense>
      </section>
    </main>
  );
}
