import { z } from "zod";

const MAX_SUBJECT_LENGTH = 150;
const MAX_PARTICIPANTS = 10;

const nullableTrimmedString = (
  maximumLength: number,
  maximumLengthMessage: string,
) =>
  z
    .union([
      z.string().trim().max(maximumLength, maximumLengthMessage),
      z.null(),
      z.undefined(),
    ])
    .transform((value) => {
      if (value === null || value === undefined) {
        return null;
      }

      const normalizedValue = value.trim();

      return normalizedValue.length > 0 ? normalizedValue : null;
    });

export const conversationIdSchema = z
  .string()
  .trim()
  .min(1, "La conversation est obligatoire.");

export const conversationSubjectSchema = nullableTrimmedString(
  MAX_SUBJECT_LENGTH,
  `Le sujet ne peut pas dépasser ${MAX_SUBJECT_LENGTH} caractères.`,
);

export const appointmentIdSchema = nullableTrimmedString(
  191,
  "L’identifiant du rendez-vous est invalide.",
);

export const createConversationSchema = z.object({
  participantIds: z
    .array(
      z
        .string()
        .trim()
        .min(1, "Chaque participant doit posséder un identifiant valide."),
    )
    .min(1, "Ajoutez au moins un participant.")
    .max(
      MAX_PARTICIPANTS,
      `Une conversation ne peut pas contenir plus de ${MAX_PARTICIPANTS} participants.`,
    )
    .transform((participantIds) => [...new Set(participantIds)]),
  subject: conversationSubjectSchema.default(null),
  appointmentId: appointmentIdSchema.default(null),
});

export const createClientConversationSchema = z.object({
  subject: conversationSubjectSchema.default(null),
  appointmentId: appointmentIdSchema.default(null),
  initialMessage: z
    .string()
    .trim()
    .min(1, "Le premier message est obligatoire.")
    .max(4_000, "Le message ne peut pas dépasser 4 000 caractères."),
});

export const conversationAccessSchema = z.object({
  conversationId: conversationIdSchema,
});

export const markConversationReadSchema = conversationAccessSchema;

export const closeConversationSchema = conversationAccessSchema.extend({
  isClosed: z.boolean(),
});

export const conversationListFiltersSchema = z.object({
  includeClosed: z.boolean().default(false),
  search: z
    .string()
    .trim()
    .max(100, "La recherche ne peut pas dépasser 100 caractères.")
    .default(""),
});

export type CreateConversationInput = z.infer<typeof createConversationSchema>;

export type CreateClientConversationInput = z.infer<
  typeof createClientConversationSchema
>;

export type ConversationAccessInput = z.infer<typeof conversationAccessSchema>;

export type MarkConversationReadInput = z.infer<
  typeof markConversationReadSchema
>;

export type CloseConversationInput = z.infer<typeof closeConversationSchema>;

export type ConversationListFiltersInput = z.infer<
  typeof conversationListFiltersSchema
>;
