import { createServerFn } from "@tanstack/react-start";

import { DEFAULT_JSEARCH_QUERY } from "./config";
import { applyFresherFilter } from "./fresher-filter";
import { fetchAdzunaJobs, fetchJSearchJobs } from "./providers.server";
import { getSampleJobs } from "./sample-jobs";
import type { Job, JobSource, JobsResult } from "./types";

/**
 * Single entry point for the job feed.
 * Provider priority: JSearch (JSEARCH_API_KEY or RAPIDAPI_KEY) → Adzuna (ADZUNA_APP_ID + ADZUNA_APP_KEY) → sample data.
 * Every source passes through the strict fresher filter before reaching the UI.
 */
export const getJobs = createServerFn({ method: "GET" }).handler(async (): Promise<JobsResult> => {
  const now = Date.now();
  let raw: Job[] | null = null;
  let source: JobSource = "sample";
  let notice: string | undefined;

  const jsearchKey = process.env["JSEARCH_API_KEY"] ?? process.env["RAPIDAPI_KEY"];
  const adzunaId = process.env["ADZUNA_APP_ID"];
  const adzunaKey = process.env["ADZUNA_APP_KEY"];

  try {
    if (jsearchKey) {
      raw = await fetchJSearchJobs(
        jsearchKey,
        process.env["JSEARCH_QUERY"] || DEFAULT_JSEARCH_QUERY,
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
    }
  } catch (error) {
    console.error("[jobs] live provider failed, using sample data", error);
    notice = "Live jobs are unavailable right now — showing sample listings.";
    raw = null;
  }

  if (!raw || raw.length === 0) {
    raw = getSampleJobs(now);
    source = "sample";
  }

  const { jobs, excludedCount } = applyFresherFilter(raw);
  return { jobs, source, excludedCount, fetchedAt: now, notice };
});
