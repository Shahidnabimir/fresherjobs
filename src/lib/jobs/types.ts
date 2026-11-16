export const FIELDS = [
  "Tech/IT",
  "Marketing",
  "Finance",
  "Core Engineering",
  "HR/Operations",
  "Creative/Design",
  "Sales",
] as const;
export type Field = (typeof FIELDS)[number];

export const JOB_TYPES = ["Full-time", "Internship", "Graduate Trainee"] as const;
export type JobType = (typeof JOB_TYPES)[number];

export const WORK_MODES = ["Remote", "Hybrid", "On-site"] as const;
export type WorkMode = (typeof WORK_MODES)[number];

export const POSTED_WINDOWS = {
  "24h": { label: "Last 24 hours", hours: 24 },
  "7d": { label: "Last 7 days", hours: 24 * 7 },
  "30d": { label: "Last 30 days", hours: 24 * 30 },
} as const;
export type PostedWindow = keyof typeof POSTED_WINDOWS;

export type JobSource = "jsearch" | "adzuna";

/** Normalized job shape every provider (JSearch, Adzuna) maps into. */
export interface Job {
  id: string;
  title: string;
  company: string;
  field: Field;
  jobType: JobType;
  workMode: WorkMode;
  city: string;
  /** Human-readable pay, e.g. "₹4.5 – 6 LPA" or "₹25,000/month stipend". */
  salary: string;
  /** ISO timestamp. */
  postedAt: string;
  applyUrl: string;
  summary: string;
  requirements: string[];
  /** Display label for the experience requirement, e.g. "0–1 yr". */
  experience: string;
  /** Maximum required experience in months, when the source provides it. */
  maxExperienceMonths?: number | undefined;
  /** Degree keywords this role accepts (empty = any graduate). */
  eligibleDegrees: string[];
  /** Graduation batches the role targets (empty = any). */
  batches: number[];
  source: JobSource;
}

export interface JobFilters {
  query: string;
  field: Field | "all";
  jobType: JobType | "all";
  workMode: WorkMode | "all";
  posted: PostedWindow | "all";
}

export const DEFAULT_FILTERS: JobFilters = {
  query: "",
  field: "all",
  jobType: "all",
  workMode: "all",
  posted: "all",
};

export interface FresherProfile {
  graduationYear: number | null;
  degree: string;
  preferredFields: Field[];
}

export const EMPTY_PROFILE: FresherProfile = {
  graduationYear: null,
  degree: "",
  preferredFields: [],
};

export interface JobsResult {
  jobs: Job[];
  /** Live provider that served the feed; null when none was reachable. */
  source: JobSource | null;
  /** How many fetched listings were dropped by the fresher filter. */
  excludedCount: number;
  /** Server time (ms) the list was built — used as "now" for relative dates. */
  fetchedAt: number;
  notice?: string | undefined;
}
