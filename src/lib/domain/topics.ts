export type TopicType = "information" | "opinion" | "vote" | "collaboration";
export type PublicationStatus = "draft" | "published" | "archived";
export type ParticipationStatus = "open" | "closed" | null;
export type ImplementationStatus = "planned" | "in_progress" | "implemented" | null;

type TopicStatusInput = {
  type: TopicType;
  publicationStatus: PublicationStatus;
  participationStatus: ParticipationStatus;
  resultPublishedAt: string | null;
};

export function getTopicStatusLabel(topic: TopicStatusInput): string {
  if (topic.publicationStatus === "draft") return "Entwurf";

  if (topic.type === "information") {
    return topic.publicationStatus === "archived" ? "Archiviert" : "Aktuell";
  }

  if (topic.participationStatus === "open") return "Offen";
  if (topic.type === "opinion" && topic.resultPublishedAt) return "Ausgewertet";
  if (topic.type === "vote" && topic.resultPublishedAt) return "Entschieden";
  return "Geschlossen";
}

export function getImplementationStatusLabel(status: ImplementationStatus): string | null {
  if (!status) return null;
  return {
    planned: "Geplant",
    in_progress: "In Umsetzung",
    implemented: "Umgesetzt",
  }[status];
}

export function canPublishTopicResult(type: TopicType, participationStatus: ParticipationStatus): boolean {
  return (type === "opinion" || type === "vote") && participationStatus === "closed";
}
