import { requireCandidate } from "@/lib/auth";
import type { ApplicationMessage } from "@/components/applications/ApplicationChat";

export type ApplicationStatus = "pending" | "reviewing" | "accepted" | "rejected";

type ApplicationRow = {
  id: string;
  job_id: string;
  status: ApplicationStatus;
  created_at: string;
};

type JobInfo = { id: string; title: string; company: string };

export type ApplicationStatusHistory = {
  application_id: string;
  previous_status: ApplicationStatus | null;
  new_status: ApplicationStatus;
  changed_at: string;
};

export type ApplicationFollowup = {
  id: string;
  application_id: string;
  kind: "interview" | "offer" | "recommendation";
  message: string;
  interview_at: string | null;
  location: string | null;
  meeting_url: string | null;
  created_at: string;
};

export type MyApplication = ApplicationRow & {
  job: JobInfo | null;
  statusHistory: ApplicationStatusHistory[];
  followups: ApplicationFollowup[];
  messages: ApplicationMessage[];
};

export async function getMyApplications(): Promise<{ applications: MyApplication[]; userId: string }> {
  const { supabase, userId } = await requireCandidate();
  const { data, error } = await supabase
    .from("applications")
    .select("id, job_id, status, created_at")
    .eq("candidate_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("APPLICATIONS ERROR:", error.code, error.message);
    throw new Error("Failed to load applications.");
  }

  const applications = (data ?? []) as ApplicationRow[];
  if (applications.length === 0) return { applications: [], userId };

  const jobIds = [...new Set(applications.map((application) => application.job_id))];
  const { data: jobs, error: jobsError } = await supabase
    .from("jobs")
    .select("id, title, company")
    .in("id", jobIds);

  if (jobsError) {
    console.error("APPLICATION JOBS ERROR:", jobsError.code, jobsError.message);
    throw new Error("Failed to load related jobs.");
  }

  const { data: history, error: historyError } = await supabase
    .from("application_status_history")
    .select("application_id, previous_status, new_status, changed_at")
    .in("application_id", applications.map((application) => application.id))
    .order("changed_at", { ascending: true });

  if (historyError) {
    console.error("APPLICATION STATUS HISTORY ERROR:", historyError.code, historyError.message);
    throw new Error("Failed to load application status history.");
  }

  const { data: followups, error: followupsError } = await supabase
    .from("application_followups")
    .select("id, application_id, kind, message, interview_at, location, meeting_url, created_at")
    .in("application_id", applications.map((application) => application.id))
    .order("created_at", { ascending: true });

  if (followupsError) {
    console.error("APPLICATION FOLLOWUPS ERROR:", followupsError.code, followupsError.message);
    throw new Error("Failed to load interview and offer updates.");
  }

  const { data: messages, error: messagesError } = await supabase
    .from("application_messages")
    .select("id, application_id, sender_id, body, is_system, created_at")
    .in("application_id", applications.map((application) => application.id))
    .order("created_at", { ascending: true });

  if (messagesError) {
    console.error("APPLICATION CHAT ERROR:", messagesError.code, messagesError.message);
    throw new Error("Failed to load application messages. Run the application chat SQL setup.");
  }

  const jobMap = new Map(((jobs ?? []) as JobInfo[]).map((job) => [job.id, job]));
  const historyByApplication = new Map<string, ApplicationStatusHistory[]>();
  for (const entry of (history ?? []) as ApplicationStatusHistory[]) {
    const entries = historyByApplication.get(entry.application_id) ?? [];
    entries.push(entry);
    historyByApplication.set(entry.application_id, entries);
  }

  const followupsByApplication = new Map<string, ApplicationFollowup[]>();
  for (const entry of (followups ?? []) as ApplicationFollowup[]) {
    const entries = followupsByApplication.get(entry.application_id) ?? [];
    entries.push(entry);
    followupsByApplication.set(entry.application_id, entries);
  }

  const messagesByApplication = new Map<string, ApplicationMessage[]>();
  for (const entry of (messages ?? []) as ApplicationMessage[]) {
    const entries = messagesByApplication.get(entry.application_id) ?? [];
    entries.push(entry);
    messagesByApplication.set(entry.application_id, entries);
  }

  return { userId, applications: applications.map((application) => ({
    ...application,
    job: jobMap.get(application.job_id) ?? null,
    statusHistory: historyByApplication.get(application.id) ?? [],
    followups: followupsByApplication.get(application.id) ?? [],
    messages: messagesByApplication.get(application.id) ?? [],
  })) };
}
