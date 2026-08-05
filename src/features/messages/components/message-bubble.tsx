"use client";

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Check, Paperclip, Pencil } from "lucide-react";

import { cn } from "@/lib/utils";

import type { ConversationMessage } from "../types/conversation.types";

type Props = {
  message: ConversationMessage;
  currentUserId: string;
};

export function MessageBubble({ message, currentUserId }: Props) {
  const isMine = message.senderId === currentUserId;

  const senderName = message.sender
    ? [message.sender.firstName, message.sender.lastName]
        .filter(Boolean)
        .join(" ")
    : "Salon";

  return (
    <div
      className={cn("flex w-full", isMine ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-3xl px-4 py-3 shadow-sm",
          isMine
            ? "bg-pink-600 text-white"
            : "border border-zinc-200 bg-white text-zinc-900",
        )}
      >
        {!isMine && (
          <div className="mb-2 text-xs font-semibold text-pink-600">
            {senderName}
          </div>
        )}

        {message.content ? (
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
            {message.content}
          </p>
        ) : (
          <p
            className={cn(
              "text-sm italic",
              isMine ? "text-pink-100" : "text-zinc-400",
            )}
          >
            Message supprimé
          </p>
        )}

        {message.attachments.length > 0 && (
          <div className="mt-3 space-y-2">
            {message.attachments.map((attachment) => (
              <a
                key={attachment.id}
                href={attachment.url}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  "flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition",
                  isMine
                    ? "bg-pink-500 hover:bg-pink-400"
                    : "bg-zinc-100 hover:bg-zinc-200",
                )}
              >
                <Paperclip className="h-4 w-4" />

                <span className="truncate">
                  {attachment.fileName ?? "Pièce jointe"}
                </span>
              </a>
            ))}
          </div>
        )}

        <div
          className={cn(
            "mt-3 flex items-center justify-end gap-2 text-[11px]",
            isMine ? "text-pink-100" : "text-zinc-400",
          )}
        >
          {message.isEdited && (
            <span className="flex items-center gap-1">
              <Pencil className="h-3 w-3" />
              Modifié
            </span>
          )}

          <span>
            {format(new Date(message.createdAt), "HH:mm", {
              locale: fr,
            })}
          </span>

          {isMine && <Check className="h-3.5 w-3.5" />}
        </div>
      </div>
    </div>
  );
}
