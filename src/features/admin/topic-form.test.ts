import { describe, expect, it } from "vitest";
import { optionLabels, topicValues } from "./topic-form";

function form(type: string) {
  const data = new FormData();
  Object.entries({
    type,
    visibility: "public",
    title: "Test Topic",
    content: "Kontext",
    guidingQuestion: "Alte Leitfrage?",
    task: "Alte Aufgabe",
    selectionMode: "multiple",
    participationStatus: "closed",
    participationEndsAt: "2026-10-10T12:00",
    eventStartsAt: "2026-10-11T12:00",
    eventEndsAt: "2026-10-11T14:00",
    publicationStatus: "draft",
  }).forEach(([key, value]) => data.set(key, value));
  return data;
}

describe("topicValues", () => {
  it("clears values hidden for information topics", () => {
    expect(topicValues(form("information"), "user-1")).toMatchObject({
      guiding_question: null,
      task: null,
      selection_mode: "multiple",
      participation_status: null,
      participation_ends_at: null,
      event_starts_at: null,
      event_ends_at: null,
    });
  });

  it("keeps only opinion fields and enforces single choice", () => {
    expect(topicValues(form("opinion"), "user-1")).toMatchObject({
      guiding_question: "Alte Leitfrage?",
      task: null,
      selection_mode: "single",
      participation_status: "closed",
      participation_ends_at: "2026-10-10T12:00",
      event_starts_at: null,
      event_ends_at: null,
    });
  });

  it("keeps vote mode and collaboration task/period by type", () => {
    expect(topicValues(form("vote"), "user-1")).toMatchObject({ selection_mode: "multiple", task: null, event_starts_at: null });
    expect(topicValues(form("collaboration"), "user-1")).toMatchObject({
      guiding_question: null,
      task: "Alte Aufgabe",
      selection_mode: "single",
      participation_ends_at: null,
      event_starts_at: "2026-10-11T12:00",
      event_ends_at: "2026-10-11T14:00",
    });
  });

  it("creates the slug from the title and preserves an existing slug", () => {
    expect(topicValues(form("opinion"), "user-1").slug).toBe("test-topic");
    expect(topicValues(form("opinion"), "user-1", new Date(), "bestehender-slug").slug).toBe("bestehender-slug");
  });
});

describe("optionLabels", () => {
  it("uses fixed reactions except for votes", () => {
    expect(optionLabels("information", "Ignorieren")).toEqual(["Gelesen", "Danke", "Interessiert mich"]);
    expect(optionLabels("opinion", "Ignorieren")).toEqual(["Gute Idee", "Unentschieden", "Sehe ich kritisch"]);
    expect(optionLabels("collaboration", "Ignorieren")).toEqual(["Ich bin dabei", "Vielleicht"]);
    expect(optionLabels("vote", "Option A\n\n Option B ")).toEqual(["Option A", "Option B"]);
  });
});
