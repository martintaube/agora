import { redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { ProfileForm } from "@/components/auth/ProfileForm";
import { Button } from "@/components/ui/Button";
import { signOut } from "@/features/auth/actions";
import { createClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect("/auth/sign-in?next=/profile");
  const { data: profile } = await supabase.from("profiles").select("first_name,last_name,username,display_name").eq("id", authData.user.id).maybeSingle();
  if (!profile) redirect("/profile/complete?next=/profile");
  return <><AppHeader /><main className="mx-auto max-w-2xl px-4 py-10 sm:px-6"><div className="flex items-start justify-between gap-4"><div><h1 className="text-3xl font-bold">Profil</h1><p className="mt-2 text-sm text-[var(--muted)]">{authData.user.email}</p></div><form action={signOut}><Button variant="secondary">Abmelden</Button></form></div><div className="mt-8 border-t border-[var(--line)] pt-8"><ProfileForm profile={profile} /></div></main></>;
}
