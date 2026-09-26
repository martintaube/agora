import { Button } from "@/components/ui/Button";
import { saveProfile } from "@/features/auth/actions";

type Profile = { first_name?: string; last_name?: string; username?: string; display_name?: string | null };

export function ProfileForm({ profile = {}, next = "/profile" }: { profile?: Profile; next?: string }) {
  const field = "mt-2 min-h-11 w-full border border-[var(--line)] px-3";
  return (
    <form action={saveProfile} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold">Vorname<input className={field} name="firstName" defaultValue={profile.first_name} required maxLength={80} /></label>
        <label className="text-sm font-semibold">Nachname<input className={field} name="lastName" defaultValue={profile.last_name} required maxLength={80} /></label>
      </div>
      <label className="block text-sm font-semibold">Username<input className={field} name="username" defaultValue={profile.username} required minLength={3} maxLength={30} pattern="[a-zA-Z0-9][a-zA-Z0-9._-]{2,29}" /></label>
      <label className="block text-sm font-semibold">Anzeigename <span className="font-normal text-[var(--muted)]">(optional)</span><input className={field} name="displayName" defaultValue={profile.display_name ?? ""} maxLength={80} /></label>
      <p className="text-xs leading-5 text-[var(--muted)]">Ohne Anzeigenamen erscheint öffentlich dein Vorname und der erste Buchstabe deines Nachnamens, zum Beispiel Martin T.</p>
      <Button type="submit">Profil speichern</Button>
    </form>
  );
}
