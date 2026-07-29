"use client";

import {
  useMemo,
  useState,
  useTransition,
} from "react";

import {
  CalendarCheck,
  Clock3,
  Eye,
  EyeOff,
  FilePenLine,
  ImageIcon,
  Search,
  Sparkles,
  Star,
  Trash2,
  X,
} from "lucide-react";

import Image from "next/image";
import Link from "next/link";

import {
  useRouter,
} from "next/navigation";

import {
  toast,
} from "sonner";

import {
  deleteAdminServiceAction,
  toggleAdminServiceFeaturedAction,
  toggleAdminServiceVisibilityAction,
} from "@/features/admin/services/actions/admin-services.actions";

import type {
  AdminServiceBookingFilter,
  AdminServiceCategoryOption,
  AdminServiceListItem,
  AdminServiceStatusFilter,
} from "@/features/admin/services/types/admin-service.types";

import {
  formatPrice,
} from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type AdminServicesManagerProps = {
  services:
    AdminServiceListItem[];

  categories:
    AdminServiceCategoryOption[];
};

type PendingAction = {
  serviceId: string;
  type:
    | "VISIBILITY"
    | "FEATURED"
    | "DELETE";
} | null;

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

function normalizeSearch(
  value: string,
): string {
  return value
    .trim()
    .toLocaleLowerCase(
      "fr-FR",
    )
    .normalize(
      "NFD",
    )
    .replace(
      /\p{Diacritic}/gu,
      "",
    );
}

function formatServicePrice(
  service: AdminServiceListItem,
): string {
  const price =
    service.promotionalPriceCents ??
    service.priceCents;

  return price === null
    ? "Sur devis"
    : formatPrice(
        price,
      );
}

function getServiceImage(
  service: AdminServiceListItem,
): string | null {
  return (
    service.images.find(
      (image) =>
        image.isCover,
    )?.url ??
    service.imageUrl ??
    service.images[0]?.url ??
    null
  );
}

/* -------------------------------------------------------------------------- */
/*                                  COMPOSANT                                 */
/* -------------------------------------------------------------------------- */

export function AdminServicesManager({
  services,
  categories,
}: AdminServicesManagerProps) {
  const router =
    useRouter();

  const [
    isPending,
    startTransition,
  ] =
    useTransition();

  const [
    pendingAction,
    setPendingAction,
  ] =
    useState<PendingAction>(
      null,
    );

  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    categoryId,
    setCategoryId,
  ] =
    useState("ALL");

  const [
    status,
    setStatus,
  ] =
    useState<AdminServiceStatusFilter>(
      "ALL",
    );

  const [
    booking,
    setBooking,
  ] =
    useState<AdminServiceBookingFilter>(
      "ALL",
    );

  const filteredServices =
    useMemo(
      () => {
        const normalizedSearch =
          normalizeSearch(
            search,
          );

        return services.filter(
          (
            service,
          ) => {
            const matchesSearch =
              normalizedSearch.length ===
                0 ||
              normalizeSearch(
                service.name,
              ).includes(
                normalizedSearch,
              ) ||
              normalizeSearch(
                service.shortDescription ??
                  "",
              ).includes(
                normalizedSearch,
              ) ||
              normalizeSearch(
                service.category.name,
              ).includes(
                normalizedSearch,
              );

            const matchesCategory =
              categoryId ===
                "ALL" ||
              service.categoryId ===
                categoryId;

            const matchesStatus =
              status ===
                "ALL" ||
              (
                status ===
                  "ACTIVE" &&
                service.isActive
              ) ||
              (
                status ===
                  "HIDDEN" &&
                !service.isActive
              );

            const matchesBooking =
              booking ===
                "ALL" ||
              (
                booking ===
                  "ONLINE" &&
                service.allowOnlineBooking &&
                service.priceCents !==
                  null
              ) ||
              (
                booking ===
                  "QUOTE_ONLY" &&
                service.priceCents ===
                  null
              );

            return (
              matchesSearch &&
              matchesCategory &&
              matchesStatus &&
              matchesBooking
            );
          },
        );
      },
      [
        booking,
        categoryId,
        search,
        services,
        status,
      ],
    );

  const hasFilters =
    search.trim().length >
      0 ||
    categoryId !==
      "ALL" ||
    status !==
      "ALL" ||
    booking !==
      "ALL";

  function resetFilters() {
    setSearch("");
    setCategoryId(
      "ALL",
    );
    setStatus(
      "ALL",
    );
    setBooking(
      "ALL",
    );
  }

  function runAction(
    serviceId: string,
    type:
      | "VISIBILITY"
      | "FEATURED"
      | "DELETE",
    action: () => Promise<{
      success: boolean;
      message: string;
    }>,
  ) {
    setPendingAction({
      serviceId,
      type,
    });

    startTransition(
      async () => {
        try {
          const result =
            await action();

          if (
            !result.success
          ) {
            toast.error(
              result.message,
            );

            return;
          }

          toast.success(
            result.message,
          );

          router.refresh();
        } finally {
          setPendingAction(
            null,
          );
        }
      },
    );
  }

  function handleDelete(
    service: AdminServiceListItem,
  ) {
    const confirmed =
      window.confirm(
        service.appointmentCount >
          0
          ? `La prestation « ${service.name} » est liée à des rendez-vous et ne pourra probablement pas être supprimée. Souhaitez-vous continuer ?`
          : `Supprimer définitivement la prestation « ${service.name} » ?`,
      );

    if (!confirmed) {
      return;
    }

    runAction(
      service.id,
      "DELETE",
      () =>
        deleteAdminServiceAction(
          service.id,
        ),
    );
  }

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------------ */}
      {/*                               FILTRES                              */}
      {/* ------------------------------------------------------------------ */}

      <section className="rounded-[2rem] border border-[#E8B4C0]/45 bg-white p-5 shadow-sm sm:p-6">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_repeat(3,minmax(10rem,0.35fr))_auto]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#9C858E]" />

            <input
              type="search"
              value={
                search
              }
              onChange={(
                event,
              ) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Rechercher une prestation…"
              className="h-11 w-full rounded-2xl border border-[#E8B4C0]/65 bg-[#FFFDFC] pl-11 pr-4 text-sm text-[#2F2027] outline-none transition focus:border-[#B45F7A] focus:ring-4 focus:ring-[#B45F7A]/10"
            />
          </label>

          <select
            value={
              categoryId
            }
            onChange={(
              event,
            ) =>
              setCategoryId(
                event.target.value,
              )
            }
            className="h-11 rounded-2xl border border-[#E8B4C0]/65 bg-[#FFFDFC] px-4 text-sm text-[#2F2027] outline-none transition focus:border-[#B45F7A]"
          >
            <option value="ALL">
              Toutes les catégories
            </option>

            {categories.map(
              (
                category,
              ) => (
                <option
                  key={
                    category.id
                  }
                  value={
                    category.id
                  }
                >
                  {category.name}
                </option>
              ),
            )}
          </select>

          <select
            value={
              status
            }
            onChange={(
              event,
            ) =>
              setStatus(
                event.target
                  .value as AdminServiceStatusFilter,
              )
            }
            className="h-11 rounded-2xl border border-[#E8B4C0]/65 bg-[#FFFDFC] px-4 text-sm text-[#2F2027] outline-none transition focus:border-[#B45F7A]"
          >
            <option value="ALL">
              Tous les statuts
            </option>

            <option value="ACTIVE">
              Visibles
            </option>

            <option value="HIDDEN">
              Masquées
            </option>
          </select>

          <select
            value={
              booking
            }
            onChange={(
              event,
            ) =>
              setBooking(
                event.target
                  .value as AdminServiceBookingFilter,
              )
            }
            className="h-11 rounded-2xl border border-[#E8B4C0]/65 bg-[#FFFDFC] px-4 text-sm text-[#2F2027] outline-none transition focus:border-[#B45F7A]"
          >
            <option value="ALL">
              Tous les tarifs
            </option>

            <option value="ONLINE">
              Réservation en ligne
            </option>

            <option value="QUOTE_ONLY">
              Sur devis
            </option>
          </select>

          {hasFilters ? (
            <button
              type="button"
              onClick={
                resetFilters
              }
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#E8B4C0]/65 bg-white px-5 text-sm font-semibold text-[#843F59] transition hover:bg-[#FFF3F6]"
            >
              <X className="size-4" />

              Effacer
            </button>
          ) : (
            <div />
          )}
        </div>

        <p className="mt-4 text-sm text-[#816D75]">
          {filteredServices.length} prestation
          {filteredServices.length !==
          1
            ? "s"
            : ""}{" "}
          affichée
          {filteredServices.length !==
          1
            ? "s"
            : ""}
        </p>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*                                LISTE                               */}
      {/* ------------------------------------------------------------------ */}

      {filteredServices.length >
      0 ? (
        <section className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
          {filteredServices.map(
            (
              service,
            ) => {
              const imageUrl =
                getServiceImage(
                  service,
                );

              const rowPending =
                isPending &&
                pendingAction
                  ?.serviceId ===
                  service.id;

              return (
                <article
                  key={
                    service.id
                  }
                  className={[
                    "group overflow-hidden rounded-[2rem] border bg-white shadow-sm transition",
                    service.isActive
                      ? "border-[#E8B4C0]/45"
                      : "border-zinc-200 opacity-75",
                  ].join(" ")}
                >
                  <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-[#FFF0F4] to-[#E8B4C0]">
                    {imageUrl ? (
                      <Image
                        src={
                          imageUrl
                        }
                        alt={
                          service.name
                        }
                        fill
                        sizes="(max-width: 1024px) 100vw, 33vw"
                        className="object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center">
                        <ImageIcon className="size-14 text-[#B45F7A]/60" />
                      </div>
                    )}

                    <div className="absolute inset-x-0 top-0 flex flex-wrap items-start justify-between gap-3 p-4">
                      <span className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-[#843F59] shadow-sm backdrop-blur">
                        {service.category.name}
                      </span>

                      <div className="flex flex-wrap justify-end gap-2">
                        {service.isFeatured ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2F2027]/90 px-3 py-1.5 text-xs font-semibold text-white">
                            <Star className="size-3.5 fill-current" />

                            À la une
                          </span>
                        ) : null}

                        <span
                          className={[
                            "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm backdrop-blur",
                            service.isActive
                              ? "bg-emerald-50/95 text-emerald-700"
                              : "bg-zinc-900/85 text-white",
                          ].join(" ")}
                        >
                          {service.isActive ? (
                            <Eye className="size-3.5" />
                          ) : (
                            <EyeOff className="size-3.5" />
                          )}

                          {service.isActive
                            ? "Visible"
                            : "Masquée"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-5">
                      <div className="min-w-0">
                        <h2 className="truncate font-serif text-2xl font-semibold text-[#2F2027]">
                          {service.name}
                        </h2>

                        <p className="mt-2 line-clamp-2 min-h-12 text-sm leading-6 text-[#816D75]">
                          {service.shortDescription ??
                            "Aucune description courte renseignée."}
                        </p>
                      </div>

                      <p className="shrink-0 text-right text-lg font-black text-[#843F59]">
                        {formatServicePrice(
                          service,
                        )}
                      </p>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 rounded-2xl bg-[#FFF8FA] px-3 py-3 text-[#6F5962]">
                        <Clock3 className="size-4 text-[#B45F7A]" />

                        {service.durationMinutes} min
                      </div>

                      <div className="flex items-center gap-2 rounded-2xl bg-[#FFF8FA] px-3 py-3 text-[#6F5962]">
                        <CalendarCheck className="size-4 text-[#B45F7A]" />

                        {service.allowOnlineBooking &&
                        service.priceCents !==
                          null
                          ? "Réservable"
                          : "Non réservable"}
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2 text-xs text-[#816D75]">
                      <span className="rounded-full border border-[#E8B4C0]/55 px-3 py-1.5">
                        {service.appointmentCount} rendez-vous
                      </span>

                      <span className="rounded-full border border-[#E8B4C0]/55 px-3 py-1.5">
                        {service.staffCount} membre
                        {service.staffCount !==
                        1
                          ? "s"
                          : ""}
                      </span>

                      <span className="rounded-full border border-[#E8B4C0]/55 px-3 py-1.5">
                        Ordre {service.sortOrder}
                      </span>
                    </div>

                    <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-[#E8B4C0]/35 pt-5">
                      <Link
                        href={`/admin/prestations/${service.id}`}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#2F2027] px-4 text-sm font-semibold text-white transition hover:bg-[#843F59]"
                      >
                        <FilePenLine className="size-4" />

                        Modifier
                      </Link>

                      <button
                        type="button"
                        disabled={
                          rowPending
                        }
                        onClick={() =>
                          runAction(
                            service.id,
                            "VISIBILITY",
                            () =>
                              toggleAdminServiceVisibilityAction(
                                service.id,
                              ),
                          )
                        }
                        className="inline-flex size-10 items-center justify-center rounded-full border border-[#E8B4C0]/60 bg-white text-[#843F59] transition hover:bg-[#FFF3F6] disabled:opacity-50"
                        aria-label={
                          service.isActive
                            ? "Masquer la prestation"
                            : "Afficher la prestation"
                        }
                      >
                        {service.isActive ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>

                      <button
                        type="button"
                        disabled={
                          rowPending
                        }
                        onClick={() =>
                          runAction(
                            service.id,
                            "FEATURED",
                            () =>
                              toggleAdminServiceFeaturedAction(
                                service.id,
                              ),
                          )
                        }
                        className={[
                          "inline-flex size-10 items-center justify-center rounded-full border transition disabled:opacity-50",
                          service.isFeatured
                            ? "border-[#D6B679] bg-[#FFF9E9] text-[#9B7628]"
                            : "border-[#E8B4C0]/60 bg-white text-[#843F59] hover:bg-[#FFF3F6]",
                        ].join(" ")}
                        aria-label={
                          service.isFeatured
                            ? "Retirer de la mise en avant"
                            : "Mettre la prestation en avant"
                        }
                      >
                        <Sparkles className="size-4" />
                      </button>

                      <button
                        type="button"
                        disabled={
                          rowPending
                        }
                        onClick={() =>
                          handleDelete(
                            service,
                          )
                        }
                        className="ml-auto inline-flex size-10 items-center justify-center rounded-full border border-red-200 bg-white text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                        aria-label="Supprimer la prestation"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            },
          )}
        </section>
      ) : (
        <section className="rounded-[2rem] border border-dashed border-[#E8B4C0] bg-white px-6 py-16 text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-3xl bg-[#FFF0F4] text-[#B45F7A]">
            <Search className="size-7" />
          </div>

          <h2 className="mt-5 font-serif text-2xl text-[#2F2027]">
            Aucune prestation trouvée
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#816D75]">
            Modifiez les filtres ou ajoutez une nouvelle prestation dans le catalogue.
          </p>

          {hasFilters ? (
            <button
              type="button"
              onClick={
                resetFilters
              }
              className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#2F2027] px-6 text-sm font-semibold text-white transition hover:bg-[#843F59]"
            >
              <X className="size-4" />

              Réinitialiser les filtres
            </button>
          ) : null}
        </section>
      )}
    </div>
  );
}
