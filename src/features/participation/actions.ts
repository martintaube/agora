"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { safeNextPath } from "@/lib/navigation";
import { createClient } from "@/lib/supabase/server";

function participationErrorMessage(message: string) {
  const messages: Record<string, string> = {
    "Participation is closed": "Die Beteiligung ist beendet.",
    "Participation has not started": "Die Beteiligung hat noch nicht begonnen.",
    "Topic is not published": "Dieses Topic ist noch nicht veröffentlicht.",
    "Topic not available": "Dieses Topic ist nicht verfügbar.",
  };
  return messages[message] ?? "Die Auswahl konnte nicht gespeichert werden.";
}

export async function saveSelection(formData: FormData) {
  const topicId = String(formData.get("topicId") ?? "");
  const next = safeNextPath(formData.get("next"));
  const optionIds = formData.getAll("optionIds").map(String);
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    const resume = new URLSearchParams();
    optionIds.forEach((id) => resume.append("select", id));
    const resumedNext = `${next}${next.includes("?") ? "&" : "?"}${resume.toString()}`;
    redirect(`/auth/sign-in?next=${encodeURIComponent(resumedNext)}`);
  }

  const { error } = await supabase.rpc("set_topic_selections", {
    p_topic_id: topicId,
    p_option_ids: optionIds,
  });
  if (error) redirect(`${next}?error=${encodeURIComponent(participationErrorMessage(error.message))}`);
  revalidatePath(next);
  redirect(`${next}?saved=participation`);
}
