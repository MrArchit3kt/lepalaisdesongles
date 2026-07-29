"use client";

import { useState, useTransition } from "react";

import {
  Ban,
  CircleX,
  LoaderCircle,
  RefreshCcw,
  RotateCcw,
  WalletCards,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import type { GiftCardStatus } from "@/generated/prisma/client";

type Redemption = {
  id: string;
  amountCents: number;
  createdAt: string;
  reversedAt: string | null;
};

type Mutation =
  | {
      action: "REDEEM";
      amountCents: number;
      note?: string;
    }
  | {
      action: "REVERSE_REDEMPTION";
      transactionId: string;
      reason: string;
    }
  | {
      action: "CANCEL" | "REVOKE" | "REACTIVATE";
      reason: string;
    };

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function AdminGiftCardActions({
  reference,
  status,
  balanceCents,
  redemptions,
}: {
  reference: string;
  status: GiftCardStatus;
  balanceCents: number;
  redemptions: Redemption[];
}) {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();

  const [amount, setAmount] = useState("");

  const [note, setNote] = useState("");

  const [reason, setReason] = useState("");

  const [selectedRedemption, setSelectedRedemption] = useState<string | null>(
    null,
  );

  const [reversalReason, setReversalReason] = useState("");

  const canRedeem =
    (status === "ACTIVE" || status === "PARTIALLY_USED") && balanceCents > 0;

  const canCancel = [
    "PENDING_PAYMENT",
    "PAYMENT_FAILED",
    "ACTIVE",
    "PARTIALLY_USED",
  ].includes(status);

  const canRevoke = ["ACTIVE", "PARTIALLY_USED", "USED"].includes(status);

  const canReactivate = status === "CANCELLED" || status === "REVOKED";

  function run(mutation: Mutation): void {
    if (isPending) {
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch(
          `/api/admin/gift-cards/${encodeURIComponent(reference)}/actions`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify(mutation),
          },
        );

        const payload = (await response.json()) as {
          success?: boolean;
          message?: string;
          error?: string;
        };

        if (!response.ok || payload.success !== true) {
          throw new Error(payload.error ?? "Opération impossible.");
        }

        toast.success(payload.message ?? "Opération effectuée.");

        setAmount("");
        setNote("");
        setReason("");
        setSelectedRedemption(null);
        setReversalReason("");

        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Opération impossible.",
        );
      }
    });
  }

  function redeem(): void {
    const euros = Number(amount.replace(",", ".").trim());

    const amountCents = Math.round(euros * 100);

    if (!Number.isFinite(euros) || amountCents <= 0) {
      toast.error("Saisissez un montant supérieur à 0 €.");
      return;
    }

    if (amountCents > balanceCents) {
      toast.error("Le montant dépasse le solde disponible.");
      return;
    }

    run({
      action: "REDEEM",
      amountCents,
      note: note.trim() || undefined,
    });
  }

  function statusAction(action: "CANCEL" | "REVOKE" | "REACTIVATE"): void {
    if (reason.trim().length < 5) {
      toast.error("Le motif doit contenir au moins 5 caractères.");
      return;
    }

    run({
      action,
      reason: reason.trim(),
    });
  }

  function reverse(): void {
    if (!selectedRedemption) {
      return;
    }

    if (reversalReason.trim().length < 5) {
      toast.error("Le motif doit contenir au moins 5 caractères.");
      return;
    }

    run({
      action: "REVERSE_REDEMPTION",
      transactionId: selectedRedemption,
      reason: reversalReason.trim(),
    });
  }

  return (
    <section className="rounded-[2rem] border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
      <header className="flex items-center gap-3 border-b border-zinc-100 pb-4">
        <span className="grid size-10 place-items-center rounded-xl bg-rose-50 text-rose-600">
          <WalletCards className="size-5" />
        </span>

        <div>
          <h2 className="font-black text-zinc-950">Actions administratives</h2>
          <p className="mt-1 text-xs text-zinc-500">
            Solde : {formatCurrency(balanceCents)}
          </p>
        </div>
      </header>

      {canRedeem ? (
        <div className="mt-5 space-y-3 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4">
          <h3 className="font-black text-emerald-950">Débiter en magasin</h3>

          <input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="Montant, ex. 25,00"
            disabled={isPending}
            className="h-11 w-full rounded-xl border border-emerald-200 bg-white px-3 text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-100"
          />

          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Note facultative"
            maxLength={500}
            disabled={isPending}
            className="min-h-20 w-full resize-y rounded-xl border border-emerald-200 bg-white p-3 text-sm outline-none focus:ring-4 focus:ring-emerald-100"
          />

          <button
            type="button"
            onClick={redeem}
            disabled={isPending}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-black text-white disabled:opacity-50"
          >
            {isPending ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <WalletCards className="size-4" />
            )}
            Enregistrer le débit
          </button>
        </div>
      ) : null}

      {redemptions.length > 0 ? (
        <div className="mt-5 space-y-3">
          <h3 className="text-sm font-black text-zinc-950">
            Débits enregistrés
          </h3>

          {redemptions.map((redemption) => (
            <article
              key={redemption.id}
              className="rounded-2xl border border-zinc-200 p-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-black text-zinc-900">
                    {formatCurrency(redemption.amountCents)}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {formatDate(redemption.createdAt)}
                  </p>
                </div>

                {redemption.reversedAt ? (
                  <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-black uppercase text-orange-700">
                    Annulé
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedRedemption(
                        selectedRedemption === redemption.id
                          ? null
                          : redemption.id,
                      )
                    }
                    disabled={isPending}
                    className="inline-flex h-9 items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-3 text-xs font-black text-orange-700"
                  >
                    <RotateCcw className="size-3.5" />
                    Annuler
                  </button>
                )}
              </div>

              {selectedRedemption === redemption.id ? (
                <div className="mt-3 space-y-2 border-t border-zinc-100 pt-3">
                  <textarea
                    value={reversalReason}
                    onChange={(event) => setReversalReason(event.target.value)}
                    placeholder="Motif obligatoire"
                    maxLength={500}
                    disabled={isPending}
                    className="min-h-20 w-full resize-y rounded-xl border border-orange-200 p-3 text-sm outline-none focus:ring-4 focus:ring-orange-100"
                  />

                  <button
                    type="button"
                    onClick={reverse}
                    disabled={isPending}
                    className="h-10 w-full rounded-xl bg-orange-600 px-4 text-sm font-black text-white disabled:opacity-50"
                  >
                    Confirmer l’annulation
                  </button>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      ) : null}

      {canCancel || canRevoke || canReactivate ? (
        <div className="mt-5 space-y-3 border-t border-zinc-100 pt-5">
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Motif obligatoire, minimum 5 caractères"
            maxLength={500}
            disabled={isPending}
            className="min-h-20 w-full resize-y rounded-xl border border-zinc-200 p-3 text-sm outline-none focus:border-rose-300 focus:ring-4 focus:ring-rose-100"
          />

          {canReactivate ? (
            <button
              type="button"
              onClick={() => statusAction("REACTIVATE")}
              disabled={isPending}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-black text-white disabled:opacity-50"
            >
              <RefreshCcw className="size-4" />
              Réactiver
            </button>
          ) : null}

          {canCancel ? (
            <button
              type="button"
              onClick={() => statusAction("CANCEL")}
              disabled={isPending}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 text-sm font-black text-orange-700 disabled:opacity-50"
            >
              <CircleX className="size-4" />
              Annuler la carte
            </button>
          ) : null}

          {canRevoke ? (
            <button
              type="button"
              onClick={() => statusAction("REVOKE")}
              disabled={isPending}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-black text-white disabled:opacity-50"
            >
              <Ban className="size-4" />
              Révoquer la carte
            </button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
