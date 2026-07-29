"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  AdminVipRewardValidationError,
  createAdminVipReward,
  deleteAdminVipReward,
  updateAdminVipReward,
} from "@/features/admin/vip/services/admin-vip-rewards.service";

import type {
  AdminVipActionState,
} from "@/features/admin/vip/types/admin-vip.types";

import {
  requireAdminUser,
} from "@/lib/session";

/* -------------------------------------------------------------------------- */
/*                                  OUTILS                                    */
/* -------------------------------------------------------------------------- */

function revalidateRewardPages():
  void {
  revalidatePath(
    "/admin/fidelite",
  );

  revalidatePath(
    "/admin/fidelite/recompenses",
  );

  revalidatePath(
    "/admin/dashboard",
  );

  revalidatePath(
    "/espace-client",
  );

  revalidatePath(
    "/",
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
  error: AdminVipRewardValidationError,
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
/*                                  CRÉATION                                  */
/* -------------------------------------------------------------------------- */

export async function createAdminVipRewardAction(
  payload: unknown,
): Promise<AdminVipActionState> {
  try {
    const user =
      await requireAdminUser();

    await createAdminVipReward(
      payload,
      user.id,
    );

    revalidateRewardPages();

    return {
      success:
        true,

      message:
        "La récompense VIP a été créée.",
    };
  } catch (
    error: unknown
  ) {
    if (
      error instanceof
      AdminVipRewardValidationError
    ) {
      return getValidationFailure(
        error,
      );
    }

    console.error(
      "[ADMIN_VIP_REWARD_CREATE]",
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
/*                                MODIFICATION                                */
/* -------------------------------------------------------------------------- */

export async function updateAdminVipRewardAction(
  payload: unknown,
): Promise<AdminVipActionState> {
  try {
    const user =
      await requireAdminUser();

    await updateAdminVipReward(
      payload,
      user.id,
    );

    revalidateRewardPages();

    return {
      success:
        true,

      message:
        "La récompense VIP a été modifiée.",
    };
  } catch (
    error: unknown
  ) {
    if (
      error instanceof
      AdminVipRewardValidationError
    ) {
      return getValidationFailure(
        error,
      );
    }

    console.error(
      "[ADMIN_VIP_REWARD_UPDATE]",
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
/*                              SUPPRESSION                                   */
/* -------------------------------------------------------------------------- */

export async function deleteAdminVipRewardAction(
  payload: unknown,
): Promise<AdminVipActionState> {
  try {
    const user =
      await requireAdminUser();

    await deleteAdminVipReward(
      payload,
      user.id,
    );

    revalidateRewardPages();

    return {
      success:
        true,

      message:
        "La récompense VIP a été supprimée.",
    };
  } catch (
    error: unknown
  ) {
    if (
      error instanceof
      AdminVipRewardValidationError
    ) {
      return getValidationFailure(
        error,
      );
    }

    console.error(
      "[ADMIN_VIP_REWARD_DELETE]",
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
