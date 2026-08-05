"use server";

import type { SendMessageActionState } from "./send-message-action-state";

import { revalidatePath } from "next/cache";

import {
  createClientMessageSchema,
  type MessageAttachmentInput,
} from "@/features/messages/schemas/create-message.schema";
import { sendMessage } from "@/features/messages/services/message.service";
import { requireAuthenticatedUser } from "@/lib/session";

function getFormDataString(formData: FormData, key: string): string {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function parseAttachments(rawValue: string): MessageAttachmentInput[] {
  if (!rawValue.trim()) {
    return [];
  }

  try {
    const parsedValue: unknown = JSON.parse(rawValue);

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue.filter(
      (attachment): attachment is MessageAttachmentInput => {
        if (typeof attachment !== "object" || attachment === null) {
          return false;
        }

        const candidate = attachment as Record<string, unknown>;

        return typeof candidate.url === "string";
      },
    );
  } catch {
    return [];
  }
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Une erreur inattendue est survenue pendant l’envoi du message.";
}

export async function sendMessageAction(
  _previousState: SendMessageActionState,
  formData: FormData,
): Promise<SendMessageActionState> {
  const currentUser = await requireAuthenticatedUser();

  const rawAttachments = getFormDataString(formData, "attachments");

  const parsedInput = createClientMessageSchema.safeParse({
    conversationId: getFormDataString(formData, "conversationId"),
    content: getFormDataString(formData, "content"),
    type: getFormDataString(formData, "type") || "TEXT",
    attachments: parseAttachments(rawAttachments),
  });

  if (!parsedInput.success) {
    const flattenedErrors = parsedInput.error.flatten();

    return {
      status: "error",
      message: "Le message contient des informations invalides.",
      fieldErrors: {
        conversationId: flattenedErrors.fieldErrors.conversationId,
        content: flattenedErrors.fieldErrors.content,
        type: flattenedErrors.fieldErrors.type,
        attachments: flattenedErrors.fieldErrors.attachments,
      },
    };
  }

  try {
    const result = await sendMessage({
      conversationId: parsedInput.data.conversationId,
      senderId: currentUser.id,
      content: parsedInput.data.content,
      type: parsedInput.data.type,
      attachments: parsedInput.data.attachments,
    });

    revalidatePath("/espace-client/messages");
    revalidatePath("/admin/messages");
    revalidatePath("/espace-client/notifications");
    revalidatePath("/admin/dashboard");

    return {
      status: "success",
      message: "Votre message a bien été envoyé.",
      conversationId: result.conversationId,
      messageId: result.message.id,
    };
  } catch (error) {
    return {
      status: "error",
      message: getErrorMessage(error),
    };
  }
}
