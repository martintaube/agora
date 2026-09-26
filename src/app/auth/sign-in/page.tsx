import { AuthFormShell } from "@/components/auth/AuthFormShell";
import { Button } from "@/components/ui/Button";
import { requestOtp } from "@/features/auth/actions";
import { safeNextPath } from "@/lib/navigation";

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const query = await searchParams;
  const next = safeNextPath(query.next);
  return (
    <AuthFormShell title="Mit E-Mail anmelden" intro="Wir senden dir einen sechsstelligen Einmalcode. Du brauchst kein Passwort.">
      {query.error && <p role="alert" className="mb-4 border border-red-200 bg-red-50 p-3 text-sm text-red-900">{query.error}</p>}
      <form action={requestOtp} className="space-y-4">
        <input type="hidden" name="next" value={next} />
        <label className="block text-sm font-semibold">E-Mail-Adresse<input name="email" type="email" autoComplete="email" required autoFocus className="mt-2 min-h-11 w-full border border-[var(--line)] px-3" /></label>
        <Button type="submit" className="w-full">Code senden</Button>
      </form>
    </AuthFormShell>
  );
}
