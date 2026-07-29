"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  AdminVipLevelValidationError,
  createAdminVipLevel,
  deleteAdminVipLevel,
  updateAdminVipLevel,
} from "@/features/admin/vip/services/admin-vip-levels.service";

import type {
  AdminVipActionState,
} from "@/features/admin/vip/types/admin-vip.types";

import {
  requireAdminUser,
} from "@/lib/session";

/* -------------------------------------------------------------------------- */
/*                                  OUTILS                                    */
/* -------------------------------------------------------------------------- */

function revalidateVipLevelPages():
  void {
  revalidatePath(
    "/admin/fidelite",
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
  error: AdminVipLevelValidationError,
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

export async function createAdminVipLevelAction(
  payload: unknown,
): Promise<AdminVipActionState> {
  try {
    const user =
      await requireAdminUser();

    await createAdminVipLevel(
      payload,
      user.id,
    );

    revalidateVipLevelPages();

    return {
      success:
        true,

      message:
        "Le niveau VIP a été créé.",
    };
  } catch (
    error: unknown
  ) {
    if (
      error instanceof
      AdminVipLevelValidationError
    ) {
      return getValidationFailure(
        error,
      );
    }

    console.error(
      "[ADMIN_VIP_LEVEL_CREATE]",
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

export async function updateAdminVipLevelAction(
  payload: unknown,
): Promise<AdminVipActionState> {
  try {
    const user =
      await requireAdminUser();

    await updateAdminVipLevel(
      payload,
      user.id,
    );

    revalidateVipLevelPages();

    return {
      success:
        true,

      message:
        "Le niveau VIP a été modifié.",
    };
  } catch (
    error: unknown
  ) {
    if (
      error instanceof
      AdminVipLevelValidationError
    ) {
      return getValidationFailure(
        error,
      );
    }

    console.error(
      "[ADMIN_VIP_LEVEL_UPDATE]",
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

export async function deleteAdminVipLevelAction(
  payload: unknown,
): Promise<AdminVipActionState> {
  try {
    const user =
      await requireAdminUser();

    await deleteAdminVipLevel(
      payload,
      user.id,
    );

    revalidateVipLevelPages();

    return {
      success:
        true,

      message:
        "Le niveau VIP a été supprimé.",
    };
  } catch (
    error: unknown
  ) {
    if (
      error instanceof
      AdminVipLevelValidationError
    ) {
      return getValidationFailure(
        error,
      );
    }

    console.error(
      "[ADMIN_VIP_LEVEL_DELETE]",
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
