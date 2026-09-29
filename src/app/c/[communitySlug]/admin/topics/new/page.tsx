import { AdminHeader } from "@/components/admin/AdminHeader";
import { TopicForm } from "@/components/admin/TopicForm";
import { requireCommunityAdmin } from "@/features/admin/auth";

export default async function NewTopicPage({ params, searchParams }: { params: Promise<{ communitySlug: string }>; searchParams: Promise<{ error?: string }> }) {
  const { communitySlug } = await params; const query = await searchParams;
  const { supabase, community } = await requireCommunityAdmin(communitySlug);
  const { data: places } = await supabase.from("places").select("id,name").eq("community_id", community.id).order("name");
  return <><AdminHeader communityName={community.name} communitySlug={communitySlug} /><main className="mx-auto max-w-3xl px-4 py-8 sm:px-6"><h1 className="text-2xl font-bold">Topic erstellen</h1><p className="mt-2 text-sm text-[var(--muted)]">Beginnt als Entwurf, sofern keine Veröffentlichung gewählt wird.</p>{query.error && <p role="alert" className="mt-5 border border-red-200 bg-red-50 p-3 text-sm text-red-900">{query.error}</p>}<div className="mt-8"><TopicForm communitySlug={communitySlug} communityVisibilityLabel={community.member_visibility_label} communityVisibilityHelpText={community.member_visibility_help_text} places={places ?? []} /></div></main></>;
}
