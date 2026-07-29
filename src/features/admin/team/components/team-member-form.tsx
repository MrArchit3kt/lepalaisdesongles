"use client";

import {
  Check,
  Clock3,
  Euro,
  Eye,
  EyeOff,
  LoaderCircle,
  Mail,
  MapPin,
  Palette,
  Phone,
  Save,
  Scissors,
  ShieldCheck,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import {
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";

import type {
  TeamApiError,
  TeamCreateResponse,
  TeamFormOptions,
  TeamMember,
  TeamMemberFormValues,
  TeamUpdateResponse,
} from "@/features/admin/team/types/team.types";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type TeamMemberFormProps = {
  mode: "create" | "edit";

  options: TeamFormOptions;

  member?: TeamMember | null;

  onSaved?: (
    member: TeamMember,
  ) => void;

  onCancel?: () => void;
};

type FormErrors = Partial<
  Record<
    keyof TeamMemberFormValues,
    string
  >
>;

/* -------------------------------------------------------------------------- */
/*                                 CONSTANTES                                 */
/* -------------------------------------------------------------------------- */

const DEFAULT_VALUES: TeamMemberFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  bio: "",
  color: "#bd4b73",
  password: "",
  isOwner: false,
  isActive: true,
  acceptsOnlineBooking: true,
  defaultCleanupMinutes: 10,
  slotIntervalMinutes: 15,
  workstationIds: [],
  serviceIds: [],
};

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

function formatPrice(
  priceCents: number,
): string {
  return new Intl.NumberFormat(
    "fr-FR",
    {
      style: "currency",
      currency: "EUR",
    },
  ).format(priceCents / 100);
}

function createInitialValues(
  member?: TeamMember | null,
): TeamMemberFormValues {
  if (!member) {
    return DEFAULT_VALUES;
  }

  return {
    firstName: member.firstName,
    lastName: member.lastName,
    email: member.email,
    phone: member.phone ?? "",
    bio: member.bio ?? "",
    color:
      member.color ?? "#bd4b73",
    password: "",
    isOwner: member.isOwner,
    isActive: member.isActive,
    acceptsOnlineBooking:
      member.acceptsOnlineBooking,
    defaultCleanupMinutes:
      member.defaultCleanupMinutes,
    slotIntervalMinutes:
      member.slotIntervalMinutes,
    workstationIds:
      member.workstations.map(
        (workstation) =>
          workstation.id,
      ),
    serviceIds:
      member.services.map(
        (service) =>
          service.serviceId,
      ),
  };
}

function validateForm(
  values: TeamMemberFormValues,
  mode: "create" | "edit",
): FormErrors {
  const errors: FormErrors = {};

  if (
    values.firstName.trim().length < 2
  ) {
    errors.firstName =
      "Le prénom doit contenir au moins 2 caractères.";
  }

  if (
    values.lastName.trim().length < 2
  ) {
    errors.lastName =
      "Le nom doit contenir au moins 2 caractères.";
  }

  if (
    !values.email
      .trim()
      .toLowerCase()
      .match(
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      )
  ) {
    errors.email =
      "Adresse e-mail invalide.";
  }

  if (
    mode === "create" &&
    values.password.length < 8
  ) {
    errors.password =
      "Le mot de passe doit contenir au moins 8 caractères.";
  }

  if (
    mode === "edit" &&
    values.password.length > 0 &&
    values.password.length < 8
  ) {
    errors.password =
      "Le nouveau mot de passe doit contenir au moins 8 caractères.";
  }

  if (
    values.defaultCleanupMinutes < 0 ||
    values.defaultCleanupMinutes > 120
  ) {
    errors.defaultCleanupMinutes =
      "Le nettoyage doit être compris entre 0 et 120 minutes.";
  }

  if (
    values.slotIntervalMinutes < 5 ||
    values.slotIntervalMinutes > 120
  ) {
    errors.slotIntervalMinutes =
      "L’intervalle doit être compris entre 5 et 120 minutes.";
  }

  if (
    values.bio.trim().length > 1000
  ) {
    errors.bio =
      "La biographie ne peut pas dépasser 1 000 caractères.";
  }

  return errors;
}

async function readJson<T>(
  response: Response,
): Promise<T> {
  const payload =
    (await response.json()) as
      | T
      | TeamApiError;

  if (!response.ok) {
    const errorPayload =
      payload as TeamApiError;

    throw new Error(
      errorPayload.error ??
        "Une erreur est survenue.",
    );
  }

  return payload as T;
}

/* -------------------------------------------------------------------------- */
/*                                COMPONENT                                   */
/* -------------------------------------------------------------------------- */

export function TeamMemberForm({
  mode,
  options,
  member,
  onSaved,
  onCancel,
}: TeamMemberFormProps) {
  const [
    values,
    setValues,
  ] = useState<TeamMemberFormValues>(
    () =>
      createInitialValues(member),
  );

  const [
    errors,
    setErrors,
  ] = useState<FormErrors>({});

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const selectedServices =
    useMemo(
      () =>
        options.services.filter(
          (service) =>
            values.serviceIds.includes(
              service.id,
            ),
        ),
      [
        options.services,
        values.serviceIds,
      ],
    );

  const selectedWorkstations =
    useMemo(
      () =>
        options.workstations.filter(
          (workstation) =>
            values.workstationIds.includes(
              workstation.id,
            ),
        ),
      [
        options.workstations,
        values.workstationIds,
      ],
    );

  const groupedServices =
    useMemo(() => {
      const groups = new Map<
        string,
        {
          id: string;
          name: string;
          services:
            TeamFormOptions["services"];
        }
      >();

      for (
        const service of
        options.services
      ) {
        const existing =
          groups.get(
            service.category.id,
          );

        if (existing) {
          existing.services.push(
            service,
          );

          continue;
        }

        groups.set(
          service.category.id,
          {
            id: service.category.id,
            name:
              service.category.name,
            services: [service],
          },
        );
      }

      return Array.from(
        groups.values(),
      );
    }, [options.services]);

  function updateValue<
    Key extends keyof TeamMemberFormValues,
  >(
    key: Key,
    value: TeamMemberFormValues[Key],
  ): void {
    setValues((current) => ({
      ...current,
      [key]: value,
    }));

    setErrors((current) => {
      if (!current[key]) {
        return current;
      }

      const next = {
        ...current,
      };

      delete next[key];

      return next;
    });
  }

  function toggleService(
    serviceId: string,
  ): void {
    updateValue(
      "serviceIds",
      values.serviceIds.includes(
        serviceId,
      )
        ? values.serviceIds.filter(
            (id) =>
              id !== serviceId,
          )
        : [
            ...values.serviceIds,
            serviceId,
          ],
    );
  }

  function toggleWorkstation(
    workstationId: string,
  ): void {
    updateValue(
      "workstationIds",
      values.workstationIds.includes(
        workstationId,
      )
        ? values.workstationIds.filter(
            (id) =>
              id !== workstationId,
          )
        : [
            ...values.workstationIds,
            workstationId,
          ],
    );
  }

  async function submitForm(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    if (submitting) {
      return;
    }

    const nextErrors =
      validateForm(
        values,
        mode,
      );

    if (
      Object.keys(nextErrors)
        .length > 0
    ) {
      setErrors(nextErrors);

      toast.error(
        "Certaines informations doivent être corrigées.",
      );

      return;
    }

    if (
      mode === "edit" &&
      !member
    ) {
      toast.error(
        "La professionnelle à modifier est introuvable.",
      );

      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        ...values,
        firstName:
          values.firstName.trim(),
        lastName:
          values.lastName.trim(),
        email:
          values.email
            .trim()
            .toLowerCase(),
        phone:
          values.phone.trim(),
        bio: values.bio.trim(),
      };

      const endpoint =
        mode === "create"
          ? "/api/admin/team"
          : `/api/admin/team/${member?.id}`;

      const response =
        await fetch(endpoint, {
          method:
            mode === "create"
              ? "POST"
              : "PUT",

          headers: {
            "Content-Type":
              "application/json",
            Accept:
              "application/json",
          },

          body: JSON.stringify(
            payload,
          ),
        });

      const result =
        mode === "create"
          ? await readJson<TeamCreateResponse>(
              response,
            )
          : await readJson<TeamUpdateResponse>(
              response,
            );

      toast.success(
        mode === "create"
          ? "La professionnelle a été ajoutée."
          : "Les informations ont été enregistrées.",
      );

      onSaved?.(result.member);
    } catch (reason: unknown) {
      toast.error(
        reason instanceof Error
          ? reason.message
          : "Impossible d’enregistrer la professionnelle.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={submitForm}
      className="space-y-7"
    >
      {/* ------------------------------------------------------------------ */}
      {/*                            EN-TÊTE                                  */}
      {/* ------------------------------------------------------------------ */}

      <header className="flex flex-col gap-4 border-b border-rose-100 pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-200">
            <UserRound className="size-6" />
          </span>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#bd4b73]">
              Gestion de l’équipe
            </p>

            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-950">
              {mode === "create"
                ? "Ajouter une professionnelle"
                : `Modifier ${member?.displayName ?? "la professionnelle"}`}
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
              Configurez son compte,
              ses prestations, ses postes
              et les paramètres utilisés
              pour la réservation.
            </p>
          </div>
        </div>

        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-[#bd4b73] disabled:opacity-50"
            aria-label="Fermer le formulaire"
          >
            <X className="size-5" />
          </button>
        ) : null}
      </header>

      {/* ------------------------------------------------------------------ */}
      {/*                      INFORMATIONS PERSONNELLES                      */}
      {/* ------------------------------------------------------------------ */}

      <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-2xl bg-rose-50 text-[#bd4b73]">
            <UserRound className="size-5" />
          </span>

          <div>
            <h3 className="font-semibold text-zinc-950">
              Informations personnelles
            </h3>

            <p className="text-sm text-zinc-500">
              Identité et coordonnées de
              connexion.
            </p>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-semibold text-zinc-800">
              Prénom
            </span>

            <div className="relative mt-2">
              <UserRound className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />

              <input
                type="text"
                value={values.firstName}
                onChange={(event) =>
                  updateValue(
                    "firstName",
                    event.target.value,
                  )
                }
                autoComplete="given-name"
                maxLength={50}
                className="h-12 w-full rounded-2xl border border-zinc-200 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                placeholder="Élodie"
              />
            </div>

            {errors.firstName ? (
              <p className="mt-2 text-sm text-red-600">
                {errors.firstName}
              </p>
            ) : null}
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-zinc-800">
              Nom
            </span>

            <div className="relative mt-2">
              <UserRound className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />

              <input
                type="text"
                value={values.lastName}
                onChange={(event) =>
                  updateValue(
                    "lastName",
                    event.target.value,
                  )
                }
                autoComplete="family-name"
                maxLength={50}
                className="h-12 w-full rounded-2xl border border-zinc-200 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                placeholder="Martin"
              />
            </div>

            {errors.lastName ? (
              <p className="mt-2 text-sm text-red-600">
                {errors.lastName}
              </p>
            ) : null}
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-zinc-800">
              Adresse e-mail
            </span>

            <div className="relative mt-2">
              <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />

              <input
                type="email"
                value={values.email}
                onChange={(event) =>
                  updateValue(
                    "email",
                    event.target.value,
                  )
                }
                autoComplete="email"
                className="h-12 w-full rounded-2xl border border-zinc-200 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                placeholder="elodie@exemple.fr"
              />
            </div>

            {errors.email ? (
              <p className="mt-2 text-sm text-red-600">
                {errors.email}
              </p>
            ) : null}
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-zinc-800">
              Téléphone
            </span>

            <div className="relative mt-2">
              <Phone className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />

              <input
                type="tel"
                value={values.phone}
                onChange={(event) =>
                  updateValue(
                    "phone",
                    event.target.value,
                  )
                }
                autoComplete="tel"
                className="h-12 w-full rounded-2xl border border-zinc-200 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                placeholder="06 12 34 56 78"
              />
            </div>

            {errors.phone ? (
              <p className="mt-2 text-sm text-red-600">
                {errors.phone}
              </p>
            ) : null}
          </label>

          <label className="block sm:col-span-2">
            <span className="text-sm font-semibold text-zinc-800">
              {mode === "create"
                ? "Mot de passe"
                : "Nouveau mot de passe"}
            </span>

            <div className="relative mt-2">
              <ShieldCheck className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={values.password}
                onChange={(event) =>
                  updateValue(
                    "password",
                    event.target.value,
                  )
                }
                autoComplete="new-password"
                className="h-12 w-full rounded-2xl border border-zinc-200 bg-white pl-11 pr-12 text-sm outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                placeholder={
                  mode === "create"
                    ? "8 caractères minimum"
                    : "Laissez vide pour conserver le mot de passe"
                }
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (current) =>
                      !current,
                  )
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 transition hover:text-zinc-700"
                aria-label={
                  showPassword
                    ? "Masquer le mot de passe"
                    : "Afficher le mot de passe"
                }
              >
                {showPassword ? (
                  <EyeOff className="size-5" />
                ) : (
                  <Eye className="size-5" />
                )}
              </button>
            </div>

            {errors.password ? (
              <p className="mt-2 text-sm text-red-600">
                {errors.password}
              </p>
            ) : null}
          </label>

          <label className="block sm:col-span-2">
            <span className="text-sm font-semibold text-zinc-800">
              Présentation
            </span>

            <textarea
              value={values.bio}
              onChange={(event) =>
                updateValue(
                  "bio",
                  event.target.value,
                )
              }
              rows={5}
              maxLength={1000}
              className="mt-2 w-full resize-y rounded-2xl border border-zinc-200 bg-white p-4 text-sm leading-6 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
              placeholder="Présentez son expérience, ses spécialités et son approche..."
            />

            <div className="mt-2 flex items-center justify-between gap-3">
              {errors.bio ? (
                <p className="text-sm text-red-600">
                  {errors.bio}
                </p>
              ) : (
                <span />
              )}

              <span className="text-xs text-zinc-400">
                {values.bio.length}/1000
              </span>
            </div>
          </label>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*                          PARAMÈTRES MÉTIER                          */}
      {/* ------------------------------------------------------------------ */}

      <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-2xl bg-violet-50 text-violet-600">
            <Sparkles className="size-5" />
          </span>

          <div>
            <h3 className="font-semibold text-zinc-950">
              Paramètres professionnels
            </h3>

            <p className="text-sm text-zinc-500">
              Réservation, couleur et
              organisation du planning.
            </p>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <label className="block">
            <span className="text-sm font-semibold text-zinc-800">
              Couleur du planning
            </span>

            <div className="mt-2 flex h-12 items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-4">
              <Palette className="size-4 text-zinc-400" />

              <input
                type="color"
                value={values.color}
                onChange={(event) =>
                  updateValue(
                    "color",
                    event.target.value,
                  )
                }
                className="size-7 cursor-pointer rounded-lg border-0 bg-transparent p-0"
              />

              <input
                type="text"
                value={values.color}
                onChange={(event) =>
                  updateValue(
                    "color",
                    event.target.value,
                  )
                }
                maxLength={7}
                className="min-w-0 flex-1 bg-transparent text-sm uppercase outline-none"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-zinc-800">
              Nettoyage après prestation
            </span>

            <div className="relative mt-2">
              <Clock3 className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />

              <input
                type="number"
                min={0}
                max={120}
                step={5}
                value={
                  values.defaultCleanupMinutes
                }
                onChange={(event) =>
                  updateValue(
                    "defaultCleanupMinutes",
                    Number(
                      event.target.value,
                    ),
                  )
                }
                className="h-12 w-full rounded-2xl border border-zinc-200 bg-white pl-11 pr-16 text-sm outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
              />

              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-zinc-500">
                min
              </span>
            </div>

            {errors.defaultCleanupMinutes ? (
              <p className="mt-2 text-sm text-red-600">
                {
                  errors.defaultCleanupMinutes
                }
              </p>
            ) : null}
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-zinc-800">
              Intervalle des créneaux
            </span>

            <div className="relative mt-2">
              <Clock3 className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />

              <input
                type="number"
                min={5}
                max={120}
                step={5}
                value={
                  values.slotIntervalMinutes
                }
                onChange={(event) =>
                  updateValue(
                    "slotIntervalMinutes",
                    Number(
                      event.target.value,
                    ),
                  )
                }
                className="h-12 w-full rounded-2xl border border-zinc-200 bg-white pl-11 pr-16 text-sm outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
              />

              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-zinc-500">
                min
              </span>
            </div>

            {errors.slotIntervalMinutes ? (
              <p className="mt-2 text-sm text-red-600">
                {
                  errors.slotIntervalMinutes
                }
              </p>
            ) : null}
          </label>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <ToggleCard
            checked={values.isActive}
            title="Compte actif"
            description="La professionnelle peut accéder à son compte."
            onChange={(checked) =>
              updateValue(
                "isActive",
                checked,
              )
            }
          />

          <ToggleCard
            checked={
              values.acceptsOnlineBooking
            }
            title="Réservation en ligne"
            description="Elle apparaît dans le parcours de réservation."
            onChange={(checked) =>
              updateValue(
                "acceptsOnlineBooking",
                checked,
              )
            }
          />

          <ToggleCard
            checked={values.isOwner}
            title="Propriétaire"
            description="Identifie la responsable principale du salon."
            onChange={(checked) =>
              updateValue(
                "isOwner",
                checked,
              )
            }
          />
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*                           PRESTATIONS                               */}
      {/* ------------------------------------------------------------------ */}

      <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-2xl bg-amber-50 text-amber-600">
              <Scissors className="size-5" />
            </span>

            <div>
              <h3 className="font-semibold text-zinc-950">
                Prestations maîtrisées
              </h3>

              <p className="text-sm text-zinc-500">
                Sélectionnez les services
                qu’elle peut réaliser.
              </p>
            </div>
          </div>

          <span className="w-fit rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-[#bd4b73]">
            {selectedServices.length}{" "}
            sélectionnée
            {selectedServices.length > 1
              ? "s"
              : ""}
          </span>
        </div>

        {groupedServices.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500">
            Aucune prestation active
            n’est disponible.
          </div>
        ) : (
          <div className="space-y-6">
            {groupedServices.map(
              (group) => (
                <div key={group.id}>
                  <h4 className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-zinc-500">
                    {group.name}
                  </h4>

                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {group.services.map(
                      (service) => {
                        const selected =
                          values.serviceIds.includes(
                            service.id,
                          );

                        return (
                          <button
                            key={
                              service.id
                            }
                            type="button"
                            onClick={() =>
                              toggleService(
                                service.id,
                              )
                            }
                            aria-pressed={
                              selected
                            }
                            className={`relative rounded-2xl border p-4 text-left transition ${
                              selected
                                ? "border-rose-400 bg-rose-50 shadow-sm ring-2 ring-rose-100"
                                : "border-zinc-200 bg-white hover:border-rose-200 hover:bg-rose-50/40"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-semibold text-zinc-950">
                                  {
                                    service.name
                                  }
                                </p>

                                <div className="mt-2 flex flex-wrap gap-2 text-xs text-zinc-500">
                                  <span className="inline-flex items-center gap-1">
                                    <Clock3 className="size-3.5" />
                                    {
                                      service.durationMinutes
                                    }{" "}
                                    min
                                  </span>

                                  <span className="inline-flex items-center gap-1">
                                    <Euro className="size-3.5" />
                                    {formatPrice(
                                      service.priceCents,
                                    )}
                                  </span>
                                </div>
                              </div>

                              <span
                                className={`grid size-6 shrink-0 place-items-center rounded-full border ${
                                  selected
                                    ? "border-rose-600 bg-rose-600 text-white"
                                    : "border-zinc-300 bg-white text-transparent"
                                }`}
                              >
                                <Check className="size-4" />
                              </span>
                            </div>
                          </button>
                        );
                      },
                    )}
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*                              POSTES                                 */}
      {/* ------------------------------------------------------------------ */}

      <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
              <MapPin className="size-5" />
            </span>

            <div>
              <h3 className="font-semibold text-zinc-950">
                Postes de travail
              </h3>

              <p className="text-sm text-zinc-500">
                Associez les postes qu’elle
                peut utiliser.
              </p>
            </div>
          </div>

          <span className="w-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            {selectedWorkstations.length}{" "}
            sélectionné
            {selectedWorkstations.length > 1
              ? "s"
              : ""}
          </span>
        </div>

        {options.workstations.length ===
        0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500">
            Aucun poste de travail actif
            n’est disponible.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {options.workstations.map(
              (workstation) => {
                const selected =
                  values.workstationIds.includes(
                    workstation.id,
                  );

                return (
                  <button
                    key={workstation.id}
                    type="button"
                    onClick={() =>
                      toggleWorkstation(
                        workstation.id,
                      )
                    }
                    aria-pressed={selected}
                    className={`flex items-start gap-4 rounded-2xl border p-4 text-left transition ${
                      selected
                        ? "border-emerald-400 bg-emerald-50 ring-2 ring-emerald-100"
                        : "border-zinc-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/40"
                    }`}
                  >
                    <span
                      className={`grid size-9 shrink-0 place-items-center rounded-xl ${
                        selected
                          ? "bg-emerald-600 text-white"
                          : "bg-zinc-100 text-zinc-500"
                      }`}
                    >
                      {selected ? (
                        <Check className="size-5" />
                      ) : (
                        <MapPin className="size-5" />
                      )}
                    </span>

                    <div className="min-w-0">
                      <p className="font-semibold text-zinc-950">
                        {workstation.name}
                      </p>

                      {workstation.description ? (
                        <p className="mt-1 text-sm leading-5 text-zinc-500">
                          {
                            workstation.description
                          }
                        </p>
                      ) : null}

                      {!workstation.availableForBooking ? (
                        <span className="mt-2 inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                          Indisponible en ligne
                        </span>
                      ) : null}
                    </div>
                  </button>
                );
              },
            )}
          </div>
        )}
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*                              ACTIONS                                */}
      {/* ------------------------------------------------------------------ */}

      <footer className="sticky bottom-4 z-10 flex flex-col-reverse gap-3 rounded-3xl border border-white/80 bg-white/90 p-4 shadow-xl shadow-zinc-200/60 backdrop-blur sm:flex-row sm:items-center sm:justify-end">
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-zinc-300 bg-white px-5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="size-4" />
            Annuler
          </button>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 px-6 text-sm font-semibold text-white shadow-lg shadow-rose-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {submitting ? (
            <LoaderCircle className="size-5 animate-spin" />
          ) : (
            <Save className="size-5" />
          )}

          {submitting
            ? "Enregistrement..."
            : mode === "create"
              ? "Ajouter à l’équipe"
              : "Enregistrer les modifications"}
        </button>
      </footer>
    </form>
  );
}

/* -------------------------------------------------------------------------- */
/*                              TOGGLE CARD                                   */
/* -------------------------------------------------------------------------- */

type ToggleCardProps = {
  checked: boolean;
  title: string;
  description: string;
  onChange: (
    checked: boolean,
  ) => void;
};

function ToggleCard({
  checked,
  title,
  description,
  onChange,
}: ToggleCardProps) {
  return (
    <button
      type="button"
      onClick={() =>
        onChange(!checked)
      }
      aria-pressed={checked}
      className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition ${
        checked
          ? "border-rose-300 bg-rose-50 ring-2 ring-rose-100"
          : "border-zinc-200 bg-white hover:border-zinc-300"
      }`}
    >
      <span
        className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition ${
          checked
            ? "bg-rose-600"
            : "bg-zinc-300"
        }`}
      >
        <span
          className={`absolute top-1 size-4 rounded-full bg-white shadow-sm transition ${
            checked
              ? "left-6"
              : "left-1"
          }`}
        />
      </span>

      <span>
        <span className="block text-sm font-semibold text-zinc-900">
          {title}
        </span>

        <span className="mt-1 block text-xs leading-5 text-zinc-500">
          {description}
        </span>
      </span>
    </button>
  );
}
