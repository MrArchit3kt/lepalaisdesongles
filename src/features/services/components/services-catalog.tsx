"use client";

import {
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import {
  useMemo,
  useState,
} from "react";

import { ServiceCard } from "@/features/services/components/service-card";
import type {
  PublicServiceCategories,
  PublicServices,
} from "@/features/services/services/public-services.service";
import { cn } from "@/lib/utils";

type SortValue =
  | "recommended"
  | "price-asc"
  | "price-desc"
  | "duration-asc"
  | "duration-desc";

type ServicesCatalogProps = {
  categories: PublicServiceCategories;
  services: PublicServices;
  initialCategory?: string;
  defaultImageUrl?: string;
};

function getDisplayedPrice(
  service: PublicServices[number],
): number | null {
  return (
    service.promotionalPriceCents ??
    service.priceCents
  );
}

function compareServicePrices(
  firstService: PublicServices[number],
  secondService: PublicServices[number],
  direction: "asc" | "desc",
): number {
  const firstPrice =
    getDisplayedPrice(firstService);

  const secondPrice =
    getDisplayedPrice(secondService);

  if (
    firstPrice === null &&
    secondPrice === null
  ) {
    return 0;
  }

  if (firstPrice === null) {
    return 1;
  }

  if (secondPrice === null) {
    return -1;
  }

  return direction === "asc"
    ? firstPrice - secondPrice
    : secondPrice - firstPrice;
}

export function ServicesCatalog({
  categories,
  services,
  initialCategory,
  defaultImageUrl = "",
}: ServicesCatalogProps) {
  const validInitialCategory =
    initialCategory &&
    categories.some(
      (category) =>
        category.slug === initialCategory,
    )
      ? initialCategory
      : "all";

  const [selectedCategory, setSelectedCategory] =
    useState(validInitialCategory);

  const [search, setSearch] =
    useState("");

  const [sort, setSort] =
    useState<SortValue>("recommended");

  const displayedServices = useMemo(() => {
    const normalizedSearch = search
      .trim()
      .toLocaleLowerCase("fr");

    const filteredServices = services.filter(
      (service) => {
        const categoryMatches =
          selectedCategory === "all" ||
          service.category.slug ===
            selectedCategory;

        const searchMatches =
          normalizedSearch.length === 0 ||
          service.name
            .toLocaleLowerCase("fr")
            .includes(normalizedSearch) ||
          (service.shortDescription ?? "")
            .toLocaleLowerCase("fr")
            .includes(normalizedSearch) ||
          service.category.name
            .toLocaleLowerCase("fr")
            .includes(normalizedSearch);

        return categoryMatches && searchMatches;
      },
    );

    return [...filteredServices].sort(
      (firstService, secondService) => {
        switch (sort) {
          case "price-asc":
            return compareServicePrices(
              firstService,
              secondService,
              "asc",
            );

          case "price-desc":
            return compareServicePrices(
              firstService,
              secondService,
              "desc",
            );

          case "duration-asc":
            return (
              firstService.durationMinutes -
              secondService.durationMinutes
            );

          case "duration-desc":
            return (
              secondService.durationMinutes -
              firstService.durationMinutes
            );

          case "recommended":
          default:
            return (
              firstService.sortOrder -
              secondService.sortOrder
            );
        }
      },
    );
  }, [
    search,
    selectedCategory,
    services,
    sort,
  ]);

  function resetFilters() {
    setSelectedCategory("all");
    setSearch("");
    setSort("recommended");
  }

  const filtersAreActive =
    selectedCategory !== "all" ||
    search.trim().length > 0 ||
    sort !== "recommended";

  return (
    <div>
      <div className="rounded-[30px] border border-[#35242B]/8 bg-white p-5 shadow-sm lg:p-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_240px]">
          <label className="relative block">
            <span className="sr-only">
              Rechercher une prestation
            </span>

            <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#8C747D]" />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Rechercher une prestation..."
              className="h-13 w-full rounded-2xl border border-[#35242B]/10 bg-[#FFFAFB] pl-12 pr-4 text-sm text-[#35242B] outline-none transition placeholder:text-[#A6949B] focus:border-[#A64D69] focus:ring-4 focus:ring-[#A64D69]/10"
            />
          </label>

          <label className="relative block">
            <span className="sr-only">
              Trier les prestations
            </span>

            <SlidersHorizontal className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#8C747D]" />

            <select
              value={sort}
              onChange={(event) =>
                setSort(
                  event.target.value as SortValue,
                )
              }
              className="h-13 w-full appearance-none rounded-2xl border border-[#35242B]/10 bg-[#FFFAFB] pl-11 pr-4 text-sm text-[#35242B] outline-none transition focus:border-[#A64D69] focus:ring-4 focus:ring-[#A64D69]/10"
            >
              <option value="recommended">
                Ordre recommandé
              </option>

              <option value="price-asc">
                Prix croissant
              </option>

              <option value="price-desc">
                Prix décroissant
              </option>

              <option value="duration-asc">
                Durée croissante
              </option>

              <option value="duration-desc">
                Durée décroissante
              </option>
            </select>
          </label>
        </div>

        <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() =>
              setSelectedCategory("all")
            }
            className={cn(
              "shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold transition",
              selectedCategory === "all"
                ? "bg-gradient-to-r from-[#AA526E] via-[#BD7088] to-[#8B405A] text-white"
                : "border border-[#35242B]/10 bg-[#FFFAFB] text-[#4A3540] hover:bg-[#FFF0F4]",
            )}
          >
            Toutes
            <span className="ml-2 opacity-60">
              {services.length}
            </span>
          </button>

          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() =>
                setSelectedCategory(
                  category.slug,
                )
              }
              className={cn(
                "shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold transition",
                selectedCategory ===
                  category.slug
                  ? "bg-gradient-to-r from-[#AA526E] via-[#BD7088] to-[#8B405A] text-white"
                  : "border border-[#35242B]/10 bg-[#FFFAFB] text-[#4A3540] hover:bg-[#FFF0F4]",
              )}
            >
              {category.name}

              <span className="ml-2 opacity-60">
                {category._count.services}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[#79636C]">
          <span className="font-semibold text-[#35242B]">
            {displayedServices.length}
          </span>{" "}
          prestation
          {displayedServices.length > 1
            ? "s"
            : ""}{" "}
          disponible
          {displayedServices.length > 1
            ? "s"
            : ""}
        </p>

        {filtersAreActive ? (
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center gap-2 self-start text-sm font-semibold text-[#A64D69] transition hover:text-[#35242B]"
          >
            <X className="size-4" />
            Réinitialiser les filtres
          </button>
        ) : null}
      </div>

      {displayedServices.length > 0 ? (
        <div className="mt-7 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {displayedServices.map(
            (service) => (
              <ServiceCard
                key={
                  service.id
                }
                service={
                  service
                }
                defaultImageUrl={
                  defaultImageUrl
                }
              />
            ),
          )}
        </div>
      ) : (
        <div className="mt-7 rounded-[30px] border border-dashed border-[#DCA8B8] bg-white px-6 py-16 text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#FFF0F4] text-[#A64D69]">
            <Sparkles className="size-6" />
          </span>

          <h2 className="mt-5 font-serif text-3xl text-[#35242B]">
            Aucune prestation trouvée
          </h2>

          <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#79636C]">
            Modifiez votre recherche ou
            sélectionnez une autre catégorie.
          </p>

          <button
            type="button"
            onClick={resetFilters}
            className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-gradient-to-r from-[#AA526E] via-[#BD7088] to-[#8B405A] px-6 text-sm font-semibold text-white"
          >
            Afficher toutes les prestations
          </button>
        </div>
      )}
    </div>
  );
}
