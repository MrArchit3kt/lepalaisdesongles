"use client";

import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  MessageSquareHeart,
  Sparkles,
  Star,
} from "lucide-react";
import { motion } from "framer-motion";

type ReviewsHeroProps = {
  averageRating: number;
  totalReviews: number;
};

const STARS = Array.from({
  length: 5,
});

function formatRating(
  rating: number,
) {
  return new Intl.NumberFormat(
    "fr-FR",
    {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    },
  ).format(rating);
}

export function ReviewsHero({
  averageRating,
  totalReviews,
}: ReviewsHeroProps) {
  const safeAverageRating =
    Number.isFinite(
      averageRating,
    )
      ? Math.min(
          Math.max(
            averageRating,
            0,
          ),
          5,
        )
      : 0;

  return (
    <section className="relative isolate overflow-hidden border-b border-pink-100 bg-white">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20 bg-[linear-gradient(135deg,#fff_0%,#fff5f8_45%,#fdf2f8_100%)]"
      />

      <div
        aria-hidden="true"
        className="absolute -left-32 top-8 -z-10 h-[30rem] w-[30rem] rounded-full bg-pink-200/45 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="absolute -right-40 bottom-0 -z-10 h-[32rem] w-[32rem] rounded-full bg-fuchsia-200/35 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.95),transparent_38%)]"
      />

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 sm:py-24 lg:grid-cols-[minmax(0,1fr)_430px] lg:gap-16 lg:px-8 lg:py-28">
        <motion.div
          initial={{
            opacity: 0,
            y: 24,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.55,
          }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-pink-200 bg-white/80 px-4 py-2 text-sm font-bold text-pink-700 shadow-sm backdrop-blur">
            <MessageSquareHeart className="h-4 w-4" />

            Elles parlent de leur expérience
          </div>

          <h1 className="mt-6 max-w-4xl text-4xl font-black tracking-tight text-zinc-950 sm:text-5xl lg:text-6xl">
            Vos avis sont notre plus
            belle récompense
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-zinc-600 sm:text-lg">
            Découvrez les expériences
            partagées par les clientes du
            Palais des Ongles et
            choisissez votre prochaine
            prestation en toute confiance.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/reservation"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-pink-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-pink-200 transition duration-300 hover:-translate-y-0.5 hover:bg-pink-700 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-pink-200"
            >
              Prendre rendez-vous

              <ArrowRight className="h-4 w-4" />
            </Link>

            <a
              href="#avis-clients"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-6 py-4 text-sm font-bold text-zinc-800 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-pink-200 hover:text-pink-700 focus:outline-none focus:ring-4 focus:ring-pink-100"
            >
              Lire les avis

              <MessageSquareHeart className="h-4 w-4" />
            </a>
          </div>

          <div className="mt-8 flex flex-wrap gap-3 text-sm font-semibold text-zinc-600">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/70 px-4 py-2 shadow-sm backdrop-blur">
              <BadgeCheck className="h-4 w-4 text-pink-600" />

              Avis vérifiés
            </span>

            <span className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/70 px-4 py-2 shadow-sm backdrop-blur">
              <Sparkles className="h-4 w-4 text-pink-600" />

              Expérience personnalisée
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{
            opacity: 0,
            x: 28,
            scale: 0.97,
          }}
          animate={{
            opacity: 1,
            x: 0,
            scale: 1,
          }}
          transition={{
            delay: 0.12,
            duration: 0.6,
          }}
          className="relative"
        >
          <div
            aria-hidden="true"
            className="absolute inset-6 rounded-[2.5rem] bg-pink-500/20 blur-3xl"
          />

          <div className="relative overflow-hidden rounded-[2.25rem] border border-white/80 bg-zinc-950 p-6 text-white shadow-[0_35px_100px_-40px_rgba(190,24,93,0.55)] sm:p-8">
            <div
              aria-hidden="true"
              className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-pink-500/25 blur-3xl"
            />

            <div
              aria-hidden="true"
              className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-fuchsia-500/15 blur-3xl"
            />

            <div className="relative">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-pink-300">
                    Note moyenne
                  </p>

                  <div className="mt-3 flex items-end gap-3">
                    <span className="text-6xl font-black tracking-tight sm:text-7xl">
                      {formatRating(
                        safeAverageRating,
                      )}
                    </span>

                    <span className="pb-2 text-lg font-bold text-zinc-400">
                      / 5
                    </span>
                  </div>
                </div>

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-pink-300 backdrop-blur">
                  <Sparkles className="h-6 w-6" />
                </div>
              </div>

              <div
                className="mt-6 flex gap-1.5"
                aria-label={`${formatRating(
                  safeAverageRating,
                )} étoiles sur 5`}
              >
                {STARS.map(
                  (
                    _,
                    index,
                  ) => {
                    const starNumber =
                      index + 1;

                    const isFilled =
                      safeAverageRating >=
                      starNumber -
                        0.25;

                    return (
                      <motion.span
                        key={
                          starNumber
                        }
                        initial={{
                          opacity: 0,
                          scale: 0.65,
                        }}
                        animate={{
                          opacity: 1,
                          scale: 1,
                        }}
                        transition={{
                          delay:
                            0.32 +
                            index *
                              0.07,
                          duration: 0.25,
                        }}
                      >
                        <Star
                          className={`h-7 w-7 ${
                            isFilled
                              ? "fill-pink-500 text-pink-500"
                              : "fill-zinc-800 text-zinc-700"
                          }`}
                        />
                      </motion.span>
                    );
                  },
                )}
              </div>

              <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-white/[0.07] p-5 backdrop-blur">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-500/15 text-pink-300">
                    <MessageSquareHeart className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-2xl font-black">
                      {totalReviews}
                    </p>

                    <p className="text-sm text-zinc-400">
                      {totalReviews > 1
                        ? "avis publiés"
                        : "avis publié"}
                    </p>
                  </div>
                </div>
              </div>

              <p className="mt-6 text-sm leading-6 text-zinc-400">
                Chaque retour nous aide à
                améliorer continuellement
                votre expérience au salon.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}