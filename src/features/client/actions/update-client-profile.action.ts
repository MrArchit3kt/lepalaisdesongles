"use server";

import { revalidatePath } from "next/cache";

import {
  updateClientProfileSchema,
  type ClientProfileActionState,
} from "@/features/client/schemas/client-profile.schema";

import { prisma } from "@/lib/prisma";

import { requireClientUser } from "@/lib/session";

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

function getOptionalString(formData: FormData, fieldName: string): string {
  const value = formData.get(fieldName);

  return typeof value === "string" ? value : "";
}

function getBoolean(formData: FormData, fieldName: string): boolean {
  const value = formData.get(fieldName);

  return value === "on" || value === "true" || value === "1";
}

function normalizeNullableString(value: string | undefined): string | null {
  const normalizedValue = value?.trim();

  return normalizedValue ? normalizedValue : null;
}

function parseBirthDate(value: string | undefined): Date | null {
  if (!value) {
    return null;
  }

  return new Date(`${value}T00:00:00.000Z`);
}

/* -------------------------------------------------------------------------- */
/*                                  ACTION                                    */
/* -------------------------------------------------------------------------- */

export async function updateClientProfileAction(
  _previousState: ClientProfileActionState,

  formData: FormData,
): Promise<ClientProfileActionState> {
  const user = await requireClientUser();

  const parsedData = updateClientProfileSchema.safeParse({
    firstName: getOptionalString(formData, "firstName"),

    lastName: getOptionalString(formData, "lastName"),

    phone: getOptionalString(formData, "phone"),

    birthDate: getOptionalString(formData, "birthDate"),

    addressLine1: getOptionalString(formData, "addressLine1"),

    addressLine2: getOptionalString(formData, "addressLine2"),

    postalCode: getOptionalString(formData, "postalCode"),

    city: getOptionalString(formData, "city"),

    country: getOptionalString(formData, "country"),

    allergies: getOptionalString(formData, "allergies"),

    marketingEmail: getBoolean(formData, "marketingEmail"),

    marketingSms: getBoolean(formData, "marketingSms"),
  });

  if (!parsedData.success) {
    return {
      status: "ERROR",

      message:
        "Certaines informations sont invalides. Vérifie les champs signalés.",

      fieldErrors: parsedData.error.flatten().fieldErrors,
    };
  }

  const {
    firstName,
    lastName,
    phone,
    birthDate,
    addressLine1,
    addressLine2,
    postalCode,
    city,
    country,
    allergies,
    marketingEmail,
    marketingSms,
  } = parsedData.data;

  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        id: user.id,
      },

      select: {
        id: true,

        role: true,

        status: true,
      },
    });

    if (
      !existingUser ||
      existingUser.role !== "CLIENT" ||
      existingUser.status !== "ACTIVE"
    ) {
      return {
        status: "ERROR",

        message:
          "Ton compte ne permet pas actuellement de modifier ces informations.",

        fieldErrors: {},
      };
    }

    await prisma.$transaction(async (transaction) => {
      await transaction.user.update({
        where: {
          id: user.id,
        },

        data: {
          firstName: firstName.trim(),

          lastName: lastName.trim(),

          phone: normalizeNullableString(phone),
        },
      });

      await transaction.clientProfile.upsert({
        where: {
          userId: user.id,
        },

        create: {
          userId: user.id,

          birthDate: parseBirthDate(birthDate),

          addressLine1: normalizeNullableString(addressLine1),

          addressLine2: normalizeNullableString(addressLine2),

          postalCode: normalizeNullableString(postalCode),

          city: normalizeNullableString(city),

          country: country.trim(),

          allergies: normalizeNullableString(allergies),

          marketingEmail,
          marketingSms,
        },

        update: {
          birthDate: parseBirthDate(birthDate),

          addressLine1: normalizeNullableString(addressLine1),

          addressLine2: normalizeNullableString(addressLine2),

          postalCode: normalizeNullableString(postalCode),

          city: normalizeNullableString(city),

          country: country.trim(),

          allergies: normalizeNullableString(allergies),

          marketingEmail,
          marketingSms,
        },
      });
    });

    revalidatePath("/espace-client", "layout");

    revalidatePath("/espace-client");

    revalidatePath("/espace-client/profil");

    return {
      status: "SUCCESS",

      message: "Tes informations personnelles ont bien été mises à jour.",

      fieldErrors: {},
    };
  } catch (error) {
    console.error("[updateClientProfileAction]", error);

    return {
      status: "ERROR",

      message:
        "Une erreur est survenue pendant l’enregistrement. Réessaie dans quelques instants.",

      fieldErrors: {},
    };
  }
}
