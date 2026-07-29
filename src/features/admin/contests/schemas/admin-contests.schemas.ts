import {
  z,
} from "zod";

/* -------------------------------------------------------------------------- */
/*                                  OUTILS                                    */
/* -------------------------------------------------------------------------- */

const requiredText = (
  label: string,
  maximumLength: number,
) =>
  z
    .string()
    .trim()
    .min(
      1,
      `${label} est obligatoire.`,
    )
    .max(
      maximumLength,
      `${label} ne peut pas dépasser ${maximumLength} caractères.`,
    );

const optionalText = (
  maximumLength: number,
) =>
  z
    .string()
    .trim()
    .max(
      maximumLength,
      `Ce champ ne peut pas dépasser ${maximumLength} caractères.`,
    );

const optionalUrl =
  z
    .string()
    .trim()
    .max(
      2048,
      "L’adresse URL est trop longue.",
    )
    .refine(
      (value) => {
        if (
          value === ""
        ) {
          return true;
        }

        try {
          const url =
            new URL(
              value,
            );

          return (
            url.protocol ===
              "http:" ||
            url.protocol ===
              "https:"
          );
        } catch {
          return false;
        }
      },
      {
        message:
          "L’adresse doit commencer par http:// ou https://.",
      },
    );

const dateTimeSchema = (
  label: string,
) =>
  z
    .string()
    .trim()
    .min(
      1,
      `${label} est obligatoire.`,
    )
    .refine(
      (value) =>
        !Number.isNaN(
          new Date(
            value,
          ).getTime(),
        ),
      {
        message:
          `${label} n’est pas valide.`,
      },
    );

const optionalDateTimeSchema = (
  label: string,
) =>
  z
    .string()
    .trim()
    .refine(
      (value) =>
        value === "" ||
        !Number.isNaN(
          new Date(
            value,
          ).getTime(),
        ),
      {
        message:
          `${label} n’est pas valide.`,
      },
    );

const contestStatusSchema =
  z.enum([
    "DRAFT",
    "SCHEDULED",
    "ACTIVE",
    "CLOSED",
    "DRAWN",
    "CANCELLED",
  ]);

/* -------------------------------------------------------------------------- */
/*                            CRÉATION / ÉDITION                              */
/* -------------------------------------------------------------------------- */

export const adminContestFormSchema =
  z
    .object({
      id:
        z
          .string()
          .trim()
          .optional(),

      title:
        requiredText(
          "Le titre",
          160,
        ),

      slug:
        z
          .string()
          .trim()
          .min(
            1,
            "Le slug est obligatoire.",
          )
          .max(
            180,
            "Le slug ne peut pas dépasser 180 caractères.",
          )
          .regex(
            /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
            "Le slug doit uniquement contenir des lettres minuscules, des chiffres et des tirets.",
          ),

      description:
        requiredText(
          "La description",
          5000,
        ),

      rules:
        optionalText(
          10000,
        ),

      prize:
        requiredText(
          "Le lot",
          1000,
        ),

      imageUrl:
        optionalUrl,

      status:
        contestStatusSchema,

      startsAt:
        dateTimeSchema(
          "La date de début",
        ),

      endsAt:
        dateTimeSchema(
          "La date de fin",
        ),

      drawAt:
        optionalDateTimeSchema(
          "La date du tirage",
        ),

      maximumEntries:
        z
          .number()
          .int(
            "La limite de participations doit être un nombre entier.",
          )
          .min(
            1,
            "La limite doit être d’au moins une participation.",
          )
          .max(
            1000000,
            "La limite de participations est trop élevée.",
          )
          .nullable(),

      requiresAccount:
        z.boolean(),

      showOnHomepage:
        z.boolean(),
    })
    .superRefine(
      (
        value,
        context,
      ) => {
        const startsAt =
          new Date(
            value.startsAt,
          );

        const endsAt =
          new Date(
            value.endsAt,
          );

        if (
          endsAt <=
          startsAt
        ) {
          context.addIssue({
            code:
              "custom",

            path: [
              "endsAt",
            ],

            message:
              "La date de fin doit être postérieure à la date de début.",
          });
        }

        if (
          value.drawAt !==
            ""
        ) {
          const drawAt =
            new Date(
              value.drawAt,
            );

          if (
            drawAt <
            endsAt
          ) {
            context.addIssue({
              code:
                "custom",

              path: [
                "drawAt",
              ],

              message:
                "Le tirage au sort ne peut pas avoir lieu avant la fin du concours.",
            });
          }
        }

        if (
          value.status ===
            "SCHEDULED" &&
          startsAt <=
            new Date()
        ) {
          context.addIssue({
            code:
              "custom",

            path: [
              "startsAt",
            ],

            message:
              "Un concours planifié doit commencer dans le futur.",
          });
        }
      },
    );

/* -------------------------------------------------------------------------- */
/*                           TIRAGE AU SORT                                   */
/* -------------------------------------------------------------------------- */

export const adminContestDrawSchema =
  z.object({
    contestId:
      z
        .string()
        .trim()
        .min(
          1,
          "Le concours est obligatoire.",
        ),

    participantId:
      z
        .string()
        .trim()
        .min(
          1,
          "La participante est invalide.",
        )
        .optional(),

    reason:
      requiredText(
        "Le motif du tirage",
        1000,
      ),
  });

/* -------------------------------------------------------------------------- */
/*                        MODIFICATION DU STATUT                              */
/* -------------------------------------------------------------------------- */

export const adminContestStatusSchema =
  z
    .object({
      contestId:
        z
          .string()
          .trim()
          .min(
            1,
            "Le concours est obligatoire.",
          ),

      action:
        z.enum([
          "ACTIVATE",
          "SCHEDULE",
          "CLOSE",
          "CANCEL",
          "DRAW",
          "REOPEN",
          "DELETE",
        ]),

      reason:
        z
          .string()
          .trim()
          .max(
            1000,
            "Le motif ne peut pas dépasser 1000 caractères.",
          )
          .optional(),
    })
    .superRefine(
      (
        value,
        context,
      ) => {
        if (
          (
            value.action ===
              "CANCEL" ||
            value.action ===
              "DELETE"
          ) &&
          !value.reason
        ) {
          context.addIssue({
            code:
              "custom",

            path: [
              "reason",
            ],

            message:
              "Un motif est obligatoire pour cette action.",
          });
        }
      },
    );

/* -------------------------------------------------------------------------- */
/*                                 FILTRES                                    */
/* -------------------------------------------------------------------------- */

export const adminContestFiltersSchema =
  z.object({
    search:
      z
        .string()
        .trim()
        .max(
          200,
          "La recherche est trop longue.",
        ),

    status:
      z.enum([
        "ALL",
        "DRAFT",
        "SCHEDULED",
        "ACTIVE",
        "CLOSED",
        "DRAWN",
        "CANCELLED",
      ]),

    homepageOnly:
      z.boolean(),
  });

export type AdminContestFormSchemaInput =
  z.infer<
    typeof adminContestFormSchema
  >;

export type AdminContestDrawSchemaInput =
  z.infer<
    typeof adminContestDrawSchema
  >;

export type AdminContestStatusSchemaInput =
  z.infer<
    typeof adminContestStatusSchema
  >;

export type AdminContestFiltersSchemaInput =
  z.infer<
    typeof adminContestFiltersSchema
  >;
