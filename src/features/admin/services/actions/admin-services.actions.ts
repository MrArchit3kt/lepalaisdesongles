"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  z,
} from "zod";

import {
  adminServiceFormSchema,
} from "@/features/admin/services/schemas/admin-service.schema";

import {
  AdminServiceDeleteError,
  AdminServiceNotFoundError,
  AdminServiceValidationError,
  createAdminService,
  deleteAdminService,
  toggleAdminServiceFeatured,
  toggleAdminServiceVisibility,
  updateAdminService,
} from "@/features/admin/services/services/admin-services.service";

import type {
  AdminServiceActionState,
} from "@/features/admin/services/types/admin-service.types";

import {
  requireAdminUser,
} from "@/lib/session";

/* -------------------------------------------------------------------------- */
/*                              VALIDATION ID                                 */
/* -------------------------------------------------------------------------- */

const serviceIdSchema =
  z
    .string()
    .trim()
    .min(
      1,
      "L’identifiant de la prestation est obligatoire.",
    );

/* -------------------------------------------------------------------------- */
/*                                  OUTILS                                    */
/* -------------------------------------------------------------------------- */

function revalidateServicePages(
  serviceId?: string,
  slug?: string,
): void {
  revalidatePath(
    "/admin/prestations",
  );

  revalidatePath(
    "/admin/dashboard",
  );

  revalidatePath(
    "/prestations",
  );

  revalidatePath(
    "/reservation",
  );

  revalidatePath(
    "/",
  );

  if (serviceId) {
    revalidatePath(
      `/admin/prestations/${serviceId}`,
    );
  }

  if (slug) {
    revalidatePath(
      `/prestations/${slug}`,
    );
  }
}

function getErrorMessage(
  error: unknown,
): string {
  return error instanceof Error
    ? error.message
    : "Une erreur inattendue est survenue.";
}

function normalizeZodErrors(
  error: z.ZodError,
): Record<string, string[]> {
  const fieldErrors: Record<
    string,
    string[]
  > = {};

  for (const issue of error.issues) {
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

function getServiceFailure(
  error: unknown,
): AdminServiceActionState {
  if (
    error instanceof
    AdminServiceValidationError
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
      AdminServiceNotFoundError ||
    error instanceof
      AdminServiceDeleteError
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
      getErrorMessage(
        error,
      ),
  };
}

/* -------------------------------------------------------------------------- */
/*                                  CRÉATION                                  */
/* -------------------------------------------------------------------------- */

export async function createAdminServiceAction(
  payload: unknown,
): Promise<AdminServiceActionState> {
  try {
    const parsed =
      adminServiceFormSchema.safeParse(
        payload,
      );

    if (!parsed.success) {
      return {
        success:
          false,

        message:
          "Vérifiez les informations de la prestation.",

        fieldErrors:
          normalizeZodErrors(
            parsed.error,
          ),
      };
    }

    const user =
      await requireAdminUser();

    const service =
      await createAdminService({
        actorId:
          user.id,

        input:
          parsed.data,
      });

    revalidateServicePages(
      service.id,
      service.slug,
    );

    return {
      success:
        true,

      message:
        "La prestation a été créée avec succès.",

      serviceId:
        service.id,

      redirectUrl:
        `/admin/prestations/${service.id}`,
    };
  } catch (
    error: unknown
  ) {
    console.error(
      "[ADMIN_SERVICE_CREATE]",
      error,
    );

    return getServiceFailure(
      error,
    );
  }
}

/* -------------------------------------------------------------------------- */
/*                              MISE À JOUR                                   */
/* -------------------------------------------------------------------------- */

export async function updateAdminServiceAction(
  serviceId: string,
  payload: unknown,
): Promise<AdminServiceActionState> {
  try {
    const parsedServiceId =
      serviceIdSchema.safeParse(
        serviceId,
      );

    if (!parsedServiceId.success) {
      return {
        success:
          false,

        message:
          "La prestation sélectionnée est invalide.",
      };
    }

    const parsed =
      adminServiceFormSchema.safeParse(
        payload,
      );

    if (!parsed.success) {
      return {
        success:
          false,

        message:
          "Vérifiez les informations de la prestation.",

        fieldErrors:
          normalizeZodErrors(
            parsed.error,
          ),
      };
    }

    const user =
      await requireAdminUser();

    const service =
      await updateAdminService({
        actorId:
          user.id,

        serviceId:
          parsedServiceId.data,

        input:
          parsed.data,
      });

    revalidateServicePages(
      service.id,
      service.slug,
    );

    return {
      success:
        true,

      message:
        "La prestation a été mise à jour.",

      serviceId:
        service.id,
    };
  } catch (
    error: unknown
  ) {
    console.error(
      "[ADMIN_SERVICE_UPDATE]",
      error,
    );

    return getServiceFailure(
      error,
    );
  }
}

/* -------------------------------------------------------------------------- */
/*                              VISIBILITÉ                                    */
/* -------------------------------------------------------------------------- */

export async function toggleAdminServiceVisibilityAction(
  serviceId: string,
): Promise<AdminServiceActionState> {
  try {
    const parsed =
      serviceIdSchema.safeParse(
        serviceId,
      );

    if (!parsed.success) {
      return {
        success:
          false,

        message:
          "La prestation sélectionnée est invalide.",
      };
    }

    const user =
      await requireAdminUser();

    const isActive =
      await toggleAdminServiceVisibility({
        actorId:
          user.id,

        serviceId:
          parsed.data,
      });

    revalidateServicePages(
      parsed.data,
    );

    return {
      success:
        true,

      message:
        isActive
          ? "La prestation est maintenant visible."
          : "La prestation a été masquée.",

      serviceId:
        parsed.data,
    };
  } catch (
    error: unknown
  ) {
    console.error(
      "[ADMIN_SERVICE_VISIBILITY]",
      error,
    );

    return getServiceFailure(
      error,
    );
  }
}

/* -------------------------------------------------------------------------- */
/*                              MISE EN AVANT                                 */
/* -------------------------------------------------------------------------- */

export async function toggleAdminServiceFeaturedAction(
  serviceId: string,
): Promise<AdminServiceActionState> {
  try {
    const parsed =
      serviceIdSchema.safeParse(
        serviceId,
      );

    if (!parsed.success) {
      return {
        success:
          false,

        message:
          "La prestation sélectionnée est invalide.",
      };
    }

    const user =
      await requireAdminUser();

    const isFeatured =
      await toggleAdminServiceFeatured({
        actorId:
          user.id,

        serviceId:
          parsed.data,
      });

    revalidateServicePages(
      parsed.data,
    );

    return {
      success:
        true,

      message:
        isFeatured
          ? "La prestation est maintenant mise en avant."
          : "La prestation n’est plus mise en avant.",

      serviceId:
        parsed.data,
    };
  } catch (
    error: unknown
  ) {
    console.error(
      "[ADMIN_SERVICE_FEATURED]",
      error,
    );

    return getServiceFailure(
      error,
    );
  }
}

/* -------------------------------------------------------------------------- */
/*                                SUPPRESSION                                 */
/* -------------------------------------------------------------------------- */

export async function deleteAdminServiceAction(
  serviceId: string,
): Promise<AdminServiceActionState> {
  try {
    const parsed =
      serviceIdSchema.safeParse(
        serviceId,
      );

    if (!parsed.success) {
      return {
        success:
          false,

        message:
          "La prestation sélectionnée est invalide.",
      };
    }

    const user =
      await requireAdminUser();

    await deleteAdminService({
      actorId:
        user.id,

      serviceId:
        parsed.data,
    });

    revalidateServicePages();

    return {
      success:
        true,

      message:
        "La prestation a été supprimée.",

      redirectUrl:
        "/admin/prestations",
    };
  } catch (
    error: unknown
  ) {
    console.error(
      "[ADMIN_SERVICE_DELETE]",
      error,
    );

    return getServiceFailure(
      error,
    );
  }
}
