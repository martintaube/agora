import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requireCommunityAdmin(communitySlug: string) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const next = `/c/${communitySlug}/admin`;
  if (!authData.user) redirect(`/auth/sign-in?next=${encodeURIComponent(next)}`);
  const { data: community } = await supabase.from("communities").select("id,name,slug").eq("slug", communitySlug).maybeSingle();
  if (!community) notFound();
  const { data: membership } = await supabase.from("memberships").select("role,verified_at").eq("community_id", community.id).eq("user_id", authData.user.id).maybeSingle();
  if (membership?.role !== "admin" || !membership.verified_at) redirect(`/c/${communitySlug}`);
  return { supabase, user: authData.user, community };
}
