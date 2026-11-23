import type { Job } from "./jobs/types";

export const TRACKER_STAGES = ["saved", "applied", "interviewing", "result"] as const;
export type TrackerStage = (typeof TRACKER_STAGES)[number];
export type TrackerOutcome = "offer" | "rejected";

export const TRACKER_STATUS_OPTIONS = [
  { value: "saved", label: "Saved", stage: "saved", outcome: null },
  { value: "applied", label: "Applied", stage: "applied", outcome: null },
  { value: "interviewing", label: "Interviewing", stage: "interviewing", outcome: null },
  { value: "result:offer", label: "Offer", stage: "result", outcome: "offer" },
  { value: "result:rejected", label: "Rejected", stage: "result", outcome: "rejected" },
] as const;

export const STAGE_LABELS: Record<TrackerStage, string> = {
  saved: "Saved",
  applied: "Applied",
  interviewing: "Interviewing",
  result: "Result",
};

export interface TrackerEntry {
  /** Snapshot of the job when saved, so it survives the listing disappearing. */
  job: Job;
  stage: TrackerStage;
  outcome: TrackerOutcome | null;
  notes: string;
  savedAt: number;
  updatedAt: number;
}

export type TrackerState = Record<string, TrackerEntry>;

export function saveJob(state: TrackerState, job: Job, now: number): TrackerState {
  if (state[job.id]) return state;
  return {
    ...state,
    [job.id]: { job, stage: "saved", outcome: null, notes: "", savedAt: now, updatedAt: now },
  };
}

export function moveJob(
  state: TrackerState,
  jobId: string,
  stage: TrackerStage,
  now: number,
  outcome: TrackerOutcome | null = null,
): TrackerState {
  const entry = state[jobId];
  if (!entry) return state;
  return {
    ...state,
    [jobId]: { ...entry, stage, outcome: stage === "result" ? (outcome ?? entry.outcome ?? "offer") : null, updatedAt: now },
  };
}

export function updateNotes(state: TrackerState, jobId: string, notes: string, now: number): TrackerState {
  const entry = state[jobId];
  if (!entry) return state;
  return { ...state, [jobId]: { ...entry, notes, updatedAt: now } };
}

/** Save and update in one transition so an unsaved role cannot lose its status. */
export function setJobStatus(state: TrackerState, job: Job, value: string, now: number): TrackerState {
  const option = TRACKER_STATUS_OPTIONS.find((item) => item.value === value);
  if (!option) return state;
  return moveJob(saveJob(state, job, now), job.id, option.stage, now, option.outcome);
}

export function removeJob(state: TrackerState, jobId: string): TrackerState {
  if (!state[jobId]) return state;
  const next = { ...state };
  delete next[jobId];
  return next;
}

export function entriesInStage(state: TrackerState, stage: TrackerStage): TrackerEntry[] {
  return Object.values(state)
    .filter((e) => e.stage === stage)
    .sort((a, b) => b.updatedAt - a.updatedAt);
}
