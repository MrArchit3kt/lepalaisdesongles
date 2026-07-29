"use client";

import {
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

export type GallerySortOption =
  | "featured"
  | "title-asc"
  | "title-desc";

type GalleryToolbarProps = {
  search: string;
  sort: GallerySortOption;
  total: number;
  filteredTotal: number;
  onSearchChange: (
    value: string,
  ) => void;
  onSortChange: (
    value: GallerySortOption,
  ) => void;
};

export function GalleryToolbar({
  search,
  sort,
  total,
  filteredTotal,
  onSearchChange,
  onSortChange,
}: GalleryToolbarProps) {
  const hasActiveSearch =
    search.trim().length > 0;

  const resultLabel =
    filteredTotal > 1
      ? "réalisations affichées"
      : "réalisation affichée";

  return (
    <div className="sticky top-20 z-20 mb-10 rounded-[2rem] border border-pink-100/80 bg-white/90 p-5 shadow-[0_24px_70px_-35px_rgba(219,39,119,0.35)] backdrop-blur-xl sm:p-6">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-fit">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-pink-600" />

            <p className="text-xs font-bold uppercase tracking-[0.22em] text-pink-600">
              Explorer la galerie
            </p>
          </div>

          <p className="mt-2 text-2xl font-black tracking-tight text-zinc-950">
            {filteredTotal}{" "}
            {resultLabel}
          </p>

          {filteredTotal !== total ? (
            <p className="mt-1 text-sm text-zinc-500">
              Parmi {total} créations
              publiées
            </p>
          ) : (
            <p className="mt-1 text-sm text-zinc-500">
              Découvrez toutes les
              créations du salon
            </p>
          )}
        </div>

        <div className="flex w-full flex-col gap-3 lg:flex-row xl:max-w-3xl">
          <label className="relative flex-1">
            <span className="sr-only">
              Rechercher une
              réalisation
            </span>

            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                onSearchChange(
                  event.target.value,
                )
              }
              placeholder="Rechercher une pose, une catégorie..."
              autoComplete="off"
              className="h-14 w-full rounded-2xl border border-zinc-200 bg-white pl-12 pr-12 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 hover:border-pink-200 focus:border-pink-500 focus:ring-4 focus:ring-pink-100"
            />

            {hasActiveSearch ? (
              <button
                type="button"
                onClick={() =>
                  onSearchChange("")
                }
                aria-label="Effacer la recherche"
                className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-zinc-400 transition hover:bg-pink-50 hover:text-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-300"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </label>

          <label className="relative lg:w-64">
            <span className="sr-only">
              Trier les réalisations
            </span>

            <select
              value={sort}
              onChange={(event) =>
                onSortChange(
                  event.target
                    .value as GallerySortOption,
                )
              }
              className="h-14 w-full cursor-pointer appearance-none rounded-2xl border border-zinc-200 bg-white px-4 pr-12 text-sm font-semibold text-zinc-800 outline-none transition hover:border-pink-200 focus:border-pink-500 focus:ring-4 focus:ring-pink-100"
            >
              <option value="featured">
                En vedette
              </option>

              <option value="title-asc">
                Nom : A à Z
              </option>

              <option value="title-desc">
                Nom : Z à A
              </option>
            </select>

            <SlidersHorizontal
              aria-hidden="true"
              className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-pink-600"
            />
          </label>
        </div>
      </div>
    </div>
  );
}