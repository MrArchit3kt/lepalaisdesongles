"use client";

import {
  useMemo,
  useState,
  useTransition,
} from "react";

import {
  BadgePercent,
  CalendarClock,
  Copy,
  Eye,
  EyeOff,
  FilePenLine,
  House,
  LoaderCircle,
  Search,
  Sparkles,
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
  activateAdminPromotionAction,
  deactivateAdminPromotionAction,
  deleteAdminPromotionAction,
  duplicateAdminPromotionAction,
  hideAdminPromotionFromHomepageAction,
  showAdminPromotionOnHomepageAction,
} from "@/features/admin/promotions/actions/admin-promotions.actions";

import type {
  AdminPromotion,
  AdminPromotionComputedStatus,
  AdminPromotionFilterStatus,
  AdminPromotionType,
} from "@/features/admin/promotions/types/admin-promotions.types";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type AdminPromotionsManagerProps = {
  promotions:
    AdminPromotion[];
};

type PromotionTypeFilter =
  | "ALL"
  | AdminPromotionType;

type PendingActionType =
  | "ACTIVATE"
  | "DEACTIVATE"
  | "SHOW_ON_HOMEPAGE"
  | "HIDE_FROM_HOMEPAGE"
  | "DUPLICATE"
  | "DELETE";

type PendingAction = {
  promotionId:
    string;

  type:
    PendingActionType;
} | null;

/* -------------------------------------------------------------------------- */
/*                               CONFIGURATION                                */
/* -------------------------------------------------------------------------- */

const STATUS_LABELS: Record<
  AdminPromotionComputedStatus,
  string
> = {
  DRAFT:
    "Brouillon",

  SCHEDULED:
    "Programmée",

  ACTIVE:
    "Active",

  EXPIRED:
    "Terminée",

  EXHAUSTED:
    "Épuisée",

  DISABLED:
    "Désactivée",
};

const STATUS_CLASSES: Record<
  AdminPromotionComputedStatus,
  string
> = {
  DRAFT:
    "bg-zinc-100 text-zinc-700",

  SCHEDULED:
    "bg-blue-50 text-blue-700",

  ACTIVE:
    "bg-emerald-50 text-emerald-700",

  EXPIRED:
    "bg-zinc-100 text-zinc-600",

  EXHAUSTED:
    "bg-amber-50 text-amber-700",

  DISABLED:
    "bg-red-50 text-red-700",
};

const TYPE_LABELS: Record<
  AdminPromotionType,
  string
> = {
  PERCENTAGE:
    "Pourcentage",

  FIXED_AMOUNT:
    "Montant fixe",

  FREE_SERVICE:
    "Prestation offerte",

  CUSTOM:
    "Offre personnalisée",
};

/* -------------------------------------------------------------------------- */
/*                                  OUTILS                                    */
/* -------------------------------------------------------------------------- */

function normalizeSearch(
  value:
    string,
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

function formatDate(
  value:
    string,
): string {
  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      dateStyle:
        "medium",

      timeStyle:
        "short",
    },
  ).format(
    new Date(
      value,
    ),
  );
}

function formatMoney(
  value:
    number,
): string {
  return new Intl.NumberFormat(
    "fr-FR",
    {
      style:
        "currency",

      currency:
        "EUR",
    },
  ).format(
    value / 100,
  );
}

function getPromotionValue(
  promotion:
    AdminPromotion,
): string {
  switch (
    promotion.type
  ) {
    case "PERCENTAGE":
      return promotion.percentageValue !==
        null
        ? `-${promotion.percentageValue} %`
        : "Pourcentage";

    case "FIXED_AMOUNT":
      return promotion.amountCents !==
        null
        ? `-${formatMoney(
            promotion.amountCents,
          )}`
        : "Montant fixe";

    case "FREE_SERVICE":
      return "Offerte";

    case "CUSTOM":
      return "Sur mesure";
  }
}

function isPromotionEnabled(
  promotion:
    AdminPromotion,
): boolean {
  return (
    promotion.isActive &&
    promotion.computedStatus !==
      "DISABLED"
  );
}

/* -------------------------------------------------------------------------- */
/*                                  COMPOSANT                                 */
/* -------------------------------------------------------------------------- */

export function AdminPromotionsManager({
  promotions,
}: AdminPromotionsManagerProps) {
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
    status,
    setStatus,
  ] =
    useState<AdminPromotionFilterStatus>(
      "ALL",
    );

  const [
    type,
    setType,
  ] =
    useState<PromotionTypeFilter>(
      "ALL",
    );

  const [
    homepageOnly,
    setHomepageOnly,
  ] =
    useState(false);

  const filteredPromotions =
    useMemo(
      () => {
        const normalizedSearch =
          normalizeSearch(
            search,
          );

        return promotions.filter(
          (
            promotion,
          ) => {
            const searchableContent =
              normalizeSearch(
                [
                  promotion.name,
                  promotion.slug,
                  promotion.description ??
                    "",
                  promotion.code ??
                    "",
                  ...promotion.services.map(
                    (
                      service,
                    ) =>
                      service.name,
                  ),
                ].join(
                  " ",
                ),
              );

            const matchesSearch =
              normalizedSearch ===
                "" ||
              searchableContent.includes(
                normalizedSearch,
              );

            const matchesStatus =
              status ===
                "ALL" ||
              promotion.computedStatus ===
                status;

            const matchesType =
              type ===
                "ALL" ||
              promotion.type ===
                type;

            const matchesHomepage =
              !homepageOnly ||
              promotion.showOnHomepage;

            return (
              matchesSearch &&
              matchesStatus &&
              matchesType &&
              matchesHomepage
            );
          },
        );
      },
      [
        homepageOnly,
        promotions,
        search,
        status,
        type,
      ],
    );

  const hasFilters =
    search.trim() !==
      "" ||
    status !==
      "ALL" ||
    type !==
      "ALL" ||
    homepageOnly;

  function resetFilters():
    void {
    setSearch(
      "",
    );

    setStatus(
      "ALL",
    );

    setType(
      "ALL",
    );

    setHomepageOnly(
      false,
    );
  }

  function runAction(
    promotionId:
      string,
    actionType:
      PendingActionType,
    action:
      () => Promise<{
        success:
          boolean;

        message:
          string;

        promotionId?:
          string;

        redirectTo?:
          string;
      }>,
  ): void {
    setPendingAction({
      promotionId,
      type:
        actionType,
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

          if (
            result.redirectTo
          ) {
            router.push(
              result.redirectTo,
            );
          }

          router.refresh();
        } catch (
          error:
            unknown
        ) {
          console.error(
            "[ADMIN_PROMOTION_UI_ACTION]",
            error,
          );

          toast.error(
            "Une erreur est survenue pendant l’action.",
          );
        } finally {
          setPendingAction(
            null,
          );
        }
      },
    );
  }

  function handleDelete(
    promotion:
      AdminPromotion,
  ): void {
    const reason =
      window.prompt(
        `Indiquez le motif de suppression de la promotion « ${promotion.name} ».`,
      );

    if (
      reason ===
        null
    ) {
      return;
    }

    const normalizedReason =
      reason.trim();

    if (
      normalizedReason ===
      ""
    ) {
      toast.error(
        "Le motif de suppression est obligatoire.",
      );

      return;
    }

    const confirmed =
      window.confirm(
        `Supprimer définitivement la promotion « ${promotion.name} » ?`,
      );

    if (
      !confirmed
    ) {
      return;
    }

    runAction(
      promotion.id,
      "DELETE",
      () =>
        deleteAdminPromotionAction(
          promotion.id,
          normalizedReason,
        ),
    );
  }

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------------ */}
      {/*                               FILTRES                              */}
      {/* ------------------------------------------------------------------ */}

      <section className="rounded-[2rem] border border-[#E8B4C0]/45 bg-white p-5 shadow-sm sm:p-6">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_repeat(2,minmax(11rem,0.35fr))_auto_auto]">
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
              placeholder="Rechercher une promotion…"
              className="h-11 w-full rounded-2xl border border-[#E8B4C0]/65 bg-[#FFFDFC] pl-11 pr-4 text-sm text-[#2F2027] outline-none transition focus:border-[#B45F7A] focus:ring-4 focus:ring-[#B45F7A]/10"
            />
          </label>

          <select
            value={
              status
            }
            onChange={(
              event,
            ) =>
              setStatus(
                event.target
                  .value as AdminPromotionFilterStatus,
              )
            }
            className="h-11 rounded-2xl border border-[#E8B4C0]/65 bg-[#FFFDFC] px-4 text-sm text-[#2F2027] outline-none transition focus:border-[#B45F7A]"
          >
            <option value="ALL">
              Tous les statuts
            </option>

            <option value="DRAFT">
              Brouillons
            </option>

            <option value="SCHEDULED">
              Programmées
            </option>

            <option value="ACTIVE">
              Actives
            </option>

            <option value="EXPIRED">
              Terminées
            </option>

            <option value="EXHAUSTED">
              Épuisées
            </option>

            <option value="DISABLED">
              Désactivées
            </option>
          </select>

          <select
            value={
              type
            }
            onChange={(
              event,
            ) =>
              setType(
                event.target
                  .value as PromotionTypeFilter,
              )
            }
            className="h-11 rounded-2xl border border-[#E8B4C0]/65 bg-[#FFFDFC] px-4 text-sm text-[#2F2027] outline-none transition focus:border-[#B45F7A]"
          >
            <option value="ALL">
              Tous les types
            </option>

            <option value="PERCENTAGE">
              Pourcentage
            </option>

            <option value="FIXED_AMOUNT">
              Montant fixe
            </option>

            <option value="FREE_SERVICE">
              Prestation offerte
            </option>

            <option value="CUSTOM">
              Personnalisée
            </option>
          </select>

          <label className="flex h-11 cursor-pointer items-center justify-center gap-3 rounded-2xl border border-[#E8B4C0]/65 bg-[#FFFDFC] px-4 text-sm font-semibold text-[#6F5962]">
            <input
              type="checkbox"
              checked={
                homepageOnly
              }
              onChange={(
                event,
              ) =>
                setHomepageOnly(
                  event.target.checked,
                )
              }
              className="size-4 accent-[#B45F7A]"
            />

            Sur l’accueil
          </label>

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
          {filteredPromotions.length} promotion
          {filteredPromotions.length !==
          1
            ? "s"
            : ""}{" "}
          affichée
          {filteredPromotions.length !==
          1
            ? "s"
            : ""}
        </p>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*                                LISTE                               */}
      {/* ------------------------------------------------------------------ */}

      {filteredPromotions.length >
      0 ? (
        <section className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
          {filteredPromotions.map(
            (
              promotion,
            ) => {
              const rowPending =
                isPending &&
                pendingAction
                  ?.promotionId ===
                  promotion.id;

              const enabled =
                isPromotionEnabled(
                  promotion,
                );

              return (
                <article
                  key={
                    promotion.id
                  }
                  className="group overflow-hidden rounded-[2rem] border border-[#E8B4C0]/45 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="relative aspect-[16/8] overflow-hidden bg-gradient-to-br from-[#FFF0F4] via-[#F4DCE3] to-[#E8B4C0]">
                    {promotion.imageUrl ? (
                      <Image
                        src={
                          promotion.imageUrl
                        }
                        alt={
                          promotion.name
                        }
                        fill
                        sizes="(max-width: 1024px) 100vw, 33vw"
                        className="object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center">
                        <BadgePercent className="size-16 text-[#B45F7A]/55" />
                      </div>
                    )}

                    <div className="absolute inset-x-0 top-0 flex flex-wrap items-start justify-between gap-3 p-4">
                      <span
                        className={[
                          "rounded-full px-3 py-1.5 text-xs font-bold shadow-sm backdrop-blur",
                          STATUS_CLASSES[
                            promotion
                              .computedStatus
                          ],
                        ].join(
                          " ",
                        )}
                      >
                        {
                          STATUS_LABELS[
                            promotion
                              .computedStatus
                          ]
                        }
                      </span>

                      <div className="flex flex-wrap justify-end gap-2">
                        {promotion.showOnHomepage ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2F2027]/90 px-3 py-1.5 text-xs font-semibold text-white">
                            <House className="size-3.5" />

                            Accueil
                          </span>
                        ) : null}

                        <span className="rounded-full bg-white/90 px-3 py-1.5 text-sm font-black text-[#843F59] shadow-sm backdrop-blur">
                          {getPromotionValue(
                            promotion,
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-5">
                      <div className="min-w-0">
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#B45F7A]">
                          {
                            TYPE_LABELS[
                              promotion
                                .type
                            ]
                          }
                        </p>

                        <h2 className="mt-2 truncate font-serif text-2xl font-semibold text-[#2F2027]">
                          {promotion.name}
                        </h2>
                      </div>

                      {promotion.code ? (
                        <span className="shrink-0 rounded-xl border border-dashed border-[#B45F7A]/50 bg-[#FFF3F6] px-3 py-2 font-mono text-xs font-bold text-[#843F59]">
                          {promotion.code}
                        </span>
                      ) : null}
                    </div>

                    <p className="mt-3 line-clamp-2 min-h-12 text-sm leading-6 text-[#816D75]">
                      {promotion.description ??
                        "Aucune description renseignée."}
                    </p>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl bg-[#FFF8FA] p-3">
                        <p className="flex items-center gap-2 text-xs font-semibold text-[#9B868E]">
                          <CalendarClock className="size-4 text-[#B45F7A]" />

                          Période
                        </p>

                        <p className="mt-2 text-xs leading-5 text-[#59474F]">
                          Du{" "}
                          {formatDate(
                            promotion.startsAt,
                          )}
                          <br />
                          au{" "}
                          {formatDate(
                            promotion.endsAt,
                          )}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-[#FFF8FA] p-3">
                        <p className="text-xs font-semibold text-[#9B868E]">
                          Utilisations
                        </p>

                        <p className="mt-2 text-sm font-black text-[#2F2027]">
                          {promotion.usageCount}
                          {promotion.usageLimit !==
                          null
                            ? ` / ${promotion.usageLimit}`
                            : ""}
                        </p>

                        <p className="mt-1 text-xs text-[#816D75]">
                          {promotion.remainingUses !==
                          null
                            ? `${promotion.remainingUses} restante${promotion.remainingUses !== 1 ? "s" : ""}`
                            : "Sans limite globale"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="rounded-full bg-[#FFF0F4] px-3 py-1.5 text-xs font-semibold text-[#843F59]">
                        {promotion.serviceCount} prestation
                        {promotion.serviceCount !==
                        1
                          ? "s"
                          : ""}
                      </span>

                      {promotion.minimumSpendCents !==
                      null ? (
                        <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
                          Minimum{" "}
                          {formatMoney(
                            promotion.minimumSpendCents,
                          )}
                        </span>
                      ) : null}

                      {promotion.banner ? (
                        <span className="rounded-full bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700">
                          Bannière configurée
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-6 flex flex-wrap gap-2 border-t border-[#E8B4C0]/35 pt-5">
                      <Link
                        href={`/admin/promotions/${promotion.id}`}
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
                            promotion.id,
                            enabled
                              ? "DEACTIVATE"
                              : "ACTIVATE",
                            () =>
                              enabled
                                ? deactivateAdminPromotionAction(
                                    promotion.id,
                                  )
                                : activateAdminPromotionAction(
                                    promotion.id,
                                  ),
                          )
                        }
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[#E8B4C0]/65 bg-white px-4 text-sm font-semibold text-[#843F59] transition hover:bg-[#FFF3F6] disabled:opacity-50"
                      >
                        {rowPending &&
                        (
                          pendingAction?.type ===
                            "ACTIVATE" ||
                          pendingAction?.type ===
                            "DEACTIVATE"
                        ) ? (
                          <LoaderCircle className="size-4 animate-spin" />
                        ) : enabled ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}

                        {enabled
                          ? "Désactiver"
                          : "Activer"}
                      </button>

                      <button
                        type="button"
                        disabled={
                          rowPending
                        }
                        onClick={() =>
                          runAction(
                            promotion.id,
                            promotion.showOnHomepage
                              ? "HIDE_FROM_HOMEPAGE"
                              : "SHOW_ON_HOMEPAGE",
                            () =>
                              promotion.showOnHomepage
                                ? hideAdminPromotionFromHomepageAction(
                                    promotion.id,
                                  )
                                : showAdminPromotionOnHomepageAction(
                                    promotion.id,
                                  ),
                          )
                        }
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[#E8B4C0]/65 bg-white px-4 text-sm font-semibold text-[#843F59] transition hover:bg-[#FFF3F6] disabled:opacity-50"
                      >
                        <House className="size-4" />

                        {promotion.showOnHomepage
                          ? "Retirer accueil"
                          : "Afficher accueil"}
                      </button>

                      <button
                        type="button"
                        disabled={
                          rowPending
                        }
                        onClick={() =>
                          runAction(
                            promotion.id,
                            "DUPLICATE",
                            () =>
                              duplicateAdminPromotionAction(
                                promotion.id,
                              ),
                          )
                        }
                        className="inline-flex size-10 items-center justify-center rounded-full border border-[#E8B4C0]/65 bg-white text-[#843F59] transition hover:bg-[#FFF3F6] disabled:opacity-50"
                        aria-label={`Dupliquer ${promotion.name}`}
                      >
                        {rowPending &&
                        pendingAction?.type ===
                          "DUPLICATE" ? (
                          <LoaderCircle className="size-4 animate-spin" />
                        ) : (
                          <Copy className="size-4" />
                        )}
                      </button>

                      <button
                        type="button"
                        disabled={
                          rowPending
                        }
                        onClick={() =>
                          handleDelete(
                            promotion,
                          )
                        }
                        className="ml-auto inline-flex size-10 items-center justify-center rounded-full border border-red-200 bg-white text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                        aria-label={`Supprimer ${promotion.name}`}
                      >
                        {rowPending &&
                        pendingAction?.type ===
                          "DELETE" ? (
                          <LoaderCircle className="size-4 animate-spin" />
                        ) : (
                          <Trash2 className="size-4" />
                        )}
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
          <span className="mx-auto grid size-16 place-items-center rounded-3xl bg-[#FFF0F4] text-[#B45F7A]">
            <Sparkles className="size-8" />
          </span>

          <h2 className="mt-5 text-xl font-black text-[#2F2027]">
            Aucune promotion trouvée
          </h2>

          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#816D75]">
            Modifiez les filtres ou créez une nouvelle offre promotionnelle.
          </p>

          {hasFilters ? (
            <button
              type="button"
              onClick={
                resetFilters
              }
              className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#E8B4C0] bg-white px-5 text-sm font-semibold text-[#843F59]"
            >
              <X className="size-4" />

              Réinitialiser les filtres
            </button>
          ) : (
            <Link
              href="/admin/promotions/nouvelle"
              className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#2F2027] px-5 text-sm font-semibold text-white"
            >
              <BadgePercent className="size-4" />

              Créer une promotion
            </Link>
          )}
        </section>
      )}
    </div>
  );
}
