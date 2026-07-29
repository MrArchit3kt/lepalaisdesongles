"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  AdminVipValidationError,
  adjustVipMemberBalance,
  updateVipConfiguration,
} from "@/features/admin/vip/services/admin-vip-management.service";

import type {
  AdminVipActionState,
} from "@/features/admin/vip/types/admin-vip.types";

import {
  requireAdminUser,
} from "@/lib/session";

/* -------------------------------------------------------------------------- */
/*                                  OUTILS                                    */
/* -------------------------------------------------------------------------- */

function revalidateVipPages():
  void {
  revalidatePath(
    "/admin/fidelite",
  );

  revalidatePath(
    "/admin/dashboard",
  );

  revalidatePath(
    "/",
  );

  revalidatePath(
    "/espace-client",
  );

  revalidatePath(
    "/concours",
  );
}

function getErrorMessage(
  error: unknown,
): string {
  return error instanceof
    Error
    ? error.message
    : "Une erreur inattendue est survenue.";
}

function getValidationFailure(
  error: AdminVipValidationError,
): AdminVipActionState {
  return {
    success:
      false,

    message:
      error.message,

    fieldErrors:
      error.fieldErrors,
  };
}

/* -------------------------------------------------------------------------- */
/*                              CONFIGURATION                                 */
/* -------------------------------------------------------------------------- */

export async function updateVipConfigurationAction(
  payload: unknown,
): Promise<AdminVipActionState> {
  try {
    const user =
      await requireAdminUser();

    await updateVipConfiguration(
      payload,
      user.id,
    );

    revalidateVipPages();

    return {
      success:
        true,

      message:
        "La configuration du Club VIP a été enregistrée.",
    };
  } catch (
    error: unknown
  ) {
    if (
      error instanceof
      AdminVipValidationError
    ) {
      return getValidationFailure(
        error,
      );
    }

    console.error(
      "[ADMIN_VIP_CONFIGURATION_UPDATE]",
      error,
    );

    return {
      success:
        false,

      message:
        getErrorMessage(
          error,
        ),
    };
  }
}

/* -------------------------------------------------------------------------- */
/*                           AJUSTEMENT MANUEL                                */
/* -------------------------------------------------------------------------- */

export async function adjustVipMemberBalanceAction(
  payload: unknown,
): Promise<AdminVipActionState> {
  try {
    const user =
      await requireAdminUser();

    await adjustVipMemberBalance(
      payload,
      user.id,
    );

    revalidateVipPages();

    return {
      success:
        true,

      message:
        "Le solde de la membre VIP a été mis à jour.",
    };
  } catch (
    error: unknown
  ) {
    if (
      error instanceof
      AdminVipValidationError
    ) {
      return getValidationFailure(
        error,
      );
    }

    console.error(
      "[ADMIN_VIP_BALANCE_ADJUSTMENT]",
      error,
    );

    return {
      success:
        false,

      message:
        getErrorMessage(
          error,
        ),
    };
  }
}
