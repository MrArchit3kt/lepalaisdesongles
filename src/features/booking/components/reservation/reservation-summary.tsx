"use client";

import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  ReceiptText,
  Sparkles,
  UserRound,
} from "lucide-react";

import type {
  AvailabilitySlot,
} from "../../types/availability.types";
import type {
  ReservationSummary as ReservationSummaryData,
  ServiceItem,
  StaffMember,
} from "./reservation.types";

type ReservationSummaryProps = {
  selectedServices: ServiceItem[];
  selectedStaff: StaffMember | null;
  selectedStaffId: string;
  selectedDate: string;
  selectedSlot: AvailabilitySlot | null;
  summary: ReservationSummaryData;
  compact?: boolean;
};

function formatPrice(cents: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

function formatDuration(minutes: number): string {
  if (minutes <= 0) {
    return "—";
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes} min`;
  }

  if (remainingMinutes === 0) {
    return `${hours} h`;
  }

  return `${hours} h ${remainingMinutes
    .toString()
    .padStart(2, "0")}`;
}

function formatBookingDate(date: string): string {
  if (!date) {
    return "À choisir";
  }

  const parsedDate = new Date(`${date}T12:00:00Z`);

  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsedDate);
}

function formatTime(date: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function getStaffLabel(
  selectedStaff: StaffMember | null,
  selectedStaffId: string,
  selectedSlot: AvailabilitySlot | null,
): string {
  if (selectedSlot) {
    return selectedSlot.staff.displayName;
  }

  if (selectedStaffId === "any") {
    return "Première disponible";
  }

  return selectedStaff?.displayName ?? "À choisir";
}

export function ReservationSummary({
  selectedServices,
  selectedStaff,
  selectedStaffId,
  selectedDate,
  selectedSlot,
  summary,
  compact = false,
}: ReservationSummaryProps) {
  const hasServices = selectedServices.length > 0;

  const staffLabel = getStaffLabel(
    selectedStaff,
    selectedStaffId,
    selectedSlot,
  );

  return (
    <aside
      aria-labelledby="reservation-summary-title"
      className="relative overflow-hidden rounded-[2rem] border border-[#5B3C49] bg-gradient-to-br from-[#3A2730] via-[#2F2027] to-[#24191F] text-white shadow-[0_28px_70px_rgba(47,32,39,0.28)]"
    >
      <div className="pointer-events-none absolute -right-24 -top-24 size-64 rounded-full bg-[#B45F7A]/30 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-28 -left-20 size-64 rounded-full bg-[#D6B679]/12 blur-3xl" />

      <div className="relative p-5 sm:p-6 lg:p-7">
        <header className="flex items-start justify-between gap-4 border-b border-white/12 pb-5">
          <div className="flex items-start gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/[0.08] text-[#E8B4C0] shadow-[0_10px_24px_rgba(0,0,0,0.14)] ring-1 ring-white/10">
              <ReceiptText className="size-5" />
            </span>

            <div>
              <p className="text-[0.65rem] font-black uppercase tracking-[0.22em] text-[#E8B4C0]">
                Votre rendez-vous
              </p>

              <h2
                id="reservation-summary-title"
                className="mt-1 font-serif text-2xl font-semibold tracking-tight text-white"
              >
                Résumé
              </h2>
            </div>
          </div>

          {selectedSlot ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#FFF8FA] to-white px-3 py-1.5 text-[0.68rem] font-black text-[#843F59] shadow-[0_8px_20px_rgba(0,0,0,0.12)]">
              <CheckCircle2 className="size-3.5" />
              Créneau choisi
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.06] px-3 py-1.5 text-[0.68rem] font-black text-white/70">
              <Sparkles className="size-3.5" />
              En préparation
            </span>
          )}
        </header>

        <div className="mt-5 space-y-3">
          <div className="flex items-start gap-3 rounded-[1.25rem] border border-white/10 bg-white/[0.055] p-4 shadow-[0_10px_26px_rgba(0,0,0,0.08)] backdrop-blur transition hover:border-white/15 hover:bg-white/[0.075]">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.08] text-[#E8B4C0]">
              <Sparkles className="size-4" />
            </span>

            <div className="min-w-0 flex-1">
              <p className="text-[0.65rem] font-black uppercase tracking-[0.15em] text-white/45">
                Prestations
              </p>

              {hasServices ? (
                <div className="mt-2 space-y-2">
                  {selectedServices.map((service) => (
                    <div
                      key={service.id}
                      className="flex items-start justify-between gap-3"
                    >
                      <p className="min-w-0 text-sm font-semibold leading-5 text-white/90">
                        {service.name}
                      </p>

                      <span className="shrink-0 rounded-full bg-white/[0.07] px-2.5 py-1 text-xs font-black text-[#F0C8D4]">
                        {formatPrice(
                          service.promotionalPriceCents ??
                            service.priceCents,
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-1 text-sm text-white/55">
                  Aucune prestation sélectionnée
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="flex items-start gap-3 rounded-[1.25rem] border border-white/10 bg-white/[0.055] p-4 shadow-[0_10px_26px_rgba(0,0,0,0.08)] backdrop-blur transition hover:border-white/15 hover:bg-white/[0.075]">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.08] text-[#E8B4C0]">
                <UserRound className="size-4" />
              </span>

              <div className="min-w-0">
                <p className="text-[0.65rem] font-black uppercase tracking-[0.15em] text-white/45">
                  Professionnelle
                </p>

                <p className="mt-1 truncate text-sm font-black text-white/90">
                  {staffLabel}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-[1.25rem] border border-white/10 bg-white/[0.055] p-4 shadow-[0_10px_26px_rgba(0,0,0,0.08)] backdrop-blur transition hover:border-white/15 hover:bg-white/[0.075]">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.08] text-[#E8B4C0]">
                <CalendarDays className="size-4" />
              </span>

              <div className="min-w-0">
                <p className="text-[0.65rem] font-black uppercase tracking-[0.15em] text-white/45">
                  Date
                </p>

                <p className="mt-1 text-sm font-black capitalize text-white/90">
                  {formatBookingDate(selectedDate)}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="flex items-start gap-3 rounded-[1.25rem] border border-white/10 bg-white/[0.055] p-4 shadow-[0_10px_26px_rgba(0,0,0,0.08)] backdrop-blur transition hover:border-white/15 hover:bg-white/[0.075]">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.08] text-[#E8B4C0]">
                <Clock3 className="size-4" />
              </span>

              <div>
                <p className="text-[0.65rem] font-black uppercase tracking-[0.15em] text-white/45">
                  Horaire
                </p>

                <p className="mt-1 text-sm font-black text-white/90">
                  {selectedSlot
                    ? `${selectedSlot.label || formatTime(selectedSlot.startsAt)} – ${formatTime(selectedSlot.endsAt)}`
                    : "À choisir"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-[1.25rem] border border-white/10 bg-white/[0.055] p-4 shadow-[0_10px_26px_rgba(0,0,0,0.08)] backdrop-blur transition hover:border-white/15 hover:bg-white/[0.075]">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.08] text-[#E8B4C0]">
                <Clock3 className="size-4" />
              </span>

              <div>
                <p className="text-[0.65rem] font-black uppercase tracking-[0.15em] text-white/45">
                  Durée totale
                </p>

                <p className="mt-1 text-sm font-black text-white/90">
                  {formatDuration(
                    summary.totalDurationMinutes,
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {!compact ? (
          <div className="mt-5 rounded-[1.5rem] border border-white/12 bg-gradient-to-br from-white/[0.09] to-white/[0.045] p-5 shadow-[0_14px_34px_rgba(0,0,0,0.10)] backdrop-blur">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-medium text-white/60">
                Total des prestations
              </span>

              <span className="text-sm font-black text-white">
                {formatPrice(summary.totalPriceCents)}
              </span>
            </div>

            {summary.depositCents > 0 ? (
              <>
                <div className="mt-3 flex items-center justify-between gap-4">
                  <span className="flex items-center gap-2 text-sm font-medium text-white/60">
                    <CreditCard className="size-4 text-[#D6B679]" />
                    À régler maintenant
                  </span>

                  <span className="rounded-full bg-[#B45F7A]/20 px-3 py-1 text-sm font-black text-[#F2C8D5]">
                    {formatPrice(summary.depositCents)}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between gap-4">
                  <span className="text-sm font-medium text-white/60">
                    Reste au salon
                  </span>

                  <span className="text-sm font-black text-white">
                    {formatPrice(summary.remainingCents)}
                  </span>
                </div>
              </>
            ) : null}

            <div className="my-4 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[0.65rem] font-black uppercase tracking-[0.17em] text-white/45">
                  Montant total
                </p>

                <p className="mt-1 text-xs text-white/45">
                  Taxes incluses
                </p>
              </div>

              <p className="font-serif text-3xl font-semibold tracking-tight text-[#FFF8FA]">
                {formatPrice(summary.totalPriceCents)}
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-5 flex items-end justify-between gap-4 rounded-[1.5rem] border border-white/12 bg-gradient-to-br from-white/[0.09] to-white/[0.045] p-5 shadow-[0_14px_34px_rgba(0,0,0,0.10)] backdrop-blur">
            <div>
              <p className="text-[0.65rem] font-black uppercase tracking-[0.17em] text-white/45">
                Total
              </p>

              <p className="mt-1 text-xs text-white/45">
                {formatDuration(
                  summary.totalDurationMinutes,
                )}
              </p>
            </div>

            <p className="font-serif text-3xl font-semibold tracking-tight text-[#FFF8FA]">
              {formatPrice(summary.totalPriceCents)}
            </p>
          </div>
        )}

        <div className="mt-5 flex items-start gap-3 rounded-[1.25rem] border border-[#E8B4C0]/20 bg-gradient-to-r from-[#B45F7A]/12 to-[#D6B679]/8 p-4">
          <CreditCard className="mt-0.5 size-4 shrink-0 text-[#D6B679]" />

          <p className="text-xs font-medium leading-5 text-white/70">
            {summary.depositCents > 0
              ? `${formatPrice(summary.depositCents)} seront demandés pour confirmer définitivement votre rendez-vous.`
              : "Aucun paiement en ligne n’est demandé pour cette réservation."}
          </p>
        </div>
      </div>
    </aside>
  );
}