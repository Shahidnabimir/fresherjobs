import type { Job } from "./types";

/** Titles or requirements containing these words are never fresher roles. */
const SENIORITY_PATTERN = /\b(senior|sr\.?|lead|manager|principal|head of)\b/i;

/** "2-4 years", "1 to 3 yrs" */
const RANGE_PATTERN = /(\d+(?:\.\d+)?)\s*(?:-|–|—|to)\s*(\d+(?:\.\d+)?)\s*\+?\s*(?:years?|yrs?)/gi;
/** "2+ years", "3 years", "5 yrs" */
const SINGLE_PATTERN = /(\d+(?:\.\d+)?)\s*\+?\s*(?:years?|yrs?)/gi;

/** True when the text asks for more than 1 year of experience. */
export function requiresMoreThanOneYear(text: string): boolean {
  let rest = text;
  for (const match of text.matchAll(RANGE_PATTERN)) {
    if (Number(match[1]) > 1) return true;
    rest = rest.replace(match[0], " ");
  }
  for (const match of rest.matchAll(SINGLE_PATTERN)) {
    if (Number(match[1]) > 1) return true;
  }
  return false;
}

export function hasSeniorityTerm(text: string): boolean {
  return SENIORITY_PATTERN.test(text);
}

/**
 * Strict fresher rule: only 0–1 year roles. A listing is dropped when its title
 * or requirements mention Senior / Lead / Manager or ask for 2+ years.
 */
export function isFresherJob(job: Pick<Job, "title" | "requirements" | "experience" | "maxExperienceMonths">): boolean {
  if (job.maxExperienceMonths !== undefined && job.maxExperienceMonths > 12) return false;
  const requirementText = [job.experience, ...job.requirements].join(" \n ");
  if (hasSeniorityTerm(job.title) || hasSeniorityTerm(requirementText)) return false;
  if (requiresMoreThanOneYear(job.title) || requiresMoreThanOneYear(requirementText)) return false;
  return true;
}

export function applyFresherFilter<T extends Job>(jobs: T[]): { jobs: T[]; excludedCount: number } {
  const kept = jobs.filter(isFresherJob);
  return { jobs: kept, excludedCount: jobs.length - kept.length };
}
