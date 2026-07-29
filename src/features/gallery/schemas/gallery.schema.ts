import { z } from "zod";

export const galleryImageSchema = z.object({
  id: z.string(),

  url: z
    .string()
    .trim()
    .url(
      "L’URL du média est invalide.",
    )
    .max(2_048),

  /*
   * Renseignée uniquement pour une image
   * venant d’être envoyée avec UploadThing.
   *
   * Une image déjà enregistrée est reconnue
   * grâce à son identifiant GalleryMedia.
   */
  uploadKey: z
    .string()
    .trim()
    .min(
      1,
      "La clé du média est invalide.",
    )
    .max(500)
    .nullable()
    .optional(),

  thumbnailUrl: z
    .string()
    .trim()
    .nullable()
    .optional(),

  alt: z
    .string()
    .trim()
    .nullable()
    .optional(),

  width: z
    .number()
    .int()
    .positive()
    .nullable()
    .optional(),

  height: z
    .number()
    .int()
    .positive()
    .nullable()
    .optional(),

  type: z.enum([
    "IMAGE",
    "VIDEO",
  ]),

  sortOrder: z
    .number()
    .int()
    .min(0),

  isCover: z.boolean(),
});

export const galleryFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Le titre est obligatoire.")
    .max(120),

  description: z
    .string()
    .trim()
    .min(
      10,
      "La description est obligatoire.",
    )
    .max(4000),

  categoryId: z
    .string()
    .trim()
    .min(
      1,
      "Veuillez sélectionner une catégorie.",
    ),

  serviceName: z
    .string()
    .trim()
    .max(120)
    .optional()
    .or(z.literal("")),

  priceCents: z
    .number()
    .int()
    .nonnegative()
    .nullable()
    .optional(),

  durationMinutes: z
    .number()
    .int()
    .positive()
    .nullable()
    .optional(),

  tags: z
    .array(
      z.string().trim().min(1),
    )
    .max(20)
    .default([]),

  isFeatured: z.boolean(),

  isPublished: z.boolean(),

  images: z
    .array(galleryImageSchema)
    .min(
      1,
      "Ajoutez au moins une image.",
    )
    .max(
      10,
      "Vous pouvez ajouter au maximum 10 images.",
    ),
});

export const galleryFilterSchema = z.object({
  search: z.string().default(""),

  categoryId: z
    .string()
    .optional(),

  featured: z
    .boolean()
    .optional(),

  published: z
    .boolean()
    .optional(),
});

export type GalleryImageInput =
  z.infer<
    typeof galleryImageSchema
  >;

export type GalleryFormInput =
  z.infer<
    typeof galleryFormSchema
  >;

export type GalleryFilterInput =
  z.infer<
    typeof galleryFilterSchema
  >;