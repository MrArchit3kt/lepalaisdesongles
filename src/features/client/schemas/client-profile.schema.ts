import { z } from "zod";

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

function normalizeOptionalString(value: unknown): unknown {
  if (typeof value !== "string") {
    return value;
  }

  const normalizedValue = value.trim();

  return normalizedValue.length > 0 ? normalizedValue : undefined;
}

function normalizeOptionalDate(value: unknown): unknown {
  if (typeof value !== "string") {
    return value;
  }

  const normalizedValue = value.trim();

  return normalizedValue.length > 0 ? normalizedValue : undefined;
}

function normalizePhone(value: unknown): unknown {
  if (typeof value !== "string") {
    return value;
  }

  const normalizedValue = value.trim().replace(/[.\s()-]/g, "");

  return normalizedValue.length > 0 ? normalizedValue : undefined;
}

function isValidBirthDate(value: string): boolean {
  const date = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() + 1 === month &&
    date.getUTCDate() === day
  );
}

function isNotFutureDate(value: string): boolean {
  const date = new Date(`${value}T00:00:00.000Z`);

  const now = new Date();

  const today = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );

  return date.getTime() <= today.getTime();
}

/* -------------------------------------------------------------------------- */
/*                             CHAMPS COMMUNS                                 */
/* -------------------------------------------------------------------------- */

const firstNameSchema = z
  .string()
  .trim()
  .min(2, "Le prénom doit contenir au moins 2 caractères.")
  .max(80, "Le prénom ne peut pas dépasser 80 caractères.");

const lastNameSchema = z
  .string()
  .trim()
  .min(2, "Le nom doit contenir au moins 2 caractères.")
  .max(100, "Le nom ne peut pas dépasser 100 caractères.");

const phoneSchema = z.preprocess(
  normalizePhone,
  z
    .string()
    .regex(
      /^(?:(?:\+|00)33|0)[1-9](?:\d{2}){4}$/,
      "Saisis un numéro de téléphone français valide.",
    )
    .optional(),
);

const birthDateSchema = z.preprocess(
  normalizeOptionalDate,
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "La date de naissance doit être valide.")
    .refine(isValidBirthDate, "La date de naissance doit être valide.")
    .refine(
      isNotFutureDate,
      "La date de naissance ne peut pas être dans le futur.",
    )
    .optional(),
);

const addressLineSchema = z.preprocess(
  normalizeOptionalString,
  z
    .string()
    .max(150, "L’adresse ne peut pas dépasser 150 caractères.")
    .optional(),
);

const postalCodeSchema = z.preprocess(
  normalizeOptionalString,
  z
    .string()
    .regex(/^\d{5}$/, "Le code postal doit contenir 5 chiffres.")
    .optional(),
);

const citySchema = z.preprocess(
  normalizeOptionalString,
  z
    .string()
    .max(100, "La ville ne peut pas dépasser 100 caractères.")
    .optional(),
);

const countrySchema = z
  .string()
  .trim()
  .min(2, "Le pays est obligatoire.")
  .max(100, "Le pays ne peut pas dépasser 100 caractères.");

const allergiesSchema = z.preprocess(
  normalizeOptionalString,
  z
    .string()
    .max(
      1000,
      "Les informations concernant les allergies ne peuvent pas dépasser 1 000 caractères.",
    )
    .optional(),
);

/* -------------------------------------------------------------------------- */
/*                            PROFIL PERSONNEL                                */
/* -------------------------------------------------------------------------- */

export const updateClientProfileSchema = z.object({
  firstName: firstNameSchema,

  lastName: lastNameSchema,

  phone: phoneSchema,

  birthDate: birthDateSchema,

  addressLine1: addressLineSchema,

  addressLine2: addressLineSchema,

  postalCode: postalCodeSchema,

  city: citySchema,

  country: countrySchema,

  allergies: allergiesSchema,

  marketingEmail: z.boolean(),

  marketingSms: z.boolean(),
});

/* -------------------------------------------------------------------------- */
/*                         CHANGEMENT DE MOT DE PASSE                         */
/* -------------------------------------------------------------------------- */

export const changeClientPasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, "Le mot de passe actuel est obligatoire.")
      .max(200, "Le mot de passe actuel est trop long."),

    newPassword: z
      .string()
      .min(12, "Le nouveau mot de passe doit contenir au moins 12 caractères.")
      .max(200, "Le nouveau mot de passe est trop long.")
      .regex(
        /[a-z]/,
        "Le nouveau mot de passe doit contenir au moins une lettre minuscule.",
      )
      .regex(
        /[A-Z]/,
        "Le nouveau mot de passe doit contenir au moins une lettre majuscule.",
      )
      .regex(/\d/, "Le nouveau mot de passe doit contenir au moins un chiffre.")
      .regex(
        /[^A-Za-z0-9]/,
        "Le nouveau mot de passe doit contenir au moins un caractère spécial.",
      ),

    confirmPassword: z
      .string()
      .min(1, "La confirmation du mot de passe est obligatoire."),
  })
  .superRefine((values, context) => {
    if (values.currentPassword === values.newPassword) {
      context.addIssue({
        code: z.ZodIssueCode.custom,

        path: ["newPassword"],

        message:
          "Le nouveau mot de passe doit être différent du mot de passe actuel.",
      });
    }

    if (values.newPassword !== values.confirmPassword) {
      context.addIssue({
        code: z.ZodIssueCode.custom,

        path: ["confirmPassword"],

        message: "Les deux mots de passe ne correspondent pas.",
      });
    }
  });

/* -------------------------------------------------------------------------- */
/*                                  TYPES                                    */
/* -------------------------------------------------------------------------- */

export type UpdateClientProfileInput = z.infer<
  typeof updateClientProfileSchema
>;

export type ChangeClientPasswordInput = z.infer<
  typeof changeClientPasswordSchema
>;

/* -------------------------------------------------------------------------- */
/*                              ACTION STATES                                 */
/* -------------------------------------------------------------------------- */

export type ClientProfileFieldErrors = {
  firstName?: string[];
  lastName?: string[];
  phone?: string[];
  birthDate?: string[];
  addressLine1?: string[];
  addressLine2?: string[];
  postalCode?: string[];
  city?: string[];
  country?: string[];
  allergies?: string[];
  marketingEmail?: string[];
  marketingSms?: string[];
};

export type ClientProfileActionState = {
  status: "IDLE" | "SUCCESS" | "ERROR";

  message: string | null;

  fieldErrors: ClientProfileFieldErrors;
};

export type ChangeClientPasswordFieldErrors = {
  currentPassword?: string[];
  newPassword?: string[];
  confirmPassword?: string[];
};

export type ChangeClientPasswordActionState = {
  status: "IDLE" | "SUCCESS" | "ERROR";

  message: string | null;

  fieldErrors: ChangeClientPasswordFieldErrors;
};

/* -------------------------------------------------------------------------- */
/*                              INITIAL STATES                                */
/* -------------------------------------------------------------------------- */

export const initialClientProfileActionState: ClientProfileActionState = {
  status: "IDLE",

  message: null,

  fieldErrors: {},
};

export const initialChangeClientPasswordActionState: ChangeClientPasswordActionState =
  {
    status: "IDLE",

    message: null,

    fieldErrors: {},
  };
