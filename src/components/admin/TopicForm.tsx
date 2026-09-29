"use client";

import { CircleHelp, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { createTopic, updateTopic } from "@/features/admin/actions";
import { fixedTopicOptions } from "@/features/admin/topic-form";
import type { TopicType } from "@/lib/domain/topics";

type Topic = Record<string, string | null> & { id?: string };
type Place = { id: string; name: string };

const topicTypes: Array<{ value: TopicType; label: string }> = [
  { value: "information", label: "Information" },
  { value: "opinion", label: "Meinung gefragt" },
  { value: "vote", label: "Abstimmung" },
  { value: "collaboration", label: "Mitarbeit gesucht" },
];

function OptionEditor({ inputClass }: { inputClass: string }) {
  const [options, setOptions] = useState(["", ""]);

  function updateOption(index: number, label: string) {
    setOptions((current) => current.map((option, position) => position === index ? label : option));
  }

  return <fieldset className="space-y-3">
    <legend className="text-sm font-semibold">Antwortoptionen</legend>
    <input type="hidden" name="options" value={options.join("\n")} />
    {options.map((option, index) => <div key={index} className="flex items-center gap-2">
      <input
        value={option}
        onChange={(event) => updateOption(index, event.target.value)}
        required
        maxLength={120}
        aria-label={`Antwortoption ${index + 1}`}
        className={inputClass}
      />
      <button
        type="button"
        onClick={() => setOptions((current) => current.filter((_, position) => position !== index))}
        disabled={options.length <= 2}
        aria-label={`Antwortoption ${index + 1} entfernen`}
        title="Antwortoption entfernen"
        className="mt-2 flex h-11 w-11 shrink-0 items-center justify-center border border-[var(--line)] bg-white text-[var(--muted)] hover:text-[var(--danger)] disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>)}
    <Button type="button" variant="secondary" onClick={() => setOptions((current) => [...current, ""])}>
      <Plus className="mr-2 inline h-4 w-4" aria-hidden="true" />Option hinzufügen
    </Button>
  </fieldset>;
}

export function TopicForm({
  communitySlug,
  communityVisibilityLabel = "Community",
  communityVisibilityHelpText = "nur für angemeldete Mitglieder dieser Gemeinschaft lesbar.",
  topic,
  places = [],
}: {
  communitySlug: string;
  communityVisibilityLabel?: string;
  communityVisibilityHelpText?: string;
  topic?: Topic;
  places?: Place[];
}) {
  const action = topic?.id ? updateTopic : createTopic;
  const [type, setType] = useState<TopicType>((topic?.type as TopicType | undefined) ?? "opinion");
  const input = "mt-2 min-h-11 w-full border border-[var(--line)] bg-white px-3";
  const fixedOptions = fixedTopicOptions[type];
  const hasGuidingQuestion = type === "opinion" || type === "vote";
  const hasParticipationEnd = type === "opinion" || type === "vote";
  const hasEventPeriod = type === "collaboration";

  return <form action={action} className="space-y-6">
    <input type="hidden" name="communitySlug" value={communitySlug} />
    {topic?.id && <input type="hidden" name="topicId" value={topic.id} />}

    <div className="grid gap-5 sm:grid-cols-2">
      <label className="text-sm font-semibold">Topic-Typ
        <select name="type" value={type} onChange={(event) => setType(event.target.value as TopicType)} className={input}>
          {topicTypes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
      </label>
      <div>
        <div className="flex items-center gap-1.5 text-sm font-semibold">
          <label htmlFor="topic-visibility">Sichtbarkeit</label>
          <span tabIndex={0} className="group relative inline-flex text-[var(--muted)] outline-none focus:text-[var(--foreground)]" aria-label="Bedeutung der Sichtbarkeit">
            <CircleHelp className="h-4 w-4" aria-hidden="true" />
            <span role="tooltip" className="invisible absolute left-1/2 top-6 z-20 w-72 -translate-x-1/2 border border-[var(--line)] bg-white p-3 text-xs font-normal leading-5 text-[var(--foreground)] shadow-lg group-hover:visible group-focus:visible">
              <strong>Öffentlich:</strong> ohne Anmeldung lesbar.<br /><strong>{communityVisibilityLabel}:</strong> {communityVisibilityHelpText}
            </span>
          </span>
        </div>
        <select id="topic-visibility" name="visibility" defaultValue={topic?.visibility ?? "public"} className={input}>
          <option value="public">Öffentlich</option><option value="community">{communityVisibilityLabel}</option>
        </select>
      </div>
    </div>

    <label className="block text-sm font-semibold">Titel
      <input name="title" required maxLength={180} defaultValue={topic?.title ?? ""} className={input} />
    </label>
    <input type="hidden" name="slug" value={topic?.slug ?? ""} />
    <div title="In dieser Version wird der Slug automatisch erstellt und kann nicht bearbeitet werden.">
      <label className="block text-sm font-semibold">Slug
        <input disabled defaultValue={topic?.slug ?? ""} placeholder="wird aus dem Titel erzeugt" aria-describedby="slug-version-hint" className={`${input} cursor-not-allowed bg-stone-100 text-[var(--muted)]`} />
      </label>
      <span id="slug-version-hint" className="sr-only">In dieser Version wird der Slug automatisch erstellt und kann nicht bearbeitet werden.</span>
    </div>
    {hasGuidingQuestion && <label className="block text-sm font-semibold">Leitfrage
      <input name="guidingQuestion" required defaultValue={topic?.guiding_question ?? ""} className={input} />
    </label>}
    <label className="block text-sm font-semibold">Inhalt/Kontext
      <textarea name="content" required rows={8} defaultValue={topic?.content ?? ""} className={`${input} py-3`} />
    </label>
    {type === "collaboration" && <label className="block text-sm font-semibold">Konkrete Aufgabe
      <textarea name="task" required rows={3} defaultValue={topic?.task ?? ""} className={`${input} py-3`} />
    </label>}

    <label className="block text-sm font-semibold">Ort
      <select name="placeId" defaultValue={topic?.place_id ?? ""} className={input}>
        <option value="">Kein Ort</option>{places.map((place) => <option key={place.id} value={place.id}>{place.name}</option>)}
      </select>
    </label>

    {type === "vote" && <label className="block text-sm font-semibold">Auswahlmodus
      <select name="selectionMode" defaultValue={topic?.selection_mode ?? "single"} className={input}>
        <option value="single">Einfachauswahl</option><option value="multiple">Mehrfachauswahl</option>
      </select>
    </label>}
    {!topic?.id && type === "vote" && <OptionEditor inputClass={input} />}
    {fixedOptions && <fieldset>
      <legend className="text-sm font-semibold">Reaktionen</legend>
      <div className="mt-2 grid gap-2 sm:grid-cols-3">
        {fixedOptions.map((label) => <div key={label} className="border border-[var(--line)] bg-stone-50 px-3 py-2 text-sm font-medium">{label}</div>)}
      </div>
    </fieldset>}

    <div className="grid gap-5 sm:grid-cols-3">
      <label className="text-sm font-semibold">Veröffentlichung
        <select name="publicationStatus" defaultValue={topic?.publication_status ?? "draft"} className={input}>
          <option value="draft">Entwurf</option><option value="published">Veröffentlicht</option><option value="archived">Archiviert</option>
        </select>
      </label>
      {type !== "information" && <label className="text-sm font-semibold">Beteiligung
        <select name="participationStatus" defaultValue={topic?.participation_status ?? "open"} className={input}>
          <option value="open">Offen</option><option value="closed">Geschlossen</option>
        </select>
      </label>}
      <label className="text-sm font-semibold">Umsetzung
        <select name="implementationStatus" defaultValue={topic?.implementation_status ?? ""} className={input}>
          <option value="">Kein Status</option><option value="planned">Geplant</option><option value="in_progress">In Umsetzung</option><option value="implemented">Umgesetzt</option>
        </select>
      </label>
    </div>

    {hasParticipationEnd && <label className="block text-sm font-semibold">Beteiligung endet
      <input type="datetime-local" name="participationEndsAt" defaultValue={topic?.participation_ends_at?.slice(0, 16) ?? ""} className={input} />
    </label>}
    {hasEventPeriod && <div className="grid gap-5 sm:grid-cols-2">
      <label className="text-sm font-semibold">Termin beginnt
        <input type="datetime-local" name="eventStartsAt" defaultValue={topic?.event_starts_at?.slice(0, 16) ?? ""} className={input} />
      </label>
      <label className="text-sm font-semibold">Termin endet
        <input type="datetime-local" name="eventEndsAt" defaultValue={topic?.event_ends_at?.slice(0, 16) ?? ""} className={input} />
      </label>
    </div>}

    <Button type="submit">{topic?.id ? "Änderungen speichern" : "Topic erstellen"}</Button>
  </form>;
}
