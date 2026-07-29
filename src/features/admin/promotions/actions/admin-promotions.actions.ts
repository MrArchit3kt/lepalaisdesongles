"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  z,
} from "zod";

import {
  adminPromotionFormSchema,
  adminPromotionStatusSchema,
} from "@/features/admin/promotions/schemas/admin-promotions.schemas";

import {
  AdminPromotionDeleteError,
  AdminPromotionNotFoundError,
  AdminPromotionValidationError,
  createAdminPromotion,
  executeAdminPromotionAction,
  updateAdminPromotion,
} from "@/features/admin/promotions/services/admin-promotions.service";

import type {
  AdminPromotionAction,
  AdminPromotionActionState,
  AdminPromotionStatusInput,
} from "@/features/admin/promotions/types/admin-promotions.types";

import {
  requireAdminUser,
} from "@/lib/session";

/* -------------------------------------------------------------------------- */
/*                              VALIDATION ID                                 */
/* -------------------------------------------------------------------------- */

const promotionIdSchema =
  z
    .string()
    .trim()
    .min(
      1,
      "L’identifiant de la promotion est obligatoire.",
    )
    .max(
      500,
      "L’identifiant de la promotion est invalide.",
    );

/* -------------------------------------------------------------------------- */
/*                                  OUTILS                                    */
/* -------------------------------------------------------------------------- */

function revalidatePromotionPages(
  promotionId?: string,
  slug?: string,
): void {
  revalidatePath(
    "/admin/promotions",
  );

  revalidatePath(
    "/admin/dashboard",
  );

  revalidatePath(
    "/promotions",
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

  if (
    promotionId
  ) {
    revalidatePath(
      `/admin/promotions/${promotionId}`,
    );
  }

  if (
    slug
  ) {
    revalidatePath(
      `/promotions/${slug}`,
    );
  }
}

function normalizeZodErrors(
  error:
    z.ZodError,
): Record<
  string,
  string[]
> {
  const fieldErrors: Record<
    string,
    string[]
  > = {};

  for (
    const issue of
    error.issues
  ) {
    const field =
      String(
        issue.path[0] ??
          "form",
      );

    fieldErrors[field] ??=
      [];

    fieldErrors[field].push(
      issue.message,
    );
  }

  return fieldErrors;
}

function getPromotionFailure(
  error:
    unknown,
  fallback:
    string,
): AdminPromotionActionState {
  if (
    error instanceof
    AdminPromotionValidationError
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

  if (
    error instanceof
      AdminPromotionNotFoundError ||
    error instanceof
      AdminPromotionDeleteError
  ) {
    return {
      success:
        false,

      message:
        error.message,
    };
  }

  return {
    success:
      false,

    message:
      error instanceof
        Error
        ? error.message
        : fallback,
  };
}

function getActionSuccessMessage(
  action:
    AdminPromotionAction,
): string {
  switch (
    action
  ) {
    case "ACTIVATE":
      return "La promotion a été activée.";

    case "DEACTIVATE":
      return "La promotion a été désactivée.";

    case "SHOW_ON_HOMEPAGE":
      return "La promotion est maintenant affichée sur l’accueil.";

    case "HIDE_FROM_HOMEPAGE":
      return "La promotion a été retirée de l’accueil.";

    case "DUPLICATE":
      return "La promotion a été dupliquée.";

    case "DELETE":
      return "La promotion a été supprimée.";
  }
}

/* -------------------------------------------------------------------------- */
/*                                  CRÉATION                                  */
/* -------------------------------------------------------------------------- */

export async function createAdminPromotionAction(
  payload:
    unknown,
): Promise<
  AdminPromotionActionState
> {
  try {
    const parsed =
      adminPromotionFormSchema.safeParse(
        payload,
      );

    if (
      !parsed.success
    ) {
      return {
        success:
          false,

        message:
          "Vérifiez les informations de la promotion.",

        fieldErrors:
          normalizeZodErrors(
            parsed.error,
          ),
      };
    }

    const user =
      await requireAdminUser();

    const promotion =
      await createAdminPromotion({
        actorId:
          user.id,

        input:
          parsed.data,
      });

    revalidatePromotionPages(
      promotion.id,
      promotion.slug,
    );

    return {
      success:
        true,

      message:
        "La promotion a été créée avec succès.",

      promotionId:
        promotion.id,

      redirectTo:
        `/admin/promotions/${promotion.id}`,
    };
  } catch (
    error:
      unknown
  ) {
    console.error(
      "[ADMIN_PROMOTION_CREATE]",
      error,
    );

    return getPromotionFailure(
      error,
      "Impossible de créer la promotion.",
    );
  }
}

/* -------------------------------------------------------------------------- */
/*                              MISE À JOUR                                   */
/* -------------------------------------------------------------------------- */

export async function updateAdminPromotionAction(
  promotionId:
    string,
  payload:
    unknown,
): Promise<
  AdminPromotionActionState
> {
  try {
    const parsedPromotionId =
      promotionIdSchema.safeParse(
        promotionId,
      );

    if (
      !parsedPromotionId.success
    ) {
      return {
        success:
          false,

        message:
          parsedPromotionId.error
            .issues[0]
            ?.message ??
          "La promotion sélectionnée est invalide.",
      };
    }

    const parsed =
      adminPromotionFormSchema.safeParse(
        payload,
      );

    if (
      !parsed.success
    ) {
      return {
        success:
          false,

        message:
          "Vérifiez les informations de la promotion.",

        promotionId:
          parsedPromotionId.data,

        fieldErrors:
          normalizeZodErrors(
            parsed.error,
          ),
      };
    }

    const user =
      await requireAdminUser();

    const promotion =
      await updateAdminPromotion({
        actorId:
          user.id,

        promotionId:
          parsedPromotionId.data,

        input: {
          ...parsed.data,

          id:
            parsedPromotionId.data,
        },
      });

    revalidatePromotionPages(
      promotion.id,
      promotion.slug,
    );

    return {
      success:
        true,

      message:
        "La promotion a été mise à jour.",

      promotionId:
        promotion.id,
    };
  } catch (
    error:
      unknown
  ) {
    console.error(
      "[ADMIN_PROMOTION_UPDATE]",
      error,
    );

    return getPromotionFailure(
      error,
      "Impossible de modifier la promotion.",
    );
  }
}

/* -------------------------------------------------------------------------- */
/*                     ACTION RAPIDE SUR UNE PROMOTION                        */
/* -------------------------------------------------------------------------- */

export async function changeAdminPromotionStatusAction(
  payload:
    unknown,
): Promise<
  AdminPromotionActionState
> {
  try {
    const parsed =
      adminPromotionStatusSchema.safeParse(
        payload,
      );

    if (
      !parsed.success
    ) {
      return {
        success:
          false,

        message:
          "L’action demandée est invalide.",

        fieldErrors:
          normalizeZodErrors(
            parsed.error,
          ),
      };
    }

    const user =
      await requireAdminUser();

    const input:
      AdminPromotionStatusInput = {
        promotionId:
          parsed.data
            .promotionId,

        action:
          parsed.data
            .action,

        reason:
          parsed.data
            .reason,
      };

      await executeAdminPromotionAction({
        actorId:
          user.id,
      
        promotionId:
          input.promotionId,
      
        input,
      });
    revalidatePromotionPages(
      input.promotionId,
    );

    return {
      success:
        true,

      message:
        getActionSuccessMessage(
          input.action,
        ),

      promotionId:
        input.promotionId,

      redirectTo:
        input.action ===
          "DELETE"
          ? "/admin/promotions"
          : undefined,
    };
  } catch (
    error:
      unknown
  ) {
    console.error(
      "[ADMIN_PROMOTION_ACTION]",
      error,
    );

    return getPromotionFailure(
      error,
      "Impossible d’exécuter cette action sur la promotion.",
    );
  }
}

/* -------------------------------------------------------------------------- */
/*                         ACTIONS UNITAIRES                                  */
/* -------------------------------------------------------------------------- */

async function runPromotionAction(
  promotionId:
    string,
  action:
    AdminPromotionAction,
  reason?:
    string,
): Promise<
  AdminPromotionActionState
> {
  return changeAdminPromotionStatusAction({
    promotionId,
    action,
    reason,
  });
}

export async function activateAdminPromotionAction(
  promotionId:
    string,
): Promise<
  AdminPromotionActionState
> {
  return runPromotionAction(
    promotionId,
    "ACTIVATE",
  );
}

export async function deactivateAdminPromotionAction(
  promotionId:
    string,
): Promise<
  AdminPromotionActionState
> {
  return runPromotionAction(
    promotionId,
    "DEACTIVATE",
  );
}

export async function showAdminPromotionOnHomepageAction(
  promotionId:
    string,
): Promise<
  AdminPromotionActionState
> {
  return runPromotionAction(
    promotionId,
    "SHOW_ON_HOMEPAGE",
  );
}

export async function hideAdminPromotionFromHomepageAction(
  promotionId:
    string,
): Promise<
  AdminPromotionActionState
> {
  return runPromotionAction(
    promotionId,
    "HIDE_FROM_HOMEPAGE",
  );
}

export async function duplicateAdminPromotionAction(
  promotionId:
    string,
): Promise<
  AdminPromotionActionState
> {
  return runPromotionAction(
    promotionId,
    "DUPLICATE",
  );
}

export async function deleteAdminPromotionAction(
  promotionId:
    string,
  reason:
    string,
): Promise<
  AdminPromotionActionState
> {
  return runPromotionAction(
    promotionId,
    "DELETE",
    reason,
  );
}

/* -------------------------------------------------------------------------- */
/*                         ACTION FORM DATA                                   */
/* -------------------------------------------------------------------------- */

function getFormDataString(
  formData:
    FormData,
  field:
    string,
): string {
  const value =
    formData.get(
      field,
    );

  return typeof value ===
    "string"
    ? value
    : "";
}

function getFormDataNullableInteger(
  formData:
    FormData,
  field:
    string,
): number | null {
  const value =
    getFormDataString(
      formData,
      field,
    ).trim();

  if (
    value ===
    ""
  ) {
    return null;
  }

  const parsed =
    Number(
      value,
    );

  return Number.isFinite(
    parsed,
  )
    ? parsed
    : null;
}

function getFormDataBoolean(
  formData:
    FormData,
  field:
    string,
): boolean {
  const value =
    formData.get(
      field,
    );

  return (
    value ===
      "true" ||
    value ===
      "on" ||
    value ===
      "1"
  );
}

function getFormDataStringArray(
  formData:
    FormData,
  field:
    string,
): string[] {
  const directValues =
    formData
      .getAll(
        field,
      )
      .filter(
        (
          value,
        ): value is string =>
          typeof value ===
          "string",
      )
      .map(
        (
          value,
        ) =>
          value.trim(),
      )
      .filter(
        Boolean,
      );

  if (
    directValues.length >
    1
  ) {
    return [
      ...new Set(
        directValues,
      ),
    ];
  }

  const singleValue =
    directValues[0];

  if (
    !singleValue
  ) {
    return [];
  }

  try {
    const parsed =
      JSON.parse(
        singleValue,
      ) as unknown;

    if (
      Array.isArray(
        parsed,
      )
    ) {
      return [
        ...new Set(
          parsed
            .filter(
              (
                value,
              ): value is string =>
                typeof value ===
                "string",
            )
            .map(
              (
                value,
              ) =>
                value.trim(),
            )
            .filter(
              Boolean,
            ),
        ),
      ];
    }
  } catch {
    // La valeur peut aussi provenir de plusieurs champs HTML classiques.
  }

  return directValues;
}

function parseAdminPromotionFormData(
  formData:
    FormData,
): unknown {
  return {
    id:
      getFormDataString(
        formData,
        "id",
      ) ||
      undefined,

    name:
      getFormDataString(
        formData,
        "name",
      ),

    slug:
      getFormDataString(
        formData,
        "slug",
      ),

    description:
      getFormDataString(
        formData,
        "description",
      ),

    type:
      getFormDataString(
        formData,
        "type",
      ),

    percentageValue:
      getFormDataNullableInteger(
        formData,
        "percentageValue",
      ),

    amountCents:
      getFormDataNullableInteger(
        formData,
        "amountCents",
      ),

    code:
      getFormDataString(
        formData,
        "code",
      ),

    imageUrl:
      getFormDataString(
        formData,
        "imageUrl",
      ),

    startsAt:
      getFormDataString(
        formData,
        "startsAt",
      ),

    endsAt:
      getFormDataString(
        formData,
        "endsAt",
      ),

    usageLimit:
      getFormDataNullableInteger(
        formData,
        "usageLimit",
      ),

    perClientLimit:
      getFormDataNullableInteger(
        formData,
        "perClientLimit",
      ),

    minimumSpendCents:
      getFormDataNullableInteger(
        formData,
        "minimumSpendCents",
      ),

    isActive:
      getFormDataBoolean(
        formData,
        "isActive",
      ),

    showOnHomepage:
      getFormDataBoolean(
        formData,
        "showOnHomepage",
      ),

    serviceIds:
      getFormDataStringArray(
        formData,
        "serviceIds",
      ),

    bannerEnabled:
      getFormDataBoolean(
        formData,
        "bannerEnabled",
      ),

    bannerTitle:
      getFormDataString(
        formData,
        "bannerTitle",
      ),

    bannerSubtitle:
      getFormDataString(
        formData,
        "bannerSubtitle",
      ),

    bannerImageUrl:
      getFormDataString(
        formData,
        "bannerImageUrl",
      ),

    bannerMobileImageUrl:
      getFormDataString(
        formData,
        "bannerMobileImageUrl",
      ),

    bannerButtonLabel:
      getFormDataString(
        formData,
        "bannerButtonLabel",
      ),

    bannerButtonUrl:
      getFormDataString(
        formData,
        "bannerButtonUrl",
      ),

    bannerBackgroundColor:
      getFormDataString(
        formData,
        "bannerBackgroundColor",
      ),

    bannerTextColor:
      getFormDataString(
        formData,
        "bannerTextColor",
      ),
  };
}

export async function createAdminPromotionFromFormAction(
  _previousState:
    AdminPromotionActionState,
  formData:
    FormData,
): Promise<
  AdminPromotionActionState
> {
  return createAdminPromotionAction(
    parseAdminPromotionFormData(
      formData,
    ),
  );
}

export async function updateAdminPromotionFromFormAction(
  promotionId:
    string,
  _previousState:
    AdminPromotionActionState,
  formData:
    FormData,
): Promise<
  AdminPromotionActionState
> {
  return updateAdminPromotionAction(
    promotionId,
    parseAdminPromotionFormData(
      formData,
    ),
  );
}
