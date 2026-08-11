"use client";

import {
  BriefcaseBusiness,
  CalendarCheck2,
  Check,
  ChevronDown,
  CircleUserRound,
  Clock3,
  Edit3,
  EllipsisVertical,
  Euro,
  LoaderCircle,
  Plus,
  Power,
  RefreshCcw,
  Search,
  Sparkles,
  Trash2,
  UserRoundCheck,
  UserRoundX,
  UsersRound,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";

import {
  TeamMemberForm,
} from "@/features/admin/team/components/team-member-form";

import type {
  TeamActivationResponse,
  TeamApiError,
  TeamDeleteResponse,
  TeamFormOptions,
  TeamMember,
  TeamMemberListResponse,
  TeamSortDirection,
  TeamSortField,
} from "@/features/admin/team/types/team.types";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type ModalState =
  | {
      type: "closed";
    }
  | {
      type: "create";
    }
  | {
      type: "edit";
      member: TeamMember;
    };

type DeleteState = {
  member: TeamMember;
  pending: boolean;
} | null;

/* -------------------------------------------------------------------------- */
/*                                 CONSTANTES                                 */
/* -------------------------------------------------------------------------- */

const SORT_OPTIONS: Array<{
  value: TeamSortField;
  label: string;
}> = [
  {
    value: "displayName",
    label: "Nom",
  },
  {
    value: "createdAt",
    label: "Date d’ajout",
  },
  {
    value: "appointments",
    label: "Rendez-vous",
  },
  {
    value: "revenue",
    label: "Chiffre d’affaires",
  },
];

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

function formatCurrency(
  valueCents: number,
): string {
  return new Intl.NumberFormat(
    "fr-FR",
    {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    },
  ).format(valueCents / 100);
}

function formatDate(
  value: string,
): string {
  const date = new Date(value);

  if (
    Number.isNaN(date.getTime())
  ) {
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

function getInitials(
  member: TeamMember,
): string {
  return `${member.firstName.charAt(0)}${member.lastName.charAt(0)}`.toUpperCase();
}

async function readJson<T>(
  response: Response,
): Promise<T> {
  const payload =
    (await response
      .json()
      .catch(() => null)) as
      | T
      | TeamApiError
      | null;

  if (!response.ok) {
    const message =
      payload &&
      typeof payload === "object" &&
      "error" in payload &&
      typeof payload.error ===
        "string"
        ? payload.error
        : "Une erreur est survenue.";

    throw new Error(message);
  }

  return payload as T;
}

/* -------------------------------------------------------------------------- */
/*                               MAIN COMPONENT                               */
/* -------------------------------------------------------------------------- */

export function TeamClient() {
  const [
    members,
    setMembers,
  ] = useState<TeamMember[]>([]);

  const [
    options,
    setOptions,
  ] = useState<TeamFormOptions>({
    services: [],
    workstations: [],
  });

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    activeOnly,
    setActiveOnly,
  ] = useState(false);

  const [
    onlineBookingOnly,
    setOnlineBookingOnly,
  ] = useState(false);

  const [
    includeOwner,
    setIncludeOwner,
  ] = useState(true);

  const [
    sortField,
    setSortField,
  ] = useState<TeamSortField>(
    "displayName",
  );

  const [
    sortDirection,
    setSortDirection,
  ] =
    useState<TeamSortDirection>(
      "asc",
    );

  const [
    modal,
    setModal,
  ] = useState<ModalState>({
    type: "closed",
  });

  const [
    deleteState,
    setDeleteState,
  ] = useState<DeleteState>(
    null,
  );

  const requestId =
    useRef(0);

  const loadOptions =
    useCallback(async () => {
      const response = await fetch(
        "/api/admin/team/options",
        {
          cache: "no-store",
          headers: {
            Accept:
              "application/json",
          },
        },
      );

      const payload =
        await readJson<TeamFormOptions>(
          response,
        );

      setOptions(payload);
    }, []);

  const loadMembers =
    useCallback(
      async (
        mode:
          | "initial"
          | "refresh" = "refresh",
      ) => {
        const currentRequest =
          ++requestId.current;

        if (
          mode === "initial"
        ) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        setError(null);

        try {
          const params =
            new URLSearchParams({
              search:
                search.trim(),
              activeOnly:
                String(activeOnly),
              onlineBookingOnly:
                String(
                  onlineBookingOnly,
                ),
              includeOwner:
                String(includeOwner),
              sortField,
              sortDirection,
            });

          const response =
            await fetch(
              `/api/admin/team?${params.toString()}`,
              {
                cache:
                  "no-store",
                headers: {
                  Accept:
                    "application/json",
                },
              },
            );

          const payload =
            await readJson<TeamMemberListResponse>(
              response,
            );

          if (
            currentRequest !==
            requestId.current
          ) {
            return;
          }

          setMembers(
            payload.members,
          );
        } catch (
          reason: unknown
        ) {
          if (
            currentRequest !==
            requestId.current
          ) {
            return;
          }

          setError(
            reason instanceof Error
              ? reason.message
              : "Impossible de charger l’équipe.",
          );
        } finally {
          if (
            currentRequest ===
            requestId.current
          ) {
            setLoading(false);
            setRefreshing(false);
          }
        }
      },
      [
        activeOnly,
        includeOwner,
        onlineBookingOnly,
        search,
        sortDirection,
        sortField,
      ],
    );

  useEffect(() => {
    const timer =
      window.setTimeout(() => {
        void loadMembers(
          "initial",
        );
      }, 250);

    return () => {
      window.clearTimeout(
        timer,
      );
    };
  }, [loadMembers]);

  useEffect(() => {
    const timeoutId =
      window.setTimeout(
        () => {
          void loadOptions().catch(
            (reason: unknown) => {
              toast.error(
                reason instanceof Error
                  ? reason.message
                  : "Impossible de charger les prestations et les postes.",
              );
            },
          );
        },
        0,
      );

    return () => {
      window.clearTimeout(
        timeoutId,
      );
    };
  }, [loadOptions]);

  const statistics =
    useMemo(() => {
      return {
        total: members.length,

        active: members.filter(
          (member) =>
            member.isActive,
        ).length,

        online: members.filter(
          (member) =>
            member.isActive &&
            member.acceptsOnlineBooking,
        ).length,

        appointments:
          members.reduce(
            (total, member) =>
              total +
              member.statistics
                .appointments,
            0,
          ),

        revenueCents:
          members.reduce(
            (total, member) =>
              total +
              member.statistics
                .revenueCents,
            0,
          ),
      };
    }, [members]);

  function closeModal(): void {
    setModal({
      type: "closed",
    });
  }

  function handleMemberSaved(
    savedMember: TeamMember,
  ): void {
    setMembers(
      (current) => {
        const exists =
          current.some(
            (member) =>
              member.id ===
              savedMember.id,
          );

        if (!exists) {
          return [
            savedMember,
            ...current,
          ];
        }

        return current.map(
          (member) =>
            member.id ===
            savedMember.id
              ? savedMember
              : member,
        );
      },
    );

    closeModal();

    void loadMembers();
  }

  async function toggleMemberActive(
    member: TeamMember,
  ): Promise<void> {
    const nextActive =
      !member.isActive;

    setMembers((current) =>
      current.map((item) =>
        item.id === member.id
          ? {
              ...item,
              isActive:
                nextActive,
            }
          : item,
      ),
    );

    try {
      const response =
        await fetch(
          `/api/admin/team/${member.id}`,
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",
              Accept:
                "application/json",
            },

            body: JSON.stringify({
              action:
                "set-active",
              isActive:
                nextActive,
            }),
          },
        );

      const payload =
        await readJson<TeamActivationResponse>(
          response,
        );

      setMembers(
        (current) =>
          current.map(
            (item) =>
              item.id ===
              payload.member.id
                ? payload.member
                : item,
          ),
      );

      toast.success(
        nextActive
          ? `${member.displayName} est maintenant active.`
          : `${member.displayName} a été désactivée.`,
      );
    } catch (
      reason: unknown
    ) {
      setMembers((current) =>
        current.map((item) =>
          item.id === member.id
            ? {
                ...item,
                isActive:
                  member.isActive,
              }
            : item,
        ),
      );

      toast.error(
        reason instanceof Error
          ? reason.message
          : "Impossible de modifier le statut.",
      );
    }
  }

  async function deleteMember(): Promise<void> {
    if (
      !deleteState ||
      deleteState.pending
    ) {
      return;
    }

    const member =
      deleteState.member;

    setDeleteState({
      member,
      pending: true,
    });

    try {
      const response =
        await fetch(
          `/api/admin/team/${member.id}`,
          {
            method:
              "DELETE",
            headers: {
              Accept:
                "application/json",
            },
          },
        );

      const payload =
        await readJson<TeamDeleteResponse>(
          response,
        );

      if (
        payload.deleted
      ) {
        setMembers(
          (current) =>
            current.filter(
              (item) =>
                item.id !==
                member.id,
            ),
        );

        toast.success(
          `${member.displayName} a été supprimée.`,
        );
      } else {
        setMembers(
          (current) =>
            current.map(
              (item) =>
                item.id ===
                member.id
                  ? {
                      ...item,
                      isActive:
                        false,
                    }
                  : item,
            ),
        );

        toast.success(
          `${member.displayName} a été désactivée car elle possède déjà un historique.`,
        );
      }

      setDeleteState(null);

      void loadMembers();
    } catch (
      reason: unknown
    ) {
      setDeleteState({
        member,
        pending: false,
      });

      toast.error(
        reason instanceof Error
          ? reason.message
          : "Impossible de supprimer la professionnelle.",
      );
    }
  }

  return (
    <div className="space-y-7">
      {/* ------------------------------------------------------------------ */}
      {/*                              HEADER                                */}
      {/* ------------------------------------------------------------------ */}

      <header className="overflow-hidden rounded-[32px] border border-rose-100 bg-gradient-to-br from-white via-rose-50/50 to-pink-100/50 p-4 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-start gap-4">
            <span className="grid size-14 shrink-0 place-items-center rounded-3xl bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-200">
              <UsersRound className="size-7" />
            </span>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#bd4b73]">
                Administration
              </p>

              <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-zinc-950 sm:mt-2 sm:text-4xl">
                Gestion de l’équipe
              </h1>

              <p className="mt-2 max-w-2xl text-xs leading-5 text-zinc-600 sm:mt-3 sm:text-base sm:leading-6">
                Gérez les professionnelles,
                leurs prestations, leurs postes
                et leur disponibilité pour la
                réservation en ligne.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              setModal({
                type: "create",
              })
            }
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 px-5 text-sm font-semibold text-white shadow-lg shadow-rose-200 transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            <Plus className="size-5" />
            Ajouter une professionnelle
          </button>
        </div>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/*                              STATS                                 */}
      {/* ------------------------------------------------------------------ */}

      <section className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-5">
        <StatCard
          icon={UsersRound}
          label="Professionnelles"
          value={statistics.total}
          helper="Dans la liste actuelle"
        />

        <StatCard
          icon={UserRoundCheck}
          label="Actives"
          value={statistics.active}
          helper="Comptes disponibles"
        />

        <StatCard
          icon={CalendarCheck2}
          label="Réservation en ligne"
          value={statistics.online}
          helper="Visibles par les clientes"
        />

        <StatCard
          icon={Clock3}
          label="Rendez-vous"
          value={
            statistics.appointments
          }
          helper="Total enregistré"
        />

        <StatCard
          icon={Euro}
          label="Chiffre d’affaires"
          value={formatCurrency(
            statistics.revenueCents,
          )}
          helper="Rendez-vous terminés"
        />
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*                              FILTERS                               */}
      {/* ------------------------------------------------------------------ */}

      <section className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="grid gap-4 xl:grid-cols-[minmax(260px,1fr)_auto_auto]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-zinc-400" />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Rechercher par nom, e-mail ou téléphone..."
              className="h-12 w-full rounded-2xl border border-zinc-200 bg-zinc-50 pl-12 pr-4 text-sm outline-none transition focus:border-rose-400 focus:bg-white focus:ring-4 focus:ring-rose-100"
            />
          </label>

          <div className="relative">
            <select
              value={sortField}
              onChange={(event) =>
                setSortField(
                  event.target
                    .value as TeamSortField,
                )
              }
              className="h-12 w-full appearance-none rounded-2xl border border-zinc-200 bg-white pl-4 pr-10 text-sm font-medium text-zinc-700 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100 xl:w-52"
            >
              {SORT_OPTIONS.map(
                (option) => (
                  <option
                    key={
                      option.value
                    }
                    value={
                      option.value
                    }
                  >
                    Trier par{" "}
                    {option.label}
                  </option>
                ),
              )}
            </select>

            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
          </div>

          <button
            type="button"
            onClick={() =>
              setSortDirection(
                (current) =>
                  current === "asc"
                    ? "desc"
                    : "asc",
              )
            }
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-700 transition hover:border-rose-200 hover:bg-rose-50"
          >
            {sortDirection ===
            "asc"
              ? "Ordre croissant"
              : "Ordre décroissant"}
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <FilterButton
            checked={activeOnly}
            label="Actives uniquement"
            onChange={
              setActiveOnly
            }
          />

          <FilterButton
            checked={
              onlineBookingOnly
            }
            label="Réservation en ligne"
            onChange={
              setOnlineBookingOnly
            }
          />

          <FilterButton
            checked={includeOwner}
            label="Afficher la propriétaire"
            onChange={
              setIncludeOwner
            }
          />

          <button
            type="button"
            onClick={() =>
              void loadMembers()
            }
            disabled={refreshing}
            className="ml-auto inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCcw
              className={`size-4 ${
                refreshing
                  ? "animate-spin"
                  : ""
              }`}
            />
            Actualiser
          </button>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*                               LIST                                 */}
      {/* ------------------------------------------------------------------ */}

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState
          message={error}
          onRetry={() =>
            void loadMembers()
          }
        />
      ) : members.length ===
        0 ? (
        <EmptyState
          onCreate={() =>
            setModal({
              type: "create",
            })
          }
        />
      ) : (
        <section className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
          {members.map(
            (member) => (
              <TeamMemberCard
                key={member.id}
                member={member}
                onEdit={() =>
                  setModal({
                    type: "edit",
                    member,
                  })
                }
                onToggleActive={() =>
                  void toggleMemberActive(
                    member,
                  )
                }
                onDelete={() =>
                  setDeleteState({
                    member,
                    pending: false,
                  })
                }
              />
            ),
          )}
        </section>
      )}

      {/* ------------------------------------------------------------------ */}
      {/*                          FORM MODAL                                 */}
      {/* ------------------------------------------------------------------ */}

      {modal.type !==
      "closed" ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950/55 p-3 backdrop-blur-sm sm:p-6">
          <button
            type="button"
            aria-label="Fermer"
            className="fixed inset-0 cursor-default"
            onClick={closeModal}
          />

          <div className="relative mx-auto my-4 max-w-5xl rounded-[32px] border border-white/80 bg-zinc-50 p-4 shadow-2xl sm:p-6">
            <TeamMemberForm
              key={
                modal.type ===
                "edit"
                  ? modal.member.id
                  : "create"
              }
              mode={
                modal.type ===
                "create"
                  ? "create"
                  : "edit"
              }
              member={
                modal.type ===
                "edit"
                  ? modal.member
                  : null
              }
              options={options}
              onSaved={
                handleMemberSaved
              }
              onCancel={
                closeModal
              }
            />
          </div>
        </div>
      ) : null}

      {/* ------------------------------------------------------------------ */}
      {/*                         DELETE MODAL                                */}
      {/* ------------------------------------------------------------------ */}

      {deleteState ? (
        <DeleteDialog
          state={deleteState}
          onCancel={() =>
            setDeleteState(null)
          }
          onConfirm={() =>
            void deleteMember()
          }
        />
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                            TEAM MEMBER CARD                                */
/* -------------------------------------------------------------------------- */

type TeamMemberCardProps = {
  member: TeamMember;
  onEdit: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
};

function TeamMemberCard({
  member,
  onEdit,
  onToggleActive,
  onDelete,
}: TeamMemberCardProps) {
  const [
    menuOpen,
    setMenuOpen,
  ] = useState(false);

  return (
    <article
      className={`group relative overflow-hidden rounded-[28px] border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl ${
        member.isActive
          ? "border-zinc-200"
          : "border-zinc-200 opacity-75"
      }`}
    >
      <div
        className="h-2 w-full"
        style={{
          backgroundColor:
            member.color ??
            "#bd4b73",
        }}
      />

      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div
            className="grid size-14 shrink-0 place-items-center rounded-2xl text-base font-bold text-white shadow-lg"
            style={{
              backgroundColor:
                member.color ??
                "#bd4b73",
            }}
          >
            {member.image ? (
              <img
                src={member.image}
                alt={
                  member.displayName
                }
                className="size-full rounded-2xl object-cover"
              />
            ) : (
              getInitials(member)
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-lg font-semibold text-zinc-950">
                {member.displayName}
              </h2>

              {member.isOwner ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-700">
                  <Sparkles className="size-3" />
                  Propriétaire
                </span>
              ) : null}
            </div>

            <p className="mt-1 truncate text-sm text-zinc-500">
              {member.email}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <StatusBadge
                active={
                  member.isActive
                }
                activeLabel="Active"
                inactiveLabel="Inactive"
              />

              <StatusBadge
                active={
                  member.acceptsOnlineBooking
                }
                activeLabel="Réservable en ligne"
                inactiveLabel="Hors ligne"
              />
            </div>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setMenuOpen(
                  (current) =>
                    !current,
                )
              }
              className="grid size-10 place-items-center rounded-full text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-950"
              aria-label="Actions"
            >
              <EllipsisVertical className="size-5" />
            </button>

            {menuOpen ? (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-10 cursor-default"
                  aria-label="Fermer le menu"
                  onClick={() =>
                    setMenuOpen(
                      false,
                    )
                  }
                />

                <div className="absolute right-0 top-11 z-20 w-56 overflow-hidden rounded-2xl border border-zinc-200 bg-white p-2 shadow-xl">
                  <MenuButton
                    icon={Edit3}
                    label="Modifier"
                    onClick={() => {
                      setMenuOpen(
                        false,
                      );
                      onEdit();
                    }}
                  />

                  <MenuButton
                    icon={Power}
                    label={
                      member.isActive
                        ? "Désactiver"
                        : "Activer"
                    }
                    onClick={() => {
                      setMenuOpen(
                        false,
                      );
                      onToggleActive();
                    }}
                  />

                  {!member.isOwner ? (
                    <MenuButton
                      icon={Trash2}
                      label="Supprimer"
                      destructive
                      onClick={() => {
                        setMenuOpen(
                          false,
                        );
                        onDelete();
                      }}
                    />
                  ) : null}
                </div>
              </>
            ) : null}
          </div>
        </div>

        {member.bio ? (
          <p className="mt-5 line-clamp-3 text-sm leading-6 text-zinc-600">
            {member.bio}
          </p>
        ) : null}

        <div className="mt-5 grid grid-cols-3 gap-2">
          <MiniStat
            label="Rendez-vous"
            value={
              member.statistics
                .appointments
            }
          />

          <MiniStat
            label="Terminés"
            value={
              member.statistics
                .completedAppointments
            }
          />

          <MiniStat
            label="CA"
            value={formatCurrency(
              member.statistics
                .revenueCents,
            )}
          />
        </div>

        <div className="mt-5 space-y-3 border-t border-zinc-100 pt-5">
          <div className="flex items-start gap-3">
            <BriefcaseBusiness className="mt-0.5 size-4 shrink-0 text-zinc-400" />

            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Prestations
              </p>

              <p className="mt-1 text-sm text-zinc-700">
                {member.services
                  .slice(0, 3)
                  .map(
                    (service) =>
                      service.name,
                  )
                  .join(", ") ||
                  "Aucune prestation"}

                {member.services
                  .length > 3
                  ? ` +${member.services.length - 3}`
                  : ""}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CircleUserRound className="mt-0.5 size-4 shrink-0 text-zinc-400" />

            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Postes
              </p>

              <p className="mt-1 text-sm text-zinc-700">
                {member.workstations
                  .map(
                    (workstation) =>
                      workstation.name,
                  )
                  .join(", ") ||
                  "Aucun poste attribué"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-4 border-t border-zinc-100 pt-4 text-xs text-zinc-400">
          <span>
            Ajoutée le{" "}
            {formatDate(
              member.createdAt,
            )}
          </span>

          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-1.5 font-semibold text-[#bd4b73] transition hover:text-rose-700"
          >
            <Edit3 className="size-3.5" />
            Modifier
          </button>
        </div>
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/*                              STAT CARD                                     */
/* -------------------------------------------------------------------------- */

type StatCardProps = {
  icon: typeof UsersRound;
  label: string;
  value: string | number;
  helper: string;
};

function StatCard({
  icon: Icon,
  label,
  value,
  helper,
}: StatCardProps) {
  return (
    <article className="rounded-3xl border border-zinc-200 bg-white p-3.5 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-zinc-500">
            {label}
          </p>

          <p className="mt-1.5 text-lg font-semibold tracking-tight text-zinc-950 sm:mt-2 sm:text-2xl">
            {value}
          </p>

          <p className="mt-1 text-xs text-zinc-400">
            {helper}
          </p>
        </div>

        <span className="grid size-10 place-items-center rounded-2xl bg-rose-50 text-[#bd4b73]">
          <Icon className="size-5" />
        </span>
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/*                              MINI STAT                                     */
/* -------------------------------------------------------------------------- */

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl bg-zinc-50 p-3 text-center">
      <p className="truncate text-base font-semibold text-zinc-950">
        {value}
      </p>

      <p className="mt-1 truncate text-[11px] text-zinc-500">
        {label}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                             STATUS BADGE                                   */
/* -------------------------------------------------------------------------- */

function StatusBadge({
  active,
  activeLabel,
  inactiveLabel,
}: {
  active: boolean;
  activeLabel: string;
  inactiveLabel: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
        active
          ? "bg-emerald-100 text-emerald-700"
          : "bg-zinc-100 text-zinc-500"
      }`}
    >
      <span
        className={`size-1.5 rounded-full ${
          active
            ? "bg-emerald-500"
            : "bg-zinc-400"
        }`}
      />

      {active
        ? activeLabel
        : inactiveLabel}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*                             FILTER BUTTON                                  */
/* -------------------------------------------------------------------------- */

function FilterButton({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (
    checked: boolean,
  ) => void;
}) {
  return (
    <button
      type="button"
      onClick={() =>
        onChange(!checked)
      }
      className={`inline-flex h-10 items-center gap-2 rounded-xl border px-3.5 text-sm font-medium transition ${
        checked
          ? "border-rose-300 bg-rose-50 text-[#bd4b73]"
          : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
      }`}
    >
      <span
        className={`grid size-4 place-items-center rounded border ${
          checked
            ? "border-rose-600 bg-rose-600 text-white"
            : "border-zinc-300 bg-white text-transparent"
        }`}
      >
        <Check className="size-3" />
      </span>

      {label}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*                              MENU BUTTON                                   */
/* -------------------------------------------------------------------------- */

function MenuButton({
  icon: Icon,
  label,
  destructive = false,
  onClick,
}: {
  icon: typeof Edit3;
  label: string;
  destructive?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
        destructive
          ? "text-red-600 hover:bg-red-50"
          : "text-zinc-700 hover:bg-zinc-100"
      }`}
    >
      <Icon className="size-4" />
      {label}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*                              LOADING STATE                                 */
/* -------------------------------------------------------------------------- */

function LoadingState() {
  return (
    <div className="grid min-h-72 place-items-center rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
      <div className="text-center">
        <LoaderCircle className="mx-auto size-9 animate-spin text-[#bd4b73]" />

        <p className="mt-4 font-semibold text-zinc-900">
          Chargement de l’équipe...
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               ERROR STATE                                  */
/* -------------------------------------------------------------------------- */

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="grid min-h-72 place-items-center rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
      <div>
        <UserRoundX className="mx-auto size-10 text-red-500" />

        <h2 className="mt-4 text-lg font-semibold text-red-900">
          Chargement impossible
        </h2>

        <p className="mt-2 text-sm text-red-700">
          {message}
        </p>

        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white"
        >
          <RefreshCcw className="size-4" />
          Réessayer
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               EMPTY STATE                                  */
/* -------------------------------------------------------------------------- */

function EmptyState({
  onCreate,
}: {
  onCreate: () => void;
}) {
  return (
    <div className="grid min-h-80 place-items-center rounded-3xl border border-dashed border-rose-300 bg-rose-50/50 p-8 text-center">
      <div>
        <span className="mx-auto grid size-16 place-items-center rounded-3xl bg-white text-[#bd4b73] shadow-sm">
          <UsersRound className="size-8" />
        </span>

        <h2 className="mt-5 text-xl font-semibold text-zinc-950">
          Aucune professionnelle trouvée
        </h2>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-600">
          Modifiez vos filtres ou
          ajoutez une nouvelle personne
          à l’équipe du salon.
        </p>

        <button
          type="button"
          onClick={onCreate}
          className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-rose-600 px-5 text-sm font-semibold text-white"
        >
          <Plus className="size-4" />
          Ajouter une professionnelle
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                             DELETE DIALOG                                  */
/* -------------------------------------------------------------------------- */

function DeleteDialog({
  state,
  onCancel,
  onConfirm,
}: {
  state: NonNullable<DeleteState>;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-zinc-950/60 p-4 backdrop-blur-sm">
      <button
        type="button"
        aria-label="Fermer"
        className="absolute inset-0 cursor-default"
        onClick={
          state.pending
            ? undefined
            : onCancel
        }
      />

      <div className="relative w-full max-w-md rounded-[28px] border border-white/80 bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <span className="grid size-12 place-items-center rounded-2xl bg-red-100 text-red-600">
            <Trash2 className="size-6" />
          </span>

          <button
            type="button"
            onClick={onCancel}
            disabled={state.pending}
            className="grid size-9 place-items-center rounded-full text-zinc-500 transition hover:bg-zinc-100 disabled:opacity-50"
          >
            <X className="size-5" />
          </button>
        </div>

        <h2 className="mt-5 text-xl font-semibold text-zinc-950">
          Supprimer{" "}
          {state.member.displayName} ?
        </h2>

        <p className="mt-3 text-sm leading-6 text-zinc-600">
          Si cette professionnelle
          possède déjà des rendez-vous ou
          un historique, son compte sera
          désactivé plutôt que supprimé
          définitivement.
        </p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={state.pending}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-zinc-300 px-4 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50"
          >
            Annuler
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={state.pending}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {state.pending ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <Trash2 className="size-4" />
            )}

            {state.pending
              ? "Suppression..."
              : "Confirmer"}
          </button>
        </div>
      </div>
    </div>
  );
}
