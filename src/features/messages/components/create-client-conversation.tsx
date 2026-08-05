"use client";

import { MessageCirclePlus, Send, X } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { createConversationAction } from "@/features/messages/actions/create-conversation.action";
import { initialCreateConversationActionState } from "@/features/messages/actions/create-conversation-action-state";

import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type CreateClientConversationProps = {
  className?: string;
};

/* -------------------------------------------------------------------------- */
/*                                 COMPONENT                                  */
/* -------------------------------------------------------------------------- */

export function CreateClientConversation({
  className,
}: CreateClientConversationProps) {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);

  const [state, formAction, pending] = useActionState(
    createConversationAction,
    initialCreateConversationActionState,
  );

  useEffect(() => {
    if (state.status !== "success" || !state.conversationId) {
      return;
    }

    toast.success(state.message);

    router.push(
      `/espace-client/messages?conversationId=${encodeURIComponent(
        state.conversationId,
      )}`,
    );

    router.refresh();
  }, [router, state]);

  useEffect(() => {
    if (state.status === "error") {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-2xl",
          "bg-gradient-to-r from-[#B45F7A] to-[#843F59]",
          "px-5 py-3 text-sm font-bold text-white",
          "shadow-[0_10px_24px_rgba(132,63,89,0.22)]",
          "transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(132,63,89,0.28)]",
          className,
        )}
      >
        <MessageCirclePlus className="size-5" aria-hidden="true" />
        Nouvelle conversation
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Fermer la fenêtre"
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-[#2F2027]/55 backdrop-blur-sm"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-conversation-title"
            className="relative z-10 w-full max-w-xl overflow-hidden rounded-[28px] border border-[#EFDDE3] bg-white shadow-2xl"
          >
            <header className="flex items-start justify-between gap-4 border-b border-[#F1E2E7] bg-[#FFF8FA] px-6 py-5">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#B45F7A]">
                  Contacter le salon
                </p>

                <h2
                  id="new-conversation-title"
                  className="mt-1 font-serif text-xl font-semibold text-[#2F2027]"
                >
                  Nouvelle conversation
                </h2>

                <p className="mt-1 text-sm leading-6 text-[#806C74]">
                  Votre message sera directement envoyé à l’équipe du salon.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={pending}
                aria-label="Fermer"
                className="grid size-10 shrink-0 place-items-center rounded-full text-[#8E747E] transition hover:bg-white hover:text-[#843F59] disabled:opacity-50"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </header>

            <form action={formAction} className="space-y-5 p-6">
              <div>
                <label
                  htmlFor="conversation-subject"
                  className="mb-2 block text-sm font-bold text-[#45353C]"
                >
                  Sujet
                  <span className="ml-1 font-normal text-[#9A858D]">
                    (facultatif)
                  </span>
                </label>

                <input
                  id="conversation-subject"
                  name="subject"
                  type="text"
                  maxLength={150}
                  disabled={pending}
                  placeholder="Ex. Question concernant mon rendez-vous"
                  className="h-12 w-full rounded-2xl border border-[#E8DADF] bg-white px-4 text-sm text-[#2F2027] outline-none transition placeholder:text-[#AE9DA4] focus:border-[#B45F7A] focus:ring-4 focus:ring-[#B45F7A]/10 disabled:opacity-60"
                />

                {state.fieldErrors?.subject?.[0] ? (
                  <p className="mt-2 text-sm font-medium text-red-600">
                    {state.fieldErrors.subject[0]}
                  </p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="conversation-initial-message"
                  className="mb-2 block text-sm font-bold text-[#45353C]"
                >
                  Votre message
                </label>

                <textarea
                  id="conversation-initial-message"
                  name="initialMessage"
                  rows={7}
                  maxLength={4_000}
                  required
                  disabled={pending}
                  placeholder="Écrivez votre demande au salon…"
                  className="w-full resize-none rounded-2xl border border-[#E8DADF] bg-white px-4 py-3 text-sm leading-6 text-[#2F2027] outline-none transition placeholder:text-[#AE9DA4] focus:border-[#B45F7A] focus:ring-4 focus:ring-[#B45F7A]/10 disabled:opacity-60"
                />

                {state.fieldErrors?.initialMessage?.[0] ? (
                  <p className="mt-2 text-sm font-medium text-red-600">
                    {state.fieldErrors.initialMessage[0]}
                  </p>
                ) : null}
              </div>

              <input type="hidden" name="appointmentId" value="" />

              <div className="flex flex-col-reverse gap-3 border-t border-[#F1E2E7] pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={pending}
                  className="inline-flex h-12 items-center justify-center rounded-2xl border border-[#E5D6DB] bg-white px-5 text-sm font-bold text-[#705D65] transition hover:bg-[#FFF8FA] disabled:opacity-50"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  disabled={pending}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#B45F7A] to-[#843F59] px-6 text-sm font-bold text-white shadow-[0_10px_22px_rgba(132,63,89,0.22)] transition hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60"
                >
                  <Send className="size-4" aria-hidden="true" />

                  {pending ? "Envoi en cours…" : "Envoyer au salon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
