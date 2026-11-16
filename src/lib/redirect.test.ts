import { describe, expect, it } from "vitest";
import { safeRedirect } from "./redirect";

describe("safeRedirect", () => {
  it("keeps same-site paths", () => expect(safeRedirect("/tracker")).toBe("/tracker"));
  it("rejects other websites", () => expect(safeRedirect("https://evil.com")).toBe("/"));
  it("rejects protocol-relative links", () => expect(safeRedirect("//evil.com")).toBe("/"));
  it("falls back to home when missing", () => expect(safeRedirect(undefined)).toBe("/"));
});
