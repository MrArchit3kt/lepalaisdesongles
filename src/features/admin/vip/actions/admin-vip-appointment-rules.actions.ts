"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  AdminVipAppointmentRulesValidationError,
  updateAdminVipAppointmentRulesSettings,
} from "@/features/admin/vip/services/admin-vip-appointment-rules.service";

import type {
  AdminVipActionState,
} from "@/features/admin/vip/types/admin-vip.types";

import {
  requireAdminUser,
} from "@/lib/session";

export async function updateAdminVipAppointmentRulesAction(
  payload: unknown,
): Promise<AdminVipActionState> {
  try {
    const user =
      await requireAdminUser();

    await updateAdminVipAppointmentRulesSettings(
      payload,
      user.id,
    );

    revalidatePath(
      "/admin/fidelite",
    );

    revalidatePath(
      "/admin/fidelite/automatisations",
    );

    revalidatePath(
      "/admin/parametres",
    );

    revalidatePath(
      "/admin/dashboard",
    );

    return {
      success:
        true,

      message:
        "Les gains automatiques des rendez-vous ont été enregistrés.",
    };
  } catch (
    error: unknown
  ) {
    if (
      error instanceof
      AdminVipAppointmentRulesValidationError
    ) {
      return {
        success:
          false,

        message:
          error.message,

        fieldErrors:
          error.fieldErrors,
      };
    }

    console.error(
      "[ADMIN_VIP_APPOINTMENT_RULES]",
      error,
    );

    return {
      success:
        false,

      message:
        error instanceof
          Error
          ? error.message
          : "Impossible d’enregistrer les règles automatiques.",
    };
  }
}
