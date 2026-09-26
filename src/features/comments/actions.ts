"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { safeNextPath } from "@/lib/navigation";
import { createClient } from "@/lib/supabase/server";

async function requireUser(next: string) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect(`/auth/sign-in?next=${encodeURIComponent(`${next}?intent=comment`)}`);
  return supabase;
}

export async function createComment(formData: FormData) {
  const topicId = String(formData.get("topicId") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  const parentCommentId = String(formData.get("parentCommentId") ?? "") || null;
  const next = safeNextPath(formData.get("next"));
  if (!body) redirect(`${next}?error=Kommentar%20darf%20nicht%20leer%20sein`);
  const supabase = await requireUser(next);
  const { error } = await supabase.rpc("create_topic_comment", {
    p_topic_id: topicId,
    p_body: body,
    p_parent_comment_id: parentCommentId,
  });
  if (error) redirect(`${next}?error=${encodeURIComponent(error.message)}`);
  revalidatePath(next);
  redirect(`${next}?saved=comment`);
}

export async function editComment(formData: FormData) {
  const commentId = String(formData.get("commentId") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  const next = safeNextPath(formData.get("next"));
  const supabase = await requireUser(next);
  const { error } = await supabase.rpc("edit_topic_comment", { p_comment_id: commentId, p_body: body });
  if (error) redirect(`${next}?error=${encodeURIComponent(error.message)}`);
  revalidatePath(next);
}

export async function deleteComment(formData: FormData) {
  const commentId = String(formData.get("commentId") ?? "");
  const next = safeNextPath(formData.get("next"));
  const supabase = await requireUser(next);
  const { error } = await supabase.rpc("delete_topic_comment", { p_comment_id: commentId });
  if (error) redirect(`${next}?error=${encodeURIComponent(error.message)}`);
  revalidatePath(next);
}

export async function hideComment(formData: FormData) {
  const commentId = String(formData.get("commentId") ?? "");
  const next = safeNextPath(formData.get("next"));
  const supabase = await requireUser(next);
  const { error } = await supabase.rpc("hide_topic_comment", { p_comment_id: commentId });
  if (error) redirect(`${next}?error=${encodeURIComponent(error.message)}`);
  revalidatePath(next);
}
