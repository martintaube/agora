import type { TopicPageData } from "@/types/models";

export function getDemoTopic(communitySlug: string, topicSlug: string): TopicPageData | null {
  if (communitySlug !== "ltc" || topicSlug !== "neue-sitzbank") return null;
  const options = [
    { id: "50000000-0000-0000-0000-000000000004", key: "positive", label: "Gute Idee", position: 0 },
    { id: "50000000-0000-0000-0000-000000000005", key: "neutral", label: "Unentschieden", position: 1 },
    { id: "50000000-0000-0000-0000-000000000006", key: "critical", label: "Sehe ich kritisch", position: 2 },
  ];
  return {
    id: "40000000-0000-0000-0000-000000000002",
    community_id: "20000000-0000-0000-0000-000000000001",
    communityName: "Lichtenberger TC",
    communitySlug,
    communityVisibilityLabel: "Nur für Mitglieder",
    placeName: "Vereinsanlage · zwischen Platz 2 und 3",
    type: "opinion",
    visibility: "public",
    title: "Neue Sitzbank zwischen Platz 2 und 3?",
    slug: topicSlug,
    guiding_question: "Sollen wir zwischen Platz 2 und 3 eine neue Sitzbank aufstellen?",
    content: "An dieser Stelle fehlt bislang eine Sitzmöglichkeit für Spielende und Zuschauende. Bevor der Verein eine Bank auswählt und anschafft, möchten wir ein Stimmungsbild aus der Community einholen.",
    task: null,
    selection_mode: "single",
    publication_status: "published",
    participation_status: "open",
    participation_starts_at: "2026-09-20T10:00:00Z",
    participation_ends_at: "2026-10-17T18:00:00Z",
    event_starts_at: null,
    event_ends_at: null,
    result_published_at: null,
    implementation_status: null,
    options,
    results: [
      { ...options[0], selection_count: 18, participant_count: 27, percentage: 66.7 },
      { ...options[1], selection_count: 5, participant_count: 27, percentage: 18.5 },
      { ...options[2], selection_count: 4, participant_count: 27, percentage: 14.8 },
    ],
    collaborationParticipants: [],
    comments: [
      { id: "c1", parent_comment_id: null, author_id: "u1", author_name: "Nora K.", body: "Eine Bank wäre an der Stelle sehr hilfreich, besonders bei Jugendspielen.", edited_at: null, deleted_at: null, created_at: "2026-09-24T14:30:00Z" },
      { id: "c2", parent_comment_id: "c1", author_id: "u2", author_name: "Jan S.", body: "Vielleicht gleich mit einem kleinen Sonnenschutz planen?", edited_at: "2026-09-25T09:10:00Z", deleted_at: null, created_at: "2026-09-25T08:55:00Z" },
      { id: "c3", parent_comment_id: null, author_id: null, author_name: null, body: null, edited_at: null, deleted_at: "2026-09-25T11:00:00Z", created_at: "2026-09-25T10:45:00Z" },
    ],
    attachments: [],
    updates: [],
    selectedOptionIds: [],
    currentUserId: null,
  };
}
