"use client";

import type {
  ReactNode,
} from "react";

import {
  useState,
  useTransition,
} from "react";

import {
  Clock3,
  CreditCard,
  Euro,
  FileText,
  ImageIcon,
  LoaderCircle,
  Palette,
  Save,
  Settings2,
  Sparkles,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  toast,
} from "sonner";

import {
  createAdminServiceAction,
  updateAdminServiceAction,
} from "@/features/admin/services/actions/admin-services.actions";

import {
  AdminServiceUploadZone,
} from "@/features/admin/services/components/admin-service-upload-zone";

import type {
  AdminServiceFormInput,
} from "@/features/admin/services/schemas/admin-service.schema";

import type {
  AdminServiceCategoryOption,
} from "@/features/admin/services/types/admin-service.types";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type AdminServiceFormProps = {
  mode:
    | "CREATE"
    | "EDIT";

  serviceId?: string;

  categories:
    AdminServiceCategoryOption[];

  initialValue:
    AdminServiceFormInput;
};

type FieldErrors =
  Record<
    string,
    string[]
  >;

type FormSectionProps = {
  title: string;
  description: string;
  icon: ReactNode;
  children: ReactNode;
};

type ToggleFieldProps = {
  checked: boolean;
  onChange: (
    checked: boolean,
  ) => void;
  title: string;
  description: string;
  disabled?: boolean;
};

/* -------------------------------------------------------------------------- */
/*                              CONFIGURATION                                 */
/* -------------------------------------------------------------------------- */

const INPUT_CLASS_NAME =
  "mt-2 h-11 w-full rounded-2xl border border-[#E8B4C0]/70 bg-[#FFFDFC] px-4 text-sm text-[#2F2027] outline-none transition placeholder:text-[#A8949C] focus:border-[#B45F7A] focus:ring-4 focus:ring-[#B45F7A]/10 disabled:cursor-not-allowed disabled:opacity-60";

const TEXTAREA_CLASS_NAME =
  "mt-2 min-h-32 w-full resize-y rounded-2xl border border-[#E8B4C0]/70 bg-[#FFFDFC] px-4 py-3 text-sm leading-6 text-[#2F2027] outline-none transition placeholder:text-[#A8949C] focus:border-[#B45F7A] focus:ring-4 focus:ring-[#B45F7A]/10 disabled:cursor-not-allowed disabled:opacity-60";

/* -------------------------------------------------------------------------- */
/*                                  OUTILS                                    */
/* -------------------------------------------------------------------------- */

function centsToPriceInput(
  value: number | null | undefined,
): string {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return (
    value / 100
  )
    .toFixed(2)
    .replace(
      ".",
      ",",
    );
}

function priceInputToCents(
  value: string,
): number | null {
  const normalized =
    value
      .trim()
      .replace(
        /\s/g,
        "",
      )
      .replace(
        ",",
        ".",
      );

  if (!normalized) {
    return null;
  }

  const amount =
    Number(
      normalized,
    );

  if (
    !Number.isFinite(
      amount,
    ) ||
    amount < 0
  ) {
    return null;
  }

  return Math.round(
    amount * 100,
  );
}

/* -------------------------------------------------------------------------- */
/*                              COMPOSANTS UI                                 */
/* -------------------------------------------------------------------------- */

function FormSection({
  title,
  description,
  icon,
  children,
}: FormSectionProps) {
  return (
    <section className="rounded-[2rem] border border-[#E8B4C0]/45 bg-white p-5 shadow-sm sm:p-7">
      <header className="flex items-start gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#FFF0F4] text-[#B45F7A]">
          {icon}
        </span>

        <div>
          <h2 className="text-lg font-black text-[#2F2027]">
            {title}
          </h2>

          <p className="mt-1 text-sm leading-6 text-[#816D75]">
            {description}
          </p>
        </div>
      </header>

      <div className="mt-7">
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
  const messages =
    errors[name];

  if (
    !messages ||
    messages.length === 0
  ) {
    return null;
  }

  return (
    <p className="mt-2 text-sm font-medium text-red-600">
      {messages[0]}
    </p>
  );
}

function ToggleField({
  checked,
  onChange,
  title,
  description,
  disabled = false,
}: ToggleFieldProps) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-5 rounded-2xl border border-[#E8B4C0]/50 bg-[#FFFDFC] p-4">
      <span>
        <span className="block text-sm font-semibold text-[#2F2027]">
          {title}
        </span>

        <span className="mt-1 block text-xs leading-5 text-[#816D75]">
          {description}
        </span>
      </span>

      <span className="relative mt-0.5 shrink-0">
        <input
          type="checkbox"
          checked={
            checked
          }
          disabled={
            disabled
          }
          onChange={(
            event,
          ) =>
            onChange(
              event.target.checked,
            )
          }
          className="peer sr-only"
        />

        <span className="block h-7 w-12 rounded-full bg-[#D8C7CD] transition peer-checked:bg-[#B45F7A] peer-disabled:opacity-50" />

        <span className="absolute left-1 top-1 size-5 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
      </span>
    </label>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  FORMULAIRE                                */
/* -------------------------------------------------------------------------- */

export function AdminServiceForm({
  mode,
  serviceId,
  categories,
  initialValue,
}: AdminServiceFormProps) {
  const router =
    useRouter();

  const [
    isPending,
    startTransition,
  ] =
    useTransition();

  const [
    values,
    setValues,
  ] =
    useState<AdminServiceFormInput>(
      initialValue,
    );

  const [
    priceInput,
    setPriceInput,
  ] =
    useState(
      centsToPriceInput(
        initialValue.priceCents,
      ),
    );

  const [
    promotionalPriceInput,
    setPromotionalPriceInput,
  ] =
    useState(
      centsToPriceInput(
        initialValue.promotionalPriceCents,
      ),
    );

  const [
    depositInput,
    setDepositInput,
  ] =
    useState(
      centsToPriceInput(
        initialValue.depositCents,
      ),
    );

  const [
    fieldErrors,
    setFieldErrors,
  ] =
    useState<FieldErrors>(
      {},
    );

  const hasPrice =
    priceInput.trim().length >
    0;

  function updateValue<
    Key extends keyof AdminServiceFormInput,
  >(
    key: Key,
    value: AdminServiceFormInput[Key],
  ) {
    setValues(
      (
        currentValues,
      ) => ({
        ...currentValues,

        [key]:
          value,
      }),
    );

    setFieldErrors(
      (
        currentErrors,
      ) => {
        if (
          !currentErrors[key]
        ) {
          return currentErrors;
        }

        const nextErrors = {
          ...currentErrors,
        };

        delete nextErrors[key];

        return nextErrors;
      },
    );
  }

  function handlePriceChange(
    value: string,
  ) {
    setPriceInput(
      value,
    );

    if (
      value.trim().length ===
      0
    ) {
      setPromotionalPriceInput(
        "",
      );

      setDepositInput(
        "",
      );

      setValues(
        (
          currentValues,
        ) => ({
          ...currentValues,

          priceCents:
            null,

          promotionalPriceCents:
            null,

          depositRequired:
            false,

          depositCents:
            null,

          allowOnlineBooking:
            false,
        }),
      );
    }
  }

  function handleSubmit() {
    setFieldErrors(
      {},
    );

    const priceCents =
      priceInputToCents(
        priceInput,
      );

    const promotionalPriceCents =
      priceInputToCents(
        promotionalPriceInput,
      );

    const depositCents =
      priceInputToCents(
        depositInput,
      );

    const payload: AdminServiceFormInput = {
      ...values,

      name:
        values.name.trim(),

      shortDescription:
        values.shortDescription?.trim() ||
        null,

      description:
        values.description?.trim() ||
        null,

      priceCents,

      promotionalPriceCents:
        priceCents !== null
          ? promotionalPriceCents
          : null,

      depositRequired:
        priceCents !== null &&
        values.depositRequired,

      depositCents:
        priceCents !== null &&
        values.depositRequired
          ? depositCents
          : null,

      allowOnlineBooking:
        priceCents !== null &&
        values.allowOnlineBooking,

      color:
        values.color?.trim() ||
        null,
    };

    startTransition(
      async () => {
        const result =
          mode === "CREATE"
            ? await createAdminServiceAction(
                payload,
              )
            : await updateAdminServiceAction(
                serviceId ?? "",
                payload,
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

        toast.success(
          result.message,
        );

        if (
          result.redirectUrl
        ) {
          router.push(
            result.redirectUrl,
          );

          return;
        }

        router.refresh();
      },
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="space-y-6">
        <FormSection
          title="Informations générales"
          description="Définissez le nom, la catégorie et les textes visibles sur le site."
          icon={
            <FileText className="size-5" />
          }
        >
          <div className="grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-[#2F2027]">
                Nom de la prestation
              </span>

              <input
                type="text"
                value={
                  values.name
                }
                maxLength={
                  120
                }
                disabled={
                  isPending
                }
                onChange={(
                  event,
                ) =>
                  updateValue(
                    "name",
                    event.target.value,
                  )
                }
                placeholder="Ex. Pose complète gel"
                className={
                  INPUT_CLASS_NAME
                }
              />

              <FieldError
                name="name"
                errors={
                  fieldErrors
                }
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-[#2F2027]">
                Catégorie
              </span>

              <select
                value={
                  values.categoryId
                }
                disabled={
                  isPending
                }
                onChange={(
                  event,
                ) =>
                  updateValue(
                    "categoryId",
                    event.target.value,
                  )
                }
                className={
                  INPUT_CLASS_NAME
                }
              >
                <option value="">
                  Sélectionner une catégorie
                </option>

                {categories.map(
                  (
                    category,
                  ) => (
                    <option
                      key={
                        category.id
                      }
                      value={
                        category.id
                      }
                    >
                      {category.name}
                      {!category.isActive
                        ? " — masquée"
                        : ""}
                    </option>
                  ),
                )}
              </select>

              <FieldError
                name="categoryId"
                errors={
                  fieldErrors
                }
              />
            </label>
          </div>

          <label className="mt-5 block">
            <span className="text-sm font-semibold text-[#2F2027]">
              Description courte
            </span>

            <textarea
              value={
                values.shortDescription ??
                ""
              }
              maxLength={
                300
              }
              disabled={
                isPending
              }
              onChange={(
                event,
              ) =>
                updateValue(
                  "shortDescription",
                  event.target.value,
                )
              }
              placeholder="Résumé affiché dans les cartes de prestations."
              className="mt-2 min-h-24 w-full resize-y rounded-2xl border border-[#E8B4C0]/70 bg-[#FFFDFC] px-4 py-3 text-sm leading-6 text-[#2F2027] outline-none transition focus:border-[#B45F7A] focus:ring-4 focus:ring-[#B45F7A]/10"
            />

            <FieldError
              name="shortDescription"
              errors={
                fieldErrors
              }
            />
          </label>

          <label className="mt-5 block">
            <span className="text-sm font-semibold text-[#2F2027]">
              Description complète
            </span>

            <textarea
              value={
                values.description ??
                ""
              }
              maxLength={
                5_000
              }
              disabled={
                isPending
              }
              onChange={(
                event,
              ) =>
                updateValue(
                  "description",
                  event.target.value,
                )
              }
              placeholder="Détaillez le déroulement, les finitions et les informations utiles."
              className={
                TEXTAREA_CLASS_NAME
              }
            />

            <FieldError
              name="description"
              errors={
                fieldErrors
              }
            />
          </label>
        </FormSection>

        <FormSection
          title="Tarification"
          description="Le prix est facultatif. Sans prix, la prestation sera affichée comme disponible sur devis."
          icon={
            <Euro className="size-5" />
          }
        >
          <div className="grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-[#2F2027]">
                Prix normal
              </span>

              <div className="relative">
                <input
                  type="text"
                  inputMode="decimal"
                  value={
                    priceInput
                  }
                  disabled={
                    isPending
                  }
                  onChange={(
                    event,
                  ) =>
                    handlePriceChange(
                      event.target.value,
                    )
                  }
                  placeholder="Ex. 45,00"
                  className={`${INPUT_CLASS_NAME} pr-12`}
                />

                <span className="pointer-events-none absolute right-4 top-1/2 mt-1 -translate-y-1/2 text-sm font-semibold text-[#816D75]">
                  €
                </span>
              </div>

              <p className="mt-2 text-xs text-[#816D75]">
                Laissez vide pour afficher « Sur devis ».
              </p>

              <FieldError
                name="priceCents"
                errors={
                  fieldErrors
                }
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-[#2F2027]">
                Prix promotionnel
              </span>

              <div className="relative">
                <input
                  type="text"
                  inputMode="decimal"
                  value={
                    promotionalPriceInput
                  }
                  disabled={
                    isPending ||
                    !hasPrice
                  }
                  onChange={(
                    event,
                  ) =>
                    setPromotionalPriceInput(
                      event.target.value,
                    )
                  }
                  placeholder="Ex. 39,00"
                  className={`${INPUT_CLASS_NAME} pr-12`}
                />

                <span className="pointer-events-none absolute right-4 top-1/2 mt-1 -translate-y-1/2 text-sm font-semibold text-[#816D75]">
                  €
                </span>
              </div>

              <FieldError
                name="promotionalPriceCents"
                errors={
                  fieldErrors
                }
              />
            </label>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <ToggleField
              checked={
                values.depositRequired
              }
              disabled={
                isPending ||
                !hasPrice
              }
              onChange={(
                checked,
              ) => {
                updateValue(
                  "depositRequired",
                  checked,
                );

                if (!checked) {
                  setDepositInput(
                    "",
                  );
                }
              }}
              title="Demander un acompte"
              description="Un paiement PayPal sera demandé avant la confirmation."
            />

            <label className="block">
              <span className="text-sm font-semibold text-[#2F2027]">
                Montant de l’acompte
              </span>

              <div className="relative">
                <input
                  type="text"
                  inputMode="decimal"
                  value={
                    depositInput
                  }
                  disabled={
                    isPending ||
                    !hasPrice ||
                    !values.depositRequired
                  }
                  onChange={(
                    event,
                  ) =>
                    setDepositInput(
                      event.target.value,
                    )
                  }
                  placeholder="Ex. 20,00"
                  className={`${INPUT_CLASS_NAME} pr-12`}
                />

                <span className="pointer-events-none absolute right-4 top-1/2 mt-1 -translate-y-1/2 text-sm font-semibold text-[#816D75]">
                  €
                </span>
              </div>

              <FieldError
                name="depositCents"
                errors={
                  fieldErrors
                }
              />
            </label>
          </div>
        </FormSection>

        <FormSection
          title="Durée et organisation"
          description="Configurez la durée de la prestation et le temps nécessaire avant le rendez-vous suivant."
          icon={
            <Clock3 className="size-5" />
          }
        >
          <div className="grid gap-5 sm:grid-cols-3">
            <label className="block">
              <span className="text-sm font-semibold text-[#2F2027]">
                Durée
              </span>

              <input
                type="number"
                min={
                  5
                }
                max={
                  720
                }
                step={
                  5
                }
                value={
                  values.durationMinutes
                }
                disabled={
                  isPending
                }
                onChange={(
                  event,
                ) =>
                  updateValue(
                    "durationMinutes",
                    Number(
                      event.target.value,
                    ),
                  )
                }
                className={
                  INPUT_CLASS_NAME
                }
              />

              <p className="mt-2 text-xs text-[#816D75]">
                En minutes
              </p>

              <FieldError
                name="durationMinutes"
                errors={
                  fieldErrors
                }
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-[#2F2027]">
                Temps de finition
              </span>

              <input
                type="number"
                min={
                  0
                }
                max={
                  180
                }
                step={
                  5
                }
                value={
                  values.cleanupMinutes
                }
                disabled={
                  isPending
                }
                onChange={(
                  event,
                ) =>
                  updateValue(
                    "cleanupMinutes",
                    Number(
                      event.target.value,
                    ),
                  )
                }
                className={
                  INPUT_CLASS_NAME
                }
              />

              <p className="mt-2 text-xs text-[#816D75]">
                Marge après le rendez-vous
              </p>

              <FieldError
                name="cleanupMinutes"
                errors={
                  fieldErrors
                }
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-[#2F2027]">
                Ordre d’affichage
              </span>

              <input
                type="number"
                min={
                  0
                }
                value={
                  values.sortOrder
                }
                disabled={
                  isPending
                }
                onChange={(
                  event,
                ) =>
                  updateValue(
                    "sortOrder",
                    Number(
                      event.target.value,
                    ),
                  )
                }
                className={
                  INPUT_CLASS_NAME
                }
              />

              <FieldError
                name="sortOrder"
                errors={
                  fieldErrors
                }
              />
            </label>
          </div>
        </FormSection>

        <FormSection
          title="Images"
          description="Ajoutez jusqu’à 10 photos et choisissez l’image principale affichée sur le site."
          icon={
            <ImageIcon className="size-5" />
          }
        >
          <AdminServiceUploadZone
            value={
              values.images
            }
            disabled={
              isPending
            }
            onChange={(
              images,
            ) =>
              updateValue(
                "images",
                images,
              )
            }
          />

          <FieldError
            name="images"
            errors={
              fieldErrors
            }
          />
        </FormSection>
      </div>

      <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
        <FormSection
          title="Publication"
          description="Choisissez comment cette prestation apparaît sur le site."
          icon={
            <Settings2 className="size-5" />
          }
        >
          <div className="space-y-4">
            <ToggleField
              checked={
                values.isActive
              }
              disabled={
                isPending
              }
              onChange={(
                checked,
              ) =>
                updateValue(
                  "isActive",
                  checked,
                )
              }
              title="Visible sur le site"
              description="La prestation apparaît dans le catalogue public."
            />

            <ToggleField
              checked={
                values.isFeatured
              }
              disabled={
                isPending
              }
              onChange={(
                checked,
              ) =>
                updateValue(
                  "isFeatured",
                  checked,
                )
              }
              title="Mettre en avant"
              description="La prestation peut apparaître sur la page d’accueil."
            />

            <ToggleField
              checked={
                values.allowOnlineBooking
              }
              disabled={
                isPending ||
                !hasPrice
              }
              onChange={(
                checked,
              ) =>
                updateValue(
                  "allowOnlineBooking",
                  checked,
                )
              }
              title="Réservation en ligne"
              description={
                hasPrice
                  ? "Les clientes peuvent sélectionner cette prestation dans le parcours de réservation."
                  : "Ajoutez un prix pour activer la réservation en ligne."
              }
            />
          </div>

          <FieldError
            name="allowOnlineBooking"
            errors={
              fieldErrors
            }
          />
        </FormSection>

        <FormSection
          title="Apparence"
          description="Personnalisez la couleur utilisée lorsqu’aucune image n’est disponible."
          icon={
            <Palette className="size-5" />
          }
        >
          <label className="block">
            <span className="text-sm font-semibold text-[#2F2027]">
              Couleur
            </span>

            <div className="mt-2 flex items-center gap-3">
              <input
                type="color"
                value={
                  values.color ??
                  "#E8B4C0"
                }
                disabled={
                  isPending
                }
                onChange={(
                  event,
                ) =>
                  updateValue(
                    "color",
                    event.target.value,
                  )
                }
                className="size-11 cursor-pointer rounded-xl border border-[#E8B4C0]/70 bg-white p-1"
              />

              <input
                type="text"
                value={
                  values.color ??
                  ""
                }
                maxLength={
                  20
                }
                disabled={
                  isPending
                }
                onChange={(
                  event,
                ) =>
                  updateValue(
                    "color",
                    event.target.value,
                  )
                }
                placeholder="#E8B4C0"
                className={`${INPUT_CLASS_NAME} mt-0`}
              />
            </div>

            <FieldError
              name="color"
              errors={
                fieldErrors
              }
            />
          </label>
        </FormSection>

        <div className="rounded-[2rem] border border-[#E8B4C0]/50 bg-gradient-to-br from-[#2F2027] to-[#843F59] p-6 text-white shadow-xl shadow-[#843F59]/15">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-white/10">
              {hasPrice ? (
                <CreditCard className="size-5" />
              ) : (
                <Sparkles className="size-5" />
              )}
            </span>

            <div>
              <p className="text-sm font-semibold">
                {hasPrice
                  ? "Prestation tarifée"
                  : "Prestation sur devis"}
              </p>

              <p className="mt-1 text-xs text-white/65">
                {hasPrice
                  ? "La réservation en ligne peut être activée."
                  : "La fiche restera visible sans proposer de réservation."}
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={
              isPending
            }
            onClick={
              handleSubmit
            }
            className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-bold text-[#2F2027] transition hover:bg-[#FFF0F4] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}

            {isPending
              ? "Enregistrement…"
              : mode ===
                    "CREATE"
                ? "Créer la prestation"
                : "Enregistrer les modifications"}
          </button>
        </div>
      </aside>
    </div>
  );
}
