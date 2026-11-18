
import { createClient } from "@/lib/supabase/server";

import { mapJob } from "@/types/database";
import type { JobRow } from "@/types/database";
import type { Job } from "@/types/job";

import type {
  JobsFilters,
} from "@/lib/jobs/filters";

// Har sahifada nechta vakansiya?
export const PAGE_SIZE = 3;

// Supabase'dan olinadigan ustunlar
const jobColumns = `
  id,
  title,
  company,
  location,
  work_mode,
  employment_type,
  salary_min,
  salary_max,
  description,
  requirements,
  skills,
  status,
  created_at
`;

// =====================================
// 1. HOME PAGE UCHUN PUBLISHED JOBS
// =====================================

export async function getPublishedJobs(): Promise<Job[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("jobs")
    .select(jobColumns)
    .eq("status", "published")
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error("GET JOBS ERROR:", error);
    throw new Error("Failed to fetch jobs.");
  }

  return ((data ?? []) as JobRow[]).map(mapJob);
}

// =====================================
// 2. JOB DETAILS UCHUN BITTA JOB
// =====================================

export async function getPublishedJobById(
  jobId: string
): Promise<Job | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("jobs")
    .select(jobColumns)
    .eq("id", jobId)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    console.error("GET JOB ERROR:", error);
    throw new Error("Failed to fetch job.");
  }

  if (!data) {
    return null;
  }

  return mapJob(data as JobRow);
}

// =====================================
// 3. SEARCH + FILTER + PAGINATION
// =====================================

type SearchJobsResult = {
  jobs: Job[];
  total: number;
  pageSize: number;
};

export async function searchJobs(
  filters: JobsFilters
): Promise<SearchJobsResult> {
  const supabase = await createClient();

  // Query yaratamiz, lekin hali bajarilmaydi.
  let query = supabase
    .from("jobs")
    .select(jobColumns, {
      count: "exact",
    })
    .eq("status", "published");

  // Title bo'yicha case-insensitive search
  if (filters.q) {
    query = query.ilike(
      "title",
      `%${filters.q}%`
    );
  }

  // Location filter
  if (filters.location) {
    query = query.eq(
      "location",
      filters.location
    );
  }

  // Remote / Hybrid / On-site
  if (filters.workMode) {
    query = query.eq(
      "work_mode",
      filters.workMode
    );
  }

  // Full-time / Part-time / Contract
  if (filters.employmentType) {
    query = query.eq(
      "employment_type",
      filters.employmentType
    );
  }

  // Sorting
  if (filters.sort === "salary_high") {
    query = query
      .order("salary_max", {
        ascending: false,
      })
      .order("created_at", {
        ascending: false,
      })
      .order("id", {
        ascending: true,
      });
  } else if (filters.sort === "salary_low") {
    query = query
      .order("salary_min", {
        ascending: true,
      })
      .order("created_at", {
        ascending: false,
      })
      .order("id", {
        ascending: true,
      });
  } else {
    query = query
      .order("created_at", {
        ascending: false,
      })
      .order("id", {
        ascending: true,
      });
  }

  // Pagination
  const from = (filters.page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const {
    data,
    count,
    error,
  } = await query.range(from, to);

  if (error) {
    console.error("SEARCH JOBS ERROR:", error);
    throw new Error(
      "Failed to search jobs."
    );
  }

  return {
    jobs: ((data ?? []) as JobRow[]).map(mapJob),
    total: count ?? 0,
    pageSize: PAGE_SIZE,
  };
}