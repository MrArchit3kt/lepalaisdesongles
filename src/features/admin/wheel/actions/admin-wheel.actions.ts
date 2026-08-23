"use server";

import { revalidatePath } from "next/cache";

import {
  AdminWheelNotFoundError,
  AdminWheelValidationError,
  createWheelSegment,
  deleteWheelSegment,
  moveWheelSegment,
  toggleWheelSegmentActive,
  updateAdminWheelSettings,
  updateWheelSegment,
} from "@/features/admin/wheel/services/admin-wheel.service";
import type { AdminWheelActionState } from "@/features/admin/wheel/types/admin-wheel.types";
import { requireAdminUser } from "@/lib/session";

const WHEEL_ADMIN_PATH = "/admin/roue-de-la-chance";

function revalidateWheelPages() {
  revalidatePath(WHEEL_ADMIN_PATH);
}

function handleKnownError(error: unknown, fallbackMessage: string): AdminWheelActionState {
  if (error instanceof AdminWheelValidationError) {
    return {
      success: false,
      message: error.message,
      fieldErrors: error.fieldErrors,
    };
  }

  if (error instanceof AdminWheelNotFoundError) {
    return { success: false, message: error.message };
  }

  console.error("[ADMIN_WHEEL]", error);

  return {
    success: false,
    message: error instanceof Error ? error.message : fallbackMessage,
  };
}

export async function saveWheelSegmentAction(
  segmentId: string | null,
  payload: unknown,
): Promise<AdminWheelActionState> {
  try {
    await requireAdminUser();

    if (segmentId) {
      await updateWheelSegment(segmentId, payload);
    } else {
      await createWheelSegment(payload);
    }

    revalidateWheelPages();

    return {
      success: true,
      message: segmentId
        ? "La case a été mise à jour."
        : "La case a été ajoutée à la roue.",
    };
  } catch (error: unknown) {
    return handleKnownError(error, "Impossible d’enregistrer cette case.");
  }
}

export async function deleteWheelSegmentAction(
  segmentId: string,
): Promise<AdminWheelActionState> {
  try {
    await requireAdminUser();
    await deleteWheelSegment(segmentId);

    revalidateWheelPages();

    return { success: true, message: "La case a été supprimée." };
  } catch (error: unknown) {
    return handleKnownError(error, "Impossible de supprimer cette case.");
  }
}

export async function toggleWheelSegmentAction(
  segmentId: string,
): Promise<AdminWheelActionState> {
  try {
    await requireAdminUser();
    await toggleWheelSegmentActive(segmentId);

    revalidateWheelPages();

    return { success: true, message: "Le statut de la case a été mis à jour." };
  } catch (error: unknown) {
    return handleKnownError(error, "Impossible de modifier cette case.");
  }
}

export async function moveWheelSegmentAction(
  segmentId: string,
  direction: "UP" | "DOWN",
): Promise<AdminWheelActionState> {
  try {
    await requireAdminUser();
    await moveWheelSegment(segmentId, direction);

    revalidateWheelPages();

    return { success: true, message: "L’ordre a été mis à jour." };
  } catch (error: unknown) {
    return handleKnownError(error, "Impossible de déplacer cette case.");
  }
}

export async function saveWheelSettingsAction(
  payload: unknown,
): Promise<AdminWheelActionState> {
  try {
    await requireAdminUser();
    await updateAdminWheelSettings(payload);

    revalidateWheelPages();

    return { success: true, message: "Les réglages ont été enregistrés." };
  } catch (error: unknown) {
    return handleKnownError(error, "Impossible d’enregistrer les réglages.");
  }
}
