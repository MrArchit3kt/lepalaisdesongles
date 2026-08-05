import type { Metadata } from "next";

import { MessagesPanel } from "@/features/messages/components/messages-panel";
import { loadMessages } from "@/features/messages/services/messages.loader";
import { requireAdminUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Messagerie | Administration",
  description:
    "Consultez et gérez les conversations avec les clientes du salon.",
};

type AdminMessagesPageProps = {
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

export default async function AdminMessagesPage({
  searchParams,
}: AdminMessagesPageProps) {
  const [currentUser, resolvedSearchParams] = await Promise.all([
    requireAdminUser(),
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
      <header className="rounded-[28px] border border-[#241A1D]/10 bg-white px-5 py-6 shadow-sm sm:px-7">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#B8899A]">
              Relation client
            </p>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#241A1D] sm:text-3xl">
              Messagerie
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#75636A]">
              Consultez les échanges avec les clientes, répondez à leurs
              demandes et gérez l’état des conversations.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <div className="rounded-2xl border border-[#241A1D]/10 bg-[#FFF9F8] px-4 py-3 text-right">
              <p className="text-xs font-medium text-[#927E85]">
                Messages non lus
              </p>

              <p className="mt-1 text-2xl font-bold tabular-nums text-[#241A1D]">
                {totalUnreadCount}
              </p>
            </div>

            <div className="rounded-2xl border border-[#241A1D]/10 bg-[#FFF9F8] px-4 py-3 text-right">
              <p className="text-xs font-medium text-[#927E85]">
                Conversations
              </p>

              <p className="mt-1 text-2xl font-bold tabular-nums text-[#241A1D]">
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
        canManageConversation
        conversationQueryKey="conversationId"
        className="h-[calc(100dvh-15rem)] min-h-[680px]"
      />
    </main>
  );
}
