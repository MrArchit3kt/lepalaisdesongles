"use client";

import {
  Search,
  SlidersHorizontal,
  Star,
  X,
} from "lucide-react";

import type {
  ReviewRatingFilter,
  ReviewSortOption,
} from "./reviews.types";

type ReviewsToolbarProps = {
  search: string;
  ratingFilter: ReviewRatingFilter;
  sort: ReviewSortOption;
  total: number;
  filteredTotal: number;
  onSearchChange: (
    value: string,
  ) => void;
  onRatingFilterChange: (
    value: ReviewRatingFilter,
  ) => void;
  onSortChange: (
    value: ReviewSortOption,
  ) => void;
};

const RATING_FILTERS: Array<{
  value: ReviewRatingFilter;
  label: string;
}> = [
  {
    value: "all",
    label: "Tous",
  },
  {
    value: "5",
    label: "5 étoiles",
  },
  {
    value: "4",
    label: "4 étoiles",
  },
  {
    value: "3",
    label: "3 étoiles",
  },
  {
    value: "2",
    label: "2 étoiles",
  },
  {
    value: "1",
    label: "1 étoile",
  },
];

export function ReviewsToolbar({
  search,
  ratingFilter,
  sort,
  total,
  filteredTotal,
  onSearchChange,
  onRatingFilterChange,
  onSortChange,
}: ReviewsToolbarProps) {
  const hasSearch =
    search.trim().length > 0;

  return (
    <div className="mb-8 rounded-[2rem] border border-pink-100 bg-white p-4 shadow-[0_20px_60px_-35px_rgba(236,72,153,0.3)] sm:p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="relative w-full xl:max-w-xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />

          <input
            type="search"
            value={search}
            onChange={(event) =>
              onSearchChange(
                event.target.value,
              )
            }
            placeholder="Rechercher dans les avis..."
            aria-label="Rechercher dans les avis"
            className="h-14 w-full rounded-2xl border border-zinc-200 bg-zinc-50 pl-12 pr-12 text-sm font-medium text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-pink-300 focus:bg-white focus:ring-4 focus:ring-pink-100"
          />

          {hasSearch ? (
            <button
              type="button"
              onClick={() =>
                onSearchChange("")
              }
              aria-label="Effacer la recherche"
              className="absolute right-3 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-zinc-500 transition hover:bg-zinc-200 hover:text-zinc-950"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="relative">
            <span className="sr-only">
              Filtrer par note
            </span>

            <Star className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 fill-pink-500 text-pink-500" />

            <select
              value={ratingFilter}
              onChange={(event) =>
                onRatingFilterChange(
                  event.target
                    .value as ReviewRatingFilter,
                )
              }
              className="h-14 min-w-44 appearance-none rounded-2xl border border-zinc-200 bg-white pl-11 pr-10 text-sm font-bold text-zinc-800 outline-none transition focus:border-pink-300 focus:ring-4 focus:ring-pink-100"
            >
              {RATING_FILTERS.map(
                (filter) => (
                  <option
                    key={
                      filter.value
                    }
                    value={
                      filter.value
                    }
                  >
                    {
                      filter.label
                    }
                  </option>
                ),
              )}
            </select>
          </label>

          <label className="relative">
            <span className="sr-only">
              Trier les avis
            </span>

            <SlidersHorizontal className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />

            <select
              value={sort}
              onChange={(event) =>
                onSortChange(
                  event.target
                    .value as ReviewSortOption,
                )
              }
              className="h-14 min-w-48 appearance-none rounded-2xl border border-zinc-200 bg-white pl-11 pr-10 text-sm font-bold text-zinc-800 outline-none transition focus:border-pink-300 focus:ring-4 focus:ring-pink-100"
            >
              <option value="recent">
                Plus récents
              </option>

              <option value="oldest">
                Plus anciens
              </option>

              <option value="rating-desc">
                Meilleures notes
              </option>

              <option value="rating-asc">
                Notes les plus basses
              </option>
            </select>
          </label>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 pt-4">
        <p className="text-sm text-zinc-500">
          <span className="font-black text-zinc-950">
            {filteredTotal}
          </span>{" "}
          {filteredTotal > 1
            ? "avis affichés"
            : "avis affiché"}
        </p>

        {filteredTotal !== total ? (
          <p className="text-xs font-semibold text-pink-700">
            sur {total} avis publiés
          </p>
        ) : null}
      </div>
    </div>
  );
}