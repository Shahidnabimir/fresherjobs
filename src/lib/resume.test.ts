import { describe, expect, it } from "vitest";

import { resumeDisplayName, resumePath, validateResume } from "./resume";

describe("résumé upload rules", () => {
  it("accepts a PDF under 5 MB", () => {
    expect(validateResume({ name: "CV.PDF", size: 200_000 })).toBeNull();
  });

  it("accepts Word files", () => {
    expect(validateResume({ name: "cv.docx", size: 1000 })).toBeNull();
    expect(validateResume({ name: "cv.doc", size: 1000 })).toBeNull();
  });

  it("rejects other file types", () => {
    expect(validateResume({ name: "photo.png", size: 1000 })).toMatch(/PDF or Word/);
  });

  it("rejects files over 5 MB", () => {
    expect(validateResume({ name: "cv.pdf", size: 5 * 1024 * 1024 + 1 })).toMatch(/5 MB/);
    expect(validateResume({ name: "cv.pdf", size: 5 * 1024 * 1024 })).toBeNull();
  });

  it("stores files inside the owner's folder", () => {
    expect(resumePath("user-1", "My CV (final).pdf", 123)).toBe("user-1/123-My_CV_final_.pdf");
    expect(resumeDisplayName("123-My_CV_final_.pdf")).toBe("My_CV_final_.pdf");
  });
});
