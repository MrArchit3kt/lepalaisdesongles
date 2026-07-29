"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  AdminVipMemberValidationError,
  adjustAdminVipMemberBalance,
  changeAdminVipMemberLevel,
  changeAdminVipMemberStatus,
  grantAdminVipMemberReward,
} from "@/features/admin/vip/services/admin-vip-member-management.service";

import type {
  AdminVipActionState,
} from "@/features/admin/vip/types/admin-vip.types";

import {
  requireAdminUser,
} from "@/lib/session";

/* -------------------------------------------------------------------------- */
/*                                  OUTILS                                    */
/* -------------------------------------------------------------------------- */

function revalidateVipMemberPages(
  accountId?: string,
): void {
  revalidatePath(
    "/admin/fidelite",
  );

  revalidatePath(
    "/admin/fidelite/membres",
  );

  revalidatePath(
    "/admin/dashboard",
  );

  revalidatePath(
    "/espace-client",
  );

  if (
    accountId
  ) {
    revalidatePath(
      `/admin/fidelite/membres/${accountId}`,
    );
  }
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
  error: AdminVipMemberValidationError,
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
/*                        AJUSTEMENT POINTS ET XP                             */
/* -------------------------------------------------------------------------- */

export async function adjustAdminVipMemberBalanceAction(
  payload: unknown,
): Promise<AdminVipActionState> {
  try {
    const user =
      await requireAdminUser();

    const result =
      await adjustAdminVipMemberBalance(
        payload,
        user.id,
      );

    revalidateVipMemberPages(
      result.accountId,
    );

    return {
      success:
        true,

      message:
        "Le solde de points et d’XP a été mis à jour.",
    };
  } catch (
    error: unknown
  ) {
    if (
      error instanceof
      AdminVipMemberValidationError
    ) {
      return getValidationFailure(
        error,
      );
    }

    console.error(
      "[ADMIN_VIP_MEMBER_BALANCE]",
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
/*                          CHANGEMENT DE NIVEAU                              */
/* -------------------------------------------------------------------------- */

export async function changeAdminVipMemberLevelAction(
  payload: unknown,
): Promise<AdminVipActionState> {
  try {
    const user =
      await requireAdminUser();

    const result =
      await changeAdminVipMemberLevel(
        payload,
        user.id,
      );

    revalidateVipMemberPages(
      result.accountId,
    );

    return {
      success:
        true,

      message:
        `Le membre est maintenant au niveau « ${result.levelName} ».`,
    };
  } catch (
    error: unknown
  ) {
    if (
      error instanceof
      AdminVipMemberValidationError
    ) {
      return getValidationFailure(
        error,
      );
    }

    console.error(
      "[ADMIN_VIP_MEMBER_LEVEL]",
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
/*                          MODIFICATION DU STATUT                            */
/* -------------------------------------------------------------------------- */

export async function changeAdminVipMemberStatusAction(
  payload: unknown,
): Promise<AdminVipActionState> {
  try {
    const user =
      await requireAdminUser();

    const result =
      await changeAdminVipMemberStatus(
        payload,
        user.id,
      );

    revalidateVipMemberPages(
      result.accountId,
    );

    return {
      success:
        true,

      message:
        "Le statut du membre VIP a été mis à jour.",
    };
  } catch (
    error: unknown
  ) {
    if (
      error instanceof
      AdminVipMemberValidationError
    ) {
      return getValidationFailure(
        error,
      );
    }

    console.error(
      "[ADMIN_VIP_MEMBER_STATUS]",
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
/*                        ATTRIBUTION DE RÉCOMPENSE                           */
/* -------------------------------------------------------------------------- */

export async function grantAdminVipMemberRewardAction(
  payload: unknown,
): Promise<AdminVipActionState> {
  try {
    const user =
      await requireAdminUser();

    const result =
      await grantAdminVipMemberReward(
        payload,
        user.id,
      );

    revalidateVipMemberPages(
      result.accountId,
    );

    return {
      success:
        true,

      message:
        `La récompense « ${result.rewardName} » a été attribuée.`,
    };
  } catch (
    error: unknown
  ) {
    if (
      error instanceof
      AdminVipMemberValidationError
    ) {
      return getValidationFailure(
        error,
      );
    }

    console.error(
      "[ADMIN_VIP_MEMBER_REWARD]",
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
