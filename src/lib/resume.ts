// Résumé upload rules, kept pure so they stay testable.
export const RESUME_BUCKET = "resumes";
export const RESUME_MAX_BYTES = 5 * 1024 * 1024;
export const RESUME_EXTENSIONS = ["pdf", "doc", "docx"] as const;
export const RESUME_ACCEPT = ".pdf,.doc,.docx";

export function resumeExtension(fileName: string): string {
  const dot = fileName.lastIndexOf(".");
  return dot === -1 ? "" : fileName.slice(dot + 1).toLowerCase();
}

/** Returns an error message, or null when the file is allowed. */
export function validateResume(file: { name: string; size: number }): string | null {
  if (!(RESUME_EXTENSIONS as readonly string[]).includes(resumeExtension(file.name))) {
    return "Please upload a PDF or Word file (.pdf, .doc, .docx).";
  }
  if (file.size <= 0) return "That file is empty.";
  if (file.size > RESUME_MAX_BYTES) return "Résumé must be 5 MB or smaller.";
  return null;
}

/** Files live under the owner's id so storage rules can lock them to that person. */
export function resumePath(userId: string, fileName: string, now: number): string {
  const safe = fileName.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(-80);
  return `${userId}/${now}-${safe}`;
}

/** Strip the timestamp prefix to show the original file name. */
export function resumeDisplayName(objectName: string): string {
  return objectName.replace(/^\d+-/, "");
}
