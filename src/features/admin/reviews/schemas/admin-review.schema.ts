import { z } from "zod";

export const REVIEW_SOURCES = [
  "WEBSITE",
  "GOOGLE",
  "FACEBOOK",
  "OTHER",
] as const;

export const adminReviewSchema = z.object({
  source: z.enum(REVIEW_SOURCES),

  authorName: z
    .string()
    .trim()
    .min(1, "Le nom de l’auteur est obligatoire.")
    .max(120, "Le nom de l’auteur est trop long."),

  authorAvatar: z
    .string()
    .trim()
    .max(2048, "L’adresse de la photo est trop longue.")
    .refine(
      (value) => {
        if (!value) return true;
        try {
          const url = new URL(value);
          return url.protocol === "http:" || url.protocol === "https:";
        } catch {
          return false;
        }
      },
      { message: "L’adresse doit commencer par http:// ou https://." },
    )
    .optional()
    .or(z.literal("")),

  rating: z
    .number()
    .int()
    .min(1, "La note doit être comprise entre 1 et 5.")
    .max(5, "La note doit être comprise entre 1 et 5."),

  title: z.string().trim().max(160, "Le titre est trop long.").optional(),

  content: z
    .string()
    .trim()
    .min(1, "Le contenu de l’avis est obligatoire.")
    .max(4000, "Le contenu de l’avis est trop long."),

  publishedAt: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "La date doit être au format AAAA-MM-JJ."),

  isVerified: z.boolean(),
  isFeatured: z.boolean(),
});

export type AdminReviewPayload = z.infer<typeof adminReviewSchema>;
