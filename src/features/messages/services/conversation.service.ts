import "server-only";

import { prisma } from "@/lib/prisma";

import type {
  ConversationDetails,
  ConversationListItem,
  ConversationMessage,
  ConversationParticipantWithUser,
  ConversationSearchFilters,
  ConversationSummary,
  CreateConversationInput,
  CreateConversationResult,
  MarkConversationReadInput,
} from "../types/conversation.types";

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

function normalizeParticipantIds(participantIds: string[]): string[] {
  return [
    ...new Set(
      participantIds
        .map((participantId) => participantId.trim())
        .filter(Boolean),
    ),
  ].sort();
}

function mapParticipant(
  participant: ConversationParticipantWithUser,
): ConversationParticipantWithUser {
  return participant;
}

function mapMessage(message: ConversationMessage): ConversationMessage {
  return message;
}

async function assertUsersExist(participantIds: string[]): Promise<void> {
  const users = await prisma.user.findMany({
    where: {
      id: {
        in: participantIds,
      },
      status: "ACTIVE",
    },
    select: {
      id: true,
    },
  });

  if (users.length !== participantIds.length) {
    throw new Error(
      "Un ou plusieurs participants sont introuvables ou inactifs.",
    );
  }
}

async function findMatchingConversation(input: {
  participantIds: string[];
  appointmentId: string | null;
}) {
  const candidates = await prisma.conversation.findMany({
    where: {
      isClosed: false,
      appointmentId: input.appointmentId,
      participants: {
        every: {
          userId: {
            in: input.participantIds,
          },
        },
      },
    },
    include: {
      participants: {
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
    orderBy: {
      updatedAt: "desc",
    },
    take: 20,
  });

  return (
    candidates.find((conversation) => {
      const candidateParticipantIds = conversation.participants
        .map((participant) => participant.userId)
        .sort();

      return (
        candidateParticipantIds.length === input.participantIds.length &&
        candidateParticipantIds.every(
          (participantId, index) =>
            participantId === input.participantIds[index],
        )
      );
    }) ?? null
  );
}

function mapConversationSummary(
  conversation: Awaited<ReturnType<typeof findMatchingConversation>>,
): ConversationSummary | null {
  if (!conversation) {
    return null;
  }

  return {
    id: conversation.id,
    subject: conversation.subject,
    appointmentId: conversation.appointmentId,
    lastMessageAt: conversation.lastMessageAt,
    isClosed: conversation.isClosed,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
    participants: conversation.participants.map((participant) =>
      mapParticipant(participant),
    ),
    lastMessage:
      conversation.messages[0] === undefined
        ? null
        : mapMessage(conversation.messages[0]),
    unreadCount: 0,
  };
}

export async function createConversation(
  input: CreateConversationInput,
): Promise<CreateConversationResult> {
  const participantIds = normalizeParticipantIds(input.participantIds);

  if (participantIds.length === 0) {
    throw new Error("La conversation doit contenir au moins un participant.");
  }

  await assertUsersExist(participantIds);

  const appointmentId = input.appointmentId?.trim() || null;
  const subject = input.subject?.trim() || null;

  if (appointmentId) {
    const appointment = await prisma.appointment.findUnique({
      where: {
        id: appointmentId,
      },
      select: {
        id: true,
      },
    });

    if (!appointment) {
      throw new Error("Le rendez-vous associé est introuvable.");
    }
  }

  const existingConversation = await findMatchingConversation({
    participantIds,
    appointmentId,
  });

  const existingSummary = mapConversationSummary(existingConversation);

  if (existingSummary) {
    return {
      conversation: existingSummary,
      created: false,
    };
  }

  const conversation = await prisma.conversation.create({
    data: {
      subject,
      appointmentId,
      participants: {
        create: participantIds.map((userId) => ({
          userId,
        })),
      },
    },
    include: {
      participants: {
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
  });

  return {
    conversation: {
      id: conversation.id,
      subject: conversation.subject,
      appointmentId: conversation.appointmentId,
      lastMessageAt: conversation.lastMessageAt,
      isClosed: conversation.isClosed,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
      participants: conversation.participants.map((participant) =>
        mapParticipant(participant),
      ),
      lastMessage:
        conversation.messages[0] === undefined
          ? null
          : mapMessage(conversation.messages[0]),
      unreadCount: 0,
    },
    created: true,
  };
}

export async function getConversationById(
  conversationId: string,
  userId: string,
): Promise<ConversationDetails | null> {
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      participants: {
        some: {
          userId,
        },
      },
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

  if (!conversation) {
    return null;
  }

  return {
    id: conversation.id,
    subject: conversation.subject,
    appointmentId: conversation.appointmentId,
    lastMessageAt: conversation.lastMessageAt,
    isClosed: conversation.isClosed,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
    participants: conversation.participants.map((participant) =>
      mapParticipant(participant),
    ),
    messages: conversation.messages.map((message) => mapMessage(message)),
  };
}

export async function listUserConversations(
  filters: ConversationSearchFilters,
): Promise<ConversationListItem[]> {
  const conversations = await prisma.conversation.findMany({
    where: {
      isClosed: filters.includeClosed ? undefined : false,
      participants: {
        some: {
          userId: filters.userId,
        },
      },
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
        lastMessageAt: "desc",
      },
      {
        createdAt: "desc",
      },
    ],
  });

  const participantStates = await prisma.conversationParticipant.findMany({
    where: {
      userId: filters.userId,
      conversationId: {
        in: conversations.map((conversation) => conversation.id),
      },
    },
    select: {
      conversationId: true,
      lastReadAt: true,
    },
  });

  const participantStateByConversation = new Map(
    participantStates.map((participant) => [
      participant.conversationId,
      participant,
    ]),
  );

  const unreadCounts = await Promise.all(
    conversations.map(async (conversation) => {
      const participantState = participantStateByConversation.get(
        conversation.id,
      );

      const unreadCount = await prisma.message.count({
        where: {
          conversationId: conversation.id,
          deletedAt: null,
          senderId: {
            not: filters.userId,
          },
          createdAt: participantState?.lastReadAt
            ? {
                gt: participantState.lastReadAt,
              }
            : undefined,
        },
      });

      return [conversation.id, unreadCount] as const;
    }),
  );

  const unreadCountByConversation = new Map(unreadCounts);

  return conversations.map((conversation) => ({
    id: conversation.id,
    subject: conversation.subject,
    appointmentId: conversation.appointmentId,
    lastMessageAt: conversation.lastMessageAt,
    isClosed: conversation.isClosed,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
    unreadCount: unreadCountByConversation.get(conversation.id) ?? 0,
    participants: conversation.participants.map((participant) =>
      mapParticipant(participant),
    ),
    lastMessage:
      conversation.messages[0] === undefined
        ? null
        : mapMessage(conversation.messages[0]),
  }));
}

export async function markConversationRead(
  input: MarkConversationReadInput,
): Promise<void> {
  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: {
        conversationId: input.conversationId,
        userId: input.userId,
      },
    },
    select: {
      id: true,
    },
  });

  if (!participant) {
    throw new Error("Vous ne participez pas à cette conversation.");
  }

  await prisma.conversationParticipant.update({
    where: {
      id: participant.id,
    },
    data: {
      lastReadAt: new Date(),
    },
  });
}

export async function setConversationClosed(
  conversationId: string,
  isClosed: boolean,
): Promise<void> {
  const conversation = await prisma.conversation.findUnique({
    where: {
      id: conversationId,
    },
    select: {
      id: true,
    },
  });

  if (!conversation) {
    throw new Error("La conversation est introuvable.");
  }

  await prisma.conversation.update({
    where: {
      id: conversationId,
    },
    data: {
      isClosed,
    },
  });
}

export async function userCanAccessConversation(
  conversationId: string,
  userId: string,
): Promise<boolean> {
  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: {
        conversationId,
        userId,
      },
    },
    select: {
      id: true,
    },
  });

  return participant !== null;
}

export async function getUnreadConversationCount(
  userId: string,
): Promise<number> {
  const participations = await prisma.conversationParticipant.findMany({
    where: {
      userId,
      conversation: {
        isClosed: false,
      },
    },
    select: {
      conversationId: true,
      lastReadAt: true,
    },
  });

  if (participations.length === 0) {
    return 0;
  }

  const unreadStates = await Promise.all(
    participations.map(async (participation) => {
      const unreadMessage = await prisma.message.findFirst({
        where: {
          conversationId: participation.conversationId,
          senderId: {
            not: userId,
          },
          deletedAt: null,
          createdAt: participation.lastReadAt
            ? {
                gt: participation.lastReadAt,
              }
            : undefined,
        },
        select: {
          id: true,
        },
      });

      return unreadMessage !== null;
    }),
  );

  return unreadStates.filter(Boolean).length;
}
