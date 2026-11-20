import { z } from "zod";

const optionalText = (max: number) =>
  z.preprocess(
    (value) => typeof value === "string" ? value.trim() || null : null,
    z.string().max(max).nullable(),
  );

const optionalUrl = z.preprocess(
  (value) => typeof value === "string" ? value.trim() || null : null,
  z.string().url().max(500).nullable(),
);

const optionalInteger = (max: number) =>
  z.preprocess(
    (value) => typeof value === "string" && value.trim() ? Number(value) : null,
    z.number().int().min(0).max(max).nullable(),
  );

export const candidateProfileSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  phone: optionalText(40),
  age: optionalInteger(120),
  city: z.string().trim().min(2).max(100),
  desiredPosition: z.string().trim().min(2).max(120),
  experienceYears: z.preprocess(
    (value) => typeof value === "string" && value.trim() ? Number(value) : null,
    z.number().int().min(0).max(60),
  ),
  previousCompany: optionalText(120),
  previousRole: optionalText(120),
  education: optionalText(200),
  skills: z.string().trim().min(2).max(500),
  portfolioUrl: optionalUrl,
  cvUrl: optionalUrl,
  about: optionalText(2000),
});
