import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, Bookmark, BookmarkCheck, Clock, MapPin, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ApplicationStatus } from "@/components/fresher/application-status";
import { StageBadge } from "@/components/fresher/stage-badge";
import { VerifiedBadge } from "@/components/fresher/verified-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAppState } from "@/lib/app-state";
import { timeAgo } from "@/lib/format";
import { resolveJobDetails } from "@/lib/jobs/details";
import { jobsQueryOptions } from "@/lib/jobs/query";

export const Route = createFileRoute("/jobs/$jobId")({
  loader: async ({ context, params }) => {
    const feed = await context.queryClient.ensureQueryData(jobsQueryOptions);
    return { job: feed.jobs.find((job) => job.id === params.jobId) };
  },
  head: ({ loaderData }) => {
    const job = loaderData?.job;
    const title = job ? `${job.title} at ${job.company} — FresherOnly` : "Job details — FresherOnly";
    const description = job
      ? `${job.title} · ${job.company} · ${job.city}. ${job.summary}`.slice(0, 240)
      : "View a fresher role, save it and track your application from Saved to Interviewing, Offer or Rejected.";
    return { meta: [
      { title }, { name: "description", content: description },
      { property: "og:title", content: title }, { property: "og:description", content: description },
      { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
    ] };
  },
  pendingComponent: () => <div className="mx-auto max-w-5xl px-4 py-12"><Skeleton className="h-64 w-full" /></div>,
  errorComponent: function DetailsError() {
    const router = useRouter();
    return <div className="mx-auto max-w-5xl px-4 py-12" role="alert">
      <h1 className="text-2xl font-bold">Job details couldn’t be loaded</h1>
      <Button className="mt-4" onClick={() => void router.invalidate()}>Try again</Button>
    </div>;
  },
  notFoundComponent: UnavailableJob,
  component: JobDetailsPage,
});

function UnavailableJob() {
  return <div className="mx-auto max-w-5xl px-4 py-12">
    <h1 className="text-2xl font-bold">This job is no longer available</h1>
    <p className="mt-3 text-muted-foreground">There’s no current listing or saved copy on this device.</p>
    <Button asChild variant="outline" className="mt-6"><Link to="/">Browse fresher jobs</Link></Button>
  </div>;
}

function JobDetailsPage() {
  const { jobId } = Route.useParams();
  const { data: feed } = useSuspenseQuery(jobsQueryOptions);
  const { tracker, ready, save, setNotes, remove } = useAppState();
  const job = resolveJobDetails(feed.jobs, tracker, jobId);
  if (!job && !ready) return <div className="mx-auto max-w-5xl px-4 py-12"><Skeleton className="h-64 w-full" /></div>;
  if (!job) return <UnavailableJob />;
  const entry = tracker[job.id];
  const live = feed.jobs.some((listing) => listing.id === job.id);

  return <div className="mx-auto max-w-5xl px-4 pb-16 pt-8 sm:px-6 sm:pt-12">
    <Button asChild variant="ghost" size="sm" className="mb-6"><Link to="/"><ArrowLeft /> All jobs</Link></Button>
    <header className="border-b pb-7">
      <div className="flex flex-wrap items-center gap-2"><VerifiedBadge /><Badge variant="outline">{job.field}</Badge><Badge variant="muted">{job.jobType}</Badge></div>
      <h1 className="mt-4 break-words text-3xl font-bold leading-tight text-foreground sm:text-4xl">{job.title}</h1>
      <p className="mt-2 text-lg text-muted-foreground">{job.company}</p>
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1.5"><MapPin className="size-4 shrink-0" />{job.city} · {job.workMode}</span>
        <span className="font-medium text-foreground">{job.salary}</span>
        <span className="inline-flex items-center gap-1.5"><Clock className="size-4" />{timeAgo(job.postedAt, feed.fetchedAt)}</span>
      </div>
      {!live && <p className="mt-4 text-sm text-warning">Saved listing · This role is no longer in the live feed. The employer’s listing may have closed.</p>}
    </header>

    <div className="grid gap-10 pt-7 md:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="min-w-0 space-y-7">
        <section><h2 className="text-xl font-semibold">About the role</h2><p className="mt-3 whitespace-pre-line break-words text-sm leading-relaxed text-muted-foreground">{job.summary || "No summary provided by the employer."}</p></section>
        <section><h2 className="text-xl font-semibold">Requirements</h2>
          {job.requirements.length ? <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">{job.requirements.map((item, i) => <li className="break-words" key={i}>{item}</li>)}</ul> : <p className="mt-3 text-sm text-muted-foreground">See the employer’s listing for full requirements.</p>}
        </section>
        <section><h2 className="text-xl font-semibold">Eligibility</h2><dl className="mt-3 space-y-3 text-sm">
          <div><dt className="text-muted-foreground">Experience</dt><dd className="mt-1 font-medium">{job.experience}</dd></div>
          <div><dt className="text-muted-foreground">Degree</dt><dd className="mt-1">{job.eligibleDegrees.length ? job.eligibleDegrees.join(", ") : "Not specified"}</dd></div>
          <div><dt className="text-muted-foreground">Graduation batch</dt><dd className="mt-1">{job.batches.length ? job.batches.join(", ") : "Not specified"}</dd></div>
        </dl></section>
      </div>

      <aside className="min-w-0 border-t pt-6 md:border-l md:border-t-0 md:pl-6 md:pt-0">
        <h2 className="text-lg font-semibold">Your application</h2>
        <p className="mt-1 text-xs text-muted-foreground">Saved on this device</p>
        <div className="mt-4 flex flex-col gap-3">
          <Button asChild><a href={job.applyUrl} target="_blank" rel="noopener noreferrer">Apply Now <ArrowUpRight /></a></Button>
          <Button variant="outline" disabled={!ready || Boolean(entry)} onClick={() => { save(job); toast.success("Saved to your tracker"); }}>
            {entry ? <BookmarkCheck /> : <Bookmark />}{entry ? "Saved to tracker" : "Save job"}
          </Button>
          {entry && <div><StageBadge entry={entry} /></div>}
          <label className="mt-2 text-xs font-medium" id="status-label">Application status</label>
          <ApplicationStatus job={job} />
          {entry && <>
            <label htmlFor="application-notes" className="mt-2 text-xs font-medium">Notes</label>
            <Textarea id="application-notes" value={entry.notes} onChange={(event) => setNotes(job.id, event.target.value)} maxLength={1000} placeholder="Interview date, contact or follow-up" className="min-h-28 bg-background text-sm" />
            <Button asChild variant="outline" size="sm"><Link to="/tracker">My Application Tracker</Link></Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => { remove(job.id); toast.success("Removed from your tracker"); }}><Trash2 /> Remove from tracker</Button>
          </>}
        </div>
      </aside>
    </div>
  </div>;
}