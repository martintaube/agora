export function formatDate(value: string | null): string | null {
  if (!value) return null;
  return new Intl.DateTimeFormat("de-DE", { dateStyle: "medium" }).format(new Date(value));
}

export function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("de-DE", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function formatDateTimeLong(value: string): string {
  const date = new Date(value);
  const day = new Intl.DateTimeFormat("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Berlin",
  }).format(date);
  const time = new Intl.DateTimeFormat("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Berlin",
  }).format(date);
  return `${day} um ${time} Uhr`;
}

export function isParticipationEnded(value: string | null, now = new Date()): boolean {
  return value !== null && new Date(value).getTime() <= now.getTime();
}

export function formatParticipationRemaining(value: string | null, now = new Date()): string | null {
  if (!value) return null;
  const milliseconds = new Date(value).getTime() - now.getTime();
  if (milliseconds <= 0) return "Beteiligung beendet";

  const minutes = Math.ceil(milliseconds / 60_000);
  if (minutes < 60) return `noch ${minutes} ${minutes === 1 ? "Minute" : "Minuten"}`;

  const hours = Math.ceil(milliseconds / 3_600_000);
  if (hours < 24) return `noch ${hours} ${hours === 1 ? "Stunde" : "Stunden"}`;

  const days = Math.ceil(milliseconds / 86_400_000);
  if (days < 14) return `noch ${days} ${days === 1 ? "Tag" : "Tage"}`;

  if (days < 30) {
    const weeks = Math.ceil(days / 7);
    return `noch ${weeks} Wochen`;
  }

  const months = Math.max(1, Math.floor(days / 30));
  return months === 1 ? "noch über einen Monat" : `noch über ${months} Monate`;
}
