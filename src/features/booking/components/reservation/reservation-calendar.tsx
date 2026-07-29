"use client";

import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Sparkles,
} from "lucide-react";

import { GirlyCalendar } from "../girly-calendar";

type ReservationCalendarProps = {
  value: string;
  minDate: string;
  disabled?: boolean;
  selectedServiceCount: number;
  compatibleStaffCount: number;
  onChange: (date: string) => void;
};

export function ReservationCalendar({
  value,
  minDate,
  disabled = false,
  selectedServiceCount,
  compatibleStaffCount,
  onChange,
}: ReservationCalendarProps) {
  const hasSelectedServices =
    selectedServiceCount > 0;

  const hasCompatibleStaff =
    compatibleStaffCount > 0;

  return (
    <section
      id="reservation-calendar"
      aria-labelledby="reservation-calendar-title"
      className="relative overflow-hidden rounded-[2rem] border border-[#EFDEE4] bg-white/95 p-5 shadow-[0_22px_58px_rgba(85,38,55,0.09)] backdrop-blur sm:p-7 lg:p-8"
    >
      <div className="pointer-events-none absolute -right-24 -top-24 size-64 rounded-full bg-[#E8B4C0]/28 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-28 -left-20 size-64 rounded-full bg-[#D6B679]/12 blur-3xl" />

      <div className="relative">
        <header className="flex flex-col gap-5 border-b border-[#F0E1E6] pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-white/40 bg-gradient-to-br from-[#C97992] via-[#B45F7A] to-[#843F59] text-white shadow-[0_12px_28px_rgba(132,63,89,0.24)]">
              <CalendarDays className="size-5" />
            </span>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#A5526D]">
                Étape 3
              </p>

              <h2
                id="reservation-calendar-title"
                className="mt-2 font-serif text-3xl font-semibold tracking-tight text-[#2F2027] sm:text-4xl"
              >
                Choisissez votre date
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-[#816D75]">
                Sélectionnez une journée pour afficher
                les créneaux réellement disponibles
                selon vos prestations et votre
                professionnelle.
              </p>
            </div>
          </div>

          <div className="flex w-fit shrink-0 flex-col gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#E8C3CF] bg-[#FFF8FA] px-4 py-2 text-xs font-black text-[#816D75] shadow-sm">
              <Clock3 className="size-4 text-[#A5526D]" />
              Disponibilités en temps réel
            </span>

            {value ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#B45F7A] to-[#843F59] px-4 py-2 text-xs font-black text-white shadow-[0_8px_20px_rgba(132,63,89,0.22)]">
                <CheckCircle2 className="size-4" />
                Date sélectionnée
              </span>
            ) : null}
          </div>
        </header>

        {!hasSelectedServices ? (
          <div className="mt-8 rounded-[1.75rem] border border-dashed border-[#D9B4C0] bg-gradient-to-br from-white to-[#FFF4F7] px-6 py-12 text-center shadow-[0_16px_40px_rgba(85,38,55,0.05)]">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl border border-[#E8C3CF] bg-gradient-to-br from-[#FFF0F5] to-[#F4D4DE] text-[#A5526D] shadow-sm">
              <Sparkles className="size-6" />
            </span>

            <h3 className="mt-5 font-serif text-2xl font-semibold text-[#2F2027]">
              Sélectionnez vos prestations
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#816D75]">
              Le calendrier sera activé dès qu’au moins
              une prestation aura été ajoutée à votre
              réservation.
            </p>
          </div>
        ) : !hasCompatibleStaff ? (
          <div className="mt-8 rounded-[1.75rem] border border-[#E8D39F] bg-gradient-to-br from-[#FFFBEF] to-[#FFF6DC] px-6 py-10 text-center shadow-[0_16px_40px_rgba(154,106,24,0.06)]">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl border border-[#E8D39F] bg-white text-[#9A6A18] shadow-sm">
              <CalendarDays className="size-6" />
            </span>

            <h3 className="mt-5 font-serif text-2xl font-semibold text-[#72501A]">
              Calendrier indisponible
            </h3>

            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#886221]">
              Aucune professionnelle n’est compatible
              avec toutes les prestations sélectionnées.
              Modifiez votre sélection pour continuer.
            </p>
          </div>
        ) : (
          <div className="mt-8">
            <GirlyCalendar
              value={value}
              minDate={minDate}
              disabled={disabled}
              onChange={onChange}
            />

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1.25rem] border border-[#EFDEE4] bg-gradient-to-br from-white to-[#FFF5F8] p-4 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#A68C96]">
                  Prestations
                </p>

                <p className="mt-2 font-serif text-2xl font-semibold text-[#2F2027]">
                  {selectedServiceCount}
                </p>
              </div>

              <div className="rounded-[1.25rem] border border-[#EFDEE4] bg-gradient-to-br from-white to-[#FFF5F8] p-4 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#A68C96]">
                  Professionnelles
                </p>

                <p className="mt-2 font-serif text-2xl font-semibold text-[#2F2027]">
                  {compatibleStaffCount}
                </p>
              </div>

              <div className="rounded-[1.25rem] border border-[#EFDEE4] bg-gradient-to-br from-white to-[#FFF5F8] p-4 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#A68C96]">
                  Sélection
                </p>

                <p className="mt-2 truncate text-sm font-black text-[#2F2027]">
                  {value
                    ? "Journée choisie"
                    : "À sélectionner"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}