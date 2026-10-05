import { z } from "zod";

export const requestPasswordResetSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "L’adresse e-mail est obligatoire.")
    .email("Adresse e-mail invalide.")
    .max(255, "Adresse e-mail trop longue."),
});

export type RequestPasswordResetInput = z.infer<
  typeof requestPasswordResetSchema
>;

/*
 * Même politique de mot de passe que changeClientPasswordSchema
 * (client-profile.schema.ts), pour rester cohérent sur tout le site.
 */
export const resetPasswordSchema = z
  .object({
    token: z.string().trim().min(1, "Lien de réinitialisation invalide."),

    password: z
      .string()
      .min(12, "Le mot de passe doit contenir au moins 12 caractères.")
      .max(200, "Le mot de passe est trop long.")
      .regex(/[a-z]/, "Le mot de passe doit contenir au moins une lettre minuscule.")
      .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une lettre majuscule.")
      .regex(/\d/, "Le mot de passe doit contenir au moins un chiffre.")
      .regex(
        /[^A-Za-z0-9]/,
        "Le mot de passe doit contenir au moins un caractère spécial.",
      ),

    confirmPassword: z
      .string()
      .min(1, "La confirmation du mot de passe est obligatoire."),
  })
  .superRefine((values, context) => {
    if (values.password !== values.confirmPassword) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "Les deux mots de passe ne correspondent pas.",
      });
    }
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
