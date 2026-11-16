import { useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { AppStateContext, type AppState } from "./app-state-context";
import { EMPTY_PROFILE, type FresherProfile } from "./jobs/types";
import { THEME_KEY } from "./theme";
import { moveJob, removeJob, saveJob, updateNotes, type TrackerState } from "./tracker";

const TRACKER_KEY = "fresheronly.tracker.v1";
const PROFILE_KEY = "fresheronly.profile.v1";

type Theme = AppState["theme"];

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [tracker, setTracker] = useState<TrackerState>({});
  const [profile, setProfileState] = useState<FresherProfile>(EMPTY_PROFILE);
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    setTracker(readJson(TRACKER_KEY, {}));
    setProfileState({ ...EMPTY_PROFILE, ...readJson(PROFILE_KEY, EMPTY_PROFILE) });
    setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) window.localStorage.setItem(TRACKER_KEY, JSON.stringify(tracker));
  }, [tracker, ready]);

  useEffect(() => {
    if (ready) window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  }, [profile, ready]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      document.documentElement.classList.toggle("dark", next === "dark");
      window.localStorage.setItem(THEME_KEY, next);
      return next;
    });
  }, []);

  const value = useMemo<AppState>(
    () => ({
      ready,
      tracker,
      save: (job) => setTracker((s) => saveJob(s, job, Date.now())),
      move: (jobId, stage, outcome) => setTracker((s) => moveJob(s, jobId, stage, Date.now(), outcome)),
      setNotes: (jobId, notes) => setTracker((s) => updateNotes(s, jobId, notes, Date.now())),
      remove: (jobId) => setTracker((s) => removeJob(s, jobId)),
      profile,
      setProfile: setProfileState,
      theme,
      toggleTheme,
    }),
    [ready, tracker, profile, theme, toggleTheme],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppState {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used inside AppStateProvider");
  return ctx;
}
