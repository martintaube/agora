import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";

export function AdminHeader({ communityName, communitySlug }: { communityName: string; communitySlug: string }) {
  return <><AppHeader communitySlug={communitySlug} /><div className="border-b border-[var(--line)] bg-white"><div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6"><div><span className="text-xs font-semibold uppercase text-[var(--muted)]">Administration</span><div className="font-bold">{communityName}</div></div><nav className="flex gap-4 text-sm font-semibold"><Link href={`/c/${communitySlug}/admin`}>Topics</Link><Link href={`/c/${communitySlug}`}>Community</Link></nav></div></div></>;
}
