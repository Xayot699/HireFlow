import { z } from "zod";

export const applyJobSchema = z.object({
  cvUrl: z
    .string()
    .trim()
    .optional()
    .transform((value) => value ?? "")
    .refine((value) => !value || z.string().url().safeParse(value).success, "Enter a valid URL")
    .refine((url) => !url || url.startsWith("https://") || url.startsWith("http://"), "Use a valid HTTP/HTTPS link"),
  coverLetter: z.string().trim().max(1500),
});
