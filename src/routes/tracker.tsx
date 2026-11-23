import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, Bookmark, Trash2 } from "lucide-react";
import { useState } from "react";

import { FIELD_ICONS } from "@/components/fresher/field-icon";
import { ApplicationStatus } from "@/components/fresher/application-status";
import { StageBadge } from "@/components/fresher/stage-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAppState } from "@/lib/app-state";
import { STAGE_LABELS, TRACKER_STAGES, entriesInStage, type TrackerEntry, type TrackerStage } from "@/lib/tracker";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tracker")({
  head: () => ({
    meta: [
      { title: "My Application Tracker — FresherOnly" },
      { name: "description", content: "Track saved jobs, applications, interviews and offers with quick personal notes." },
      { property: "og:title", content: "My Application Tracker — FresherOnly" },
      { property: "og:description", content: "Move fresher job applications from Saved to Offer, with notes for every stage." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TrackerPage,
});

const EMPTY_COPY: Record<TrackerStage, string> = {
  saved: "Tap Save on any job card to start your shortlist.",
  applied: "Jobs you've applied to will show up here.",
  interviewing: "Move a job here once an interview is scheduled.",
  result: "Offers and rejections land here. Every no gets you closer.",
};

function TrackerPage() {
  const { tracker, ready } = useAppState();
  const [tab, setTab] = useState<TrackerStage>("saved");

  return (
    <div className="mx-auto max-w-4xl px-4 pb-16 pt-10 sm:px-6 sm:pt-14">
      <p className="eyebrow">Personal dashboard</p>
      <h1 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">My Application Tracker</h1>
      <p className="mt-2 text-sm text-muted-foreground">Saved on this device. Move jobs between stages and jot down quick notes.</p>

      <Tabs value={tab} onValueChange={(v) => setTab(v as TrackerStage)} className="mt-8">
        <TabsList className="grid h-auto w-full grid-cols-4 rounded-xl p-1">
          {TRACKER_STAGES.map((stage) => {
            const count = ready ? entriesInStage(tracker, stage).length : 0;
            return (
              <TabsTrigger key={stage} value={stage} className="gap-1.5 rounded-lg py-2 text-xs sm:text-sm">
                {STAGE_LABELS[stage]}
                <span className="rounded-full bg-background/70 px-1.5 font-mono text-[10px] text-muted-foreground">
                  {count}
                </span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {TRACKER_STAGES.map((stage) => (
          <TabsContent key={stage} value={stage} className="mt-5">
            {!ready ? (
              <div className="grid gap-3">
                <Skeleton className="h-40 rounded-xl" />
                <Skeleton className="h-40 rounded-xl" />
              </div>
            ) : (
              <StageList stage={stage} entries={entriesInStage(tracker, stage)} />
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function StageList({ stage, entries }: { stage: TrackerStage; entries: TrackerEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="card-surface flex flex-col items-center gap-3 px-6 py-14 text-center">
        <Bookmark className="size-7 text-muted-foreground" />
        <p className="max-w-xs text-sm text-muted-foreground">{EMPTY_COPY[stage]}</p>
        {stage === "saved" && (
          <Button asChild variant="outline" size="sm">
            <Link to="/">Browse fresher jobs</Link>
          </Button>
        )}
      </div>
    );
  }
  return (
    <div className="grid gap-3">
      {entries.map((entry) => (
        <TrackerCard key={entry.job.id} entry={entry} />
      ))}
    </div>
  );
}

function TrackerCard({ entry }: { entry: TrackerEntry }) {
  const { setNotes, remove } = useAppState();
  const { job } = entry;
  const Icon = FIELD_ICONS[job.field];

  return (
    <article
      className={cn(
        "card-surface fade-up grid gap-4 p-5 sm:grid-cols-[1fr_16rem]",
        entry.stage === "result" && entry.outcome === "offer" && "ring-2 ring-fresh",
      )}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <StageBadge entry={entry} />
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Icon className="size-3.5" /> {job.field} · {job.jobType}
          </span>
        </div>
        <h3 className="mt-2 text-lg font-semibold leading-snug text-foreground"><Link to="/jobs/$jobId" params={{ jobId: job.id }} className="hover:underline">{job.title}</Link></h3>
        <p className="text-sm text-muted-foreground">
          {job.company} · {job.city} · {job.workMode}
        </p>
        <p className="mt-1 text-sm font-medium text-foreground">{job.salary}</p>

        <label className="mt-4 block">
          <span className="eyebrow">Notes</span>
          <Textarea
            value={entry.notes}
            onChange={(e) => setNotes(job.id, e.target.value)}
            placeholder="Interview on 24 Nov, 11am · HR: Priya (priya@company.com)"
            className="mt-1.5 min-h-20 resize-y bg-background text-sm"
            maxLength={1000}
          />
        </label>
      </div>

      <div className="flex flex-col gap-2 sm:border-l sm:pl-4">
        <span className="eyebrow">Move to</span>
        <ApplicationStatus job={job} />
        <Button asChild size="sm" variant="outline" className="mt-auto">
          <a href={job.applyUrl} target="_blank" rel="noopener noreferrer">
            Open listing <ArrowUpRight />
          </a>
        </Button>
        <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => remove(job.id)}>
          <Trash2 /> Remove
        </Button>
      </div>
    </article>
  );
}
