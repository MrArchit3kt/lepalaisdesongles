import Link from "next/link";
import {
  ArrowRight,
  Heart,
  MessageSquareHeart,
  Sparkles,
} from "lucide-react";

import { ReviewsHero } from "@/features/reviews/components/public/reviews-hero";
import { ReviewsStats } from "@/features/reviews/components/public/reviews-stats";
import { PublicReviews } from "@/features/reviews/components/public/public-reviews";
import type {
  PublicReview,
  ReviewRatingDistribution,
  ReviewsSummary,
} from "@/features/reviews/components/public/reviews.types";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Avis clientes | Le Palais des Ongles",
  description:
    "Découvrez les avis des clientes du Palais des Ongles et leurs expériences après leur rendez-vous au salon.",
};

function calculateAverageRating(
  ratings: number[],
): number {
  if (ratings.length === 0) {
    return 0;
  }

  const total = ratings.reduce(
    (sum, rating) => sum + rating,
    0,
  );

  return total / ratings.length;
}

function calculateSatisfactionRate(
  ratings: number[],
): number {
  if (ratings.length === 0) {
    return 0;
  }

  const satisfiedReviews =
    ratings.filter(
      (rating) => rating >= 4,
    ).length;

  return Math.round(
    (satisfiedReviews /
      ratings.length) *
      100,
  );
}

function createRatingDistribution(
  ratings: number[],
): ReviewRatingDistribution[] {
  const totalReviews =
    ratings.length;

  return [5, 4, 3, 2, 1].map(
    (rating) => {
      const count =
        ratings.filter(
          (reviewRating) =>
            reviewRating === rating,
        ).length;

      const percentage =
        totalReviews > 0
          ? Math.round(
              (count /
                totalReviews) *
                100,
            )
          : 0;

      return {
        rating:
          rating as ReviewRatingDistribution["rating"],
        count,
        percentage,
      };
    },
  );
}

async function getPublishedReviews(): Promise<{
  reviews: PublicReview[];
  summary: ReviewsSummary;
}> {
  const databaseReviews =
    await prisma.review.findMany({
      where: {
        publishedAt: {
          not: null,
        },
      },
      orderBy: [
        {
          isFeatured: "desc",
        },
        {
          publishedAt: "desc",
        },
        {
          createdAt: "desc",
        },
      ],
      select: {
        id: true,
        authorName: true,
        authorAvatar: true,
        rating: true,
        content: true,
        response: true,
        respondedAt: true,
        source: true,
        isVerified: true,
        publishedAt: true,
        createdAt: true,
      },
    });

  const reviews: PublicReview[] =
    databaseReviews.map(
      (review) => ({
        id: review.id,
        authorName:
          review.authorName,
        authorAvatarUrl:
          review.authorAvatar,
        rating: Math.min(
          Math.max(
            review.rating,
            1,
          ),
          5,
        ),
        content:
          review.content,
        createdAt: (
          review.publishedAt ??
          review.createdAt
        ).toISOString(),
        source:
          String(
            review.source,
          ).toUpperCase() ===
          "GOOGLE"
            ? "GOOGLE"
            : "INTERNAL",
        isVerified:
          review.isVerified,
        serviceName: null,
        ownerResponse:
          review.response,
        ownerRespondedAt:
          review.respondedAt?.toISOString() ??
          null,
      }),
    );

  const ratings =
    reviews.map(
      (review) =>
        review.rating,
    );

  const summary: ReviewsSummary =
    {
      totalReviews:
        reviews.length,
      averageRating:
        calculateAverageRating(
          ratings,
        ),
      verifiedReviews:
        reviews.filter(
          (review) =>
            review.isVerified,
        ).length,
      satisfactionRate:
        calculateSatisfactionRate(
          ratings,
        ),
      distribution:
        createRatingDistribution(
          ratings,
        ),
    };

  return {
    reviews,
    summary,
  };
}

export default async function ReviewsPage() {
  const {
    reviews,
    summary,
  } =
    await getPublishedReviews();

  return (
    <main className="overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#fff8fb_45%,#ffffff_100%)]">
      <ReviewsHero
        averageRating={
          summary.averageRating
        }
        totalReviews={
          summary.totalReviews
        }
      />

      <ReviewsStats
        summary={summary}
      />

      <section className="px-4 pb-12 pt-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-pink-200 bg-pink-50 px-4 py-2 text-sm font-bold text-pink-700">
              <MessageSquareHeart className="h-4 w-4" />

              Témoignages clientes
            </div>

            <h2 className="mt-5 text-3xl font-black tracking-tight text-zinc-950 sm:text-4xl">
              Elles partagent leur
              expérience au salon
            </h2>

            <p className="mt-4 text-base leading-7 text-zinc-600">
              Retrouvez les avis
              publiés par les clientes
              après leur rendez-vous au
              Palais des Ongles.
            </p>
          </div>
        </div>
      </section>

      <PublicReviews
        reviews={reviews}
      />

      <section className="px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="relative isolate overflow-hidden rounded-[2.5rem] bg-zinc-950 px-6 py-14 text-white shadow-[0_40px_120px_-45px_rgba(190,24,93,0.65)] sm:px-10 lg:px-14 lg:py-16">
            <div
              aria-hidden="true"
              className="absolute -right-24 -top-28 -z-10 h-80 w-80 rounded-full bg-pink-500/30 blur-3xl"
            />

            <div
              aria-hidden="true"
              className="absolute -bottom-32 -left-24 -z-10 h-96 w-96 rounded-full bg-fuchsia-500/20 blur-3xl"
            />

            <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_auto]">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold text-pink-200 backdrop-blur">
                  <Sparkles className="h-4 w-4" />

                  À votre tour
                </div>

                <h2 className="mt-6 max-w-3xl text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                  Vivez votre propre
                  expérience au Palais
                  des Ongles
                </h2>

                <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-300 sm:text-lg">
                  Choisissez votre
                  prestation, réservez
                  votre créneau et
                  profitez d’un moment
                  entièrement consacré à
                  vous.
                </p>

                <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold text-zinc-300">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-4 py-2">
                    <Heart className="h-4 w-4 text-pink-400" />

                    Accueil personnalisé
                  </span>

                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-4 py-2">
                    <Sparkles className="h-4 w-4 text-pink-400" />

                    Résultat sur mesure
                  </span>
                </div>
              </div>

              <Link
                href="/reservation"
                className="inline-flex h-14 shrink-0 items-center justify-center gap-2 rounded-2xl bg-pink-600 px-7 text-sm font-black text-white shadow-lg shadow-pink-950/30 transition duration-300 hover:-translate-y-1 hover:bg-pink-500 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-pink-400/30"
              >
                Prendre rendez-vous

                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}