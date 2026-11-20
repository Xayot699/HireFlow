import { z } from "zod";

const salarySchema = z
  .string()
  .trim()
  .regex(/^\d{1,8}(\.\d{1,2})?$/, "Enter a valid salary")
  .transform(Number);

const jobFieldsSchema = z.object({
    title: z.string().trim().min(3).max(100),
    company: z.string().trim().min(2).max(80),
    location: z.string().trim().min(2).max(80),
    workMode: z.enum(["remote", "hybrid", "onsite"]),
    employmentType: z.enum(["full_time", "part_time", "contract"]),
    salaryMin: salarySchema,
    salaryMax: salarySchema,
    description: z.string().trim().min(30).max(5000),
    requirements: z.string().trim().min(5).max(2000),
    skills: z.string().trim().min(2).max(500),
  });

export const createJobSchema = jobFieldsSchema
  .extend({ status: z.enum(["draft", "published"]) })
  .refine((values) => values.salaryMax >= values.salaryMin, {
    message: "Maximum salary cannot be less than minimum salary.",
    path: ["salaryMax"],
  });

export const updateJobSchema = jobFieldsSchema
  .extend({
    jobId: z.string().min(1).max(160),
    status: z.enum(["draft", "published", "archived"]),
  })
  .refine((values) => values.salaryMax >= values.salaryMin, {
    message: "Maximum salary cannot be less than minimum salary.",
    path: ["salaryMax"],
  });

export type CreateJobInput = z.infer<typeof createJobSchema>;
