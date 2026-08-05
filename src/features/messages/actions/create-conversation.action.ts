"use server";

import type { CreateConversationActionState } from "./create-conversation-action-state";

import { revalidatePath } from "next/cache";

import { createClientConversationSchema } from "@/features/messages/schemas/create-conversation.schema";
import { createConversation } from "@/features/messages/services/conversation.service";
import { sendMessage } from "@/features/messages/services/message.service";
import { prisma } from "@/lib/prisma";
import { requireClientUser } from "@/lib/session";

function getFormDataString(formData: FormData, key: string): string {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Une erreur inattendue est survenue pendant la création de la conversation.";
}

async function findSalonRecipientId(): Promise<string> {
  const owner = await prisma.user.findFirst({
    where: {
      status: "ACTIVE",
      staffProfile: {
        is: {
          isActive: true,
          isOwner: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
    select: {
      id: true,
    },
  });

  if (owner) {
    return owner.id;
  }

  const admin = await prisma.user.findFirst({
    where: {
      status: "ACTIVE",
      role: {
        in: ["SUPER_ADMIN", "ADMIN"],
      },
    },
    orderBy: {
      createdAt: "asc",
    },
    select: {
      id: true,
    },
  });

  if (!admin) {
    throw new Error(
      "Aucun membre du salon n’est actuellement disponible pour recevoir votre message.",
    );
  }

  return admin.id;
}

async function validateAppointmentAccess(input: {
  appointmentId: string | null;
  clientId: string;
}): Promise<void> {
  if (!input.appointmentId) {
    return;
  }

  const appointment = await prisma.appointment.findFirst({
    where: {
      id: input.appointmentId,
      clientId: input.clientId,
    },
    select: {
      id: true,
    },
  });

  if (!appointment) {
    throw new Error(
      "Le rendez-vous sélectionné est introuvable ou ne vous appartient pas.",
    );
  }
}

export async function createConversationAction(
  _previousState: CreateConversationActionState,
  formData: FormData,
): Promise<CreateConversationActionState> {
  const currentUser = await requireClientUser();

  const parsedInput = createClientConversationSchema.safeParse({
    subject: getFormDataString(formData, "subject"),
    appointmentId: getFormDataString(formData, "appointmentId"),
    initialMessage: getFormDataString(formData, "initialMessage"),
  });

  if (!parsedInput.success) {
    const flattenedErrors = parsedInput.error.flatten();

    return {
      status: "error",
      message: "La conversation contient des informations invalides.",
      fieldErrors: {
        subject: flattenedErrors.fieldErrors.subject,
        appointmentId: flattenedErrors.fieldErrors.appointmentId,
        initialMessage: flattenedErrors.fieldErrors.initialMessage,
      },
    };
  }

  try {
    await validateAppointmentAccess({
      appointmentId: parsedInput.data.appointmentId,
      clientId: currentUser.id,
    });

    const salonRecipientId = await findSalonRecipientId();

    const result = await createConversation({
      participantIds: [currentUser.id, salonRecipientId],
      subject: parsedInput.data.subject,
      appointmentId: parsedInput.data.appointmentId,
    });

    if (result.created) {
      await sendMessage({
        conversationId: result.conversation.id,
        senderId: currentUser.id,
        content: parsedInput.data.initialMessage,
        type: "TEXT",
        attachments: [],
      });
    } else if (result.conversation.lastMessage === null) {
      await sendMessage({
        conversationId: result.conversation.id,
        senderId: currentUser.id,
        content: parsedInput.data.initialMessage,
        type: "TEXT",
        attachments: [],
      });
    }

    revalidatePath("/espace-client/messages");
    revalidatePath("/admin/messages");
    revalidatePath("/espace-client/notifications");
    revalidatePath("/admin/dashboard");

    return {
      status: "success",
      message: result.created
        ? "Votre conversation a bien été créée."
        : "Une conversation existe déjà avec le salon.",
      conversationId: result.conversation.id,
    };
  } catch (error) {
    return {
      status: "error",
      message: getErrorMessage(error),
    };
  }
}
