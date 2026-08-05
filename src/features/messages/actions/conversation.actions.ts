"use server";

import { revalidatePath } from "next/cache";

import {
  closeConversationSchema,
  markConversationReadSchema,
} from "@/features/messages/schemas/create-conversation.schema";
import {
  markConversationRead,
  setConversationClosed,
  userCanAccessConversation,
} from "@/features/messages/services/conversation.service";
import { requireAuthenticatedUser } from "@/lib/session";

export type ConversationActionState = {
  status: "success" | "error";
  message: string;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Une erreur inattendue est survenue.";
}

function revalidateConversationPages(): void {
  revalidatePath("/espace-client/messages");
  revalidatePath("/admin/messages");
  revalidatePath("/admin/dashboard");
  revalidatePath("/espace-client/notifications");
}

export async function markConversationReadAction(
  conversationId: string,
): Promise<ConversationActionState> {
  const currentUser = await requireAuthenticatedUser();

  const parsed = markConversationReadSchema.safeParse({
    conversationId,
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Conversation invalide.",
    };
  }

  try {
    await markConversationRead({
      conversationId: parsed.data.conversationId,
      userId: currentUser.id,
    });

    revalidateConversationPages();

    return {
      status: "success",
      message: "Conversation marquée comme lue.",
    };
  } catch (error) {
    return {
      status: "error",
      message: getErrorMessage(error),
    };
  }
}

export async function closeConversationAction(
  conversationId: string,
): Promise<ConversationActionState> {
  const currentUser = await requireAuthenticatedUser();

  const parsed = closeConversationSchema.safeParse({
    conversationId,
    isClosed: true,
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Conversation invalide.",
    };
  }

  try {
    const canAccess = await userCanAccessConversation(
      parsed.data.conversationId,
      currentUser.id,
    );

    if (!canAccess) {
      return {
        status: "error",
        message: "Vous n'avez pas accès à cette conversation.",
      };
    }

    await setConversationClosed(parsed.data.conversationId, true);

    revalidateConversationPages();

    return {
      status: "success",
      message: "Conversation fermée.",
    };
  } catch (error) {
    return {
      status: "error",
      message: getErrorMessage(error),
    };
  }
}

export async function reopenConversationAction(
  conversationId: string,
): Promise<ConversationActionState> {
  const currentUser = await requireAuthenticatedUser();

  const parsed = closeConversationSchema.safeParse({
    conversationId,
    isClosed: false,
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Conversation invalide.",
    };
  }

  try {
    const canAccess = await userCanAccessConversation(
      parsed.data.conversationId,
      currentUser.id,
    );

    if (!canAccess) {
      return {
        status: "error",
        message: "Vous n'avez pas accès à cette conversation.",
      };
    }

    await setConversationClosed(parsed.data.conversationId, false);

    revalidateConversationPages();

    return {
      status: "success",
      message: "Conversation rouverte.",
    };
  } catch (error) {
    return {
      status: "error",
      message: getErrorMessage(error),
    };
  }
}
