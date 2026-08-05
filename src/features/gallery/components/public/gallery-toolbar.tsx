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
    <div className="sticky top-20 z-20 mb-10 rounded-[2rem] border border-[#F0DCE3]/80 bg-white/90 p-5 shadow-[0_24px_70px_-35px_rgba(139,64,90,0.35)] backdrop-blur-xl sm:p-6">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-fit">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-[#A64D69]" />

            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#A44E69]">
              Explorer la galerie
            </p>
          </div>

          <p className="mt-2 font-serif text-2xl font-semibold tracking-tight text-[#35242B]">
            {filteredTotal}{" "}
            {resultLabel}
          </p>

          {filteredTotal !== total ? (
            <p className="mt-1 text-sm text-[#8C747D]">
              Parmi {total} créations
              publiées
            </p>
          ) : (
            <p className="mt-1 text-sm text-[#8C747D]">
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
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#A6949B]"
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
              className="h-14 w-full rounded-2xl border border-[#ECD9DF] bg-white pl-12 pr-12 text-sm text-[#35242B] outline-none transition placeholder:text-[#A6949B] hover:border-[#DCA8B8] focus:border-[#D89CB0] focus:ring-4 focus:ring-[#F0DCE3]"
            />

            {hasActiveSearch ? (
              <button
                type="button"
                onClick={() =>
                  onSearchChange("")
                }
                aria-label="Effacer la recherche"
                className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[#A6949B] transition hover:bg-[#FFF0F4] hover:text-[#A64D69] focus:outline-none focus:ring-2 focus:ring-[#D89CB0]"
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
              className="h-14 w-full cursor-pointer appearance-none rounded-2xl border border-[#ECD9DF] bg-white px-4 pr-12 text-sm font-semibold text-[#3D2A32] outline-none transition hover:border-[#DCA8B8] focus:border-[#D89CB0] focus:ring-4 focus:ring-[#F0DCE3]"
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
              className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A64D69]"
            />
          </label>
        </div>
      </div>
    </div>
  );
}