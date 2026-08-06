"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { BadgePercent, LoaderCircle, X } from "lucide-react";

type Props = {
  reference: string;
  appliedPromotionName: string | null;
  discountCents: number;
};

type PromotionCodeResponse = {
  success?: boolean;
  error?: string;
  fullyCovered?: boolean;
};

function formatEuros(cents: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

export function PromotionCodeForm({
  reference,
  appliedPromotionName,
  discountCents,
}: Props) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isApplied = Boolean(appliedPromotionName);

  function handleApply(): void {
    const trimmedCode = code.trim();

    if (!trimmedCode || isPending) {
      return;
    }

    setError(null);

    startTransition(async () => {
      try {
        const response = await fetch(
          `/api/appointments/${encodeURIComponent(reference)}/promotion`,
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },

            body: JSON.stringify({ code: trimmedCode }),
          },
        );

        const payload = (await response.json()) as PromotionCodeResponse;

        if (!response.ok || payload.success !== true) {
          throw new Error(payload.error ?? "Impossible d’appliquer ce code.");
        }

        setCode("");

        if (payload.fullyCovered) {
          router.push(`/reservation/confirmation/${reference}`);

          return;
        }

        router.refresh();
      } catch (reason) {
        setError(
          reason instanceof Error
            ? reason.message
            : "Impossible d’appliquer ce code.",
        );
      }
    });
  }

  function handleRemove(): void {
    if (isPending) {
      return;
    }

    setError(null);

    startTransition(async () => {
      try {
        const response = await fetch(
          `/api/appointments/${encodeURIComponent(reference)}/promotion`,
          {
            method: "DELETE",

            headers: { Accept: "application/json" },
          },
        );

        const payload = (await response.json()) as PromotionCodeResponse;

        if (!response.ok || payload.success !== true) {
          throw new Error(
            payload.error ?? "Impossible de retirer ce code.",
          );
        }

        router.refresh();
      } catch (reason) {
        setError(
          reason instanceof Error
            ? reason.message
            : "Impossible de retirer ce code.",
        );
      }
    });
  }

  return (
    <div className="rounded-[1.25rem] border border-[#EFDEE4] bg-gradient-to-br from-white to-[#FFF7F9] p-4 shadow-[0_10px_28px_rgba(85,38,55,0.05)]">
      <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.15em] text-[#A68C96]">
        <BadgePercent className="size-4 text-[#A5526D]" />
        Code promo
      </p>

      {isApplied ? (
        <div className="mt-3 flex items-center justify-between gap-3 rounded-[1rem] border border-emerald-200 bg-emerald-50 px-4 py-3">
          <span className="text-sm font-bold text-emerald-800">
            {appliedPromotionName}
            {discountCents > 0 ? (
              <span className="ml-2 font-black">
                -{formatEuros(discountCents)}
              </span>
            ) : null}
          </span>

          <button
            type="button"
            onClick={handleRemove}
            disabled={isPending}
            aria-label="Retirer le code promo"
            className="grid size-8 shrink-0 place-items-center rounded-full text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
          >
            {isPending ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <X className="size-4" />
            )}
          </button>
        </div>
      ) : (
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleApply();
              }
            }}
            placeholder="Votre code"
            maxLength={64}
            disabled={isPending}
            className="h-11 min-w-0 flex-1 rounded-full border border-[#EFDEE4] bg-white px-4 text-sm font-bold uppercase tracking-wide text-[#2F2027] outline-none transition placeholder:font-normal placeholder:normal-case placeholder:text-[#B79FA8] focus:border-[#DDBAC5] focus:ring-4 focus:ring-[#F8E8ED] disabled:opacity-60"
          />

          <button
            type="button"
            onClick={handleApply}
            disabled={isPending || !code.trim()}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-[#843F59] px-5 text-sm font-black text-white shadow-sm transition hover:bg-[#6f3349] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : null}
            Appliquer
          </button>
        </div>
      )}

      {error ? (
        <p className="mt-2 text-xs font-bold text-rose-600">{error}</p>
      ) : null}
    </div>
  );
}
