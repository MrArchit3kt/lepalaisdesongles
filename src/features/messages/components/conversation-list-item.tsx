"use client";

import { formatDistanceToNowStrict } from "date-fns";
import { fr } from "date-fns/locale";
import { Lock, MessageCircle } from "lucide-react";

import { cn } from "@/lib/utils";

import type { ConversationListItem } from "../types/conversation.types";

type Props = {
  conversation: ConversationListItem;
  active?: boolean;
  onSelect?: (conversationId: string) => void;
};

function getConversationTitle(conversation: ConversationListItem) {
  if (conversation.subject && conversation.subject.trim().length > 0) {
    return conversation.subject;
  }

  return "Conversation";
}

function getLastMessage(conversation: ConversationListItem) {
  if (!conversation.lastMessage) {
    return "Aucun message";
  }

  if (
    conversation.lastMessage.content &&
    conversation.lastMessage.content.trim().length > 0
  ) {
    return conversation.lastMessage.content;
  }

  if (conversation.lastMessage.attachments.length === 1) {
    return "📎 Pièce jointe";
  }

  if (conversation.lastMessage.attachments.length > 1) {
    return `📎 ${conversation.lastMessage.attachments.length} pièces jointes`;
  }

  return "Message";
}

export function ConversationListItem({
  conversation,
  active = false,
  onSelect,
}: Props) {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(conversation.id)}
      className={cn(
        "group flex w-full flex-col rounded-2xl border p-4 text-left transition-all",
        active
          ? "border-pink-500 bg-pink-50 shadow-sm"
          : "border-zinc-200 bg-white hover:border-pink-300 hover:bg-pink-50/50",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-zinc-900">
            {getConversationTitle(conversation)}
          </h3>

          <p className="mt-1 truncate text-sm text-zinc-500">
            {getLastMessage(conversation)}
          </p>
        </div>

        {conversation.unreadCount > 0 ? (
          <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-pink-600 px-2 text-xs font-bold text-white">
            {conversation.unreadCount}
          </span>
        ) : null}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-3.5 w-3.5" />

          <span>
            {conversation.lastMessageAt
              ? formatDistanceToNowStrict(
                  new Date(conversation.lastMessageAt),
                  {
                    locale: fr,
                    addSuffix: true,
                  },
                )
              : "Aucun échange"}
          </span>
        </div>

        {conversation.isClosed ? (
          <div className="flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-1">
            <Lock className="h-3 w-3" />
            Fermée
          </div>
        ) : null}
      </div>
    </button>
  );
}
