import type { Job } from "./jobs/types";

export const TRACKER_STAGES = ["saved", "applied", "interviewing", "result"] as const;
export type TrackerStage = (typeof TRACKER_STAGES)[number];
export type TrackerOutcome = "offer" | "rejected";

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
