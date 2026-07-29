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
  Activity,
  BellRing,
  CheckCircle2,
  Coins,
  LoaderCircle,
  Save,
  Settings2,
  ShieldAlert,
  Sparkles,
  WalletCards,
} from "lucide-react";

import {
  toast,
} from "sonner";

import {
  updateAdminVipAppointmentRulesAction,
} from "@/features/admin/vip/actions/admin-vip-appointment-rules.actions";

import type {
  AdminVipAppointmentRulesSettings,
} from "@/features/admin/vip/types/admin-vip-appointment-rules.types";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type AdminVipAppointmentRulesManagerProps = {
  settings: AdminVipAppointmentRulesSettings;
};

type FormState = {
  pointsRuleEnabled: boolean;
  pointsPerEuro: string;

  xpRuleEnabled: boolean;
  xpPerCompletedAppointment: string;

  minimumSpendEuros: string;
  onlyPaidAppointments: boolean;
};

type FieldErrors =
  Record<
    string,
    string[]
  >;

/* -------------------------------------------------------------------------- */
/*                                  OUTILS                                    */
/* -------------------------------------------------------------------------- */

function formatDate(
  value: string | null,
): string {
  if (!value) {
    return "Jamais exécutée";
  }

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

function formatDecimalInput(
  value: number,
): string {
  return String(
    value,
  ).replace(
    ".",
    ",",
  );
}

function parseFrenchNumber(
  value: string,
): number {
  return Number(
    value
      .trim()
      .replace(
        ",",
        ".",
      ),
  );
}

function getInitialState(
  settings: AdminVipAppointmentRulesSettings,
): FormState {
  return {
    pointsRuleEnabled:
      settings.pointsRule.enabled,

    pointsPerEuro:
      String(
        settings.pointsRule
          .pointsPerEuro,
      ),

    xpRuleEnabled:
      settings.xpRule.enabled,

    xpPerCompletedAppointment:
      String(
        settings.xpRule
          .xpPerCompletedAppointment,
      ),

    minimumSpendEuros:
      settings.minimumSpendCents ===
      null
        ? ""
        : formatDecimalInput(
            settings.minimumSpendCents /
              100,
          ),

    onlyPaidAppointments:
      settings.onlyPaidAppointments,
  };
}

/* -------------------------------------------------------------------------- */
/*                            SOUS-COMPOSANTS                                 */
/* -------------------------------------------------------------------------- */

function Toggle({
  checked,
  disabled,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: (
    checked: boolean,
  ) => void;
  label: string;
  description: string;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-5 rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-violet-200">
      <span>
        <span className="block text-sm font-black text-zinc-950">
          {label}
        </span>

        <span className="mt-1 block text-xs leading-5 text-zinc-500">
          {description}
        </span>
      </span>

      <span className="relative mt-0.5 shrink-0">
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(
            event,
          ) =>
            onChange(
              event.target
                .checked,
            )
          }
          className="peer sr-only"
        />

        <span className="block h-7 w-12 rounded-full bg-zinc-200 transition peer-checked:bg-violet-600 peer-disabled:opacity-50" />

        <span className="absolute left-1 top-1 size-5 rounded-full bg-white shadow-sm transition peer-checked:translate-x-5" />
      </span>
    </label>
  );
}

function FieldError({
  errors,
  name,
}: {
  errors: FieldErrors;
  name: string;
}) {
  const messages =
    errors[name];

  if (
    !messages ||
    messages.length ===
      0
  ) {
    return null;
  }

  return (
    <div className="mt-2 space-y-1">
      {messages.map(
        (
          message,
        ) => (
          <p
            key={message}
            className="text-xs font-bold text-red-600"
          >
            {message}
          </p>
        ),
      )}
    </div>
  );
}

function ConfigurationStatus({
  active,
  label,
}: {
  active: boolean;
  label: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-black ${
        active
          ? "bg-emerald-50 text-emerald-700"
          : "bg-zinc-100 text-zinc-600"
      }`}
    >
      {active ? (
        <CheckCircle2 className="size-3.5" />
      ) : (
        <ShieldAlert className="size-3.5" />
      )}

      {label}
    </span>
  );
}

function RuleStatistics({
  executionCount,
  successCount,
  failureCount,
  lastExecutedAt,
}: {
  executionCount: number;
  successCount: number;
  failureCount: number;
  lastExecutedAt: string | null;
}) {
  return (
    <div className="mt-5 grid gap-3 sm:grid-cols-4">
      <div className="rounded-xl bg-zinc-50 p-3">
        <p className="text-[11px] font-bold uppercase tracking-wide text-zinc-400">
          Exécutions
        </p>

        <p className="mt-1 text-lg font-black text-zinc-950">
          {executionCount.toLocaleString(
            "fr-FR",
          )}
        </p>
      </div>

      <div className="rounded-xl bg-emerald-50 p-3">
        <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-600">
          Réussites
        </p>

        <p className="mt-1 text-lg font-black text-emerald-950">
          {successCount.toLocaleString(
            "fr-FR",
          )}
        </p>
      </div>

      <div className="rounded-xl bg-red-50 p-3">
        <p className="text-[11px] font-bold uppercase tracking-wide text-red-600">
          Échecs
        </p>

        <p className="mt-1 text-lg font-black text-red-950">
          {failureCount.toLocaleString(
            "fr-FR",
          )}
        </p>
      </div>

      <div className="rounded-xl bg-violet-50 p-3">
        <p className="text-[11px] font-bold uppercase tracking-wide text-violet-600">
          Dernière exécution
        </p>

        <p className="mt-1 text-xs font-black leading-5 text-violet-950">
          {formatDate(
            lastExecutedAt,
          )}
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                COMPOSANT                                   */
/* -------------------------------------------------------------------------- */

export function AdminVipAppointmentRulesManager({
  settings,
}: AdminVipAppointmentRulesManagerProps) {
  const router =
    useRouter();

  const [
    form,
    setForm,
  ] =
    useState<FormState>(
      () =>
        getInitialState(
          settings,
        ),
    );

  const [
    fieldErrors,
    setFieldErrors,
  ] =
    useState<FieldErrors>(
      {},
    );

  const [
    isPending,
    startTransition,
  ] =
    useTransition();

  const globalConfigurationReady =
    settings.configuration
      .programStatus ===
      "ACTIVE" &&
    settings.configuration
      .clubEnabled &&
    settings.configuration
      .automaticRulesEnabled;

  function updateForm<
    Key extends keyof FormState,
  >(
    key: Key,
    value: FormState[Key],
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

    setFieldErrors(
      (
        current,
      ) => {
        if (
          !current[key]
        ) {
          return current;
        }

        const next = {
          ...current,
        };

        delete next[key];

        return next;
      },
    );
  }

  function submit():
    void {
    const pointsPerEuro =
      Number.parseInt(
        form.pointsPerEuro,
        10,
      );

    const xpPerCompletedAppointment =
      Number.parseInt(
        form.xpPerCompletedAppointment,
        10,
      );

    const minimumSpendEuros =
      form.minimumSpendEuros
        .trim()
        ? parseFrenchNumber(
            form.minimumSpendEuros,
          )
        : null;

    if (
      minimumSpendEuros !==
        null &&
      (
        !Number.isFinite(
          minimumSpendEuros,
        ) ||
        minimumSpendEuros <
          0
      )
    ) {
      setFieldErrors({
        minimumSpendCents: [
          "Le montant minimum est invalide.",
        ],
      });

      toast.error(
        "Vérifiez le montant minimum.",
      );

      return;
    }

    startTransition(
      async () => {
        const result =
          await updateAdminVipAppointmentRulesAction({
            pointsRuleEnabled:
              form.pointsRuleEnabled,

            pointsPerEuro:
              Number.isFinite(
                pointsPerEuro,
              )
                ? pointsPerEuro
                : 0,

            xpRuleEnabled:
              form.xpRuleEnabled,

            xpPerCompletedAppointment:
              Number.isFinite(
                xpPerCompletedAppointment,
              )
                ? xpPerCompletedAppointment
                : 0,

            minimumSpendCents:
              minimumSpendEuros ===
              null
                ? null
                : Math.round(
                    minimumSpendEuros *
                      100,
                  ),

            onlyPaidAppointments:
              form.onlyPaidAppointments,
          });

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

        setFieldErrors(
          {},
        );

        toast.success(
          result.message,
        );

        router.refresh();
      },
    );
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] bg-zinc-950 p-6 text-white shadow-xl sm:p-8">
        <div className="absolute -right-24 -top-24 size-72 rounded-full bg-violet-600/30 blur-3xl" />

        <div className="absolute -bottom-32 left-1/3 size-64 rounded-full bg-fuchsia-500/20 blur-3xl" />

        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em]">
            <Settings2 className="size-4" />

            Automatisations VIP
          </span>

          <h1 className="mt-5 text-3xl font-black sm:text-4xl">
            Gains des rendez-vous
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-300">
            Définissez les points et l’expérience automatiquement attribués
            lorsqu’un rendez-vous est marqué comme terminé.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <ConfigurationStatus
              active={
                settings.configuration
                  .clubEnabled
              }
              label="Club VIP"
            />

            <ConfigurationStatus
              active={
                settings.configuration
                  .automaticRulesEnabled
              }
              label="Règles automatiques"
            />

            <ConfigurationStatus
              active={
                settings.configuration
                  .xpEnabled
              }
              label="Expérience XP"
            />

            <ConfigurationStatus
              active={
                settings.configuration
                  .notificationsEnabled
              }
              label="Notifications"
            />
          </div>
        </div>
      </section>

      {!globalConfigurationReady ? (
        <section className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 size-5 shrink-0 text-amber-700" />

            <div>
              <h2 className="font-black text-amber-950">
                Activation globale nécessaire
              </h2>

              <p className="mt-1 text-sm leading-6 text-amber-800">
                Les règles peuvent être configurées ici, mais elles ne
                distribueront aucun gain tant que le Club VIP, le programme
                actif et les règles automatiques ne sont pas activés.
              </p>

              <Link
                href="/admin/parametres"
                className="mt-3 inline-flex text-sm font-black text-amber-900 underline underline-offset-4"
              >
                Ouvrir les paramètres généraux
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-[1.75rem] border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
          <header className="flex items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <Coins className="size-6" />
            </span>

            <div>
              <h2 className="text-xl font-black text-zinc-950">
                Points par euro dépensé
              </h2>

              <p className="mt-1 text-sm leading-6 text-zinc-500">
                Exemple : avec 2 points par euro, un rendez-vous de 50 € rapporte
                100 points.
              </p>
            </div>
          </header>

          <div className="mt-6 space-y-4">
            <Toggle
              checked={
                form.pointsRuleEnabled
              }
              disabled={
                isPending
              }
              onChange={(
                checked,
              ) =>
                updateForm(
                  "pointsRuleEnabled",
                  checked,
                )
              }
              label="Activer les gains de points"
              description="La règle s’exécutera à chaque rendez-vous terminé respectant les conditions."
            />

            <div>
              <label
                htmlFor="pointsPerEuro"
                className="text-sm font-black text-zinc-800"
              >
                Points gagnés par euro
              </label>

              <div className="relative mt-2">
                <input
                  id="pointsPerEuro"
                  type="number"
                  min="0"
                  max="1000"
                  step="1"
                  value={
                    form.pointsPerEuro
                  }
                  disabled={
                    isPending
                  }
                  onChange={(
                    event,
                  ) =>
                    updateForm(
                      "pointsPerEuro",
                      event.target
                        .value,
                    )
                  }
                  className="h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 pr-24 text-sm font-bold text-zinc-950 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100 disabled:opacity-60"
                />

                <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-xs font-bold text-zinc-400">
                  points / €
                </span>
              </div>

              <FieldError
                errors={
                  fieldErrors
                }
                name="pointsPerEuro"
              />
            </div>
          </div>

          <RuleStatistics
            executionCount={
              settings.pointsRule
                .executionCount
            }
            successCount={
              settings.pointsRule
                .successCount
            }
            failureCount={
              settings.pointsRule
                .failureCount
            }
            lastExecutedAt={
              settings.pointsRule
                .lastExecutedAt
            }
          />
        </article>

        <article className="rounded-[1.75rem] border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
          <header className="flex items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
              <Sparkles className="size-6" />
            </span>

            <div>
              <h2 className="text-xl font-black text-zinc-950">
                XP par rendez-vous terminé
              </h2>

              <p className="mt-1 text-sm leading-6 text-zinc-500">
                Une quantité fixe d’expérience est attribuée pour faire
                progresser le niveau VIP de la cliente.
              </p>
            </div>
          </header>

          <div className="mt-6 space-y-4">
            <Toggle
              checked={
                form.xpRuleEnabled
              }
              disabled={
                isPending
              }
              onChange={(
                checked,
              ) =>
                updateForm(
                  "xpRuleEnabled",
                  checked,
                )
              }
              label="Activer les gains d’XP"
              description="L’XP sera ajoutée automatiquement au compte fidélité."
            />

            <div>
              <label
                htmlFor="xpPerCompletedAppointment"
                className="text-sm font-black text-zinc-800"
              >
                XP gagnés par rendez-vous
              </label>

              <div className="relative mt-2">
                <input
                  id="xpPerCompletedAppointment"
                  type="number"
                  min="0"
                  max="100000"
                  step="1"
                  value={
                    form.xpPerCompletedAppointment
                  }
                  disabled={
                    isPending
                  }
                  onChange={(
                    event,
                  ) =>
                    updateForm(
                      "xpPerCompletedAppointment",
                      event.target
                        .value,
                    )
                  }
                  className="h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 pr-16 text-sm font-bold text-zinc-950 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100 disabled:opacity-60"
                />

                <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-xs font-bold text-zinc-400">
                  XP
                </span>
              </div>

              <FieldError
                errors={
                  fieldErrors
                }
                name="xpPerCompletedAppointment"
              />
            </div>
          </div>

          <RuleStatistics
            executionCount={
              settings.xpRule
                .executionCount
            }
            successCount={
              settings.xpRule
                .successCount
            }
            failureCount={
              settings.xpRule
                .failureCount
            }
            lastExecutedAt={
              settings.xpRule
                .lastExecutedAt
            }
          />
        </article>
      </section>

      <section className="rounded-[1.75rem] border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        <header className="flex items-start gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <WalletCards className="size-6" />
          </span>

          <div>
            <h2 className="text-xl font-black text-zinc-950">
              Conditions d’attribution
            </h2>

            <p className="mt-1 text-sm leading-6 text-zinc-500">
              Ces conditions s’appliquent aux deux règles automatiques.
            </p>
          </div>
        </header>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <div>
            <label
              htmlFor="minimumSpendEuros"
              className="text-sm font-black text-zinc-800"
            >
              Montant minimum du rendez-vous
            </label>

            <div className="relative mt-2">
              <input
                id="minimumSpendEuros"
                type="text"
                inputMode="decimal"
                placeholder="0,00"
                value={
                  form.minimumSpendEuros
                }
                disabled={
                  isPending
                }
                onChange={(
                  event,
                ) =>
                  updateForm(
                    "minimumSpendEuros",
                    event.target
                      .value,
                  )
                }
                className="h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 pr-12 text-sm font-bold text-zinc-950 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100 disabled:opacity-60"
              />

              <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center font-black text-zinc-400">
                €
              </span>
            </div>

            <FieldError
              errors={
                fieldErrors
              }
              name="minimumSpendCents"
            />

            <p className="mt-2 text-xs leading-5 text-zinc-500">
              Laissez vide ou saisissez 0 pour accepter tous les montants.
            </p>
          </div>

          <Toggle
            checked={
              form.onlyPaidAppointments
            }
            disabled={
              isPending
            }
            onChange={(
              checked,
            ) =>
              updateForm(
                "onlyPaidAppointments",
                checked,
              )
            }
            label="Uniquement les rendez-vous payés"
            description="Le statut du paiement devra être « payé » pour déclencher les gains."
          />
        </div>

        {settings.minimumSpendCents !==
        null ? (
          <p className="mt-5 rounded-xl bg-zinc-50 px-4 py-3 text-xs font-bold text-zinc-600">
            Configuration actuellement enregistrée : minimum{" "}
            {formatCurrency(
              settings.minimumSpendCents,
            )}
          </p>
        ) : null}
      </section>

      <section className="rounded-[1.5rem] border border-violet-200 bg-violet-50 p-5">
        <div className="flex items-start gap-3">
          <Activity className="mt-0.5 size-5 shrink-0 text-violet-600" />

          <div>
            <h2 className="font-black text-violet-950">
              Protection contre les doubles crédits
            </h2>

            <p className="mt-1 text-sm leading-6 text-violet-800">
              Chaque rendez-vous et chaque règle possèdent une clé
              d’idempotence unique. Un même rendez-vous ne peut donc pas
              créditer deux fois les points ou l’XP.
            </p>
          </div>
        </div>
      </section>

      {settings.configuration
        .notificationsEnabled &&
      !settings.configuration
        .notifyOnXpEarned ? (
        <section className="rounded-[1.5rem] border border-blue-200 bg-blue-50 p-5">
          <div className="flex items-start gap-3">
            <BellRing className="mt-0.5 size-5 shrink-0 text-blue-600" />

            <p className="text-sm leading-6 text-blue-800">
              Les notifications générales sont actives, mais la notification
              des gains VIP est désactivée dans les paramètres.
            </p>
          </div>
        </section>
      ) : null}

      <div className="sticky bottom-4 z-20 flex justify-end">
        <button
          type="button"
          disabled={
            isPending
          }
          onClick={
            submit
          }
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 text-sm font-black text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}

          {isPending
            ? "Enregistrement..."
            : "Enregistrer les règles"}
        </button>
      </div>
    </div>
  );
}
