import { createClient } from "@/lib/supabase/server";
import type { TopicAttachment, TopicComment, TopicOption, TopicPageData, TopicResult, TopicUpdate } from "@/types/models";
import { getDemoTopic } from "./demo";

type TopicRow = Omit<TopicPageData, "communityName" | "communitySlug" | "placeName" | "options" | "results" | "comments" | "attachments" | "updates" | "selectedOptionIds" | "currentUserId">;

export async function getTopicPageData(communitySlug: string, topicSlug: string): Promise<TopicPageData | null> {
  if (process.env.AGORA_DEMO_MODE === "true") return getDemoTopic(communitySlug, topicSlug);
  const supabase = await createClient();
  const { data: community } = await supabase.from("communities").select("id,name,slug").eq("slug", communitySlug).maybeSingle();
  if (!community) return null;

  const { data: topic } = await supabase
    .from("topics")
    .select("id,community_id,place_id,type,visibility,title,slug,guiding_question,content,task,selection_mode,publication_status,participation_status,participation_starts_at,participation_ends_at,event_starts_at,event_ends_at,result_published_at,implementation_status")
    .eq("community_id", community.id)
    .eq("slug", topicSlug)
    .maybeSingle();
  if (!topic) return null;

  const { data: authData } = await supabase.auth.getUser();
  const userId = authData.user?.id ?? null;
  const [placeResponse, optionsResponse, resultsResponse, commentsResponse, attachmentsResponse, updatesResponse, selectionsResponse] = await Promise.all([
    topic.place_id ? supabase.from("places").select("name").eq("id", topic.place_id).maybeSingle() : Promise.resolve({ data: null }),
    supabase.from("topic_options").select("id,key,label,position").eq("topic_id", topic.id).order("position"),
    supabase.rpc("get_topic_results", { p_topic_id: topic.id }),
    supabase.rpc("get_topic_comments", { p_topic_id: topic.id }),
    supabase.from("topic_attachments").select("id,storage_path,file_name,mime_type,is_primary_image").eq("topic_id", topic.id),
    supabase.from("topic_updates").select("id,kind,title,body,published_at").eq("topic_id", topic.id).order("published_at", { ascending: false }),
    userId ? supabase.from("topic_selections").select("option_id").eq("topic_id", topic.id).eq("user_id", userId) : Promise.resolve({ data: [] }),
  ]);

  const attachments = (attachmentsResponse.data ?? []) as TopicAttachment[];
  await Promise.all(attachments.map(async (attachment) => {
    const { data } = await supabase.storage.from("topic-attachments").createSignedUrl(attachment.storage_path, 3600);
    attachment.signedUrl = data?.signedUrl;
  }));

  return {
    ...(topic as TopicRow),
    communityName: community.name,
    communitySlug: community.slug,
    placeName: placeResponse.data?.name ?? null,
    options: (optionsResponse.data ?? []) as TopicOption[],
    results: (resultsResponse.data ?? []) as TopicResult[],
    comments: (commentsResponse.data ?? []) as TopicComment[],
    attachments,
    updates: (updatesResponse.data ?? []) as TopicUpdate[],
    selectedOptionIds: (selectionsResponse.data ?? []).map((item) => item.option_id),
    currentUserId: userId,
  };
}
