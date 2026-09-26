import Link from "next/link";

export function AppHeader({ communitySlug }: { communitySlug?: string }) {
  return (
    <header className="border-b border-[var(--line)] bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href={communitySlug ? `/c/${communitySlug}` : "/"} className="text-lg font-bold text-[var(--brand-strong)] no-underline">Agora</Link>
        <Link href="/profile" className="text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)]">Profil</Link>
      </div>
    </header>
  );
}
