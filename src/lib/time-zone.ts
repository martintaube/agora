export const COMMUNITY_TIME_ZONE = "Europe/Berlin";
export const COMMUNITY_TIME_ZONE_LABEL = "Europe/Berlin (MEZ/MESZ)";

type DateTimeParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

function zonedParts(date: Date): DateTimeParts {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: COMMUNITY_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((item) => item.type === type)?.value);
  return { year: part("year"), month: part("month"), day: part("day"), hour: part("hour"), minute: part("minute"), second: part("second") };
}

function timeZoneOffset(date: Date): number {
  const parts = zonedParts(date);
  return Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second) - date.getTime();
}

export function communityDateTimeToIso(value: string): string | null {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const [, year, month, day, hour, minute] = match.map(Number);
  const localAsUtc = Date.UTC(year, month - 1, day, hour, minute);
  let instant = localAsUtc - timeZoneOffset(new Date(localAsUtc));
  instant = localAsUtc - timeZoneOffset(new Date(instant));
  return new Date(instant).toISOString();
}

export function formatCommunityDateTimeInput(value: string | null): string {
  if (!value) return "";
  const parts = zonedParts(new Date(value));
  const twoDigits = (number: number) => String(number).padStart(2, "0");
  return `${parts.year}-${twoDigits(parts.month)}-${twoDigits(parts.day)}T${twoDigits(parts.hour)}:${twoDigits(parts.minute)}`;
}
