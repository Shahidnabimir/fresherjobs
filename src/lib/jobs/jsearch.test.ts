import { afterEach, describe, expect, it, vi } from "vitest";

import { DEFAULT_JSEARCH_QUERY } from "./config";
import { applyFresherFilter } from "./fresher-filter";
import { fetchJSearchJobs } from "./providers.server";

const job = (id: string, title: string, months: number | null, quals: string[] = []) => ({
  job_id: id,
  job_title: title,
  employer_name: "Acme",
  job_city: "Pune",
  job_apply_link: "https://example.com/apply",
  job_posted_at_datetime_utc: "2026-11-15T00:00:00.000Z",
  job_highlights: { Qualifications: quals },
  job_required_experience: { required_experience_in_months: months },
});

afterEach(() => vi.unstubAllGlobals());

describe("JSearch live feed", () => {
  it("sends the default query 'fresher OR entry level OR graduate trainee'", async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ data: [] })));
    vi.stubGlobal("fetch", fetchMock);
    await fetchJSearchJobs("test-key", DEFAULT_JSEARCH_QUERY);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [URL, RequestInit];
    expect(url.searchParams.get("query")).toBe("fresher OR entry level OR graduate trainee");
    expect((init.headers as Record<string, string>)["X-RapidAPI-Key"]).toBe("test-key");
  });

  it("keeps the 0–1 year filter on live results", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            data: { cursor: "next", jobs: [
              job("a", "Graduate Trainee – Operations", 0),
              job("b", "Senior Software Engineer", null),
              job("c", "Analyst", 36),
              job("d", "Sales Associate", null, ["2+ years of sales experience"]),
            ] },
          }),
        ),
      ),
    );
    const { jobs, excludedCount } = applyFresherFilter(await fetchJSearchJobs("k", DEFAULT_JSEARCH_QUERY));
    expect(jobs.map((j) => j.title)).toEqual(["Graduate Trainee – Operations"]);
    expect(excludedCount).toBe(3);
  });
});

describe("JSearch on the hosted runtime", () => {
  it("still returns live jobs when the edge cache throws", async () => {
    const broken = {
      default: {
        match: async () => {
          throw new Error("Cache API is not yet supported for dynamically-loaded workers.");
        },
        put: async () => {
          throw new Error("Cache API is not yet supported for dynamically-loaded workers.");
        },
      },
    };
    vi.stubGlobal("caches", broken);
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ data: { jobs: [job("z", "Graduate Trainee", 0)] } }))),
    );
    const jobs = await fetchJSearchJobs("test-key", "cache-failure-query");
    expect(jobs.map((j) => j.id)).toEqual(["js-z"]);
  });
});
