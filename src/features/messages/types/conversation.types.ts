import type {
  Conversation,
  ConversationParticipant,
  Message,
  MessageAttachment,
  MessageType,
  User,
} from "@/generated/prisma/client";

export type ConversationParticipantUser = Pick<
  User,
  "id" | "firstName" | "lastName" | "email" | "image" | "role" | "status"
>;

export type ConversationParticipantWithUser = ConversationParticipant & {
  user: ConversationParticipantUser;
};

export type MessageAttachmentItem = MessageAttachment;

export type ConversationMessage = Message & {
  sender: ConversationParticipantUser | null;
  attachments: MessageAttachmentItem[];
};

export type ConversationSummary = Conversation & {
  participants: ConversationParticipantWithUser[];
  lastMessage: ConversationMessage | null;
  unreadCount: number;
};

export type ConversationDetails = Conversation & {
  participants: ConversationParticipantWithUser[];
  messages: ConversationMessage[];
};

export type CreateConversationInput = {
  participantIds: string[];
  subject?: string | null;
  appointmentId?: string | null;
};

export type SendMessageAttachmentInput = {
  url: string;
  fileName?: string | null;
  mimeType?: string | null;
  sizeBytes?: number | null;
};

export type SendMessageInput = {
  conversationId: string;
  senderId: string;
  content: string;
  type?: MessageType;
  attachments?: SendMessageAttachmentInput[];
};

export type ConversationListItem = {
  id: string;
  subject: string | null;
  isClosed: boolean;
  lastMessageAt: Date | null;
  unreadCount: number;
  participants: ConversationParticipantWithUser[];
  lastMessage: ConversationMessage | null;
};

export type ConversationSearchFilters = {
  userId: string;
  includeClosed?: boolean;
};

export type MarkConversationReadInput = {
  conversationId: string;
  userId: string;
};

export type CreateConversationResult = {
  conversation: ConversationSummary;
  created: boolean;
};

export type SendMessageResult = {
  message: ConversationMessage;
  conversationId: string;
};

export type ConversationSidebarItem = {
  id: string;
  title: string;
  subtitle: string | null;
  avatarUrl: string | null;
  unreadCount: number;
  lastMessageAt: Date | null;
};
