/*
 * Analyse d'un flux iCalendar externe → créneaux occupés (busy). Autonome
 * (conversion de fuseau via Intl, aucune dépendance). CONSERVATEUR : en cas de
 * doute, on bloque plutôt que de risquer une double-réservation.
 */

export type BusyInterval = { start: Date; end: Date; uid?: string };

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_OCCURRENCES = 500;

function timeZoneOffsetMs(instant: Date, timeZone: string): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const map: Record<string, number> = {};
  for (const part of dtf.formatToParts(instant)) {
    if (part.type !== "literal") map[part.type] = Number(part.value);
  }
  const asUtc = Date.UTC(map.year, map.month - 1, map.day, map.hour === 24 ? 0 : map.hour, map.minute, map.second);
  return asUtc - instant.getTime();
}

/* Instant UTC pour une date (AAAA-MM-JJ) + minute locale d'un fuseau. */
function zonedTimeToUtc(date: string, minuteOfDay: number, timeZone: string): Date {
  const [year, month, day] = date.split("-").map(Number);
  const guess = Date.UTC(year, month - 1, day, 0, minuteOfDay);
  const offset = timeZoneOffsetMs(new Date(guess), timeZone);
  let result = guess - offset;
  const corrected = timeZoneOffsetMs(new Date(result), timeZone);
  if (corrected !== offset) result = guess - corrected;
  return new Date(result);
}

function unfold(text: string): string[] {
  const rawLines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  const lines: string[] = [];
  for (const line of rawLines) {
    if ((line.startsWith(" ") || line.startsWith("\t")) && lines.length > 0) {
      lines[lines.length - 1] += line.slice(1);
    } else {
      lines.push(line);
    }
  }
  return lines;
}

function parseProp(line: string): { name: string; params: Record<string, string>; value: string } | null {
  const colon = line.indexOf(":");
  if (colon === -1) return null;
  const left = line.slice(0, colon);
  const value = line.slice(colon + 1);
  const [name, ...paramParts] = left.split(";");
  const params: Record<string, string> = {};
  for (const part of paramParts) {
    const eq = part.indexOf("=");
    if (eq > 0) params[part.slice(0, eq).toUpperCase()] = part.slice(eq + 1);
  }
  return { name: name.toUpperCase(), params, value };
}

function toDate(
  value: string,
  params: Record<string, string>,
  defaultTimeZone: string,
): { date: Date; allDay: boolean } | null {
  const v = value.trim();
  if (params.VALUE === "DATE" || /^\d{8}$/.test(v)) {
    const m = /^(\d{4})(\d{2})(\d{2})$/.exec(v);
    if (!m) return null;
    return { date: zonedTimeToUtc(`${m[1]}-${m[2]}-${m[3]}`, 0, defaultTimeZone), allDay: true };
  }
  const m = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})?(Z)?$/.exec(v);
  if (!m) return null;
  const [, y, mo, d, h, mi, , z] = m;
  if (z === "Z") {
    return { date: new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi))), allDay: false };
  }
  const tz = params.TZID || defaultTimeZone;
  return { date: zonedTimeToUtc(`${y}-${mo}-${d}`, Number(h) * 60 + Number(mi), tz), allDay: false };
}

function parseDuration(value: string): number | null {
  const m = /^(-)?P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/.exec(value.trim());
  if (!m) return null;
  const [, sign, days, hours, mins, secs] = m;
  const ms = (Number(days || 0) * 86400 + Number(hours || 0) * 3600 + Number(mins || 0) * 60 + Number(secs || 0)) * 1000;
  return sign === "-" ? -ms : ms;
}

const WEEKDAYS = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

function expandRecurrence(rrule: string, start: Date, durationMs: number, windowStart: Date, windowEnd: Date): BusyInterval[] {
  const parts: Record<string, string> = {};
  for (const token of rrule.split(";")) {
    const eq = token.indexOf("=");
    if (eq > 0) parts[token.slice(0, eq).toUpperCase()] = token.slice(eq + 1);
  }
  const freq = parts.FREQ;
  if (freq !== "DAILY" && freq !== "WEEKLY") {
    return [{ start, end: new Date(start.getTime() + durationMs) }];
  }
  const interval = Math.max(1, Number(parts.INTERVAL || 1));
  const count = parts.COUNT ? Number(parts.COUNT) : Infinity;
  const until = parts.UNTIL ? (toDate(parts.UNTIL, {}, "UTC")?.date ?? windowEnd) : windowEnd;
  const limit = until < windowEnd ? until : windowEnd;
  const byDays = (parts.BYDAY || "").split(",").map((d) => d.trim().slice(-2)).filter(Boolean);
  const intervals: BusyInterval[] = [];
  let emitted = 0;
  const stepMs = (freq === "DAILY" ? interval : interval * 7) * DAY_MS;
  let cursor = new Date(start.getTime());
  while (cursor.getTime() + durationMs < windowStart.getTime() && cursor.getTime() < limit.getTime()) {
    cursor = new Date(cursor.getTime() + stepMs);
  }
  for (let guard = 0; guard < MAX_OCCURRENCES && cursor.getTime() <= limit.getTime() && emitted < count; guard += 1) {
    if (freq === "WEEKLY" && byDays.length > 0) {
      const base = cursor.getTime();
      for (let offset = 0; offset < 7; offset += 1) {
        const day = new Date(base + offset * DAY_MS);
        if (byDays.includes(WEEKDAYS[day.getUTCDay()]) && day.getTime() <= limit.getTime()) {
          intervals.push({ start: day, end: new Date(day.getTime() + durationMs) });
          emitted += 1;
        }
      }
    } else {
      intervals.push({ start: new Date(cursor), end: new Date(cursor.getTime() + durationMs) });
      emitted += 1;
    }
    cursor = new Date(cursor.getTime() + stepMs);
  }
  return intervals.filter((i) => i.end > windowStart && i.start < windowEnd);
}

export function parseIcsBusy(
  text: string,
  options: { defaultTimeZone?: string; windowStart?: Date; windowEnd?: Date } = {},
): BusyInterval[] {
  const tz = options.defaultTimeZone ?? "Europe/Paris";
  const windowStart = options.windowStart ?? new Date(Date.now() - 7 * DAY_MS);
  const windowEnd = options.windowEnd ?? new Date(Date.now() + 120 * DAY_MS);
  const lines = unfold(text);
  const busy: BusyInterval[] = [];
  let inEvent = false;
  let event: {
    start?: ReturnType<typeof toDate>;
    end?: ReturnType<typeof toDate>;
    duration?: number;
    rrule?: string;
    uid?: string;
    transparent?: boolean;
    cancelled?: boolean;
  } = {};

  for (const line of lines) {
    if (line === "BEGIN:VEVENT") {
      inEvent = true;
      event = {};
      continue;
    }
    if (line === "END:VEVENT") {
      inEvent = false;
      if (event.start && !event.transparent && !event.cancelled) {
        const start = event.start.date;
        const durationMs = event.end
          ? Math.max(0, event.end.date.getTime() - start.getTime())
          : (event.duration ?? (event.start.allDay ? DAY_MS : 60 * 60 * 1000));
        if (durationMs > 0) {
          if (event.rrule) {
            busy.push(...expandRecurrence(event.rrule, start, durationMs, windowStart, windowEnd).map((i) => ({ ...i, uid: event.uid })));
          } else if (start.getTime() + durationMs > windowStart.getTime() && start.getTime() < windowEnd.getTime()) {
            busy.push({ start, end: new Date(start.getTime() + durationMs), uid: event.uid });
          }
        }
      }
      continue;
    }
    if (!inEvent) continue;
    const prop = parseProp(line);
    if (!prop) continue;
    switch (prop.name) {
      case "DTSTART":
        event.start = toDate(prop.value, prop.params, tz);
        break;
      case "DTEND":
        event.end = toDate(prop.value, prop.params, tz);
        break;
      case "DURATION":
        event.duration = parseDuration(prop.value) ?? undefined;
        break;
      case "RRULE":
        event.rrule = prop.value;
        break;
      case "UID":
        event.uid = prop.value.trim().slice(0, 300);
        break;
      case "TRANSP":
        if (prop.value.trim().toUpperCase() === "TRANSPARENT") event.transparent = true;
        break;
      case "STATUS":
        if (prop.value.trim().toUpperCase() === "CANCELLED") event.cancelled = true;
        break;
    }
  }
  return busy;
}
