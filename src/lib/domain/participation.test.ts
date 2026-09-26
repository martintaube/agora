import { describe, expect, it } from "vitest";
import { calculateOptionPercentage, canReadTopic } from "./participation";

describe("calculateOptionPercentage", () => {
  it("uses all valid votes for single choice", () => {
    expect(calculateOptionPercentage({ mode: "single", optionSelections: 3, participants: 5, totalSelections: 5 })).toBe(60);
  });

  it("uses participants for multiple choice", () => {
    const first = calculateOptionPercentage({ mode: "multiple", optionSelections: 4, participants: 5, totalSelections: 9 });
    const second = calculateOptionPercentage({ mode: "multiple", optionSelections: 5, participants: 5, totalSelections: 9 });
    expect(first + second).toBe(180);
  });
});

describe("canReadTopic", () => {
  it("keeps community topics private while allowing public published topics", () => {
    expect(canReadTopic({ visibility: "public", published: true, isMember: false, isAdmin: false })).toBe(true);
    expect(canReadTopic({ visibility: "community", published: true, isMember: false, isAdmin: false })).toBe(false);
    expect(canReadTopic({ visibility: "community", published: true, isMember: true, isAdmin: false })).toBe(true);
  });

  it("lets admins read drafts", () => {
    expect(canReadTopic({ visibility: "community", published: false, isMember: true, isAdmin: true })).toBe(true);
  });
});
