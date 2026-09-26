import { ArrowRight, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getTopicStatusLabel, type TopicType } from "@/lib/domain/topics";
import { createClient } from "@/lib/supabase/server";

const typeLabels: Record<TopicType, string> = { information: "Information", opinion: "Meinung gefragt", vote: "Abstimmung", collaboration: "Mitarbeit gesucht" };

export default async function CommunityPage({ params }: { params: Promise<{ communitySlug: string }> }) {
  const { communitySlug } = await params;
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect(`/auth/sign-in?next=${encodeURIComponent(`/c/${communitySlug}`)}`);
  const { data: community } = await supabase.from("communities").select("id,name,slug").eq("slug", communitySlug).maybeSingle();
  if (!community) notFound();
  const [{ data: topics }, { data: membership }] = await Promise.all([
    supabase.from("topics").select("id,type,visibility,title,slug,publication_status,participation_status,result_published_at,created_at").eq("community_id", community.id).eq("publication_status", "published").order("created_at", { ascending: false }),
    supabase.from("memberships").select("role,verified_at").eq("community_id", community.id).eq("user_id", authData.user.id).maybeSingle(),
  ]);
  const isAdmin = membership?.role === "admin" && membership.verified_at;

  return (
    <><AppHeader communitySlug={communitySlug} /><main><section className="border-b border-[var(--line)] bg-white"><div className="mx-auto max-w-6xl px-4 py-10 sm:px-6"><div className="flex flex-wrap items-start justify-between gap-5"><div><span className="text-sm font-semibold text-[var(--brand)]">Community</span><h1 className="mt-2 text-3xl font-bold">{community.name}</h1><p className="mt-3 max-w-2xl text-[var(--muted)]">Aktuelle Informationen und Beteiligungsthemen.</p></div>{isAdmin && <Link href={`/c/${communitySlug}/admin`} className="border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold no-underline">Verwalten</Link>}</div></div></section>
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6"><div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-bold">Topics</h2><span className="text-sm text-[var(--muted)]">{topics?.length ?? 0} sichtbar</span></div>
        <div className="grid gap-px overflow-hidden border border-[var(--line)] bg-[var(--line)]">
          {(topics ?? []).map((topic) => { const status = getTopicStatusLabel({ type: topic.type as TopicType, publicationStatus: topic.publication_status, participationStatus: topic.participation_status, resultPublishedAt: topic.result_published_at }); return <Link key={topic.id} href={`/c/${communitySlug}/t/${topic.slug}`} className="group flex items-center justify-between gap-4 bg-white p-5 no-underline hover:bg-stone-50"><div><div className="flex flex-wrap gap-2"><StatusBadge tone="gray">{typeLabels[topic.type as TopicType]}</StatusBadge><StatusBadge>{status}</StatusBadge>{topic.visibility === "community" && <StatusBadge tone="gold"><LockKeyhole className="mr-1 h-3 w-3" />Community</StatusBadge>}</div><h3 className="mt-3 text-lg font-bold">{topic.title}</h3></div><ArrowRight className="h-5 w-5 shrink-0 text-[var(--muted)] transition group-hover:translate-x-1" /></Link>; })}
          {(topics ?? []).length === 0 && <div className="bg-white p-8 text-center text-sm text-[var(--muted)]">Keine sichtbaren Topics.</div>}
        </div>
      </section></main></>
  );
}
