import { describe, expect, it } from "vitest";

import { resolveJobDetails } from "./jobs/details";
import type { Job } from "./jobs/types";
import { removeJob, saveJob, setJobStatus, updateNotes } from "./tracker";

const job: Job = {
  id: "live-role", title: "Graduate Trainee", company: "Employer", field: "Tech/IT",
  jobType: "Graduate Trainee", workMode: "On-site", city: "Pune", salary: "Not disclosed",
  postedAt: "2026-11-23T00:00:00Z", applyUrl: "https://example.com/apply", summary: "Graduate role",
  requirements: [], experience: "0–1 yr", eligibleDegrees: [], batches: [], source: "jsearch",
};

describe("job application tracking", () => {
  it("saves a job in Saved", () => {
    expect(saveJob({}, job, 10)[job.id]?.stage).toBe("saved");
  });
  it("saving twice preserves the original snapshot, status and notes without duplicates", () => {
    const state = updateNotes(setJobStatus({}, job, "applied", 10), job.id, "Follow up", 11);
    const next = saveJob(state, { ...job, title: "Changed listing" }, 12);
    expect(next).toBe(state);
    expect(Object.keys(next)).toEqual([job.id]);
    expect(next[job.id]?.notes).toBe("Follow up");
    expect(next[job.id]?.stage).toBe("applied");
  });
  it("sets Applied on an unsaved job in one transition", () => {
    const entry = setJobStatus({}, job, "applied", 20)[job.id];
    expect(entry?.stage).toBe("applied");
    expect(entry?.savedAt).toBe(20);
    expect(entry?.job).toEqual(job);
  });
  it("sets Interviewing", () => {
    expect(setJobStatus({}, job, "interviewing", 20)[job.id]?.stage).toBe("interviewing");
  });
  it("groups Offer under Result", () => {
    const entry = setJobStatus({}, job, "result:offer", 20)[job.id];
    expect(entry?.stage).toBe("result");
    expect(entry?.outcome).toBe("offer");
  });
  it("groups Rejected under Result", () => {
    const entry = setJobStatus({}, job, "result:rejected", 20)[job.id];
    expect(entry?.stage).toBe("result");
    expect(entry?.outcome).toBe("rejected");
  });
  it("clears the outcome when returning to Applied and preserves notes", () => {
    const state = updateNotes(setJobStatus({}, job, "result:rejected", 10), job.id, "Contact HR", 11);
    const entry = setJobStatus(state, job, "applied", 12)[job.id];
    expect(entry?.outcome).toBeNull();
    expect(entry?.notes).toBe("Contact HR");
    expect(entry?.savedAt).toBe(10);
  });
  it("ignores invalid status without saving", () => {
    expect(setJobStatus({}, job, "invalid", 10)).toEqual({});
  });
  it("removes a tracked role", () => {
    expect(removeJob(saveJob({}, job, 10), job.id)).toEqual({});
  });
  it("reads a saved copy when the role disappears", () => {
    expect(resolveJobDetails([], saveJob({}, job, 10), job.id)).toEqual(job);
  });
  it("prefers current live details over the saved copy", () => {
    const current = { ...job, salary: "₹4 LPA" };
    expect(resolveJobDetails([current], saveJob({}, job, 10), job.id)).toEqual(current);
  });
  it("returns unavailable without a live or saved role", () => {
    expect(resolveJobDetails([], {}, job.id)).toBeUndefined();
  });
});