"use client";

import {
  CalendarHeart,
  ChevronLeft,
  ChevronRight,
  Heart,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";

type GirlyCalendarProps = {
  value: string;
  minDate: string;
  disabled?: boolean;
  onChange: (date: string) => void;
};

const WEEK_DAYS = [
  "Lun",
  "Mar",
  "Mer",
  "Jeu",
  "Ven",
  "Sam",
  "Dim",
];

function parseDateValue(value: string): Date {
  const [year, month, day] = value
    .split("-")
    .map(Number);

  return new Date(year, month - 1, day, 12);
}

function formatDateValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");
  const day = String(date.getDate()).padStart(
    2,
    "0",
  );

  return `${year}-${month}-${day}`;
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() +
    value.slice(1);
}

function getMonthLabel(date: Date): string {
  return capitalize(
    new Intl.DateTimeFormat("fr-FR", {
      month: "long",
      year: "numeric",
    }).format(date),
  );
}

function getFullDateLabel(value: string): string {
  if (!value) {
    return "Aucune date sélectionnée";
  }

  return capitalize(
    new Intl.DateTimeFormat("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(parseDateValue(value)),
  );
}

function isSameDay(
  firstDate: Date,
  secondDate: Date,
): boolean {
  return (
    firstDate.getFullYear() ===
      secondDate.getFullYear() &&
    firstDate.getMonth() ===
      secondDate.getMonth() &&
    firstDate.getDate() ===
      secondDate.getDate()
  );
}

function startOfMonth(date: Date): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    1,
    12,
  );
}

function addMonths(
  date: Date,
  amount: number,
): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth() + amount,
    1,
    12,
  );
}

function buildCalendarDays(
  displayedMonth: Date,
): Date[] {
  const firstDay = startOfMonth(
    displayedMonth,
  );

  /*
   * JavaScript : dimanche = 0.
   * Calendrier français : lundi = première colonne.
   */
  const offset =
    firstDay.getDay() === 0
      ? 6
      : firstDay.getDay() - 1;

  const firstVisibleDay = new Date(
    firstDay.getFullYear(),
    firstDay.getMonth(),
    1 - offset,
    12,
  );

  return Array.from(
    {
      length: 42,
    },
    (_, index) =>
      new Date(
        firstVisibleDay.getFullYear(),
        firstVisibleDay.getMonth(),
        firstVisibleDay.getDate() + index,
        12,
      ),
  );
}

export function GirlyCalendar({
  value,
  minDate,
  disabled = false,
  onChange,
}: GirlyCalendarProps) {
  const minimumDate = useMemo(
    () => parseDateValue(minDate),
    [minDate],
  );

  const selectedDate = useMemo(
    () =>
      value
        ? parseDateValue(value)
        : null,
    [value],
  );

  const initialMonth =
    selectedDate ?? minimumDate;

  const [displayedMonth, setDisplayedMonth] =
    useState<Date>(() =>
      startOfMonth(initialMonth),
    );

  const calendarDays = useMemo(
    () => buildCalendarDays(displayedMonth),
    [displayedMonth],
  );

  const currentMonthStart =
    startOfMonth(displayedMonth);

  const minimumMonthStart =
    startOfMonth(minimumDate);

  const previousMonthDisabled =
    disabled ||
    currentMonthStart.getTime() <=
      minimumMonthStart.getTime();

  function goToPreviousMonth(): void {
    if (previousMonthDisabled) {
      return;
    }

    setDisplayedMonth((current) =>
      addMonths(current, -1),
    );
  }

  function goToNextMonth(): void {
    if (disabled) {
      return;
    }

    setDisplayedMonth((current) =>
      addMonths(current, 1),
    );
  }

  function goToToday(): void {
    if (disabled) {
      return;
    }

    setDisplayedMonth(
      startOfMonth(minimumDate),
    );

    onChange(formatDateValue(minimumDate));
  }

  function selectDay(day: Date): void {
    if (disabled) {
      return;
    }

    const isPast =
      day.getTime() <
      minimumDate.getTime();

    if (isPast) {
      return;
    }

    onChange(formatDateValue(day));

    if (
      day.getMonth() !==
        displayedMonth.getMonth() ||
      day.getFullYear() !==
        displayedMonth.getFullYear()
    ) {
      setDisplayedMonth(startOfMonth(day));
    }
  }

  return (
    <div
      className={`relative overflow-hidden rounded-[2rem] border p-4 shadow-[0_22px_58px_rgba(85,38,55,0.10)] transition sm:p-6 ${
        disabled
          ? "border-[#E6D8DD] bg-[#F8F4F5] opacity-70"
          : "border-[#E8C3CF] bg-gradient-to-br from-white via-[#FFF4F7] to-[#F4D4DE]/55"
      }`}
    >
      <div className="pointer-events-none absolute -right-10 -top-12 size-40 rounded-full bg-[#E8B4C0]/35 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-12 size-44 rounded-full bg-[#D6B679]/15 blur-3xl" />

      <div className="relative">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="relative grid size-12 shrink-0 place-items-center rounded-2xl border border-white/40 bg-gradient-to-br from-[#C97992] via-[#B45F7A] to-[#843F59] text-white shadow-[0_12px_28px_rgba(132,63,89,0.24)]">
              <CalendarHeart className="size-6" />

              <Sparkles className="absolute -right-1 -top-1 size-4 rounded-full bg-[#FFF8E9] p-0.5 text-[#B9924C] shadow-sm" />
            </span>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#A5526D]">
                Votre moment beauté
              </p>

              <h3 className="mt-1 font-serif text-2xl font-semibold capitalize text-[#2F2027]">
                {getMonthLabel(
                  displayedMonth,
                )}
              </h3>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 sm:justify-end">
            <button
              type="button"
              onClick={goToToday}
              disabled={disabled}
              className="rounded-full border border-[#E8C3CF] bg-white/85 px-4 py-2 text-xs font-black text-[#843F59] shadow-sm transition hover:border-[#D8AAB9] hover:bg-[#FFF0F4] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Aujourd’hui
            </button>

            <button
              type="button"
              onClick={goToPreviousMonth}
              disabled={previousMonthDisabled}
              aria-label="Mois précédent"
              className="grid size-10 place-items-center rounded-full border border-[#E8C3CF] bg-white text-[#843F59] shadow-sm transition hover:border-[#D8AAB9] hover:bg-[#FFF0F4] disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronLeft className="size-5" />
            </button>

            <button
              type="button"
              onClick={goToNextMonth}
              disabled={disabled}
              aria-label="Mois suivant"
              className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-[#C97992] via-[#B45F7A] to-[#843F59] text-white shadow-[0_9px_22px_rgba(132,63,89,0.24)] transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>

        {disabled ? (
          <div className="mb-5 rounded-[1.25rem] border border-dashed border-[#D9B4C0] bg-white/85 p-4 text-center text-sm text-[#816D75]">
            Sélectionnez d’abord une prestation
            disponible pour afficher le calendrier.
          </div>
        ) : null}

        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {WEEK_DAYS.map((weekDay) => (
            <div
              key={weekDay}
              className="pb-2 text-center text-[0.68rem] font-black uppercase tracking-[0.14em] text-[#A68C96] sm:text-xs"
            >
              {weekDay}
            </div>
          ))}

          {calendarDays.map((day) => {
            const dayValue =
              formatDateValue(day);

            const isOutsideMonth =
              day.getMonth() !==
                displayedMonth.getMonth() ||
              day.getFullYear() !==
                displayedMonth.getFullYear();

            const isPast =
              day.getTime() <
              minimumDate.getTime();

            const isSelected =
              selectedDate !== null &&
              isSameDay(day, selectedDate);

            const isToday = isSameDay(
              day,
              minimumDate,
            );

            const isSunday =
              day.getDay() === 0;

            const unavailable =
              disabled || isPast;

            return (
              <button
                key={dayValue}
                type="button"
                onClick={() =>
                  selectDay(day)
                }
                disabled={unavailable}
                aria-label={getFullDateLabel(
                  dayValue,
                )}
                aria-pressed={isSelected}
                className={`group relative aspect-square min-h-10 rounded-xl border text-sm font-semibold transition sm:rounded-2xl sm:text-base ${
                  isSelected
                    ? "z-10 border-[#D6B679] bg-gradient-to-br from-[#D6B679] via-[#B45F7A] to-[#843F59] text-white shadow-[0_10px_26px_rgba(132,63,89,0.26)] ring-4 ring-[#F9E7ED]"
                    : isPast
                      ? "cursor-not-allowed border-transparent text-[#D7C9CE]"
                      : isOutsideMonth
                        ? "border-transparent bg-white/20 text-[#B8A7AE] hover:border-[#E8C3CF] hover:bg-white/75"
                        : "border-white/90 bg-white/80 text-[#49363E] shadow-sm hover:-translate-y-0.5 hover:border-[#D8AAB9] hover:bg-[#FFF0F4] hover:text-[#843F59]"
                } ${
                  isSunday &&
                  !isSelected &&
                  !isPast
                    ? "text-[#A5526D]"
                    : ""
                }`}
              >
                <span className="relative z-10">
                  {day.getDate()}
                </span>

                {isToday &&
                !isSelected ? (
                  <span className="absolute bottom-1.5 left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-[#D6B679] shadow-sm sm:bottom-2" />
                ) : null}

                {isSelected ? (
                  <Heart className="absolute right-1 top-1 size-3 fill-white/30 text-white sm:right-2 sm:top-2 sm:size-3.5" />
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex flex-col gap-3 rounded-[1.25rem] border border-[#EFDEE4] bg-white/85 p-4 shadow-sm backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#A68C96]">
              Date sélectionnée
            </p>

            <p className="mt-1 font-serif text-lg font-semibold capitalize text-[#2F2027]">
              {getFullDateLabel(value)}
            </p>
          </div>

          {value ? (
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#E8C3CF] bg-[#FFF1F5] px-3 py-1.5 text-xs font-black text-[#A5526D]">
              <Sparkles className="size-3.5" />
              Prête à choisir l’heure
            </span>
          ) : (
            <span className="text-xs font-semibold text-[#816D75]">
              Touchez une date pour continuer
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
