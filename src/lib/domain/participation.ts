import type { SelectionMode } from "@/types/models";

export function calculateOptionPercentage(input: { mode: SelectionMode; optionSelections: number; participants: number; totalSelections: number }) {
  const denominator = input.mode === "single" ? input.totalSelections : input.participants;
  if (denominator === 0) return 0;
  return Math.round((input.optionSelections * 1000) / denominator) / 10;
}

export function canReadTopic(input: { visibility: "public" | "community"; published: boolean; isMember: boolean; isAdmin: boolean }) {
  if (input.isAdmin) return true;
  if (!input.published) return false;
  return input.visibility === "public" || input.isMember;
}
