import {
  CalendarDays,
  Clock3,
  MessageCircle,
} from "lucide-react";

import Image from "next/image";
import Link from "next/link";

import type {
  HomePageData,
} from "@/features/public/services/home.service";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type BookingCtaProps = {
  workingHours:
    HomePageData["workingHours"];

  imageUrl?: string;
};

/* -------------------------------------------------------------------------- */
/*                              CONFIGURATION                                 */
/* -------------------------------------------------------------------------- */

const dayLabels:
  Record<
    string,
    string
  > = {
  MONDAY:
    "Lundi",

  TUESDAY:
    "Mardi",

  WEDNESDAY:
    "Mercredi",

  THURSDAY:
    "Jeudi",

  FRIDAY:
    "Vendredi",

  SATURDAY:
    "Samedi",

  SUNDAY:
    "Dimanche",
};

/* -------------------------------------------------------------------------- */
/*                                  COMPOSANT                                 */
/* -------------------------------------------------------------------------- */

export function BookingCta({
  workingHours,
  imageUrl = "",
}: BookingCtaProps) {
  return (
    <section className="bg-[#FFFAFB] py-10 sm:py-14 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid overflow-hidden rounded-[40px] bg-gradient-to-br from-[#3B2430] via-[#4A2A3A] to-[#2E1E28] shadow-2xl shadow-[#8B405A]/15 lg:grid-cols-[1.1fr_0.9fr]">
          {/* -------------------------------------------------------------- */}
          {/*                           APPEL À L’ACTION                      */}
          {/* -------------------------------------------------------------- */}

          <div className="relative min-h-[480px] overflow-hidden p-8 text-white sm:p-12 lg:p-16">
            {imageUrl ? (
              <>
                <Image
                  src={
                    imageUrl
                  }
                  alt="Prendre rendez-vous au Palais des Ongles"
                  fill
                  sizes="(max-width: 1023px) 100vw, 60vw"
                  className="object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-r from-[#2E1E28]/95 via-[#2E1E28]/80 to-[#2E1E28]/35" />

                <div className="absolute inset-0 bg-gradient-to-t from-[#2E1E28]/75 via-transparent to-[#2E1E28]/20" />
              </>
            ) : (
              <>
                <div className="absolute -left-20 -top-20 size-72 rounded-full bg-[#C47890]/20 blur-3xl" />

                <div className="absolute -bottom-32 right-0 size-80 rounded-full bg-[#D6B778]/10 blur-3xl" />
              </>
            )}

            <div className="relative flex h-full flex-col justify-center">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#F0C4D3]">
                Prendre rendez-vous
              </p>

              <h2 className="mt-5 max-w-xl font-serif text-4xl italic leading-tight sm:text-5xl">
                Votre prochain moment beauté commence ici.
              </h2>

              <p className="mt-6 max-w-lg leading-8 text-white/70">
                Sélectionnez votre prestation, choisissez
                votre créneau et envoyez vos inspirations
                directement depuis votre téléphone.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/reservation"
                  className="group inline-flex h-14 items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#AA526E] via-[#BD7088] to-[#8B405A] px-7 text-sm font-black text-white shadow-[0_18px_45px_rgba(139,64,90,0.35)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_55px_rgba(139,64,90,0.45)]"
                >
                  <CalendarDays className="size-5" />

                  Réserver maintenant
                </Link>

                <Link
                  href="/contact"
                  className="inline-flex h-14 items-center justify-center gap-3 rounded-full border border-white/20 bg-white/10 px-7 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15"
                >
                  <MessageCircle className="size-5" />

                  Poser une question
                </Link>
              </div>
            </div>
          </div>

          {/* -------------------------------------------------------------- */}
          {/*                              HORAIRES                          */}
          {/* -------------------------------------------------------------- */}

          <div className="bg-white/5 p-8 sm:p-12">
            <div className="flex items-center gap-3 text-white">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-white/10 text-[#F0C4D3]">
                <Clock3 className="size-5" />
              </span>

              <div>
                <p className="font-serif text-2xl">
                  Horaires d’ouverture
                </p>

                <p className="mt-1 text-sm text-white/50">
                  Sur rendez-vous uniquement
                </p>
              </div>
            </div>

            <div className="mt-8 divide-y divide-white/8">
              {workingHours.map(
                (
                  workingHour,
                ) => (
                  <div
                    key={
                      workingHour.id
                    }
                    className="flex items-center justify-between gap-4 py-3 text-sm"
                  >
                    <span className="text-white/60">
                      {
                        dayLabels[
                          workingHour.dayOfWeek
                        ]
                      }
                    </span>

                    <span className="font-medium text-white">
                      {workingHour.isOpen &&
                      workingHour.startTime &&
                      workingHour.endTime
                        ? `${workingHour.startTime} – ${workingHour.endTime}`
                        : "Fermé"}
                    </span>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
