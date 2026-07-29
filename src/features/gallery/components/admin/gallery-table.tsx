"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Clock3,
  Edit3,
  Eye,
  EyeOff,
  FolderOpen,
  ImageIcon,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";
import {
  useMemo,
  useState,
} from "react";

export type GalleryTableCategory = {
  id: string;
  name: string;
};

export type GalleryTableItem = {
  id: string;
  title: string;
  slug: string;
  coverUrl: string;
  alt?: string | null;
  serviceName?: string | null;
  priceCents?: number | null;
  durationMinutes?: number | null;
  isFeatured: boolean;
  isPublished: boolean;
  viewCount: number;
  createdAt: Date | string;
  category?: GalleryTableCategory | null;
};

type GalleryTableProps = {
  items: GalleryTableItem[];
  editBasePath?: string;
  onDelete?: (
    item: GalleryTableItem,
  ) => void;
};

type PublicationFilter =
  | "ALL"
  | "PUBLISHED"
  | "DRAFT";

function formatPrice(
  priceCents?: number | null,
): string {
  if (
    priceCents === null ||
    priceCents === undefined
  ) {
    return "Non renseigné";
  }

  return new Intl.NumberFormat(
    "fr-FR",
    {
      style: "currency",
      currency: "EUR",
    },
  ).format(priceCents / 100);
}

function formatDate(
  value: Date | string,
): string {
  const date =
    value instanceof Date
      ? value
      : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date inconnue";
  }

  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  ).format(date);
}

function normalizeSearchValue(
  value: string,
): string {
  return value
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      "",
    )
    .toLowerCase()
    .trim();
}

export function GalleryTable({
  items,
  editBasePath = "/admin/galerie",
  onDelete,
}: GalleryTableProps) {
  const [search, setSearch] =
    useState("");

  const [
    publicationFilter,
    setPublicationFilter,
  ] =
    useState<PublicationFilter>(
      "ALL",
    );

  const filteredItems =
    useMemo(() => {
      const normalizedSearch =
        normalizeSearchValue(search);

      return items.filter((item) => {
        const matchesStatus =
          publicationFilter ===
            "ALL" ||
          (publicationFilter ===
            "PUBLISHED" &&
            item.isPublished) ||
          (publicationFilter ===
            "DRAFT" &&
            !item.isPublished);

        if (!matchesStatus) {
          return false;
        }

        if (!normalizedSearch) {
          return true;
        }

        const searchableValue =
          normalizeSearchValue(
            [
              item.title,
              item.serviceName ?? "",
              item.category?.name ?? "",
            ].join(" "),
          );

        return searchableValue.includes(
          normalizedSearch,
        );
      });
    }, [
      items,
      publicationFilter,
      search,
    ]);

  const publishedCount =
    useMemo(
      () =>
        items.filter(
          (item) =>
            item.isPublished,
        ).length,
      [items],
    );

  const draftCount =
    items.length - publishedCount;

  return (
    <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-100 px-5 py-6 sm:px-7">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-xl font-bold text-zinc-950">
              Réalisations
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Gérez les photos
              présentées dans la
              galerie du salon.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:flex">
            <div className="rounded-xl bg-zinc-50 px-3 py-2 text-center sm:min-w-24">
              <p className="text-xs text-zinc-500">
                Total
              </p>

              <p className="font-bold text-zinc-950">
                {items.length}
              </p>
            </div>

            <div className="rounded-xl bg-emerald-50 px-3 py-2 text-center sm:min-w-24">
              <p className="text-xs text-emerald-700">
                Publiées
              </p>

              <p className="font-bold text-emerald-800">
                {publishedCount}
              </p>
            </div>

            <div className="rounded-xl bg-amber-50 px-3 py-2 text-center sm:min-w-24">
              <p className="text-xs text-amber-700">
                Brouillons
              </p>

              <p className="font-bold text-amber-800">
                {draftCount}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

            <input
              type="search"
              value={search}
              placeholder="Rechercher une réalisation..."
              className="w-full rounded-xl border border-zinc-200 bg-white py-3 pl-11 pr-4 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-pink-500 focus:ring-4 focus:ring-pink-100"
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                publicationFilter ===
                "ALL"
                  ? "bg-zinc-950 text-white"
                  : "border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
              }`}
              onClick={() =>
                setPublicationFilter(
                  "ALL",
                )
              }
            >
              Toutes
            </button>

            <button
              type="button"
              className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                publicationFilter ===
                "PUBLISHED"
                  ? "bg-emerald-600 text-white"
                  : "border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
              }`}
              onClick={() =>
                setPublicationFilter(
                  "PUBLISHED",
                )
              }
            >
              Publiées
            </button>

            <button
              type="button"
              className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                publicationFilter ===
                "DRAFT"
                  ? "bg-amber-500 text-white"
                  : "border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
              }`}
              onClick={() =>
                setPublicationFilter(
                  "DRAFT",
                )
              }
            >
              Brouillons
            </button>
          </div>
        </div>
      </div>

      {filteredItems.length ===
      0 ? (
        <div className="flex min-h-80 flex-col items-center justify-center px-6 py-16 text-center">
          <div className="rounded-3xl bg-pink-50 p-5 text-pink-500">
            <FolderOpen className="h-9 w-9" />
          </div>

          <h3 className="mt-5 text-lg font-bold text-zinc-950">
            Aucune réalisation
          </h3>

          <p className="mt-2 max-w-md text-sm leading-6 text-zinc-500">
            Aucune réalisation ne
            correspond actuellement à
            votre recherche ou au filtre
            sélectionné.
          </p>
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/80 text-left">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Réalisation
                  </th>

                  <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Prestation
                  </th>

                  <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Tarif
                  </th>

                  <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Statut
                  </th>

                  <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Statistiques
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredItems.map(
                  (item) => (
                    <tr
                      key={item.id}
                      className="border-b border-zinc-100 transition last:border-b-0 hover:bg-zinc-50/70"
                    >
                      <td className="px-6 py-4">
                        <div className="flex min-w-64 items-center gap-4">
                          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-zinc-100">
                            {item.coverUrl ? (
                              <Image
                                src={
                                  item.coverUrl
                                }
                                alt={
                                  item.alt ??
                                  item.title
                                }
                                fill
                                sizes="64px"
                                unoptimized
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-zinc-400">
                                <ImageIcon className="h-6 w-6" />
                              </div>
                            )}

                            {item.isFeatured && (
                              <div
                                title="Mise en avant"
                                className="absolute right-1.5 top-1.5 rounded-full bg-white/95 p-1 text-pink-600 shadow-sm"
                              >
                                <Sparkles className="h-3.5 w-3.5" />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate font-semibold text-zinc-950">
                              {item.title}
                            </p>

                            <p className="mt-1 truncate text-sm text-zinc-500">
                              {item.category
                                ?.name ??
                                "Sans catégorie"}
                            </p>

                            <p className="mt-1 text-xs text-zinc-400">
                              Ajoutée le{" "}
                              {formatDate(
                                item.createdAt,
                              )}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <p className="max-w-48 truncate text-sm font-medium text-zinc-800">
                          {item.serviceName ??
                            "Non renseignée"}
                        </p>

                        {item.durationMinutes ? (
                          <p className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500">
                            <Clock3 className="h-3.5 w-3.5" />

                            {
                              item.durationMinutes
                            }{" "}
                            min
                          </p>
                        ) : null}
                      </td>

                      <td className="px-4 py-4">
                        <p className="whitespace-nowrap text-sm font-semibold text-zinc-900">
                          {formatPrice(
                            item.priceCents,
                          )}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex flex-col items-start gap-2">
                          {item.isPublished ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
                              <Eye className="h-3.5 w-3.5" />
                              Publiée
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">
                              <EyeOff className="h-3.5 w-3.5" />
                              Brouillon
                            </span>
                          )}

                          {item.isFeatured && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-pink-50 px-2.5 py-1 text-xs font-semibold text-pink-700 ring-1 ring-inset ring-pink-200">
                              <Sparkles className="h-3.5 w-3.5" />
                              En vedette
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <p className="flex items-center gap-1.5 text-sm font-medium text-zinc-700">
                          <Eye className="h-4 w-4 text-zinc-400" />
                          {item.viewCount.toLocaleString(
                            "fr-FR",
                          )}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`${editBasePath}/${item.id}`}
                            title="Modifier"
                            aria-label={`Modifier ${item.title}`}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-600 transition hover:border-pink-200 hover:bg-pink-50 hover:text-pink-600"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Link>

                          <button
                            type="button"
                            title="Supprimer"
                            aria-label={`Supprimer ${item.title}`}
                            disabled={!onDelete}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                            onClick={() =>
                              onDelete?.(
                                item,
                              )
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>

          <div className="grid gap-4 p-4 sm:grid-cols-2 lg:hidden">
            {filteredItems.map(
              (item) => (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-2xl border border-zinc-200 bg-white"
                >
                  <div className="relative aspect-[16/10] bg-zinc-100">
                    {item.coverUrl ? (
                      <Image
                        src={item.coverUrl}
                        alt={
                          item.alt ??
                          item.title
                        }
                        fill
                        sizes="(max-width: 640px) 100vw, 50vw"
                        unoptimized
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-zinc-400">
                        <ImageIcon className="h-10 w-10" />
                      </div>
                    )}

                    <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                      {item.isPublished ? (
                        <span className="rounded-full bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
                          Publiée
                        </span>
                      ) : (
                        <span className="rounded-full bg-amber-500 px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
                          Brouillon
                        </span>
                      )}

                      {item.isFeatured && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-pink-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
                          <Sparkles className="h-3 w-3" />
                          Vedette
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-4">
                    <p className="text-xs font-medium text-pink-600">
                      {item.category
                        ?.name ??
                        "Sans catégorie"}
                    </p>

                    <h3 className="mt-1 truncate font-bold text-zinc-950">
                      {item.title}
                    </h3>

                    <p className="mt-1 truncate text-sm text-zinc-500">
                      {item.serviceName ??
                        "Prestation non renseignée"}
                    </p>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <div className="rounded-xl bg-zinc-50 p-3">
                        <p className="text-xs text-zinc-500">
                          Tarif
                        </p>

                        <p className="mt-1 text-sm font-bold text-zinc-900">
                          {formatPrice(
                            item.priceCents,
                          )}
                        </p>
                      </div>

                      <div className="rounded-xl bg-zinc-50 p-3">
                        <p className="text-xs text-zinc-500">
                          Durée
                        </p>

                        <p className="mt-1 text-sm font-bold text-zinc-900">
                          {item.durationMinutes
                            ? `${item.durationMinutes} min`
                            : "—"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-4">
                      <p className="flex items-center gap-1.5 text-xs text-zinc-500">
                        <Eye className="h-3.5 w-3.5" />
                        {item.viewCount.toLocaleString(
                          "fr-FR",
                        )}{" "}
                        vues
                      </p>

                      <div className="flex gap-2">
                        <Link
                          href={`${editBasePath}/${item.id}`}
                          aria-label={`Modifier ${item.title}`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 text-zinc-600 transition hover:bg-pink-50 hover:text-pink-600"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Link>

                        <button
                          type="button"
                          disabled={!onDelete}
                          aria-label={`Supprimer ${item.title}`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 text-zinc-600 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                          onClick={() =>
                            onDelete?.(
                              item,
                            )
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ),
            )}
          </div>
        </>
      )}

      <div className="border-t border-zinc-100 bg-zinc-50/70 px-6 py-4">
        <p className="text-sm text-zinc-500">
          {filteredItems.length}{" "}
          réalisation
          {filteredItems.length > 1
            ? "s"
            : ""}{" "}
          affichée
          {filteredItems.length > 1
            ? "s"
            : ""}
        </p>
      </div>
    </section>
  );
}
