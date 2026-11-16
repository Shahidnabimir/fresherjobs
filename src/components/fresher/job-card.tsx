import { Bookmark, BookmarkCheck, Clock, IndianRupee, MapPin, Sparkles, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAppState } from "@/lib/app-state";
import { timeAgo } from "@/lib/format";
import type { ProfileMatch } from "@/lib/jobs/search";
import type { Job } from "@/lib/jobs/types";
import { cn } from "@/lib/utils";

import { FIELD_ICONS } from "./field-icon";
import { StageBadge } from "./stage-badge";
import { VerifiedBadge } from "./verified-badge";

interface JobCardProps {
  job: Job;
  now: number;
  match: ProfileMatch | null;
  index: number;
}

export function JobCard({ job, now, match, index }: JobCardProps) {
  const { tracker, save, move } = useAppState();
  const entry = tracker[job.id];
  const FieldIcon = FIELD_ICONS[job.field];
  const highlighted = match?.fieldMatch ?? false;

  const handleSave = () => {
    if (entry) return;
    save(job);
    toast.success("Saved to your tracker", { description: `${job.title} · ${job.company}` });
  };

  const handleApply = () => {
    if (entry && entry.stage !== "saved") return;
    toast("Did you apply?", {
      description: "Move it to Applied in your tracker.",
      action: {
        label: "Mark applied",
        onClick: () => {
          if (!entry) save(job);
          move(job.id, "applied");
        },
      },
    });
  };

  return (
    <article
      className={cn(
        "card-surface fade-up group relative flex flex-col gap-4 p-5 transition-shadow hover:shadow-lift",
        highlighted && "ring-2 ring-fresh",
      )}
      style={{ animationDelay: `${Math.min(index, 10) * 30}ms` }}
    >
      {highlighted && (
        <span className="absolute -top-2.5 left-5 inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 font-mono text-[10px] tracking-wide text-primary-foreground">
          <Sparkles className="size-3" /> Matches your profile
        </span>
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[17px] font-semibold leading-snug text-foreground">{job.title}</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">{job.company}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSave}
          aria-label={entry ? "Saved to tracker" : "Save to tracker"}
          className={cn("shrink-0", entry && "text-foreground")}
        >
          {entry ? <BookmarkCheck className="fill-fresh" /> : <Bookmark />}
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <VerifiedBadge />
        <Badge variant="outline" className="gap-1 font-medium">
          <FieldIcon className="size-3.5" />
          {job.field}
        </Badge>
        <Badge variant="muted">{job.jobType}</Badge>
        {entry && <StageBadge entry={entry} />}
      </div>

      <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
        <div className="flex items-center gap-2 text-foreground">
          <MapPin className="size-4 text-muted-foreground" />
          <dt className="sr-only">Location</dt>
          <dd className="truncate">
            {job.city}
            <span className="ml-1.5 rounded-md border px-1.5 py-px font-mono text-[10.5px] text-muted-foreground">
              {job.workMode}
            </span>
          </dd>
        </div>
        <div className="flex items-center gap-2 text-foreground">
          <IndianRupee className="size-4 text-muted-foreground" />
          <dt className="sr-only">Salary</dt>
          <dd className="truncate font-medium">{job.salary}</dd>
        </div>
      </dl>

      <p className="line-clamp-2 text-sm text-muted-foreground">{job.summary}</p>

      <div className="mt-auto flex items-center justify-between gap-3 border-t pt-4">
        <span className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
          <Clock className="size-3.5" />
          {timeAgo(job.postedAt, now)}
        </span>
        <div className="flex items-center gap-2">
          {!entry && (
            <Button variant="outline" size="sm" onClick={handleSave}>
              Save
            </Button>
          )}
          <Button asChild size="sm">
            <a href={job.applyUrl} target="_blank" rel="noopener noreferrer" onClick={handleApply}>
              Apply Now <ArrowUpRight />
            </a>
          </Button>
        </div>
      </div>
    </article>
  );
}
