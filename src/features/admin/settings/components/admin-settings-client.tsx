"use client";

import type {
  ReactNode,
} from "react";

import {
  useState,
  useTransition,
} from "react";

import {
  Bell,
  Building2,
  CalendarDays,
  Check,
  CreditCard,
  ExternalLink,
  FileText,
  Globe2,
  LoaderCircle,
  Mail,
  MapPin,
  Palette,
  RefreshCcw,
  Save,
  Settings2,
  Share2,
  ShieldCheck,
  Sparkles,
  WalletCards,
} from "lucide-react";

import {
  toast,
} from "sonner";

import {
  resetAdminSettingsAction,
  updateAdminSettingsAction,
} from "@/features/admin/settings/actions/admin-settings.actions";

import {
  AdminSiteImageField,
} from "@/features/admin/settings/components/admin-site-image-field";

import {
  DEFAULT_BOOKING_SETTINGS,
  DEFAULT_LEGAL_SETTINGS,
  DEFAULT_NOTIFICATION_SETTINGS,
  DEFAULT_PAYMENT_SETTINGS,
  DEFAULT_SALON_SETTINGS,
  DEFAULT_SOCIAL_SETTINGS,
  DEFAULT_WEBSITE_SETTINGS,
} from "@/features/admin/settings/constants/admin-settings.defaults";

import type {
  AdminSettingsData,
  AdminSettingsSection,
  BookingSettings,
  LegalSettings,
  NotificationSettings,
  PaymentSettings,
  SalonSettings,
  SocialSettings,
  WebsiteImageField,
  WebsiteImageUploadKeys,
  WebsiteSettings,
} from "@/features/admin/settings/types/admin-settings.types";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type AdminSettingsClientProps = {
  initialData: AdminSettingsData;
};

type TabDefinition = {
  id: AdminSettingsSection;
  label: string;
  description: string;
  icon: typeof Settings2;
};

/* -------------------------------------------------------------------------- */
/*                                CONSTANTES                                  */
/* -------------------------------------------------------------------------- */

const TABS: TabDefinition[] = [
  {
    id: "SALON",
    label: "Salon",
    description: "Identité et coordonnées",
    icon: Building2,
  },
  {
    id: "BOOKING",
    label: "Réservations",
    description: "Créneaux et règles",
    icon: CalendarDays,
  },
  {
    id: "PAYMENTS",
    label: "Paiements",
    description: "PayPal et acomptes",
    icon: CreditCard,
  },
  {
    id: "NOTIFICATIONS",
    label: "Notifications",
    description: "E-mails et rappels",
    icon: Bell,
  },
  {
    id: "WEBSITE",
    label: "Site internet",
    description: "Affichage et référencement",
    icon: Globe2,
  },
  {
    id: "SOCIAL",
    label: "Réseaux sociaux",
    description: "Liens externes",
    icon: Share2,
  },
  {
    id: "LEGAL",
    label: "Informations légales",
    description: "Entreprise et hébergeur",
    icon: FileText,
  },
];

/* -------------------------------------------------------------------------- */
/*                              COMPOSANTS UI                                 */
/* -------------------------------------------------------------------------- */

function SettingsCard({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[1.75rem] border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
      <header className="flex items-start gap-3">
        {icon ? (
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
            {icon}
          </div>
        ) : null}

        <div>
          <h2 className="text-lg font-black text-zinc-950">
            {title}
          </h2>

          {description ? (
            <p className="mt-1 text-sm leading-6 text-zinc-500">
              {description}
            </p>
          ) : null}
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
  errors: Record<string, string[]>;
}) {
  const messages =
    errors[name];

  if (
    !messages ||
    messages.length === 0
  ) {
    return null;
  }

  return (
    <p className="mt-1.5 text-xs font-semibold text-red-600">
      {messages[0]}
    </p>
  );
}

function TextField({
  label,
  value,
  onChange,
  name,
  errors,
  placeholder,
  type = "text",
  required = false,
  description,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  name: string;
  errors: Record<string, string[]>;
  placeholder?: string;
  type?: "text" | "email" | "tel" | "url" | "date";
  required?: boolean;
  description?: string;
}) {
  const hasError =
    Boolean(
      errors[name]?.length,
    );

  return (
    <label className="block">
      <span className="text-sm font-bold text-zinc-800">
        {label}

        {required ? (
          <span className="ml-1 text-rose-500">
            *
          </span>
        ) : null}
      </span>

      {description ? (
        <span className="mt-1 block text-xs leading-5 text-zinc-500">
          {description}
        </span>
      ) : null}

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        placeholder={placeholder}
        className={`mt-2 h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:ring-4 ${
          hasError
            ? "border-red-300 focus:border-red-400 focus:ring-red-100"
            : "border-zinc-200 focus:border-rose-400 focus:ring-rose-100"
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
  value,
  onChange,
  name,
  errors,
  minimum = 0,
  maximum,
  step = 1,
  description,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  name: string;
  errors: Record<string, string[]>;
  minimum?: number;
  maximum?: number;
  step?: number;
  description?: string;
  suffix?: string;
}) {
  const hasError =
    Boolean(
      errors[name]?.length,
    );

  return (
    <label className="block">
      <span className="text-sm font-bold text-zinc-800">
        {label}
      </span>

      {description ? (
        <span className="mt-1 block text-xs leading-5 text-zinc-500">
          {description}
        </span>
      ) : null}

      <div className="relative mt-2">
        <input
          type="number"
          min={minimum}
          max={maximum}
          step={step}
          value={value}
          onChange={(event) => {
            const nextValue =
              Number(
                event.target.value,
              );

            onChange(
              Number.isFinite(
                nextValue,
              )
                ? nextValue
                : 0,
            );
          }}
          className={`h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-zinc-950 outline-none transition focus:ring-4 ${
            suffix
              ? "pr-20"
              : ""
          } ${
            hasError
              ? "border-red-300 focus:border-red-400 focus:ring-red-100"
              : "border-zinc-200 focus:border-rose-400 focus:ring-rose-100"
          }`}
        />

        {suffix ? (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-semibold text-zinc-500">
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

function TextareaField({
  label,
  value,
  onChange,
  name,
  errors,
  placeholder,
  rows = 5,
  description,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  name: string;
  errors: Record<string, string[]>;
  placeholder?: string;
  rows?: number;
  description?: string;
}) {
  const hasError =
    Boolean(
      errors[name]?.length,
    );

  return (
    <label className="block">
      <span className="text-sm font-bold text-zinc-800">
        {label}
      </span>

      {description ? (
        <span className="mt-1 block text-xs leading-5 text-zinc-500">
          {description}
        </span>
      ) : null}

      <textarea
        value={value}
        rows={rows}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        placeholder={placeholder}
        className={`mt-2 w-full resize-y rounded-xl border bg-white px-3.5 py-3 text-sm leading-6 text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:ring-4 ${
          hasError
            ? "border-red-300 focus:border-red-400 focus:ring-red-100"
            : "border-zinc-200 focus:border-rose-400 focus:ring-rose-100"
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
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() =>
        onChange(
          !checked,
        )
      }
      className="flex w-full items-start justify-between gap-4 rounded-2xl border border-zinc-200 bg-white p-4 text-left transition hover:border-rose-200 hover:bg-rose-50/30"
    >
      <span>
        <span className="block text-sm font-bold text-zinc-900">
          {label}
        </span>

        <span className="mt-1 block text-xs leading-5 text-zinc-500">
          {description}
        </span>
      </span>

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
    </button>
  );
}

function ColorField({
  label,
  value,
  onChange,
  name,
  errors,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  name: string;
  errors: Record<string, string[]>;
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-zinc-800">
        {label}
      </span>

      <div className="mt-2 flex items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value,
            )
          }
          className="h-11 w-14 cursor-pointer rounded-xl border border-zinc-200 bg-white p-1"
        />

        <input
          type="text"
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value,
            )
          }
          className="h-11 min-w-0 flex-1 rounded-xl border border-zinc-200 px-3.5 text-sm font-semibold uppercase text-zinc-800 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
        />
      </div>

      <FieldError
        name={name}
        errors={errors}
      />
    </label>
  );
}

/* -------------------------------------------------------------------------- */
/*                             SECTION SALON                                  */
/* -------------------------------------------------------------------------- */

function SalonSection({
  value,
  onChange,
  errors,
}: {
  value: SalonSettings;
  onChange: (value: SalonSettings) => void;
  errors: Record<string, string[]>;
}) {
  function update<
    Key extends keyof SalonSettings,
  >(
    key: Key,
    nextValue: SalonSettings[Key],
  ): void {
    onChange({
      ...value,
      [key]: nextValue,
    });
  }

  return (
    <div className="space-y-6">
      <SettingsCard
        title="Identité du salon"
        description="Ces informations seront utilisées sur le site, les e-mails et les documents."
        icon={
          <Sparkles className="size-5" />
        }
      >
        <div className="grid gap-5 md:grid-cols-2">
          <TextField
            label="Nom commercial"
            value={value.name}
            onChange={(next) =>
              update(
                "name",
                next,
              )
            }
            name="name"
            errors={errors}
            required
          />

          <TextField
            label="Raison sociale"
            value={
              value.legalName
            }
            onChange={(next) =>
              update(
                "legalName",
                next,
              )
            }
            name="legalName"
            errors={errors}
            required
          />

          <div className="md:col-span-2">
            <TextField
              label="Slogan"
              value={
                value.tagline
              }
              onChange={(next) =>
                update(
                  "tagline",
                  next,
                )
              }
              name="tagline"
              errors={errors}
              placeholder="Sublimez vos ongles…"
            />
          </div>

          <div className="md:col-span-2">
            <TextareaField
              label="Présentation du salon"
              value={
                value.description
              }
              onChange={(next) =>
                update(
                  "description",
                  next,
                )
              }
              name="description"
              errors={errors}
            />
          </div>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Coordonnées"
        description="Informations affichées aux clientes."
        icon={
          <Mail className="size-5" />
        }
      >
        <div className="grid gap-5 md:grid-cols-2">
          <TextField
            label="Adresse e-mail"
            type="email"
            value={value.email}
            onChange={(next) =>
              update(
                "email",
                next,
              )
            }
            name="email"
            errors={errors}
            required
          />

          <TextField
            label="Téléphone"
            type="tel"
            value={value.phone}
            onChange={(next) =>
              update(
                "phone",
                next,
              )
            }
            name="phone"
            errors={errors}
          />

          <TextField
            label="Adresse"
            value={
              value.addressLine1
            }
            onChange={(next) =>
              update(
                "addressLine1",
                next,
              )
            }
            name="addressLine1"
            errors={errors}
          />

          <TextField
            label="Complément d’adresse"
            value={
              value.addressLine2
            }
            onChange={(next) =>
              update(
                "addressLine2",
                next,
              )
            }
            name="addressLine2"
            errors={errors}
          />

          <TextField
            label="Code postal"
            value={
              value.postalCode
            }
            onChange={(next) =>
              update(
                "postalCode",
                next,
              )
            }
            name="postalCode"
            errors={errors}
          />

          <TextField
            label="Ville"
            value={value.city}
            onChange={(next) =>
              update(
                "city",
                next,
              )
            }
            name="city"
            errors={errors}
          />

          <TextField
            label="Pays"
            value={value.country}
            onChange={(next) =>
              update(
                "country",
                next,
              )
            }
            name="country"
            errors={errors}
            required
          />
        </div>
      </SettingsCard>

      <SettingsCard
        title="Région et devise"
        icon={
          <MapPin className="size-5" />
        }
      >
        <div className="grid gap-5 md:grid-cols-3">
          <TextField
            label="Fuseau horaire"
            value={
              value.timezone
            }
            onChange={(next) =>
              update(
                "timezone",
                next,
              )
            }
            name="timezone"
            errors={errors}
            required
          />

          <TextField
            label="Langue"
            value={value.locale}
            onChange={(next) =>
              update(
                "locale",
                next,
              )
            }
            name="locale"
            errors={errors}
            required
          />

          <TextField
            label="Devise"
            value={
              value.currency
            }
            onChange={(next) =>
              update(
                "currency",
                next.toUpperCase(),
              )
            }
            name="currency"
            errors={errors}
            required
          />
        </div>
      </SettingsCard>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                          SECTION RÉSERVATIONS                              */
/* -------------------------------------------------------------------------- */

function BookingSection({
  value,
  onChange,
  errors,
}: {
  value: BookingSettings;
  onChange: (value: BookingSettings) => void;
  errors: Record<string, string[]>;
}) {
  function update<
    Key extends keyof BookingSettings,
  >(
    key: Key,
    nextValue: BookingSettings[Key],
  ): void {
    onChange({
      ...value,
      [key]: nextValue,
    });
  }

  return (
    <div className="space-y-6">
      <SettingsCard
        title="Réservation en ligne"
        description="Activez ou désactivez les fonctions accessibles aux clientes."
        icon={
          <CalendarDays className="size-5" />
        }
      >
        <div className="grid gap-3 lg:grid-cols-2">
          <ToggleField
            label="Réservation en ligne"
            description="Autoriser les clientes à prendre rendez-vous depuis le site."
            checked={
              value.onlineBookingEnabled
            }
            onChange={(next) =>
              update(
                "onlineBookingEnabled",
                next,
              )
            }
          />

          <ToggleField
            label="Compte client obligatoire"
            description="La cliente doit être connectée pour réserver."
            checked={
              value.requireClientAccount
            }
            onChange={(next) =>
              update(
                "requireClientAccount",
                next,
              )
            }
          />

          <ToggleField
            label="Confirmation automatique"
            description="Valider les nouvelles demandes sans action de l’administratrice."
            checked={
              value.autoConfirmAppointments
            }
            onChange={(next) =>
              update(
                "autoConfirmAppointments",
                next,
              )
            }
          />

          <ToggleField
            label="Téléphone obligatoire"
            description="Exiger un numéro de téléphone pendant la réservation."
            checked={
              value.requireClientPhone
            }
            onChange={(next) =>
              update(
                "requireClientPhone",
                next,
              )
            }
          />

          <ToggleField
            label="Photos de référence"
            description="Autoriser la cliente à joindre des inspirations."
            checked={
              value.allowAppointmentImages
            }
            onChange={(next) =>
              update(
                "allowAppointmentImages",
                next,
              )
            }
          />

          <ToggleField
            label="Annulation par la cliente"
            description="Autoriser l’annulation depuis l’espace client."
            checked={
              value.allowClientCancellation
            }
            onChange={(next) =>
              update(
                "allowClientCancellation",
                next,
              )
            }
          />
        </div>
      </SettingsCard>

      <SettingsCard
        title="Gestion des créneaux"
        description="Règles générales utilisées pour générer les disponibilités."
        icon={
          <Settings2 className="size-5" />
        }
      >
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <NumberField
            label="Délai minimum avant réservation"
            value={
              value.minimumAdvanceHours
            }
            onChange={(next) =>
              update(
                "minimumAdvanceHours",
                next,
              )
            }
            name="minimumAdvanceHours"
            errors={errors}
            suffix="heures"
          />

          <NumberField
            label="Réservation possible jusqu’à"
            value={
              value.maximumAdvanceDays
            }
            onChange={(next) =>
              update(
                "maximumAdvanceDays",
                next,
              )
            }
            name="maximumAdvanceDays"
            errors={errors}
            minimum={1}
            suffix="jours"
          />

          <NumberField
            label="Intervalle des créneaux"
            value={
              value.slotIntervalMinutes
            }
            onChange={(next) =>
              update(
                "slotIntervalMinutes",
                next,
              )
            }
            name="slotIntervalMinutes"
            errors={errors}
            minimum={5}
            suffix="minutes"
          />

          <NumberField
            label="Temps de nettoyage par défaut"
            value={
              value.defaultCleanupMinutes
            }
            onChange={(next) =>
              update(
                "defaultCleanupMinutes",
                next,
              )
            }
            name="defaultCleanupMinutes"
            errors={errors}
            suffix="minutes"
          />

          <NumberField
            label="Délai limite d’annulation"
            value={
              value.cancellationDeadlineHours
            }
            onChange={(next) =>
              update(
                "cancellationDeadlineHours",
                next,
              )
            }
            name="cancellationDeadlineHours"
            errors={errors}
            suffix="heures"
          />

          <NumberField
            label="Nombre maximal de photos"
            value={
              value.maximumAppointmentImages
            }
            onChange={(next) =>
              update(
                "maximumAppointmentImages",
                next,
              )
            }
            name="maximumAppointmentImages"
            errors={errors}
            minimum={1}
            maximum={20}
          />
        </div>
      </SettingsCard>

      <SettingsCard
        title="Acompte par défaut"
        description="Cette valeur pourra ensuite être personnalisée pour chaque prestation."
        icon={
          <WalletCards className="size-5" />
        }
      >
        <div className="grid gap-5 md:grid-cols-2">
          <ToggleField
            label="Acompte obligatoire"
            description="Demander un acompte lors d’une réservation standard."
            checked={
              value.defaultDepositRequired
            }
            onChange={(next) =>
              update(
                "defaultDepositRequired",
                next,
              )
            }
          />

          <NumberField
            label="Montant par défaut"
            value={
              value.defaultDepositCents /
              100
            }
            onChange={(next) =>
              update(
                "defaultDepositCents",
                Math.round(
                  next * 100,
                ),
              )
            }
            name="defaultDepositCents"
            errors={errors}
            step={0.01}
            suffix="€"
          />
        </div>
      </SettingsCard>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                            SECTION PAIEMENTS                               */
/* -------------------------------------------------------------------------- */

function PaymentsSection({
  value,
  onChange,
  errors,
  paypalStatus,
}: {
  value: PaymentSettings;
  onChange: (value: PaymentSettings) => void;
  errors: Record<string, string[]>;
  paypalStatus: AdminSettingsData["paypalStatus"];
}) {
  function update<
    Key extends keyof PaymentSettings,
  >(
    key: Key,
    nextValue: PaymentSettings[Key],
  ): void {
    onChange({
      ...value,
      [key]: nextValue,
    });
  }

  return (
    <div className="space-y-6">
      <SettingsCard
        title="État de PayPal"
        description="Les identifiants sensibles sont conservés uniquement dans les variables d’environnement."
        icon={
          <ShieldCheck className="size-5" />
        }
      >
        <div
          className={`rounded-2xl border p-5 ${
            paypalStatus.fullyConfigured
              ? "border-emerald-200 bg-emerald-50"
              : "border-amber-200 bg-amber-50"
          }`}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-black text-zinc-950">
                {paypalStatus.fullyConfigured
                  ? "PayPal est correctement configuré"
                  : "Configuration PayPal incomplète"}
              </p>

              <p className="mt-1 text-sm text-zinc-600">
                Environnement :{" "}
                <span className="font-bold">
                  {paypalStatus.environment}
                </span>
              </p>
            </div>

            <span
              className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-black ${
                paypalStatus.fullyConfigured
                  ? "bg-emerald-600 text-white"
                  : "bg-amber-600 text-white"
              }`}
            >
              {paypalStatus.fullyConfigured ? (
                <Check className="size-4" />
              ) : (
                <Settings2 className="size-4" />
              )}

              {paypalStatus.fullyConfigured
                ? "Opérationnel"
                : "À compléter"}
            </span>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              {
                label: "Client ID",
                configured:
                  paypalStatus.clientIdConfigured,
              },
              {
                label: "Client Secret",
                configured:
                  paypalStatus.clientSecretConfigured,
              },
              {
                label: "Webhook ID",
                configured:
                  paypalStatus.webhookIdConfigured,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl bg-white/80 p-3"
              >
                <p className="text-xs font-semibold text-zinc-500">
                  {item.label}
                </p>

                <p
                  className={`mt-1 text-sm font-black ${
                    item.configured
                      ? "text-emerald-700"
                      : "text-red-600"
                  }`}
                >
                  {item.configured
                    ? "Configuré"
                    : "Absent"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Modes de paiement"
        icon={
          <CreditCard className="size-5" />
        }
      >
        <div className="grid gap-3 lg:grid-cols-2">
          <ToggleField
            label="PayPal"
            description="Activer le paiement en ligne via PayPal."
            checked={
              value.paypalEnabled
            }
            onChange={(next) =>
              update(
                "paypalEnabled",
                next,
              )
            }
          />

          <ToggleField
            label="Espèces au salon"
            description="Autoriser le règlement du solde en espèces."
            checked={
              value.allowCashPayment
            }
            onChange={(next) =>
              update(
                "allowCashPayment",
                next,
              )
            }
          />

          <ToggleField
            label="Carte bancaire au salon"
            description="Afficher la carte bancaire comme moyen de paiement sur place."
            checked={
              value.allowCardPaymentAtSalon
            }
            onChange={(next) =>
              update(
                "allowCardPaymentAtSalon",
                next,
              )
            }
          />

          <ToggleField
            label="Paiement intégral en ligne"
            description="Permettre de régler la totalité avec PayPal."
            checked={
              value.allowFullOnlinePayment
            }
            onChange={(next) =>
              update(
                "allowFullOnlinePayment",
                next,
              )
            }
          />
        </div>
      </SettingsCard>

      <SettingsCard
        title="Acomptes"
        icon={
          <WalletCards className="size-5" />
        }
      >
        <div className="grid gap-5 lg:grid-cols-2">
          <ToggleField
            label="Activer les acomptes"
            description="Autoriser la perception d’un acompte en ligne."
            checked={
              value.depositEnabled
            }
            onChange={(next) =>
              update(
                "depositEnabled",
                next,
              )
            }
          />

          <ToggleField
            label="Obligatoire par défaut"
            description="Demander automatiquement l’acompte lors d’une réservation."
            checked={
              value.depositRequiredByDefault
            }
            onChange={(next) =>
              update(
                "depositRequiredByDefault",
                next,
              )
            }
          />

          <NumberField
            label="Montant de l’acompte"
            value={
              value.defaultDepositCents /
              100
            }
            onChange={(next) =>
              update(
                "defaultDepositCents",
                Math.round(
                  next * 100,
                ),
              )
            }
            name="defaultDepositCents"
            errors={errors}
            step={0.01}
            suffix="€"
          />
        </div>
      </SettingsCard>

      <SettingsCard
        title="Informations présentées aux clientes"
      >
        <div className="space-y-5">
          <TextareaField
            label="Politique de remboursement"
            value={
              value.refundPolicy
            }
            onChange={(next) =>
              update(
                "refundPolicy",
                next,
              )
            }
            name="refundPolicy"
            errors={errors}
          />

          <TextareaField
            label="Instructions de paiement"
            value={
              value.paymentInstructions
            }
            onChange={(next) =>
              update(
                "paymentInstructions",
                next,
              )
            }
            name="paymentInstructions"
            errors={errors}
          />
        </div>
      </SettingsCard>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                         SECTION NOTIFICATIONS                              */
/* -------------------------------------------------------------------------- */

function NotificationsSection({
  value,
  onChange,
  errors,
}: {
  value: NotificationSettings;
  onChange: (value: NotificationSettings) => void;
  errors: Record<string, string[]>;
}) {
  function update<
    Key extends keyof NotificationSettings,
  >(
    key: Key,
    nextValue: NotificationSettings[Key],
  ): void {
    onChange({
      ...value,
      [key]: nextValue,
    });
  }

  return (
    <div className="space-y-6">
      <SettingsCard
        title="Envoi des e-mails"
        icon={
          <Mail className="size-5" />
        }
      >
        <ToggleField
          label="Activer les e-mails automatiques"
          description="Désactiver cette option suspendra les e-mails envoyés par le site."
          checked={
            value.emailsEnabled
          }
          onChange={(next) =>
            update(
              "emailsEnabled",
              next,
            )
          }
        />

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <TextField
            label="Adresse de notification administrateur"
            type="email"
            value={
              value.adminNotificationEmail
            }
            onChange={(next) =>
              update(
                "adminNotificationEmail",
                next,
              )
            }
            name="adminNotificationEmail"
            errors={errors}
            required
          />

          <TextField
            label="Adresse de réponse"
            type="email"
            value={
              value.replyToEmail
            }
            onChange={(next) =>
              update(
                "replyToEmail",
                next,
              )
            }
            name="replyToEmail"
            errors={errors}
            required
          />
        </div>
      </SettingsCard>

      <SettingsCard
        title="Rendez-vous"
        description="Choisissez les événements qui déclenchent une notification."
        icon={
          <CalendarDays className="size-5" />
        }
      >
        <div className="grid gap-3 lg:grid-cols-2">
          <ToggleField
            label="Nouvelle demande — administratrice"
            description="Prévenir l’administratrice à chaque réservation."
            checked={
              value.notifyAdminOnAppointmentCreated
            }
            onChange={(next) =>
              update(
                "notifyAdminOnAppointmentCreated",
                next,
              )
            }
          />

          <ToggleField
            label="Nouvelle demande — cliente"
            description="Confirmer la réception de la demande."
            checked={
              value.notifyClientOnAppointmentCreated
            }
            onChange={(next) =>
              update(
                "notifyClientOnAppointmentCreated",
                next,
              )
            }
          />

          <ToggleField
            label="Rendez-vous confirmé"
            description="Prévenir la cliente après confirmation."
            checked={
              value.notifyClientOnAppointmentConfirmed
            }
            onChange={(next) =>
              update(
                "notifyClientOnAppointmentConfirmed",
                next,
              )
            }
          />

          <ToggleField
            label="Rendez-vous refusé"
            description="Prévenir la cliente après un refus."
            checked={
              value.notifyClientOnAppointmentRefused
            }
            onChange={(next) =>
              update(
                "notifyClientOnAppointmentRefused",
                next,
              )
            }
          />

          <ToggleField
            label="Rendez-vous annulé"
            description="Prévenir la cliente lors d’une annulation."
            checked={
              value.notifyClientOnAppointmentCancelled
            }
            onChange={(next) =>
              update(
                "notifyClientOnAppointmentCancelled",
                next,
              )
            }
          />

          <ToggleField
            label="Nouveau message"
            description="Prévenir l’administratrice d’un nouveau message client."
            checked={
              value.notifyAdminOnNewMessage
            }
            onChange={(next) =>
              update(
                "notifyAdminOnNewMessage",
                next,
              )
            }
          />
        </div>
      </SettingsCard>

      <SettingsCard
        title="Automatisations"
        icon={
          <Bell className="size-5" />
        }
      >
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="space-y-4">
            <ToggleField
              label="Rappel de rendez-vous"
              description="Envoyer un rappel avant le rendez-vous."
              checked={
                value.appointmentReminderEnabled
              }
              onChange={(next) =>
                update(
                  "appointmentReminderEnabled",
                  next,
                )
              }
            />

            <NumberField
              label="Délai avant le rendez-vous"
              value={
                value.appointmentReminderHoursBefore
              }
              onChange={(next) =>
                update(
                  "appointmentReminderHoursBefore",
                  next,
                )
              }
              name="appointmentReminderHoursBefore"
              errors={errors}
              minimum={1}
              suffix="heures"
            />
          </div>

          <div className="space-y-4">
            <ToggleField
              label="Demande d’avis"
              description="Demander automatiquement un avis après la prestation."
              checked={
                value.reviewRequestEnabled
              }
              onChange={(next) =>
                update(
                  "reviewRequestEnabled",
                  next,
                )
              }
            />

            <NumberField
              label="Délai après la prestation"
              value={
                value.reviewRequestHoursAfter
              }
              onChange={(next) =>
                update(
                  "reviewRequestHoursAfter",
                  next,
                )
              }
              name="reviewRequestHoursAfter"
              errors={errors}
              minimum={1}
              suffix="heures"
            />
          </div>
        </div>

        <div className="mt-5">
          <ToggleField
            label="Prévenir lors d’un nouvel avis"
            description="Créer une notification administrateur lorsqu’un avis est déposé."
            checked={
              value.notifyAdminOnNewReview
            }
            onChange={(next) =>
              update(
                "notifyAdminOnNewReview",
                next,
              )
            }
          />
        </div>
      </SettingsCard>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                           SECTION SITE INTERNET                            */
/* -------------------------------------------------------------------------- */

function WebsiteSection({
  value,
  onChange,
  uploadKeys,
  onUploadKeysChange,
  errors,
}: {
  value:
    WebsiteSettings;

  onChange:
    (
      value:
        WebsiteSettings,
    ) => void;

  uploadKeys:
    WebsiteImageUploadKeys;

  onUploadKeysChange:
    (
      value:
        WebsiteImageUploadKeys,
    ) => void;

  errors:
    Record<
      string,
      string[]
    >;
}) {
  type WebsiteImageChange = {
    url:
      string;

    uploadKey:
      string |
      null;
  };

  function update<
    Key extends keyof WebsiteSettings,
  >(
    key:
      Key,

    nextValue:
      | WebsiteSettings[Key]
      | WebsiteImageChange,
  ): void {
    /*
     * Tous les champs classiques fournissent une
     * chaîne ou un booléen.
     *
     * Les champs AdminSiteImageField fournissent
     * un objet contenant l’URL de prévisualisation
     * et la clé UploadThing fiable.
     */
    if (
      typeof nextValue ===
        "object" &&
      nextValue !==
        null &&
      "url" in
        nextValue
    ) {
      const imageField =
        key as WebsiteImageField;

      onChange({
        ...value,

        [imageField]:
          nextValue.url,
      });

      const nextUploadKeys = {
        ...uploadKeys,
      };

      if (
        nextValue.uploadKey
      ) {
        nextUploadKeys[
          imageField
        ] =
          nextValue.uploadKey;
      } else {
        delete nextUploadKeys[
          imageField
        ];
      }

      onUploadKeysChange(
        nextUploadKeys,
      );

      return;
    }

    onChange({
      ...value,

      [key]:
        nextValue as
          WebsiteSettings[Key],
    });
  }

  return (
    <div className="space-y-6">
      <SettingsCard
        title="Identité du site"
        icon={
          <Globe2 className="size-5" />
        }
      >
        <div className="grid gap-5 md:grid-cols-2">
          <TextField
            label="Titre du site"
            value={
              value.siteTitle
            }
            onChange={(next) =>
              update(
                "siteTitle",
                next,
              )
            }
            name="siteTitle"
            errors={errors}
            required
          />

          <AdminSiteImageField
            label="Logo du site"
            description="Logo principal affiché dans l’en-tête et les communications."
            value={
              value.logoUrl
            }
            onChange={(next) =>
              update(
                "logoUrl",
                next,
              )
            }
            name="logoUrl"
            errors={
              errors
            }
            format="WIDE"
            recommendedSize="800 × 300 px, fond transparent conseillé"
          />

          <AdminSiteImageField
            label="Favicon"
            description="Petite icône affichée dans l’onglet du navigateur."
            value={
              value.faviconUrl
            }
            onChange={(next) =>
              update(
                "faviconUrl",
                next,
              )
            }
            name="faviconUrl"
            errors={
              errors
            }
            format="SQUARE"
            recommendedSize="512 × 512 px"
          />

          <div className="md:col-span-2">
            <TextareaField
              label="Description du site"
              value={
                value.siteDescription
              }
              onChange={(next) =>
                update(
                  "siteDescription",
                  next,
                )
              }
              name="siteDescription"
              errors={errors}
              rows={4}
            />
          </div>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Images principales"
        description="Ces images sont utilisées sur l’accueil, les prestations et lors du partage du site."
        icon={
          <Palette className="size-5" />
        }
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <AdminSiteImageField
            label="Image principale de l’accueil"
            description="Grande image affichée dans le bloc d’introduction de la page d’accueil."
            value={
              value.homeHeroImageUrl
            }
            onChange={(next) =>
              update(
                "homeHeroImageUrl",
                next,
              )
            }
            name="homeHeroImageUrl"
            errors={
              errors
            }
            format="PORTRAIT"
            recommendedSize="1200 × 1500 px"
          />

          <AdminSiteImageField
            label="Image mobile de l’accueil"
            description="Version verticale optimisée pour les téléphones. L’image principale sera utilisée lorsqu’elle est vide."
            value={
              value.homeHeroMobileImageUrl
            }
            onChange={(next) =>
              update(
                "homeHeroMobileImageUrl",
                next,
              )
            }
            name="homeHeroMobileImageUrl"
            errors={
              errors
            }
            format="PORTRAIT"
            recommendedSize="900 × 1200 px"
          />

          <div className="lg:col-span-2">
            <AdminSiteImageField
              label="Image du bloc de réservation"
              description="Illustration du bloc invitant les clientes à prendre rendez-vous."
              value={
                value.bookingCtaImageUrl
              }
              onChange={(next) =>
                update(
                  "bookingCtaImageUrl",
                  next,
                )
              }
              name="bookingCtaImageUrl"
              errors={
                errors
              }
              format="WIDE"
              recommendedSize="1600 × 900 px"
            />
          </div>

          <AdminSiteImageField
            label="Image par défaut des prestations"
            description="Utilisée lorsqu’une prestation ne possède aucune image."
            value={
              value.defaultServiceImageUrl
            }
            onChange={(next) =>
              update(
                "defaultServiceImageUrl",
                next,
              )
            }
            name="defaultServiceImageUrl"
            errors={
              errors
            }
            format="WIDE"
            recommendedSize="1200 × 800 px"
          />

          <AdminSiteImageField
            label="Image de partage social"
            description="Affichée lors du partage du site sur les réseaux sociaux et les messageries."
            value={
              value.socialShareImageUrl
            }
            onChange={(next) =>
              update(
                "socialShareImageUrl",
                next,
              )
            }
            name="socialShareImageUrl"
            errors={
              errors
            }
            format="WIDE"
            recommendedSize="1200 × 630 px"
          />
        </div>
      </SettingsCard>

      <SettingsCard
        title="Sections visibles"
        description="Masquer une section ne supprime aucune donnée."
        icon={
          <ExternalLink className="size-5" />
        }
      >
        <div className="grid gap-3 lg:grid-cols-2">
          <ToggleField
            label="Prestations"
            description="Afficher le catalogue public des prestations."
            checked={
              value.showServices
            }
            onChange={(next) =>
              update(
                "showServices",
                next,
              )
            }
          />

          <ToggleField
            label="Galerie"
            description="Afficher les créations publiées."
            checked={
              value.showGallery
            }
            onChange={(next) =>
              update(
                "showGallery",
                next,
              )
            }
          />

          <ToggleField
            label="Avis"
            description="Afficher les avis clients approuvés."
            checked={
              value.showReviews
            }
            onChange={(next) =>
              update(
                "showReviews",
                next,
              )
            }
          />

          <ToggleField
            label="Promotions"
            description="Afficher les offres promotionnelles actives."
            checked={
              value.showPromotions
            }
            onChange={(next) =>
              update(
                "showPromotions",
                next,
              )
            }
          />

          <ToggleField
            label="Concours"
            description="Afficher les jeux concours publics."
            checked={
              value.showContests
            }
            onChange={(next) =>
              update(
                "showContests",
                next,
              )
            }
          />

          <ToggleField
            label="Programme fidélité"
            description="Afficher le Club VIP aux clientes."
            checked={
              value.showVipProgram
            }
            onChange={(next) =>
              update(
                "showVipProgram",
                next,
              )
            }
          />

          <ToggleField
            label="Mode maintenance"
            description="Rendre temporairement les pages publiques indisponibles."
            checked={
              value.maintenanceMode
            }
            onChange={(next) =>
              update(
                "maintenanceMode",
                next,
              )
            }
          />
        </div>
      </SettingsCard>

      <SettingsCard
        title="Couleurs"
        icon={
          <Palette className="size-5" />
        }
      >
        <div className="grid gap-5 md:grid-cols-3">
          <ColorField
            label="Couleur principale"
            value={
              value.primaryColor
            }
            onChange={(next) =>
              update(
                "primaryColor",
                next,
              )
            }
            name="primaryColor"
            errors={errors}
          />

          <ColorField
            label="Couleur secondaire"
            value={
              value.secondaryColor
            }
            onChange={(next) =>
              update(
                "secondaryColor",
                next,
              )
            }
            name="secondaryColor"
            errors={errors}
          />

          <ColorField
            label="Couleur d’accent"
            value={
              value.accentColor
            }
            onChange={(next) =>
              update(
                "accentColor",
                next,
              )
            }
            name="accentColor"
            errors={errors}
          />
        </div>
      </SettingsCard>

      <SettingsCard
        title="Référencement naturel"
        description="Informations utilisées par les moteurs de recherche."
      >
        <div className="space-y-5">
          <TextField
            label="Titre SEO"
            value={value.seoTitle}
            onChange={(next) =>
              update(
                "seoTitle",
                next,
              )
            }
            name="seoTitle"
            errors={errors}
          />

          <TextareaField
            label="Description SEO"
            value={
              value.seoDescription
            }
            onChange={(next) =>
              update(
                "seoDescription",
                next,
              )
            }
            name="seoDescription"
            errors={errors}
            rows={4}
          />

          <TextField
            label="Mots-clés"
            value={
              value.seoKeywords
            }
            onChange={(next) =>
              update(
                "seoKeywords",
                next,
              )
            }
            name="seoKeywords"
            errors={errors}
            description="Séparez les mots-clés avec des virgules."
          />
        </div>
      </SettingsCard>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                         SECTION RÉSEAUX SOCIAUX                            */
/* -------------------------------------------------------------------------- */

function SocialSection({
  value,
  onChange,
  errors,
}: {
  value: SocialSettings;
  onChange: (value: SocialSettings) => void;
  errors: Record<string, string[]>;
}) {
  function update<
    Key extends keyof SocialSettings,
  >(
    key: Key,
    nextValue: SocialSettings[Key],
  ): void {
    onChange({
      ...value,
      [key]: nextValue,
    });
  }

  const networks = [
    {
      label: "Instagram",
      urlKey:
        "instagramUrl" as const,
      enabledKey:
        "showInstagram" as const,
    },
    {
      label: "Facebook",
      urlKey:
        "facebookUrl" as const,
      enabledKey:
        "showFacebook" as const,
    },
    {
      label: "TikTok",
      urlKey:
        "tiktokUrl" as const,
      enabledKey:
        "showTiktok" as const,
    },
    {
      label: "Pinterest",
      urlKey:
        "pinterestUrl" as const,
      enabledKey:
        "showPinterest" as const,
    },
    {
      label: "Google Business",
      urlKey:
        "googleBusinessUrl" as const,
      enabledKey:
        "showGoogleBusiness" as const,
    },
  ];

  return (
    <div className="space-y-6">
      <SettingsCard
        title="Réseaux sociaux"
        description="Ajoutez les liens à afficher sur le site."
        icon={
          <Share2 className="size-5" />
        }
      >
        <div className="space-y-5">
          {networks.map(
            (network) => (
              <div
                key={
                  network.urlKey
                }
                className="grid gap-3 rounded-2xl border border-zinc-200 p-4 lg:grid-cols-[1fr_300px]"
              >
                <TextField
                  label={
                    network.label
                  }
                  type="url"
                  value={
                    value[
                      network.urlKey
                    ]
                  }
                  onChange={(next) =>
                    update(
                      network.urlKey,
                      next,
                    )
                  }
                  name={
                    network.urlKey
                  }
                  errors={errors}
                  placeholder="https://..."
                />

                <ToggleField
                  label="Afficher sur le site"
                  description={`Rendre le lien ${network.label} visible.`}
                  checked={
                    value[
                      network.enabledKey
                    ]
                  }
                  onChange={(next) =>
                    update(
                      network.enabledKey,
                      next,
                    )
                  }
                />
              </div>
            ),
          )}
        </div>
      </SettingsCard>

      <SettingsCard
        title="Avis Google et WhatsApp"
      >
        <div className="space-y-5">
          <TextField
            label="Lien pour déposer un avis Google"
            type="url"
            value={
              value.googleReviewUrl
            }
            onChange={(next) =>
              update(
                "googleReviewUrl",
                next,
              )
            }
            name="googleReviewUrl"
            errors={errors}
          />

          <div className="grid gap-3 rounded-2xl border border-zinc-200 p-4 lg:grid-cols-[1fr_300px]">
            <TextField
              label="Numéro WhatsApp"
              type="tel"
              value={
                value.whatsappNumber
              }
              onChange={(next) =>
                update(
                  "whatsappNumber",
                  next,
                )
              }
              name="whatsappNumber"
              errors={errors}
              placeholder="+33..."
            />

            <ToggleField
              label="Afficher WhatsApp"
              description="Afficher un accès rapide vers WhatsApp."
              checked={
                value.showWhatsapp
              }
              onChange={(next) =>
                update(
                  "showWhatsapp",
                  next,
                )
              }
            />
          </div>
        </div>
      </SettingsCard>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                           SECTION INFORMATIONS LÉGALES                     */
/* -------------------------------------------------------------------------- */

function LegalSection({
  value,
  onChange,
  errors,
}: {
  value: LegalSettings;
  onChange: (value: LegalSettings) => void;
  errors: Record<string, string[]>;
}) {
  function update<
    Key extends keyof LegalSettings,
  >(
    key: Key,
    nextValue: LegalSettings[Key],
  ): void {
    onChange({
      ...value,
      [key]: nextValue,
    });
  }

  return (
    <div className="space-y-6">
      <SettingsCard
        title="Entreprise"
        icon={
          <Building2 className="size-5" />
        }
      >
        <div className="grid gap-5 md:grid-cols-2">
          <TextField
            label="Nom de la responsable"
            value={
              value.businessOwnerName
            }
            onChange={(next) =>
              update(
                "businessOwnerName",
                next,
              )
            }
            name="businessOwnerName"
            errors={errors}
          />

          <TextField
            label="Nom légal de l’entreprise"
            value={
              value.businessLegalName
            }
            onChange={(next) =>
              update(
                "businessLegalName",
                next,
              )
            }
            name="businessLegalName"
            errors={errors}
            required
          />

          <TextField
            label="Statut juridique"
            value={
              value.legalStatus
            }
            onChange={(next) =>
              update(
                "legalStatus",
                next,
              )
            }
            name="legalStatus"
            errors={errors}
          />

          <TextField
            label="Numéro de TVA"
            value={
              value.vatNumber
            }
            onChange={(next) =>
              update(
                "vatNumber",
                next,
              )
            }
            name="vatNumber"
            errors={errors}
          />

          <TextField
            label="SIRET"
            value={value.siret}
            onChange={(next) =>
              update(
                "siret",
                next,
              )
            }
            name="siret"
            errors={errors}
          />

          <TextField
            label="SIREN"
            value={value.siren}
            onChange={(next) =>
              update(
                "siren",
                next,
              )
            }
            name="siren"
            errors={errors}
          />

          <div className="md:col-span-2">
            <TextareaField
              label="Adresse du siège"
              value={
                value.registeredAddress
              }
              onChange={(next) =>
                update(
                  "registeredAddress",
                  next,
                )
              }
              name="registeredAddress"
              errors={errors}
              rows={3}
            />
          </div>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Publication et confidentialité"
        icon={
          <ShieldCheck className="size-5" />
        }
      >
        <div className="grid gap-5 md:grid-cols-2">
          <TextField
            label="Directrice de publication"
            value={
              value.publicationDirector
            }
            onChange={(next) =>
              update(
                "publicationDirector",
                next,
              )
            }
            name="publicationDirector"
            errors={errors}
          />

          <TextField
            label="Contact confidentialité"
            type="email"
            value={
              value.privacyContactEmail
            }
            onChange={(next) =>
              update(
                "privacyContactEmail",
                next,
              )
            }
            name="privacyContactEmail"
            errors={errors}
            required
          />

          <TextField
            label="Dernière mise à jour des CGV"
            type="date"
            value={
              value.termsUpdatedAt
            }
            onChange={(next) =>
              update(
                "termsUpdatedAt",
                next,
              )
            }
            name="termsUpdatedAt"
            errors={errors}
          />

          <TextField
            label="Dernière mise à jour de la confidentialité"
            type="date"
            value={
              value.privacyPolicyUpdatedAt
            }
            onChange={(next) =>
              update(
                "privacyPolicyUpdatedAt",
                next,
              )
            }
            name="privacyPolicyUpdatedAt"
            errors={errors}
          />
        </div>
      </SettingsCard>

      <SettingsCard
        title="Hébergeur"
        icon={
          <Globe2 className="size-5" />
        }
      >
        <div className="grid gap-5 md:grid-cols-2">
          <TextField
            label="Nom de l’hébergeur"
            value={
              value.hostingProviderName
            }
            onChange={(next) =>
              update(
                "hostingProviderName",
                next,
              )
            }
            name="hostingProviderName"
            errors={errors}
          />

          <TextField
            label="Téléphone de l’hébergeur"
            type="tel"
            value={
              value.hostingProviderPhone
            }
            onChange={(next) =>
              update(
                "hostingProviderPhone",
                next,
              )
            }
            name="hostingProviderPhone"
            errors={errors}
          />

          <div className="md:col-span-2">
            <TextareaField
              label="Adresse de l’hébergeur"
              value={
                value.hostingProviderAddress
              }
              onChange={(next) =>
                update(
                  "hostingProviderAddress",
                  next,
                )
              }
              name="hostingProviderAddress"
              errors={errors}
              rows={3}
            />
          </div>
        </div>
      </SettingsCard>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 COMPOSANT                                  */
/* -------------------------------------------------------------------------- */

export function AdminSettingsClient({
  initialData,
}: AdminSettingsClientProps) {
  const [
    activeSection,
    setActiveSection,
  ] =
    useState<AdminSettingsSection>(
      "SALON",
    );

  const [
    salon,
    setSalon,
  ] =
    useState<SalonSettings>(
      initialData.salon,
    );

  const [
    booking,
    setBooking,
  ] =
    useState<BookingSettings>(
      initialData.booking,
    );

  const [
    payments,
    setPayments,
  ] =
    useState<PaymentSettings>(
      initialData.payments,
    );

  const [
    notifications,
    setNotifications,
  ] =
    useState<NotificationSettings>(
      initialData.notifications,
    );

  const [
    website,
    setWebsite,
  ] =
    useState<WebsiteSettings>(
      initialData.website,
    );

  /*
   * Ces clés restent uniquement dans le navigateur
   * jusqu’à la prochaine sauvegarde réussie.
   */
  const [
    websiteImageUploadKeys,
    setWebsiteImageUploadKeys,
  ] =
    useState<WebsiteImageUploadKeys>(
      {},
    );

  const [
    social,
    setSocial,
  ] =
    useState<SocialSettings>(
      initialData.social,
    );

  const [
    legal,
    setLegal,
  ] =
    useState<LegalSettings>(
      initialData.legal,
    );

  const [
    fieldErrors,
    setFieldErrors,
  ] = useState<
    Record<string, string[]>
  >({});

  const [
    isPending,
    startTransition,
  ] = useTransition();

  function getPayload(
    section: AdminSettingsSection,
  ): unknown {
    switch (section) {
      case "SALON":
        return salon;

      case "BOOKING":
        return booking;

      case "PAYMENTS":
        return payments;

      case "NOTIFICATIONS":
        return notifications;

      case "WEBSITE":
        return {
          ...website,

          imageUploadKeys:
            websiteImageUploadKeys,
        };

      case "SOCIAL":
        return social;

      case "LEGAL":
        return legal;
    }
  }

  function applyDefaults(
    section: AdminSettingsSection,
  ): void {
    switch (section) {
      case "SALON":
        setSalon(
          structuredClone(
            DEFAULT_SALON_SETTINGS,
          ),
        );
        break;

      case "BOOKING":
        setBooking(
          structuredClone(
            DEFAULT_BOOKING_SETTINGS,
          ),
        );
        break;

      case "PAYMENTS":
        setPayments(
          structuredClone(
            DEFAULT_PAYMENT_SETTINGS,
          ),
        );
        break;

      case "NOTIFICATIONS":
        setNotifications(
          structuredClone(
            DEFAULT_NOTIFICATION_SETTINGS,
          ),
        );
        break;

      case "WEBSITE":
        setWebsite(
          structuredClone(
            DEFAULT_WEBSITE_SETTINGS,
          ),
        );

        setWebsiteImageUploadKeys(
          {},
        );

        break;

      case "SOCIAL":
        setSocial(
          structuredClone(
            DEFAULT_SOCIAL_SETTINGS,
          ),
        );
        break;

      case "LEGAL":
        setLegal(
          structuredClone(
            DEFAULT_LEGAL_SETTINGS,
          ),
        );
        break;
    }
  }

  function saveCurrentSection():
    void {
    setFieldErrors({});

    startTransition(() => {
      void (async () => {
        const result =
          await updateAdminSettingsAction(
            activeSection,
            getPayload(
              activeSection,
            ),
          );

        if (
          !result.success
        ) {
          setFieldErrors(
            result.fieldErrors ??
              {},
          );

          toast.error(
            result.message,
          );

          return;
        }

        if (
          activeSection ===
          "WEBSITE"
        ) {
          /*
           * Les clés ont été revendiquées côté serveur.
           * Elles ne doivent plus être renvoyées lors
           * d’une sauvegarde ultérieure.
           */
          setWebsiteImageUploadKeys(
            {},
          );
        }

        toast.success(
          result.message,
        );
      })();
    });
  }

  function resetCurrentSection():
    void {
    const confirmed =
      window.confirm(
        "Restaurer les valeurs par défaut de cette section ?",
      );

    if (!confirmed) {
      return;
    }

    setFieldErrors({});

    startTransition(() => {
      void (async () => {
        const result =
          await resetAdminSettingsAction(
            activeSection,
          );

        if (
          !result.success
        ) {
          toast.error(
            result.message,
          );

          return;
        }

        applyDefaults(
          activeSection,
        );

        toast.success(
          result.message,
        );
      })();
    });
  }

  function renderSection():
    ReactNode {
    switch (
      activeSection
    ) {
      case "SALON":
        return (
          <SalonSection
            value={salon}
            onChange={setSalon}
            errors={fieldErrors}
          />
        );

      case "BOOKING":
        return (
          <BookingSection
            value={booking}
            onChange={setBooking}
            errors={fieldErrors}
          />
        );

      case "PAYMENTS":
        return (
          <PaymentsSection
            value={payments}
            onChange={setPayments}
            errors={fieldErrors}
            paypalStatus={
              initialData.paypalStatus
            }
          />
        );

      case "NOTIFICATIONS":
        return (
          <NotificationsSection
            value={
              notifications
            }
            onChange={
              setNotifications
            }
            errors={fieldErrors}
          />
        );

      case "WEBSITE":
        return (
          <WebsiteSection
            value={
              website
            }
            onChange={
              setWebsite
            }
            uploadKeys={
              websiteImageUploadKeys
            }
            onUploadKeysChange={
              setWebsiteImageUploadKeys
            }
            errors={
              fieldErrors
            }
          />
        );

      case "SOCIAL":
        return (
          <SocialSection
            value={social}
            onChange={setSocial}
            errors={fieldErrors}
          />
        );

      case "LEGAL":
        return (
          <LegalSection
            value={legal}
            onChange={setLegal}
            errors={fieldErrors}
          />
        );
    }
  }

  const activeTab =
    TABS.find(
      (tab) =>
        tab.id ===
        activeSection,
    ) ?? TABS[0];

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">
        <section className="relative overflow-hidden rounded-[2rem] bg-zinc-950 px-6 py-7 text-white shadow-xl sm:px-8 lg:px-10">
          <div className="absolute -right-16 -top-20 size-64 rounded-full bg-rose-500/20 blur-3xl" />

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-rose-100">
                <Settings2 className="size-4" />

                Administration
              </div>

              <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                Paramètres du salon
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-300">
                Configurez le salon, les réservations, PayPal, les notifications et les informations publiques du site.
              </p>
            </div>

            {initialData.updatedAt ? (
              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-xs text-zinc-300">
                Dernière modification
                <span className="mt-1 block font-bold text-white">
                  {new Intl.DateTimeFormat(
                    "fr-FR",
                    {
                      dateStyle:
                        "medium",

                      timeStyle:
                        "short",
                    },
                  ).format(
                    new Date(
                      initialData.updatedAt,
                    ),
                  )}
                </span>
              </div>
            ) : null}
          </div>
        </section>

        <div className="mt-6 grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="h-fit rounded-[1.75rem] border border-zinc-200 bg-white p-3 shadow-sm xl:sticky xl:top-6">
            <nav className="space-y-1.5">
              {TABS.map(
                (tab) => {
                  const Icon =
                    tab.icon;

                  const active =
                    tab.id ===
                    activeSection;

                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setActiveSection(
                          tab.id,
                        );

                        setFieldErrors(
                          {},
                        );
                      }}
                      className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${
                        active
                          ? "bg-rose-600 text-white shadow-md shadow-rose-200"
                          : "text-zinc-700 hover:bg-zinc-100"
                      }`}
                    >
                      <span
                        className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
                          active
                            ? "bg-white/15"
                            : "bg-zinc-100 text-zinc-500"
                        }`}
                      >
                        <Icon className="size-5" />
                      </span>

                      <span className="min-w-0">
                        <span className="block text-sm font-black">
                          {tab.label}
                        </span>

                        <span
                          className={`mt-0.5 block truncate text-xs ${
                            active
                              ? "text-rose-100"
                              : "text-zinc-500"
                          }`}
                        >
                          {tab.description}
                        </span>
                      </span>
                    </button>
                  );
                },
              )}
            </nav>
          </aside>

          <div className="min-w-0">
            <header className="mb-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-rose-500">
                Configuration
              </p>

              <h2 className="mt-1 text-2xl font-black text-zinc-950">
                {activeTab.label}
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                {activeTab.description}
              </p>
            </header>

            {renderSection()}

            <footer className="sticky bottom-4 z-20 mt-6 flex flex-col gap-3 rounded-[1.5rem] border border-zinc-200 bg-white/95 p-4 shadow-xl backdrop-blur sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={
                  resetCurrentSection
                }
                disabled={isPending}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-zinc-200 px-4 text-sm font-bold text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCcw className="size-4" />

                Restaurer par défaut
              </button>

              <button
                type="button"
                onClick={
                  saveCurrentSection
                }
                disabled={isPending}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-rose-600 px-6 text-sm font-black text-white shadow-lg shadow-rose-200 transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}

                {isPending
                  ? "Enregistrement..."
                  : "Enregistrer les paramètres"}
              </button>
            </footer>
          </div>
        </div>
      </div>
    </main>
  );
}
