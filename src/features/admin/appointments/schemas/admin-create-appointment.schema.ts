import { z } from "zod";

/*
 * Moyens de paiement hors-ligne pouvant être enregistrés lorsque
 * l'acompte a déjà été encaissé par l'équipe avant la création du
 * rendez-vous (espèces, carte ou virement en institut). `PAYPAL` est
 * exclu : ce moyen suppose un paiement en ligne encore à venir.
 */
export const ADMIN_OFFLINE_PAYMENT_METHODS = [
  "CASH",
  "CARD",
  "BANK_TRANSFER",
  "OTHER",
] as const;

export const adminCreateAppointmentSchema = z
  .object({
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

    /*
     * Contrairement au tunnel de réservation public, la création
     * manuelle côté admin ne s'appuie pas sur un créneau pré-calculé :
     * l'équipe choisit une date et une heure librement, y compris en
     * dehors des règles habituelles (voir admin-create-appointment.service.ts).
     */
    date: z
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "La date doit être au format AAAA-MM-JJ."),

    time: z
      .string()
      .trim()
      .regex(
        /^([01]\d|2[0-3]):[0-5]\d$/,
        "L'heure doit être au format HH:MM.",
      ),

    /*
     * "ONLINE" (par défaut) : un e-mail avec lien de paiement PayPal
     * est envoyé à la cliente, avec un délai de 24h pour régler
     * l'acompte. "ALREADY_PAID" : l'acompte a déjà été encaissé par
     * l'équipe, le rendez-vous est confirmé immédiatement.
     */
    paymentOption: z.enum(["ONLINE", "ALREADY_PAID"]).default("ONLINE"),

    paymentMethod: z.enum(ADMIN_OFFLINE_PAYMENT_METHODS).optional(),
  })
  .refine(
    (value) =>
      value.paymentOption !== "ALREADY_PAID" || value.paymentMethod,
    {
      message: "Précisez le moyen de paiement déjà encaissé.",
      path: ["paymentMethod"],
    },
  );

export type AdminCreateAppointmentPayload = z.infer<
  typeof adminCreateAppointmentSchema
>;
