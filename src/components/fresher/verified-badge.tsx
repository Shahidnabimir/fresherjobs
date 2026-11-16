import { BadgeCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";

export function VerifiedBadge() {
  return (
    <Badge variant="fresh" className="gap-1 font-mono text-[10.5px] tracking-wide">
      <BadgeCheck className="size-3.5" />
      Fresher Verified (0-1 Yr)
    </Badge>
  );
}
