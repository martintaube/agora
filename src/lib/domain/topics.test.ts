import { describe, expect, it } from "vitest";
import { getImplementationStatusLabel, getTopicStatusLabel } from "./topics";

describe("getTopicStatusLabel", () => {
  it("uses type-specific result labels", () => {
    expect(getTopicStatusLabel({ type: "opinion", publicationStatus: "published", participationStatus: "closed", resultPublishedAt: "2026-09-26" })).toBe("Ausgewertet");
    expect(getTopicStatusLabel({ type: "vote", publicationStatus: "published", participationStatus: "closed", resultPublishedAt: "2026-09-26" })).toBe("Entschieden");
  });

  it("keeps collaboration closed and information current", () => {
    expect(getTopicStatusLabel({ type: "collaboration", publicationStatus: "published", participationStatus: "closed", resultPublishedAt: null })).toBe("Geschlossen");
    expect(getTopicStatusLabel({ type: "information", publicationStatus: "published", participationStatus: null, resultPublishedAt: null })).toBe("Aktuell");
  });

  it("prioritizes draft and archive states", () => {
    expect(getTopicStatusLabel({ type: "vote", publicationStatus: "draft", participationStatus: "open", resultPublishedAt: null })).toBe("Entwurf");
    expect(getTopicStatusLabel({ type: "information", publicationStatus: "archived", participationStatus: null, resultPublishedAt: null })).toBe("Archiviert");
  });
});

describe("getImplementationStatusLabel", () => {
  it("maps optional implementation states", () => {
    expect(getImplementationStatusLabel("in_progress")).toBe("In Umsetzung");
    expect(getImplementationStatusLabel(null)).toBeNull();
  });
});
