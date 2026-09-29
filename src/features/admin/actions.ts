"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireCommunityAdmin } from "./auth";
import { optionKey, optionLabels, topicValues } from "./topic-form";

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);

export async function createTopic(formData: FormData) {
  const communitySlug = String(formData.get("communitySlug"));
  const { supabase, user, community } = await requireCommunityAdmin(communitySlug);
  const values = topicValues(formData, user.id);
  const labels = optionLabels(values.type, String(formData.get("options") ?? ""));
  if (values.type === "vote" && labels.length < 2) redirect(`/c/${communitySlug}/admin/topics/new?error=Eine%20Abstimmung%20benötigt%20mindestens%20zwei%20Optionen`);
  const { data: topic, error } = await supabase.from("topics").insert({ ...values, community_id: community.id }).select("id").single();
  if (error || !topic) redirect(`/c/${communitySlug}/admin/topics/new?error=${encodeURIComponent(error?.message ?? "Topic konnte nicht erstellt werden")}`);
  const options = labels.map((label, position) => ({ topic_id: topic.id, key: optionKey(values.type, position), label, position }));
  const { error: optionsError } = await supabase.from("topic_options").insert(options);
  if (optionsError) {
    await supabase.from("topics").delete().eq("id", topic.id);
    redirect(`/c/${communitySlug}/admin/topics/new?error=${encodeURIComponent(optionsError.message)}`);
  }
  redirect(`/c/${communitySlug}/admin/topics/${topic.id}`);
}

export async function updateTopic(formData: FormData) {
  const communitySlug = String(formData.get("communitySlug"));
  const topicId = String(formData.get("topicId"));
  const { supabase, user } = await requireCommunityAdmin(communitySlug);
  const values = topicValues(formData, user.id);
  delete (values as Partial<typeof values>).created_by;
  const { data: current } = await supabase.from("topics").select("published_at").eq("id", topicId).single();
  values.published_at = values.publication_status === "draft" ? null : current?.published_at ?? new Date().toISOString();
  const { error } = await supabase.from("topics").update(values).eq("id", topicId);
  if (error) redirect(`/c/${communitySlug}/admin/topics/${topicId}?error=${encodeURIComponent(error.message)}`);
  revalidatePath(`/c/${communitySlug}/t/${values.slug}`);
  redirect(`/c/${communitySlug}/admin/topics/${topicId}?saved=topic`);
}

export async function replaceVoteOptions(formData: FormData) {
  const communitySlug = String(formData.get("communitySlug"));
  const topicId = String(formData.get("topicId"));
  const labels = String(formData.get("options") ?? "").split("\n").map((line) => line.trim()).filter(Boolean);
  const { supabase } = await requireCommunityAdmin(communitySlug);
  const { error } = await supabase.rpc("admin_replace_vote_options", { p_topic_id: topicId, p_labels: labels });
  if (error) redirect(`/c/${communitySlug}/admin/topics/${topicId}?error=${encodeURIComponent(error.message)}`);
  revalidatePath(`/c/${communitySlug}/admin/topics/${topicId}`);
}

export async function publishUpdate(formData: FormData) {
  const communitySlug = String(formData.get("communitySlug"));
  const topicId = String(formData.get("topicId"));
  const { supabase, user } = await requireCommunityAdmin(communitySlug);
  const { error } = await supabase.from("topic_updates").insert({ topic_id: topicId, kind: String(formData.get("kind")), title: String(formData.get("title")), body: String(formData.get("body")), created_by: user.id });
  if (error) redirect(`/c/${communitySlug}/admin/topics/${topicId}?error=${encodeURIComponent(error.message)}`);
  revalidatePath(`/c/${communitySlug}/admin/topics/${topicId}`);
  redirect(`/c/${communitySlug}/admin/topics/${topicId}?saved=update`);
}

export async function upsertMembership(formData: FormData) {
  const communitySlug = String(formData.get("communitySlug"));
  const { supabase, community } = await requireCommunityAdmin(communitySlug);
  const { error } = await supabase.rpc("admin_upsert_membership", { p_community_id: community.id, p_username: String(formData.get("username")), p_role: String(formData.get("role")), p_verified: formData.get("verified") === "on" });
  if (error) redirect(`/c/${communitySlug}/admin?error=${encodeURIComponent(error.message)}`);
  revalidatePath(`/c/${communitySlug}/admin`);
  redirect(`/c/${communitySlug}/admin?saved=membership`);
}

export async function uploadAttachment(formData: FormData) {
  const communitySlug = String(formData.get("communitySlug"));
  const topicId = String(formData.get("topicId"));
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return;
  if (file.size > 10 * 1024 * 1024 || !allowedMimeTypes.has(file.type)) redirect(`/c/${communitySlug}/admin/topics/${topicId}?error=Dateityp%20oder%20Dateigröße%20nicht%20zulässig`);
  const { supabase } = await requireCommunityAdmin(communitySlug);
  const { count } = await supabase.from("topic_attachments").select("id", { count: "exact", head: true }).eq("topic_id", topicId);
  if ((count ?? 0) >= 5) redirect(`/c/${communitySlug}/admin/topics/${topicId}?error=Maximal%20fünf%20Anhänge%20pro%20Topic`);
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const storagePath = `${topicId}/${crypto.randomUUID()}-${safeName}`;
  const { error: uploadError } = await supabase.storage.from("topic-attachments").upload(storagePath, file, { contentType: file.type, upsert: false });
  if (uploadError) redirect(`/c/${communitySlug}/admin/topics/${topicId}?error=${encodeURIComponent(uploadError.message)}`);
  const primary = formData.get("primary") === "on";
  if (primary && !file.type.startsWith("image/")) redirect(`/c/${communitySlug}/admin/topics/${topicId}?error=Nur%20Bilder%20können%20Primärbild%20sein`);
  if (primary) await supabase.from("topic_attachments").update({ is_primary_image: false }).eq("topic_id", topicId).eq("is_primary_image", true);
  const { error } = await supabase.from("topic_attachments").insert({ topic_id: topicId, storage_path: storagePath, file_name: file.name, mime_type: file.type, is_primary_image: primary });
  if (error) {
    await supabase.storage.from("topic-attachments").remove([storagePath]);
    redirect(`/c/${communitySlug}/admin/topics/${topicId}?error=${encodeURIComponent(error.message)}`);
  }
  revalidatePath(`/c/${communitySlug}/admin/topics/${topicId}`);
}

export async function deleteAttachment(formData: FormData) {
  const communitySlug = String(formData.get("communitySlug"));
  const topicId = String(formData.get("topicId"));
  const attachmentId = String(formData.get("attachmentId"));
  const { supabase } = await requireCommunityAdmin(communitySlug);
  const { data: attachment } = await supabase.from("topic_attachments").select("storage_path").eq("id", attachmentId).eq("topic_id", topicId).maybeSingle();
  if (!attachment) return;
  const { error } = await supabase.storage.from("topic-attachments").remove([attachment.storage_path]);
  if (error) redirect(`/c/${communitySlug}/admin/topics/${topicId}?error=${encodeURIComponent(error.message)}`);
  await supabase.from("topic_attachments").delete().eq("id", attachmentId);
  revalidatePath(`/c/${communitySlug}/admin/topics/${topicId}`);
}
