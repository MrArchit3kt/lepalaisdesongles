import { z } from "zod";

import type { WheelSettings } from "@/features/wheel/types/wheel.types";

export const wheelSettingsSchema: z.ZodType<WheelSettings> = z.object({
  enabled: z.boolean(),
  bookingSpinEnabled: z.boolean(),
  dailySpinEnabled: z.boolean(),

  defaultValidityDays: z
    .number()
    .int()
    .min(1, "La durée de validité doit être d'au moins 1 jour.")
    .max(365, "La durée de validité ne peut pas dépasser 365 jours."),
});

export const DEFAULT_WHEEL_SETTINGS: WheelSettings = {
  enabled: false,
  bookingSpinEnabled: true,
  dailySpinEnabled: false,
  defaultValidityDays: 30,
};

export const wheelSegmentFormSchema = z
  .object({
    label: z
      .string()
      .trim()
      .min(1, "Le libellé est requis.")
      .max(60, "Le libellé est trop long."),

    kind: z.enum(["LOSE", "PERCENTAGE", "FIXED_AMOUNT"]),

    percentageValue: z
      .number()
      .int()
      .min(1)
      .max(100)
      .nullable()
      .optional(),

    amountCents: z
      .number()
      .int()
      .min(1)
      .nullable()
      .optional(),

    weight: z
      .number()
      .int()
      .min(1, "Le poids doit être d'au moins 1.")
      .max(1000, "Le poids est trop élevé."),

    colorHex: z
      .string()
      .trim()
      .regex(/^#[0-9a-fA-F]{6}$/, "Couleur invalide (format #RRGGBB).")
      .nullable()
      .optional(),

    isActive: z.boolean(),
  })
  .superRefine((value, context) => {
    if (value.kind === "PERCENTAGE" && !value.percentageValue) {
      context.addIssue({
        code: "custom",
        path: ["percentageValue"],
        message: "Indiquez un pourcentage de réduction.",
      });
    }

    if (value.kind === "FIXED_AMOUNT" && !value.amountCents) {
      context.addIssue({
        code: "custom",
        path: ["amountCents"],
        message: "Indiquez un montant de réduction.",
      });
    }
  });

export type WheelSegmentFormInput = z.infer<typeof wheelSegmentFormSchema>;
