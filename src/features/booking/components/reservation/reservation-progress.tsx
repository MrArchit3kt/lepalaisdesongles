"use client";

import {
  CalendarDays,
  Check,
  Sparkles,
  UserRound,
  WalletCards,
} from "lucide-react";

import { cn } from "@/lib/utils";

import type {
  ReservationProgressItem,
  ReservationStep,
} from "./reservation.types";

type ReservationProgressProps = {
  currentStep: ReservationStep;
  completedStep: number;
};

const PROGRESS_ITEMS: Array<{
  step: ReservationStep;
  label: string;
  mobileLabel: string;
  description: string;
  icon: typeof Sparkles;
}> = [
  {
    step: 1,
    label: "Prestations",
    mobileLabel: "Services",
    description: "Choisissez vos soins",
    icon: Sparkles,
  },
  {
    step: 2,
    label: "Professionnelle",
    mobileLabel: "Pro",
    description: "Sélectionnez votre experte",
    icon: UserRound,
  },
  {
    step: 3,
    label: "Date et créneau",
    mobileLabel: "Créneau",
    description: "Trouvez votre disponibilité",
    icon: CalendarDays,
  },
  {
    step: 4,
    label: "Validation",
    mobileLabel: "Validation",
    description: "Confirmez votre rendez-vous",
    icon: WalletCards,
  },
];

export function ReservationProgress({
  currentStep,
  completedStep,
}: ReservationProgressProps) {
  const items: ReservationProgressItem[] =
    PROGRESS_ITEMS.map((item) => ({
      step: item.step,
      label: item.label,
      completed: completedStep > item.step,
      active: currentStep === item.step,
    }));

  const progressionPercentage =
    ((Math.max(currentStep, 1) - 1) /
      (PROGRESS_ITEMS.length - 1)) *
    100;

  return (
    <nav
      aria-label="Progression de la réservation"
      className="relative overflow-hidden rounded-[2rem] border border-[#EFDEE4] bg-white/95 px-4 py-5 shadow-[0_20px_55px_rgba(85,38,55,0.09)] backdrop-blur sm:px-6 sm:py-6"
    >
      <div className="pointer-events-none absolute -right-20 -top-20 size-48 rounded-full bg-[#E8B4C0]/30 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-24 -left-20 size-52 rounded-full bg-[#D6B679]/15 blur-3xl" />

      <div className="relative">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#A5526D]">
              Réservation en ligne
            </p>

            <p className="mt-2 font-serif text-lg font-semibold text-[#2F2027]">
              Étape {currentStep} sur{" "}
              {PROGRESS_ITEMS.length}
            </p>
          </div>

          <span className="inline-flex items-center gap-2 rounded-full border border-[#E8C3CF] bg-[#FFF4F7] px-3 py-1.5 text-xs font-black text-[#843F59] shadow-sm">
            <Sparkles className="size-3.5 text-[#A5526D]" />
            Quelques minutes
          </span>
        </div>

        <div className="relative">
          <div className="absolute left-[12.5%] right-[12.5%] top-5 hidden h-1 overflow-hidden rounded-full bg-[#F0E3E7] sm:block">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#B45F7A] via-[#C97992] to-[#D6B679] shadow-[0_0_12px_rgba(180,95,122,0.30)] transition-[width] duration-500"
              style={{
                width: `${progressionPercentage}%`,
              }}
            />
          </div>

          <ol className="relative grid grid-cols-4 gap-2 sm:gap-4">
            {PROGRESS_ITEMS.map(
              (item, index) => {
                const progressItem =
                  items[index];

                const Icon = item.icon;

                const completed =
                  progressItem.completed;

                const active =
                  progressItem.active;

                const reached =
                  completed || active;

                return (
                  <li
                    key={item.step}
                    aria-current={
                      active ? "step" : undefined
                    }
                    className="min-w-0"
                  >
                    <div className="flex flex-col items-center text-center">
                      <span
                        className={cn(
                          "relative z-10 grid size-10 place-items-center rounded-full border transition duration-300 sm:size-11",
                          completed &&
                            "border-[#843F59] bg-gradient-to-br from-[#B45F7A] to-[#843F59] text-white shadow-[0_8px_20px_rgba(132,63,89,0.22)]",
                          active &&
                            "border-[#D6B679] bg-gradient-to-br from-[#D6B679] via-[#B45F7A] to-[#843F59] text-white shadow-[0_10px_26px_rgba(132,63,89,0.26)] ring-4 ring-[#F9E7ED]",
                          !reached &&
                            "border-[#E8DDE1] bg-[#FFF9FA] text-[#A68C96]",
                        )}
                      >
                        {completed ? (
                          <Check className="size-4.5" />
                        ) : (
                          <Icon className="size-4.5" />
                        )}

                        {active ? (
                          <span className="absolute -right-1 -top-1 size-3 rounded-full border-2 border-white bg-[#D6B679] shadow-sm" />
                        ) : null}
                      </span>

                      <span
                        className={cn(
                          "mt-3 block max-w-full truncate text-[0.68rem] font-semibold transition sm:hidden",
                          reached
                            ? "text-[#2F2027]"
                            : "text-[#A68C96]",
                        )}
                      >
                        {item.mobileLabel}
                      </span>

                      <div className="mt-3 hidden sm:block">
                        <span
                          className={cn(
                            "block text-sm font-semibold transition",
                            reached
                              ? "text-[#2F2027]"
                              : "text-[#A68C96]",
                          )}
                        >
                          {item.label}
                        </span>

                        <span className="mt-1 block text-xs leading-5 text-[#8E747E]">
                          {item.description}
                        </span>
                      </div>
                    </div>
                  </li>
                );
              },
            )}
          </ol>
        </div>
      </div>
    </nav>
  );
}