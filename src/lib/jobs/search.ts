import { POSTED_WINDOWS, type FresherProfile, type Job, type JobFilters } from "./types";

const HOUR = 60 * 60 * 1000;

export function filterJobs(jobs: Job[], filters: JobFilters, now: number): Job[] {
  const q = filters.query.trim().toLowerCase();
  return jobs.filter((job) => {
    if (q) {
      const haystack = `${job.title} ${job.company} ${job.city} ${job.field}`.toLowerCase();
      if (!q.split(/\s+/).every((word) => haystack.includes(word))) return false;
    }
    if (filters.field !== "all" && job.field !== filters.field) return false;
    if (filters.jobType !== "all" && job.jobType !== filters.jobType) return false;
    if (filters.workMode !== "all" && job.workMode !== filters.workMode) return false;
    if (filters.posted !== "all") {
      const ageHours = (now - new Date(job.postedAt).getTime()) / HOUR;
      if (ageHours > POSTED_WINDOWS[filters.posted].hours) return false;
    }
    return true;
  });
}

export interface ProfileMatch {
  score: number;
  fieldMatch: boolean;
  batchMatch: boolean;
  degreeMatch: boolean;
}

export function matchProfile(job: Job, profile: FresherProfile): ProfileMatch {
  const fieldMatch = profile.preferredFields.includes(job.field);
  const batchMatch =
    profile.graduationYear !== null && job.batches.includes(profile.graduationYear);
  const degree = profile.degree.trim().toLowerCase();
  const degreeMatch =
    degree.length > 0 &&
    job.eligibleDegrees.some((d) => {
      const accepted = d.toLowerCase();
      return accepted.includes(degree) || degree.includes(accepted);
    });
  const score = (fieldMatch ? 4 : 0) + (batchMatch ? 2 : 0) + (degreeMatch ? 1 : 0);
  return { score, fieldMatch, batchMatch, degreeMatch };
}

/** Jobs matching the profile float to the top; ties keep newest first. */
export function rankJobs(jobs: Job[], profile: FresherProfile): Job[] {
  return [...jobs].sort((a, b) => {
    const diff = matchProfile(b, profile).score - matchProfile(a, profile).score;
    if (diff !== 0) return diff;
    return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
  });
}

export function hasProfile(profile: FresherProfile): boolean {
  return (
    profile.preferredFields.length > 0 || profile.graduationYear !== null || profile.degree !== ""
  );
}
