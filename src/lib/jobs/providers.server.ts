import { classifyField, classifyJobType, classifyWorkMode } from "./classify";
import type { Job } from "./types";

/*
 * Live job providers. Each maps its API response into the shared Job shape.
 * Add a provider by writing one fetch + map function and wiring it in jobs.functions.ts.
 */

const formatInr = (n: number) =>
  n >= 100000 ? `₹${(n / 100000).toFixed(1).replace(/\.0$/, "")} LPA` : `₹${n.toLocaleString("en-IN")}`;

function formatSalary(min?: number | null, max?: number | null, currency?: string | null, period?: string | null): string {
  if (!min && !max) return "Not disclosed";
  const cur = (currency ?? "INR").toUpperCase();
  const fmt = (n: number) => (cur === "INR" ? formatInr(n) : `${cur} ${Math.round(n).toLocaleString()}`);
  const range = min && max && min !== max ? `${fmt(min)} – ${fmt(max)}` : fmt((min ?? max)!);
  return period && period.toUpperCase() !== "YEAR" ? `${range}/${period.toLowerCase()}` : range;
}

// ---------- JSearch (RapidAPI) ----------
interface JSearchJob {
  job_id: string;
  job_title: string;
  employer_name: string;
  job_city?: string | null;
  job_country?: string | null;
  job_is_remote?: boolean;
  job_employment_type?: string | null;
  job_min_salary?: number | null;
  job_max_salary?: number | null;
  job_salary_currency?: string | null;
  job_salary_period?: string | null;
  job_posted_at_datetime_utc?: string | null;
  job_apply_link: string;
  job_description?: string;
  job_highlights?: { Qualifications?: string[] };
  job_required_experience?: { required_experience_in_months?: number | null };
}

const JSEARCH_MAX_PAGES = 3;
const JSEARCH_CACHE_SECONDS = 60 * 60;

type JSearchBody = { data?: JSearchJob[] | { jobs?: JSearchJob[]; cursor?: string | null } };

/** Edge cache (Cloudflare Cache API) when available; a no-op in local dev. */
function edgeCache(): Cache | null {
  const c = (globalThis as { caches?: CacheStorage & { default?: Cache } }).caches;
  return c?.default ?? null;
}

async function fetchJSearchRaw(apiKey: string, query: string, country: string): Promise<JSearchJob[]> {
  const jobs: JSearchJob[] = [];
  let cursor: string | null = null;
  for (let page = 0; page < JSEARCH_MAX_PAGES; page++) {
    const url = new URL("https://jsearch.p.rapidapi.com/search-v2");
    url.searchParams.set("query", query);
    url.searchParams.set("country", country);
    url.searchParams.set("language", "en");
    url.searchParams.set("date_posted", "month");
    if (cursor) url.searchParams.set("cursor", cursor);
    const res = await fetch(url, {
      headers: { "X-RapidAPI-Key": apiKey, "X-RapidAPI-Host": "jsearch.p.rapidapi.com" },
    });
    if (!res.ok) {
      const detail = `JSearch responded ${res.status}: ${(await res.text()).slice(0, 300)}`;
      if (jobs.length > 0) {
        console.warn(`[jobs] stopping pagination early — ${detail}`);
        break;
      }
      throw new Error(detail);
    }
    const body = (await res.json()) as JSearchBody;
    const data = body.data;
    for (const job of Array.isArray(data) ? data : (data?.jobs ?? [])) {
      if (!jobs.some((j) => j.job_id === job.job_id)) jobs.push(job);
    }
    const next = Array.isArray(data) ? null : (data?.cursor ?? null);
    if (!next || next === cursor) break;
    cursor = next;
  }
  return jobs;
}

export async function fetchJSearchJobs(apiKey: string, query: string, country = "in"): Promise<Job[]> {
  // JSearch v5 serves search at /search-v2 with cursor pagination (legacy /search returns 404).
  const cache = edgeCache();
  const cacheKey = new Request(
    `https://fresheronly.cache/jsearch?q=${encodeURIComponent(query)}&c=${encodeURIComponent(country)}`,
  );
  let list: JSearchJob[] | null = null;
  if (cache) {
    const hit = await cache.match(cacheKey);
    if (hit) list = (await hit.json()) as JSearchJob[];
  }
  if (!list) {
    list = await fetchJSearchRaw(apiKey, query, country);
    if (cache && list.length > 0) {
      await cache.put(
        cacheKey,
        new Response(JSON.stringify(list), {
          headers: { "content-type": "application/json", "cache-control": `max-age=${JSEARCH_CACHE_SECONDS}` },
        }),
      );
    }
  }
  console.info(`[jobs] JSearch returned ${list.length} listings`);
  return list.map((j) => {
    const text = `${j.job_title} ${j.job_description ?? ""}`;
    return {
      id: `js-${j.job_id}`,
      title: j.job_title,
      company: j.employer_name,
      field: classifyField(j.job_title),
      jobType: classifyJobType(j.job_title, j.job_employment_type ?? undefined),
      workMode: classifyWorkMode(text, j.job_is_remote),
      city: j.job_city ?? j.job_country ?? "—",
      salary: formatSalary(j.job_min_salary, j.job_max_salary, j.job_salary_currency, j.job_salary_period),
      postedAt: j.job_posted_at_datetime_utc ?? new Date().toISOString(),
      applyUrl: j.job_apply_link,
      summary: (j.job_description ?? "").slice(0, 220),
      requirements: (j.job_highlights?.Qualifications ?? []).slice(0, 4),
      experience: "0–1 yr",
      maxExperienceMonths: j.job_required_experience?.required_experience_in_months ?? undefined,
      eligibleDegrees: [],
      batches: [],
      source: "jsearch" as const,
    };
  });
}

// ---------- Adzuna ----------
interface AdzunaJob {
  id: string;
  title: string;
  company?: { display_name?: string };
  location?: { display_name?: string };
  salary_min?: number;
  salary_max?: number;
  created: string;
  redirect_url: string;
  description?: string;
  contract_time?: string;
}

export async function fetchAdzunaJobs(appId: string, appKey: string, country: string, keywords: string): Promise<Job[]> {
  const url = new URL(`https://api.adzuna.com/v1/api/jobs/${country}/search/1`);
  url.searchParams.set("app_id", appId);
  url.searchParams.set("app_key", appKey);
  url.searchParams.set("results_per_page", "50");
  url.searchParams.set("what_or", keywords);
  url.searchParams.set("what_exclude", "senior lead manager principal");
  url.searchParams.set("max_days_old", "30");
  url.searchParams.set("content-type", "application/json");
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Adzuna responded ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const body = (await res.json()) as { results?: AdzunaJob[] };
  const currency = country === "in" ? "INR" : country === "gb" ? "GBP" : "USD";
  return (body.results ?? []).map((j) => {
    const desc = (j.description ?? "").replace(/<[^>]+>/g, "");
    return {
      id: `az-${j.id}`,
      title: j.title.replace(/<[^>]+>/g, ""),
      company: j.company?.display_name ?? "Company",
      field: classifyField(j.title),
      jobType: classifyJobType(j.title, j.contract_time),
      workMode: classifyWorkMode(`${j.title} ${desc}`),
      city: j.location?.display_name ?? "—",
      salary: formatSalary(j.salary_min, j.salary_max, currency, "YEAR"),
      postedAt: j.created,
      applyUrl: j.redirect_url,
      summary: desc.slice(0, 220),
      requirements: [desc],
      experience: "0–1 yr",
      eligibleDegrees: [],
      batches: [],
      source: "adzuna" as const,
    };
  });
}
