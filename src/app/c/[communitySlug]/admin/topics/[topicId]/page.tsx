import { FileUp } from "lucide-react";
import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { QrLinkPanel } from "@/components/admin/QrLinkPanel";
import { TopicForm } from "@/components/admin/TopicForm";
import { Button } from "@/components/ui/Button";
import { hideComment } from "@/features/comments/actions";
import { deleteAttachment, publishUpdate, replaceVoteOptions, uploadAttachment } from "@/features/admin/actions";
import { requireCommunityAdmin } from "@/features/admin/auth";
import { canPublishTopicResult, type ParticipationStatus, type TopicType } from "@/lib/domain/topics";

export default async function EditTopicPage({ params, searchParams }: { params: Promise<{ communitySlug: string; topicId: string }>; searchParams: Promise<{ error?: string; saved?: string }> }) {
  const { communitySlug, topicId } = await params; const query = await searchParams;
  const { supabase, community } = await requireCommunityAdmin(communitySlug);
  const [{ data: topic }, { data: places }, { data: options }, { data: attachments }, { data: comments }] = await Promise.all([
    supabase.from("topics").select("*").eq("id", topicId).eq("community_id", community.id).maybeSingle(),
    supabase.from("places").select("id,name").eq("community_id", community.id).order("name"),
    supabase.from("topic_options").select("id,label,position").eq("topic_id", topicId).order("position"),
    supabase.from("topic_attachments").select("id,file_name,mime_type,is_primary_image").eq("topic_id", topicId),
    supabase.from("topic_comments").select("id,body,hidden_at,created_at").eq("topic_id", topicId).order("created_at", { ascending: false }),
  ]);
  if (!topic) notFound();
  const next = `/c/${communitySlug}/admin/topics/${topicId}`;
  const canPublishResult = canPublishTopicResult(topic.type as TopicType, topic.participation_status as ParticipationStatus);
  return <><AdminHeader communityName={community.name} communitySlug={communitySlug} /><main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
    <div><span className="text-sm font-semibold text-[var(--brand)]">Topic bearbeiten</span><h1 className="mt-2 text-2xl font-bold">{topic.title}</h1></div>
    {query.error && <p role="alert" className="mt-5 border border-red-200 bg-red-50 p-3 text-sm text-red-900">{query.error}</p>}{query.saved && <p role="status" className="mt-5 border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">Gespeichert.</p>}
    <div className="mt-8"><TopicForm communitySlug={communitySlug} communityVisibilityLabel={community.member_visibility_label} topic={topic} places={places ?? []} /></div>
    {topic.type === "vote" && <section className="mt-10 border-t border-[var(--line)] pt-8"><h2 className="text-xl font-bold">Abstimmungsoptionen</h2><p className="mt-2 text-sm text-[var(--muted)]">Nach der ersten Teilnahme sind Optionen unveränderlich.</p><form action={replaceVoteOptions} className="mt-4"><input type="hidden" name="communitySlug" value={communitySlug} /><input type="hidden" name="topicId" value={topicId} /><textarea name="options" defaultValue={(options ?? []).map((option) => option.label).join("\n")} rows={5} className="w-full border border-[var(--line)] bg-white p-3" /><Button className="mt-3">Optionen speichern</Button></form></section>}
    <section className="mt-10 border-t border-[var(--line)] pt-8"><div className="flex items-center gap-2"><FileUp className="h-5 w-5 text-[var(--brand)]" /><h2 className="text-xl font-bold">Anhänge</h2></div><p className="mt-2 text-sm text-[var(--muted)]">JPG, PNG, WebP oder PDF · maximal 10 MB · höchstens 5 Dateien.</p><ul className="mt-4 text-sm">{(attachments ?? []).map((attachment) => <li key={attachment.id} className="flex items-center justify-between gap-4 border-b border-[var(--line)] py-2"><span>{attachment.file_name}{attachment.is_primary_image ? " · Primärbild" : ""}</span><form action={deleteAttachment}><input type="hidden" name="communitySlug" value={communitySlug} /><input type="hidden" name="topicId" value={topicId} /><input type="hidden" name="attachmentId" value={attachment.id} /><Button variant="danger">Entfernen</Button></form></li>)}</ul><form action={uploadAttachment} className="mt-4 flex flex-wrap items-end gap-4"><input type="hidden" name="communitySlug" value={communitySlug} /><input type="hidden" name="topicId" value={topicId} /><label className="text-sm font-semibold">Datei<input type="file" name="file" required accept="image/jpeg,image/png,image/webp,application/pdf" className="mt-2 block text-sm" /></label><label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" name="primary" />Primäres Bild</label><Button>Datei hochladen</Button></form></section>
    <section className="mt-10 border-t border-[var(--line)] pt-8"><h2 className="text-xl font-bold">{canPublishResult ? "Offizielles Update" : "Umsetzungsupdate"}</h2><form action={publishUpdate} className="mt-4 space-y-4"><input type="hidden" name="communitySlug" value={communitySlug} /><input type="hidden" name="topicId" value={topicId} />{canPublishResult ? <select name="kind" className="min-h-11 border border-[var(--line)] bg-white px-3"><option value="result">Ergebnis</option><option value="implementation">Umsetzung</option></select> : <input type="hidden" name="kind" value="implementation" />}<input name="title" required placeholder="Titel" className="min-h-11 w-full border border-[var(--line)] bg-white px-3" /><textarea name="body" required rows={5} placeholder="Update" className="w-full border border-[var(--line)] bg-white p-3" /><Button>Update veröffentlichen</Button></form></section>
    <section className="mt-10 border-t border-[var(--line)] pt-8"><h2 className="text-xl font-bold">Kommentarmoderation</h2><div className="mt-4 border border-[var(--line)] bg-white">{(comments ?? []).map((comment) => <div key={comment.id} className="flex items-start justify-between gap-4 border-b border-[var(--line)] p-4 last:border-0"><p className="text-sm">{comment.hidden_at ? "Ausgeblendet" : comment.body ?? "Kommentar wurde gelöscht"}</p>{!comment.hidden_at && <form action={hideComment}><input type="hidden" name="commentId" value={comment.id} /><input type="hidden" name="next" value={next} /><Button variant="danger">Ausblenden</Button></form>}</div>)}</div></section>
    <div className="mt-10"><QrLinkPanel path={`/c/${communitySlug}/t/${topic.slug}`} /></div>
  </main></>;
}
