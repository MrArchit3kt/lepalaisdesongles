"use client";

import Image from "next/image";
import {
  Check,
  Crown,
  Sparkles,
  UserRound,
  UsersRound,
  WandSparkles,
} from "lucide-react";

import { cn } from "@/lib/utils";

import type {
  StaffMember,
} from "./reservation.types";

type ReservationStaffProps = {
  selectedServiceIds: string[];
  staffMembers: StaffMember[];
  compatibleStaff: StaffMember[];
  selectedStaffId: string;
  onSelectStaff: (staffId: string) => void;
};

export function ReservationStaff({
  selectedServiceIds,
  staffMembers,
  compatibleStaff,
  selectedStaffId,
  onSelectStaff,
}: ReservationStaffProps) {
  const hasSelectedServices =
    selectedServiceIds.length > 0;

  const hasCompatibleStaff =
    compatibleStaff.length > 0;

  const selectedAutomatically =
    selectedStaffId === "any";

  return (
    <section
      id="reservation-staff"
      aria-labelledby="reservation-staff-title"
      className="relative overflow-hidden rounded-[2rem] border border-[#EFDEE4] bg-white/95 p-5 shadow-[0_22px_58px_rgba(85,38,55,0.09)] backdrop-blur sm:p-7 lg:p-8"
    >
      <div className="pointer-events-none absolute -right-24 -top-24 size-64 rounded-full bg-[#E8B4C0]/28 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-28 -left-20 size-64 rounded-full bg-[#D6B679]/12 blur-3xl" />

      <div className="relative">
        <header className="flex flex-col gap-5 border-b border-[#F0E1E6] pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-white/40 bg-gradient-to-br from-[#C97992] via-[#B45F7A] to-[#843F59] text-white shadow-[0_12px_28px_rgba(132,63,89,0.24)]">
              <UserRound className="size-5" />
            </span>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#A5526D]">
                Étape 2
              </p>

              <h2
                id="reservation-staff-title"
                className="mt-2 font-serif text-3xl font-semibold tracking-tight text-[#2F2027] sm:text-4xl"
              >
                Choisissez votre professionnelle
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-[#816D75]">
                Sélectionnez votre prothésiste préférée
                ou laissez le salon vous proposer le
                meilleur créneau disponible.
              </p>
            </div>
          </div>

          <span className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full border border-[#E8C3CF] bg-[#FFF8FA] px-4 py-2 text-xs font-black text-[#816D75] shadow-sm">
            <UsersRound className="size-4 text-[#A5526D]" />
            {staffMembers.length} professionnelle
            {staffMembers.length > 1 ? "s" : ""}
          </span>
        </header>

        {!hasSelectedServices ? (
          <div className="mt-8 rounded-[1.75rem] border border-dashed border-[#D9B4C0] bg-gradient-to-br from-white to-[#FFF4F7] px-6 py-12 text-center shadow-[0_16px_40px_rgba(85,38,55,0.05)]">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl border border-[#E8C3CF] bg-gradient-to-br from-[#FFF0F5] to-[#F4D4DE] text-[#A5526D] shadow-sm">
              <Sparkles className="size-6" />
            </span>

            <h3 className="mt-5 font-serif text-2xl font-semibold text-[#2F2027]">
              Choisissez d’abord vos prestations
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#816D75]">
              Les professionnelles compatibles seront
              affichées automatiquement selon les soins
              sélectionnés.
            </p>
          </div>
        ) : !hasCompatibleStaff ? (
          <div className="mt-8 rounded-[1.75rem] border border-[#E8D39F] bg-gradient-to-br from-[#FFFBEF] to-[#FFF6DC] px-6 py-10 text-center shadow-[0_16px_40px_rgba(154,106,24,0.06)]">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl border border-[#E8D39F] bg-white text-[#9A6A18] shadow-sm">
              <WandSparkles className="size-6" />
            </span>

            <h3 className="mt-5 font-serif text-2xl font-semibold text-[#72501A]">
              Aucune professionnelle compatible
            </h3>

            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#886221]">
              Aucune professionnelle ne réalise
              actuellement l’ensemble des prestations
              sélectionnées. Retirez une prestation ou
              contactez directement le salon.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <button
              type="button"
              onClick={() => onSelectStaff("any")}
              aria-pressed={selectedAutomatically}
              className={cn(
                "group relative flex min-h-60 flex-col overflow-hidden rounded-[1.75rem] border p-5 text-left outline-none transition duration-300 focus-visible:ring-4 focus-visible:ring-[#E8B4C0]/30 sm:p-6",
                selectedAutomatically
                  ? "border-[#B45F7A] bg-gradient-to-br from-white via-[#FFF2F6] to-[#F6DCE4] shadow-[0_20px_48px_rgba(132,63,89,0.14)] ring-1 ring-[#D8AAB9]/40"
                  : "border-[#EFDEE4] bg-white/90 shadow-[0_10px_28px_rgba(85,38,55,0.05)] hover:-translate-y-1 hover:border-[#DDBAC5] hover:bg-white hover:shadow-[0_20px_46px_rgba(132,63,89,0.11)]",
              )}
            >
              <span className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-[#E8B4C0]/35 blur-3xl" />

              <div className="relative flex items-start justify-between gap-4">
                <span className="grid size-16 place-items-center rounded-[1.35rem] border border-white/40 bg-gradient-to-br from-[#B45F7A] to-[#843F59] text-white shadow-[0_12px_28px_rgba(132,63,89,0.24)]">
                  <WandSparkles className="size-7" />
                </span>

                <span
                  className={cn(
                    "grid size-10 place-items-center rounded-full border transition",
                    selectedAutomatically
                      ? "border-[#D6B679] bg-gradient-to-br from-[#B45F7A] to-[#843F59] text-white shadow-[0_9px_22px_rgba(132,63,89,0.24)]"
                      : "border-[#E8DDE1] bg-white text-[#A68C96] group-hover:border-[#D8AAB9] group-hover:text-[#A5526D]",
                  )}
                >
                  {selectedAutomatically ? (
                    <Check className="size-5" />
                  ) : (
                    <Sparkles className="size-5" />
                  )}
                </span>
              </div>

              <div className="relative mt-5">
                <span className="inline-flex rounded-full bg-gradient-to-r from-[#D6B679] to-[#B9924C] px-3 py-1 text-[0.65rem] font-black uppercase tracking-[0.12em] text-white shadow-sm">
                  Recommandé
                </span>

                <h3 className="mt-3 font-serif text-2xl font-semibold leading-tight text-[#2F2027]">
                  Première professionnelle disponible
                </h3>

                <p className="mt-3 text-sm leading-7 text-[#816D75]">
                  Le salon choisit automatiquement la
                  professionnelle compatible proposant
                  le meilleur créneau.
                </p>
              </div>

              <div className="relative mt-auto border-t border-[#F0E1E6] pt-5">
                <p className="text-xs font-black text-[#A5526D]">
                  Idéal pour réserver rapidement
                </p>
              </div>
            </button>

            {compatibleStaff.map((staff) => {
              const selected =
                selectedStaffId === staff.id;

              return (
                <button
                  key={staff.id}
                  type="button"
                  onClick={() =>
                    onSelectStaff(staff.id)
                  }
                  aria-pressed={selected}
                  className={cn(
                    "group relative flex min-h-60 flex-col overflow-hidden rounded-[1.75rem] border p-5 text-left outline-none transition duration-300 focus-visible:ring-4 focus-visible:ring-[#E8B4C0]/30 sm:p-6",
                    selected
                      ? "border-[#B45F7A] bg-gradient-to-br from-white via-[#FFF2F6] to-[#F6DCE4] shadow-[0_20px_48px_rgba(132,63,89,0.14)] ring-1 ring-[#D8AAB9]/40"
                      : "border-[#EFDEE4] bg-white/90 shadow-[0_10px_28px_rgba(85,38,55,0.05)] hover:-translate-y-1 hover:border-[#DDBAC5] hover:bg-white hover:shadow-[0_20px_46px_rgba(132,63,89,0.11)]",
                  )}
                >
                  <span className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-[#E8B4C0]/28 blur-3xl" />

                  <div className="relative flex items-start justify-between gap-4">
                    <div className="relative size-16 shrink-0 overflow-hidden rounded-[1.35rem] border border-[#E8C3CF] bg-[#F4E4E8] shadow-[0_8px_20px_rgba(85,38,55,0.10)]">
                      {staff.image ? (
                        <Image
                          src={staff.image}
                          alt={staff.displayName}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="grid size-full place-items-center bg-gradient-to-br from-[#E8B4C0] via-[#B45F7A] to-[#843F59] text-white">
                          <UserRound className="size-7" />
                        </div>
                      )}
                    </div>

                    <span
                      className={cn(
                        "grid size-10 place-items-center rounded-full border transition",
                        selected
                          ? "border-[#D6B679] bg-gradient-to-br from-[#B45F7A] to-[#843F59] text-white shadow-[0_9px_22px_rgba(132,63,89,0.24)]"
                          : "border-[#E8DDE1] bg-white text-[#A68C96] group-hover:border-[#D8AAB9] group-hover:text-[#A5526D]",
                      )}
                    >
                      {selected ? (
                        <Check className="size-5" />
                      ) : (
                        <UserRound className="size-5" />
                      )}
                    </span>
                  </div>

                  <div className="relative mt-5">
                    <div className="flex flex-wrap items-center gap-2">
                      {staff.isOwner ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#D6B679] to-[#B9924C] px-3 py-1 text-[0.65rem] font-black uppercase tracking-[0.12em] text-white shadow-sm">
                          <Crown className="size-3" />
                          Fondatrice
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full border border-[#E8C3CF] bg-white/85 px-3 py-1 text-[0.65rem] font-black uppercase tracking-[0.12em] text-[#A5526D] shadow-sm">
                          Prothésiste ongulaire
                        </span>
                      )}
                    </div>

                    <h3 className="mt-3 font-serif text-2xl font-semibold leading-tight text-[#2F2027]">
                      {staff.displayName}
                    </h3>

                    <p className="mt-3 line-clamp-3 text-sm leading-7 text-[#816D75]">
                      {staff.bio ??
                        (staff.isOwner
                          ? "Responsable du salon et passionnée par la mise en beauté de vos ongles."
                          : "Professionnelle attentive à vos envies et à la réalisation de prestations soignées.")}
                    </p>
                  </div>

                  <div className="relative mt-auto flex items-center justify-between gap-3 border-t border-[#F0E1E6] pt-5">
                    <span className="text-xs font-black text-[#A5526D]">
                      {selected
                        ? "Professionnelle sélectionnée"
                        : "Choisir cette professionnelle"}
                    </span>

                    {selected ? (
                      <Check className="size-4 text-[#A5526D]" />
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}