"use client";

import {
  ArrowLeft,
  Lock,
  MessageCircle,
  MoreHorizontal,
  RefreshCw,
  Unlock,
  UserRound,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  closeConversationAction,
  markConversationReadAction,
  reopenConversationAction,
} from "@/features/messages/actions/conversation.actions";
import type {
  ConversationDetails,
  ConversationListItem,
} from "@/features/messages/types/conversation.types";
import { cn } from "@/lib/utils";

import { ConversationList } from "./conversation-list";
import { CreateClientConversation } from "./create-client-conversation";
import { MessageInput } from "./message-input";
import { MessageThread } from "./message-thread";

export type MessagesPanelProps = {
  conversations: ConversationListItem[];
  selectedConversation: ConversationDetails | null;
  currentUserId: string;
  allowImageUploads?: boolean;
  canCreateConversation?: boolean;
  canManageConversation?: boolean;
  className?: string;
  conversationQueryKey?: string;
};

function getUserDisplayName(user: {
  firstName: string | null;
  lastName: string | null;
  email: string;
}): string {
  const fullName = [user.firstName, user.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || user.email;
}

function getConversationTitle(
  conversation: ConversationDetails | null,
  currentUserId: string,
): string {
  if (!conversation) {
    return "Messagerie";
  }

  if (conversation.subject?.trim()) {
    return conversation.subject.trim();
  }

  const otherParticipants = conversation.participants.filter(
    (participant) => participant.userId !== currentUserId,
  );

  if (otherParticipants.length === 0) {
    return "Conversation";
  }

  return otherParticipants
    .map((participant) => getUserDisplayName(participant.user))
    .join(", ");
}

function getConversationSubtitle(
  conversation: ConversationDetails | null,
  currentUserId: string,
): string {
  if (!conversation) {
    return "Sélectionnez une conversation";
  }

  const otherParticipants = conversation.participants.filter(
    (participant) => participant.userId !== currentUserId,
  );

  if (otherParticipants.length === 0) {
    return "Conversation privée";
  }

  if (otherParticipants.length === 1) {
    return getUserDisplayName(otherParticipants[0].user);
  }

  return `${otherParticipants.length} participants`;
}

export function MessagesPanel({
  conversations,
  selectedConversation,
  currentUserId,
  allowImageUploads = false,
  canCreateConversation = false,
  canManageConversation = false,
  className,
  conversationQueryKey = "conversationId",
}: MessagesPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isNavigating, startNavigationTransition] = useTransition();
  const [isManaging, startManagementTransition] = useTransition();
  const [mobileConversationOpen, setMobileConversationOpen] = useState(
    Boolean(selectedConversation),
  );
  const [menuOpen, setMenuOpen] = useState(false);

  const selectedConversationId = selectedConversation?.id ?? null;

  const conversationTitle = useMemo(
    () => getConversationTitle(selectedConversation, currentUserId),
    [currentUserId, selectedConversation],
  );

  const conversationSubtitle = useMemo(
    () => getConversationSubtitle(selectedConversation, currentUserId),
    [currentUserId, selectedConversation],
  );

  const buildConversationUrl = useCallback(
    (conversationId: string | null): string => {
      const params = new URLSearchParams(searchParams.toString());

      if (conversationId) {
        params.set(conversationQueryKey, conversationId);
      } else {
        params.delete(conversationQueryKey);
      }

      const query = params.toString();

      return query ? `${pathname}?${query}` : pathname;
    },
    [conversationQueryKey, pathname, searchParams],
  );

  const handleSelectConversation = useCallback(
    (conversationId: string) => {
      if (conversationId === selectedConversationId && selectedConversation) {
        setMobileConversationOpen(true);
        return;
      }

      setMobileConversationOpen(true);

      startNavigationTransition(() => {
        router.push(buildConversationUrl(conversationId));
      });

      void markConversationReadAction(conversationId).then((result) => {
        if (result.status === "error") {
          toast.error(result.message);
          return;
        }

        router.refresh();
      });
    },
    [
      buildConversationUrl,
      router,
      selectedConversation,
      selectedConversationId,
    ],
  );

  const handleBackToList = useCallback(() => {
    setMobileConversationOpen(false);
    setMenuOpen(false);
  }, []);

  const handleRefresh = useCallback(() => {
    startNavigationTransition(() => {
      router.refresh();
    });
  }, [router]);

  const handleMessageSent = useCallback(() => {
    startNavigationTransition(() => {
      router.refresh();
    });
  }, [router]);

  const handleToggleConversationStatus = useCallback(() => {
    if (!selectedConversation || !canManageConversation) {
      return;
    }

    const conversationId = selectedConversation.id;
    const shouldReopen = selectedConversation.isClosed;

    setMenuOpen(false);

    startManagementTransition(async () => {
      const result = shouldReopen
        ? await reopenConversationAction(conversationId)
        : await closeConversationAction(conversationId);

      if (result.status === "error") {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      router.refresh();
    });
  }, [canManageConversation, router, selectedConversation]);

  return (
    <section
      className={cn(
        "grid min-h-[680px] overflow-hidden rounded-[28px] border border-zinc-200 bg-zinc-50 shadow-sm",
        "lg:grid-cols-[360px_minmax(0,1fr)]",
        className,
      )}
    >
      <aside
        className={cn(
          "min-h-0 bg-white",
          mobileConversationOpen ? "hidden lg:block" : "block",
        )}
      >
        <ConversationList
          conversations={conversations}
          selectedConversationId={selectedConversationId}
          onSelectConversation={handleSelectConversation}
          loading={isNavigating && !selectedConversation}
        />
      </aside>

      <div
        className={cn(
          "min-h-0 min-w-0",
          mobileConversationOpen ? "flex" : "hidden lg:flex",
          "flex-col bg-white",
        )}
      >
        {selectedConversation ? (
          <>
            <header className="relative flex min-h-20 shrink-0 items-center justify-between gap-3 border-b border-zinc-200 bg-white px-4 py-3 sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  onClick={handleBackToList}
                  className="inline-flex size-10 shrink-0 items-center justify-center rounded-full text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 lg:hidden"
                  aria-label="Retour aux conversations"
                >
                  <ArrowLeft className="size-5" aria-hidden="true" />
                </button>

                <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-pink-50 text-pink-700">
                  <UserRound className="size-5" aria-hidden="true" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="truncate font-serif font-semibold text-[#35242B]">
                      {conversationTitle}
                    </h2>

                    {selectedConversation.isClosed ? (
                      <span className="hidden items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-700 sm:inline-flex">
                        <Lock className="size-3" aria-hidden="true" />
                        Fermée
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-0.5 truncate text-xs text-zinc-500 sm:text-sm">
                    {conversationSubtitle}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={isNavigating}
                  className="inline-flex size-10 items-center justify-center rounded-full text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 disabled:pointer-events-none disabled:opacity-50"
                  aria-label="Actualiser la conversation"
                >
                  <RefreshCw
                    className={cn("size-4", isNavigating && "animate-spin")}
                    aria-hidden="true"
                  />
                </button>

                {canManageConversation ? (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setMenuOpen((current) => !current)}
                      disabled={isManaging}
                      className="inline-flex size-10 items-center justify-center rounded-full text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 disabled:pointer-events-none disabled:opacity-50"
                      aria-label="Actions de la conversation"
                      aria-expanded={menuOpen}
                    >
                      <MoreHorizontal className="size-5" aria-hidden="true" />
                    </button>

                    {menuOpen ? (
                      <>
                        <button
                          type="button"
                          className="fixed inset-0 z-20 cursor-default"
                          onClick={() => setMenuOpen(false)}
                          aria-label="Fermer le menu"
                        />

                        <div className="absolute right-0 top-12 z-30 w-56 rounded-2xl border border-zinc-200 bg-white p-2 shadow-xl">
                          <button
                            type="button"
                            onClick={handleToggleConversationStatus}
                            disabled={isManaging}
                            className={cn(
                              "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition",
                              selectedConversation.isClosed
                                ? "text-emerald-700 hover:bg-emerald-50"
                                : "text-amber-700 hover:bg-amber-50",
                            )}
                          >
                            {selectedConversation.isClosed ? (
                              <Unlock className="size-4" aria-hidden="true" />
                            ) : (
                              <Lock className="size-4" aria-hidden="true" />
                            )}

                            {selectedConversation.isClosed
                              ? "Rouvrir la conversation"
                              : "Fermer la conversation"}
                          </button>
                        </div>
                      </>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </header>

            <MessageThread
              messages={selectedConversation.messages}
              currentUserId={currentUserId}
              loading={isNavigating}
              className="min-h-0 bg-zinc-50/70"
            />

            <MessageInput
              key={selectedConversation.id}
              conversationId={selectedConversation.id}
              isConversationClosed={selectedConversation.isClosed}
              allowImageUploads={allowImageUploads}
              disabled={isNavigating || isManaging}
              autoFocus
              onMessageSent={handleMessageSent}
            />
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center p-8">
            <div className="max-w-md text-center">
              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#FFF0F4] text-[#A64D69]">
                <MessageCircle className="size-8" aria-hidden="true" />
              </div>

              <h2 className="mt-5 font-serif text-xl font-semibold text-[#35242B]">
                Votre messagerie
              </h2>

              <p className="mt-2 text-sm leading-6 text-zinc-500">
                {conversations.length > 0
                  ? "Sélectionnez une conversation dans la liste pour afficher les messages."
                  : "Vous n’avez encore aucune conversation."}
              </p>

              {conversations.length > 0 ? (
                <Button
                  type="button"
                  variant="outline"
                  className="mt-5 lg:hidden"
                  onClick={handleBackToList}
                >
                  Voir les conversations
                </Button>
              ) : canCreateConversation ? (
                <CreateClientConversation className="mt-6" />
              ) : null}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
