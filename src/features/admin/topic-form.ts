import type { TopicType } from "@/lib/domain/topics";
import { communityDateTimeToIso } from "@/lib/time-zone";

export const MAX_VOTE_OPTIONS = 7;

export const fixedTopicOptions: Partial<Record<TopicType, string[]>> = {
  information: ["Gelesen", "Danke", "Interessiert mich"],
  opinion: ["Gute Idee", "Unentschieden", "Sehe ich kritisch"],
  collaboration: ["Ich bin dabei", "Vielleicht"],
};

function value(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

export function slugify(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ß/g, "ss").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 100);
}

export function topicValues(formData: FormData, userId: string, now = new Date(), existingSlug?: string) {
  const type = value(formData, "type") as TopicType;
  const publicationStatus = value(formData, "publicationStatus");
  const hasGuidingQuestion = type === "opinion" || type === "vote";
  const hasParticipationEnd = type === "opinion" || type === "vote";
  const hasEventPeriod = type === "collaboration";

  return {
    type,
    visibility: value(formData, "visibility"),
    title: value(formData, "title"),
    slug: existingSlug ?? slugify(value(formData, "title")),
    guiding_question: hasGuidingQuestion ? value(formData, "guidingQuestion") || null : null,
    content: value(formData, "content"),
    task: type === "collaboration" ? value(formData, "task") || null : null,
    place_id: value(formData, "placeId") || null,
    selection_mode: type === "information" ? "multiple" : type === "vote" && value(formData, "selectionMode") === "multiple" ? "multiple" : "single",
    publication_status: publicationStatus,
    participation_status: type === "information" ? null : value(formData, "participationStatus") || "open",
    participation_ends_at: hasParticipationEnd ? communityDateTimeToIso(value(formData, "participationEndsAt")) : null,
    event_starts_at: hasEventPeriod ? communityDateTimeToIso(value(formData, "eventStartsAt")) : null,
    event_ends_at: hasEventPeriod ? communityDateTimeToIso(value(formData, "eventEndsAt")) : null,
    implementation_status: value(formData, "implementationStatus") || null,
    published_at: publicationStatus === "published" ? now.toISOString() : null,
    created_by: userId,
  };
}

export function optionLabels(type: TopicType, value: string) {
  return fixedTopicOptions[type] ?? value.split("\n").map((line) => line.trim()).filter(Boolean);
}

export function optionKey(type: TopicType, position: number) {
  const keys: Partial<Record<TopicType, string[]>> = {
    information: ["read", "thanks", "interested"],
    opinion: ["positive", "neutral", "critical"],
    collaboration: ["joining", "maybe"],
  };
  return type === "vote" ? `option-${position + 1}` : keys[type]?.[position];
}
