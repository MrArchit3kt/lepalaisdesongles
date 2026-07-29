"use client";

import type { FormEvent, ReactNode } from "react";

import { useState, useTransition } from "react";

import Link from "next/link";

import { usePathname, useRouter } from "next/navigation";

import {
  ArrowDownUp,
  BadgeEuro,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Download,
  FilterX,
  Gift,
  LoaderCircle,
  Search,
  WalletCards,
} from "lucide-react";

import { GiftCardStatusBadge } from "@/features/admin/gift-cards/components/gift-card-status-badge";

import type {
  AdminGiftCardQuery,
  AdminGiftCardSortMode,
  AdminGiftCardStatusFilter,
  AdminGiftCardsDashboardData,
} from "@/features/admin/gift-cards/types/admin-gift-card.types";

const STATUS_OPTIONS: {
  value: AdminGiftCardStatusFilter;
  label: string;
}[] = [
  {
    value: "ALL",
    label: "Tous les statuts",
  },
  {
    value: "ACTIVE",
    label: "Actives",
  },
  {
    value: "PARTIALLY_USED",
    label: "Partiellement utilisées",
  },
  {
    value: "USED",
    label: "Utilisées",
  },
  {
    value: "PENDING_PAYMENT",
    label: "Paiement en attente",
  },
  {
    value: "PAYMENT_FAILED",
    label: "Paiement échoué",
  },
  {
    value: "EXPIRED",
    label: "Expirées",
  },
  {
    value: "CANCELLED",
    label: "Annulées",
  },
  {
    value: "REVOKED",
    label: "Révoquées",
  },
];

const SORT_OPTIONS: {
  value: AdminGiftCardSortMode;
  label: string;
}[] = [
  {
    value: "NEWEST",
    label: "Plus récentes",
  },
  {
    value: "OLDEST",
    label: "Plus anciennes",
  },
  {
    value: "BALANCE_DESC",
    label: "Solde décroissant",
  },
  {
    value: "BALANCE_ASC",
    label: "Solde croissant",
  },
  {
    value: "EXPIRATION_ASC",
    label: "Expiration proche",
  },
];

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function createQueryString(
  query: AdminGiftCardQuery,
  overrides: Partial<AdminGiftCardQuery>,
): string {
  const nextQuery = {
    ...query,
    ...overrides,
  };

  const searchParams = new URLSearchParams();

  if (nextQuery.page > 1) {
    searchParams.set("page", String(nextQuery.page));
  }

  if (nextQuery.pageSize !== 25) {
    searchParams.set("pageSize", String(nextQuery.pageSize));
  }

  if (nextQuery.search) {
    searchParams.set("search", nextQuery.search);
  }

  if (nextQuery.status !== "ALL") {
    searchParams.set("status", nextQuery.status);
  }

  if (nextQuery.sort !== "NEWEST") {
    searchParams.set("sort", nextQuery.sort);
  }

  if (nextQuery.dateFrom) {
    searchParams.set("dateFrom", nextQuery.dateFrom);
  }

  if (nextQuery.dateTo) {
    searchParams.set("dateTo", nextQuery.dateTo);
  }

  if (nextQuery.expiredOnly) {
    searchParams.set("expiredOnly", "true");
  }

  return searchParams.toString();
}

function getPageNumbers(currentPage: number, totalPages: number): number[] {
  const pages = new Set<number>([
    1,
    totalPages,
    currentPage - 1,
    currentPage,
    currentPage + 1,
  ]);

  return [...pages]
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((first, second) => first - second);
}

export function AdminGiftCardsClient({
  data,
}: {
  data: AdminGiftCardsDashboardData;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(data.query.search);
  const [dateFrom, setDateFrom] = useState(data.query.dateFrom);
  const [dateTo, setDateTo] = useState(data.query.dateTo);

  function navigate(overrides: Partial<AdminGiftCardQuery>): void {
    const queryString = createQueryString(data.query, overrides);
    const href = queryString ? `${pathname}?${queryString}` : pathname;

    startTransition(() => {
      router.push(href);
    });
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    navigate({
      page: 1,
      search: search.trim(),
      dateFrom,
      dateTo,
    });
  }

  function resetFilters(): void {
    setSearch("");
    setDateFrom("");
    setDateTo("");

    startTransition(() => {
      router.push(pathname);
    });
  }

  const exportQueryString = createQueryString(data.query, {
    page: 1,
  });

  const exportUrl = exportQueryString
    ? `/api/admin/gift-cards/export?${exportQueryString}`
    : "/api/admin/gift-cards/export";

  const hasActiveFilters =
    data.query.search !== "" ||
    data.query.status !== "ALL" ||
    data.query.sort !== "NEWEST" ||
    data.query.dateFrom !== "" ||
    data.query.dateTo !== "" ||
    data.query.expiredOnly ||
    data.query.pageSize !== 25;

  const pageNumbers = getPageNumbers(
    data.pagination.page,
    data.pagination.totalPages,
  );

  const firstVisibleItem =
    data.pagination.totalItems === 0
      ? 0
      : (data.pagination.page - 1) * data.pagination.pageSize + 1;

  const lastVisibleItem = Math.min(
    data.pagination.page * data.pagination.pageSize,
    data.pagination.totalItems,
  );

  return (
    <div className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Cartes vendues"
          value={String(data.metrics.totalCards)}
          description={`${data.metrics.activeCards + data.metrics.partiallyUsedCards} actuellement utilisables`}
          icon={<Gift className="size-5" />}
        />

        <MetricCard
          label="Montant vendu"
          value={formatCurrency(data.metrics.soldAmountCents)}
          description="Paiements confirmés"
          icon={<CircleDollarSign className="size-5" />}
        />

        <MetricCard
          label="Solde disponible"
          value={formatCurrency(data.metrics.remainingBalanceCents)}
          description="Montant encore utilisable au salon"
          icon={<WalletCards className="size-5" />}
        />

        <MetricCard
          label="Montant utilisé"
          value={formatCurrency(data.metrics.redeemedAmountCents)}
          description={`${data.metrics.fullyUsedCards} cartes entièrement utilisées`}
          icon={<BadgeEuro className="size-5" />}
        />
      </section>

      <section className="overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-200 p-5 sm:p-6">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-black tracking-tight text-zinc-950">
                  Cartes cadeaux
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  {data.pagination.totalItems} résultat
                  {data.pagination.totalItems > 1 ? "s" : ""}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={exportUrl}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-zinc-950 px-4 text-sm font-black text-white transition hover:bg-rose-700"
                >
                  <Download className="size-4" />
                  Exporter en CSV
                </a>

                {hasActiveFilters ? (
                  <button
                    type="button"
                    onClick={resetFilters}
                    disabled={isPending}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-black text-zinc-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 disabled:cursor-wait disabled:opacity-60"
                  >
                    <FilterX className="size-4" />
                    Réinitialiser
                  </button>
                ) : null}
              </div>
            </div>

            <form
              onSubmit={handleSearchSubmit}
              className="grid gap-3 xl:grid-cols-[minmax(260px,1.4fr)_220px_220px_180px_180px_auto]"
            >
              <label className="relative block">
                <span className="sr-only">Rechercher</span>

                <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />

                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Référence, code, nom ou e-mail"
                  className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-10 pr-4 text-sm font-medium text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-100"
                />
              </label>

              <select
                value={data.query.status}
                onChange={(event) =>
                  navigate({
                    page: 1,
                    status: event.target.value as AdminGiftCardStatusFilter,
                  })
                }
                className="h-11 rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm font-bold text-zinc-700 outline-none transition focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-100"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <label className="relative block">
                <ArrowDownUp className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />

                <select
                  value={data.query.sort}
                  onChange={(event) =>
                    navigate({
                      page: 1,
                      sort: event.target.value as AdminGiftCardSortMode,
                    })
                  }
                  className="h-11 w-full appearance-none rounded-xl border border-zinc-200 bg-zinc-50 pl-10 pr-8 text-sm font-bold text-zinc-700 outline-none transition focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-100"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="relative block">
                <span className="sr-only">Date de début</span>
                <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />

                <input
                  type="date"
                  value={dateFrom}
                  onChange={(event) => setDateFrom(event.target.value)}
                  className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-10 pr-3 text-sm font-bold text-zinc-700 outline-none transition focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-100"
                />
              </label>

              <label className="relative block">
                <span className="sr-only">Date de fin</span>
                <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />

                <input
                  type="date"
                  value={dateTo}
                  onChange={(event) => setDateTo(event.target.value)}
                  className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-10 pr-3 text-sm font-bold text-zinc-700 outline-none transition focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-100"
                />
              </label>

              <button
                type="submit"
                disabled={isPending}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 text-sm font-black text-white transition hover:bg-rose-700 disabled:cursor-wait disabled:opacity-60"
              >
                {isPending ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <Search className="size-4" />
                )}
                Appliquer
              </button>
            </form>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <label className="inline-flex items-center gap-3 text-sm font-bold text-zinc-700">
                <input
                  type="checkbox"
                  checked={data.query.expiredOnly}
                  onChange={(event) =>
                    navigate({
                      page: 1,
                      expiredOnly: event.target.checked,
                    })
                  }
                  className="size-4 rounded border-zinc-300 text-rose-600 focus:ring-rose-300"
                />
                Date d’expiration dépassée uniquement
              </label>

              <label className="flex items-center gap-2 text-sm font-bold text-zinc-600">
                Afficher
                <select
                  value={data.query.pageSize}
                  onChange={(event) =>
                    navigate({
                      page: 1,
                      pageSize: Number(event.target.value),
                    })
                  }
                  className="h-9 rounded-lg border border-zinc-200 bg-zinc-50 px-2 font-black text-zinc-800 outline-none focus:border-rose-300 focus:ring-4 focus:ring-rose-100"
                >
                  {PAGE_SIZE_OPTIONS.map((pageSize) => (
                    <option key={pageSize} value={pageSize}>
                      {pageSize}
                    </option>
                  ))}
                </select>
                par page
              </label>
            </div>
          </div>
        </div>

        {isPending ? (
          <div className="flex items-center justify-center gap-3 border-b border-zinc-100 bg-rose-50/50 px-5 py-3 text-sm font-bold text-rose-700">
            <LoaderCircle className="size-4 animate-spin" />
            Mise à jour des résultats…
          </div>
        ) : null}

        {data.giftCards.length === 0 ? (
          <div className="grid min-h-72 place-items-center p-8 text-center">
            <div>
              <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-rose-50 text-rose-600">
                <Gift className="size-6" />
              </span>

              <h3 className="mt-4 font-black text-zinc-950">
                Aucune carte trouvée
              </h3>

              <p className="mt-2 text-sm text-zinc-500">
                Modifiez votre recherche ou vos filtres.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="min-w-full">
                <thead className="bg-zinc-50">
                  <tr className="border-b border-zinc-200 text-left text-[11px] font-black uppercase tracking-[0.12em] text-zinc-500">
                    <th className="px-6 py-4">Carte</th>
                    <th className="px-6 py-4">Acheteur</th>
                    <th className="px-6 py-4">Bénéficiaire</th>
                    <th className="px-6 py-4">Montants</th>
                    <th className="px-6 py-4">Statut</th>
                    <th className="px-6 py-4">Expiration</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-zinc-100">
                  {data.giftCards.map((giftCard) => (
                    <tr
                      key={giftCard.id}
                      className="group transition hover:bg-rose-50/40"
                    >
                      <td className="px-6 py-5 align-top">
                        <Link
                          href={`/admin/cartes-cadeaux/${encodeURIComponent(
                            giftCard.reference,
                          )}`}
                          className="font-mono text-sm font-black text-zinc-950 underline-offset-4 transition group-hover:text-rose-700 group-hover:underline"
                        >
                          {giftCard.reference}
                        </Link>

                        <p className="mt-1 font-mono text-xs text-zinc-500">
                          {giftCard.code}
                        </p>

                        <p className="mt-2 text-xs text-zinc-400">
                          Créée le {formatDate(giftCard.createdAt)}
                        </p>
                      </td>

                      <td className="px-6 py-5 align-top">
                        <p className="text-sm font-black text-zinc-900">
                          {giftCard.purchaserFullName}
                        </p>

                        <p className="mt-1 max-w-56 break-all text-xs text-zinc-500">
                          {giftCard.purchaserEmail}
                        </p>
                      </td>

                      <td className="px-6 py-5 align-top">
                        <p className="text-sm font-black text-zinc-900">
                          {giftCard.recipientFullName}
                        </p>

                        <p className="mt-1 max-w-56 break-all text-xs text-zinc-500">
                          {giftCard.recipientEmail ?? "Aucun e-mail"}
                        </p>
                      </td>

                      <td className="px-6 py-5 align-top">
                        <p className="text-sm font-black text-zinc-950">
                          {formatCurrency(giftCard.balanceCents)}
                        </p>

                        <p className="mt-1 text-xs text-zinc-500">
                          sur {formatCurrency(giftCard.initialAmountCents)}
                        </p>
                      </td>

                      <td className="px-6 py-5 align-top">
                        <GiftCardStatusBadge status={giftCard.status} />
                      </td>

                      <td className="px-6 py-5 align-top">
                        <div className="flex items-center gap-2 text-sm font-bold text-zinc-700">
                          <Clock3 className="size-4 text-zinc-400" />
                          {formatDate(giftCard.expiresAt)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-zinc-100 lg:hidden">
              {data.giftCards.map((giftCard) => (
                <article key={giftCard.id} className="space-y-4 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <Link
                        href={`/admin/cartes-cadeaux/${encodeURIComponent(
                          giftCard.reference,
                        )}`}
                        className="font-mono text-sm font-black text-zinc-950 underline-offset-4 hover:text-rose-700 hover:underline"
                      >
                        {giftCard.reference}
                      </Link>

                      <p className="mt-1 font-mono text-xs text-zinc-500">
                        {giftCard.code}
                      </p>
                    </div>

                    <GiftCardStatusBadge status={giftCard.status} />
                  </div>

                  <div className="grid gap-3 rounded-2xl bg-zinc-50 p-4 sm:grid-cols-2">
                    <MobileInformation
                      label="Acheteur"
                      value={giftCard.purchaserFullName}
                    />

                    <MobileInformation
                      label="Bénéficiaire"
                      value={giftCard.recipientFullName}
                    />

                    <MobileInformation
                      label="Solde"
                      value={`${formatCurrency(
                        giftCard.balanceCents,
                      )} / ${formatCurrency(giftCard.initialAmountCents)}`}
                    />

                    <MobileInformation
                      label="Expiration"
                      value={formatDate(giftCard.expiresAt)}
                    />
                  </div>
                </article>
              ))}
            </div>
          </>
        )}

        <div className="border-t border-zinc-200 bg-zinc-50/70 px-5 py-4 sm:px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p className="text-sm font-bold text-zinc-600">
              Résultats {firstVisibleItem} à {lastVisibleItem} sur{" "}
              {data.pagination.totalItems}
            </p>

            <nav
              aria-label="Pagination des cartes cadeaux"
              className="flex flex-wrap items-center gap-2"
            >
              <PaginationButton
                label="Page précédente"
                disabled={!data.pagination.hasPreviousPage || isPending}
                onClick={() =>
                  navigate({
                    page: data.pagination.page - 1,
                  })
                }
              >
                <ChevronLeft className="size-4" />
              </PaginationButton>

              {pageNumbers.map((page, index) => {
                const previousPage = pageNumbers[index - 1];
                const showEllipsis =
                  previousPage !== undefined && page - previousPage > 1;

                return (
                  <div key={page} className="contents">
                    {showEllipsis ? (
                      <span className="px-1 text-sm font-black text-zinc-400">
                        …
                      </span>
                    ) : null}

                    <button
                      type="button"
                      onClick={() =>
                        navigate({
                          page,
                        })
                      }
                      disabled={isPending}
                      aria-current={
                        page === data.pagination.page ? "page" : undefined
                      }
                      className={
                        page === data.pagination.page
                          ? "grid size-10 place-items-center rounded-xl bg-zinc-950 text-sm font-black text-white"
                          : "grid size-10 place-items-center rounded-xl border border-zinc-200 bg-white text-sm font-black text-zinc-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 disabled:cursor-wait disabled:opacity-60"
                      }
                    >
                      {page}
                    </button>
                  </div>
                );
              })}

              <PaginationButton
                label="Page suivante"
                disabled={!data.pagination.hasNextPage || isPending}
                onClick={() =>
                  navigate({
                    page: data.pagination.page + 1,
                  })
                }
              >
                <ChevronRight className="size-4" />
              </PaginationButton>
            </nav>
          </div>
        </div>
      </section>
    </div>
  );
}

function MetricCard({
  label,
  value,
  description,
  icon,
}: {
  label: string;
  value: string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <article className="rounded-[1.75rem] border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-zinc-500">
            {label}
          </p>

          <p className="mt-3 text-2xl font-black tracking-tight text-zinc-950">
            {value}
          </p>
        </div>

        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-rose-50 text-rose-600">
          {icon}
        </span>
      </div>

      <p className="mt-3 text-xs leading-5 text-zinc-500">{description}</p>
    </article>
  );
}

function MobileInformation({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-black text-zinc-900">{value}</p>
    </div>
  );
}

function PaginationButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="grid size-10 place-items-center rounded-xl border border-zinc-200 bg-white text-zinc-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}
