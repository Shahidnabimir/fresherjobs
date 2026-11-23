import { createContext } from "react";

import type { FresherProfile, Job } from "./jobs/types";
import type { TrackerOutcome, TrackerStage, TrackerState } from "./tracker";

/*
 * The context object lives in its own module with only type imports, so hot reloads of
 * the provider or of app data files never create a second context instance.
 */
export interface AppState {
  ready: boolean;
  tracker: TrackerState;
  save: (job: Job) => void;
  setStatus: (job: Job, status: string) => void;
  move: (jobId: string, stage: TrackerStage, outcome?: TrackerOutcome | null) => void;
  setNotes: (jobId: string, notes: string) => void;
  remove: (jobId: string) => void;
  profile: FresherProfile;
  setProfile: (profile: FresherProfile) => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
}

export const AppStateContext = createContext<AppState | null>(null);
