export function StatusBadge({ children, tone = "green" }: { children: React.ReactNode; tone?: "green" | "gold" | "gray" }) {
  const tones = {
    green: "border-emerald-200 bg-emerald-50 text-emerald-800",
    gold: "border-amber-200 bg-amber-50 text-amber-900",
    gray: "border-stone-200 bg-stone-100 text-stone-700",
  };
  return <span className={`inline-flex items-center border px-2 py-1 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}
