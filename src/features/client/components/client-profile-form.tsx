"use client";

import { useActionState, useEffect } from "react";
import {
  AlertCircle,
  AtSign,
  BellRing,
  CalendarDays,
  CheckCircle2,
  HeartPulse,
  LoaderCircle,
  Mail,
  MapPin,
  Phone,
  Save,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

import { updateClientProfileAction } from "@/features/client/actions/update-client-profile.action";

import {
  initialClientProfileActionState,
  type ClientProfileFieldErrors,
} from "@/features/client/schemas/client-profile.schema";

export type ClientProfileFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
  addressLine1: string;
  addressLine2: string;
  postalCode: string;
  city: string;
  country: string;
  allergies: string;
  marketingEmail: boolean;
  marketingSms: boolean;
};

type ClientProfileFormProps = {
  profile: ClientProfileFormData;
};

type FieldName = keyof ClientProfileFieldErrors;

type InputFieldProps = {
  id: FieldName;
  label: string;
  defaultValue: string;
  placeholder?: string;
  type?: React.HTMLInputTypeAttribute;
  autoComplete?: string;
  icon: React.ComponentType<{
    className?: string;
  }>;
  disabled: boolean;
  errors: ClientProfileFieldErrors;
};

function getFirstError(
  errors: ClientProfileFieldErrors,
  fieldName: FieldName,
): string | null {
  return errors[fieldName]?.[0] ?? null;
}

function InputField({
  id,
  label,
  defaultValue,
  placeholder,
  type = "text",
  autoComplete,
  icon: Icon,
  disabled,
  errors,
}: InputFieldProps) {
  const error = getFirstError(errors, id);

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-semibold text-zinc-800">
        {label}
      </label>

      <div className="relative">
        <Icon className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />

        <input
          id={id}
          name={id}
          type={type}
          defaultValue={defaultValue}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={[
            "h-12 w-full rounded-2xl border bg-white pl-11 pr-4 text-sm text-zinc-950 outline-none transition",
            "placeholder:text-zinc-400",
            "focus:border-rose-300 focus:ring-4 focus:ring-rose-100",
            "disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-500",
            error ? "border-red-300 ring-4 ring-red-50" : "border-zinc-200",
          ].join(" ")}
        />
      </div>

      {error ? (
        <p
          id={`${id}-error`}
          className="flex items-start gap-2 text-sm text-red-600"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      ) : null}
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{
    className?: string;
  }>;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-100 to-pink-50 text-rose-700 shadow-sm">
        <Icon className="size-5" />
      </div>

      <div>
        <h2 className="font-serif text-lg font-semibold text-[#35242B]">{title}</h2>

        <p className="mt-1 text-sm leading-6 text-zinc-500">{description}</p>
      </div>
    </div>
  );
}

function MarketingOption({
  name,
  defaultChecked,
  title,
  description,
  icon: Icon,
  disabled,
}: {
  name: "marketingEmail" | "marketingSms";
  defaultChecked: boolean;
  title: string;
  description: string;
  icon: React.ComponentType<{
    className?: string;
  }>;
  disabled: boolean;
}) {
  return (
    <label className="group flex cursor-pointer items-start gap-4 rounded-2xl border border-zinc-200 bg-white p-5 transition hover:border-rose-200 hover:bg-rose-50/30">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 transition group-hover:bg-rose-100 group-hover:text-rose-700">
        <Icon className="size-4" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-semibold text-zinc-950">{title}</p>

        <p className="mt-1 text-sm leading-6 text-zinc-500">{description}</p>
      </div>

      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        disabled={disabled}
        className="mt-1 size-5 shrink-0 cursor-pointer accent-rose-600 disabled:cursor-not-allowed"
      />
    </label>
  );
}

export function ClientProfileForm({ profile }: ClientProfileFormProps) {
  const [state, formAction, pending] = useActionState(
    updateClientProfileAction,
    initialClientProfileActionState,
  );

  useEffect(() => {
    if (!state.message) {
      return;
    }

    if (state.status === "SUCCESS") {
      toast.success(state.message);

      return;
    }

    if (state.status === "ERROR") {
      toast.error(state.message);
    }
  }, [state.message, state.status]);

  return (
    <form action={formAction} className="space-y-6">
      {state.message ? (
        <div
          className={[
            "flex items-start gap-3 rounded-2xl border p-4 text-sm",
            state.status === "SUCCESS"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-700",
          ].join(" ")}
        >
          {state.status === "SUCCESS" ? (
            <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
          ) : (
            <AlertCircle className="mt-0.5 size-5 shrink-0" />
          )}

          <p className="leading-6">{state.message}</p>
        </div>
      ) : null}

      <section className="rounded-[28px] border border-zinc-200/80 bg-white p-5 shadow-[0_18px_55px_-35px_rgba(24,24,27,0.28)] sm:p-7">
        <SectionHeader
          icon={UserRound}
          title="Informations personnelles"
          description="Ces informations sont utilisées pour personnaliser ton espace et faciliter la gestion de tes rendez-vous."
        />

        <div className="mt-7 grid gap-5 md:grid-cols-2">
          <InputField
            id="firstName"
            label="Prénom"
            defaultValue={profile.firstName}
            placeholder="Pauline"
            autoComplete="given-name"
            icon={UserRound}
            disabled={pending}
            errors={state.fieldErrors}
          />

          <InputField
            id="lastName"
            label="Nom"
            defaultValue={profile.lastName}
            placeholder="Dupont"
            autoComplete="family-name"
            icon={UserRound}
            disabled={pending}
            errors={state.fieldErrors}
          />

          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-semibold text-zinc-800"
            >
              Adresse e-mail
            </label>

            <div className="relative">
              <AtSign className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />

              <input
                id="email"
                type="email"
                value={profile.email}
                disabled
                readOnly
                className="h-12 w-full cursor-not-allowed rounded-2xl border border-zinc-200 bg-zinc-50 pl-11 pr-4 text-sm text-zinc-500 outline-none"
              />
            </div>

            <p className="text-xs leading-5 text-zinc-500">
              L’adresse e-mail ne peut pas être modifiée depuis cet espace.
            </p>
          </div>

          <InputField
            id="phone"
            label="Téléphone"
            defaultValue={profile.phone}
            placeholder="06 12 34 56 78"
            type="tel"
            autoComplete="tel"
            icon={Phone}
            disabled={pending}
            errors={state.fieldErrors}
          />

          <InputField
            id="birthDate"
            label="Date de naissance"
            defaultValue={profile.birthDate}
            type="date"
            autoComplete="bday"
            icon={CalendarDays}
            disabled={pending}
            errors={state.fieldErrors}
          />
        </div>
      </section>

      <section className="rounded-[28px] border border-zinc-200/80 bg-white p-5 shadow-[0_18px_55px_-35px_rgba(24,24,27,0.28)] sm:p-7">
        <SectionHeader
          icon={MapPin}
          title="Adresse"
          description="Ton adresse reste facultative et peut être utilisée pour les documents liés à ton compte."
        />

        <div className="mt-7 grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <InputField
              id="addressLine1"
              label="Adresse"
              defaultValue={profile.addressLine1}
              placeholder="12 rue des Fleurs"
              autoComplete="address-line1"
              icon={MapPin}
              disabled={pending}
              errors={state.fieldErrors}
            />
          </div>

          <div className="md:col-span-2">
            <InputField
              id="addressLine2"
              label="Complément d’adresse"
              defaultValue={profile.addressLine2}
              placeholder="Appartement, étage, bâtiment…"
              autoComplete="address-line2"
              icon={MapPin}
              disabled={pending}
              errors={state.fieldErrors}
            />
          </div>

          <InputField
            id="postalCode"
            label="Code postal"
            defaultValue={profile.postalCode}
            placeholder="21000"
            autoComplete="postal-code"
            icon={MapPin}
            disabled={pending}
            errors={state.fieldErrors}
          />

          <InputField
            id="city"
            label="Ville"
            defaultValue={profile.city}
            placeholder="Dijon"
            autoComplete="address-level2"
            icon={MapPin}
            disabled={pending}
            errors={state.fieldErrors}
          />

          <div className="md:col-span-2">
            <InputField
              id="country"
              label="Pays"
              defaultValue={profile.country}
              placeholder="France"
              autoComplete="country-name"
              icon={MapPin}
              disabled={pending}
              errors={state.fieldErrors}
            />
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-zinc-200/80 bg-white p-5 shadow-[0_18px_55px_-35px_rgba(24,24,27,0.28)] sm:p-7">
        <SectionHeader
          icon={HeartPulse}
          title="Informations utiles au salon"
          description="Indique les allergies ou sensibilités importantes afin que le salon puisse adapter les prestations."
        />

        <div className="mt-7 space-y-2">
          <label
            htmlFor="allergies"
            className="text-sm font-semibold text-zinc-800"
          >
            Allergies ou sensibilités
          </label>

          <textarea
            id="allergies"
            name="allergies"
            defaultValue={profile.allergies}
            disabled={pending}
            maxLength={1000}
            rows={5}
            placeholder="Exemple : allergie au latex, sensibilité à certains produits…"
            aria-invalid={Boolean(state.fieldErrors.allergies?.length)}
            className={[
              "min-h-32 w-full resize-y rounded-2xl border bg-white px-4 py-3 text-sm leading-6 text-zinc-950 outline-none transition",
              "placeholder:text-zinc-400",
              "focus:border-rose-300 focus:ring-4 focus:ring-rose-100",
              "disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-500",
              state.fieldErrors.allergies?.length
                ? "border-red-300 ring-4 ring-red-50"
                : "border-zinc-200",
            ].join(" ")}
          />

          {state.fieldErrors.allergies?.[0] ? (
            <p className="flex items-start gap-2 text-sm text-red-600">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              {state.fieldErrors.allergies[0]}
            </p>
          ) : (
            <p className="text-xs leading-5 text-zinc-500">
              Ces informations seront visibles par le salon lors de la
              préparation de tes rendez-vous.
            </p>
          )}
        </div>
      </section>

      <section className="rounded-[28px] border border-zinc-200/80 bg-white p-5 shadow-[0_18px_55px_-35px_rgba(24,24,27,0.28)] sm:p-7">
        <SectionHeader
          icon={BellRing}
          title="Préférences de communication"
          description="Choisis comment recevoir les offres, nouveautés et actualités du Palais des Ongles."
        />

        <div className="mt-7 grid gap-4 md:grid-cols-2">
          <MarketingOption
            name="marketingEmail"
            defaultChecked={profile.marketingEmail}
            title="Actualités par e-mail"
            description="Recevoir les nouveautés, promotions et informations du salon par e-mail."
            icon={Mail}
            disabled={pending}
          />

          <MarketingOption
            name="marketingSms"
            defaultChecked={profile.marketingSms}
            title="Actualités par SMS"
            description="Recevoir ponctuellement les offres et informations importantes par SMS."
            icon={Phone}
            disabled={pending}
          />
        </div>
      </section>

      <div className="sticky bottom-4 z-10 flex justify-end rounded-[24px] border border-white/70 bg-white/85 p-3 shadow-xl shadow-zinc-950/10 backdrop-blur-xl">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 px-6 text-sm font-bold text-white shadow-lg shadow-rose-600/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {pending ? (
            <>
              <LoaderCircle className="size-4 animate-spin" />
              Enregistrement…
            </>
          ) : (
            <>
              <Save className="size-4" />
              Enregistrer mes informations
            </>
          )}
        </button>
      </div>
    </form>
  );
}
