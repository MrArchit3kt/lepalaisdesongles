"use server";

import bcrypt from "bcryptjs";

import { revalidatePath } from "next/cache";

import {
  changeClientPasswordSchema,
  type ChangeClientPasswordActionState,
} from "@/features/client/schemas/client-profile.schema";

import { prisma } from "@/lib/prisma";

import { requireClientUser } from "@/lib/session";

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

function getStringValue(formData: FormData, fieldName: string): string {
  const value = formData.get(fieldName);

  return typeof value === "string" ? value : "";
}

/* -------------------------------------------------------------------------- */
/*                                  ACTION                                    */
/* -------------------------------------------------------------------------- */

export async function changeClientPasswordAction(
  _previousState: ChangeClientPasswordActionState,

  formData: FormData,
): Promise<ChangeClientPasswordActionState> {
  const sessionUser = await requireClientUser();

  const parsedData = changeClientPasswordSchema.safeParse({
    currentPassword: getStringValue(formData, "currentPassword"),

    newPassword: getStringValue(formData, "newPassword"),

    confirmPassword: getStringValue(formData, "confirmPassword"),
  });

  if (!parsedData.success) {
    return {
      status: "ERROR",

      message:
        "Le mot de passe n’a pas pu être modifié. Vérifie les champs signalés.",

      fieldErrors: parsedData.error.flatten().fieldErrors,
    };
  }

  const { currentPassword, newPassword } = parsedData.data;

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: sessionUser.id,
      },

      select: {
        id: true,

        passwordHash: true,

        role: true,

        status: true,

        authVersion: true,
      },
    });

    if (!user || user.role !== "CLIENT" || user.status !== "ACTIVE") {
      return {
        status: "ERROR",

        message:
          "Ton compte ne permet pas actuellement de modifier le mot de passe.",

        fieldErrors: {},
      };
    }

    if (!user.passwordHash) {
      return {
        status: "ERROR",

        message: "Aucun mot de passe local n’est configuré pour ce compte.",

        fieldErrors: {},
      };
    }

    const currentPasswordIsValid = await bcrypt.compare(
      currentPassword,
      user.passwordHash,
    );

    if (!currentPasswordIsValid) {
      return {
        status: "ERROR",

        message: "Le mot de passe actuel est incorrect.",

        fieldErrors: {
          currentPassword: ["Le mot de passe actuel est incorrect."],
        },
      };
    }

    const passwordAlreadyUsed = await bcrypt.compare(
      newPassword,
      user.passwordHash,
    );

    if (passwordAlreadyUsed) {
      return {
        status: "ERROR",

        message:
          "Le nouveau mot de passe doit être différent du mot de passe actuel.",

        fieldErrors: {
          newPassword: ["Choisis un mot de passe différent de l’actuel."],
        },
      };
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: {
        id: user.id,
      },

      data: {
        passwordHash: newPasswordHash,

        authVersion: {
          increment: 1,
        },
      },
    });

    revalidatePath("/espace-client", "layout");

    revalidatePath("/espace-client/profil");

    return {
      status: "SUCCESS",

      message:
        "Ton mot de passe a bien été modifié. Tu devras te reconnecter avec ton nouveau mot de passe.",

      fieldErrors: {},
    };
  } catch (error) {
    console.error("[changeClientPasswordAction]", error);

    return {
      status: "ERROR",

      message:
        "Une erreur est survenue pendant la modification du mot de passe. Réessaie dans quelques instants.",

      fieldErrors: {},
    };
  }
}
