import { ArrowRight, Plus } from "lucide-react";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/Button";
import { upsertMembership } from "@/features/admin/actions";
import { requireCommunityAdmin } from "@/features/admin/auth";
import type { PublicationStatus, TopicType } from "@/lib/domain/topics";

const typeLabels: Record<TopicType, string> = {
  information: "Information",
  opinion: "Meinung gefragt",
  vote: "Abstimmung",
  collaboration: "Mitarbeit gesucht",
};

const publicationLabels: Record<PublicationStatus, string> = {
  draft: "Entwurf",
  published: "Veröffentlicht",
  archived: "Archiviert",
};

export default async function AdminPage({ params, searchParams }: { params: Promise<{ communitySlug: string }>; searchParams: Promise<{ error?: string; saved?: string }> }) {
  const { communitySlug } = await params; const query = await searchParams;
  const { supabase, community } = await requireCommunityAdmin(communitySlug);
  const [{ data: topics }, { data: memberships }] = await Promise.all([
    supabase.from("topics").select("id,title,slug,type,publication_status,updated_at").eq("community_id", community.id).order("updated_at", { ascending: false }),
    supabase.from("memberships").select("id,role,verified_at,user_id").eq("community_id", community.id).order("created_at"),
  ]);
  return <><AdminHeader communityName={community.name} communitySlug={communitySlug} /><main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
    {query.error && <p role="alert" className="mb-5 border border-red-200 bg-red-50 p-3 text-sm text-red-900">{query.error}</p>}{query.saved && <p role="status" className="mb-5 border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">Gespeichert.</p>}
    <div className="flex items-center justify-between gap-4"><div><h1 className="text-2xl font-bold">Topics verwalten</h1><p className="mt-1 text-sm text-[var(--muted)]">{topics?.length ?? 0} Topics</p></div><Link href={`/c/${communitySlug}/admin/topics/new`} className="inline-flex min-h-11 items-center gap-2 bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white no-underline"><Plus className="h-4 w-4" />Topic erstellen</Link></div>
    <div className="mt-6 border border-[var(--line)] bg-white">{(topics ?? []).map((topic) => <Link key={topic.id} href={`/c/${communitySlug}/admin/topics/${topic.slug}`} className="flex items-center justify-between gap-4 border-b border-[var(--line)] p-4 last:border-0 hover:bg-stone-50"><div><div className="text-xs font-semibold uppercase text-[var(--muted)]">{typeLabels[topic.type as TopicType]} · {publicationLabels[topic.publication_status as PublicationStatus]}</div><div className="mt-1 font-bold">{topic.title}</div></div><ArrowRight className="h-4 w-4" /></Link>)}</div>
    <section className="mt-10 border-t border-[var(--line)] pt-8"><h2 className="text-xl font-bold">Membership verwalten</h2><p className="mt-2 text-sm text-[var(--muted)]">Minimaler V0.1-Flow: vorhandenen Account per Username zuordnen oder bestätigen. Aktuell {memberships?.length ?? 0} Memberships.</p><form action={upsertMembership} className="mt-5 grid gap-4 border border-[var(--line)] bg-white p-5 sm:grid-cols-[1fr_180px_auto_auto] sm:items-end"><input type="hidden" name="communitySlug" value={communitySlug} /><label className="text-sm font-semibold">Username<input name="username" required className="mt-2 min-h-11 w-full border border-[var(--line)] px-3" /></label><label className="text-sm font-semibold">Rolle<select name="role" className="mt-2 min-h-11 w-full border border-[var(--line)] px-3"><option value="member">Mitglied</option><option value="admin">Admin</option></select></label><label className="flex min-h-11 items-center gap-2 text-sm font-semibold"><input type="checkbox" name="verified" defaultChecked />Bestätigt</label><Button type="submit">Speichern</Button></form></section>
  </main></>;
}
