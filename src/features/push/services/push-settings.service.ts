import "server-only";

import { cache } from "react";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const PUSH_SETTINGS_KEY = "admin.push";

const pushSettingsSchema = z.object({
  enabled: z.boolean(),
});

const DEFAULT_PUSH_SETTINGS = { enabled: true };

function isJsonObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/*
 * Interrupteur de secours : permet de couper tous les envois de push
 * sans déploiement en cas de souci, indépendamment des réglages
 * e-mail existants. Par défaut activé.
 */
export const isPushNotificationsEnabled = cache(async (): Promise<boolean> => {
  const row = await prisma.setting.findUnique({
    where: { key: PUSH_SETTINGS_KEY },
    select: { value: true },
  });

  if (!row || !isJsonObject(row.value)) {
    return DEFAULT_PUSH_SETTINGS.enabled;
  }

  const parsed = pushSettingsSchema.safeParse({
    ...DEFAULT_PUSH_SETTINGS,
    ...row.value,
  });

  return parsed.success ? parsed.data.enabled : DEFAULT_PUSH_SETTINGS.enabled;
});

export async function setPushNotificationsEnabled(
  enabled: boolean,
): Promise<void> {
  const parsed = pushSettingsSchema.parse({ enabled });

  await prisma.setting.upsert({
    where: { key: PUSH_SETTINGS_KEY },

    create: {
      key: PUSH_SETTINGS_KEY,
      value: parsed,
      isPublic: false,
      description: "Interrupteur global des notifications push",
    },

    update: { value: parsed },
  });
}
