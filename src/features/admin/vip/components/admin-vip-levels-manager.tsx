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
  Crown,
  LoaderCircle,
  Pencil,
  Plus,
  Save,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  UsersRound,
  X,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  toast,
} from "sonner";

import {
  createAdminVipLevelAction,
  deleteAdminVipLevelAction,
  updateAdminVipLevelAction,
} from "@/features/admin/vip/actions/admin-vip-levels.actions";

import type {
  AdminVipLevelFormInput,
} from "@/features/admin/vip/schemas/admin-vip-level.schemas";

import type {
  AdminVipLevel,
} from "@/features/admin/vip/types/admin-vip.types";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type AdminVipLevelsManagerProps = {
  levels: AdminVipLevel[];
};

type FieldErrors =
  Record<
    string,
    string[]
  >;

/* -------------------------------------------------------------------------- */
/*                                CONSTANTES                                  */
/* -------------------------------------------------------------------------- */

const STATUS_LABELS: Record<
  AdminVipLevelFormInput["status"],
  string
> = {
  DRAFT:
    "Brouillon",

  ACTIVE:
    "Actif",

  ARCHIVED:
    "Archivé",
};

const STATUS_CLASSES: Record<
  AdminVipLevelFormInput["status"],
  string
> = {
  DRAFT:
    "bg-zinc-100 text-zinc-700",

  ACTIVE:
    "bg-emerald-50 text-emerald-700",

  ARCHIVED:
    "bg-amber-50 text-amber-700",
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

function createEmptyForm(
  levels: AdminVipLevel[],
): AdminVipLevelFormInput {
  const highestLevel =
    levels.reduce(
      (
        highest,
        level,
      ) =>
        Math.max(
          highest,
          level.level,
        ),
      0,
    );

  const highestSortOrder =
    levels.reduce(
      (
        highest,
        level,
      ) =>
        Math.max(
          highest,
          level.sortOrder,
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

    color:
      "#7c3aed",

    icon:
      "Crown",

    imageUrl:
      "",

    bannerUrl:
      "",

    level:
      highestLevel +
      1,

    requiredXp:
      highestLevel ===
      0
        ? 0
        : highestLevel *
          1000,

    requiredPoints:
      highestLevel ===
      0
        ? 0
        : highestLevel *
          500,

    xpMultiplier:
      1,

    pointsMultiplier:
      1,

    referralMultiplier:
      1,

    priorityBooking:
      false,

    vipSupport:
      false,

    exclusiveContests:
      false,

    exclusiveRewards:
      false,

    exclusiveEvents:
      false,

    freeGift:
      false,

    birthdayGift:
      false,

    permanentDiscountPercent:
      null,

    status:
      "DRAFT",

    visible:
      true,

    isDefault:
      levels.length ===
      0,

    sortOrder:
      highestSortOrder +
      1,
  };
}

function levelToForm(
  level: AdminVipLevel,
): AdminVipLevelFormInput {
  return {
    id:
      level.id,

    name:
      level.name,

    slug:
      level.slug,

    description:
      level.description ??
      "",

    shortDescription:
      level.shortDescription ??
      "",

    color:
      level.color ??
      "#7c3aed",

    icon:
      level.icon ??
      "Crown",

    imageUrl:
      level.imageUrl ??
      "",

    bannerUrl:
      level.bannerUrl ??
      "",

    level:
      level.level,

    requiredXp:
      level.requiredXp,

    requiredPoints:
      level.requiredPoints,

    xpMultiplier:
      level.xpMultiplier,

    pointsMultiplier:
      level.pointsMultiplier,

    referralMultiplier:
      level.referralMultiplier,

    priorityBooking:
      level.priorityBooking,

    vipSupport:
      level.vipSupport,

    exclusiveContests:
      level.exclusiveContests,

    exclusiveRewards:
      level.exclusiveRewards,

    exclusiveEvents:
      level.exclusiveEvents,

    freeGift:
      level.freeGift,

    birthdayGift:
      level.birthdayGift,

    permanentDiscountPercent:
      level.permanentDiscountPercent,

    status:
      level.status,

    visible:
      level.visible,

    isDefault:
      level.isDefault,

    sortOrder:
      level.sortOrder,
  };
}

function formatMultiplier(
  value: number,
): string {
  return `${value.toLocaleString(
    "fr-FR",
    {
      maximumFractionDigits:
        2,
    },
  )}×`;
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
  icon,
  title,
  description,
  children,
}: {
  icon: ReactNode;
  title: string;
  description: string;
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
  type?: "text" | "url";
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
        className={`mt-2 h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-zinc-950 outline-none transition focus:ring-4 ${
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
  step = 1,
  nullable = false,
  suffix,
}: {
  label: string;
  name: string;
  value: number | null;
  onChange: (value: number | null) => void;
  errors: FieldErrors;
  minimum?: number;
  step?: number;
  nullable?: boolean;
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
          min={minimum}
          step={step}
          value={
            value ??
            ""
          }
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

            const parsedValue =
              Number(
                rawValue,
              );

            onChange(
              Number.isFinite(
                parsedValue,
              )
                ? parsedValue
                : nullable
                  ? null
                  : minimum,
            );
          }}
          className={`h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-zinc-950 outline-none transition focus:ring-4 ${
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

export function AdminVipLevelsManager({
  levels,
}: AdminVipLevelsManagerProps) {
  const router =
    useRouter();

  const [
    isPending,
    startTransition,
  ] =
    useTransition();

  const [
    editing,
    setEditing,
  ] =
    useState(false);

  const [
    slugEdited,
    setSlugEdited,
  ] =
    useState(false);

  const [
    form,
    setForm,
  ] =
    useState<AdminVipLevelFormInput>(
      () =>
        createEmptyForm(
          levels,
        ),
    );

  const [
    errors,
    setErrors,
  ] =
    useState<FieldErrors>({});

  const orderedLevels =
    useMemo(
      () =>
        [...levels].sort(
          (
            first,
            second,
          ) =>
            first.sortOrder -
              second.sortOrder ||
            first.level -
              second.level,
        ),
      [
        levels,
      ],
    );

  const totalMembers =
    useMemo(
      () =>
        levels.reduce(
          (
            total,
            level,
          ) =>
            total +
            level.memberCount,
          0,
        ),
      [
        levels,
      ],
    );

  const activeLevels =
    levels.filter(
      (
        level,
      ) =>
        level.status ===
        "ACTIVE",
    ).length;

  function updateField<
    Key extends keyof AdminVipLevelFormInput,
  >(
    key: Key,
    value: AdminVipLevelFormInput[Key],
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

  function openCreation():
    void {
    setForm(
      createEmptyForm(
        levels,
      ),
    );

    setErrors({});
    setSlugEdited(
      false,
    );
    setEditing(
      true,
    );
  }

  function openEdition(
    level: AdminVipLevel,
  ): void {
    setForm(
      levelToForm(
        level,
      ),
    );

    setErrors({});
    setSlugEdited(
      true,
    );
    setEditing(
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

    setEditing(
      false,
    );

    setErrors({});
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

  function saveLevel():
    void {
    setErrors({});

    startTransition(() => {
      void (async () => {
        const result =
          form.id
            ? await updateAdminVipLevelAction(
                form,
              )
            : await createAdminVipLevelAction(
                form,
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

        setEditing(
          false,
        );

        router.refresh();
      })();
    });
  }

  function archiveLevel(
    level: AdminVipLevel,
  ): void {
    if (
      !window.confirm(
        `Archiver le niveau « ${level.name} » ?`,
      )
    ) {
      return;
    }

    startTransition(() => {
      void (async () => {
        const result =
          await updateAdminVipLevelAction({
            ...levelToForm(
              level,
            ),

            status:
              "ARCHIVED",

            visible:
              false,

            isDefault:
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
          "Le niveau VIP a été archivé.",
        );

        router.refresh();
      })();
    });
  }

  function deleteLevel(
    level: AdminVipLevel,
  ): void {
    const reason =
      window.prompt(
        `Indiquez le motif de suppression du niveau « ${level.name} » :`,
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
          await deleteAdminVipLevelAction({
            levelId:
              level.id,

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

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-[1.5rem] border border-zinc-200 bg-white p-5 shadow-sm">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
            <Crown className="size-5" />
          </span>

          <p className="mt-4 text-sm font-bold text-zinc-500">
            Niveaux créés
          </p>

          <p className="mt-1 text-3xl font-black text-zinc-950">
            {levels.length}
          </p>
        </article>

        <article className="rounded-[1.5rem] border border-zinc-200 bg-white p-5 shadow-sm">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <ShieldCheck className="size-5" />
          </span>

          <p className="mt-4 text-sm font-bold text-zinc-500">
            Niveaux actifs
          </p>

          <p className="mt-1 text-3xl font-black text-zinc-950">
            {activeLevels}
          </p>
        </article>

        <article className="rounded-[1.5rem] border border-zinc-200 bg-white p-5 shadow-sm">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <UsersRound className="size-5" />
          </span>

          <p className="mt-4 text-sm font-bold text-zinc-500">
            Membres classés
          </p>

          <p className="mt-1 text-3xl font-black text-zinc-950">
            {totalMembers}
          </p>
        </article>

        <article className="rounded-[1.5rem] border border-zinc-200 bg-white p-5 shadow-sm">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
            <Star className="size-5" />
          </span>

          <p className="mt-4 text-sm font-bold text-zinc-500">
            Niveau par défaut
          </p>

          <p className="mt-2 truncate text-lg font-black text-zinc-950">
            {levels.find(
              (
                level,
              ) =>
                level.isDefault,
            )?.name ??
              "Non défini"}
          </p>
        </article>
      </section>

      <section className="rounded-[1.75rem] border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-600">
              Progression VIP
            </p>

            <h2 className="mt-1 text-2xl font-black text-zinc-950">
              Niveaux du Club
            </h2>

            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Configurez les seuils, multiplicateurs et avantages accordés à chaque niveau.
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

            Nouveau niveau
          </button>
        </header>

        <div className="mt-6 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {orderedLevels.map(
            (
              level,
            ) => (
              <article
                key={
                  level.id
                }
                className="relative overflow-hidden rounded-[1.5rem] border border-zinc-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md"
              >
                <div
                  className="absolute inset-x-0 top-0 h-1.5"
                  style={{
                    backgroundColor:
                      level.color ??
                      "#7c3aed",
                  }}
                />

                <div className="flex items-start justify-between gap-3">
                  <span
                    className="flex size-12 items-center justify-center rounded-2xl text-white shadow-sm"
                    style={{
                      backgroundColor:
                        level.color ??
                        "#7c3aed",
                    }}
                  >
                    <Crown className="size-6" />
                  </span>

                  <div className="flex flex-wrap justify-end gap-2">
                    {level.isDefault ? (
                      <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-black text-violet-700">
                        Par défaut
                      </span>
                    ) : null}

                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-black ${STATUS_CLASSES[level.status]}`}
                    >
                      {
                        STATUS_LABELS[
                          level.status
                        ]
                      }
                    </span>
                  </div>
                </div>

                <p className="mt-4 text-xs font-black uppercase tracking-[0.16em] text-zinc-400">
                  Niveau{" "}
                  {level.level}
                </p>

                <h3 className="mt-1 text-xl font-black text-zinc-950">
                  {level.name}
                </h3>

                <p className="mt-2 min-h-10 text-sm leading-5 text-zinc-500">
                  {level.shortDescription ??
                    level.description ??
                    "Aucune description."}
                </p>

                <div className="mt-5 grid grid-cols-3 gap-2">
                  <div className="rounded-xl bg-zinc-50 p-3 text-center">
                    <p className="text-[10px] font-bold uppercase text-zinc-400">
                      XP requis
                    </p>

                    <p className="mt-1 font-black text-zinc-950">
                      {level.requiredXp}
                    </p>
                  </div>

                  <div className="rounded-xl bg-zinc-50 p-3 text-center">
                    <p className="text-[10px] font-bold uppercase text-zinc-400">
                      Points
                    </p>

                    <p className="mt-1 font-black text-zinc-950">
                      {
                        level.requiredPoints
                      }
                    </p>
                  </div>

                  <div className="rounded-xl bg-zinc-50 p-3 text-center">
                    <p className="text-[10px] font-bold uppercase text-zinc-400">
                      Membres
                    </p>

                    <p className="mt-1 font-black text-zinc-950">
                      {
                        level.memberCount
                      }
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-lg bg-violet-50 px-2.5 py-1.5 font-bold text-violet-700">
                    XP{" "}
                    {formatMultiplier(
                      level.xpMultiplier,
                    )}
                  </span>

                  <span className="rounded-lg bg-blue-50 px-2.5 py-1.5 font-bold text-blue-700">
                    Points{" "}
                    {formatMultiplier(
                      level.pointsMultiplier,
                    )}
                  </span>

                  {level.permanentDiscountPercent ? (
                    <span className="rounded-lg bg-emerald-50 px-2.5 py-1.5 font-bold text-emerald-700">
                      -
                      {
                        level.permanentDiscountPercent
                      }
                      %
                    </span>
                  ) : null}
                </div>

                <div className="mt-5 flex gap-2 border-t border-zinc-100 pt-4">
                  <button
                    type="button"
                    onClick={() =>
                      openEdition(
                        level,
                      )
                    }
                    disabled={isPending}
                    className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-zinc-950 px-3 text-sm font-black text-white transition hover:bg-violet-700 disabled:opacity-50"
                  >
                    <Pencil className="size-4" />

                    Modifier
                  </button>

                  {level.status !==
                  "ARCHIVED" ? (
                    <button
                      type="button"
                      onClick={() =>
                        archiveLevel(
                          level,
                        )
                      }
                      disabled={isPending}
                      title="Archiver"
                      className="inline-flex size-10 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 text-amber-700 transition hover:bg-amber-100 disabled:opacity-50"
                    >
                      <Archive className="size-4" />
                    </button>
                  ) : null}

                  <button
                    type="button"
                    onClick={() =>
                      deleteLevel(
                        level,
                      )
                    }
                    disabled={isPending}
                    title="Supprimer"
                    className="inline-flex size-10 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </article>
            ),
          )}
        </div>

        {levels.length ===
        0 ? (
          <div className="mt-6 flex min-h-64 flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center">
            <Sparkles className="size-10 text-zinc-300" />

            <h3 className="mt-4 text-lg font-black text-zinc-800">
              Aucun niveau VIP
            </h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-zinc-500">
              Créez le premier niveau pour commencer à organiser la progression des membres.
            </p>

            <button
              type="button"
              onClick={
                openCreation
              }
              className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-violet-600 px-5 text-sm font-black text-white"
            >
              <Plus className="size-4" />

              Créer le premier niveau
            </button>
          </div>
        ) : null}
      </section>

      {editing ? (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-zinc-950/60 p-3 backdrop-blur-sm sm:p-6">
          <div className="mx-auto my-4 max-w-5xl rounded-[2rem] bg-zinc-50 shadow-2xl">
            <header className="sticky top-0 z-20 flex items-center justify-between gap-4 rounded-t-[2rem] border-b border-zinc-200 bg-white/95 px-5 py-4 backdrop-blur sm:px-7">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-600">
                  Club VIP
                </p>

                <h2 className="mt-1 text-xl font-black text-zinc-950">
                  {form.id
                    ? "Modifier le niveau"
                    : "Créer un niveau"}
                </h2>
              </div>

              <button
                type="button"
                onClick={
                  closeEditor
                }
                disabled={isPending}
                className="flex size-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 transition hover:bg-zinc-200"
              >
                <X className="size-5" />
              </button>
            </header>

            <div className="space-y-5 p-4 sm:p-6">
              <FormSection
                icon={
                  <Crown className="size-5" />
                }
                title="Identité du niveau"
                description="Nom, apparence et contenu présenté aux membres."
              >
                <div className="grid gap-5 md:grid-cols-2">
                  <TextField
                    label="Nom du niveau"
                    name="name"
                    value={
                      form.name
                    }
                    onChange={
                      updateName
                    }
                    errors={
                      errors
                    }
                  />

                  <TextField
                    label="Slug"
                    name="slug"
                    value={
                      form.slug
                    }
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
                    errors={
                      errors
                    }
                    placeholder="vip-or"
                  />

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
                        value={
                          form.color
                        }
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
                      errors={
                        errors
                      }
                    />
                  </label>

                  <TextField
                    label="Icône"
                    name="icon"
                    value={
                      form.icon
                    }
                    onChange={(value) =>
                      updateField(
                        "icon",
                        value,
                      )
                    }
                    errors={
                      errors
                    }
                    placeholder="Crown"
                  />

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
                      errors={
                        errors
                      }
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
                      errors={
                        errors
                      }
                    />
                  </label>

                  <TextField
                    label="URL de l’image"
                    name="imageUrl"
                    type="url"
                    value={
                      form.imageUrl
                    }
                    onChange={(value) =>
                      updateField(
                        "imageUrl",
                        value,
                      )
                    }
                    errors={
                      errors
                    }
                    placeholder="https://..."
                  />

                  <TextField
                    label="URL de la bannière"
                    name="bannerUrl"
                    type="url"
                    value={
                      form.bannerUrl
                    }
                    onChange={(value) =>
                      updateField(
                        "bannerUrl",
                        value,
                      )
                    }
                    errors={
                      errors
                    }
                    placeholder="https://..."
                  />
                </div>
              </FormSection>

              <FormSection
                icon={
                  <Star className="size-5" />
                }
                title="Progression"
                description="Seuils nécessaires pour atteindre ce niveau."
              >
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  <NumberField
                    label="Numéro du niveau"
                    name="level"
                    value={
                      form.level
                    }
                    onChange={(value) =>
                      updateField(
                        "level",
                        value ??
                          1,
                      )
                    }
                    errors={
                      errors
                    }
                    minimum={1}
                  />

                  <NumberField
                    label="XP requis"
                    name="requiredXp"
                    value={
                      form.requiredXp
                    }
                    onChange={(value) =>
                      updateField(
                        "requiredXp",
                        value ??
                          0,
                      )
                    }
                    errors={
                      errors
                    }
                  />

                  <NumberField
                    label="Points requis"
                    name="requiredPoints"
                    value={
                      form.requiredPoints
                    }
                    onChange={(value) =>
                      updateField(
                        "requiredPoints",
                        value ??
                          0,
                      )
                    }
                    errors={
                      errors
                    }
                  />

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
                    errors={
                      errors
                    }
                  />
                </div>
              </FormSection>

              <FormSection
                icon={
                  <BadgePercent className="size-5" />
                }
                title="Bonus et multiplicateurs"
                description="Augmentez les gains obtenus par les membres du niveau."
              >
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  <NumberField
                    label="Multiplicateur XP"
                    name="xpMultiplier"
                    value={
                      form.xpMultiplier
                    }
                    onChange={(value) =>
                      updateField(
                        "xpMultiplier",
                        value ??
                          1,
                      )
                    }
                    errors={
                      errors
                    }
                    step={0.05}
                    suffix="×"
                  />

                  <NumberField
                    label="Multiplicateur points"
                    name="pointsMultiplier"
                    value={
                      form.pointsMultiplier
                    }
                    onChange={(value) =>
                      updateField(
                        "pointsMultiplier",
                        value ??
                          1,
                      )
                    }
                    errors={
                      errors
                    }
                    step={0.05}
                    suffix="×"
                  />

                  <NumberField
                    label="Multiplicateur parrainage"
                    name="referralMultiplier"
                    value={
                      form.referralMultiplier
                    }
                    onChange={(value) =>
                      updateField(
                        "referralMultiplier",
                        value ??
                          1,
                      )
                    }
                    errors={
                      errors
                    }
                    step={0.05}
                    suffix="×"
                  />

                  <NumberField
                    label="Réduction permanente"
                    name="permanentDiscountPercent"
                    value={
                      form.permanentDiscountPercent
                    }
                    onChange={(value) =>
                      updateField(
                        "permanentDiscountPercent",
                        value,
                      )
                    }
                    errors={
                      errors
                    }
                    nullable
                    suffix="%"
                  />
                </div>
              </FormSection>

              <FormSection
                icon={
                  <Sparkles className="size-5" />
                }
                title="Avantages inclus"
                description="Choisissez les privilèges automatiquement associés au niveau."
              >
                <div className="grid gap-3 md:grid-cols-2">
                  <ToggleField
                    label="Réservation prioritaire"
                    description="Accès prioritaire aux créneaux de réservation."
                    checked={
                      form.priorityBooking
                    }
                    onChange={(value) =>
                      updateField(
                        "priorityBooking",
                        value,
                      )
                    }
                  />

                  <ToggleField
                    label="Support VIP"
                    description="Traitement prioritaire des demandes clientes."
                    checked={
                      form.vipSupport
                    }
                    onChange={(value) =>
                      updateField(
                        "vipSupport",
                        value,
                      )
                    }
                  />

                  <ToggleField
                    label="Concours exclusifs"
                    description="Accès aux concours réservés aux membres VIP."
                    checked={
                      form.exclusiveContests
                    }
                    onChange={(value) =>
                      updateField(
                        "exclusiveContests",
                        value,
                      )
                    }
                  />

                  <ToggleField
                    label="Récompenses exclusives"
                    description="Accès aux cadeaux spécifiques à ce niveau."
                    checked={
                      form.exclusiveRewards
                    }
                    onChange={(value) =>
                      updateField(
                        "exclusiveRewards",
                        value,
                      )
                    }
                  />

                  <ToggleField
                    label="Événements exclusifs"
                    description="Participation aux événements privés du Club."
                    checked={
                      form.exclusiveEvents
                    }
                    onChange={(value) =>
                      updateField(
                        "exclusiveEvents",
                        value,
                      )
                    }
                  />

                  <ToggleField
                    label="Cadeau offert"
                    description="Le niveau inclut un cadeau de bienvenue."
                    checked={
                      form.freeGift
                    }
                    onChange={(value) =>
                      updateField(
                        "freeGift",
                        value,
                      )
                    }
                  />

                  <ToggleField
                    label="Cadeau d’anniversaire"
                    description="Un cadeau est accordé pour l’anniversaire."
                    checked={
                      form.birthdayGift
                    }
                    onChange={(value) =>
                      updateField(
                        "birthdayGift",
                        value,
                      )
                    }
                  />
                </div>
              </FormSection>

              <FormSection
                icon={
                  <ShieldCheck className="size-5" />
                }
                title="Publication"
                description="État et visibilité du niveau dans le Club."
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
                            .value as AdminVipLevelFormInput["status"],
                        )
                      }
                      className="mt-2 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3.5 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                    >
                      <option value="DRAFT">
                        Brouillon
                      </option>

                      <option value="ACTIVE">
                        Actif
                      </option>

                      <option value="ARCHIVED">
                        Archivé
                      </option>
                    </select>

                    <FieldError
                      name="status"
                      errors={
                        errors
                      }
                    />
                  </label>

                  <div className="space-y-3">
                    <ToggleField
                      label="Visible par les membres"
                      description="Afficher le niveau dans la progression du Club."
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
                      label="Niveau par défaut"
                      description="Attribué automatiquement aux nouveaux membres."
                      checked={
                        form.isDefault
                      }
                      onChange={(value) => {
                        updateField(
                          "isDefault",
                          value,
                        );

                        if (
                          value
                        ) {
                          updateField(
                            "status",
                            "ACTIVE",
                          );

                          updateField(
                            "visible",
                            true,
                          );
                        }
                      }}
                    />
                  </div>
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
                  saveLevel
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
                    : "Créer le niveau"}
              </button>
            </footer>
          </div>
        </div>
      ) : null}
    </div>
  );
}
