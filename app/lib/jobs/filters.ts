
export type RawJobsSearchParams = {
  q?: string | string[];
  location?: string | string[];
  mode?: string | string[];
  type?: string | string[];
  sort?: string | string[];
  page?: string | string[];
};

export type JobsFilters = {
  q: string;
  location: string;
  workMode: "" | "remote" | "hybrid" | "onsite";
  employmentType:
    | ""
    | "full_time"
    | "part_time"
    | "contract";
  sort: "newest" | "salary_high" | "salary_low";
  page: number;
};

function getValue(
  value: string | string[] | undefined
): string {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return "";
}

// URL'dagi ma'lumotlarni tekshirish
export function parseJobsFilters(
  params: RawJobsSearchParams
): JobsFilters {
  const q = getValue(params.q)
    .trim()
    .replace(/[%_]/g, "")
    .slice(0, 80);

  const rawLocation = getValue(params.location);

  const allowedLocations = [
    "Tashkent",
    "Samarkand",
    "Remote",
  ];

  const location = allowedLocations.includes(
    rawLocation
  )
    ? rawLocation
    : "";

  const rawMode = getValue(params.mode);

  const workMode =
    rawMode === "remote" ||
    rawMode === "hybrid" ||
    rawMode === "onsite"
      ? rawMode
      : "";

  const rawType = getValue(params.type);

  const employmentType =
    rawType === "full_time" ||
    rawType === "part_time" ||
    rawType === "contract"
      ? rawType
      : "";

  const rawSort = getValue(params.sort);

  const sort =
    rawSort === "salary_high" ||
    rawSort === "salary_low"
      ? rawSort
      : "newest";

  const rawPage = Number(
    getValue(params.page)
  );

  const page =
    Number.isSafeInteger(rawPage) &&
    rawPage > 0
      ? Math.min(rawPage, 1000)
      : 1;

  return {
    q,
    location,
    workMode,
    employmentType,
    sort,
    page,
  };
}

// Filterlarni URL manziliga aylantirish
export function buildJobsUrl(
  filters: JobsFilters,
  page: number
): string {
  const params = new URLSearchParams();

  if (filters.q) {
    params.set("q", filters.q);
  }

  if (filters.location) {
    params.set("location", filters.location);
  }

  if (filters.workMode) {
    params.set("mode", filters.workMode);
  }

  if (filters.employmentType) {
    params.set("type", filters.employmentType);
  }

  if (filters.sort !== "newest") {
    params.set("sort", filters.sort);
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const query = params.toString();

  return query
    ? `/jobs?${query}`
    : "/jobs";
}