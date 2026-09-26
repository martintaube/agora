import Link from "next/link";

export function AuthFormShell({ title, intro, children }: { title: string; intro: string; children: React.ReactNode }) {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-12">
      <section className="w-full max-w-md border border-[var(--line)] bg-white p-6 sm:p-8">
        <Link href="/" className="text-lg font-bold text-[var(--brand-strong)] no-underline">Agora</Link>
        <h1 className="mt-8 text-2xl font-bold">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{intro}</p>
        <div className="mt-6">{children}</div>
      </section>
    </main>
  );
}
