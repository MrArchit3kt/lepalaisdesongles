import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "L’adresse e-mail est obligatoire.")
    .email("L’adresse e-mail n’est pas valide.")
    .transform((value) => value.toLowerCase()),

  password: z
    .string()
    .min(1, "Le mot de passe est obligatoire."),
});

export type LoginInput = z.infer<typeof loginSchema>;
