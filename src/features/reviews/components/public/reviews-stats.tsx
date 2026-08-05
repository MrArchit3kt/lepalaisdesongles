import {
  Award,
  BadgeCheck,
  HeartHandshake,
  Star,
} from "lucide-react";

import type {
  ReviewsSummary,
} from "./reviews.types";

type ReviewsStatsProps = {
  summary: ReviewsSummary;
};

function formatRating(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
}

export function ReviewsStats({
  summary,
}: ReviewsStatsProps) {
  const cards = [
    {
      title: "Note moyenne",
      value: `${formatRating(summary.averageRating)}/5`,
      icon: Star,
    },
    {
      title: "Avis vérifiés",
      value: summary.verifiedReviews.toString(),
      icon: BadgeCheck,
    },
    {
      title: "Satisfaction",
      value: `${summary.satisfactionRate}%`,
      icon: HeartHandshake,
    },
    {
      title: "Avis publiés",
      value: summary.totalReviews.toString(),
      icon: Award,
    },
  ];

  return (
    <section className="relative bg-[#FFFAFB] px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.title}
                className="group relative overflow-hidden rounded-[1.75rem] border border-[#F0DCE3] bg-white p-6 shadow-[0_18px_50px_-30px_rgba(139,64,90,0.35)] transition duration-300 hover:-translate-y-1"
              >
                <div
                  aria-hidden="true"
                  className="absolute right-0 top-0 h-28 w-28 -translate-y-6 translate-x-6 rounded-full bg-[#E8B3C3]/25 blur-2xl"
                />

                <div className="relative">
                  <span className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-[#AA526E] via-[#BD7088] to-[#8B405A] text-white shadow-[0_10px_25px_rgba(139,64,90,0.3)]">
                    <Icon className="size-5" />
                  </span>

                  <p className="mt-5 text-[11px] font-black uppercase tracking-[0.16em] text-[#8C747D]">
                    {card.title}
                  </p>

                  <p className="mt-2 font-serif text-3xl font-semibold tracking-tight text-[#35242B]">
                    {card.value}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 overflow-hidden rounded-[2rem] border border-[#F0DCE3] bg-white shadow-[0_24px_65px_-40px_rgba(139,64,90,0.35)]">
          <div className="border-b border-[#F0DCE3] px-8 py-6">
            <h2 className="font-serif text-2xl font-semibold text-[#35242B]">
              Répartition des notes
            </h2>

            <p className="mt-2 text-sm text-[#79636C]">
              Transparence totale sur les évaluations des clientes.
            </p>
          </div>

          <div className="space-y-5 px-8 py-8">
            {summary.distribution
              .slice()
              .sort((a, b) => b.rating - a.rating)
              .map((item) => (
                <div
                  key={item.rating}
                  className="flex items-center gap-4"
                >
                  <div className="flex w-16 items-center gap-1 font-bold text-[#3D2A32]">
                    {item.rating}

                    <Star className="size-4 fill-[#A64D69] text-[#A64D69]" />
                  </div>

                  <div className="h-3 flex-1 overflow-hidden rounded-full bg-[#F6E7EB]">
                    <div
                      style={{
                        width: `${item.percentage}%`,
                      }}
                      className="h-full rounded-full bg-gradient-to-r from-[#AA526E] to-[#8B405A]"
                    />
                  </div>

                  <div className="w-16 text-right text-sm font-semibold text-[#79636C]">
                    {item.count}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </section>
  );
}
