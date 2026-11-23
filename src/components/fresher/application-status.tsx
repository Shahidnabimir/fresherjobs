import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppState } from "@/lib/app-state";
import type { Job } from "@/lib/jobs/types";
import { TRACKER_STATUS_OPTIONS } from "@/lib/tracker";

export function ApplicationStatus({ job }: { job: Job }) {
  const { tracker, ready, setStatus } = useAppState();
  const entry = tracker[job.id];
  const value = entry?.stage === "result" ? `result:${entry.outcome ?? "offer"}` : entry?.stage;

  return (
    <Select value={value ?? ""} disabled={!ready} onValueChange={(status) => setStatus(job, status)}>
      <SelectTrigger aria-label="Application status" className="h-10 w-full min-w-0 bg-background">
        <SelectValue placeholder="Not tracked" />
      </SelectTrigger>
      <SelectContent>
        {TRACKER_STATUS_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}