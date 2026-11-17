import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, FileText, Loader2, Trash2, Upload } from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { RESUME_ACCEPT, RESUME_BUCKET, resumeDisplayName, resumePath, validateResume } from "@/lib/resume";

export function ResumeUpload() {
  const { user, loading } = useAuth();
  if (loading) return null;

  return (
    <div className="grid gap-2">
      <Label>Résumé</Label>
      {user ? (
        <ResumeManager userId={user.id} />
      ) : (
        <p className="rounded-lg border border-dashed px-3 py-3 text-sm text-muted-foreground">
          <Link to="/auth" search={{ redirect: undefined }} className="font-medium text-foreground underline underline-offset-4">
            Sign in
          </Link>{" "}
          to upload your résumé. Only you can see it.
        </p>
      )}
    </div>
  );
}

function ResumeManager({ userId }: { userId: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const queryKey = ["resume", userId];

  const { data: files = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from(RESUME_BUCKET)
        .list(userId, { sortBy: { column: "created_at", order: "desc" } });
      if (error) throw error;
      return (data ?? []).filter((f) => f.id);
    },
  });
  const current = files[0];

  const upload = useMutation({
    mutationFn: async (file: File) => {
      const path = resumePath(userId, file.name, Date.now());
      const { error } = await supabase.storage
        .from(RESUME_BUCKET)
        .upload(path, file, { contentType: file.type || undefined, upsert: false });
      if (error) throw error;
      // One résumé per person: clear older uploads once the new one is safely stored.
      const old = files.map((f) => `${userId}/${f.name}`);
      if (old.length) await supabase.storage.from(RESUME_BUCKET).remove(old);
    },
    onSuccess: () => toast.success("Résumé uploaded"),
    onError: (e: Error) => toast.error("Upload failed", { description: e.message }),
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  const remove = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.storage
        .from(RESUME_BUCKET)
        .remove(files.map((f) => `${userId}/${f.name}`));
      if (error) throw error;
    },
    onSuccess: () => toast.success("Résumé removed"),
    onError: (e: Error) => toast.error("Couldn't remove résumé", { description: e.message }),
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  async function view() {
    if (!current) return;
    const { data, error } = await supabase.storage
      .from(RESUME_BUCKET)
      .createSignedUrl(`${userId}/${current.name}`, 60);
    if (error || !data) {
      toast.error("Couldn't open résumé");
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener");
  }

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const problem = validateResume(file);
    if (problem) return void toast.error(problem);
    upload.mutate(file);
  }

  const busy = upload.isPending || remove.isPending;

  return (
    <div className="rounded-lg border px-3 py-3">
      <input ref={inputRef} type="file" accept={RESUME_ACCEPT} className="hidden" onChange={onPick} aria-label="Choose résumé file" />
      {isLoading ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Loading…
        </p>
      ) : current ? (
        <div className="flex items-center gap-2">
          <FileText className="size-4 shrink-0 text-muted-foreground" />
          <span className="min-w-0 flex-1 truncate text-sm" title={resumeDisplayName(current.name)}>
            {resumeDisplayName(current.name)}
          </span>
          <Button type="button" variant="ghost" size="icon" className="size-8" onClick={view} aria-label="View résumé">
            <ExternalLink />
          </Button>
          <Button type="button" variant="ghost" size="sm" disabled={busy} onClick={() => inputRef.current?.click()}>
            {upload.isPending ? <Loader2 className="animate-spin" /> : "Replace"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8"
            disabled={busy}
            onClick={() => remove.mutate()}
            aria-label="Remove résumé"
          >
            <Trash2 />
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">PDF or Word, up to 5 MB.</p>
          <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => inputRef.current?.click()}>
            {upload.isPending ? <Loader2 className="animate-spin" /> : <Upload />}
            Upload
          </Button>
        </div>
      )}
    </div>
  );
}
