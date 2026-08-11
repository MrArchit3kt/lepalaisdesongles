import {
  ArrowRight,
  Gift,
  Percent,
  Sparkles,
  Trophy,
} from "lucide-react";
import Link from "next/link";

import type { HomePageData } from "@/features/public/services/home.service";

type HomeOffersProps = {
  promotion: HomePageData["activePromotion"];
  contest: HomePageData["activeContest"];
};

export function HomeOffers({
  promotion,
  contest,
}: HomeOffersProps) {
  if (!promotion && !contest) {
    return null;
  }

  return (
    <section className="bg-[#FFFAFB] py-10 sm:py-14 lg:py-24">
      <div className="mx-auto grid max-w-7xl gap-6 px-5 lg:grid-cols-2 lg:px-8">
        {promotion ? (
          <article className="relative overflow-hidden rounded-[36px] bg-gradient-to-br from-[#3B2430] via-[#4A2A3A] to-[#2E1E28] p-8 text-white sm:p-10">
            <div className="absolute -right-20 -top-20 size-64 rounded-full bg-[#C47890]/25 blur-3xl" />

            <div className="relative">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-white/10 text-[#F0C4D3]">
                <Percent className="size-5" />
              </span>

              <p className="mt-7 text-[10px] font-black uppercase tracking-[0.24em] text-[#F0C4D3]">
                Offre du moment
              </p>

              <h2 className="mt-3 font-serif text-4xl italic">
                {promotion.name}
              </h2>

              <p className="mt-4 max-w-lg leading-7 text-white/65">
                {promotion.description}
              </p>

              {promotion.code ? (
                <div className="mt-6 inline-flex rounded-full border border-dashed border-white/25 bg-white/5 px-5 py-3">
                  <span className="text-xs uppercase tracking-[0.18em] text-white/55">
                    Code&nbsp;
                  </span>

                  <span className="ml-2 font-semibold">
                    {promotion.code}
                  </span>
                </div>
              ) : null}

              <div className="mt-8">
                <Link
                  href="/promotions"
                  className="inline-flex items-center gap-2 text-sm font-semibold"
                >
                  Découvrir l’offre
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          </article>
        ) : null}

        {contest ? (
          <article className="relative overflow-hidden rounded-[36px] border border-[#F0DCE3] bg-white p-8 sm:p-10">
            <div className="absolute -bottom-20 -right-20 size-60 rounded-full bg-[#D6B778]/15 blur-3xl" />

            <div className="relative">
              <div className="flex items-start justify-between">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-[#FFF0F4] text-[#A64D69]">
                  <Trophy className="size-5" />
                </span>

                <Sparkles className="size-6 text-[#D6B778]" />
              </div>

              <p className="mt-7 text-[10px] font-black uppercase tracking-[0.24em] text-[#A44E69]">
                Jeu concours
              </p>

              <h2 className="mt-3 font-serif text-4xl text-[#35242B]">
                {contest.title}
              </h2>

              <p className="mt-4 max-w-lg leading-7 text-[#79636C]">
                {contest.description}
              </p>

              <div className="mt-6 flex items-start gap-3 rounded-2xl bg-[#F2E3BD]/50 p-4">
                <Gift className="mt-0.5 size-5 shrink-0 text-[#B4863B]" />

                <p className="text-sm leading-6 text-[#6C5840]">
                  <span className="font-semibold">
                    À gagner :
                  </span>{" "}
                  {contest.prize}
                </p>
              </div>

              <div className="mt-8">
                <Link
                  href={`/concours/${contest.slug}`}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#A64D69]"
                >
                  Participer au concours
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          </article>
        ) : null}
      </div>
    </section>
  );
}
