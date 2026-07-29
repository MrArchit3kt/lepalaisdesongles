"use client";

import {
  Award,
  BadgeCheck,
  HeartHandshake,
  Star,
} from "lucide-react";
import { motion } from "framer-motion";

import type {
  ReviewsSummary,
} from "./reviews.types";

type ReviewsStatsProps = {
  summary: ReviewsSummary;
};

function formatRating(
  value: number,
) {
  return new Intl.NumberFormat(
    "fr-FR",
    {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    },
  ).format(value);
}

export function ReviewsStats({
  summary,
}: ReviewsStatsProps) {
  const cards = [
    {
      title: "Note moyenne",
      value: `${formatRating(
        summary.averageRating,
      )}/5`,
      icon: Star,
      color:
        "from-pink-500 to-fuchsia-500",
    },
    {
      title: "Avis vérifiés",
      value:
        summary.verifiedReviews.toString(),
      icon: BadgeCheck,
      color:
        "from-emerald-500 to-teal-500",
    },
    {
      title: "Satisfaction",
      value: `${summary.satisfactionRate}%`,
      icon: HeartHandshake,
      color:
        "from-violet-500 to-indigo-500",
    },
    {
      title: "Avis publiés",
      value:
        summary.totalReviews.toString(),
      icon: Award,
      color:
        "from-amber-500 to-orange-500",
    },
  ];

  return (
    <section className="relative px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {cards.map(
            (
              card,
              index,
            ) => {
              const Icon =
                card.icon;

              return (
                <motion.div
                  key={
                    card.title
                  }
                  initial={{
                    opacity: 0,
                    y: 24,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{
                    once: true,
                    margin:
                      "-60px",
                  }}
                  transition={{
                    duration:
                      0.45,
                    delay:
                      index *
                      0.08,
                  }}
                  className="group relative overflow-hidden rounded-[2rem] border border-pink-100 bg-white p-6 shadow-[0_25px_70px_-35px_rgba(236,72,153,0.35)] transition duration-300 hover:-translate-y-1"
                >
                  <div
                    aria-hidden="true"
                    className={`absolute right-0 top-0 h-36 w-36 translate-x-8 -translate-y-8 rounded-full bg-gradient-to-br ${card.color} opacity-10 blur-2xl`}
                  />

                  <div className="relative">
                    <div
                      className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${card.color} text-white shadow-lg`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>

                    <p className="mt-6 text-sm font-bold uppercase tracking-[0.16em] text-zinc-500">
                      {card.title}
                    </p>

                    <p className="mt-3 text-4xl font-black tracking-tight text-zinc-950">
                      {card.value}
                    </p>
                  </div>
                </motion.div>
              );
            },
          )}
        </div>

        <motion.div
          initial={{
            opacity: 0,
            y: 24,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            delay: 0.35,
            duration: 0.45,
          }}
          className="mt-10 overflow-hidden rounded-[2.5rem] border border-pink-100 bg-white shadow-[0_35px_90px_-45px_rgba(236,72,153,0.3)]"
        >
          <div className="border-b border-pink-100 px-8 py-6">
            <h2 className="text-2xl font-black text-zinc-950">
              Répartition des notes
            </h2>

            <p className="mt-2 text-sm text-zinc-500">
              Transparence totale sur
              les évaluations des
              clientes.
            </p>
          </div>

          <div className="space-y-5 px-8 py-8">
            {summary.distribution
              .slice()
              .sort(
                (
                  a,
                  b,
                ) =>
                  b.rating -
                  a.rating,
              )
              .map(
                (
                  item,
                  index,
                ) => (
                  <motion.div
                    key={
                      item.rating
                    }
                    initial={{
                      opacity: 0,
                      x: -18,
                    }}
                    whileInView={{
                      opacity: 1,
                      x: 0,
                    }}
                    viewport={{
                      once: true,
                    }}
                    transition={{
                      delay:
                        index *
                        0.06,
                    }}
                    className="flex items-center gap-4"
                  >
                    <div className="flex w-16 items-center gap-1 font-bold text-zinc-800">
                      {item.rating}

                      <Star className="h-4 w-4 fill-pink-500 text-pink-500" />
                    </div>

                    <div className="h-3 flex-1 overflow-hidden rounded-full bg-zinc-100">
                      <motion.div
                        initial={{
                          width: 0,
                        }}
                        whileInView={{
                          width: `${item.percentage}%`,
                        }}
                        viewport={{
                          once: true,
                        }}
                        transition={{
                          duration:
                            0.7,
                          delay:
                            index *
                            0.08,
                        }}
                        className="h-full rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500"
                      />
                    </div>

                    <div className="w-16 text-right text-sm font-semibold text-zinc-600">
                      {item.count}
                    </div>
                  </motion.div>
                ),
              )}
          </div>
        </motion.div>
      </div>
    </section>
      );
    }