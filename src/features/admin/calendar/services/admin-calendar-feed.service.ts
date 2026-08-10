import "server-only";

import { randomBytes } from "node:crypto";

import { AppointmentStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

/* -------------------------------------------------------------------------- */
/*                                  JETON                                     */
/* -------------------------------------------------------------------------- */

function generateToken(): string {
  return randomBytes(24).toString("hex");
}

/*
 * Renvoie le jeton d'abonnement au calendrier de l'admin, en le
 * générant s'il n'existe pas encore.
 */
export async function getOrCreateCalendarFeedToken(
  userId: string,
): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { calendarFeedToken: true },
  });

  if (user?.calendarFeedToken) {
    return user.calendarFeedToken;
  }

  // Très faible probabilité de collision (192 bits) : une seule
  // tentative suffit, mais on retente une fois par prudence si la
  // contrainte unique venait à être violée.
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const token = generateToken();

    try {
      await prisma.user.update({
        where: { id: userId },
        data: { calendarFeedToken: token },
      });

      return token;
    } catch {
      // Collision improbable : on retente avec un nouveau jeton.
    }
  }

  throw new Error("Impossible de générer le jeton de synchronisation.");
}

/*
 * Invalide l'ancien lien et en génère un nouveau (ex. si le lien a
 * été partagé par erreur).
 */
export async function regenerateCalendarFeedToken(
  userId: string,
): Promise<string> {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const token = generateToken();

    try {
      await prisma.user.update({
        where: { id: userId },
        data: { calendarFeedToken: token },
      });

      return token;
    } catch {
      // Collision improbable : on retente avec un nouveau jeton.
    }
  }

  throw new Error("Impossible de régénérer le jeton de synchronisation.");
}

/* -------------------------------------------------------------------------- */
/*                                FLUX ICS                                    */
/* -------------------------------------------------------------------------- */

const ACTIVE_STATUSES: AppointmentStatus[] = [
  AppointmentStatus.PENDING,
  AppointmentStatus.CONFIRMED,
  AppointmentStatus.IN_PROGRESS,
];

const FEED_PAST_DAYS = 7;
const FEED_FUTURE_DAYS = 180;

const SALON_NAME = "Le Palais des Ongles";
const SALON_ADDRESS = "31 route d'Autun, 71140 Maltat, France";

function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function formatIcsDate(value: Date): string {
  return value
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
}

function foldIcsLine(line: string): string {
  const maximumLength = 73;

  if (line.length <= maximumLength) {
    return line;
  }

  const parts: string[] = [];
  let remaining = line;

  while (remaining.length > maximumLength) {
    parts.push(remaining.slice(0, maximumLength));
    remaining = remaining.slice(maximumLength);
  }

  parts.push(remaining);

  return parts.join("\r\n ");
}

/*
 * Trouve la personne (admin/staff) propriétaire d'un jeton de flux
 * ICS. Renvoie null si le jeton est invalide ou si le compte n'est
 * plus actif — le flux doit alors répondre 404, jamais divulguer
 * pourquoi.
 */
async function resolveFeedOwner(
  token: string,
): Promise<{ id: string } | null> {
  const cleanToken = token.trim();

  if (!cleanToken) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { calendarFeedToken: cleanToken },

    select: {
      id: true,
      status: true,
      role: true,
    },
  });

  if (
    !user ||
    user.status !== "ACTIVE" ||
    !["SUPER_ADMIN", "ADMIN", "STAFF"].includes(user.role)
  ) {
    return null;
  }

  return { id: user.id };
}

/*
 * Génère le flux ICS abonnable de l'agenda du salon (tous les
 * rendez-vous actifs, toutes professionnelles confondues) pour un
 * jeton donné. Renvoie null si le jeton est invalide.
 */
export async function getCalendarFeedIcs(
  token: string,
): Promise<string | null> {
  const owner = await resolveFeedOwner(token);

  if (!owner) {
    return null;
  }

  const now = new Date();

  const rangeStart = new Date(
    now.getTime() - FEED_PAST_DAYS * 24 * 60 * 60 * 1000,
  );

  const rangeEnd = new Date(
    now.getTime() + FEED_FUTURE_DAYS * 24 * 60 * 60 * 1000,
  );

  const appointments = await prisma.appointment.findMany({
    where: {
      status: { in: ACTIVE_STATUSES },
      startsAt: { gte: rangeStart, lte: rangeEnd },
    },

    select: {
      id: true,
      reference: true,
      startsAt: true,
      endsAt: true,
      updatedAt: true,

      client: {
        select: { firstName: true, lastName: true },
      },

      staff: {
        select: {
          displayName: true,
          user: { select: { firstName: true, lastName: true } },
        },
      },

      services: {
        orderBy: { sortOrder: "asc" },
        select: { serviceName: true, quantity: true },
      },
    },

    orderBy: { startsAt: "asc" },
  });

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "PRODID:-//Le Palais des Ongles//Agenda Admin//FR",
    `X-WR-CALNAME:${escapeIcsText(`${SALON_NAME} — Agenda`)}`,
    "X-WR-TIMEZONE:Europe/Paris",
    // Indique aux clients compatibles (dont Apple) la fréquence de
    // rafraîchissement souhaitée du flux abonné.
    "REFRESH-INTERVAL;VALUE=DURATION:PT1H",
    "X-PUBLISHED-TTL:PT1H",
  ];

  for (const appointment of appointments) {
    const clientName = [
      appointment.client.firstName,
      appointment.client.lastName,
    ]
      .filter(Boolean)
      .join(" ");

    const staffName =
      appointment.staff?.displayName?.trim() ||
      [
        appointment.staff?.user.firstName,
        appointment.staff?.user.lastName,
      ]
        .filter(Boolean)
        .join(" ") ||
      null;

    const serviceNames = appointment.services.map((service) =>
      service.quantity > 1
        ? `${service.serviceName} × ${service.quantity}`
        : service.serviceName,
    );

    const summary = staffName
      ? `${clientName} — ${staffName}`
      : clientName || "Rendez-vous";

    const descriptionParts = [
      `Référence : ${appointment.reference}`,
      `Cliente : ${clientName}`,
      `Prestations : ${serviceNames.join(", ") || "—"}`,
      `Professionnelle : ${staffName ?? "Non attribuée"}`,
    ];

    lines.push(
      "BEGIN:VEVENT",
      `UID:${escapeIcsText(`${appointment.id}@lepalaisdesongles.fr`)}`,
      `DTSTAMP:${formatIcsDate(now)}`,
      `LAST-MODIFIED:${formatIcsDate(appointment.updatedAt)}`,
      `DTSTART:${formatIcsDate(appointment.startsAt)}`,
      `DTEND:${formatIcsDate(appointment.endsAt)}`,
      `SUMMARY:${escapeIcsText(summary)}`,
      `DESCRIPTION:${escapeIcsText(descriptionParts.join("\n"))}`,
      `LOCATION:${escapeIcsText(SALON_ADDRESS)}`,
      "STATUS:CONFIRMED",
      "TRANSP:OPAQUE",
      "END:VEVENT",
    );
  }

  lines.push("END:VCALENDAR");

  return lines.map(foldIcsLine).join("\r\n").concat("\r\n");
}
