import { z } from "zod";

export const adminCreateAppointmentSchema = z.object({
  clientId: z.string().trim().min(1, "Sélectionnez une cliente."),

  serviceIds: z
    .array(z.string().trim().min(1))
    .min(1, "Sélectionnez au moins une prestation."),

  serviceOptions: z
    .array(
      z.object({
        serviceId: z.string().trim().min(1),
        quantity: z.number().int().min(1).max(20),
      }),
    )
    .optional(),

  staffId: z.string().trim().min(1, "Sélectionnez une professionnelle."),

  workstationId: z.string().trim().min(1, "Sélectionnez un poste de travail."),

  startsAt: z.string().trim().min(1, "Sélectionnez un créneau."),

  endsAt: z.string().trim().min(1, "Sélectionnez un créneau."),
});

export type AdminCreateAppointmentPayload = z.infer<
  typeof adminCreateAppointmentSchema
>;
