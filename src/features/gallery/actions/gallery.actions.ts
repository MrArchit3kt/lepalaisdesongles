"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  z,
} from "zod";

import {
  galleryFormSchema,
  type GalleryFormInput,
} from "@/features/gallery/schemas/gallery.schema";

import {
  GalleryValidationError,
  createGalleryItem,
  deleteGalleryItem,
  toggleFeaturedGalleryItem,
  togglePublishedGalleryItem,
  updateGalleryItem,
} from "@/features/gallery/services/gallery.service";

import {
  requireAdminUser,
} from "@/lib/session";

export type GalleryActionState = {
  success: boolean;
  message: string;
};

const galleryIdSchema =
  z
    .string()
    .trim()
    .min(
      1,
      "L’identifiant de la réalisation est invalide.",
    )
    .max(500);

function revalidateGallery(): void {
  revalidatePath("/");
  revalidatePath("/galerie");
  revalidatePath("/admin/galerie");
}

function parseJsonValue(
  value:
    FormDataEntryValue |
    null,
): unknown {
  if (
    typeof value !==
    "string"
  ) {
    return null;
  }

  try {
    return JSON.parse(
      value,
    ) as unknown;
  } catch {
    return null;
  }
}

function parseOptionalInteger(
  value:
    FormDataEntryValue |
    null,
): number | undefined {
  if (
    typeof value !==
    "string" ||
    value.trim() ===
      ""
  ) {
    return undefined;
  }

  return Number(
    value,
  );
}

function parseGalleryFormData(
  formData:
    FormData,
):
  | {
      success:
        true;
      data:
        GalleryFormInput;
    }
  | {
      success:
        false;
      message:
        string;
    } {
  const parsed =
    galleryFormSchema.safeParse({
      title:
        String(
          formData.get(
            "title",
          ) ??
            "",
        ),

      description:
        String(
          formData.get(
            "description",
          ) ??
            "",
        ),

      categoryId:
        String(
          formData.get(
            "categoryId",
          ) ??
            "",
        ),

      serviceName:
        String(
          formData.get(
            "serviceName",
          ) ??
            "",
        ),

      priceCents:
        parseOptionalInteger(
          formData.get(
            "priceCents",
          ),
        ),

      durationMinutes:
        parseOptionalInteger(
          formData.get(
            "durationMinutes",
          ),
        ),

      tags:
        parseJsonValue(
          formData.get(
            "tags",
          ),
        ),

      images:
        parseJsonValue(
          formData.get(
            "images",
          ),
        ),

      isFeatured:
        formData.get(
          "isFeatured",
        ) ===
        "true",

      isPublished:
        formData.get(
          "isPublished",
        ) !==
        "false",
    });

  if (
    !parsed.success
  ) {
    return {
      success:
        false,

      message:
        parsed.error.issues[0]
          ?.message ??
        "Vérifiez les informations de la réalisation.",
    };
  }

  return {
    success:
      true,

    data:
      parsed.data,
  };
}

function getFailureMessage(
  error:
    unknown,
  fallback:
    string,
): string {
  if (
    error instanceof
    GalleryValidationError
  ) {
    return error.message;
  }

  return fallback;
}

export async function createGalleryItemAction(
  _previousState:
    GalleryActionState,
  formData:
    FormData,
): Promise<GalleryActionState> {
  try {
    const user =
      await requireAdminUser();

    const parsed =
      parseGalleryFormData(
        formData,
      );

    if (
      !parsed.success
    ) {
      return {
        success:
          false,

        message:
          parsed.message,
      };
    }

    await createGalleryItem({
      actorId:
        user.id,

      input:
        parsed.data,
    });

    revalidateGallery();

    return {
      success:
        true,

      message:
        "La réalisation a été créée avec succès.",
    };
  } catch (
    error:
      unknown
  ) {
    console.error(
      "[GALLERY_CREATE]",
      error,
    );

    return {
      success:
        false,

      message:
        getFailureMessage(
          error,
          "Impossible de créer la réalisation.",
        ),
    };
  }
}

export async function updateGalleryItemAction(
  id:
    string,
  formData:
    FormData,
): Promise<GalleryActionState> {
  try {
    const user =
      await requireAdminUser();

    const parsedId =
      galleryIdSchema.safeParse(
        id,
      );

    if (
      !parsedId.success
    ) {
      return {
        success:
          false,

        message:
          "La réalisation sélectionnée est invalide.",
      };
    }

    const parsed =
      parseGalleryFormData(
        formData,
      );

    if (
      !parsed.success
    ) {
      return {
        success:
          false,

        message:
          parsed.message,
      };
    }

    await updateGalleryItem({
      actorId:
        user.id,

      galleryItemId:
        parsedId.data,

      input:
        parsed.data,
    });

    revalidateGallery();

    return {
      success:
        true,

      message:
        "La réalisation a été mise à jour.",
    };
  } catch (
    error:
      unknown
  ) {
    console.error(
      "[GALLERY_UPDATE]",
      error,
    );

    return {
      success:
        false,

      message:
        getFailureMessage(
          error,
          "Impossible de mettre à jour la réalisation.",
        ),
    };
  }
}

export async function deleteGalleryItemAction(
  id:
    string,
): Promise<GalleryActionState> {
  try {
    await requireAdminUser();

    const parsed =
      galleryIdSchema.safeParse(
        id,
      );

    if (
      !parsed.success
    ) {
      return {
        success:
          false,

        message:
          "La réalisation sélectionnée est invalide.",
      };
    }

    await deleteGalleryItem(
      parsed.data,
    );

    revalidateGallery();

    return {
      success:
        true,

      message:
        "La réalisation a été supprimée.",
    };
  } catch (
    error:
      unknown
  ) {
    console.error(
      "[GALLERY_DELETE]",
      error,
    );

    return {
      success:
        false,

      message:
        "Impossible de supprimer la réalisation.",
    };
  }
}

export async function toggleGalleryPublishedAction(
  id:
    string,
): Promise<GalleryActionState> {
  try {
    await requireAdminUser();

    const parsed =
      galleryIdSchema.safeParse(
        id,
      );

    if (
      !parsed.success
    ) {
      return {
        success:
          false,

        message:
          "La réalisation sélectionnée est invalide.",
      };
    }

    await togglePublishedGalleryItem(
      parsed.data,
    );

    revalidateGallery();

    return {
      success:
        true,

      message:
        "Le statut de publication a été modifié.",
    };
  } catch (
    error:
      unknown
  ) {
    console.error(
      "[GALLERY_PUBLICATION]",
      error,
    );

    return {
      success:
        false,

      message:
        "Impossible de modifier la publication.",
    };
  }
}

export async function toggleGalleryFeaturedAction(
  id:
    string,
): Promise<GalleryActionState> {
  try {
    await requireAdminUser();

    const parsed =
      galleryIdSchema.safeParse(
        id,
      );

    if (
      !parsed.success
    ) {
      return {
        success:
          false,

        message:
          "La réalisation sélectionnée est invalide.",
      };
    }

    await toggleFeaturedGalleryItem(
      parsed.data,
    );

    revalidateGallery();

    return {
      success:
        true,

      message:
        "La mise en avant a été modifiée.",
    };
  } catch (
    error:
      unknown
  ) {
    console.error(
      "[GALLERY_FEATURED]",
      error,
    );

    return {
      success:
        false,

      message:
        "Impossible de modifier la mise en avant.",
    };
  }
}
