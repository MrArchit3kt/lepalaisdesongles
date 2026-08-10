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
import { getGoogleReviews } from "@/features/reviews/services/google-reviews.service";
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

function buildSummary(
  reviews: PublicReview[],
): ReviewsSummary {
  const ratings = reviews.map((review) => review.rating);

  return {
    totalReviews: reviews.length,
    averageRating: calculateAverageRating(ratings),
    verifiedReviews: reviews.filter((review) => review.isVerified).length,
    satisfactionRate: calculateSatisfactionRate(ratings),
    distribution: createRatingDistribution(ratings),
  };
}

async function getPublishedReviews(): Promise<
  PublicReview[]
> {
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

  return reviews;
}

async function getReviewsPageData(): Promise<{
  reviews: PublicReview[];
  summary: ReviewsSummary;
}> {
  const [internalReviews, googleResult] = await Promise.all([
    getPublishedReviews(),
    getGoogleReviews(),
  ]);

  const reviews = [...internalReviews, ...googleResult.reviews].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return {
    reviews,
    summary: buildSummary(reviews),
  };
}

export default async function ReviewsPage() {
  const {
    reviews,
    summary,
  } =
    await getReviewsPageData();

  return (
    <main className="overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#FFF9FA_45%,#ffffff_100%)]">
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
            <div className="inline-flex items-center gap-2 rounded-full border border-[#ECD9DF] bg-[#FFF7F9] px-4 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-[#A44E69]">
              <MessageSquareHeart className="h-4 w-4" />

              Témoignages clientes
            </div>

            <h2 className="mt-5 font-serif text-3xl font-semibold tracking-tight text-[#35242B] sm:text-4xl">
              Elles partagent leur
              expérience au salon
            </h2>

            <p className="mt-4 text-base leading-7 text-[#79636C]">
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
          <div className="relative isolate overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#3B2430] via-[#4A2A3A] to-[#2E1E28] px-6 py-14 text-white shadow-[0_40px_120px_-45px_rgba(139,64,90,0.65)] sm:px-10 lg:px-14 lg:py-16">
            <div
              aria-hidden="true"
              className="absolute -right-24 -top-28 -z-10 h-80 w-80 rounded-full bg-[#C47890]/30 blur-3xl"
            />

            <div
              aria-hidden="true"
              className="absolute -bottom-32 -left-24 -z-10 h-96 w-96 rounded-full bg-[#D6B778]/20 blur-3xl"
            />

            <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_auto]">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-[#F0C4D3] backdrop-blur">
                  <Sparkles className="h-4 w-4" />

                  À votre tour
                </div>

                <h2 className="mt-6 max-w-3xl font-serif text-3xl font-semibold italic tracking-tight sm:text-4xl lg:text-5xl">
                  Vivez votre propre
                  expérience au Palais
                  des Ongles
                </h2>

                <p className="mt-5 max-w-2xl text-base leading-7 text-white/70 sm:text-lg">
                  Choisissez votre
                  prestation, réservez
                  votre créneau et
                  profitez d’un moment
                  entièrement consacré à
                  vous.
                </p>

                <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold text-white/70">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-4 py-2">
                    <Heart className="h-4 w-4 text-[#E8B3C3]" />

                    Accueil personnalisé
                  </span>

                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-4 py-2">
                    <Sparkles className="h-4 w-4 text-[#E8B3C3]" />

                    Résultat sur mesure
                  </span>
                </div>
              </div>

              <Link
                href="/reservation"
                className="group inline-flex h-14 shrink-0 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#AA526E] via-[#BD7088] to-[#8B405A] px-7 text-sm font-black text-white shadow-[0_18px_45px_rgba(139,64,90,0.4)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_55px_rgba(139,64,90,0.5)]"
              >
                Prendre rendez-vous

                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}