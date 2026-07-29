"use client";

import {
  BadgeCheck,
  Building2,
  Check,
  CreditCard,
  LockKeyhole,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  WalletCards,
} from "lucide-react";

import { cn } from "@/lib/utils";

import type {
  ReservationSummary,
} from "./reservation.types";

type ReservationPaymentProps = {
  summary: ReservationSummary;
  disabled?: boolean;
};

function formatPrice(cents: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

export function ReservationPayment({
  summary,
  disabled = false,
}: ReservationPaymentProps) {
  const hasOnlinePayment =
    summary.depositCents > 0;

  const paymentLabel = summary.isFullPayment
    ? "Paiement intégral"
    : "Acompte de réservation";

  return (
    <section
      id="reservation-payment"
      aria-labelledby="reservation-payment-title"
      className={cn(
        "relative overflow-hidden rounded-[2rem] border border-[#EFDEE4] bg-white/95 p-5 shadow-[0_22px_58px_rgba(85,38,55,0.09)] backdrop-blur sm:p-7 lg:p-8",
        disabled && "opacity-70",
      )}
    >
      <div className="pointer-events-none absolute -right-24 -top-24 size-64 rounded-full bg-[#E8B4C0]/28 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-28 -left-20 size-64 rounded-full bg-[#D6B679]/12 blur-3xl" />

      <div className="relative">
        <header className="flex flex-col gap-5 border-b border-[#F0E1E6] pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-white/40 bg-gradient-to-br from-[#C97992] via-[#B45F7A] to-[#843F59] text-white shadow-[0_12px_28px_rgba(132,63,89,0.24)]">
              <WalletCards className="size-5" />
            </span>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#A5526D]">
                Étape 4
              </p>

              <h2
                id="reservation-payment-title"
                className="mt-2 font-serif text-3xl font-semibold tracking-tight text-[#2F2027] sm:text-4xl"
              >
                Paiement de la réservation
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-[#816D75]">
                Vérifiez le montant demandé pour
                confirmer votre rendez-vous. Le reste
                éventuel sera réglé directement au salon.
              </p>
            </div>
          </div>

          <span className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full border border-[#E8C3CF] bg-[#FFF8FA] px-4 py-2 text-xs font-black text-[#816D75] shadow-sm">
            <ShieldCheck className="size-4 text-[#A5526D]" />
            Paiement sécurisé
          </span>
        </header>

        {hasOnlinePayment ? (
          <div className="mt-8 space-y-5">
            <div className="relative overflow-hidden rounded-[1.75rem] border border-[#E5C5CF] bg-gradient-to-br from-white via-[#FFF6F8] to-[#F8E8ED] p-5 shadow-[0_18px_44px_rgba(132,63,89,0.10)] sm:p-6">
              <div className="pointer-events-none absolute -right-16 -top-16 size-44 rounded-full bg-[#E8B4C0]/38 blur-3xl" />

              <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-4">
                  <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#B45F7A] to-[#843F59] text-white shadow-[0_12px_28px_rgba(132,63,89,0.22)]">
                    <CreditCard className="size-5" />
                  </span>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.17em] text-[#A5526D]">
                        À régler maintenant
                      </p>

                      <span className="inline-flex items-center gap-1 rounded-full border border-[#E9CED7] bg-white/90 px-2.5 py-1 text-[0.65rem] font-black text-[#843F59] shadow-sm">
                        <Check className="size-3" />
                        Obligatoire
                      </span>
                    </div>

                    <h3 className="mt-2 font-serif text-2xl font-semibold text-[#2F2027]">
                      {paymentLabel}
                    </h3>

                    <p className="mt-2 max-w-lg text-sm leading-6 text-[#816D75]">
                      {summary.isFullPayment
                        ? "Le montant total de vos prestations est demandé pour valider définitivement ce rendez-vous."
                        : "Cet acompte permet de bloquer définitivement votre créneau dans l’agenda du salon."}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 rounded-[1.35rem] border border-[#E8CFD7] bg-white/90 px-5 py-4 text-right shadow-[0_10px_26px_rgba(85,38,55,0.07)] backdrop-blur">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#A68C96]">
                    Montant
                  </p>

                  <p className="mt-1 font-serif text-3xl font-semibold text-[#843F59]">
                    {formatPrice(summary.depositCents)}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.5rem] border border-[#EFDEE4] bg-gradient-to-br from-white to-[#FFF7F9] p-5 shadow-[0_12px_30px_rgba(85,38,55,0.05)]">
                <div className="flex items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-[#EDD5DD] bg-[#FFF0F4] text-[#A5526D]">
                    <ReceiptText className="size-4.5" />
                  </span>

                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#A68C96]">
                      Total des prestations
                    </p>

                    <p className="mt-2 font-serif text-2xl font-semibold text-[#2F2027]">
                      {formatPrice(
                        summary.totalPriceCents,
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-[#EFDEE4] bg-gradient-to-br from-white to-[#FFF7F9] p-5 shadow-[0_12px_30px_rgba(85,38,55,0.05)]">
                <div className="flex items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-[#EDD5DD] bg-[#FFF0F4] text-[#A5526D]">
                    <Building2 className="size-4.5" />
                  </span>

                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#A68C96]">
                      Reste à régler au salon
                    </p>

                    <p className="mt-2 font-serif text-2xl font-semibold text-[#2F2027]">
                      {formatPrice(
                        summary.remainingCents,
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[1.5rem] border border-[#5A3A47] bg-gradient-to-br from-[#3A2730] via-[#2F2027] to-[#24191F] p-5 text-white shadow-[0_18px_44px_rgba(47,32,39,0.20)] sm:p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/10 text-[#E8B4C0] ring-1 ring-white/15">
                    <LockKeyhole className="size-5" />
                  </span>

                  <div>
                    <p className="font-black">
                      Transaction protégée
                    </p>

                    <p className="mt-1 max-w-xl text-sm leading-6 text-white/65">
                      Les informations bancaires sont
                      saisies sur l’interface sécurisée
                      du prestataire de paiement et ne
                      sont jamais enregistrées par le
                      salon.
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2 rounded-full border border-[#D6B679]/30 bg-white/[0.08] px-4 py-2 text-xs font-black text-white/85">
                  <BadgeCheck className="size-4 text-[#D6B679]" />
                  Paiement vérifié
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1.25rem] border border-[#EFDEE4] bg-gradient-to-br from-white to-[#FFF5F8] p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[#DDBAC5]">
                <ShieldCheck className="size-5 text-[#A5526D]" />

                <p className="mt-3 text-sm font-black text-[#2F2027]">
                  Paiement sécurisé
                </p>

                <p className="mt-1 text-xs leading-5 text-[#816D75]">
                  Données protégées lors de la
                  transaction.
                </p>
              </div>

              <div className="rounded-[1.25rem] border border-[#EFDEE4] bg-gradient-to-br from-white to-[#FFF5F8] p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[#DDBAC5]">
                <CreditCard className="size-5 text-[#A5526D]" />

                <p className="mt-3 text-sm font-black text-[#2F2027]">
                  Confirmation immédiate
                </p>

                <p className="mt-1 text-xs leading-5 text-[#816D75]">
                  Votre créneau est validé après le
                  paiement.
                </p>
              </div>

              <div className="rounded-[1.25rem] border border-[#EFDEE4] bg-gradient-to-br from-white to-[#FFF5F8] p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[#DDBAC5]">
                <ReceiptText className="size-5 text-[#A5526D]" />

                <p className="mt-3 text-sm font-black text-[#2F2027]">
                  Montants transparents
                </p>

                <p className="mt-1 text-xs leading-5 text-[#816D75]">
                  Aucun frais caché pendant la
                  réservation.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-8">
            <div className="relative overflow-hidden rounded-[1.75rem] border border-[#D9E8DD] bg-gradient-to-br from-white via-[#F8FCF9] to-[#EEF7F1] px-6 py-10 text-center shadow-[0_18px_44px_rgba(60,100,72,0.08)]">
              <div className="pointer-events-none absolute -right-16 -top-16 size-44 rounded-full bg-[#C9E8D1]/45 blur-3xl" />

              <span className="relative mx-auto grid size-16 place-items-center rounded-2xl border border-[#D6E8DB] bg-white text-[#4B8A60] shadow-[0_12px_30px_rgba(60,100,72,0.10)]">
                <Check className="size-7" />
              </span>

              <p className="relative mt-5 text-[10px] font-black uppercase tracking-[0.18em] text-[#5D8D6C]">
                Aucun paiement en ligne
              </p>

              <h3 className="relative mt-2 font-serif text-3xl font-semibold text-[#2F2027]">
                Réservez sans acompte
              </h3>

              <p className="relative mx-auto mt-3 max-w-lg text-sm leading-7 text-[#6F7E73]">
                Aucun montant ne vous sera demandé lors
                de la validation. Le règlement sera
                effectué directement au salon le jour
                du rendez-vous.
              </p>

              <div className="relative mx-auto mt-6 flex max-w-sm items-center justify-between gap-4 rounded-[1.35rem] border border-[#D8E8DC] bg-white/90 px-5 py-4 shadow-[0_10px_28px_rgba(60,100,72,0.07)]">
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#809486]">
                    À régler au salon
                  </p>

                  <p className="mt-1 text-sm text-[#6F7E73]">
                    Montant total
                  </p>
                </div>

                <p className="font-serif text-3xl font-semibold text-[#4B8A60]">
                  {formatPrice(
                    summary.totalPriceCents,
                  )}
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-start gap-3 rounded-[1.25rem] border border-[#EFDEE4] bg-[#FFF9FA] p-4 shadow-sm">
              <Sparkles className="mt-0.5 size-4 shrink-0 text-[#A5526D]" />

              <p className="text-xs leading-5 text-[#816D75]">
                Votre demande sera enregistrée dès la
                validation finale. Le salon pourra
                ensuite confirmer ou refuser le
                rendez-vous selon ses disponibilités.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}