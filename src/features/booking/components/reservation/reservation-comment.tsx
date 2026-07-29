"use client";

import {
  CheckCircle2,
  MessageSquareText,
  Sparkles,
} from "lucide-react";

import { cn } from "@/lib/utils";

type ReservationCommentProps = {
  value: string;
  disabled?: boolean;
  maxLength?: number;
  onChange: (value: string) => void;
};

export function ReservationComment({
  value,
  disabled = false,
  maxLength = 1000,
  onChange,
}: ReservationCommentProps) {
  const characterCount = value.length;

  const remainingCharacters =
    maxLength - characterCount;

  const hasComment =
    value.trim().length > 0;

  const isNearLimit =
    remainingCharacters <= 100;

  return (
    <section
      id="reservation-comment"
      aria-labelledby="reservation-comment-title"
      className="relative overflow-hidden rounded-[2rem] border border-[#EFDEE4] bg-white/95 p-5 shadow-[0_22px_58px_rgba(85,38,55,0.09)] backdrop-blur sm:p-7 lg:p-8"
    >
      <div className="pointer-events-none absolute -right-24 -top-24 size-64 rounded-full bg-[#E8B4C0]/28 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-28 -left-20 size-64 rounded-full bg-[#D6B679]/12 blur-3xl" />

      <div className="relative">
        <header className="flex flex-col gap-5 border-b border-[#F0E1E6] pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-white/40 bg-gradient-to-br from-[#C97992] via-[#B45F7A] to-[#843F59] text-white shadow-[0_12px_28px_rgba(132,63,89,0.24)]">
              <MessageSquareText className="size-5" />
            </span>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#A5526D]">
                Votre rendez-vous
              </p>

              <h2
                id="reservation-comment-title"
                className="mt-2 font-serif text-3xl font-semibold tracking-tight text-[#2F2027] sm:text-4xl"
              >
                Une demande particulière ?
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-[#816D75]">
                Précisez vos envies, votre style,
                les couleurs souhaitées ou toute
                information utile pour préparer votre
                rendez-vous.
              </p>
            </div>
          </div>

          {hasComment ? (
            <span className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full bg-gradient-to-r from-[#B45F7A] to-[#843F59] px-4 py-2 text-xs font-black text-white shadow-[0_8px_20px_rgba(132,63,89,0.22)]">
              <CheckCircle2 className="size-4" />
              Message ajouté
            </span>
          ) : (
            <span className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full border border-[#E8C3CF] bg-[#FFF8FA] px-4 py-2 text-xs font-black text-[#816D75] shadow-sm">
              <Sparkles className="size-4 text-[#A5526D]" />
              Facultatif
            </span>
          )}
        </header>

        <div className="mt-8">
          <label
            htmlFor="reservation-client-comment"
            className="mb-3 block text-sm font-black text-[#49363E]"
          >
            Votre message
          </label>

          <div
            className={cn(
              "relative overflow-hidden rounded-[1.75rem] border bg-white/90 transition duration-300",
              hasComment
                ? "border-[#B45F7A] shadow-[0_16px_38px_rgba(132,63,89,0.11)] ring-1 ring-[#D8AAB9]/35"
                : "border-[#EFDEE4] focus-within:border-[#D8AAB9] focus-within:shadow-[0_16px_38px_rgba(132,63,89,0.10)] focus-within:ring-4 focus-within:ring-[#F9E7ED]",
            )}
          >
            <div className="pointer-events-none absolute -right-12 -top-12 size-36 rounded-full bg-[#E8B4C0]/28 blur-3xl" />

            <textarea
              id="reservation-client-comment"
              name="clientComment"
              value={value}
              onChange={(event) =>
                onChange(event.target.value)
              }
              maxLength={maxLength}
              disabled={disabled}
              rows={7}
              placeholder="Exemple : Je souhaiterais une forme amande, une base nude rosée et une inspiration french fine avec quelques détails dorés…"
              className="relative min-h-44 w-full resize-y bg-transparent px-5 py-5 text-sm leading-7 text-[#49363E] outline-none placeholder:text-[#B7A5AC] disabled:cursor-not-allowed disabled:opacity-60 sm:px-6 sm:py-6"
            />

            <div className="relative flex flex-col gap-3 border-t border-[#F0E1E6] bg-[#FFF9FA]/90 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <p className="text-xs leading-5 text-[#8E747E]">
                Ne transmettez aucune donnée bancaire
                ou information confidentielle.
              </p>

              <span
                className={cn(
                  "shrink-0 rounded-full px-3 py-1.5 text-xs font-black tabular-nums",
                  isNearLimit
                    ? "bg-red-50 text-red-600"
                    : "bg-[#FFF1F5] text-[#A5526D]",
                )}
              >
                {characterCount} / {maxLength}
              </span>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.25rem] border border-[#EFDEE4] bg-gradient-to-br from-white to-[#FFF5F8] p-4 shadow-sm transition hover:border-[#DDBAC5]">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#A68C96]">
                Forme
              </p>

              <p className="mt-2 text-sm font-black text-[#2F2027]">
                Carrée, amande, coffin…
              </p>
            </div>

            <div className="rounded-[1.25rem] border border-[#EFDEE4] bg-gradient-to-br from-white to-[#FFF5F8] p-4 shadow-sm transition hover:border-[#DDBAC5]">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#A68C96]">
                Style
              </p>

              <p className="mt-2 text-sm font-black text-[#2F2027]">
                Nude, french, nail art…
              </p>
            </div>

            <div className="rounded-[1.25rem] border border-[#EFDEE4] bg-gradient-to-br from-white to-[#FFF5F8] p-4 shadow-sm transition hover:border-[#DDBAC5]">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#A68C96]">
                Détails
              </p>

              <p className="mt-2 text-sm font-black text-[#2F2027]">
                Couleurs et inspirations
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}