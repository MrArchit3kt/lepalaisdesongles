"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

import type { ConversationMessage } from "../types/conversation.types";
import { MessageBubble } from "./message-bubble";

type Props = {
  messages: ConversationMessage[];
  currentUserId: string;
  loading?: boolean;
  className?: string;
};

export function MessageThread({
  messages,
  currentUserId,
  loading = false,
  className,
}: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages]);

  if (loading) {
    return (
      <div
        className={cn(
          "flex flex-1 flex-col gap-4 overflow-y-auto p-6",
          className,
        )}
      >
        {Array.from({
          length: 8,
        }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "flex",
              index % 2 === 0 ? "justify-start" : "justify-end",
            )}
          >
            <div className="h-20 w-72 animate-pulse rounded-3xl bg-zinc-100" />
          </div>
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-1 items-center justify-center p-10",
          className,
        )}
      >
        <div className="max-w-md text-center">
          <h3 className="text-lg font-semibold text-zinc-900">
            Aucune conversation
          </h3>

          <p className="mt-2 text-sm text-zinc-500">
            Envoyez le premier message pour commencer cette discussion.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-1 flex-col overflow-y-auto p-6", className)}>
      <div className="flex flex-col gap-4">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            currentUserId={currentUserId}
          />
        ))}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
