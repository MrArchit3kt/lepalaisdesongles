import { z } from "zod";

/* -------------------------------------------------------------------------- */
/*                                   REGEX                                    */
/* -------------------------------------------------------------------------- */

const HEX_COLOR_REGEX =
  /^#(?:[0-9A-Fa-f]{6})$/;

const PHONE_REGEX =
  /^(\+33|0)[1-9](?:[ .-]?\d{2}){4}$/;

/* -------------------------------------------------------------------------- */
/*                                VALIDATIONS                                 */
/* -------------------------------------------------------------------------- */

export const createTeamMemberSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(
      2,
      "Le prénom est obligatoire.",
    )
    .max(
      50,
      "Le prénom ne peut pas dépasser 50 caractères.",
    ),

  lastName: z
    .string()
    .trim()
    .min(
      2,
      "Le nom est obligatoire.",
    )
    .max(
      50,
      "Le nom ne peut pas dépasser 50 caractères.",
    ),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email(
      "Adresse e-mail invalide.",
    ),

  phone: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine(
      (value) =>
        !value ||
        PHONE_REGEX.test(value),
      {
        message:
          "Numéro de téléphone invalide.",
      },
    ),

  password: z
    .string()
    .min(
      8,
      "Le mot de passe doit contenir au moins 8 caractères.",
    )
    .max(
      100,
      "Le mot de passe ne peut pas dépasser 100 caractères.",
    ),

  bio: z
    .string()
    .trim()
    .max(
      1000,
      "La biographie ne peut pas dépasser 1 000 caractères.",
    )
    .optional()
    .or(z.literal("")),

  color: z
    .string()
    .trim()
    .regex(
      HEX_COLOR_REGEX,
      "Couleur invalide.",
    ),

  isOwner: z.boolean(),

  isActive: z.boolean(),

  acceptsOnlineBooking: z.boolean(),

  defaultCleanupMinutes: z
    .number({
      error:
        "Le temps de nettoyage doit être un nombre.",
    })
    .int(
      "Le temps de nettoyage doit être un nombre entier.",
    )
    .min(
      0,
      "Le temps de nettoyage ne peut pas être négatif.",
    )
    .max(
      120,
      "Le temps de nettoyage ne peut pas dépasser 120 minutes.",
    ),

  slotIntervalMinutes: z
    .number({
      error:
        "L’intervalle des créneaux doit être un nombre.",
    })
    .int(
      "L’intervalle des créneaux doit être un nombre entier.",
    )
    .min(
      5,
      "L’intervalle minimum est de 5 minutes.",
    )
    .max(
      120,
      "L’intervalle maximum est de 120 minutes.",
    ),

  workstationIds: z
    .array(
      z.string().cuid(
        "Identifiant de poste invalide.",
      ),
    )
    .default([]),

  serviceIds: z
    .array(
      z.string().cuid(
        "Identifiant de prestation invalide.",
      ),
    )
    .default([]),
});

/* -------------------------------------------------------------------------- */
/*                                    TYPES                                   */
/* -------------------------------------------------------------------------- */

export type CreateTeamMemberInput =
  z.infer<
    typeof createTeamMemberSchema
  >;
