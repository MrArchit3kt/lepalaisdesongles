"use client";

import { useMemo, useState } from "react";

import {
  ReviewCard,
} from "./review-card";
import {
  ReviewsToolbar,
} from "./reviews-toolbar";

import type {
  PublicReview,
  ReviewRatingFilter,
  ReviewSortOption,
} from "./reviews.types";

type PublicReviewsProps = {
  reviews: PublicReview[];
};

export function PublicReviews({
  reviews,
}: PublicReviewsProps) {
  const [
    search,
    setSearch,
  ] = useState("");

  const [
    ratingFilter,
    setRatingFilter,
  ] =
    useState<ReviewRatingFilter>(
      "all",
    );

  const [
    sort,
    setSort,
  ] =
    useState<ReviewSortOption>(
      "recent",
    );

  const filteredReviews =
    useMemo(() => {
      let items = [...reviews];

      if (
        ratingFilter !==
        "all"
      ) {
        items =
          items.filter(
            (
              review,
            ) =>
              review.rating ===
              Number(
                ratingFilter,
              ),
          );
      }

      if (
        search.trim()
      ) {
        const query =
          search.toLowerCase();

        items =
          items.filter(
            (
              review,
            ) =>
              review.authorName
                .toLowerCase()
                .includes(
                  query,
                ) ||
              review.content
                .toLowerCase()
                .includes(
                  query,
                ) ||
              review.serviceName
                ?.toLowerCase()
                .includes(
                  query,
                ),
          );
      }

      switch (
        sort
      ) {
        case "oldest":
          items.sort(
            (
              a,
              b,
            ) =>
              new Date(
                a.createdAt,
              ).getTime() -
              new Date(
                b.createdAt,
              ).getTime(),
          );
          break;

        case "rating-desc":
          items.sort(
            (
              a,
              b,
            ) =>
              b.rating -
              a.rating,
          );
          break;

        case "rating-asc":
          items.sort(
            (
              a,
              b,
            ) =>
              a.rating -
              b.rating,
          );
          break;

        default:
          items.sort(
            (
              a,
              b,
            ) =>
              new Date(
                b.createdAt,
              ).getTime() -
              new Date(
                a.createdAt,
              ).getTime(),
          );
      }

      return items;
    }, [
      reviews,
      search,
      ratingFilter,
      sort,
    ]);

  return (
    <section
      id="avis-clients"
      className="px-4 pb-24 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <ReviewsToolbar
          search={search}
          ratingFilter={
            ratingFilter
          }
          sort={sort}
          total={
            reviews.length
          }
          filteredTotal={
            filteredReviews.length
          }
          onSearchChange={
            setSearch
          }
          onRatingFilterChange={
            setRatingFilter
          }
          onSortChange={
            setSort
          }
        />

        {filteredReviews.length ===
        0 ? (
          <div className="rounded-[2rem] border border-dashed border-pink-200 bg-white py-20 text-center shadow-sm">
            <h2 className="text-2xl font-black text-zinc-900">
              Aucun avis trouvé
            </h2>

            <p className="mt-4 text-zinc-500">
              Essayez un autre
              filtre ou une
              autre recherche.
            </p>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-2 xl:grid-cols-3">
            {filteredReviews.map(
              (
                review,
                index,
              ) => (
                <ReviewCard
                  key={
                    review.id
                  }
                  review={
                    review
                  }
                  index={
                    index
                  }
                />
              ),
            )}
          </div>
        )}
      </div>
    </section>
  );
}