import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { TopicPageData } from "@/types/models";
import { ParticipationPanel } from "./ParticipationPanel";

vi.mock("@/features/participation/actions", () => ({ saveSelection: vi.fn() }));

const topic: TopicPageData = {
  id: "topic-1",
  community_id: "community-1",
  communityName: "Lichtenberger TC",
  communitySlug: "ltc",
  communityVisibilityLabel: "Nur für Mitglieder",
  placeName: null,
  type: "vote",
  visibility: "public",
  title: "Testabstimmung",
  slug: "testabstimmung",
  guiding_question: "Welche Option?",
  content: "Kontext",
  task: null,
  selection_mode: "single",
  publication_status: "published",
  participation_status: "open",
  participation_starts_at: null,
  participation_ends_at: "2026-10-02T12:00:00Z",
  event_starts_at: null,
  event_ends_at: null,
  result_published_at: null,
  implementation_status: null,
  options: [{ id: "option-1", key: "one", label: "Option 1", position: 0 }],
  results: [],
  collaborationParticipants: [],
  comments: [],
  attachments: [],
  updates: [],
  selectedOptionIds: [],
  currentUserId: "user-1",
};

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("ParticipationPanel", () => {
  it("shows the remaining time and keeps an active vote available", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-30T12:00:00Z"));
    render(<ParticipationPanel topic={topic} />);

    expect(screen.getByText("noch 2 Tage")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Auswahl speichern" })).toBeVisible();
  });

  it("blocks the form and explains an elapsed deadline in German", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-03T12:00:00Z"));
    render(<ParticipationPanel topic={topic} />);

    expect(screen.getByRole("status")).toHaveTextContent("Beteiligung beendet");
    expect(screen.getByRole("status")).toHaveTextContent("2. Oktober 2026 um 14:00 Uhr");
    expect(screen.queryByRole("button", { name: "Auswahl speichern" })).not.toBeInTheDocument();
    expect(screen.getByText(/keine weiteren Reaktionen möglich/)).toBeVisible();
  });

  it("explains a manual closure without advertising remaining time", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-30T12:00:00Z"));
    render(<ParticipationPanel topic={{ ...topic, participation_status: "closed" }} />);

    expect(screen.getByRole("status")).toHaveTextContent("Beteiligung geschlossen");
    expect(screen.getByRole("status")).toHaveTextContent("manuell vor Ablauf");
    expect(screen.queryByText("noch 2 Tage")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Auswahl speichern" })).not.toBeInTheDocument();
  });

  it("addresses helpers when a collaboration topic is closed", () => {
    render(<ParticipationPanel topic={{
      ...topic,
      type: "collaboration",
      title: "Helfende gesucht",
      task: "Netz abbauen",
      participation_status: "closed",
      participation_ends_at: null,
    }} />);

    expect(screen.getByRole("heading", { name: "Mithilfe" })).toBeVisible();
    expect(screen.getByRole("status")).toHaveTextContent("Suche nach Helfenden geschlossen");
    expect(screen.getByRole("status")).toHaveTextContent("keine weiteren Helfenden gesucht");
    expect(screen.getByText(/Weitere Zusagen sind nicht möglich/)).toBeVisible();
    expect(screen.queryByText(/vor Ablauf/)).not.toBeInTheDocument();
  });

  it("shows collaboration names and explains their visibility before saving", () => {
    render(<ParticipationPanel topic={{
      ...topic,
      type: "collaboration",
      title: "Helfende gesucht",
      task: "Netz abbauen",
      participation_ends_at: null,
      options: [
        { id: "joining", key: "joining", label: "Ich bin dabei", position: 0 },
        { id: "maybe", key: "maybe", label: "Vielleicht", position: 1 },
      ],
      collaborationParticipants: [
        { option_id: "joining", option_key: "joining", option_label: "Ich bin dabei", participant_name: "Martin T." },
        { option_id: "maybe", option_key: "maybe", option_label: "Vielleicht", participant_name: "Anna B." },
      ],
    }} />);

    expect(screen.getByText(/Anzeigename für bestätigte Mitglieder des Lichtenberger TC sichtbar/)).toBeVisible();
    expect(screen.getByRole("region", { name: "Helfende" })).toHaveTextContent("Ich bin dabei1Martin T.");
    expect(screen.getByRole("region", { name: "Helfende" })).toHaveTextContent("Vielleicht1Anna B.");
  });
});
