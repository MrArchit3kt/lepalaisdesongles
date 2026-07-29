"use client";

import { useRef } from "react";
import {
  AlertTriangle,
  CalendarX2,
  X,
} from "lucide-react";

import { cancelAppointmentAction } from "@/features/client/actions/cancel-appointment.action";

type CancelAppointmentButtonProps = {
  reference: string;
  startsAt: string;
  depositCents: number;
  paymentStatus: string;
};

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

function getHoursUntilAppointment(
  startsAt: string,
): number {
  const appointmentDate = new Date(startsAt);

  return (
    appointmentDate.getTime() -
    Date.now()
  ) / (1000 * 60 * 60);
}

export function CancelAppointmentButton({
  reference,
  startsAt,
  depositCents,
  paymentStatus,
}: CancelAppointmentButtonProps) {
  const dialogReference =
    useRef<HTMLDialogElement>(null);

  const hoursUntilAppointment =
    getHoursUntilAppointment(startsAt);

  const isLateCancellation =
    hoursUntilAppointment < 48;

  const hasPaidDeposit =
    paymentStatus === "PAID" &&
    depositCents > 0;

  function openDialog() {
    dialogReference.current?.showModal();
  }

  function closeDialog() {
    dialogReference.current?.close();
  }

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-50"
      >
        <CalendarX2 className="size-4" />
        Annuler mon rendez-vous
      </button>

      <dialog
        ref={dialogReference}
        className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-[28px] border-0 bg-white p-0 text-[#241A1D] shadow-2xl backdrop:bg-[#241A1D]/60 backdrop:backdrop-blur-sm"
      >
        <form
          action={cancelAppointmentAction}
          className="overflow-hidden rounded-[28px]"
        >
          <input
            type="hidden"
            name="reference"
            value={reference}
          />

          <header className="flex items-start justify-between gap-5 border-b border-[#241A1D]/8 bg-[#FFF9F8] p-6 sm:p-7">
            <div className="flex gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-700">
                <CalendarX2 className="size-6" />
              </span>

              <div>
                <h2 className="font-serif text-2xl">
                  Annuler le rendez-vous
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#75636A]">
                  Cette action rendra votre créneau
                  disponible pour une autre cliente.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={closeDialog}
              aria-label="Fermer"
              className="flex size-9 shrink-0 items-center justify-center rounded-full text-[#75636A] transition hover:bg-[#241A1D]/5 hover:text-[#241A1D]"
            >
              <X className="size-5" />
            </button>
          </header>

          <div className="space-y-5 p-6 sm:p-7">
            {isLateCancellation ? (
              <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-700" />

                <div>
                  <p className="font-semibold text-amber-900">
                    Annulation à moins de 48 heures
                  </p>

                  <p className="mt-1 text-sm leading-6 text-amber-800">
                    Conformément aux conditions du
                    salon, toute somme déjà versée
                    pourra être conservée.
                  </p>

                  {hasPaidDeposit ? (
                    <p className="mt-2 text-sm font-semibold text-amber-900">
                      Acompte concerné :{" "}
                      {formatCurrency(
                        depositCents,
                      )}
                    </p>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-800">
                Votre demande intervient plus de
                48 heures avant le rendez-vous.
                L’éventuel traitement financier sera
                réalisé séparément par le salon.
              </div>
            )}

            <div>
              <label
                htmlFor="cancellation-reason"
                className="text-sm font-semibold text-[#241A1D]"
              >
                Motif de l’annulation
              </label>

              <textarea
                id="cancellation-reason"
                name="reason"
                required
                minLength={5}
                maxLength={500}
                rows={5}
                placeholder="Expliquez brièvement la raison de votre annulation…"
                className="mt-2 w-full resize-none rounded-2xl border border-[#241A1D]/15 bg-white px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-[#A9969D] focus:border-[#9D6F80] focus:ring-4 focus:ring-[#9D6F80]/10"
              />

              <p className="mt-2 text-xs text-[#927E85]">
                Entre 5 et 500 caractères.
              </p>
            </div>
          </div>

          <footer className="flex flex-col-reverse gap-3 border-t border-[#241A1D]/8 bg-[#FFF9F8] p-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={closeDialog}
              className="rounded-xl border border-[#241A1D]/15 bg-white px-5 py-3 text-sm font-semibold text-[#241A1D] transition hover:bg-[#FFF5F3]"
            >
              Conserver mon rendez-vous
            </button>

            <button
              type="submit"
              className="rounded-xl bg-red-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-800"
            >
              Confirmer l’annulation
            </button>
          </footer>
        </form>
      </dialog>
    </>
  );
}
