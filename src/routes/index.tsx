import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Info, SearchX } from "lucide-react";
import { useMemo, useState } from "react";

import { JobCard } from "@/components/fresher/job-card";
import { JobFilters } from "@/components/fresher/job-filters";
import { Button } from "@/components/ui/button";
import { useAppState } from "@/lib/app-state";
import { jobsQueryOptions } from "@/lib/jobs/query";
import { filterJobs, hasProfile, matchProfile, rankJobs } from "@/lib/jobs/search";
import { DEFAULT_FILTERS, FIELDS, type JobFilters as Filters } from "@/lib/jobs/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FresherOnly — Fresher jobs, trainee programs & internships" },
      {
        name: "description",
        content: "A job feed only for freshers with 0–1 year experience: IT, finance, marketing, core engineering, design, HR and sales.",
      },
      { property: "og:title", content: "FresherOnly — Fresher jobs, trainee programs & internships" },
      {
        property: "og:description",
        content: "Every listing verified for 0–1 year experience. Search, filter and track your applications.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(jobsQueryOptions),
  errorComponent: function FeedError() {
    const router = useRouter();
    return <div className="mx-auto max-w-6xl px-4 py-12" role="alert"><p>Jobs couldn’t be loaded.</p><Button className="mt-4" onClick={() => void router.invalidate()}>Try again</Button></div>;
  },
  notFoundComponent: () => <p className="px-4 py-12">Job feed unavailable.</p>,
  staleTime: 5 * 60 * 1000,
  component: FeedPage,
});

const SOURCE_LABEL = { jsearch: "Live · JSearch", adzuna: "Live · Adzuna" } as const;

function FeedPage() {
  const { data: { jobs, source, excludedCount, fetchedAt, notice } } = useSuspenseQuery(jobsQueryOptions);
  const { profile } = useAppState();
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const profileSet = hasProfile(profile);

  const visible = useMemo(
    () => rankJobs(filterJobs(jobs, filters, fetchedAt), profile),
    [jobs, filters, fetchedAt, profile],
  );

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pt-14">
      <section className="max-w-2xl">
        <p className="eyebrow">For 0–1 year experience · All industries</p>
        <h1 className="mt-3 text-4xl font-bold leading-[1.05] text-foreground sm:text-5xl">
          First jobs only.
          <br />
          <span className="text-muted-foreground">No “3+ years” surprises.</span>
        </h1>
        <p className="mt-4 text-[15px] text-muted-foreground">
          Entry-level roles, graduate trainee programs and internships — every listing checked for 0–1 year experience.
        </p>
      </section>

      <div className="mt-8">
        <JobFilters value={filters} onChange={setFilters} />
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-foreground">
          <span className="font-semibold">{visible.length}</span>{" "}
          <span className="text-muted-foreground">
            fresher {visible.length === 1 ? "role" : "roles"}
            {profileSet && " · profile matches first"}
          </span>
        </p>
        <p className="font-mono text-xs text-muted-foreground">
          {source ? SOURCE_LABEL[source] : "Live feed offline"}
          {excludedCount > 0 && ` · ${excludedCount} non-fresher listings hidden`}
        </p>
      </div>

      {notice && (
        <p className="mt-3 flex items-center gap-2 rounded-lg bg-warning-soft px-3 py-2 text-sm text-warning">
          <Info className="size-4" /> {notice}
        </p>
      )}

      {visible.length > 0 ? (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {visible.map((job, i) => (
            <JobCard
              key={job.id}
              job={job}
              now={fetchedAt}
              index={i}
              match={profileSet ? matchProfile(job, profile) : null}
            />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="card-surface mt-5 flex flex-col items-center gap-3 px-6 py-16 text-center">
          <SearchX className="size-8 text-muted-foreground" />
          <p className="font-display text-lg font-semibold text-foreground">No live fresher roles right now</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            New listings are pulled in regularly — check back in a little while.
          </p>
        </div>
      ) : (
        <div className="card-surface mt-5 flex flex-col items-center gap-3 px-6 py-16 text-center">
          <SearchX className="size-8 text-muted-foreground" />
          <p className="font-display text-lg font-semibold text-foreground">No fresher roles match these filters</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Try a wider date range or another field — we have roles across {FIELDS.length} fields.
          </p>
          <Button variant="outline" onClick={() => setFilters(DEFAULT_FILTERS)}>
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}
