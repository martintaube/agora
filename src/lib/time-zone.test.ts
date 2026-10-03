import { describe, expect, it } from "vitest";
import { communityDateTimeToIso, formatCommunityDateTimeInput } from "./time-zone";

describe("community timezone conversion", () => {
  it("converts Berlin summer time to UTC", () => {
    expect(communityDateTimeToIso("2026-10-17T17:39")).toBe("2026-10-17T15:39:00.000Z");
  });

  it("converts Berlin winter time to UTC", () => {
    expect(communityDateTimeToIso("2026-12-17T17:39")).toBe("2026-12-17T16:39:00.000Z");
  });

  it("formats stored UTC values for datetime-local without shifting the wall time", () => {
    expect(formatCommunityDateTimeInput("2026-10-17T15:39:00.000Z")).toBe("2026-10-17T17:39");
  });
});
