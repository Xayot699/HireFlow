import type { Job } from "@/types/index";

export type CandidateFitProfile = {
  desiredPosition: string | null;
  city: string | null;
  skills: string | string[] | null;
};

export type JobFit = {
  score: number | null;
  matchedSkills: string[];
  nextSkill: string | null;
};

function normalize(value: string) {
  return value.normalize("NFKC").toLocaleLowerCase().replace(/\s+/g, " ").trim();
}

function skillList(value: CandidateFitProfile["skills"]) {
  const values = Array.isArray(value) ? value : typeof value === "string" ? value.split(/[,;\n|]/) : [];
  return values.map((item) => item.trim()).filter(Boolean);
}

function titleTokens(value: string) {
  const ignored = new Set(["and", "the", "for", "with", "senior", "junior", "lead", "mid", "level", "developer", "engineer", "manager", "specialist"]);
  return new Set((value.toLocaleLowerCase().match(/[\p{L}\p{N}+#.]+/gu) ?? []).filter((word) => word.length > 2 && !ignored.has(word)));
}

/** Explainable profile-to-role estimate; it is intentionally not presented as an AI verdict. */
export function analyzeJobFit(job: Job, profile: CandidateFitProfile): JobFit {
  const candidateSkills = skillList(profile.skills);
  const normalizedCandidateSkills = new Set(candidateSkills.map(normalize));
  const jobSkills = job.skills.filter(Boolean);
  const matchedSkills = jobSkills.filter((skill) => normalizedCandidateSkills.has(normalize(skill)));
  const nextSkill = jobSkills.find((skill) => !normalizedCandidateSkills.has(normalize(skill))) ?? null;
  const hasPosition = Boolean(profile.desiredPosition?.trim());

  if (candidateSkills.length === 0 && !hasPosition) {
    return { score: null, matchedSkills, nextSkill };
  }

  const candidateTitle = titleTokens(profile.desiredPosition ?? "");
  const roleTitle = titleTokens(job.title);
  const titleOverlap = candidateTitle.size === 0
    ? 0.5
    : [...candidateTitle].filter((token) => roleTitle.has(token)).length / candidateTitle.size;
  const skillFit = jobSkills.length === 0
    ? 0.5
    : candidateSkills.length === 0 ? 0.35 : matchedSkills.length / jobSkills.length;
  const city = normalize(profile.city ?? "");
  const locationFit = job.workMode === "remote"
    ? 1
    : !city ? 0.5
      : normalize(job.location).includes(city) || city.includes(normalize(job.location)) ? 1 : 0.25;

  const rawScore = candidateSkills.length === 0
    ? titleOverlap * 0.8 + locationFit * 0.2
    : skillFit * 0.6 + titleOverlap * 0.25 + locationFit * 0.15;

  return {
    score: Math.max(0, Math.min(100, Math.round(rawScore * 100))),
    matchedSkills: matchedSkills.slice(0, 3),
    nextSkill,
  };
}
