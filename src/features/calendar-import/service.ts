import { prisma } from "@/lib/prisma";

import { parseIcsBusy, type BusyInterval } from "./parse";

/*
 * Import d'agendas externes (iCal) : leurs créneaux occupés bloquent les
 * disponibilités du salon (ex. agenda Klyvo du salon). Mono-salon.
 */

const DAY_MS = 24 * 60 * 60 * 1000;
const FETCH_TIMEOUT_MS = 10_000;
const MAX_FEED_BYTES = 5 * 1024 * 1024;
const TIME_ZONE = "Europe/Paris";

function isSafeUrl(raw: string): boolean {
  try {
    const url = new URL(raw);
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;
    const host = url.hostname.toLowerCase();
    if (host === "localhost" || host.endsWith(".local") || host === "::1") return false;
    if (/^(127\.|10\.|192\.168\.|169\.254\.|0\.)/.test(host)) return false;
    if (/^172\.(1[6-9]|2\d|3[01])\./.test(host)) return false;
    if (host.startsWith("fe80") || host.startsWith("fc") || host.startsWith("fd")) return false;
    return true;
  } catch {
    return false;
  }
}

function toHttpUrl(url: string): string {
  return url.trim().replace(/^webcal:\/\//i, "https://");
}

async function fetchIcs(url: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(toHttpUrl(url), {
      signal: controller.signal,
      redirect: "follow",
      headers: { Accept: "text/calendar, text/plain, */*", "User-Agent": "PalaisDesOngles-Calendar/1.0" },
    });
    if (!response.ok) throw new Error(`Le lien renvoie une erreur (HTTP ${response.status}).`);
    const text = await response.text();
    if (text.length > MAX_FEED_BYTES) throw new Error("Agenda trop volumineux.");
    if (!text.includes("BEGIN:VCALENDAR")) throw new Error("Ce lien n'est pas un agenda iCal (.ics) valide.");
    return text;
  } finally {
    clearTimeout(timeout);
  }
}

function syncWindow(now = new Date()): { windowStart: Date; windowEnd: Date } {
  return { windowStart: new Date(now.getTime() - 7 * DAY_MS), windowEnd: new Date(now.getTime() + 120 * DAY_MS) };
}

export async function validateIcsUrl(url: string): Promise<{ ok: true; events: number } | { ok: false; error: string }> {
  if (!isSafeUrl(toHttpUrl(url))) {
    return { ok: false, error: "Lien invalide : une adresse https publique est attendue." };
  }
  try {
    const text = await fetchIcs(url);
    const busy = parseIcsBusy(text, { defaultTimeZone: TIME_ZONE, ...syncWindow() });
    return { ok: true, events: busy.length };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Lien inaccessible." };
  }
}

export async function syncExternalCalendar(calendarId: string): Promise<void> {
  const calendar = await prisma.externalCalendar.findUnique({ where: { id: calendarId }, select: { id: true, url: true } });
  if (!calendar) return;
  try {
    const text = await fetchIcs(calendar.url);
    const busy = parseIcsBusy(text, { defaultTimeZone: TIME_ZONE, ...syncWindow() });
    await prisma.$transaction([
      prisma.calendarBusyBlock.deleteMany({ where: { externalCalendarId: calendar.id } }),
      prisma.calendarBusyBlock.createMany({
        data: busy.map((block) => ({ externalCalendarId: calendar.id, startsAt: block.start, endsAt: block.end, uid: block.uid ?? null })),
      }),
      prisma.externalCalendar.update({ where: { id: calendar.id }, data: { lastSyncedAt: new Date(), lastError: null } }),
    ]);
  } catch (error) {
    await prisma.externalCalendar.update({
      where: { id: calendar.id },
      data: { lastSyncedAt: new Date(), lastError: (error instanceof Error ? error.message : "Erreur").slice(0, 300) },
    });
  }
}

export async function addExternalCalendar(url: string, name: string | null): Promise<{ ok: true; events: number } | { ok: false; error: string }> {
  const validation = await validateIcsUrl(url);
  if (!validation.ok) return validation;
  if ((await prisma.externalCalendar.count()) >= 10) {
    return { ok: false, error: "Nombre maximal d'agendas atteint (10)." };
  }
  const calendar = await prisma.externalCalendar.create({ data: { url: toHttpUrl(url), name: name?.trim() || null }, select: { id: true } });
  await syncExternalCalendar(calendar.id);
  return { ok: true, events: validation.events };
}

export async function removeExternalCalendar(calendarId: string): Promise<boolean> {
  const removed = await prisma.externalCalendar.deleteMany({ where: { id: calendarId } });
  return removed.count > 0;
}

export function listExternalCalendars() {
  return prisma.externalCalendar.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, url: true, name: true, lastSyncedAt: true, lastError: true, _count: { select: { busyBlocks: true } } },
  });
}

/* Créneaux occupés importés (pour le moteur de disponibilités). */
export async function loadExternalBusy(from: Date, to: Date): Promise<BusyInterval[]> {
  const blocks = await prisma.calendarBusyBlock.findMany({
    where: { endsAt: { gt: from }, startsAt: { lt: to } },
    select: { startsAt: true, endsAt: true },
  });
  return blocks.map((block) => ({ start: block.startsAt, end: block.endsAt }));
}

export async function syncAllExternalCalendars(): Promise<number> {
  const calendars = await prisma.externalCalendar.findMany({ select: { id: true } });
  for (const calendar of calendars) {
    await syncExternalCalendar(calendar.id);
  }
  return calendars.length;
}
