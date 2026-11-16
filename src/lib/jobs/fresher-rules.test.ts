import { describe, expect, it } from "vitest";

import { applyFresherFilter, isFresherJob } from "./fresher-filter";
import { getSampleJobs } from "./sample-jobs";
import { filterJobs, rankJobs } from "./search";
import { DEFAULT_FILTERS, EMPTY_PROFILE } from "./types";
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

describe("sample feed", () => {
  it("shows exactly 15 fresher listings and hides the 3 non-fresher ones", () => {
    const { jobs, excludedCount } = applyFresherFilter(getSampleJobs(Date.now()));
    expect(jobs).toHaveLength(15);
    expect(excludedCount).toBe(3);
  });

  it("posted-date filter of 24h keeps only jobs from the last day", () => {
    const now = Date.now();
    const { jobs } = applyFresherFilter(getSampleJobs(now));
    const recent = filterJobs(jobs, { ...DEFAULT_FILTERS, posted: "24h" }, now);
    expect(recent.map((j) => j.id).sort()).toEqual(["s-01", "s-02", "s-03"]);
  });

  it("profile preferred fields rank matching jobs first", () => {
    const now = Date.now();
    const { jobs } = applyFresherFilter(getSampleJobs(now));
    const ranked = rankJobs(jobs, { ...EMPTY_PROFILE, preferredFields: ["Sales"] });
    expect(ranked.slice(0, 2).every((j) => j.field === "Sales")).toBe(true);
  });
});

describe("tracker", () => {
  const job = getSampleJobs(0)[0];
  it("saving a job puts it in Saved", () => {
    expect(saveJob({}, job, 1)[job.id].stage).toBe("saved");
  });
  it("moving to Result records the outcome", () => {
    const state = moveJob(saveJob({}, job, 1), job.id, "result", 2, "rejected");
    expect(state[job.id].stage).toBe("result");
    expect(state[job.id].outcome).toBe("rejected");
  });
});
