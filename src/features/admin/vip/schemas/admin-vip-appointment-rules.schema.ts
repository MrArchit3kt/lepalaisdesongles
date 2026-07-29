import {
  z,
} from "zod";

export const adminVipAppointmentRulesSchema =
  z
    .object({
      pointsRuleEnabled:
        z.boolean(),

      pointsPerEuro:
        z
          .number()
          .int(
            "Le nombre de points par euro doit être entier.",
          )
          .min(
            0,
            "Le nombre de points ne peut pas être négatif.",
          )
          .max(
            1000,
            "Le nombre de points par euro est trop élevé.",
          ),

      xpRuleEnabled:
        z.boolean(),

      xpPerCompletedAppointment:
        z
          .number()
          .int(
            "Le nombre d’XP doit être entier.",
          )
          .min(
            0,
            "Le nombre d’XP ne peut pas être négatif.",
          )
          .max(
            100000,
            "Le nombre d’XP par rendez-vous est trop élevé.",
          ),

      minimumSpendCents:
        z
          .number()
          .int(
            "Le montant minimum doit être exprimé en centimes.",
          )
          .min(
            0,
            "Le montant minimum ne peut pas être négatif.",
          )
          .max(
            100000000,
            "Le montant minimum est trop élevé.",
          )
          .nullable(),

      onlyPaidAppointments:
        z.boolean(),
    })
    .superRefine(
      (
        value,
        context,
      ) => {
        if (
          value.pointsRuleEnabled &&
          value.pointsPerEuro <=
            0
        ) {
          context.addIssue({
            code:
              "custom",

            path: [
              "pointsPerEuro",
            ],

            message:
              "Renseignez au moins 1 point par euro avant d’activer la règle.",
          });
        }

        if (
          value.xpRuleEnabled &&
          value.xpPerCompletedAppointment <=
            0
        ) {
          context.addIssue({
            code:
              "custom",

            path: [
              "xpPerCompletedAppointment",
            ],

            message:
              "Renseignez au moins 1 XP avant d’activer la règle.",
          });
        }
      },
    );

export type AdminVipAppointmentRulesInput =
  z.infer<
    typeof adminVipAppointmentRulesSchema
  >;
