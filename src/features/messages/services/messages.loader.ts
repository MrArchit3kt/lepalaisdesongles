import type {
  ConversationDetails,
  ConversationListItem,
} from "@/features/messages/types/conversation.types";
import { prisma } from "@/lib/prisma";

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

export type MessagesLoaderInput = {
  userId: string;
  selectedConversationId?: string | null;
  includeClosed?: boolean;
};

export type MessagesLoaderResult = {
  conversations: ConversationListItem[];
  selectedConversation: ConversationDetails | null;
  selectedConversationId: string | null;
  totalUnreadCount: number;
};

function normalizeConversationId(
  conversationId?: string | null,
): string | null {
  if (!conversationId) {
    return null;
  }

  const normalizedId = conversationId.trim();

  return normalizedId.length > 0 ? normalizedId : null;
}

async function getConversationList({
  userId,
  includeClosed,
}: {
  userId: string;
  includeClosed: boolean;
}): Promise<ConversationListItem[]> {
  const conversations = await prisma.conversation.findMany({
    where: {
      participants: {
        some: {
          userId,
        },
      },

      ...(includeClosed
        ? {}
        : {
            isClosed: false,
          }),
    },

    include: {
      participants: {
        orderBy: {
          joinedAt: "asc",
        },

        include: {
          user: {
            select: participantUserSelect,
          },
        },
      },

      messages: {
        where: {
          deletedAt: null,
        },

        orderBy: {
          createdAt: "desc",
        },

        take: 1,

        include: messageInclude,
      },
    },

    orderBy: [
      {
        lastMessageAt: {
          sort: "desc",
          nulls: "last",
        },
      },
      {
        updatedAt: "desc",
      },
    ],
  });

  if (conversations.length === 0) {
    return [];
  }

  const participantRows = await prisma.conversationParticipant.findMany({
    where: {
      userId,

      conversationId: {
        in: conversations.map((conversation) => conversation.id),
      },
    },

    select: {
      conversationId: true,
      lastReadAt: true,
      joinedAt: true,
    },
  });

  const participantByConversationId = new Map(
    participantRows.map((participant) => [
      participant.conversationId,
      participant,
    ]),
  );

  const unreadCounts = await Promise.all(
    conversations.map(async (conversation) => {
      const participant = participantByConversationId.get(conversation.id);

      if (!participant) {
        return [conversation.id, 0] as const;
      }

      const unreadCount = await prisma.message.count({
        where: {
          conversationId: conversation.id,

          deletedAt: null,

          senderId: {
            not: userId,
          },

          createdAt: {
            gt: participant.lastReadAt ?? participant.joinedAt,
          },
        },
      });

      return [conversation.id, unreadCount] as const;
    }),
  );

  const unreadCountByConversationId = new Map(unreadCounts);

  return conversations.map((conversation): ConversationListItem => ({
    id: conversation.id,

    subject: conversation.subject,

    lastMessageAt: conversation.lastMessageAt,

    isClosed: conversation.isClosed,

    participants: conversation.participants,

    lastMessage: conversation.messages[0] ?? null,

    unreadCount: unreadCountByConversationId.get(conversation.id) ?? 0,
  }));
}

async function getConversationDetails({
  conversationId,
  userId,
  includeClosed,
}: {
  conversationId: string;
  userId: string;
  includeClosed: boolean;
}): Promise<ConversationDetails | null> {
  return prisma.conversation.findFirst({
    where: {
      id: conversationId,

      participants: {
        some: {
          userId,
        },
      },

      ...(includeClosed
        ? {}
        : {
            isClosed: false,
          }),
    },

    include: {
      participants: {
        orderBy: {
          joinedAt: "asc",
        },

        include: {
          user: {
            select: participantUserSelect,
          },
        },
      },

      messages: {
        where: {
          deletedAt: null,
        },

        orderBy: {
          createdAt: "asc",
        },

        include: messageInclude,
      },
    },
  });
}

export async function loadMessages({
  userId,
  selectedConversationId,
  includeClosed = true,
}: MessagesLoaderInput): Promise<MessagesLoaderResult> {
  const normalizedUserId = userId.trim();

  if (!normalizedUserId) {
    throw new Error("L’utilisateur connecté est invalide.");
  }

  const conversations = await getConversationList({
    userId: normalizedUserId,

    includeClosed,
  });

  const requestedConversationId = normalizeConversationId(
    selectedConversationId,
  );

  const requestedConversationIsAvailable = requestedConversationId
    ? conversations.some(
        (conversation) => conversation.id === requestedConversationId,
      )
    : false;

  const resolvedConversationId = requestedConversationIsAvailable
    ? requestedConversationId
    : (conversations[0]?.id ?? null);

  const selectedConversation = resolvedConversationId
    ? await getConversationDetails({
        conversationId: resolvedConversationId,

        userId: normalizedUserId,

        includeClosed,
      })
    : null;

  const totalUnreadCount = conversations.reduce(
    (total, conversation) => total + conversation.unreadCount,
    0,
  );

  return {
    conversations,
    selectedConversation,
    selectedConversationId: selectedConversation?.id ?? null,
    totalUnreadCount,
  };
}

export async function loadConversationForUser({
  conversationId,
  userId,
  includeClosed = true,
}: {
  conversationId: string;
  userId: string;
  includeClosed?: boolean;
}): Promise<ConversationDetails | null> {
  const normalizedConversationId = normalizeConversationId(conversationId);

  const normalizedUserId = userId.trim();

  if (!normalizedConversationId || !normalizedUserId) {
    return null;
  }

  return getConversationDetails({
    conversationId: normalizedConversationId,

    userId: normalizedUserId,

    includeClosed,
  });
}
