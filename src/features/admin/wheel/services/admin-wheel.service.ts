import "server-only";

import { prisma } from "@/lib/prisma";

import {
  wheelSegmentFormSchema,
  wheelSettingsSchema,
} from "@/features/wheel/schemas/wheel-settings.schema";
import {
  getWheelSettings,
  saveWheelSettings,
} from "@/features/wheel/services/wheel-settings.service";
import type { WheelSettings } from "@/features/wheel/types/wheel.types";

import type { AdminWheelSegment } from "@/features/admin/wheel/types/admin-wheel.types";

/* -------------------------------------------------------------------------- */
/*                                   ERREURS                                  */
/* -------------------------------------------------------------------------- */

export class AdminWheelValidationError extends Error {
  public readonly fieldErrors: Record<string, string[]>;

  public constructor(
    message: string,
    fieldErrors: Record<string, string[]>,
  ) {
    super(message);

    this.name = "AdminWheelValidationError";
    this.fieldErrors = fieldErrors;
  }
}

export class AdminWheelNotFoundError extends Error {
  public constructor(message = "Cette case de roue est introuvable.") {
    super(message);

    this.name = "AdminWheelNotFoundError";
  }
}

/* -------------------------------------------------------------------------- */
/*                                  RÉGLAGES                                  */
/* -------------------------------------------------------------------------- */

export async function getAdminWheelSettings(): Promise<WheelSettings> {
  return getWheelSettings();
}

export async function updateAdminWheelSettings(
  rawValue: unknown,
): Promise<WheelSettings> {
  const parsed = wheelSettingsSchema.safeParse(rawValue);

  if (!parsed.success) {
    throw new AdminWheelValidationError(
      "Les réglages de la roue sont invalides.",
      parsed.error.flatten().fieldErrors as Record<string, string[]>,
    );
  }

  return saveWheelSettings(parsed.data);
}

/* -------------------------------------------------------------------------- */
/*                                  SEGMENTS                                  */
/* -------------------------------------------------------------------------- */

export async function getAdminWheelSegments(): Promise<AdminWheelSegment[]> {
  return prisma.wheelSegment.findMany({
    orderBy: { sortOrder: "asc" },

    select: {
      id: true,
      label: true,
      kind: true,
      percentageValue: true,
      amountCents: true,
      weight: true,
      colorHex: true,
      isActive: true,
      sortOrder: true,
    },
  });
}

function normalizeSegmentValues(
  parsed: ReturnType<typeof wheelSegmentFormSchema.parse>,
) {
  return {
    label: parsed.label,
    kind: parsed.kind,
    percentageValue:
      parsed.kind === "PERCENTAGE" ? parsed.percentageValue ?? null : null,
    amountCents:
      parsed.kind === "FIXED_AMOUNT" ? parsed.amountCents ?? null : null,
    weight: parsed.weight,
    colorHex: parsed.colorHex?.trim() || null,
    isActive: parsed.isActive,
  };
}

export async function createWheelSegment(
  rawInput: unknown,
): Promise<AdminWheelSegment> {
  const parsed = wheelSegmentFormSchema.safeParse(rawInput);

  if (!parsed.success) {
    throw new AdminWheelValidationError(
      "Cette case de roue est invalide.",
      parsed.error.flatten().fieldErrors as Record<string, string[]>,
    );
  }

  const lastSegment = await prisma.wheelSegment.findFirst({
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  return prisma.wheelSegment.create({
    data: {
      ...normalizeSegmentValues(parsed.data),
      sortOrder: (lastSegment?.sortOrder ?? -1) + 1,
    },

    select: {
      id: true,
      label: true,
      kind: true,
      percentageValue: true,
      amountCents: true,
      weight: true,
      colorHex: true,
      isActive: true,
      sortOrder: true,
    },
  });
}

export async function updateWheelSegment(
  id: string,
  rawInput: unknown,
): Promise<AdminWheelSegment> {
  const parsed = wheelSegmentFormSchema.safeParse(rawInput);

  if (!parsed.success) {
    throw new AdminWheelValidationError(
      "Cette case de roue est invalide.",
      parsed.error.flatten().fieldErrors as Record<string, string[]>,
    );
  }

  const existing = await prisma.wheelSegment.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existing) {
    throw new AdminWheelNotFoundError();
  }

  return prisma.wheelSegment.update({
    where: { id },
    data: normalizeSegmentValues(parsed.data),

    select: {
      id: true,
      label: true,
      kind: true,
      percentageValue: true,
      amountCents: true,
      weight: true,
      colorHex: true,
      isActive: true,
      sortOrder: true,
    },
  });
}

export async function toggleWheelSegmentActive(
  id: string,
): Promise<AdminWheelSegment> {
  const existing = await prisma.wheelSegment.findUnique({
    where: { id },
    select: { isActive: true },
  });

  if (!existing) {
    throw new AdminWheelNotFoundError();
  }

  return prisma.wheelSegment.update({
    where: { id },
    data: { isActive: !existing.isActive },

    select: {
      id: true,
      label: true,
      kind: true,
      percentageValue: true,
      amountCents: true,
      weight: true,
      colorHex: true,
      isActive: true,
      sortOrder: true,
    },
  });
}

export async function deleteWheelSegment(id: string): Promise<void> {
  const existing = await prisma.wheelSegment.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existing) {
    throw new AdminWheelNotFoundError();
  }

  /*
   * onDelete: Restrict sur WheelSpin.segment — un segment déjà tiré
   * au moins une fois ne peut pas être supprimé (garde l'historique
   * cohérent). On le désactive à la place si la suppression échoue.
   */
  try {
    await prisma.wheelSegment.delete({ where: { id } });
  } catch {
    await prisma.wheelSegment.update({
      where: { id },
      data: { isActive: false },
    });

    throw new AdminWheelValidationError(
      "Cette case a déjà été tirée au moins une fois : elle a été désactivée plutôt que supprimée, pour garder l'historique des tirages.",
      {},
    );
  }
}

export async function moveWheelSegment(
  id: string,
  direction: "UP" | "DOWN",
): Promise<void> {
  const segments = await prisma.wheelSegment.findMany({
    orderBy: { sortOrder: "asc" },
    select: { id: true, sortOrder: true },
  });

  const index = segments.findIndex((segment) => segment.id === id);

  if (index === -1) {
    throw new AdminWheelNotFoundError();
  }

  const swapIndex = direction === "UP" ? index - 1 : index + 1;

  if (swapIndex < 0 || swapIndex >= segments.length) {
    return;
  }

  const current = segments[index]!;
  const swapTarget = segments[swapIndex]!;

  await prisma.$transaction([
    prisma.wheelSegment.update({
      where: { id: current.id },
      data: { sortOrder: swapTarget.sortOrder },
    }),

    prisma.wheelSegment.update({
      where: { id: swapTarget.id },
      data: { sortOrder: current.sortOrder },
    }),
  ]);
}
