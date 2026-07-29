"use client";

import {
  AlertCircle,
  CalendarCheck2,
  Check,
  CheckCircle2,
  Circle,
  CreditCard,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { cn } from "@/lib/utils";

import type {
  ReservationSummary,
} from "./reservation.types";

type ReservationConfirmProps = {
  summary: ReservationSummary;
  selectedServiceCount: number;
  hasSelectedStaff: boolean;
  hasSelectedDate: boolean;
  hasSelectedSlot: boolean;
  acceptedTerms: boolean;
  submitting?: boolean;
  disabled?: boolean;
  error?: string | null;
  onAcceptedTermsChange: (
    accepted: boolean,
  ) => void;
  onConfirm: () => void;
};

type ValidationItem = {
  id: string;
  label: string;
  description: string;
  completed: boolean;
};

function formatPrice(cents: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

export function ReservationConfirm({
  summary,
  selectedServiceCount,
  hasSelectedStaff,
  hasSelectedDate,
  hasSelectedSlot,
  acceptedTerms,
  submitting = false,
  disabled = false,
  error = null,
  onAcceptedTermsChange,
  onConfirm,
}: ReservationConfirmProps) {
  const hasSelectedServices =
    selectedServiceCount > 0;

  const validationItems: ValidationItem[] = [
    {
      id: "services",
      label: "Prestations sélectionnées",
      description: hasSelectedServices
        ? `${selectedServiceCount} prestation${
            selectedServiceCount > 1 ? "s" : ""
          } ajoutée${
            selectedServiceCount > 1 ? "s" : ""
          }`
        : "Choisissez au moins une prestation",
      completed: hasSelectedServices,
    },
    {
      id: "staff",
      label: "Professionnelle choisie",
      description: hasSelectedStaff
        ? "Votre préférence est enregistrée"
        : "Sélectionnez une professionnelle",
      completed: hasSelectedStaff,
    },
    {
      id: "date",
      label: "Date sélectionnée",
      description: hasSelectedDate
        ? "La journée du rendez-vous est définie"
        : "Choisissez une date",
      completed: hasSelectedDate,
    },
    {
      id: "slot",
      label: "Créneau réservé",
      description: hasSelectedSlot
        ? "L’horaire est prêt à être confirmé"
        : "Sélectionnez un horaire disponible",
      completed: hasSelectedSlot,
    },
  ];

  const completedItemCount =
    validationItems.filter(
      (item) => item.completed,
    ).length;

  const reservationIsComplete =
    validationItems.every(
      (item) => item.completed,
    );

  const requiresOnlinePayment =
    summary.depositCents > 0;

  const confirmDisabled =
    disabled ||
    submitting ||
    !reservationIsComplete ||
    !acceptedTerms;

  const confirmationLabel =
    requiresOnlinePayment
      ? summary.isFullPayment
        ? `Payer ${formatPrice(
            summary.depositCents,
          )} et confirmer`
        : `Payer l’acompte de ${formatPrice(
            summary.depositCents,
          )}`
      : "Confirmer ma demande";

  return (
    <section
      id="reservation-confirm"
      aria-labelledby="reservation-confirm-title"
      className="relative overflow-hidden rounded-[2rem] border border-[#EFDEE4] bg-white/95 p-5 shadow-[0_22px_58px_rgba(85,38,55,0.09)] backdrop-blur sm:p-7 lg:p-8"
    >
      <div className="pointer-events-none absolute -right-24 -top-24 size-64 rounded-full bg-[#E8B4C0]/28 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-28 -left-20 size-64 rounded-full bg-[#D6B679]/12 blur-3xl" />

      <div className="relative">
        <header className="flex flex-col gap-5 border-b border-[#F0E1E6] pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-white/40 bg-gradient-to-br from-[#C97992] via-[#B45F7A] to-[#843F59] text-white shadow-[0_12px_28px_rgba(132,63,89,0.24)]">
              <CalendarCheck2 className="size-5" />
            </span>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#A5526D]">
                Étape 4
              </p>

              <h2
                id="reservation-confirm-title"
                className="mt-2 font-serif text-3xl font-semibold tracking-tight text-[#2F2027] sm:text-4xl"
              >
                Confirmez votre rendez-vous
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-[#816D75]">
                Vérifiez que tous les éléments sont
                renseignés, puis validez votre demande
                de réservation.
              </p>
            </div>
          </div>

          <span
            className={cn(
              "inline-flex w-fit shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-black shadow-sm",
              reservationIsComplete
                ? "bg-gradient-to-r from-[#B45F7A] to-[#843F59] text-white shadow-[0_8px_20px_rgba(132,63,89,0.22)]"
                : "border border-[#E8C3CF] bg-[#FFF8FA] text-[#816D75]",
            )}
          >
            {reservationIsComplete ? (
              <CheckCircle2 className="size-4" />
            ) : (
              <Sparkles className="size-4 text-[#A5526D]" />
            )}

            {completedItemCount} /{" "}
            {validationItems.length} complété
            {completedItemCount > 1 ? "s" : ""}
          </span>
        </header>

        <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_0.85fr]">
          <div className="space-y-3">
            {validationItems.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "flex items-start gap-4 rounded-[1.35rem] border p-4 shadow-sm transition duration-300",
                  item.completed
                    ? "border-[#CDE3D3] bg-gradient-to-br from-[#F8FCF9] to-white shadow-[0_10px_28px_rgba(75,138,96,0.06)]"
                    : "border-[#EFDEE4] bg-gradient-to-br from-white to-[#FFF7F9]",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl border transition",
                    item.completed
                      ? "border-[#CDE3D3] bg-white text-[#4B8A60] shadow-sm"
                      : "border-[#E8D8DE] bg-white text-[#B9A5AD]",
                  )}
                >
                  {item.completed ? (
                    <Check className="size-4" />
                  ) : (
                    <Circle className="size-3.5" />
                  )}
                </span>

                <div>
                  <p
                    className={cn(
                      "text-sm font-black",
                      item.completed
                        ? "text-[#31523A]"
                        : "text-[#49363E]",
                    )}
                  >
                    {item.label}
                  </p>

                  <p
                    className={cn(
                      "mt-1 text-xs leading-5",
                      item.completed
                        ? "text-[#6F8575]"
                        : "text-[#8E747E]",
                    )}
                  >
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="relative overflow-hidden rounded-[1.75rem] border border-[#5B3C49] bg-gradient-to-br from-[#3A2730] via-[#2F2027] to-[#24191F] p-5 text-white shadow-[0_18px_44px_rgba(47,32,39,0.22)] sm:p-6">
            <div className="pointer-events-none absolute -right-16 -top-16 size-44 rounded-full bg-[#B45F7A]/30 blur-3xl" />

            <div className="relative">
              <span className="grid size-11 place-items-center rounded-2xl border border-white/10 bg-white/[0.08] text-[#E8B4C0] shadow-[0_10px_24px_rgba(0,0,0,0.14)] ring-1 ring-white/10">
                {requiresOnlinePayment ? (
                  <CreditCard className="size-5" />
                ) : (
                  <CalendarCheck2 className="size-5" />
                )}
              </span>

              <p className="mt-5 text-[10px] font-black uppercase tracking-[0.18em] text-[#E8B4C0]">
                Validation finale
              </p>

              <h3 className="mt-2 font-serif text-2xl font-semibold tracking-tight">
                {requiresOnlinePayment
                  ? summary.isFullPayment
                    ? "Paiement intégral"
                    : "Acompte sécurisé"
                  : "Demande de réservation"}
              </h3>

              <p className="mt-3 text-sm leading-6 text-white/65">
                {requiresOnlinePayment
                  ? "Vous serez dirigée vers l’espace de paiement sécurisé afin de finaliser la réservation."
                  : "Votre demande sera transmise au salon. Vous recevrez ensuite les informations de suivi de votre rendez-vous."}
              </p>

              <div className="mt-5 rounded-[1.35rem] border border-white/12 bg-gradient-to-br from-white/[0.09] to-white/[0.045] p-4 shadow-[0_12px_30px_rgba(0,0,0,0.10)] backdrop-blur">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-medium text-white/60">
                    Total
                  </span>

                  <span className="text-sm font-black">
                    {formatPrice(
                      summary.totalPriceCents,
                    )}
                  </span>
                </div>

                {requiresOnlinePayment ? (
                  <>
                    <div className="mt-3 flex items-center justify-between gap-4">
                      <span className="text-sm font-medium text-white/60">
                        À régler maintenant
                      </span>

                      <span className="font-serif text-2xl font-semibold text-[#F0C4D1]">
                        {formatPrice(
                          summary.depositCents,
                        )}
                      </span>
                    </div>

                    {summary.remainingCents > 0 ? (
                      <div className="mt-3 flex items-center justify-between gap-4 border-t border-white/12 pt-3">
                        <span className="text-xs text-white/45">
                          Reste au salon
                        </span>

                        <span className="text-xs font-black text-white/80">
                          {formatPrice(
                            summary.remainingCents,
                          )}
                        </span>
                      </div>
                    ) : null}
                  </>
                ) : (
                  <div className="mt-3 flex items-center justify-between gap-4">
                    <span className="text-sm font-medium text-white/60">
                      Paiement en ligne
                    </span>

                    <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-sm font-black text-[#D1E8D7]">
                      Aucun
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <label
          className={cn(
            "mt-6 flex cursor-pointer items-start gap-4 rounded-[1.5rem] border p-5 shadow-sm transition duration-300",
            acceptedTerms
              ? "border-[#D8AAB9] bg-gradient-to-br from-[#FFF2F6] to-white shadow-[0_14px_32px_rgba(132,63,89,0.08)] ring-1 ring-[#D8AAB9]/20"
              : "border-[#EFDEE4] bg-gradient-to-br from-white to-[#FFF8FA] hover:border-[#D8AAB9]",
            (disabled || submitting) &&
              "cursor-not-allowed opacity-60",
          )}
        >
          <input
            type="checkbox"
            checked={acceptedTerms}
            disabled={disabled || submitting}
            onChange={(event) =>
              onAcceptedTermsChange(
                event.target.checked,
              )
            }
            className="sr-only"
          />

          <span
            aria-hidden="true"
            className={cn(
              "mt-0.5 grid size-6 shrink-0 place-items-center rounded-lg border shadow-sm transition",
              acceptedTerms
                ? "border-[#843F59] bg-gradient-to-br from-[#B45F7A] to-[#843F59] text-white"
                : "border-[#DCC6CE] bg-white text-transparent",
            )}
          >
            <Check className="size-4" />
          </span>

          <span className="min-w-0">
            <span className="block text-sm font-black text-[#49363E]">
              J’accepte les conditions de réservation
            </span>

            <span className="mt-1 block text-xs leading-5 text-[#816D75]">
              Je confirme avoir vérifié les prestations,
              la date, l’horaire et les montants de ma
              réservation. J’accepte également les
              conditions d’annulation du salon.
            </span>
          </span>
        </label>

        {error ? (
          <div
            role="alert"
            className="mt-5 flex items-start gap-3 rounded-[1.35rem] border border-red-200 bg-gradient-to-br from-red-50 to-white p-4 shadow-[0_12px_30px_rgba(220,38,38,0.06)]"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-red-100 bg-white text-red-600 shadow-sm">
              <AlertCircle className="size-4" />
            </span>

            <div>
              <p className="text-sm font-black text-red-800">
                La réservation n’a pas pu être validée
              </p>

              <p className="mt-1 text-xs leading-5 text-red-700">
                {error}
              </p>
            </div>
          </div>
        ) : null}

        <button
          type="button"
          onClick={onConfirm}
          disabled={confirmDisabled}
          className={cn(
            "mt-6 flex min-h-14 w-full items-center justify-center gap-3 rounded-full px-6 py-4 text-sm font-black transition duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#E8B4C0]/35",
            confirmDisabled
              ? "cursor-not-allowed bg-[#DDD2D6] text-white/85 shadow-none"
              : "bg-gradient-to-r from-[#843F59] via-[#B45F7A] to-[#C97992] text-white shadow-[0_18px_38px_rgba(132,63,89,0.28)] hover:-translate-y-0.5 hover:shadow-[0_22px_46px_rgba(132,63,89,0.34)]",
          )}
        >
          {submitting ? (
            <>
              <LoaderCircle className="size-5 animate-spin" />
              Validation en cours…
            </>
          ) : (
            <>
              {requiresOnlinePayment ? (
                <LockKeyhole className="size-5" />
              ) : (
                <CalendarCheck2 className="size-5" />
              )}

              {confirmationLabel}
            </>
          )}
        </button>

        <div className="mt-4 flex flex-col items-center justify-center gap-2 text-center sm:flex-row">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#816D75]">
            <ShieldCheck className="size-3.5 text-[#A5526D]" />
            Données protégées
          </span>

          <span className="hidden text-[#D8C7CD] sm:inline">
            •
          </span>

          <span className="text-xs font-medium text-[#816D75]">
            Aucun débit sans validation
          </span>
        </div>
      </div>
    </section>
  );
}