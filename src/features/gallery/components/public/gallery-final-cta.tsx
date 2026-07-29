"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Check,
  Heart,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  motion,
} from "framer-motion";

const REASSURANCE_ITEMS = [
  {
    icon: CalendarDays,
    label:
      "Réservation en ligne",
  },
  {
    icon: ShieldCheck,
    label:
      "Prestations soignées",
  },
  {
    icon: Heart,
    label:
      "Conseils personnalisés",
  },
];

export function GalleryFinalCta() {
  return (
    <section className="relative overflow-hidden px-4 pb-20 pt-4 sm:px-6 sm:pb-24 lg:px-8 lg:pb-32">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{
            opacity: 0,
            y: 30,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            margin: "-80px",
          }}
          transition={{
            duration: 0.6,
          }}
          className="relative overflow-hidden rounded-[2.5rem] border border-pink-200/70 bg-zinc-950 px-6 py-12 shadow-[0_40px_120px_-45px_rgba(190,24,93,0.55)] sm:px-10 sm:py-16 lg:px-16 lg:py-20"
        >
          <div
            aria-hidden="true"
            className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-pink-600/30 blur-3xl"
          />

          <div
            aria-hidden="true"
            className="absolute -bottom-40 -right-24 h-[28rem] w-[28rem] rounded-full bg-fuchsia-500/20 blur-3xl"
          />

          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_38%)]"
          />

          <div className="relative grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_390px] lg:gap-16">
            <div>
              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.95,
                }}
                whileInView={{
                  opacity: 1,
                  scale: 1,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  delay: 0.15,
                  duration: 0.45,
                }}
                className="inline-flex items-center gap-2 rounded-full border border-pink-300/20 bg-pink-500/10 px-4 py-2 text-sm font-bold text-pink-200 backdrop-blur"
              >
                <Sparkles className="h-4 w-4" />

                Votre prochaine pose commence ici
              </motion.div>

              <h2 className="mt-6 max-w-3xl text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
                Une création vous a
                inspirée ?
              </h2>

              <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-300 sm:text-lg">
                Réservez votre
                rendez-vous en
                quelques instants et
                indiquez vos envies
                lors de votre
                réservation. Vous
                pourrez également
                ajouter vos propres
                photos d’inspiration.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {REASSURANCE_ITEMS.map(
                  ({
                    icon: Icon,
                    label,
                  }) => (
                    <div
                      key={label}
                      className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 backdrop-blur-sm"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-500/15 text-pink-300">
                        <Icon className="h-4 w-4" />
                      </span>

                      <span className="text-sm font-semibold text-white">
                        {label}
                      </span>
                    </div>
                  ),
                )}
              </div>
            </div>

            <motion.div
              initial={{
                opacity: 0,
                x: 24,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                delay: 0.2,
                duration: 0.5,
              }}
              className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-5 shadow-2xl backdrop-blur-xl sm:p-6"
            >
              <div className="rounded-[1.5rem] bg-white p-6 sm:p-7">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-pink-600">
                  Réserver maintenant
                </p>

                <h3 className="mt-3 text-2xl font-black tracking-tight text-zinc-950">
                  Choisissez votre
                  prestation et votre
                  créneau
                </h3>

                <div className="mt-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-pink-100 text-pink-700">
                      <Check className="h-3.5 w-3.5" />
                    </span>

                    <p className="text-sm leading-6 text-zinc-600">
                      Durée et tarif
                      calculés
                      automatiquement.
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-pink-100 text-pink-700">
                      <Check className="h-3.5 w-3.5" />
                    </span>

                    <p className="text-sm leading-6 text-zinc-600">
                      Disponibilités
                      affichées en
                      temps réel.
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-pink-100 text-pink-700">
                      <Check className="h-3.5 w-3.5" />
                    </span>

                    <p className="text-sm leading-6 text-zinc-600">
                      Photos
                      d’inspiration
                      ajoutables à la
                      réservation.
                    </p>
                  </div>
                </div>

                <Link
                  href="/reservation"
                  className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-pink-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-pink-200 transition duration-300 hover:-translate-y-0.5 hover:bg-pink-700 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-pink-200"
                >
                  Prendre rendez-vous

                  <ArrowRight className="h-4 w-4" />
                </Link>

                <p className="mt-4 text-center text-xs leading-5 text-zinc-500">
                  Réservation simple,
                  rapide et
                  sécurisée.
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}