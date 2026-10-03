import { describe, expect, it } from "vitest";
import { formatDateTimeLong, formatParticipationRemaining, isParticipationEnded } from "./format";

const now = new Date("2026-09-30T12:00:00Z");

describe("participation date formatting", () => {
  it("shows exact date and time in the community timezone", () => {
    expect(formatDateTimeLong("2026-10-02T16:30:00Z")).toBe("2. Oktober 2026 um 18:30 Uhr");
  });

  it("uses natural remaining-time levels", () => {
    expect(formatParticipationRemaining("2026-09-30T12:12:00Z", now)).toBe("noch 12 Minuten");
    expect(formatParticipationRemaining("2026-09-30T15:00:00Z", now)).toBe("noch 3 Stunden");
    expect(formatParticipationRemaining("2026-10-02T12:00:00Z", now)).toBe("noch 2 Tage");
    expect(formatParticipationRemaining("2026-10-20T12:00:00Z", now)).toBe("noch 3 Wochen");
    expect(formatParticipationRemaining("2026-11-09T12:00:00Z", now)).toBe("noch über einen Monat");
  });

  it("recognizes an elapsed deadline", () => {
    expect(isParticipationEnded("2026-09-30T11:59:59Z", now)).toBe(true);
    expect(formatParticipationRemaining("2026-09-30T11:59:59Z", now)).toBe("Beteiligung beendet");
  });
});
