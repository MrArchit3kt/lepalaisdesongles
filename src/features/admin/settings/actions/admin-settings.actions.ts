"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  AdminSettingsValidationError,
  resetAdminSettingsSection,
  saveAdminSettingsSection,
} from "@/features/admin/settings/services/admin-settings.service";

import type {
  AdminSettingsActionState,
  AdminSettingsSection,
} from "@/features/admin/settings/types/admin-settings.types";

import {
  requireAdminUser,
} from "@/lib/session";

/* -------------------------------------------------------------------------- */
/*                                 CONSTANTES                                 */
/* -------------------------------------------------------------------------- */

const VALID_SECTIONS =
  new Set<
    AdminSettingsSection
  >([
    "SALON",
    "BOOKING",
    "PAYMENTS",
    "NOTIFICATIONS",
    "WEBSITE",
    "SOCIAL",
    "LEGAL",
  ]);

/* -------------------------------------------------------------------------- */
/*                                  OUTILS                                    */
/* -------------------------------------------------------------------------- */

function isAdminSettingsSection(
  value: unknown,
): value is AdminSettingsSection {
  return (
    typeof value ===
      "string" &&
    VALID_SECTIONS.has(
      value as AdminSettingsSection,
    )
  );
}

function revalidateSettingsPages():
  void {
  revalidatePath(
    "/admin/parametres",
  );

  revalidatePath(
    "/",
  );

  revalidatePath(
    "/reservation",
  );

  revalidatePath(
    "/prestations",
  );

  revalidatePath(
    "/galerie",
  );

  revalidatePath(
    "/avis",
  );

  revalidatePath(
    "/concours",
  );

  revalidatePath(
    "/promotions",
  );
}

function getErrorMessage(
  error: unknown,
): string {
  if (
    error instanceof
    Error
  ) {
    return error.message;
  }

  return "Une erreur inattendue est survenue.";
}

/* -------------------------------------------------------------------------- */
/*                              ENREGISTREMENT                                */
/* -------------------------------------------------------------------------- */

export async function updateAdminSettingsAction(
  section: AdminSettingsSection,
  payload: unknown,
): Promise<AdminSettingsActionState> {
  if (
    !isAdminSettingsSection(
      section,
    )
  ) {
    return {
      success:
        false,

      message:
        "La section de paramètres demandée est invalide.",

      section:
        null,
    };
  }

  try {
    const user =
      await requireAdminUser();

    await saveAdminSettingsSection(
      section,
      payload,
      user.id,
    );

    revalidateSettingsPages();

    return {
      success:
        true,

      message:
        "Les paramètres ont été enregistrés avec succès.",

      section,
    };
  } catch (
    error: unknown
  ) {
    if (
      error instanceof
      AdminSettingsValidationError
    ) {
      return {
        success:
          false,

        message:
          error.message,

        section,

        fieldErrors:
          error.fieldErrors,
      };
    }

    console.error(
      "[ADMIN_SETTINGS_UPDATE]",
      error,
    );

    return {
      success:
        false,

      message:
        getErrorMessage(
          error,
        ),

      section,
    };
  }
}

/* -------------------------------------------------------------------------- */
/*                            RÉINITIALISATION                                */
/* -------------------------------------------------------------------------- */

export async function resetAdminSettingsAction(
  section: AdminSettingsSection,
): Promise<AdminSettingsActionState> {
  if (
    !isAdminSettingsSection(
      section,
    )
  ) {
    return {
      success:
        false,

      message:
        "La section de paramètres demandée est invalide.",

      section:
        null,
    };
  }

  try {
    const user =
      await requireAdminUser();

    await resetAdminSettingsSection(
      section,
      user.id,
    );

    revalidateSettingsPages();

    return {
      success:
        true,

      message:
        "Les paramètres par défaut ont été restaurés.",

      section,
    };
  } catch (
    error: unknown
  ) {
    console.error(
      "[ADMIN_SETTINGS_RESET]",
      error,
    );

    return {
      success:
        false,

      message:
        getErrorMessage(
          error,
        ),

      section,
    };
  }
}
