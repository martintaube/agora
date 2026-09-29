import type { ImplementationStatus, ParticipationStatus, PublicationStatus, TopicType } from "@/lib/domain/topics";

export type TopicVisibility = "public" | "community";
export type SelectionMode = "single" | "multiple";

export type TopicOption = {
  id: string;
  key: string;
  label: string;
  position: number;
};

export type TopicResult = TopicOption & {
  selection_count: number;
  participant_count: number;
  percentage: number;
};

export type TopicComment = {
  id: string;
  parent_comment_id: string | null;
  author_id: string | null;
  author_name: string | null;
  body: string | null;
  edited_at: string | null;
  deleted_at: string | null;
  created_at: string;
};

export type TopicAttachment = {
  id: string;
  storage_path: string;
  file_name: string;
  mime_type: string;
  is_primary_image: boolean;
  signedUrl?: string;
};

export type TopicUpdate = {
  id: string;
  kind: "result" | "implementation";
  title: string;
  body: string;
  published_at: string;
};

export type TopicPageData = {
  id: string;
  community_id: string;
  communityName: string;
  communitySlug: string;
  communityVisibilityLabel: string;
  placeName: string | null;
  type: TopicType;
  visibility: TopicVisibility;
  title: string;
  slug: string;
  guiding_question: string | null;
  content: string;
  task: string | null;
  selection_mode: SelectionMode;
  publication_status: PublicationStatus;
  participation_status: ParticipationStatus;
  participation_starts_at: string | null;
  participation_ends_at: string | null;
  event_starts_at: string | null;
  event_ends_at: string | null;
  result_published_at: string | null;
  implementation_status: ImplementationStatus;
  options: TopicOption[];
  results: TopicResult[];
  comments: TopicComment[];
  attachments: TopicAttachment[];
  updates: TopicUpdate[];
  selectedOptionIds: string[];
  currentUserId: string | null;
};
