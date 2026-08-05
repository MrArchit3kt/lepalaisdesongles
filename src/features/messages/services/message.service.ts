import "server-only";

import { prisma } from "@/lib/prisma";

import type {
  ConversationMessage,
  SendMessageInput,
  SendMessageResult,
} from "../types/conversation.types";
import { userCanAccessConversation } from "./conversation.service";

const participantUserSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  image: true,
  role: true,
  status: true,
} as const;

const messageInclude = {
  sender: {
    select: participantUserSelect,
  },
  attachments: {
    orderBy: {
      createdAt: "asc" as const,
    },
  },
} as const;

function normalizeMessageContent(content: string): string | null {
  const normalizedContent = content.trim();

  return normalizedContent.length > 0 ? normalizedContent : null;
}

function getNotificationMessage(
  content: string | null,
  attachmentCount: number,
): string {
  if (content) {
    return content.length > 120 ? `${content.slice(0, 117)}...` : content;
  }

  if (attachmentCount === 1) {
    return "Vous avez reçu une pièce jointe.";
  }

  return `Vous avez reçu ${attachmentCount} pièces jointes.`;
}

async function assertConversationCanReceiveMessage(
  conversationId: string,
): Promise<void> {
  const conversation = await prisma.conversation.findUnique({
    where: {
      id: conversationId,
    },
    select: {
      id: true,
      isClosed: true,
    },
  });

  if (!conversation) {
    throw new Error("La conversation est introuvable.");
  }

  if (conversation.isClosed) {
    throw new Error("Cette conversation est fermée.");
  }
}

async function createMessageNotifications(input: {
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string | null;
  attachmentCount: number;
}): Promise<void> {
  const recipients = await prisma.conversationParticipant.findMany({
    where: {
      conversationId: input.conversationId,
      userId: {
        not: input.senderId,
      },
      user: {
        status: "ACTIVE",
      },
    },
    select: {
      userId: true,
    },
  });

  if (recipients.length === 0) {
    return;
  }

  const notificationMessage = getNotificationMessage(
    input.content,
    input.attachmentCount,
  );

  await prisma.notification.createMany({
    data: recipients.map((recipient) => ({
      userId: recipient.userId,
      type: "MESSAGE_RECEIVED",
      title: `Nouveau message de ${input.senderName}`,
      message: notificationMessage,
      actionUrl: `/espace-client/messages?conversation=${input.conversationId}`,
      metadata: {
        conversationId: input.conversationId,
        senderId: input.senderId,
      },
    })),
  });
}

export async function sendMessage(
  input: SendMessageInput,
): Promise<SendMessageResult> {
  const conversationId = input.conversationId.trim();
  const senderId = input.senderId.trim();
  const content = normalizeMessageContent(input.content);
  const attachments = input.attachments ?? [];

  if (!conversationId) {
    throw new Error("La conversation est obligatoire.");
  }

  if (!senderId) {
    throw new Error("L’expéditeur est obligatoire.");
  }

  if (!content && attachments.length === 0) {
    throw new Error("Écrivez un message ou ajoutez une pièce jointe.");
  }

  const canAccess = await userCanAccessConversation(conversationId, senderId);

  if (!canAccess) {
    throw new Error("Vous ne pouvez pas accéder à cette conversation.");
  }

  await assertConversationCanReceiveMessage(conversationId);

  const sender = await prisma.user.findFirst({
    where: {
      id: senderId,
      status: "ACTIVE",
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
    },
  });

  if (!sender) {
    throw new Error("L’expéditeur est introuvable ou inactif.");
  }

  const message = await prisma.$transaction(async (transaction) => {
    const createdMessage = await transaction.message.create({
      data: {
        conversationId,
        senderId,
        type: input.type ?? "TEXT",
        content,
        attachments:
          attachments.length > 0
            ? {
                create: attachments.map((attachment) => ({
                  url: attachment.url,
                  fileName: attachment.fileName ?? null,
                  mimeType: attachment.mimeType ?? null,
                  sizeBytes: attachment.sizeBytes ?? null,
                })),
              }
            : undefined,
      },
      include: messageInclude,
    });

    await transaction.conversation.update({
      where: {
        id: conversationId,
      },
      data: {
        lastMessageAt: createdMessage.createdAt,
      },
    });

    await transaction.conversationParticipant.update({
      where: {
        conversationId_userId: {
          conversationId,
          userId: senderId,
        },
      },
      data: {
        lastReadAt: createdMessage.createdAt,
      },
    });

    return createdMessage;
  });

  const senderName = `${sender.firstName} ${sender.lastName}`.trim();

  await createMessageNotifications({
    conversationId,
    senderId,
    senderName: senderName || "Le salon",
    content,
    attachmentCount: attachments.length,
  });

  return {
    message: message as ConversationMessage,
    conversationId,
  };
}

export async function getConversationMessages(
  conversationId: string,
  userId: string,
  options?: {
    limit?: number;
    before?: Date | null;
  },
): Promise<ConversationMessage[]> {
  const canAccess = await userCanAccessConversation(conversationId, userId);

  if (!canAccess) {
    throw new Error("Vous ne pouvez pas accéder à cette conversation.");
  }

  const limit = Math.min(Math.max(options?.limit ?? 50, 1), 100);

  const messages = await prisma.message.findMany({
    where: {
      conversationId,
      deletedAt: null,
      createdAt: options?.before
        ? {
            lt: options.before,
          }
        : undefined,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
    include: messageInclude,
  });

  return messages.reverse() as ConversationMessage[];
}

export async function deleteMessage(
  messageId: string,
  userId: string,
): Promise<void> {
  const message = await prisma.message.findFirst({
    where: {
      id: messageId,
      senderId: userId,
      deletedAt: null,
    },
    select: {
      id: true,
      conversationId: true,
    },
  });

  if (!message) {
    throw new Error("Le message est introuvable ou ne peut pas être supprimé.");
  }

  await prisma.message.update({
    where: {
      id: message.id,
    },
    data: {
      content: null,
      deletedAt: new Date(),
    },
  });

  const latestMessage = await prisma.message.findFirst({
    where: {
      conversationId: message.conversationId,
      deletedAt: null,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      createdAt: true,
    },
  });

  await prisma.conversation.update({
    where: {
      id: message.conversationId,
    },
    data: {
      lastMessageAt: latestMessage?.createdAt ?? null,
    },
  });
}

export async function editMessage(
  messageId: string,
  userId: string,
  content: string,
): Promise<ConversationMessage> {
  const normalizedContent = normalizeMessageContent(content);

  if (!normalizedContent) {
    throw new Error("Le message ne peut pas être vide.");
  }

  const existingMessage = await prisma.message.findFirst({
    where: {
      id: messageId,
      senderId: userId,
      deletedAt: null,
      type: "TEXT",
    },
    select: {
      id: true,
    },
  });

  if (!existingMessage) {
    throw new Error("Le message est introuvable ou ne peut pas être modifié.");
  }

  const message = await prisma.message.update({
    where: {
      id: existingMessage.id,
    },
    data: {
      content: normalizedContent,
      isEdited: true,
      editedAt: new Date(),
    },
    include: messageInclude,
  });

  return message as ConversationMessage;
}
