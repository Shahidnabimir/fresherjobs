import type { TrackerState } from "../tracker";
import type { Job } from "./types";

export function resolveJobDetails(jobs: Job[], tracker: TrackerState, jobId: string): Job | undefined {
  return jobs.find((job) => job.id === jobId) ?? tracker[jobId]?.job;
}