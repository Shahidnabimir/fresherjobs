import { Check, UserRound } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppState } from "@/lib/app-state";
import { hasProfile } from "@/lib/jobs/search";
import { EMPTY_PROFILE, FIELDS, type Field, type FresherProfile } from "@/lib/jobs/types";
import { cn } from "@/lib/utils";

import { FIELD_ICONS } from "./field-icon";

const YEARS = [2023, 2024, 2025, 2026, 2027];

export function ProfileDialog() {
  const { profile, setProfile } = useAppState();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<FresherProfile>(profile);

  const toggleField = (field: Field) =>
    setDraft((d) => ({
      ...d,
      preferredFields: d.preferredFields.includes(field)
        ? d.preferredFields.filter((f) => f !== field)
        : [...d.preferredFields, field],
    }));

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (o) setDraft(profile);
        setOpen(o);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5">
          <span className="relative">
            <UserRound />
            {hasProfile(profile) && (
              <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-fresh ring-2 ring-background" />
            )}
          </span>
          <span className="hidden sm:inline">Profile</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Quick fresher profile</DialogTitle>
          <DialogDescription>Jobs that match you will be highlighted and shown first.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="grad-year">Graduation year</Label>
              <Select
                value={draft.graduationYear ? String(draft.graduationYear) : undefined}
                onValueChange={(v) => setDraft((d) => ({ ...d, graduationYear: Number(v) }))}
              >
                <SelectTrigger id="grad-year" className="h-10">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {YEARS.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="degree">Degree</Label>
              <Input
                id="degree"
                value={draft.degree}
                onChange={(e) => setDraft((d) => ({ ...d, degree: e.target.value }))}
                placeholder="e.g. B.Tech, BBA"
                className="h-10"
                maxLength={40}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Preferred fields</Label>
            <div className="flex flex-wrap gap-2">
              {FIELDS.map((field) => {
                const selected = draft.preferredFields.includes(field);
                const Icon = FIELD_ICONS[field];
                return (
                  <button
                    key={field}
                    type="button"
                    onClick={() => toggleField(field)}
                    aria-pressed={selected}
                    className={cn(
                      "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors",
                      selected
                        ? "border-transparent bg-fresh text-fresh-foreground"
                        : "bg-background text-foreground hover:bg-accent",
                    )}
                  >
                    {selected ? <Check className="size-3.5" /> : <Icon className="size-3.5" />}
                    {field}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <Button variant="ghost" onClick={() => setDraft(EMPTY_PROFILE)}>
            Reset
          </Button>
          <Button
            onClick={() => {
              setProfile({ ...draft, degree: draft.degree.trim() });
              setOpen(false);
              toast.success("Profile saved", { description: "Your feed now shows matching jobs first." });
            }}
          >
            Save profile
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
