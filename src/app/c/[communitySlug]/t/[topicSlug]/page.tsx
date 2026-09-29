import { CalendarDays, FileText, MapPin, Users } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { CommentThread } from "@/components/topic/CommentThread";
import { ParticipationPanel } from "@/components/topic/ParticipationPanel";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getTopicPageData } from "@/features/topics/data";
import { formatDate } from "@/lib/format";
import { getImplementationStatusLabel, getTopicStatusLabel, type TopicType } from "@/lib/domain/topics";

const typeLabels: Record<TopicType, string> = {
  information: "Information",
  opinion: "Meinung gefragt",
  vote: "Abstimmung",
  collaboration: "Mitarbeit gesucht",
};

type Props = {
  params: Promise<{ communitySlug: string; topicSlug: string }>;
  searchParams: Promise<{ select?: string | string[]; saved?: string; error?: string }>;
};

export default async function TopicPage({ params, searchParams }: Props) {
  const { communitySlug, topicSlug } = await params;
  const query = await searchParams;
  const topic = await getTopicPageData(communitySlug, topicSlug);
  if (!topic) notFound();

  const status = getTopicStatusLabel({
    type: topic.type,
    publicationStatus: topic.publication_status,
    participationStatus: topic.participation_status,
    resultPublishedAt: topic.result_published_at,
  });
  const implementation = getImplementationStatusLabel(topic.implementation_status);
  const resumedSelections = Array.isArray(query.select) ? query.select : query.select ? [query.select] : [];
  const next = `/c/${communitySlug}/t/${topicSlug}`;
  const primaryImage = topic.attachments.find((item) => item.is_primary_image && item.mime_type.startsWith("image/"));
  const period = topic.participation_ends_at ? `bis ${formatDate(topic.participation_ends_at)}` : null;

  return (
    <>
      <AppHeader communitySlug={communitySlug} />
      <main>
        <section className="border-b border-[var(--line)] bg-white">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:py-12">
            <div>
              <Link href={`/c/${communitySlug}`} className="text-sm font-semibold text-[var(--brand)] no-underline">{topic.communityName}</Link>
              <div className="mt-5 flex flex-wrap gap-2">
                <StatusBadge tone="gray">{typeLabels[topic.type]}</StatusBadge>
                <StatusBadge>{status}</StatusBadge>
                {implementation && <StatusBadge tone="gold">{implementation}</StatusBadge>}
              </div>
              <h1 className="mt-5 max-w-3xl text-3xl font-bold leading-tight sm:text-4xl">{topic.title}</h1>
              {topic.guiding_question && <p className="mt-5 max-w-3xl text-xl font-medium leading-8 text-[var(--brand-strong)]">{topic.guiding_question}</p>}
              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[var(--muted)]">
                {topic.placeName && <span className="flex items-center gap-2"><MapPin className="h-4 w-4" />{topic.placeName}</span>}
                {period && <span className="flex items-center gap-2"><CalendarDays className="h-4 w-4" />{period}</span>}
                <span className="flex items-center gap-2"><Users className="h-4 w-4" />{topic.visibility === "public" ? "Öffentlich" : topic.communityVisibilityLabel}</span>
              </div>
            </div>
            {primaryImage?.signedUrl && <div role="img" aria-label={primaryImage.file_name} className="min-h-56 bg-cover bg-center" style={{ backgroundImage: `url(${primaryImage.signedUrl})` }} />}
          </div>
        </section>

        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          {query.saved && <p role="status" className="mt-6 border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">Gespeichert.</p>}
          {query.error && <p role="alert" className="mt-6 border border-red-200 bg-red-50 p-3 text-sm text-red-900">{query.error}</p>}
          <section className="py-8">
            <div className="whitespace-pre-wrap text-base leading-7">{topic.content}</div>
            {topic.task && <div className="mt-6 border-l-4 border-[var(--accent)] bg-amber-50 p-4"><strong>Konkrete Aufgabe</strong><p className="mt-1">{topic.task}</p></div>}
            {topic.attachments.filter((item) => item.id !== primaryImage?.id).length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {topic.attachments.filter((item) => item.id !== primaryImage?.id).map((attachment) => (
                  <a key={attachment.id} href={attachment.signedUrl} className="inline-flex items-center gap-2 border border-[var(--line)] bg-white px-3 py-2 text-sm font-medium"><FileText className="h-4 w-4" />{attachment.file_name}</a>
                ))}
              </div>
            )}
          </section>

          <ParticipationPanel topic={topic} resumedSelections={resumedSelections} />

          {topic.updates.length > 0 && <section className="border-b border-[var(--line)] py-8"><h2 className="text-xl font-bold">Offizielle Updates</h2><div className="mt-5 space-y-5">{topic.updates.map((update) => <article key={update.id} className="border-l-4 border-[var(--brand)] pl-4"><div className="text-xs font-semibold uppercase text-[var(--muted)]">{update.kind === "result" ? "Ergebnis" : "Umsetzung"} · {formatDate(update.published_at)}</div><h3 className="mt-1 font-bold">{update.title}</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-6">{update.body}</p></article>)}</div></section>}

          <CommentThread comments={topic.comments} topicId={topic.id} currentUserId={topic.currentUserId} next={next} />
        </div>
      </main>
    </>
  );
}
