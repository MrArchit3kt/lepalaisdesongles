import type { Metadata } from "next";

import { MessagesPanel } from "@/features/messages/components/messages-panel";
import { loadMessages } from "@/features/messages/services/messages.loader";
import { requireClientUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mes messages | Le Palais des Ongles",
  description: "Consultez vos échanges avec le salon et envoyez vos messages.",
};

type ClientMessagesPageProps = {
  searchParams: Promise<{
    conversationId?: string | string[];
  }>;
};

function getConversationId(
  value: string | string[] | undefined,
): string | null {
  if (typeof value === "string") {
    const normalizedValue = value.trim();

    return normalizedValue.length > 0 ? normalizedValue : null;
  }

  if (Array.isArray(value)) {
    const firstValue = value[0]?.trim();

    return firstValue ? firstValue : null;
  }

  return null;
}

export default async function ClientMessagesPage({
  searchParams,
}: ClientMessagesPageProps) {
  const [currentUser, resolvedSearchParams] = await Promise.all([
    requireClientUser(),
    searchParams,
  ]);

  const requestedConversationId = getConversationId(
    resolvedSearchParams.conversationId,
  );

  const { conversations, selectedConversation, totalUnreadCount } =
    await loadMessages({
      userId: currentUser.id,
      selectedConversationId: requestedConversationId,
      includeClosed: true,
    });

  return (
    <main className="min-w-0 space-y-6">
      <header className="rounded-[28px] border border-[#35242B]/10 bg-white px-5 py-6 shadow-sm sm:px-7">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#A44E69]">
              Espace cliente
            </p>

            <h1 className="mt-2 font-serif text-2xl font-semibold tracking-tight text-[#35242B] sm:text-3xl">
              Mes messages
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#79636C]">
              Retrouvez ici vos échanges avec le salon et envoyez les
              informations utiles concernant vos rendez-vous.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <div className="rounded-2xl border border-[#35242B]/10 bg-[#FFFAFB] px-4 py-3 text-right">
              <p className="text-xs font-medium text-[#8C747D]">
                Messages non lus
              </p>

              <p className="mt-1 text-2xl font-bold tabular-nums text-[#35242B]">
                {totalUnreadCount}
              </p>
            </div>

            <div className="rounded-2xl border border-[#35242B]/10 bg-[#FFFAFB] px-4 py-3 text-right">
              <p className="text-xs font-medium text-[#8C747D]">
                Conversations
              </p>

              <p className="mt-1 text-2xl font-bold tabular-nums text-[#35242B]">
                {conversations.length}
              </p>
            </div>
          </div>
        </div>
      </header>

      <MessagesPanel
        conversations={conversations}
        selectedConversation={selectedConversation}
        currentUserId={currentUser.id}
        allowImageUploads
        canCreateConversation
        canManageConversation={false}
        conversationQueryKey="conversationId"
        className="h-[calc(100dvh-15rem)] min-h-[680px]"
      />
    </main>
  );
}
