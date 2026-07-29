"use client";

import {
  AlertCircle,
  CalendarClock,
  Check,
  Clock3,
  LoaderCircle,
  MoonStar,
  RefreshCw,
  Sparkles,
  Sun,
  Sunset,
  UserRound,
} from "lucide-react";

import { cn } from "@/lib/utils";

import type {
  AvailabilityResult,
  AvailabilitySlot,
} from "../../types/availability.types";

type SlotPeriod =
  | "morning"
  | "afternoon"
  | "evening";

type ReservationSlotsProps = {
  date: string;
  availability: AvailabilityResult | null;
  selectedSlot: AvailabilitySlot | null;
  loading: boolean;
  error: string | null;
  disabled?: boolean;
  onSelectSlot: (slot: AvailabilitySlot) => void;
  onRefresh?: () => void;
};

type SlotPeriodConfiguration = {
  id: SlotPeriod;
  label: string;
  description: string;
  icon: typeof Sun;
};

const SLOT_PERIODS: SlotPeriodConfiguration[] = [
  {
    id: "morning",
    label: "Matin",
    description: "Avant 12 h",
    icon: Sun,
  },
  {
    id: "afternoon",
    label: "Après-midi",
    description: "De 12 h à 18 h",
    icon: Sunset,
  },
  {
    id: "evening",
    label: "Soirée",
    description: "Après 18 h",
    icon: MoonStar,
  },
];

function createSlotKey(
  slot: AvailabilitySlot,
): string {
  return [
    slot.startsAt,
    slot.staff.id,
    slot.workstation.id,
  ].join("-");
}

function isSameSlot(
  firstSlot: AvailabilitySlot | null,
  secondSlot: AvailabilitySlot,
): boolean {
  if (!firstSlot) {
    return false;
  }

  return (
    createSlotKey(firstSlot) ===
    createSlotKey(secondSlot)
  );
}

function getParisHour(date: string): number {
  const parts = new Intl.DateTimeFormat(
    "fr-FR",
    {
      timeZone: "Europe/Paris",
      hour: "2-digit",
      hourCycle: "h23",
    },
  ).formatToParts(new Date(date));

  const hourPart = parts.find(
    (part) => part.type === "hour",
  );

  const hour = Number(hourPart?.value ?? 0);

  return Number.isFinite(hour) ? hour : 0;
}

function getSlotPeriod(
  slot: AvailabilitySlot,
): SlotPeriod {
  const hour = getParisHour(slot.startsAt);

  if (hour < 12) {
    return "morning";
  }

  if (hour < 18) {
    return "afternoon";
  }

  return "evening";
}

function formatBookingDate(
  date: string,
): string {
  if (!date) {
    return "";
  }

  const parsedDate = new Date(
    `${date}T12:00:00Z`,
  );

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

export function ReservationSlots({
  date,
  availability,
  selectedSlot,
  loading,
  error,
  disabled = false,
  onSelectSlot,
  onRefresh,
}: ReservationSlotsProps) {
  const slots = availability?.slots ?? [];

  const groupedSlots = SLOT_PERIODS.map(
    (period) => ({
      ...period,
      slots: slots.filter(
        (slot) =>
          getSlotPeriod(slot) === period.id,
      ),
    }),
  );

  const availablePeriodCount =
    groupedSlots.filter(
      (period) => period.slots.length > 0,
    ).length;

  const hasDate = date.length > 0;
  const hasAvailability =
    availability !== null;
  const hasSlots = slots.length > 0;

  return (
    <section
      id="reservation-slots"
      aria-labelledby="reservation-slots-title"
      aria-busy={loading}
      className="relative overflow-hidden rounded-[2rem] border border-[#EFDEE4] bg-white/95 p-5 shadow-[0_22px_58px_rgba(85,38,55,0.09)] backdrop-blur sm:p-7 lg:p-8"
    >
      <div className="pointer-events-none absolute -right-24 -top-24 size-64 rounded-full bg-[#E8B4C0]/28 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-28 -left-20 size-64 rounded-full bg-[#D6B679]/12 blur-3xl" />

      <div className="relative">
        <header className="flex flex-col gap-5 border-b border-[#F0E1E6] pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-white/40 bg-gradient-to-br from-[#C97992] via-[#B45F7A] to-[#843F59] text-white shadow-[0_12px_28px_rgba(132,63,89,0.24)]">
              <Clock3 className="size-5" />
            </span>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#A5526D]">
                Étape 3
              </p>

              <h2
                id="reservation-slots-title"
                className="mt-2 font-serif text-3xl font-semibold tracking-tight text-[#2F2027] sm:text-4xl"
              >
                Choisissez votre heure
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-[#816D75]">
                Les horaires affichés sont calculés en
                temps réel selon la durée de vos
                prestations, la professionnelle et le
                poste disponibles.
              </p>
            </div>
          </div>

          <div className="flex w-fit shrink-0 flex-col gap-2">
            {hasDate ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-[#E8C3CF] bg-[#FFF8FA] px-4 py-2 text-xs font-black capitalize text-[#816D75] shadow-sm">
                <CalendarClock className="size-4 text-[#A5526D]" />

                {formatBookingDate(date)}
              </span>
            ) : null}

            {hasSlots ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#B45F7A] to-[#843F59] px-4 py-2 text-xs font-black text-white shadow-[0_8px_20px_rgba(132,63,89,0.22)]">
                <Sparkles className="size-4" />

                {slots.length} créneau
                {slots.length > 1 ? "x" : ""}
              </span>
            ) : null}
          </div>
        </header>

        {!hasDate ? (
          <div className="mt-8 rounded-[1.75rem] border border-dashed border-[#D9B4C0] bg-gradient-to-br from-white to-[#FFF4F7] px-6 py-12 text-center shadow-[0_16px_40px_rgba(85,38,55,0.05)]">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl border border-[#E8C3CF] bg-gradient-to-br from-[#FFF0F5] to-[#F4D4DE] text-[#A5526D] shadow-sm">
              <CalendarClock className="size-6" />
            </span>

            <h3 className="mt-5 font-serif text-2xl font-semibold text-[#2F2027]">
              Sélectionnez une date
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#816D75]">
              Les horaires disponibles apparaîtront ici
              dès que vous aurez choisi votre journée.
            </p>
          </div>
        ) : loading ? (
          <div
            role="status"
            className="mt-8 rounded-[1.75rem] border border-[#EFDEE4] bg-gradient-to-br from-white to-[#FFF0F4] px-6 py-14 text-center shadow-[0_16px_40px_rgba(85,38,55,0.06)]"
          >
            <span className="mx-auto grid size-16 place-items-center rounded-2xl border border-[#E8C3CF] bg-white text-[#A5526D] shadow-[0_10px_24px_rgba(132,63,89,0.10)]">
              <LoaderCircle className="size-7 animate-spin" />
            </span>

            <h3 className="mt-5 font-serif text-2xl font-semibold text-[#2F2027]">
              Recherche des meilleurs créneaux
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#816D75]">
              Nous vérifions les disponibilités du salon
              pour votre sélection.
            </p>
          </div>
        ) : error ? (
          <div
            role="alert"
            className="mt-8 rounded-[1.75rem] border border-red-200 bg-gradient-to-br from-red-50 to-white px-6 py-10 text-center shadow-[0_16px_40px_rgba(220,38,38,0.06)]"
          >
            <span className="mx-auto grid size-14 place-items-center rounded-2xl border border-red-200 bg-white text-red-600 shadow-sm">
              <AlertCircle className="size-6" />
            </span>

            <h3 className="mt-5 font-serif text-2xl font-semibold text-red-800">
              Disponibilités indisponibles
            </h3>

            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-red-700">
              {error}
            </p>

            {onRefresh ? (
              <button
                type="button"
                onClick={onRefresh}
                disabled={disabled}
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#B45F7A] to-[#843F59] px-5 py-3 text-sm font-black text-white shadow-[0_12px_28px_rgba(132,63,89,0.22)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw className="size-4" />
                Actualiser les créneaux
              </button>
            ) : null}
          </div>
        ) : hasAvailability && !hasSlots ? (
          <div className="mt-8 rounded-[1.75rem] border border-[#E8D39F] bg-gradient-to-br from-[#FFFBEF] to-[#FFF6DC] px-6 py-10 text-center shadow-[0_16px_40px_rgba(154,106,24,0.06)]">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl border border-[#E8D39F] bg-white text-[#9A6A18] shadow-sm">
              <Clock3 className="size-6" />
            </span>

            <h3 className="mt-5 font-serif text-2xl font-semibold text-[#72501A]">
              Aucun créneau disponible
            </h3>

            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#886221]">
              Le salon ne dispose plus de créneau
              compatible à cette date. Essayez une autre
              journée pour poursuivre votre réservation.
            </p>

            {onRefresh ? (
              <button
                type="button"
                onClick={onRefresh}
                disabled={disabled}
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-full border border-[#E8D39F] bg-white px-5 py-3 text-sm font-black text-[#886221] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#FFFBEF] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw className="size-4" />
                Vérifier à nouveau
              </button>
            ) : null}
          </div>
        ) : hasSlots ? (
          <div className="mt-8 space-y-7">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1.25rem] border border-[#EFDEE4] bg-gradient-to-br from-white to-[#FFF5F8] p-4 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#A68C96]">
                  Créneaux
                </p>

                <p className="mt-2 font-serif text-2xl font-semibold text-[#2F2027]">
                  {slots.length}
                </p>
              </div>

              <div className="rounded-[1.25rem] border border-[#EFDEE4] bg-gradient-to-br from-white to-[#FFF5F8] p-4 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#A68C96]">
                  Périodes
                </p>

                <p className="mt-2 font-serif text-2xl font-semibold text-[#2F2027]">
                  {availablePeriodCount}
                </p>
              </div>

              <div className="rounded-[1.25rem] border border-[#EFDEE4] bg-gradient-to-br from-white to-[#FFF5F8] p-4 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#A68C96]">
                  Attribution
                </p>

                <p className="mt-2 truncate text-sm font-black text-[#2F2027]">
                  {availability?.autoAssigned
                    ? "Automatique"
                    : "Personnalisée"}
                </p>
              </div>
            </div>

            {groupedSlots.map((period) => {
              if (period.slots.length === 0) {
                return null;
              }

              const PeriodIcon = period.icon;

              return (
                <section
                  key={period.id}
                  aria-labelledby={`slot-period-${period.id}`}
                  className="rounded-[1.75rem] border border-[#EFDEE4] bg-gradient-to-br from-white to-[#FFF9FA] p-4 shadow-[0_12px_32px_rgba(85,38,55,0.05)] sm:p-5"
                >
                  <header className="mb-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="grid size-10 place-items-center rounded-xl border border-[#E8C3CF] bg-gradient-to-br from-[#FFF0F5] to-[#F4D4DE] text-[#A5526D] shadow-sm">
                        <PeriodIcon className="size-4.5" />
                      </span>

                      <div>
                        <h3
                          id={`slot-period-${period.id}`}
                          className="font-serif text-xl font-semibold text-[#2F2027]"
                        >
                          {period.label}
                        </h3>

                        <p className="text-xs text-[#8E747E]">
                          {period.description}
                        </p>
                      </div>
                    </div>

                    <span className="rounded-full border border-[#E8C3CF] bg-white px-3 py-1.5 text-xs font-black text-[#816D75] shadow-sm">
                      {period.slots.length} disponible
                      {period.slots.length > 1
                        ? "s"
                        : ""}
                    </span>
                  </header>

                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {period.slots.map((slot) => {
                      const selected = isSameSlot(
                        selectedSlot,
                        slot,
                      );

                      return (
                        <button
                          key={createSlotKey(slot)}
                          type="button"
                          onClick={() =>
                            onSelectSlot(slot)
                          }
                          disabled={disabled}
                          aria-pressed={selected}
                          className={cn(
                            "group relative overflow-hidden rounded-[1.25rem] border p-4 text-left outline-none transition duration-300 focus-visible:ring-4 focus-visible:ring-[#E8B4C0]/30 disabled:cursor-not-allowed disabled:opacity-50",
                            selected
                              ? "border-[#B45F7A] bg-gradient-to-br from-white via-[#FFF0F4] to-[#F4D4DE] shadow-[0_16px_38px_rgba(132,63,89,0.14)] ring-1 ring-[#D8AAB9]/40"
                              : "border-[#EFDEE4] bg-white hover:-translate-y-0.5 hover:border-[#DDBAC5] hover:shadow-[0_16px_36px_rgba(132,63,89,0.10)]",
                          )}
                        >
                          <span
                            className={cn(
                              "pointer-events-none absolute -right-8 -top-10 size-24 rounded-full blur-2xl transition",
                              selected
                                ? "bg-[#E8B4C0]/55"
                                : "bg-transparent group-hover:bg-[#E8B4C0]/25",
                            )}
                          />

                          <div className="relative flex items-start justify-between gap-3">
                            <div>
                              <p className="font-serif text-2xl font-semibold text-[#2F2027]">
                                {slot.label ||
                                  formatTime(
                                    slot.startsAt,
                                  )}
                              </p>

                              <p className="mt-1 text-xs font-semibold text-[#8E747E]">
                                Jusqu’à{" "}
                                {formatTime(slot.endsAt)}
                              </p>
                            </div>

                            <span
                              className={cn(
                                "grid size-9 shrink-0 place-items-center rounded-full border transition",
                                selected
                                  ? "border-[#D6B679] bg-gradient-to-br from-[#B45F7A] to-[#843F59] text-white shadow-[0_8px_20px_rgba(132,63,89,0.22)]"
                                  : "border-[#E8DDE1] bg-[#FFF9FA] text-[#A68C96] group-hover:border-[#D8AAB9] group-hover:text-[#A5526D]",
                              )}
                            >
                              {selected ? (
                                <Check className="size-4" />
                              ) : (
                                <Clock3 className="size-4" />
                              )}
                            </span>
                          </div>

                          <div className="relative mt-4 space-y-2 border-t border-[#F0E1E6] pt-4">
                            <p className="flex items-center gap-2 text-xs font-black text-[#705D65]">
                              <UserRound className="size-3.5 text-[#A5526D]" />

                              {slot.staff.displayName}
                            </p>

                            <p className="truncate text-[0.7rem] text-[#A68C96]">
                              {slot.workstation.name}
                            </p>
                          </div>

                          {selected ? (
                            <p className="relative mt-4 flex items-center gap-2 text-xs font-black text-[#A5526D]">
                              <Check className="size-4" />
                              Créneau sélectionné
                            </p>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </section>
              );
            })}

            {selectedSlot ? (
              <div className="flex flex-col gap-4 rounded-[1.5rem] border border-[#DDBAC5] bg-gradient-to-r from-[#FFF8FA] to-[#F4D4DE]/65 p-5 shadow-[0_14px_34px_rgba(132,63,89,0.08)] sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#B45F7A] to-[#843F59] text-white shadow-[0_10px_24px_rgba(132,63,89,0.24)]">
                    <Check className="size-5" />
                  </span>

                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#A5526D]">
                      Créneau sélectionné
                    </p>

                    <p className="mt-1 font-serif text-xl font-semibold capitalize text-[#2F2027]">
                      {formatBookingDate(date)} à{" "}
                      {selectedSlot.label ||
                        formatTime(
                          selectedSlot.startsAt,
                        )}
                    </p>
                  </div>
                </div>

                <p className="rounded-full bg-white/80 px-4 py-2 text-sm font-black text-[#843F59] shadow-sm">
                  {selectedSlot.staff.displayName}
                </p>
              </div>
            ) : null}

            {onRefresh ? (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={onRefresh}
                  disabled={disabled}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#E8C3CF] bg-white px-5 py-3 text-sm font-black text-[#843F59] shadow-sm transition hover:-translate-y-0.5 hover:border-[#D8AAB9] hover:bg-[#FFF0F4] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RefreshCw className="size-4" />
                  Actualiser les disponibilités
                </button>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="mt-8 rounded-[1.75rem] border border-dashed border-[#D9B4C0] bg-gradient-to-br from-white to-[#FFF4F7] px-6 py-12 text-center shadow-[0_16px_40px_rgba(85,38,55,0.05)]">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl border border-[#E8C3CF] bg-gradient-to-br from-[#FFF0F5] to-[#F4D4DE] text-[#A5526D] shadow-sm">
              <Clock3 className="size-6" />
            </span>

            <h3 className="mt-5 font-serif text-2xl font-semibold text-[#2F2027]">
              En attente des disponibilités
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#816D75]">
              Les créneaux seront chargés automatiquement
              après la sélection de votre date.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}