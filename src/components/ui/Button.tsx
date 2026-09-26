import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "danger" };

export function Button({ className = "", variant = "primary", ...props }: Props) {
  const variants = {
    primary: "bg-[var(--brand)] text-white hover:bg-[var(--brand-strong)]",
    secondary: "border border-[var(--line)] bg-white hover:bg-stone-50",
    danger: "border border-red-200 bg-white text-[var(--danger)] hover:bg-red-50",
  };
  return <button className={`min-h-11 px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`} {...props} />;
}
