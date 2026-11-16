import { Badge } from "@/components/ui/badge";
import { STAGE_LABELS, type TrackerEntry } from "@/lib/tracker";

export function StageBadge({ entry }: { entry: Pick<TrackerEntry, "stage" | "outcome"> }) {
  if (entry.stage === "result") {
    return entry.outcome === "rejected" ? (
      <Badge variant="danger">Rejected</Badge>
    ) : (
      <Badge variant="success">Offer</Badge>
    );
  }
  const variant = entry.stage === "applied" ? "info" : entry.stage === "interviewing" ? "warning" : "muted";
  return <Badge variant={variant}>{STAGE_LABELS[entry.stage]}</Badge>;
}
