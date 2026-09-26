import { AuthFormShell } from "@/components/auth/AuthFormShell";
import { Button } from "@/components/ui/Button";
import { verifyOtp } from "@/features/auth/actions";
import { safeNextPath } from "@/lib/navigation";

export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ email?: string; next?: string; error?: string }> }) {
  const query = await searchParams;
  const email = query.email ?? "";
  const next = safeNextPath(query.next);
  return (
    <AuthFormShell title="Einmalcode eingeben" intro={`Der Code wurde an ${email || "deine E-Mail-Adresse"} gesendet.`}>
      {query.error && <p role="alert" className="mb-4 border border-red-200 bg-red-50 p-3 text-sm text-red-900">{query.error}</p>}
      <form action={verifyOtp} className="space-y-4">
        <input type="hidden" name="email" value={email} /><input type="hidden" name="next" value={next} />
        <label className="block text-sm font-semibold">6-stelliger Code<input name="token" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} autoComplete="one-time-code" required autoFocus className="mt-2 min-h-12 w-full border border-[var(--line)] px-3 text-center text-2xl tracking-[0.35em]" /></label>
        <Button type="submit" className="w-full">Anmelden</Button>
      </form>
    </AuthFormShell>
  );
}
