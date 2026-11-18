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
  requirements: string[];
  skills: string[];

  status: JobStatus;
  created_at: string;
};

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
    requirements: row.requirements,
    skills: row.skills,

    status: row.status,
    createdAt: row.created_at,
  };
}