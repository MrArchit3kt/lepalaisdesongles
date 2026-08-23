import "server-only";

import { randomBytes, randomInt } from "node:crypto";

import type { WheelSegment } from "@/generated/prisma/client";

const WHEEL_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function createRandomCharacters(length: number, alphabet: string): string {
  const random = randomBytes(length);
  let result = "";

  for (let index = 0; index < length; index += 1) {
    const value = random[index];

    if (value === undefined) {
      throw new Error("Impossible de générer une valeur aléatoire.");
    }

    result += alphabet[value % alphabet.length];
  }

  return result;
}

/**
 * Code de la promotion générée pour un gain de roue, au même format
 * que les autres codes du site (voir generateGiftCardCode).
 */
export function generateWheelPromotionCode(): string {
  return `ROUE-${createRandomCharacters(8, WHEEL_CODE_ALPHABET)}`;
}

/**
 * Promotion.slug est unique et requis : dérivé du code généré, il
 * n'a pas besoin d'être lisible (jamais affiché publiquement).
 */
export function generateWheelPromotionSlug(code: string): string {
  return `roue-${code.toLowerCase()}`;
}

/**
 * Tire un segment au hasard, pondéré par `segment.weight`. Toujours
 * exécuté côté serveur : ne jamais faire confiance à un tirage
 * calculé côté client pour un lot à valeur réelle.
 */
export function drawWeightedSegment(
  segments: WheelSegment[],
): WheelSegment {
  if (segments.length === 0) {
    throw new Error("Aucune case de roue active.");
  }

  const totalWeight = segments.reduce(
    (sum, segment) => sum + Math.max(0, segment.weight),
    0,
  );

  if (totalWeight <= 0) {
    // Repli neutre si mal configuré côté admin (tous les poids à 0) :
    // équiprobable plutôt que de planter le tirage.
    const index = randomInt(0, segments.length);

    return segments[index]!;
  }

  const roll = randomInt(0, totalWeight);

  let cursor = 0;

  for (const segment of segments) {
    cursor += Math.max(0, segment.weight);

    if (roll < cursor) {
      return segment;
    }
  }

  // Filet de sécurité (ne devrait jamais être atteint) : arrondis
  // flottants exclus puisque tout est en entiers.
  return segments[segments.length - 1]!;
}

/* -------------------------------------------------------------------------- */
/*                    FUSEAU HORAIRE — "AUJOURD'HUI" À PARIS                  */
/* -------------------------------------------------------------------------- */

function getTimeZoneOffsetMinutes(date: Date, timeZone: string): number {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const parts = formatter.formatToParts(date).reduce<Record<string, string>>(
    (accumulator, part) => {
      accumulator[part.type] = part.value;

      return accumulator;
    },
    {},
  );

  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );

  return (asUtc - date.getTime()) / 60_000;
}

/**
 * Minuit (heure de Paris, DST géré automatiquement) du jour de
 * `date`, sous forme d'instant UTC — utilisé pour la limite "1 tirage
 * par jour".
 */
export function startOfDayParis(date = new Date()): Date {
  const offsetMinutes = getTimeZoneOffsetMinutes(date, "Europe/Paris");
  const shifted = new Date(date.getTime() + offsetMinutes * 60_000);

  const startOfShiftedDayUtc = Date.UTC(
    shifted.getUTCFullYear(),
    shifted.getUTCMonth(),
    shifted.getUTCDate(),
  );

  return new Date(startOfShiftedDayUtc - offsetMinutes * 60_000);
}
