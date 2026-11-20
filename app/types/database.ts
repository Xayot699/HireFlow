import { Job, JobStatus } from ".";


export type JobRow = {
  id: string;
  title: string;
  company: string;
  location: string;

  work_mode: Job["workMode"];
  employment_type: Job["employmentType"];

  salary_min: number;
  salary_max: number;

  description: string;
  requirements: unknown;
  skills: unknown;

  status: JobStatus;
  created_at: string;
};

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof value !== "string") return [];

  let normalized = value.trim();
  if (!normalized) return [];

  if (normalized.startsWith("[") && normalized.endsWith("]")) {
    try {
      const parsed: unknown = JSON.parse(normalized);
      if (Array.isArray(parsed)) return toStringArray(parsed);
    } catch {
      // Fall through to parsing a plain or PostgreSQL-style array string.
    }
  }

  if (normalized.startsWith("{") && normalized.endsWith("}")) {
    normalized = normalized.slice(1, -1);
  }

  return (normalized.match(/"(?:[^"\\]|\\.)*"|[^,]+/g) ?? [])
    .map((item) => item.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"'))
    .filter((item) => item && item.toUpperCase() !== "NULL");
}

export function mapJob(row: JobRow): Job {
  return {
    id: row.id,
    title: row.title,
    company: row.company,
    location: row.location,

    workMode: row.work_mode,
    employmentType: row.employment_type,

    salaryMin: row.salary_min,
    salaryMax: row.salary_max,

    description: row.description,
    requirements: toStringArray(row.requirements),
    skills: toStringArray(row.skills),

    status: row.status,
    createdAt: row.created_at,
  };
}
