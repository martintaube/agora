import { Button } from "@/components/ui/Button";
import { createTopic, updateTopic } from "@/features/admin/actions";

type Topic = Record<string, string | null> & { id?: string };
type Place = { id: string; name: string };

export function TopicForm({ communitySlug, topic, places = [] }: { communitySlug: string; topic?: Topic; places?: Place[] }) {
  const action = topic?.id ? updateTopic : createTopic;
  const input = "mt-2 min-h-11 w-full border border-[var(--line)] bg-white px-3";
  return <form action={action} className="space-y-6">
    <input type="hidden" name="communitySlug" value={communitySlug} />{topic?.id && <input type="hidden" name="topicId" value={topic.id} />}
    <div className="grid gap-5 sm:grid-cols-2"><label className="text-sm font-semibold">Topic-Typ<select name="type" defaultValue={topic?.type ?? "opinion"} className={input}><option value="information">Information</option><option value="opinion">Meinung gefragt</option><option value="vote">Abstimmung</option><option value="collaboration">Mitarbeit gesucht</option></select></label><label className="text-sm font-semibold">Sichtbarkeit<select name="visibility" defaultValue={topic?.visibility ?? "public"} className={input}><option value="public">Öffentlich</option><option value="community">Community</option></select></label></div>
    <label className="block text-sm font-semibold">Titel<input name="title" required maxLength={180} defaultValue={topic?.title ?? ""} className={input} /></label>
    <label className="block text-sm font-semibold">Slug<input name="slug" defaultValue={topic?.slug ?? ""} placeholder="wird aus dem Titel erzeugt" className={input} /></label>
    <label className="block text-sm font-semibold">Leitfrage<input name="guidingQuestion" defaultValue={topic?.guiding_question ?? ""} className={input} /></label>
    <label className="block text-sm font-semibold">Inhalt<textarea name="content" required rows={8} defaultValue={topic?.content ?? ""} className={`${input} py-3`} /></label>
    <label className="block text-sm font-semibold">Konkrete Aufgabe<textarea name="task" rows={3} defaultValue={topic?.task ?? ""} className={`${input} py-3`} /></label>
    <div className="grid gap-5 sm:grid-cols-2"><label className="text-sm font-semibold">Ort<select name="placeId" defaultValue={topic?.place_id ?? ""} className={input}><option value="">Kein Ort</option>{places.map((place) => <option key={place.id} value={place.id}>{place.name}</option>)}</select></label><label className="text-sm font-semibold">Auswahlmodus<select name="selectionMode" defaultValue={topic?.selection_mode ?? "single"} className={input}><option value="single">Einfachauswahl</option><option value="multiple">Mehrfachauswahl</option></select></label></div>
    {!topic?.id && <label className="block text-sm font-semibold">Optionen für Abstimmung <span className="font-normal text-[var(--muted)]">(eine pro Zeile)</span><textarea name="options" rows={4} className={`${input} py-3`} /></label>}
    <div className="grid gap-5 sm:grid-cols-3"><label className="text-sm font-semibold">Veröffentlichung<select name="publicationStatus" defaultValue={topic?.publication_status ?? "draft"} className={input}><option value="draft">Entwurf</option><option value="published">Veröffentlicht</option><option value="archived">Archiviert</option></select></label><label className="text-sm font-semibold">Beteiligung<select name="participationStatus" defaultValue={topic?.participation_status ?? "open"} className={input}><option value="open">Offen</option><option value="closed">Geschlossen</option></select></label><label className="text-sm font-semibold">Umsetzung<select name="implementationStatus" defaultValue={topic?.implementation_status ?? ""} className={input}><option value="">Kein Status</option><option value="planned">Geplant</option><option value="in_progress">In Umsetzung</option><option value="implemented">Umgesetzt</option></select></label></div>
    <div className="grid gap-5 sm:grid-cols-2"><label className="text-sm font-semibold">Beteiligung endet<input type="datetime-local" name="participationEndsAt" defaultValue={topic?.participation_ends_at?.slice(0, 16) ?? ""} className={input} /></label><label className="text-sm font-semibold">Termin<input type="datetime-local" name="eventStartsAt" defaultValue={topic?.event_starts_at?.slice(0, 16) ?? ""} className={input} /></label></div>
    <Button type="submit">{topic?.id ? "Änderungen speichern" : "Topic erstellen"}</Button>
  </form>;
}
