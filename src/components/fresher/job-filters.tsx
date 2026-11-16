import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DEFAULT_FILTERS,
  FIELDS,
  JOB_TYPES,
  POSTED_WINDOWS,
  WORK_MODES,
  type JobFilters as Filters,
} from "@/lib/jobs/types";

interface Props {
  value: Filters;
  onChange: (next: Filters) => void;
}

function FilterSelect<T extends string>({
  label,
  value,
  allLabel,
  options,
  onValueChange,
}: {
  label: string;
  value: T | "all";
  allLabel: string;
  options: { value: T; label: string }[];
  onValueChange: (v: T | "all") => void;
}) {
  return (
    <Select value={value} onValueChange={(v) => onValueChange(v as T | "all")}>
      <SelectTrigger aria-label={label} className="h-10 bg-background">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{allLabel}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function JobFilters({ value, onChange }: Props) {
  const set = <K extends keyof Filters>(key: K, v: Filters[K]) => onChange({ ...value, [key]: v });
  const active =
    value.query !== "" || value.field !== "all" || value.jobType !== "all" || value.workMode !== "all" || value.posted !== "all";

  return (
    <div className="card-surface p-3 sm:p-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={value.query}
          onChange={(e) => set("query", e.target.value)}
          placeholder="Search by role, keyword or company"
          aria-label="Search jobs"
          className="h-11 rounded-lg bg-background pl-10 text-[15px]"
        />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-[repeat(4,minmax(0,1fr))_auto]">
        <FilterSelect
          label="Field"
          value={value.field}
          allLabel="All Fields"
          options={FIELDS.map((f) => ({ value: f, label: f }))}
          onValueChange={(v) => set("field", v)}
        />
        <FilterSelect
          label="Job type"
          value={value.jobType}
          allLabel="All job types"
          options={JOB_TYPES.map((t) => ({ value: t, label: t }))}
          onValueChange={(v) => set("jobType", v)}
        />
        <FilterSelect
          label="Work mode"
          value={value.workMode}
          allLabel="Any work mode"
          options={WORK_MODES.map((m) => ({ value: m, label: m }))}
          onValueChange={(v) => set("workMode", v)}
        />
        <FilterSelect
          label="Posted date"
          value={value.posted}
          allLabel="Any time"
          options={(Object.keys(POSTED_WINDOWS) as (keyof typeof POSTED_WINDOWS)[]).map((k) => ({
            value: k,
            label: POSTED_WINDOWS[k].label,
          }))}
          onValueChange={(v) => set("posted", v)}
        />
        {active && (
          <Button variant="ghost" className="col-span-2 h-10 lg:col-span-1" onClick={() => onChange(DEFAULT_FILTERS)}>
            <X /> Clear
          </Button>
        )}
      </div>
    </div>
  );
}
