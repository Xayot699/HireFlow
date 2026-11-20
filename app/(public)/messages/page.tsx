import Link from "next/link";
import { redirect } from "next/navigation";

import ApplicationChat, { type ApplicationMessage } from "@/components/applications/ApplicationChat";
import ApplicationMessagesRealtime from "@/components/applications/ApplicationMessagesRealtime";
import { getViewer } from "@/lib/auth";
import { getLocale, translate } from "@/lib/i18n";
import type { ApplicationStatus } from "@/features/applications/queries";

export const instant = false;

type Props = { searchParams: Promise<{ conversation?: string | string[] }> };
type ApplicationRow = {
  id: string; job_id: string; candidate_name: string; status: ApplicationStatus; created_at: string;
};
type JobInfo = { id: string; title: string; company: string };

const statusColor: Record<ApplicationStatus, string> = {
  pending: "bg-[#f7efd9] text-[#765f2e]",
  reviewing: "bg-[#e8ecdf] text-[#315a42]",
  accepted: "bg-[#edf4df] text-[#3d6847]",
  rejected: "bg-[#f5e6e1] text-[#8a5042]",
};

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export default async function MessagesPage({ searchParams }: Props) {
  const [viewer, locale, params] = await Promise.all([getViewer(), getLocale(), searchParams]);
  if (!viewer) redirect("/login");
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  const selectedParam = typeof params.conversation === "string" && isUuid(params.conversation) ? params.conversation : undefined;

  let applicationQuery = viewer.supabase
    .from("applications")
    .select("id, job_id, candidate_name, status, created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  if (viewer.role === "candidate") applicationQuery = applicationQuery.eq("candidate_id", viewer.userId);

  const { data: applicationData, error: applicationsError } = await applicationQuery;
  if (applicationsError) {
    console.error("MESSAGES APPLICATION LIST ERROR:", applicationsError.code, applicationsError.message);
    throw new Error("Could not load your conversations.");
  }
  const applications = (applicationData ?? []) as ApplicationRow[];
  const applicationIds = applications.map((application) => application.id);
  const jobIds = [...new Set(applications.map((application) => application.job_id))];

  const [jobsResult, previewsResult] = applicationIds.length
    ? await Promise.all([
        viewer.supabase.from("jobs").select("id, title, company").in("id", jobIds),
        viewer.supabase.from("application_messages").select("id, application_id, sender_id, body, is_system, created_at").in("application_id", applicationIds).order("created_at", { ascending: false }).limit(500),
      ])
    : [{ data: [], error: null }, { data: [], error: null }];

  if (jobsResult.error || previewsResult.error) {
    console.error("MESSAGES PREVIEW LOAD ERROR:", jobsResult.error?.code, jobsResult.error?.message, previewsResult.error?.code, previewsResult.error?.message);
    throw new Error("Could not load your conversation previews. Run the application chat SQL setup.");
  }

  const jobMap = new Map(((jobsResult.data ?? []) as JobInfo[]).map((job) => [job.id, job]));
  const latestByApplication = new Map<string, ApplicationMessage>();
  for (const message of (previewsResult.data ?? []) as ApplicationMessage[]) {
    if (!latestByApplication.has(message.application_id)) latestByApplication.set(message.application_id, message);
  }

  const activeId = applications.some((application) => application.id === selectedParam)
    ? selectedParam
    : applications[0]?.id;
  const activeApplication = applications.find((application) => application.id === activeId);
  let activeMessages: ApplicationMessage[] = [];
  if (activeId) {
    const { data, error } = await viewer.supabase
      .from("application_messages")
      .select("id, application_id, sender_id, body, is_system, created_at")
      .eq("application_id", activeId)
      .order("created_at", { ascending: true });
    if (error) {
      console.error("MESSAGES THREAD LOAD ERROR:", error.code, error.message);
      throw new Error("Could not load this conversation.");
    }
    activeMessages = (data ?? []) as ApplicationMessage[];
  }

  return (
    <main className="site-page-enter mx-auto max-w-7xl px-5 py-9 sm:py-12 lg:px-8">
      <ApplicationMessagesRealtime />
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow flex items-center gap-3 text-[#536c51]"><span className="h-px w-8 bg-[#536c51]" />{t("messagesInboxEyebrow")}</p>
          <h1 className="display-serif mt-3 text-5xl leading-tight text-[#17231d] sm:text-6xl">{t("messagesInboxTitle")}</h1>
          <p className="mt-2 text-sm leading-6 text-[#68736b]">{t("messagesInboxDescription")}</p>
        </div>
        <Link href={viewer.role === "admin" ? "/admin/applications" : "/applications"} className="rounded-full border border-[#17231d]/15 px-4 py-2.5 text-sm font-bold text-[#315a42] transition hover:bg-[#e8ecdf]">{viewer.role === "admin" ? t("allCandidates") : t("applications")}</Link>
      </div>

      <section className="grid min-h-[620px] overflow-hidden rounded-3xl border border-[#17231d]/10 bg-[#fbfaf5] shadow-[0_16px_50px_rgba(23,35,29,0.08)] lg:grid-cols-[330px_minmax(0,1fr)]">
        <aside className="border-b border-[#17231d]/10 bg-[#f8f8f2] lg:border-b-0 lg:border-r">
          <div className="border-b border-[#17231d]/10 px-5 py-4">
            <p className="eyebrow text-[#536c51]">{t("messagesInboxTitle")}</p>
            <p className="mt-1 text-xs text-[#8b948b]">{applications.length} {t("conversationCount")}</p>
          </div>
          {applications.length === 0 ? (
            <div className="p-6 text-sm leading-6 text-[#68736b]">{t("noConversations")}</div>
          ) : (
            <nav aria-label={t("messagesInboxTitle")} className="max-h-[360px] divide-y divide-[#17231d]/10 overflow-y-auto lg:max-h-[calc(100vh-300px)]">
              {applications.map((application) => {
                const job = jobMap.get(application.job_id);
                const lastMessage = latestByApplication.get(application.id);
                const selected = application.id === activeId;
                return (
                  <Link key={application.id} href={`/messages?conversation=${application.id}`} className={`block px-4 py-4 transition hover:bg-white ${selected ? "border-l-4 border-[#6f9e3b] bg-white" : "border-l-4 border-transparent"}`}>
                    <div className="flex items-start gap-3">
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#17231d] text-sm font-black text-[#c9f36a]">{viewer.role === "admin" ? application.candidate_name.slice(0, 1).toUpperCase() : (job?.company ?? "H").slice(0, 1).toUpperCase()}</span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-start justify-between gap-2"><strong className="truncate text-sm text-[#17231d]">{viewer.role === "admin" ? application.candidate_name : job?.company ?? t("jobUnavailable")}</strong><span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold ${statusColor[application.status]}`}>{t(application.status)}</span></span>
                        <span className="mt-1 block truncate text-xs font-semibold text-[#536c51]">{job?.title ?? t("archivedUnavailable")}</span>
                        <span className="mt-1 block truncate text-xs text-[#8b948b]">{lastMessage?.is_system ? t("applicationSubmitted") : lastMessage?.body ?? t("chatStart")}</span>
                      </span>
                    </div>
                  </Link>
                );
              })}
            </nav>
          )}
        </aside>

        <div className="min-w-0 p-4 sm:p-6">
          {activeApplication ? (
            <>
              <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#17231d]/10 pb-4">
                <div className="flex min-w-0 items-center gap-3">
                  <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#e8ecdf] font-black text-[#315a42]">{viewer.role === "admin" ? activeApplication.candidate_name.slice(0, 1).toUpperCase() : (jobMap.get(activeApplication.job_id)?.company ?? "H").slice(0, 1).toUpperCase()}</span>
                  <div className="min-w-0"><h2 className="truncate font-black text-[#17231d]">{viewer.role === "admin" ? activeApplication.candidate_name : jobMap.get(activeApplication.job_id)?.company ?? t("jobUnavailable")}</h2><p className="truncate text-xs text-[#68736b]">{jobMap.get(activeApplication.job_id)?.title ?? t("archivedUnavailable")}</p></div>
                </div>
                <Link href={viewer.role === "admin" ? "/admin/applications" : "/applications"} className="text-xs font-bold text-[#315a42] underline underline-offset-2">{t("applicationDetails")}</Link>
              </header>
              <ApplicationChat applicationId={activeApplication.id} messages={activeMessages} userId={viewer.userId} role={viewer.role} locale={locale} live={false} />
            </>
          ) : (
            <div className="grid h-full min-h-72 place-items-center text-center">
              <div><span aria-hidden="true" className="mx-auto grid size-16 place-items-center rounded-2xl bg-[#e8ecdf] text-3xl text-[#315a42]">✉</span><h2 className="display-serif mt-5 text-3xl text-[#17231d]">{t("selectConversation")}</h2><p className="mt-2 max-w-sm text-sm leading-6 text-[#68736b]">{t("noConversations")}</p></div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
