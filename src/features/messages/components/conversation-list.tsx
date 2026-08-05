"use client";

import { Search } from "lucide-react";
import { type ChangeEvent, useMemo, useState } from "react";

import type { ConversationListItem as ConversationItem } from "../types/conversation.types";
import { ConversationListItem } from "./conversation-list-item";

type Props = {
  conversations: ConversationItem[];
  selectedConversationId?: string | null;
  onSelectConversation?: (conversationId: string) => void;
  loading?: boolean;
};

export function ConversationList({
  conversations,
  selectedConversationId,
  onSelectConversation,
  loading = false,
}: Props) {
  const [search, setSearch] = useState("");

  const filteredConversations = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return conversations;
    }

    return conversations.filter((conversation) => {
      const subject = conversation.subject?.toLowerCase() ?? "";

      const lastMessage =
        conversation.lastMessage?.content?.toLowerCase() ?? "";

      const participantNames = conversation.participants
        .map((participant) =>
          `${participant.user.firstName} ${participant.user.lastName}`.toLowerCase(),
        )
        .join(" ");

      return (
        subject.includes(query) ||
        lastMessage.includes(query) ||
        participantNames.includes(query)
      );
    });
  }, [conversations, search]);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-200 p-5">
        <h2 className="font-serif text-lg font-semibold text-[#35242B]">Conversations</h2>

        <div className="relative mt-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

          <input
            type="text"
            value={search}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              setSearch(event.target.value);
            }}
            placeholder="Rechercher..."
            className="h-11 w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-4 text-sm text-zinc-900 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-200"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="space-y-3 p-4">
          {loading ? (
            <div className="space-y-3">
              {Array.from({
                length: 6,
              }).map((_, index) => (
                <div
                  key={index}
                  className="h-28 animate-pulse rounded-2xl bg-zinc-100"
                />
              ))}
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="py-16 text-center text-sm text-zinc-500">
              Aucune conversation.
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <ConversationListItem
                key={conversation.id}
                conversation={conversation}
                active={conversation.id === selectedConversationId}
                onSelect={onSelectConversation}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
