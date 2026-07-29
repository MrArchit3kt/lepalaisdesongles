"use client";

import {
  useState,
  useTransition,
} from "react";

import Link from "next/link";

import {
  useRouter,
} from "next/navigation";

import {
  ArrowLeft,
  CalendarDays,
  FileText,
  Gift,
  LoaderCircle,
  Save,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import {
  toast,
} from "sonner";

import {
  createAdminContestAction,
  updateAdminContestAction,
} from "@/features/admin/contests/actions/admin-contests.actions";

import type {
  AdminContestFormInput,
  AdminContestStatus,
} from "@/features/admin/contests/types/admin-contests.types";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type AdminContestFormProps = {
  mode: "CREATE" | "EDIT";

  initialValue: AdminContestFormInput;
};

type FieldErrors =
  Record<
    string,
    string[]
  >;

/* -------------------------------------------------------------------------- */
/*                                CONSTANTES                                  */
/* -------------------------------------------------------------------------- */

const CREATE_STATUS_OPTIONS: Array<{
  value: AdminContestStatus;
  label: string;
}> = [
  {
    value:
      "DRAFT",

    label:
      "Brouillon",
  },
  {
    value:
      "SCHEDULED",

    label:
      "Planifié",
  },
  {
    value:
      "ACTIVE",

    label:
      "Actif",
  },
];

const EDIT_STATUS_OPTIONS: Array<{
  value: AdminContestStatus;
  label: string;
}> = [
  ...CREATE_STATUS_OPTIONS,
  {
    value:
      "CLOSED",

    label:
      "Clôturé",
  },
  {
    value:
      "DRAWN",

    label:
      "Tirage effectué",
  },
  {
    value:
      "CANCELLED",

    label:
      "Annulé",
  },
];

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
  value: string,
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
    return value;
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

function normalizeInitialValue(
  value: AdminContestFormInput,
): AdminContestFormInput {
  return {
    ...value,

    startsAt:
      toDateTimeLocal(
        value.startsAt,
      ),

    endsAt:
      toDateTimeLocal(
        value.endsAt,
      ),

    drawAt:
      toDateTimeLocal(
        value.drawAt,
      ),
  };
}

/* -------------------------------------------------------------------------- */
/*                              COMPOSANTS UI                                 */
/* -------------------------------------------------------------------------- */

function FormSection({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[1.75rem] border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
      <header className="flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
          {icon}
        </span>

        <div>
          <h2 className="text-lg font-black text-zinc-950">
            {title}
          </h2>

          <p className="mt-1 text-sm leading-6 text-zinc-500">
            {description}
          </p>
        </div>
      </header>

      <div className="mt-6">
        {children}
      </div>
    </section>
  );
}

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

function TextField({
  label,
  name,
  value,
  onChange,
  errors,
  type = "text",
  required = false,
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
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-black text-zinc-800">
        {label}

        {required ? (
          <span className="ml-1 text-rose-500">
            *
          </span>
        ) : null}
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

function TextareaField({
  label,
  name,
  value,
  onChange,
  errors,
  rows = 5,
  required = false,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  errors: FieldErrors;
  rows?: number;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-black text-zinc-800">
        {label}

        {required ? (
          <span className="ml-1 text-rose-500">
            *
          </span>
        ) : null}
      </span>

      <textarea
        value={value}
        rows={rows}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        className={`mt-2 w-full resize-y rounded-xl border bg-white px-3.5 py-3 text-sm leading-6 text-zinc-950 outline-none transition focus:ring-4 ${
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

function ToggleField({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() =>
        onChange(
          !checked,
        )
      }
      className="flex w-full items-start justify-between gap-4 rounded-2xl border border-zinc-200 p-4 text-left transition hover:border-violet-200 hover:bg-violet-50/30"
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
/*                                 COMPOSANT                                  */
/* -------------------------------------------------------------------------- */

export function AdminContestForm({
  mode,
  initialValue,
}: AdminContestFormProps) {
  const router =
    useRouter();

  const [
    form,
    setForm,
  ] =
    useState<AdminContestFormInput>(
      () =>
        normalizeInitialValue(
          initialValue,
        ),
    );

  const [
    slugManuallyEdited,
    setSlugManuallyEdited,
  ] =
    useState(
      mode ===
        "EDIT",
    );

  const [
    errors,
    setErrors,
  ] =
    useState<FieldErrors>({});

  const [
    isPending,
    startTransition,
  ] =
    useTransition();

  function updateField<
    Key extends keyof AdminContestFormInput,
  >(
    key: Key,
    value: AdminContestFormInput[Key],
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

  function updateTitle(
    title: string,
  ): void {
    setForm(
      (
        current,
      ) => ({
        ...current,

        title,

        slug:
          slugManuallyEdited
            ? current.slug
            : slugify(
                title,
              ),
      }),
    );
  }

  function submit():
    void {
    setErrors({});

    const payload:
      AdminContestFormInput =
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

        drawAt:
          form.drawAt
            ? toIsoDate(
                form.drawAt,
              )
            : "",
      };

    startTransition(() => {
      void (async () => {
        const result =
          mode ===
          "CREATE"
            ? await createAdminContestAction(
                payload,
              )
            : await updateAdminContestAction(
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

        if (
          result.redirectTo
        ) {
          router.push(
            result.redirectTo,
          );

          return;
        }

        router.refresh();
      })();
    });
  }

  const statusOptions =
    mode ===
    "CREATE"
      ? CREATE_STATUS_OPTIONS
      : EDIT_STATUS_OPTIONS;

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/admin/concours"
          className="inline-flex items-center gap-2 text-sm font-black text-zinc-600 transition hover:text-violet-700"
        >
          <ArrowLeft className="size-4" />

          Retour aux concours
        </Link>

        <section className="relative mt-5 overflow-hidden rounded-[2rem] bg-zinc-950 px-6 py-8 text-white shadow-xl sm:px-8">
          <div className="absolute -right-16 -top-24 size-64 rounded-full bg-violet-500/30 blur-3xl" />

          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-violet-100">
              <Sparkles className="size-4" />

              Jeux concours
            </span>

            <h1 className="mt-4 text-3xl font-black tracking-tight">
              {mode ===
              "CREATE"
                ? "Créer un concours"
                : "Modifier le concours"}
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-300">
              Configurez les dates, le lot, les règles de participation et la visibilité publique.
            </p>
          </div>
        </section>

        <div className="mt-6 space-y-6">
          <FormSection
            title="Présentation"
            description="Informations visibles par les clientes."
            icon={
              <FileText className="size-5" />
            }
          >
            <div className="grid gap-5 md:grid-cols-2">
              <TextField
                label="Titre"
                name="title"
                value={form.title}
                onChange={
                  updateTitle
                }
                errors={errors}
                required
              />

              <TextField
                label="Slug"
                name="slug"
                value={form.slug}
                onChange={(value) => {
                  setSlugManuallyEdited(
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
                required
                placeholder="concours-ete-2026"
              />

              <div className="md:col-span-2">
                <TextareaField
                  label="Description"
                  name="description"
                  value={
                    form.description
                  }
                  onChange={(value) =>
                    updateField(
                      "description",
                      value,
                    )
                  }
                  errors={errors}
                  required
                  rows={6}
                />
              </div>

              <div className="md:col-span-2">
                <TextareaField
                  label="Règlement et conditions"
                  name="rules"
                  value={form.rules}
                  onChange={(value) =>
                    updateField(
                      "rules",
                      value,
                    )
                  }
                  errors={errors}
                  rows={7}
                />
              </div>
            </div>
          </FormSection>

          <FormSection
            title="Lot à gagner"
            description="Décrivez précisément le cadeau remis à la gagnante."
            icon={
              <Gift className="size-5" />
            }
          >
            <div className="space-y-5">
              <TextareaField
                label="Description du lot"
                name="prize"
                value={form.prize}
                onChange={(value) =>
                  updateField(
                    "prize",
                    value,
                  )
                }
                errors={errors}
                required
                rows={4}
              />

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
                errors={errors}
                placeholder="https://..."
              />
            </div>
          </FormSection>

          <FormSection
            title="Dates et publication"
            description="Définissez la période de participation et le tirage."
            icon={
              <CalendarDays className="size-5" />
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
                        .value as AdminContestStatus,
                    )
                  }
                  className="mt-2 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3.5 text-sm outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                >
                  {statusOptions.map(
                    (
                      option,
                    ) => (
                      <option
                        key={
                          option.value
                        }
                        value={
                          option.value
                        }
                      >
                        {
                          option.label
                        }
                      </option>
                    ),
                  )}
                </select>

                <FieldError
                  name="status"
                  errors={errors}
                />
              </label>

              <label className="block">
                <span className="text-sm font-black text-zinc-800">
                  Limite de participations
                </span>

                <input
                  type="number"
                  min={1}
                  value={
                    form.maximumEntries ??
                    ""
                  }
                  placeholder="Illimitée"
                  onChange={(event) =>
                    updateField(
                      "maximumEntries",
                      event.target
                        .value ===
                        ""
                        ? null
                        : Number(
                            event
                              .target
                              .value,
                          ),
                    )
                  }
                  className="mt-2 h-11 w-full rounded-xl border border-zinc-200 px-3.5 text-sm outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                />

                <FieldError
                  name="maximumEntries"
                  errors={errors}
                />
              </label>

              <TextField
                label="Début des participations"
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
                required
              />

              <TextField
                label="Fin des participations"
                name="endsAt"
                type="datetime-local"
                value={
                  form.endsAt
                }
                onChange={(value) =>
                  updateField(
                    "endsAt",
                    value,
                  )
                }
                errors={errors}
                required
              />

              <TextField
                label="Date prévue du tirage"
                name="drawAt"
                type="datetime-local"
                value={form.drawAt}
                onChange={(value) =>
                  updateField(
                    "drawAt",
                    value,
                  )
                }
                errors={errors}
              />
            </div>
          </FormSection>

          <FormSection
            title="Conditions d’accès"
            description="Contrôlez l’inscription et la mise en avant du concours."
            icon={
              <ShieldCheck className="size-5" />
            }
          >
            <div className="grid gap-3 lg:grid-cols-2">
              <ToggleField
                label="Compte client obligatoire"
                description="La participante doit être connectée pour rejoindre le concours."
                checked={
                  form.requiresAccount
                }
                onChange={(value) =>
                  updateField(
                    "requiresAccount",
                    value,
                  )
                }
              />

              <ToggleField
                label="Afficher sur la page d’accueil"
                description="Mettre ce concours en avant dans les offres de la page d’accueil."
                checked={
                  form.showOnHomepage
                }
                onChange={(value) =>
                  updateField(
                    "showOnHomepage",
                    value,
                  )
                }
              />
            </div>
          </FormSection>

          <footer className="sticky bottom-4 z-20 flex flex-col-reverse gap-3 rounded-2xl border border-zinc-200 bg-white/95 p-4 shadow-xl backdrop-blur sm:flex-row sm:justify-between">
            <Link
              href="/admin/concours"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-zinc-200 px-5 text-sm font-black text-zinc-700"
            >
              <ArrowLeft className="size-4" />

              Annuler
            </Link>

            <button
              type="button"
              onClick={submit}
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
                : mode ===
                    "CREATE"
                  ? "Créer le concours"
                  : "Enregistrer les modifications"}
            </button>
          </footer>
        </div>
      </div>
    </main>
  );
}
