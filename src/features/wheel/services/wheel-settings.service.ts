import "server-only";

import { cache } from "react";

import { prisma } from "@/lib/prisma";
import {
  DEFAULT_WHEEL_SETTINGS,
  wheelSettingsSchema,
} from "@/features/wheel/schemas/wheel-settings.schema";
import type { WheelSettings } from "@/features/wheel/types/wheel.types";

const WHEEL_SETTINGS_KEY = "admin.wheel";

function isJsonObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Réglages de la roue de la chance, dans la même table clé-valeur
 * `Setting` que les autres réglages admin, mais gérés indépendamment
 * du gros système `admin-settings` : la roue a déjà besoin de sa
 * propre page CRUD pour les cases, ces 4 réglages y trouvent
 * naturellement leur place plutôt que d'alourdir davantage
 * `admin-settings-client.tsx`.
 */
export const getWheelSettings = cache(async (): Promise<WheelSettings> => {
  const row = await prisma.setting.findUnique({
    where: { key: WHEEL_SETTINGS_KEY },
    select: { value: true },
  });

  if (!row || !isJsonObject(row.value)) {
    return { ...DEFAULT_WHEEL_SETTINGS };
  }

  const merged = { ...DEFAULT_WHEEL_SETTINGS, ...row.value };
  const parsed = wheelSettingsSchema.safeParse(merged);

  return parsed.success ? parsed.data : { ...DEFAULT_WHEEL_SETTINGS };
});

export async function saveWheelSettings(
  rawValue: unknown,
): Promise<WheelSettings> {
  const parsed = wheelSettingsSchema.parse(rawValue);

  await prisma.setting.upsert({
    where: { key: WHEEL_SETTINGS_KEY },

    create: {
      key: WHEEL_SETTINGS_KEY,
      value: parsed,
      isPublic: false,
      description: "Réglages de la roue de la chance",
    },

    update: { value: parsed },
  });

  return parsed;
}
