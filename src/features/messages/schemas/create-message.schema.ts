import { z } from "zod";

const MAX_MESSAGE_LENGTH = 4_000;
const MAX_ATTACHMENT_COUNT = 5;
const MAX_ATTACHMENT_SIZE_BYTES = 10 * 1024 * 1024;

export const messageTypeSchema = z.enum(["TEXT", "IMAGE", "FILE", "SYSTEM"]);

export const messageAttachmentSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1, "L’URL de la pièce jointe est obligatoire.")
    .url("L’URL de la pièce jointe est invalide."),
  fileName: z
    .string()
    .trim()
    .max(255, "Le nom du fichier est trop long.")
    .nullable()
    .optional(),
  mimeType: z
    .string()
    .trim()
    .max(150, "Le type du fichier est trop long.")
    .nullable()
    .optional(),
  sizeBytes: z
    .number()
    .int()
    .nonnegative()
    .max(MAX_ATTACHMENT_SIZE_BYTES, "Chaque fichier doit peser moins de 10 Mo.")
    .nullable()
    .optional(),
});

export const createMessageSchema = z
  .object({
    conversationId: z
      .string()
      .trim()
      .min(1, "La conversation est obligatoire."),
    content: z
      .string()
      .trim()
      .max(
        MAX_MESSAGE_LENGTH,
        `Le message ne peut pas dépasser ${MAX_MESSAGE_LENGTH} caractères.`,
      )
      .default(""),
    type: messageTypeSchema.default("TEXT"),
    attachments: z
      .array(messageAttachmentSchema)
      .max(
        MAX_ATTACHMENT_COUNT,
        `Vous pouvez envoyer au maximum ${MAX_ATTACHMENT_COUNT} pièces jointes.`,
      )
      .default([]),
  })
  .superRefine((value, context) => {
    const hasContent = value.content.trim().length > 0;
    const hasAttachments = value.attachments.length > 0;

    if (!hasContent && !hasAttachments) {
      context.addIssue({
        code: "custom",
        path: ["content"],
        message: "Écrivez un message ou ajoutez une pièce jointe.",
      });
    }

    if (value.type === "SYSTEM" && hasAttachments) {
      context.addIssue({
        code: "custom",
        path: ["attachments"],
        message: "Un message système ne peut pas contenir de pièce jointe.",
      });
    }
  });

export const createClientMessageSchema = createMessageSchema.safeExtend({
  type: z.enum(["TEXT", "IMAGE", "FILE"]).default("TEXT"),
});

export type MessageAttachmentInput = z.infer<typeof messageAttachmentSchema>;

export type CreateMessageInput = z.infer<typeof createMessageSchema>;

export type CreateClientMessageInput = z.infer<
  typeof createClientMessageSchema
>;
