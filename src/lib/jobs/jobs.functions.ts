import { createServerFn } from "@tanstack/react-start";

import { DEFAULT_JSEARCH_QUERY } from "./config";
import { applyFresherFilter } from "./fresher-filter";
import { fetchAdzunaJobs, fetchJSearchJobs } from "./providers.server";
import type { Job, JobSource, JobsResult } from "./types";

/**
 * Single entry point for the job feed — live data only, no mock listings.
 * Provider priority: JSearch (JSEARCH_API_KEY or RAPIDAPI_KEY) → Adzuna (ADZUNA_APP_ID + ADZUNA_APP_KEY).
 * Every source passes through the strict fresher filter before reaching the UI.
 */
export const getJobs = createServerFn({ method: "GET" }).handler(async (): Promise<JobsResult> => {
  const now = Date.now();
  let raw: Job[] = [];
  let source: JobSource | null = null;
  let notice: string | undefined;

  const jsearchKey = process.env["JSEARCH_API_KEY"] ?? process.env["RAPIDAPI_KEY"];
  const adzunaId = process.env["ADZUNA_APP_ID"];
  const adzunaKey = process.env["ADZUNA_APP_KEY"];

  try {
    if (jsearchKey) {
      raw = await fetchJSearchJobs(
        jsearchKey,
        process.env["JSEARCH_QUERY"] || DEFAULT_JSEARCH_QUERY,
        process.env["JSEARCH_COUNTRY"] || "in",
      );
      source = "jsearch";
    } else if (adzunaId && adzunaKey) {
      raw = await fetchAdzunaJobs(
        adzunaId,
        adzunaKey,
        process.env["ADZUNA_COUNTRY"] ?? "in",
        "fresher graduate trainee intern entry junior",
      );
      source = "adzuna";
    } else {
      notice = "The live job feed isn't connected yet.";
    }
  } catch (error) {
    console.error("[jobs] live provider failed", error);
    notice = "Live jobs couldn't be loaded right now — please try again shortly.";
    raw = [];
    source = null;
  }

  const { jobs, excludedCount } = applyFresherFilter(raw);
  return { jobs, source, excludedCount, fetchedAt: now, notice };
});
