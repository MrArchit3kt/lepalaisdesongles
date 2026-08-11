"use client";

import {
  useMemo,
  useState,
} from "react";
import {
  ImageOff,
  RotateCcw,
  SearchX,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
} from "framer-motion";

import {
  GalleryCategoryFilter,
  type GalleryCategory,
} from "@/features/gallery/components/public/gallery-category-filter";
import {
  GalleryLightbox,
} from "@/features/gallery/components/public/gallery-lightbox";
import {
  GalleryMasonry,
} from "@/features/gallery/components/public/gallery-masonry";
import {
  GalleryToolbar,
  type GallerySortOption,
} from "@/features/gallery/components/public/gallery-toolbar";

import type {
  PublicGalleryItem,
} from "@/features/gallery/components/public/gallery.types";

type PublicGalleryProps = {
  items: PublicGalleryItem[];
};

const ALL_CATEGORIES_ID =
  "all";

function normalizeText(
  value: string,
) {
  return value
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      "",
    )
    .toLocaleLowerCase(
      "fr-FR",
    )
    .trim();
}

function compareTitles(
  firstItem: PublicGalleryItem,
  secondItem: PublicGalleryItem,
) {
  return firstItem.title.localeCompare(
    secondItem.title,
    "fr",
    {
      sensitivity: "base",
    },
  );
}

export function PublicGallery({
  items,
}: PublicGalleryProps) {
  const [search, setSearch] =
    useState("");

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState(
    ALL_CATEGORIES_ID,
  );

  const [sort, setSort] =
    useState<GallerySortOption>(
      "featured",
    );

  const [
    selectedItemId,
    setSelectedItemId,
  ] = useState<
    string | null
  >(null);

  const categories =
    useMemo<
      GalleryCategory[]
    >(() => {
      const categoryCounts =
        new Map<
          string,
          {
            label: string;
            count: number;
          }
        >();

      for (const item of items) {
        const categoryLabel =
          item.category?.trim();

        if (!categoryLabel) {
          continue;
        }

        const categoryId =
          normalizeText(
            categoryLabel,
          );

        const currentCategory =
          categoryCounts.get(
            categoryId,
          );

        categoryCounts.set(
          categoryId,
          {
            label:
              currentCategory
                ?.label ??
              categoryLabel,
            count:
              (
                currentCategory
                  ?.count ?? 0
              ) + 1,
          },
        );
      }

      const dynamicCategories =
        Array.from(
          categoryCounts.entries(),
        )
          .map(
            ([
              id,
              category,
            ]) => ({
              id,
              label:
                category.label,
              count:
                category.count,
            }),
          )
          .sort(
            (
              firstCategory,
              secondCategory,
            ) =>
              firstCategory.label.localeCompare(
                secondCategory.label,
                "fr",
                {
                  sensitivity:
                    "base",
                },
              ),
          );

      return [
        {
          id: ALL_CATEGORIES_ID,
          label: "Toutes",
          count: items.length,
        },
        ...dynamicCategories,
      ];
    }, [items]);

  const filteredItems =
    useMemo(() => {
      const normalizedSearch =
        normalizeText(search);

      const matchingItems =
        items.filter(
          (item) => {
            const matchesCategory =
              selectedCategory ===
                ALL_CATEGORIES_ID ||
              normalizeText(
                item.category ??
                  "",
              ) ===
                selectedCategory;

            if (
              !matchesCategory
            ) {
              return false;
            }

            if (
              !normalizedSearch
            ) {
              return true;
            }

            const searchableText =
              normalizeText(
                [
                  item.title,
                  item.category,
                  item.serviceName,
                  item.alt,
                ]
                  .filter(
                    (
                      value,
                    ): value is string =>
                      typeof value ===
                        "string" &&
                      value.length > 0,
                  )
                  .join(" "),
              );

            return searchableText.includes(
              normalizedSearch,
            );
          },
        );

      return matchingItems.sort(
        (
          firstItem,
          secondItem,
        ) => {
          switch (sort) {
            case "title-asc":
              return compareTitles(
                firstItem,
                secondItem,
              );

            case "title-desc":
              return compareTitles(
                secondItem,
                firstItem,
              );

            case "featured":
            default: {
              if (
                firstItem.isFeatured !==
                secondItem.isFeatured
              ) {
                return firstItem
                  .isFeatured
                  ? -1
                  : 1;
              }

              return compareTitles(
                firstItem,
                secondItem,
              );
            }
          }
        },
      );
    }, [
      items,
      search,
      selectedCategory,
      sort,
    ]);

  const selectedIndex =
    useMemo(() => {
      if (
        !selectedItemId
      ) {
        return null;
      }

      const index =
        filteredItems.findIndex(
          (item) =>
            item.id ===
            selectedItemId,
        );

      return index >= 0
        ? index
        : null;
    }, [
      filteredItems,
      selectedItemId,
    ]);

  const hasActiveFilters =
    search.trim().length >
      0 ||
    selectedCategory !==
      ALL_CATEGORIES_ID ||
    sort !== "featured";

  function resetFilters() {
    setSearch("");

    setSelectedCategory(
      ALL_CATEGORIES_ID,
    );

    setSort("featured");

    setSelectedItemId(
      null,
    );
  }

  function handleSelect(
    index: number,
  ) {
    const selectedItem =
      filteredItems[index];

    if (!selectedItem) {
      return;
    }

    setSelectedItemId(
      selectedItem.id,
    );
  }

  function handleCloseLightbox() {
    setSelectedItemId(
      null,
    );
  }

  function handleLightboxIndexChange(
    nextIndex: number,
  ) {
    const nextItem =
      filteredItems[
        nextIndex
      ];

    if (!nextItem) {
      return;
    }

    setSelectedItemId(
      nextItem.id,
    );
  }

  return (
    <>
      <section
        id="gallery-grid"
        className="relative py-9 sm:py-14 lg:py-24"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-gradient-to-b from-[#FDF1F5]/70 to-transparent"
        />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {items.length >
          0 ? (
            <>
              <GalleryToolbar
                search={
                  search
                }
                sort={sort}
                total={
                  items.length
                }
                filteredTotal={
                  filteredItems.length
                }
                onSearchChange={
                  setSearch
                }
                onSortChange={
                  setSort
                }
              />

              <GalleryCategoryFilter
                categories={
                  categories
                }
                selected={
                  selectedCategory
                }
                onChange={
                  setSelectedCategory
                }
              />

              <AnimatePresence
                mode="wait"
              >
                {filteredItems.length >
                0 ? (
                  <motion.div
                    key={[
                      selectedCategory,
                      sort,
                      search,
                    ].join(
                      "-",
                    )}
                    initial={{
                      opacity: 0,
                      y: 16,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      y: -8,
                    }}
                    transition={{
                      duration:
                        0.28,
                    }}
                  >
                    <GalleryMasonry
                      items={
                        filteredItems
                      }
                      onSelect={
                        handleSelect
                      }
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty-results"
                    initial={{
                      opacity: 0,
                      scale:
                        0.98,
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                    }}
                    exit={{
                      opacity: 0,
                    }}
                    className="rounded-[2.5rem] border border-dashed border-[#DCA8B8] bg-white px-6 py-20 text-center shadow-sm"
                  >
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#FFF0F4]">
                      <SearchX className="h-9 w-9 text-[#A64D69]" />
                    </div>

                    <h2 className="mt-6 font-serif text-2xl font-semibold tracking-tight text-[#35242B]">
                      Aucune
                      réalisation
                      trouvée
                    </h2>

                    <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[#79636C] sm:text-base">
                      Essayez une
                      autre recherche
                      ou sélectionnez
                      une catégorie
                      différente.
                    </p>

                    {hasActiveFilters ? (
                      <button
                        type="button"
                        onClick={
                          resetFilters
                        }
                        className="mt-7 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#AA526E] via-[#BD7088] to-[#8B405A] px-6 py-3 text-sm font-black text-white shadow-[0_14px_35px_rgba(139,64,90,0.3)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(139,64,90,0.4)] focus:outline-none focus:ring-4 focus:ring-[#F0DCE3]"
                      >
                        <RotateCcw className="h-4 w-4" />

                        Réinitialiser
                        les filtres
                      </button>
                    ) : null}
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            <div className="rounded-[2.5rem] border border-dashed border-[#DCA8B8] bg-white px-6 py-20 text-center shadow-sm">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#FFF0F4]">
                <ImageOff className="h-9 w-9 text-[#A64D69]" />
              </div>

              <h2 className="mt-6 font-serif text-2xl font-semibold tracking-tight text-[#35242B]">
                La galerie sera
                bientôt disponible
              </h2>

              <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[#79636C] sm:text-base">
                Les premières
                créations du salon
                seront publiées ici
                prochainement.
              </p>
            </div>
          )}
        </div>
      </section>

      <GalleryLightbox
        items={
          filteredItems
        }
        selectedIndex={
          selectedIndex
        }
        onClose={
          handleCloseLightbox
        }
        onIndexChange={
          handleLightboxIndexChange
        }
      />
    </>
  );
}