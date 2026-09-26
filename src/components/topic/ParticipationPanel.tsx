import { Check, MessageSquareText } from "lucide-react";
import { saveSelection } from "@/features/participation/actions";
import type { TopicPageData } from "@/types/models";
import { Button } from "@/components/ui/Button";

export function ParticipationPanel({ topic, resumedSelections = [] }: { topic: TopicPageData; resumedSelections?: string[] }) {
  const selected = new Set(resumedSelections.length ? resumedSelections : topic.selectedOptionIds);
  const canParticipate = topic.type === "information" || topic.participation_status === "open";
  const showResults = topic.type === "opinion" || topic.type === "vote";
  const next = `/c/${topic.communitySlug}/t/${topic.slug}`;

  return (
    <section className="border-y border-[var(--line)] py-8" id="beteiligung">
      <div className="mb-5 flex items-center gap-3">
        <Check className="h-5 w-5 text-[var(--brand)]" aria-hidden="true" />
        <h2 className="text-xl font-bold">Beteiligung</h2>
      </div>
      {canParticipate ? (
        <form action={saveSelection} className="space-y-4">
          <input type="hidden" name="topicId" value={topic.id} />
          <input type="hidden" name="next" value={next} />
          <fieldset className="grid gap-2">
            <legend className="sr-only">Option auswählen</legend>
            {topic.options.map((option) => (
              <label key={option.id} className="flex min-h-12 cursor-pointer items-center gap-3 border border-[var(--line)] bg-white px-4 py-3 hover:border-emerald-400">
                <input
                  type={topic.selection_mode === "single" ? "radio" : "checkbox"}
                  name="optionIds"
                  value={option.id}
                  defaultChecked={selected.has(option.id)}
                  className="h-4 w-4 accent-[var(--brand)]"
                />
                <span className="font-medium">{option.label}</span>
              </label>
            ))}
          </fieldset>
          <div className="flex items-center gap-3">
            <Button type="submit">Auswahl speichern</Button>
            {!topic.currentUserId && <span className="text-sm text-[var(--muted)]">Anmeldung erst beim Speichern</span>}
          </div>
        </form>
      ) : (
        <p className="text-[var(--muted)]">Die Beteiligung ist geschlossen. Die Ergebnisse bleiben sichtbar.</p>
      )}

      {showResults && topic.results.length > 0 && (
        <div className="mt-8" aria-label="Live-Ergebnis">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h3 className="font-bold">Aktueller Stand</h3>
            <span className="text-sm text-[var(--muted)]">{topic.results[0]?.participant_count ?? 0} Teilnehmende</span>
          </div>
          <div className="space-y-4">
            {topic.results.map((result) => (
              <div key={result.id}>
                <div className="mb-1 flex justify-between gap-3 text-sm">
                  <span className="font-medium">{result.label}</span>
                  <span>{result.selection_count} · {result.percentage}%</span>
                </div>
                <div className="h-2 overflow-hidden bg-stone-200">
                  <div className="h-full bg-[var(--brand)]" style={{ width: `${Math.min(result.percentage, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
          {topic.selection_mode === "multiple" && <p className="mt-3 text-xs text-[var(--muted)]">Mehrfachauswahl: Prozentwerte können zusammen mehr als 100 % ergeben.</p>}
        </div>
      )}
      {!showResults && topic.results.some((result) => result.selection_count > 0) && (
        <div className="mt-6 flex flex-wrap gap-2" aria-label="Reaktionen">
          {topic.results.map((result) => <span key={result.id} className="border border-[var(--line)] bg-white px-3 py-2 text-sm"><strong>{result.selection_count}</strong> {result.label}</span>)}
        </div>
      )}
      <a href="#kommentare" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand-strong)]"><MessageSquareText className="h-4 w-4" />Zur Diskussion</a>
    </section>
  );
}
