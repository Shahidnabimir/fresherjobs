import { describe, expect, it } from "vitest";

import { applyFresherFilter, isFresherJob } from "./fresher-filter";
import { filterJobs, rankJobs } from "./search";
import { DEFAULT_FILTERS, EMPTY_PROFILE, type Job } from "./types";
import { moveJob, saveJob } from "../tracker";

const base = { title: "Associate Analyst", requirements: ["B.Com graduates"], experience: "0–1 yr" };

describe("fresher filter", () => {
  it("excludes '2+ years' in requirements", () => {
    expect(isFresherJob({ ...base, requirements: ["2+ years in sales"] })).toBe(false);
  });
  it("excludes '3+ years' in requirements", () => {
    expect(isFresherJob({ ...base, requirements: ["3+ years experience"] })).toBe(false);
  });
  it("excludes Senior in the title", () => {
    expect(isFresherJob({ ...base, title: "Senior Analyst" })).toBe(false);
  });
  it("excludes Lead in the title", () => {
    expect(isFresherJob({ ...base, title: "Team Lead – Support" })).toBe(false);
  });
  it("excludes Manager in the title", () => {
    expect(isFresherJob({ ...base, title: "Assistant Manager" })).toBe(false);
  });
  it("excludes Manager in requirements", () => {
    expect(isFresherJob({ ...base, requirements: ["Experience as a manager"] })).toBe(false);
  });
  it("keeps 0–1 year roles", () => {
    expect(isFresherJob({ ...base, requirements: ["0-1 year of experience"] })).toBe(true);
  });
  it("excludes sources reporting more than 12 months required", () => {
    expect(isFresherJob({ ...base, maxExperienceMonths: 24 })).toBe(false);
  });
});

const HOUR = 3_600_000;
const makeJob = (id: string, overrides: Partial<Job> = {}, now = 0): Job => ({
  id,
  title: "Graduate Trainee",
  company: "Acme",
  field: "Tech/IT",
  jobType: "Graduate Trainee",
  workMode: "On-site",
  city: "Pune",
  salary: "Not disclosed",
  postedAt: new Date(now).toISOString(),
  applyUrl: "https://example.com/apply",
  summary: "",
  requirements: [],
  experience: "0–1 yr",
  eligibleDegrees: [],
  batches: [],
  source: "jsearch",
  ...overrides,
});

describe("feed filters", () => {
  it("posted-date filter of 24h keeps only jobs from the last day", () => {
    const now = Date.now();
    const jobs = [
      makeJob("new", {}, now - 2 * HOUR),
      makeJob("old", {}, now - 48 * HOUR),
    ];
    const recent = filterJobs(jobs, { ...DEFAULT_FILTERS, posted: "24h" }, now);
    expect(recent.map((j) => j.id)).toEqual(["new"]);
  });

  it("profile preferred fields rank matching jobs first", () => {
    const jobs = [makeJob("a"), makeJob("b", { field: "Sales" }), makeJob("c"), makeJob("d", { field: "Sales" })];
    const ranked = rankJobs(jobs, { ...EMPTY_PROFILE, preferredFields: ["Sales"] });
    expect(ranked.slice(0, 2).every((j) => j.field === "Sales")).toBe(true);
  });

  it("drops Senior roles from a live batch", () => {
    const { jobs, excludedCount } = applyFresherFilter([makeJob("a"), makeJob("b", { title: "Senior Analyst" })]);
    expect(jobs.map((j) => j.id)).toEqual(["a"]);
    expect(excludedCount).toBe(1);
  });
});

describe("tracker", () => {
  const job = makeJob("t-1");
  it("saving a job puts it in Saved", () => {
    expect(saveJob({}, job, 1)[job.id]?.stage).toBe("saved");
  });
  it("moving to Result records the outcome", () => {
    const state = moveJob(saveJob({}, job, 1), job.id, "result", 2, "rejected");
    expect(state[job.id]?.stage).toBe("result");
    expect(state[job.id]?.outcome).toBe("rejected");
  });
});
