"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  AdminContestValidationError,
  changeAdminContestStatus,
  createAdminContest,
  drawAdminContestWinner,
  updateAdminContest,
} from "@/features/admin/contests/services/admin-contests-management.service";

import type {
  AdminContestActionState,
} from "@/features/admin/contests/types/admin-contests.types";

import {
  requireAdminUser,
} from "@/lib/session";

/* -------------------------------------------------------------------------- */
/*                                  OUTILS                                    */
/* -------------------------------------------------------------------------- */

function revalidateContestPages(
  contestId?: string,
  slug?: string,
): void {
  revalidatePath(
    "/admin/concours",
  );

  revalidatePath(
    "/admin/dashboard",
  );

  revalidatePath(
    "/concours",
  );

  revalidatePath(
    "/",
  );

  if (contestId) {
    revalidatePath(
      `/admin/concours/${contestId}`,
    );
  }

  if (slug) {
    revalidatePath(
      `/concours/${slug}`,
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
  error: AdminContestValidationError,
): AdminContestActionState {
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

export async function createAdminContestAction(
  payload: unknown,
): Promise<AdminContestActionState> {
  try {
    const user =
      await requireAdminUser();

    const contest =
      await createAdminContest(
        payload,
        user.id,
      );

    revalidateContestPages(
      contest.id,
      contest.slug,
    );

    return {
      success:
        true,

      message:
        "Le concours a été créé avec succès.",

      contestId:
        contest.id,

      redirectTo:
        `/admin/concours/${contest.id}`,
    };
  } catch (
    error: unknown
  ) {
    if (
      error instanceof
      AdminContestValidationError
    ) {
      return getValidationFailure(
        error,
      );
    }

    console.error(
      "[ADMIN_CONTEST_CREATE]",
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

export async function updateAdminContestAction(
  payload: unknown,
): Promise<AdminContestActionState> {
  try {
    const user =
      await requireAdminUser();

    const contest =
      await updateAdminContest(
        payload,
        user.id,
      );

    revalidateContestPages(
      contest.id,
      contest.slug,
    );

    return {
      success:
        true,

      message:
        "Le concours a été modifié avec succès.",

      contestId:
        contest.id,
    };
  } catch (
    error: unknown
  ) {
    if (
      error instanceof
      AdminContestValidationError
    ) {
      return getValidationFailure(
        error,
      );
    }

    console.error(
      "[ADMIN_CONTEST_UPDATE]",
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
/*                         MODIFICATION DU STATUT                             */
/* -------------------------------------------------------------------------- */

export async function changeAdminContestStatusAction(
  payload: unknown,
): Promise<AdminContestActionState> {
  try {
    const user =
      await requireAdminUser();

    const result =
      await changeAdminContestStatus(
        payload,
        user.id,
      );

    revalidateContestPages(
      result.contestId,
    );

    return {
      success:
        true,

      message:
        result.deleted
          ? "Le concours a été supprimé."
          : "Le statut du concours a été mis à jour.",

      contestId:
        result.contestId,

      redirectTo:
        result.deleted
          ? "/admin/concours"
          : undefined,
    };
  } catch (
    error: unknown
  ) {
    if (
      error instanceof
      AdminContestValidationError
    ) {
      return getValidationFailure(
        error,
      );
    }

    console.error(
      "[ADMIN_CONTEST_STATUS]",
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
/*                             TIRAGE AU SORT                                 */
/* -------------------------------------------------------------------------- */

export async function drawAdminContestWinnerAction(
  payload: unknown,
): Promise<AdminContestActionState> {
  try {
    const user =
      await requireAdminUser();

    const result =
      await drawAdminContestWinner(
        payload,
        user.id,
      );

    revalidateContestPages(
      result.contestId,
    );

    return {
      success:
        true,

      message:
        `${result.winnerName} a été désignée gagnante du concours.`,

      contestId:
        result.contestId,
    };
  } catch (
    error: unknown
  ) {
    if (
      error instanceof
      AdminContestValidationError
    ) {
      return getValidationFailure(
        error,
      );
    }

    console.error(
      "[ADMIN_CONTEST_DRAW]",
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
