import { describe, expect, it } from "vitest";
import { safeNextPath } from "./navigation";

describe("safeNextPath", () => {
  it("accepts internal paths", () => expect(safeNextPath("/c/ltc/t/neue-sitzbank")).toBe("/c/ltc/t/neue-sitzbank"));
  it("rejects external and protocol-relative redirects", () => {
    expect(safeNextPath("https://example.com", "/safe")).toBe("/safe");
    expect(safeNextPath("//example.com", "/safe")).toBe("/safe");
  });
});
