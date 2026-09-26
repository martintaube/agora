import { redirect } from "next/navigation";
import { AuthFormShell } from "@/components/auth/AuthFormShell";
import { ProfileForm } from "@/components/auth/ProfileForm";
import { safeNextPath } from "@/lib/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function CompleteProfilePage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const query = await searchParams;
  const next = safeNextPath(query.next);
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect(`/auth/sign-in?next=${encodeURIComponent(next)}`);
  return <AuthFormShell title="Profil vervollständigen" intro="Diese Angaben brauchst du einmalig für eine nachvollziehbare Beteiligung.">{query.error && <p role="alert" className="mb-4 border border-red-200 bg-red-50 p-3 text-sm text-red-900">{query.error}</p>}<ProfileForm next={next} /></AuthFormShell>;
}
