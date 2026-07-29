"use client";

import type {
  ReactNode,
} from "react";

import {
  useMemo,
  useState,
  useTransition,
} from "react";

import {
  Archive,
  BadgePercent,
  Boxes,
  CalendarDays,
  Crown,
  Gift,
  LoaderCircle,
  Pencil,
  Plus,
  Save,
  Search,
  Sparkles,
  Star,
  Trash2,
  X,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  toast,
} from "sonner";

import {
  createAdminVipRewardAction,
  deleteAdminVipRewardAction,
  updateAdminVipRewardAction,
} from "@/features/admin/vip/actions/admin-vip-rewards.actions";

import type {
  AdminVipRewardFormInput,
} from "@/features/admin/vip/schemas/admin-vip-reward.schemas";

import type {
  AdminVipReward,
  AdminVipRewardsPageData,
} from "@/features/admin/vip/types/admin-vip-reward.types";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type AdminVipRewardsManagerProps = {
  data: AdminVipRewardsPageData;
};

type FieldErrors = Record<
  string,
  string[]
>;

type RewardStatusFilter =
  | "ALL"
  | AdminVipRewardFormInput["status"];

type RewardTypeFilter =
  | "ALL"
  | AdminVipRewardFormInput["type"];

/* -------------------------------------------------------------------------- */
/*                                CONSTANTES                                  */
/* -------------------------------------------------------------------------- */

const TYPE_LABELS: Record<
  AdminVipRewardFormInput["type"],
  string
> = {
  FIXED_DISCOUNT:
    "Réduction fixe",

  PERCENTAGE_DISCOUNT:
    "Réduction en pourcentage",

  FREE_SERVICE:
    "Prestation offerte",

  FREE_NAIL_ART:
    "Nail art offert",

  FREE_PRODUCT:
    "Produit offert",

  GIFT_CARD:
    "Carte cadeau",

  LOYALTY_POINTS:
    "Points fidélité",

  EXPERIENCE_POINTS:
    "Points d’expérience",

  CONTEST_ENTRY:
    "Participation concours",

  SEASON_PASS_XP:
    "XP de saison",

  PHYSICAL_GIFT:
    "Cadeau physique",

  VIP_ACCESS:
    "Accès VIP",

  CUSTOM:
    "Récompense personnalisée",
};

const STATUS_LABELS: Record<
  AdminVipRewardFormInput["status"],
  string
> = {
  DRAFT:
    "Brouillon",

  ACTIVE:
    "Active",

  INACTIVE:
    "Inactive",

  ARCHIVED:
    "Archivée",
};

const STATUS_CLASSES: Record<
  AdminVipRewardFormInput["status"],
  string
> = {
  DRAFT:
    "bg-zinc-100 text-zinc-700",

  ACTIVE:
    "bg-emerald-50 text-emerald-700",

  INACTIVE:
    "bg-amber-50 text-amber-700",

  ARCHIVED:
    "bg-red-50 text-red-700",
};

/* -------------------------------------------------------------------------- */
/*                                  OUTILS                                    */
/* -------------------------------------------------------------------------- */

function slugify(
  value: string,
): string {
  return value
    .normalize(
      "NFD",
    )
    .replace(
      /[\u0300-\u036f]/g,
      "",
    )
    .toLowerCase()
    .trim()
    .replace(
      /[^a-z0-9]+/g,
      "-",
    )
    .replace(
      /^-+|-+$/g,
      "",
    );
}

function toDateTimeLocal(
  value: string | null,
): string {
  if (!value) {
    return "";
  }

  const date =
    new Date(
      value,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "";
  }

  const timezoneOffset =
    date.getTimezoneOffset() *
    60_000;

  return new Date(
    date.getTime() -
      timezoneOffset,
  )
    .toISOString()
    .slice(
      0,
      16,
    );
}

function toIsoDate(
  value: string,
): string {
  if (!value) {
    return "";
  }

  const date =
    new Date(
      value,
    );

  return Number.isNaN(
    date.getTime(),
  )
    ? value
    : date.toISOString();
}

function formatCurrency(
  cents: number,
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
    cents /
      100,
  );
}

function formatDate(
  value: string | null,
): string {
  if (!value) {
    return "Sans limite";
  }

  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      dateStyle:
        "medium",
    },
  ).format(
    new Date(
      value,
    ),
  );
}

function createEmptyForm(
  data: AdminVipRewardsPageData,
): AdminVipRewardFormInput {
  const highestSortOrder =
    data.rewards.reduce(
      (
        highest,
        reward,
      ) =>
        Math.max(
          highest,
          reward.sortOrder,
        ),
      0,
    );

  return {
    name:
      "",

    slug:
      "",

    description:
      "",

    shortDescription:
      "",

    type:
      "PERCENTAGE_DISCOUNT",

    icon:
      "Gift",

    imageUrl:
      "",

    bannerUrl:
      "",

    color:
      "#7c3aed",

    fixedAmountCents:
      null,

    percentage:
      10,

    loyaltyPoints:
      null,

    experiencePoints:
      null,

    freeServiceId:
      null,

    quantity:
      1,

    minimumLevelId:
      null,

    minimumPoints:
      null,

    minimumXp:
      null,

    rewardCode:
      "",

    couponCodePrefix:
      "VIP",

    validForDays:
      30,

    startsAt:
      "",

    endsAt:
      "",

    unlimitedStock:
      true,

    stock:
      null,

    remainingStock:
      null,

    status:
      "DRAFT",

    visible:
      true,

    featured:
      false,

    repeatable:
      false,

    sortOrder:
      highestSortOrder +
      1,
  };
}

function rewardToForm(
  reward: AdminVipReward,
): AdminVipRewardFormInput {
  return {
    id:
      reward.id,

    name:
      reward.name,

    slug:
      reward.slug,

    description:
      reward.description ??
      "",

    shortDescription:
      reward.shortDescription ??
      "",

    type:
      reward.type,

    icon:
      reward.icon ??
      "Gift",

    imageUrl:
      reward.imageUrl ??
      "",

    bannerUrl:
      reward.bannerUrl ??
      "",

    color:
      reward.color ??
      "#7c3aed",

    fixedAmountCents:
      reward.fixedAmountCents,

    percentage:
      reward.percentage,

    loyaltyPoints:
      reward.loyaltyPoints,

    experiencePoints:
      reward.experiencePoints,

    freeServiceId:
      reward.freeServiceId,

    quantity:
      reward.quantity,

    minimumLevelId:
      reward.minimumLevelId,

    minimumPoints:
      reward.minimumPoints,

    minimumXp:
      reward.minimumXp,

    rewardCode:
      reward.rewardCode ??
      "",

    couponCodePrefix:
      reward.couponCodePrefix ??
      "",

    validForDays:
      reward.validForDays,

    startsAt:
      toDateTimeLocal(
        reward.startsAt,
      ),

    endsAt:
      toDateTimeLocal(
        reward.endsAt,
      ),

    unlimitedStock:
      reward.unlimitedStock,

    stock:
      reward.stock,

    remainingStock:
      reward.remainingStock,

    status:
      reward.status,

    visible:
      reward.visible,

    featured:
      reward.featured,

    repeatable:
      reward.repeatable,

    sortOrder:
      reward.sortOrder,
  };
}

function getRewardValue(
  reward: AdminVipReward,
): string {
  switch (
    reward.type
  ) {
    case "FIXED_DISCOUNT":
    case "GIFT_CARD":
      return reward.fixedAmountCents
        ? formatCurrency(
            reward.fixedAmountCents,
          )
        : "Montant non défini";

    case "PERCENTAGE_DISCOUNT":
      return reward.percentage
        ? `${reward.percentage} %`
        : "Pourcentage non défini";

    case "LOYALTY_POINTS":
      return `${reward.loyaltyPoints ?? 0} points`;

    case "EXPERIENCE_POINTS":
    case "SEASON_PASS_XP":
      return `${reward.experiencePoints ?? 0} XP`;

    case "FREE_SERVICE":
      return reward.freeService
        ?.name ??
        "Prestation non définie";

    default:
      return reward.quantity
        ? `Quantité : ${reward.quantity}`
        : TYPE_LABELS[
            reward.type
          ];
  }
}

/* -------------------------------------------------------------------------- */
/*                             SOUS-COMPOSANTS                                */
/* -------------------------------------------------------------------------- */

function FieldError({
  name,
  errors,
}: {
  name: string;
  errors: FieldErrors;
}) {
  const message =
    errors[name]?.[0];

  return message ? (
    <p className="mt-1.5 text-xs font-semibold text-red-600">
      {message}
    </p>
  ) : null;
}

function FormSection({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[1.5rem] border border-zinc-200 bg-white p-5">
      <header className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
          {icon}
        </span>

        <div>
          <h3 className="font-black text-zinc-950">
            {title}
          </h3>

          <p className="mt-1 text-xs leading-5 text-zinc-500">
            {description}
          </p>
        </div>
      </header>

      <div className="mt-5">
        {children}
      </div>
    </section>
  );
}

function TextField({
  label,
  name,
  value,
  onChange,
  errors,
  type = "text",
  placeholder,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  errors: FieldErrors;
  type?:
    | "text"
    | "url"
    | "datetime-local";
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-black text-zinc-800">
        {label}
      </span>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        className={`mt-2 h-11 w-full rounded-xl border bg-white px-3.5 text-sm outline-none transition focus:ring-4 ${
          errors[name]?.length
            ? "border-red-300 focus:border-red-400 focus:ring-red-100"
            : "border-zinc-200 focus:border-violet-400 focus:ring-violet-100"
        }`}
      />

      <FieldError
        name={name}
        errors={errors}
      />
    </label>
  );
}

function NumberField({
  label,
  name,
  value,
  onChange,
  errors,
  minimum = 0,
  maximum,
  step = 1,
  nullable = true,
  disabled = false,
  suffix,
}: {
  label: string;
  name: string;
  value: number | null;
  onChange: (value: number | null) => void;
  errors: FieldErrors;
  minimum?: number;
  maximum?: number;
  step?: number;
  nullable?: boolean;
  disabled?: boolean;
  suffix?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-black text-zinc-800">
        {label}
      </span>

      <div className="relative mt-2">
        <input
          type="number"
          value={
            value ??
            ""
          }
          min={minimum}
          max={maximum}
          step={step}
          disabled={disabled}
          onChange={(event) => {
            const rawValue =
              event.target.value;

            if (
              rawValue ===
                "" &&
              nullable
            ) {
              onChange(
                null,
              );

              return;
            }

            const number =
              Number(
                rawValue,
              );

            onChange(
              Number.isFinite(
                number,
              )
                ? number
                : nullable
                  ? null
                  : minimum,
            );
          }}
          className={`h-11 w-full rounded-xl border bg-white px-3.5 text-sm outline-none transition focus:ring-4 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400 ${
            suffix
              ? "pr-12"
              : ""
          } ${
            errors[name]?.length
              ? "border-red-300 focus:border-red-400 focus:ring-red-100"
              : "border-zinc-200 focus:border-violet-400 focus:ring-violet-100"
          }`}
        />

        {suffix ? (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-zinc-400">
            {suffix}
          </span>
        ) : null}
      </div>

      <FieldError
        name={name}
        errors={errors}
      />
    </label>
  );
}

function MoneyField({
  label,
  name,
  value,
  onChange,
  errors,
}: {
  label: string;
  name: string;
  value: number | null;
  onChange: (value: number | null) => void;
  errors: FieldErrors;
}) {
  return (
    <label className="block">
      <span className="text-sm font-black text-zinc-800">
        {label}
      </span>

      <div className="relative mt-2">
        <input
          type="number"
          min={0}
          step={0.01}
          value={
            value ===
            null
              ? ""
              : value /
                100
          }
          onChange={(event) => {
            const rawValue =
              event.target.value;

            if (
              rawValue ===
              ""
            ) {
              onChange(
                null,
              );

              return;
            }

            const euros =
              Number(
                rawValue,
              );

            onChange(
              Number.isFinite(
                euros,
              )
                ? Math.round(
                    euros *
                      100,
                  )
                : null,
            );
          }}
          className={`h-11 w-full rounded-xl border bg-white px-3.5 pr-12 text-sm outline-none transition focus:ring-4 ${
            errors[name]?.length
              ? "border-red-300 focus:border-red-400 focus:ring-red-100"
              : "border-zinc-200 focus:border-violet-400 focus:ring-violet-100"
          }`}
        />

        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-black text-zinc-400">
          €
        </span>
      </div>

      <FieldError
        name={name}
        errors={errors}
      />
    </label>
  );
}

function ToggleField({
  label,
  description,
  checked,
  onChange,
  disabled = false,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() =>
        onChange(
          !checked,
        )
      }
      className="flex w-full items-start justify-between gap-4 rounded-2xl border border-zinc-200 p-4 text-left transition hover:border-violet-200 hover:bg-violet-50/30 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span>
        <span className="block text-sm font-black text-zinc-900">
          {label}
        </span>

        <span className="mt-1 block text-xs leading-5 text-zinc-500">
          {description}
        </span>
      </span>

      <span
        className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition ${
          checked
            ? "bg-violet-600"
            : "bg-zinc-300"
        }`}
      >
        <span
          className={`absolute top-1 size-4 rounded-full bg-white shadow transition ${
            checked
              ? "left-6"
              : "left-1"
          }`}
        />
      </span>
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*                                COMPOSANT                                   */
/* -------------------------------------------------------------------------- */

export function AdminVipRewardsManager({
  data,
}: AdminVipRewardsManagerProps) {
  const router =
    useRouter();

  const [
    isPending,
    startTransition,
  ] =
    useTransition();

  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState<RewardStatusFilter>(
      "ALL",
    );

  const [
    typeFilter,
    setTypeFilter,
  ] =
    useState<RewardTypeFilter>(
      "ALL",
    );

  const [
    editorOpen,
    setEditorOpen,
  ] =
    useState(false);

  const [
    slugEdited,
    setSlugEdited,
  ] =
    useState(false);

  const [
    errors,
    setErrors,
  ] =
    useState<FieldErrors>({});

  const [
    form,
    setForm,
  ] =
    useState<AdminVipRewardFormInput>(
      () =>
        createEmptyForm(
          data,
        ),
    );

  const filteredRewards =
    useMemo(
      () => {
        const normalizedSearch =
          search
            .trim()
            .toLowerCase();

        return data.rewards.filter(
          (
            reward,
          ) => {
            if (
              statusFilter !==
                "ALL" &&
              reward.status !==
                statusFilter
            ) {
              return false;
            }

            if (
              typeFilter !==
                "ALL" &&
              reward.type !==
                typeFilter
            ) {
              return false;
            }

            if (
              !normalizedSearch
            ) {
              return true;
            }

            return [
              reward.name,
              reward.slug,
              reward.description ??
                "",
              reward.shortDescription ??
                "",
              reward.rewardCode ??
                "",
            ].some(
              (
                value,
              ) =>
                value
                  .toLowerCase()
                  .includes(
                    normalizedSearch,
                  ),
            );
          },
        );
      },
      [
        data.rewards,
        search,
        statusFilter,
        typeFilter,
      ],
    );

  function updateField<
    Key extends keyof AdminVipRewardFormInput,
  >(
    key: Key,
    value: AdminVipRewardFormInput[Key],
  ): void {
    setForm(
      (
        current,
      ) => ({
        ...current,
        [key]:
          value,
      }),
    );
  }

  function updateName(
    name: string,
  ): void {
    setForm(
      (
        current,
      ) => ({
        ...current,

        name,

        slug:
          slugEdited
            ? current.slug
            : slugify(
                name,
              ),
      }),
    );
  }

  function openCreation():
    void {
    setForm(
      createEmptyForm(
        data,
      ),
    );

    setErrors({});
    setSlugEdited(
      false,
    );
    setEditorOpen(
      true,
    );
  }

  function openEdition(
    reward: AdminVipReward,
  ): void {
    setForm(
      rewardToForm(
        reward,
      ),
    );

    setErrors({});
    setSlugEdited(
      true,
    );
    setEditorOpen(
      true,
    );
  }

  function closeEditor():
    void {
    if (
      isPending
    ) {
      return;
    }

    setEditorOpen(
      false,
    );

    setErrors({});
  }

  function saveReward():
    void {
    setErrors({});

    const payload:
      AdminVipRewardFormInput =
      {
        ...form,

        startsAt:
          toIsoDate(
            form.startsAt,
          ),

        endsAt:
          toIsoDate(
            form.endsAt,
          ),

        stock:
          form.unlimitedStock
            ? null
            : form.stock,

        remainingStock:
          form.unlimitedStock
            ? null
            : form.remainingStock,
      };

    startTransition(() => {
      void (async () => {
        const result =
          form.id
            ? await updateAdminVipRewardAction(
                payload,
              )
            : await createAdminVipRewardAction(
                payload,
              );

        if (
          !result.success
        ) {
          setErrors(
            result.fieldErrors ??
              {},
          );

          toast.error(
            result.message,
          );

          return;
        }

        toast.success(
          result.message,
        );

        setEditorOpen(
          false,
        );

        router.refresh();
      })();
    });
  }

  function archiveReward(
    reward: AdminVipReward,
  ): void {
    if (
      !window.confirm(
        `Archiver la récompense « ${reward.name} » ?`,
      )
    ) {
      return;
    }

    startTransition(() => {
      void (async () => {
        const result =
          await updateAdminVipRewardAction({
            ...rewardToForm(
              reward,
            ),

            startsAt:
              reward.startsAt ??
              "",

            endsAt:
              reward.endsAt ??
              "",

            status:
              "ARCHIVED",

            visible:
              false,

            featured:
              false,
          });

        if (
          !result.success
        ) {
          toast.error(
            result.message,
          );

          return;
        }

        toast.success(
          "La récompense a été archivée.",
        );

        router.refresh();
      })();
    });
  }

  function deleteReward(
    reward: AdminVipReward,
  ): void {
    const reason =
      window.prompt(
        `Indiquez le motif de suppression de « ${reward.name} » :`,
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
      !normalizedReason
    ) {
      toast.error(
        "Le motif de suppression est obligatoire.",
      );

      return;
    }

    if (
      !window.confirm(
        "Cette suppression est définitive. Continuer ?",
      )
    ) {
      return;
    }

    startTransition(() => {
      void (async () => {
        const result =
          await deleteAdminVipRewardAction({
            rewardId:
              reward.id,

            reason:
              normalizedReason,
          });

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
      })();
    });
  }

  const selectedType =
    form.type;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-[1.5rem] border border-zinc-200 bg-white p-5 shadow-sm">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
            <Gift className="size-5" />
          </span>

          <p className="mt-4 text-sm font-bold text-zinc-500">
            Récompenses créées
          </p>

          <p className="mt-1 text-3xl font-black text-zinc-950">
            {
              data.metrics
                .totalRewards
            }
          </p>
        </article>

        <article className="rounded-[1.5rem] border border-zinc-200 bg-white p-5 shadow-sm">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <Sparkles className="size-5" />
          </span>

          <p className="mt-4 text-sm font-bold text-zinc-500">
            Récompenses actives
          </p>

          <p className="mt-1 text-3xl font-black text-zinc-950">
            {
              data.metrics
                .activeRewards
            }
          </p>
        </article>

        <article className="rounded-[1.5rem] border border-zinc-200 bg-white p-5 shadow-sm">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Star className="size-5" />
          </span>

          <p className="mt-4 text-sm font-bold text-zinc-500">
            Récompenses attribuées
          </p>

          <p className="mt-1 text-3xl font-black text-zinc-950">
            {
              data.metrics
                .assignedRewards
            }
          </p>
        </article>

        <article className="rounded-[1.5rem] border border-zinc-200 bg-white p-5 shadow-sm">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <Boxes className="size-5" />
          </span>

          <p className="mt-4 text-sm font-bold text-zinc-500">
            Stock épuisé
          </p>

          <p className="mt-1 text-3xl font-black text-zinc-950">
            {
              data.metrics
                .outOfStockRewards
            }
          </p>
        </article>
      </section>

      <section className="rounded-[1.75rem] border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-600">
              Catalogue VIP
            </p>

            <h2 className="mt-1 text-2xl font-black text-zinc-950">
              Récompenses fidélité
            </h2>

            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Créez des réductions, cadeaux, points, XP et prestations offertes.
            </p>
          </div>

          <button
            type="button"
            onClick={
              openCreation
            }
            disabled={isPending}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 text-sm font-black text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 disabled:opacity-50"
          >
            <Plus className="size-4" />

            Nouvelle récompense
          </button>
        </header>

        <div className="mt-6 grid gap-3 lg:grid-cols-[minmax(260px,1fr)_230px_260px]">
          <label className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Rechercher une récompense..."
              className="h-11 w-full rounded-xl border border-zinc-200 pl-10 pr-3 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            />
          </label>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target
                  .value as RewardStatusFilter,
              )
            }
            className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
          >
            <option value="ALL">
              Tous les statuts
            </option>

            {Object.entries(
              STATUS_LABELS,
            ).map(
              ([
                value,
                label,
              ]) => (
                <option
                  key={value}
                  value={value}
                >
                  {label}
                </option>
              ),
            )}
          </select>

          <select
            value={typeFilter}
            onChange={(event) =>
              setTypeFilter(
                event.target
                  .value as RewardTypeFilter,
              )
            }
            className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
          >
            <option value="ALL">
              Tous les types
            </option>

            {Object.entries(
              TYPE_LABELS,
            ).map(
              ([
                value,
                label,
              ]) => (
                <option
                  key={value}
                  value={value}
                >
                  {label}
                </option>
              ),
            )}
          </select>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredRewards.map(
            (
              reward,
            ) => (
              <article
                key={reward.id}
                className="relative overflow-hidden rounded-[1.5rem] border border-zinc-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md"
              >
                <div
                  className="absolute inset-x-0 top-0 h-1.5"
                  style={{
                    backgroundColor:
                      reward.color ??
                      "#7c3aed",
                  }}
                />

                <div className="flex items-start justify-between gap-3">
                  <span
                    className="flex size-12 items-center justify-center rounded-2xl text-white shadow-sm"
                    style={{
                      backgroundColor:
                        reward.color ??
                        "#7c3aed",
                    }}
                  >
                    <Gift className="size-6" />
                  </span>

                  <div className="flex flex-wrap justify-end gap-2">
                    {reward.featured ? (
                      <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-black text-violet-700">
                        Mise en avant
                      </span>
                    ) : null}

                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-black ${STATUS_CLASSES[reward.status]}`}
                    >
                      {
                        STATUS_LABELS[
                          reward.status
                        ]
                      }
                    </span>
                  </div>
                </div>

                <p className="mt-4 text-xs font-black uppercase tracking-[0.15em] text-violet-600">
                  {
                    TYPE_LABELS[
                      reward.type
                    ]
                  }
                </p>

                <h3 className="mt-1 text-xl font-black text-zinc-950">
                  {reward.name}
                </h3>

                <p className="mt-2 min-h-10 text-sm leading-5 text-zinc-500">
                  {reward.shortDescription ??
                    reward.description ??
                    "Aucune description."}
                </p>

                <div className="mt-4 rounded-2xl bg-violet-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-violet-600">
                    Valeur
                  </p>

                  <p className="mt-1 text-lg font-black text-violet-950">
                    {getRewardValue(
                      reward,
                    )}
                  </p>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-xl bg-zinc-50 p-3">
                    <p className="text-zinc-500">
                      Niveau minimum
                    </p>

                    <p className="mt-1 truncate font-black text-zinc-950">
                      {reward.minimumLevel
                        ?.name ??
                        "Tous les niveaux"}
                    </p>
                  </div>

                  <div className="rounded-xl bg-zinc-50 p-3">
                    <p className="text-zinc-500">
                      Disponibilité
                    </p>

                    <p className="mt-1 font-black text-zinc-950">
                      {reward.unlimitedStock
                        ? "Illimitée"
                        : `${reward.remainingStock ?? 0} / ${reward.stock ?? 0}`}
                    </p>
                  </div>

                  <div className="rounded-xl bg-zinc-50 p-3">
                    <p className="text-zinc-500">
                      Début
                    </p>

                    <p className="mt-1 font-black text-zinc-950">
                      {formatDate(
                        reward.startsAt,
                      )}
                    </p>
                  </div>

                  <div className="rounded-xl bg-zinc-50 p-3">
                    <p className="text-zinc-500">
                      Attributions
                    </p>

                    <p className="mt-1 font-black text-zinc-950">
                      {
                        reward.clientRewardCount
                      }
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex gap-2 border-t border-zinc-100 pt-4">
                  <button
                    type="button"
                    onClick={() =>
                      openEdition(
                        reward,
                      )
                    }
                    disabled={isPending}
                    className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-zinc-950 px-3 text-sm font-black text-white transition hover:bg-violet-700 disabled:opacity-50"
                  >
                    <Pencil className="size-4" />

                    Modifier
                  </button>

                  {reward.status !==
                  "ARCHIVED" ? (
                    <button
                      type="button"
                      onClick={() =>
                        archiveReward(
                          reward,
                        )
                      }
                      disabled={isPending}
                      title="Archiver"
                      className="inline-flex size-10 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 text-amber-700"
                    >
                      <Archive className="size-4" />
                    </button>
                  ) : null}

                  <button
                    type="button"
                    onClick={() =>
                      deleteReward(
                        reward,
                      )
                    }
                    disabled={isPending}
                    title="Supprimer"
                    className="inline-flex size-10 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-700"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </article>
            ),
          )}
        </div>

        {filteredRewards.length ===
        0 ? (
          <div className="mt-6 flex min-h-64 flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center">
            <Gift className="size-10 text-zinc-300" />

            <h3 className="mt-4 text-lg font-black text-zinc-800">
              Aucune récompense trouvée
            </h3>

            <p className="mt-2 text-sm text-zinc-500">
              Modifiez les filtres ou créez une nouvelle récompense.
            </p>
          </div>
        ) : null}
      </section>

      {editorOpen ? (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-zinc-950/60 p-3 backdrop-blur-sm sm:p-6">
          <div className="mx-auto my-4 max-w-6xl rounded-[2rem] bg-zinc-50 shadow-2xl">
            <header className="sticky top-0 z-20 flex items-center justify-between gap-4 rounded-t-[2rem] border-b border-zinc-200 bg-white/95 px-5 py-4 backdrop-blur sm:px-7">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-600">
                  Club VIP
                </p>

                <h2 className="mt-1 text-xl font-black text-zinc-950">
                  {form.id
                    ? "Modifier la récompense"
                    : "Créer une récompense"}
                </h2>
              </div>

              <button
                type="button"
                onClick={
                  closeEditor
                }
                disabled={isPending}
                className="flex size-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600"
              >
                <X className="size-5" />
              </button>
            </header>

            <div className="space-y-5 p-4 sm:p-6">
              <FormSection
                title="Identité"
                description="Nom, type et présentation publique de la récompense."
                icon={
                  <Gift className="size-5" />
                }
              >
                <div className="grid gap-5 md:grid-cols-2">
                  <TextField
                    label="Nom"
                    name="name"
                    value={form.name}
                    onChange={
                      updateName
                    }
                    errors={errors}
                  />

                  <TextField
                    label="Slug"
                    name="slug"
                    value={form.slug}
                    onChange={(value) => {
                      setSlugEdited(
                        true,
                      );

                      updateField(
                        "slug",
                        slugify(
                          value,
                        ),
                      );
                    }}
                    errors={errors}
                  />

                  <label className="block">
                    <span className="text-sm font-black text-zinc-800">
                      Type de récompense
                    </span>

                    <select
                      value={form.type}
                      onChange={(event) =>
                        updateField(
                          "type",
                          event.target
                            .value as AdminVipRewardFormInput["type"],
                        )
                      }
                      className="mt-2 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3.5 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                    >
                      {Object.entries(
                        TYPE_LABELS,
                      ).map(
                        ([
                          value,
                          label,
                        ]) => (
                          <option
                            key={value}
                            value={value}
                          >
                            {label}
                          </option>
                        ),
                      )}
                    </select>

                    <FieldError
                      name="type"
                      errors={errors}
                    />
                  </label>

                  <label className="block">
                    <span className="text-sm font-black text-zinc-800">
                      Couleur
                    </span>

                    <div className="mt-2 flex h-11 items-center gap-3 rounded-xl border border-zinc-200 bg-white px-3">
                      <input
                        type="color"
                        value={
                          form.color ||
                          "#7c3aed"
                        }
                        onChange={(event) =>
                          updateField(
                            "color",
                            event.target
                              .value,
                          )
                        }
                        className="size-7 cursor-pointer rounded border-0 bg-transparent p-0"
                      />

                      <input
                        type="text"
                        value={form.color}
                        onChange={(event) =>
                          updateField(
                            "color",
                            event.target
                              .value,
                          )
                        }
                        className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                      />
                    </div>

                    <FieldError
                      name="color"
                      errors={errors}
                    />
                  </label>

                  <div className="md:col-span-2">
                    <TextField
                      label="Description courte"
                      name="shortDescription"
                      value={
                        form.shortDescription
                      }
                      onChange={(value) =>
                        updateField(
                          "shortDescription",
                          value,
                        )
                      }
                      errors={errors}
                    />
                  </div>

                  <label className="block md:col-span-2">
                    <span className="text-sm font-black text-zinc-800">
                      Description complète
                    </span>

                    <textarea
                      rows={5}
                      value={
                        form.description
                      }
                      onChange={(event) =>
                        updateField(
                          "description",
                          event.target
                            .value,
                        )
                      }
                      className="mt-2 w-full resize-y rounded-xl border border-zinc-200 bg-white px-3.5 py-3 text-sm leading-6 outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                    />

                    <FieldError
                      name="description"
                      errors={errors}
                    />
                  </label>

                  <TextField
                    label="Icône"
                    name="icon"
                    value={form.icon}
                    onChange={(value) =>
                      updateField(
                        "icon",
                        value,
                      )
                    }
                    errors={errors}
                  />

                  <TextField
                    label="URL de l’image"
                    name="imageUrl"
                    type="url"
                    value={form.imageUrl}
                    onChange={(value) =>
                      updateField(
                        "imageUrl",
                        value,
                      )
                    }
                    errors={errors}
                    placeholder="https://..."
                  />

                  <div className="md:col-span-2">
                    <TextField
                      label="URL de la bannière"
                      name="bannerUrl"
                      type="url"
                      value={form.bannerUrl}
                      onChange={(value) =>
                        updateField(
                          "bannerUrl",
                          value,
                        )
                      }
                      errors={errors}
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </FormSection>

              <FormSection
                title="Valeur de la récompense"
                description="Configurez le contenu réellement accordé à la cliente."
                icon={
                  <BadgePercent className="size-5" />
                }
              >
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {(
                    selectedType ===
                      "FIXED_DISCOUNT" ||
                    selectedType ===
                      "GIFT_CARD"
                  ) ? (
                    <MoneyField
                      label="Montant"
                      name="fixedAmountCents"
                      value={
                        form.fixedAmountCents
                      }
                      onChange={(value) =>
                        updateField(
                          "fixedAmountCents",
                          value,
                        )
                      }
                      errors={errors}
                    />
                  ) : null}

                  {selectedType ===
                  "PERCENTAGE_DISCOUNT" ? (
                    <NumberField
                      label="Pourcentage"
                      name="percentage"
                      value={
                        form.percentage
                      }
                      onChange={(value) =>
                        updateField(
                          "percentage",
                          value,
                        )
                      }
                      errors={errors}
                      minimum={1}
                      maximum={100}
                      suffix="%"
                    />
                  ) : null}

                  {selectedType ===
                  "LOYALTY_POINTS" ? (
                    <NumberField
                      label="Points offerts"
                      name="loyaltyPoints"
                      value={
                        form.loyaltyPoints
                      }
                      onChange={(value) =>
                        updateField(
                          "loyaltyPoints",
                          value,
                        )
                      }
                      errors={errors}
                      minimum={1}
                    />
                  ) : null}

                  {(
                    selectedType ===
                      "EXPERIENCE_POINTS" ||
                    selectedType ===
                      "SEASON_PASS_XP"
                  ) ? (
                    <NumberField
                      label="XP offerts"
                      name="experiencePoints"
                      value={
                        form.experiencePoints
                      }
                      onChange={(value) =>
                        updateField(
                          "experiencePoints",
                          value,
                        )
                      }
                      errors={errors}
                      minimum={1}
                    />
                  ) : null}

                  {selectedType ===
                  "FREE_SERVICE" ? (
                    <label className="block lg:col-span-2">
                      <span className="text-sm font-black text-zinc-800">
                        Prestation offerte
                      </span>

                      <select
                        value={
                          form.freeServiceId ??
                          ""
                        }
                        onChange={(event) =>
                          updateField(
                            "freeServiceId",
                            event.target
                              .value ||
                              null,
                          )
                        }
                        className="mt-2 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3.5 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                      >
                        <option value="">
                          Sélectionner une prestation
                        </option>

                        {data.services.map(
                          (
                            service,
                          ) => (
                            <option
                              key={
                                service.id
                              }
                              value={
                                service.id
                              }
                            >
                              {service.name} —{" "}
                              {formatCurrency(
                                service.priceCents,
                              )}
                            </option>
                          ),
                        )}
                      </select>

                      <FieldError
                        name="freeServiceId"
                        errors={errors}
                      />
                    </label>
                  ) : null}

                  <NumberField
                    label="Quantité"
                    name="quantity"
                    value={form.quantity}
                    onChange={(value) =>
                      updateField(
                        "quantity",
                        value,
                      )
                    }
                    errors={errors}
                    minimum={1}
                  />
                </div>
              </FormSection>

              <FormSection
                title="Conditions d’accès"
                description="Définissez le niveau et les seuils nécessaires."
                icon={
                  <Crown className="size-5" />
                }
              >
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  <label className="block">
                    <span className="text-sm font-black text-zinc-800">
                      Niveau VIP minimum
                    </span>

                    <select
                      value={
                        form.minimumLevelId ??
                        ""
                      }
                      onChange={(event) =>
                        updateField(
                          "minimumLevelId",
                          event.target
                            .value ||
                            null,
                        )
                      }
                      className="mt-2 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3.5 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                    >
                      <option value="">
                        Tous les niveaux
                      </option>

                      {data.levels.map(
                        (
                          level,
                        ) => (
                          <option
                            key={level.id}
                            value={level.id}
                          >
                            Niveau{" "}
                            {level.level} —{" "}
                            {level.name}
                          </option>
                        ),
                      )}
                    </select>

                    <FieldError
                      name="minimumLevelId"
                      errors={errors}
                    />
                  </label>

                  <NumberField
                    label="Points minimum"
                    name="minimumPoints"
                    value={
                      form.minimumPoints
                    }
                    onChange={(value) =>
                      updateField(
                        "minimumPoints",
                        value,
                      )
                    }
                    errors={errors}
                  />

                  <NumberField
                    label="XP minimum"
                    name="minimumXp"
                    value={
                      form.minimumXp
                    }
                    onChange={(value) =>
                      updateField(
                        "minimumXp",
                        value,
                      )
                    }
                    errors={errors}
                  />

                  <TextField
                    label="Code de récompense"
                    name="rewardCode"
                    value={
                      form.rewardCode
                    }
                    onChange={(value) =>
                      updateField(
                        "rewardCode",
                        value,
                      )
                    }
                    errors={errors}
                    placeholder="CADEAU-VIP"
                  />

                  <TextField
                    label="Préfixe de coupon"
                    name="couponCodePrefix"
                    value={
                      form.couponCodePrefix
                    }
                    onChange={(value) =>
                      updateField(
                        "couponCodePrefix",
                        value,
                      )
                    }
                    errors={errors}
                    placeholder="VIP"
                  />

                  <NumberField
                    label="Validité après attribution"
                    name="validForDays"
                    value={
                      form.validForDays
                    }
                    onChange={(value) =>
                      updateField(
                        "validForDays",
                        value,
                      )
                    }
                    errors={errors}
                    minimum={1}
                    suffix="jours"
                  />
                </div>
              </FormSection>

              <FormSection
                title="Dates et disponibilité"
                description="Période de publication et quantité disponible."
                icon={
                  <CalendarDays className="size-5" />
                }
              >
                <div className="grid gap-5 md:grid-cols-2">
                  <TextField
                    label="Date de début"
                    name="startsAt"
                    type="datetime-local"
                    value={
                      form.startsAt
                    }
                    onChange={(value) =>
                      updateField(
                        "startsAt",
                        value,
                      )
                    }
                    errors={errors}
                  />

                  <TextField
                    label="Date de fin"
                    name="endsAt"
                    type="datetime-local"
                    value={form.endsAt}
                    onChange={(value) =>
                      updateField(
                        "endsAt",
                        value,
                      )
                    }
                    errors={errors}
                  />

                  <div className="md:col-span-2">
                    <ToggleField
                      label="Disponibilité illimitée"
                      description="Aucun stock ne sera décompté lors des attributions."
                      checked={
                        form.unlimitedStock
                      }
                      onChange={(value) => {
                        updateField(
                          "unlimitedStock",
                          value,
                        );

                        if (
                          value
                        ) {
                          updateField(
                            "stock",
                            null,
                          );

                          updateField(
                            "remainingStock",
                            null,
                          );
                        }
                      }}
                    />
                  </div>

                  <NumberField
                    label="Stock initial"
                    name="stock"
                    value={form.stock}
                    onChange={(value) => {
                      updateField(
                        "stock",
                        value,
                      );

                      if (
                        !form.id
                      ) {
                        updateField(
                          "remainingStock",
                          value,
                        );
                      }
                    }}
                    errors={errors}
                    minimum={1}
                    disabled={
                      form.unlimitedStock
                    }
                  />

                  <NumberField
                    label="Stock restant"
                    name="remainingStock"
                    value={
                      form.remainingStock
                    }
                    onChange={(value) =>
                      updateField(
                        "remainingStock",
                        value,
                      )
                    }
                    errors={errors}
                    disabled={
                      form.unlimitedStock
                    }
                  />
                </div>
              </FormSection>

              <FormSection
                title="Publication"
                description="État, visibilité et comportement de la récompense."
                icon={
                  <Sparkles className="size-5" />
                }
              >
                <div className="grid gap-5 md:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-black text-zinc-800">
                      Statut
                    </span>

                    <select
                      value={
                        form.status
                      }
                      onChange={(event) =>
                        updateField(
                          "status",
                          event.target
                            .value as AdminVipRewardFormInput["status"],
                        )
                      }
                      className="mt-2 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3.5 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                    >
                      {Object.entries(
                        STATUS_LABELS,
                      ).map(
                        ([
                          value,
                          label,
                        ]) => (
                          <option
                            key={value}
                            value={value}
                          >
                            {label}
                          </option>
                        ),
                      )}
                    </select>
                  </label>

                  <NumberField
                    label="Ordre d’affichage"
                    name="sortOrder"
                    value={
                      form.sortOrder
                    }
                    onChange={(value) =>
                      updateField(
                        "sortOrder",
                        value ??
                          0,
                      )
                    }
                    errors={errors}
                    nullable={false}
                  />

                  <ToggleField
                    label="Visible par les clientes"
                    description="Afficher la récompense dans les espaces publics du Club VIP."
                    checked={
                      form.visible
                    }
                    onChange={(value) =>
                      updateField(
                        "visible",
                        value,
                      )
                    }
                  />

                  <ToggleField
                    label="Mettre en avant"
                    description="Présenter cette récompense comme une offre recommandée."
                    checked={
                      form.featured
                    }
                    onChange={(value) =>
                      updateField(
                        "featured",
                        value,
                      )
                    }
                  />

                  <ToggleField
                    label="Récompense répétable"
                    description="Une même cliente peut obtenir cette récompense plusieurs fois."
                    checked={
                      form.repeatable
                    }
                    onChange={(value) =>
                      updateField(
                        "repeatable",
                        value,
                      )
                    }
                  />
                </div>
              </FormSection>
            </div>

            <footer className="sticky bottom-0 z-20 flex flex-col-reverse gap-3 rounded-b-[2rem] border-t border-zinc-200 bg-white/95 p-4 backdrop-blur sm:flex-row sm:justify-end sm:px-7">
              <button
                type="button"
                onClick={
                  closeEditor
                }
                disabled={isPending}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-zinc-200 px-5 text-sm font-black text-zinc-700 disabled:opacity-50"
              >
                <X className="size-4" />

                Annuler
              </button>

              <button
                type="button"
                onClick={
                  saveReward
                }
                disabled={isPending}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 text-sm font-black text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 disabled:opacity-50"
              >
                {isPending ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}

                {isPending
                  ? "Enregistrement..."
                  : form.id
                    ? "Enregistrer les modifications"
                    : "Créer la récompense"}
              </button>
            </footer>
          </div>
        </div>
      ) : null}
    </div>
  );
}
