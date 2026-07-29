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
  BadgePercent,
  CalendarClock,
  Check,
  ChevronLeft,
  CircleDollarSign,
  FileText,
  ImageIcon,
  LayoutPanelTop,
  LoaderCircle,
  Save,
  Search,
  Settings2,
  Sparkles,
  Tag,
  TicketPercent,
} from "lucide-react";

import Link from "next/link";

import {
  useRouter,
} from "next/navigation";

import {
  toast,
} from "sonner";

import {
  createAdminPromotionAction,
  updateAdminPromotionAction,
} from "@/features/admin/promotions/actions/admin-promotions.actions";

import type {
  AdminPromotionFormInput,
  AdminPromotionServiceOption,
  AdminPromotionType,
} from "@/features/admin/promotions/types/admin-promotions.types";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type AdminPromotionFormProps = {
  mode:
    | "CREATE"
    | "EDIT";

  promotionId?:
    string;

  serviceOptions:
    AdminPromotionServiceOption[];

  initialValue:
    AdminPromotionFormInput;
};

type FieldErrors =
  Record<
    string,
    string[]
  >;

type FormSectionProps = {
  title:
    string;

  description:
    string;

  icon:
    ReactNode;

  children:
    ReactNode;
};

type ToggleFieldProps = {
  checked:
    boolean;

  onChange:
    (
      checked:
        boolean,
    ) => void;

  title:
    string;

  description:
    string;

  disabled?:
    boolean;
};

/* -------------------------------------------------------------------------- */
/*                              CONFIGURATION                                 */
/* -------------------------------------------------------------------------- */

const INPUT_CLASS_NAME =
  "mt-2 h-11 w-full rounded-2xl border border-[#E8B4C0]/70 bg-[#FFFDFC] px-4 text-sm text-[#2F2027] outline-none transition placeholder:text-[#A8949C] focus:border-[#B45F7A] focus:ring-4 focus:ring-[#B45F7A]/10 disabled:cursor-not-allowed disabled:opacity-60";

const TEXTAREA_CLASS_NAME =
  "mt-2 min-h-32 w-full resize-y rounded-2xl border border-[#E8B4C0]/70 bg-[#FFFDFC] px-4 py-3 text-sm leading-6 text-[#2F2027] outline-none transition placeholder:text-[#A8949C] focus:border-[#B45F7A] focus:ring-4 focus:ring-[#B45F7A]/10 disabled:cursor-not-allowed disabled:opacity-60";

const TYPE_OPTIONS: Array<{
  value:
    AdminPromotionType;

  label:
    string;

  description:
    string;
}> = [
  {
    value:
      "PERCENTAGE",

    label:
      "Pourcentage",

    description:
      "Réduction calculée en pourcentage.",
  },

  {
    value:
      "FIXED_AMOUNT",

    label:
      "Montant fixe",

    description:
      "Montant précis retiré du prix.",
  },

  {
    value:
      "FREE_SERVICE",

    label:
      "Prestation offerte",

    description:
      "Offre une prestation sélectionnée.",
  },

  {
    value:
      "CUSTOM",

    label:
      "Offre personnalisée",

    description:
      "Texte promotionnel sans calcul automatique.",
  },
];

/* -------------------------------------------------------------------------- */
/*                                  OUTILS                                    */
/* -------------------------------------------------------------------------- */

function normalizeSearch(
  value:
    string,
): string {
  return value
    .trim()
    .toLocaleLowerCase(
      "fr-FR",
    )
    .normalize(
      "NFD",
    )
    .replace(
      /\p{Diacritic}/gu,
      "",
    );
}

function slugify(
  value:
    string,
): string {
  return value
    .trim()
    .toLocaleLowerCase(
      "fr-FR",
    )
    .normalize(
      "NFD",
    )
    .replace(
      /\p{Diacritic}/gu,
      "",
    )
    .replace(
      /[^a-z0-9]+/g,
      "-",
    )
    .replace(
      /^-+|-+$/g,
      "",
    );
}

function centsToPriceInput(
  value:
    number | null,
): string {
  if (
    value ===
    null
  ) {
    return "";
  }

  return (
    value / 100
  )
    .toFixed(
      2,
    )
    .replace(
      ".",
      ",",
    );
}

function priceInputToCents(
  value:
    string,
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

  if (
    normalized ===
    ""
  ) {
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
    amount <=
      0
  ) {
    return null;
  }

  return Math.round(
    amount *
      100,
  );
}

function nullableIntegerInput(
  value:
    string,
): number | null {
  const normalized =
    value.trim();

  if (
    normalized ===
    ""
  ) {
    return null;
  }

  const number =
    Number(
      normalized,
    );

  if (
    !Number.isInteger(
      number,
    ) ||
    number <=
      0
  ) {
    return null;
  }

  return number;
}

function toDateTimeLocal(
  value:
    string,
): string {
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

  const offset =
    date.getTimezoneOffset() *
    60_000;

  return new Date(
    date.getTime() -
      offset,
  )
    .toISOString()
    .slice(
      0,
      16,
    );
}

function dateTimeLocalToIso(
  value:
    string,
): string {
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

function formatServicePrice(
  service:
    AdminPromotionServiceOption,
): string {
  const price =
    service.promotionalPriceCents ??
    service.priceCents;

  if (
    price ===
    null
  ) {
    return "Sur devis";
  }

  return new Intl.NumberFormat(
    "fr-FR",
    {
      style:
        "currency",

      currency:
        "EUR",
    },
  ).format(
    price /
      100,
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
  name:
    string;

  errors:
    FieldErrors;
}) {
  const messages =
    errors[
      name
    ];

  if (
    !messages ||
    messages.length ===
      0
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

export function AdminPromotionForm({
  mode,
  promotionId,
  serviceOptions,
  initialValue,
}: AdminPromotionFormProps) {
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
    useState<AdminPromotionFormInput>(
      initialValue,
    );

  const [
    slugWasEdited,
    setSlugWasEdited,
  ] =
    useState(
      mode ===
        "EDIT",
    );

  const [
    startsAtInput,
    setStartsAtInput,
  ] =
    useState(
      toDateTimeLocal(
        initialValue.startsAt,
      ),
    );

  const [
    endsAtInput,
    setEndsAtInput,
  ] =
    useState(
      toDateTimeLocal(
        initialValue.endsAt,
      ),
    );

  const [
    amountInput,
    setAmountInput,
  ] =
    useState(
      centsToPriceInput(
        initialValue.amountCents,
      ),
    );

  const [
    minimumSpendInput,
    setMinimumSpendInput,
  ] =
    useState(
      centsToPriceInput(
        initialValue.minimumSpendCents,
      ),
    );

  const [
    usageLimitInput,
    setUsageLimitInput,
  ] =
    useState(
      initialValue.usageLimit?.toString() ??
        "",
    );

  const [
    perClientLimitInput,
    setPerClientLimitInput,
  ] =
    useState(
      initialValue.perClientLimit?.toString() ??
        "",
    );

  const [
    serviceSearch,
    setServiceSearch,
  ] =
    useState("");

  const [
    fieldErrors,
    setFieldErrors,
  ] =
    useState<FieldErrors>(
      {},
    );

  const filteredServices =
    useMemo(
      () => {
        const normalized =
          normalizeSearch(
            serviceSearch,
          );

        if (
          normalized ===
          ""
        ) {
          return serviceOptions;
        }

        return serviceOptions.filter(
          (
            service,
          ) =>
            normalizeSearch(
              [
                service.name,
                service.categoryName,
                service.slug,
              ].join(
                " ",
              ),
            ).includes(
              normalized,
            ),
        );
      },
      [
        serviceOptions,
        serviceSearch,
      ],
    );

  const selectedServices =
    useMemo(
      () =>
        serviceOptions.filter(
          (
            service,
          ) =>
            values.serviceIds.includes(
              service.id,
            ),
        ),
      [
        serviceOptions,
        values.serviceIds,
      ],
    );

  function clearFieldError(
    key:
      keyof AdminPromotionFormInput,
  ): void {
    setFieldErrors(
      (
        current,
      ) => {
        if (
          !current[
            key
          ]
        ) {
          return current;
        }

        const next = {
          ...current,
        };

        delete next[
          key
        ];

        return next;
      },
    );
  }

  function updateValue<
    Key extends keyof AdminPromotionFormInput,
  >(
    key:
      Key,

    value:
      AdminPromotionFormInput[Key],
  ): void {
    setValues(
      (
        current,
      ) => ({
        ...current,

        [key]:
          value,
      }),
    );

    clearFieldError(
      key,
    );
  }

  function handleNameChange(
    name:
      string,
  ): void {
    setValues(
      (
        current,
      ) => ({
        ...current,

        name,

        slug:
          slugWasEdited
            ? current.slug
            : slugify(
                name,
              ),
      }),
    );

    clearFieldError(
      "name",
    );

    if (
      !slugWasEdited
    ) {
      clearFieldError(
        "slug",
      );
    }
  }

  function handleTypeChange(
    type:
      AdminPromotionType,
  ): void {
    setValues(
      (
        current,
      ) => ({
        ...current,

        type,

        percentageValue:
          type ===
          "PERCENTAGE"
            ? current.percentageValue
            : null,

        amountCents:
          type ===
          "FIXED_AMOUNT"
            ? current.amountCents
            : null,
      }),
    );

    if (
      type !==
      "FIXED_AMOUNT"
    ) {
      setAmountInput(
        "",
      );
    }

    setFieldErrors(
      (
        current,
      ) => {
        const next = {
          ...current,
        };

        delete next.type;
        delete next.percentageValue;
        delete next.amountCents;

        return next;
      },
    );
  }

  function toggleService(
    serviceId:
      string,
  ): void {
    updateValue(
      "serviceIds",
      values.serviceIds.includes(
        serviceId,
      )
        ? values.serviceIds.filter(
            (
              currentId,
            ) =>
              currentId !==
              serviceId,
          )
        : [
            ...values.serviceIds,
            serviceId,
          ],
    );
  }

  function handleSubmit():
    void {
    setFieldErrors(
      {},
    );

    const payload: AdminPromotionFormInput = {
      ...values,

      id:
        promotionId,

      name:
        values.name.trim(),

      slug:
        slugify(
          values.slug,
        ),

      description:
        values.description.trim(),

      code:
        values.code
          .trim()
          .toUpperCase(),

      imageUrl:
        values.imageUrl.trim(),

      startsAt:
        dateTimeLocalToIso(
          startsAtInput,
        ),

      endsAt:
        dateTimeLocalToIso(
          endsAtInput,
        ),

      percentageValue:
        values.type ===
        "PERCENTAGE"
          ? values.percentageValue
          : null,

      amountCents:
        values.type ===
        "FIXED_AMOUNT"
          ? priceInputToCents(
              amountInput,
            )
          : null,

      usageLimit:
        nullableIntegerInput(
          usageLimitInput,
        ),

      perClientLimit:
        nullableIntegerInput(
          perClientLimitInput,
        ),

      minimumSpendCents:
        priceInputToCents(
          minimumSpendInput,
        ),

      bannerEnabled:
        values.bannerEnabled,

      bannerTitle:
        values.bannerTitle.trim(),

      bannerSubtitle:
        values.bannerSubtitle.trim(),

      bannerImageUrl:
        values.bannerImageUrl.trim(),

      bannerMobileImageUrl:
        values.bannerMobileImageUrl.trim(),

      bannerButtonLabel:
        values.bannerButtonLabel.trim(),

      bannerButtonUrl:
        values.bannerButtonUrl.trim(),

      bannerBackgroundColor:
        values.bannerBackgroundColor.trim(),

      bannerTextColor:
        values.bannerTextColor.trim(),
    };

    startTransition(
      async () => {
        const result =
          mode ===
          "CREATE"
            ? await createAdminPromotionAction(
                payload,
              )
            : await updateAdminPromotionAction(
                promotionId ??
                  "",
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
          result.redirectTo
        ) {
          router.push(
            result.redirectTo,
          );

          return;
        }

        router.refresh();
      },
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/admin/promotions"
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#843F59] transition hover:text-[#B45F7A]"
      >
        <ChevronLeft className="size-4" />

        Retour aux promotions
      </Link>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_23rem]">
        <div className="space-y-6">
          {/* -------------------------------------------------------------- */}
          {/*                       INFORMATIONS GÉNÉRALES                    */}
          {/* -------------------------------------------------------------- */}

          <FormSection
            title="Informations générales"
            description="Définissez le nom, l’adresse et la description de l’offre."
            icon={
              <FileText className="size-5" />
            }
          >
            <div className="grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold text-[#2F2027]">
                  Nom de la promotion
                </span>

                <input
                  type="text"
                  value={
                    values.name
                  }
                  maxLength={
                    160
                  }
                  disabled={
                    isPending
                  }
                  onChange={(
                    event,
                  ) =>
                    handleNameChange(
                      event.target.value,
                    )
                  }
                  placeholder="Ex. Offre été -20 %"
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
                  Slug
                </span>

                <input
                  type="text"
                  value={
                    values.slug
                  }
                  maxLength={
                    180
                  }
                  disabled={
                    isPending
                  }
                  onChange={(
                    event,
                  ) => {
                    setSlugWasEdited(
                      true,
                    );

                    updateValue(
                      "slug",
                      slugify(
                        event.target.value,
                      ),
                    );
                  }}
                  placeholder="offre-ete-20"
                  className={
                    INPUT_CLASS_NAME
                  }
                />

                <FieldError
                  name="slug"
                  errors={
                    fieldErrors
                  }
                />
              </label>
            </div>

            <label className="mt-5 block">
              <span className="text-sm font-semibold text-[#2F2027]">
                Description
              </span>

              <textarea
                value={
                  values.description
                }
                maxLength={
                  5000
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
                placeholder="Présentez les conditions et les avantages de cette offre."
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

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold text-[#2F2027]">
                  Code promotionnel
                </span>

                <input
                  type="text"
                  value={
                    values.code
                  }
                  maxLength={
                    60
                  }
                  disabled={
                    isPending
                  }
                  onChange={(
                    event,
                  ) =>
                    updateValue(
                      "code",
                      event.target.value.toUpperCase(),
                    )
                  }
                  placeholder="ETE20"
                  className={`${INPUT_CLASS_NAME} font-mono uppercase`}
                />

                <p className="mt-2 text-xs text-[#816D75]">
                  Facultatif. Lettres, chiffres, tirets et underscores.
                </p>

                <FieldError
                  name="code"
                  errors={
                    fieldErrors
                  }
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-[#2F2027]">
                  Image principale
                </span>

                <input
                  type="url"
                  value={
                    values.imageUrl
                  }
                  disabled={
                    isPending
                  }
                  onChange={(
                    event,
                  ) =>
                    updateValue(
                      "imageUrl",
                      event.target.value,
                    )
                  }
                  placeholder="https://..."
                  className={
                    INPUT_CLASS_NAME
                  }
                />

                <FieldError
                  name="imageUrl"
                  errors={
                    fieldErrors
                  }
                />
              </label>
            </div>
          </FormSection>

          {/* -------------------------------------------------------------- */}
          {/*                          TYPE ET VALEUR                         */}
          {/* -------------------------------------------------------------- */}

          <FormSection
            title="Type de promotion"
            description="Choisissez la manière dont l’avantage est calculé."
            icon={
              <TicketPercent className="size-5" />
            }
          >
            <div className="grid gap-3 md:grid-cols-2">
              {TYPE_OPTIONS.map(
                (
                  option,
                ) => {
                  const selected =
                    values.type ===
                    option.value;

                  return (
                    <button
                      key={
                        option.value
                      }
                      type="button"
                      disabled={
                        isPending
                      }
                      onClick={() =>
                        handleTypeChange(
                          option.value,
                        )
                      }
                      className={[
                        "flex items-start gap-4 rounded-2xl border p-4 text-left transition",
                        selected
                          ? "border-[#B45F7A] bg-[#FFF0F4] shadow-sm"
                          : "border-[#E8B4C0]/50 bg-[#FFFDFC] hover:border-[#B45F7A]/70",
                      ].join(
                        " ",
                      )}
                    >
                      <span
                        className={[
                          "mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border",
                          selected
                            ? "border-[#B45F7A] bg-[#B45F7A] text-white"
                            : "border-[#D8C7CD] bg-white text-transparent",
                        ].join(
                          " ",
                        )}
                      >
                        <Check className="size-3.5" />
                      </span>

                      <span>
                        <span className="block text-sm font-bold text-[#2F2027]">
                          {option.label}
                        </span>

                        <span className="mt-1 block text-xs leading-5 text-[#816D75]">
                          {option.description}
                        </span>
                      </span>
                    </button>
                  );
                },
              )}
            </div>

            <FieldError
              name="type"
              errors={
                fieldErrors
              }
            />

            {values.type ===
            "PERCENTAGE" ? (
              <label className="mt-5 block max-w-sm">
                <span className="text-sm font-semibold text-[#2F2027]">
                  Pourcentage de réduction
                </span>

                <div className="relative">
                  <input
                    type="number"
                    min={
                      1
                    }
                    max={
                      100
                    }
                    value={
                      values.percentageValue ??
                      ""
                    }
                    disabled={
                      isPending
                    }
                    onChange={(
                      event,
                    ) =>
                      updateValue(
                        "percentageValue",
                        event.target.value ===
                          ""
                          ? null
                          : Number(
                              event.target.value,
                            ),
                      )
                    }
                    placeholder="20"
                    className={`${INPUT_CLASS_NAME} pr-12`}
                  />

                  <span className="pointer-events-none absolute right-4 top-1/2 mt-1 -translate-y-1/2 font-bold text-[#816D75]">
                    %
                  </span>
                </div>

                <FieldError
                  name="percentageValue"
                  errors={
                    fieldErrors
                  }
                />
              </label>
            ) : null}

            {values.type ===
            "FIXED_AMOUNT" ? (
              <label className="mt-5 block max-w-sm">
                <span className="text-sm font-semibold text-[#2F2027]">
                  Montant de la réduction
                </span>

                <div className="relative">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={
                      amountInput
                    }
                    disabled={
                      isPending
                    }
                    onChange={(
                      event,
                    ) => {
                      setAmountInput(
                        event.target.value,
                      );

                      clearFieldError(
                        "amountCents",
                      );
                    }}
                    placeholder="10,00"
                    className={`${INPUT_CLASS_NAME} pr-12`}
                  />

                  <span className="pointer-events-none absolute right-4 top-1/2 mt-1 -translate-y-1/2 font-bold text-[#816D75]">
                    €
                  </span>
                </div>

                <FieldError
                  name="amountCents"
                  errors={
                    fieldErrors
                  }
                />
              </label>
            ) : null}
          </FormSection>

          {/* -------------------------------------------------------------- */}
          {/*                              PÉRIODE                            */}
          {/* -------------------------------------------------------------- */}

          <FormSection
            title="Période de validité"
            description="Programmez précisément le début et la fin de l’offre."
            icon={
              <CalendarClock className="size-5" />
            }
          >
            <div className="grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold text-[#2F2027]">
                  Début
                </span>

                <input
                  type="datetime-local"
                  value={
                    startsAtInput
                  }
                  disabled={
                    isPending
                  }
                  onChange={(
                    event,
                  ) => {
                    setStartsAtInput(
                      event.target.value,
                    );

                    clearFieldError(
                      "startsAt",
                    );
                  }}
                  className={
                    INPUT_CLASS_NAME
                  }
                />

                <FieldError
                  name="startsAt"
                  errors={
                    fieldErrors
                  }
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-[#2F2027]">
                  Fin
                </span>

                <input
                  type="datetime-local"
                  value={
                    endsAtInput
                  }
                  disabled={
                    isPending
                  }
                  onChange={(
                    event,
                  ) => {
                    setEndsAtInput(
                      event.target.value,
                    );

                    clearFieldError(
                      "endsAt",
                    );
                  }}
                  className={
                    INPUT_CLASS_NAME
                  }
                />

                <FieldError
                  name="endsAt"
                  errors={
                    fieldErrors
                  }
                />
              </label>
            </div>
          </FormSection>

          {/* -------------------------------------------------------------- */}
          {/*                       CONDITIONS ET LIMITES                     */}
          {/* -------------------------------------------------------------- */}

          <FormSection
            title="Conditions d’utilisation"
            description="Définissez les plafonds et le montant minimum requis."
            icon={
              <Settings2 className="size-5" />
            }
          >
            <div className="grid gap-5 md:grid-cols-3">
              <label className="block">
                <span className="text-sm font-semibold text-[#2F2027]">
                  Limite globale
                </span>

                <input
                  type="number"
                  min={
                    1
                  }
                  value={
                    usageLimitInput
                  }
                  disabled={
                    isPending
                  }
                  onChange={(
                    event,
                  ) => {
                    setUsageLimitInput(
                      event.target.value,
                    );

                    clearFieldError(
                      "usageLimit",
                    );
                  }}
                  placeholder="Illimitée"
                  className={
                    INPUT_CLASS_NAME
                  }
                />

                <FieldError
                  name="usageLimit"
                  errors={
                    fieldErrors
                  }
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-[#2F2027]">
                  Limite par cliente
                </span>

                <input
                  type="number"
                  min={
                    1
                  }
                  value={
                    perClientLimitInput
                  }
                  disabled={
                    isPending
                  }
                  onChange={(
                    event,
                  ) => {
                    setPerClientLimitInput(
                      event.target.value,
                    );

                    clearFieldError(
                      "perClientLimit",
                    );
                  }}
                  placeholder="Illimitée"
                  className={
                    INPUT_CLASS_NAME
                  }
                />

                <FieldError
                  name="perClientLimit"
                  errors={
                    fieldErrors
                  }
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-[#2F2027]">
                  Dépense minimum
                </span>

                <div className="relative">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={
                      minimumSpendInput
                    }
                    disabled={
                      isPending
                    }
                    onChange={(
                      event,
                    ) => {
                      setMinimumSpendInput(
                        event.target.value,
                      );

                      clearFieldError(
                        "minimumSpendCents",
                      );
                    }}
                    placeholder="50,00"
                    className={`${INPUT_CLASS_NAME} pr-12`}
                  />

                  <span className="pointer-events-none absolute right-4 top-1/2 mt-1 -translate-y-1/2 font-bold text-[#816D75]">
                    €
                  </span>
                </div>

                <FieldError
                  name="minimumSpendCents"
                  errors={
                    fieldErrors
                  }
                />
              </label>
            </div>
          </FormSection>

          {/* -------------------------------------------------------------- */}
          {/*                           PRESTATIONS                           */}
          {/* -------------------------------------------------------------- */}

          <FormSection
            title="Prestations concernées"
            description="Sélectionnez les prestations compatibles avec cette offre."
            icon={
              <Tag className="size-5" />
            }
          >
            <label className="relative block">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#9C858E]" />

              <input
                type="search"
                value={
                  serviceSearch
                }
                onChange={(
                  event,
                ) =>
                  setServiceSearch(
                    event.target.value,
                  )
                }
                placeholder="Rechercher une prestation…"
                className="h-11 w-full rounded-2xl border border-[#E8B4C0]/65 bg-[#FFFDFC] pl-11 pr-4 text-sm text-[#2F2027] outline-none transition focus:border-[#B45F7A] focus:ring-4 focus:ring-[#B45F7A]/10"
              />
            </label>

            <div className="mt-4 flex items-center justify-between gap-4">
              <p className="text-sm text-[#816D75]">
                {values.serviceIds.length} prestation
                {values.serviceIds.length !==
                1
                  ? "s"
                  : ""}{" "}
                sélectionnée
                {values.serviceIds.length !==
                1
                  ? "s"
                  : ""}
              </p>

              {values.serviceIds.length >
              0 ? (
                <button
                  type="button"
                  disabled={
                    isPending
                  }
                  onClick={() =>
                    updateValue(
                      "serviceIds",
                      [],
                    )
                  }
                  className="text-sm font-semibold text-[#843F59] hover:text-[#B45F7A]"
                >
                  Tout désélectionner
                </button>
              ) : null}
            </div>

            <div className="mt-4 grid max-h-[32rem] gap-3 overflow-y-auto pr-1 md:grid-cols-2">
              {filteredServices.map(
                (
                  service,
                ) => {
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
                      disabled={
                        isPending
                      }
                      onClick={() =>
                        toggleService(
                          service.id,
                        )
                      }
                      className={[
                        "flex items-start gap-3 rounded-2xl border p-4 text-left transition",
                        selected
                          ? "border-[#B45F7A] bg-[#FFF0F4]"
                          : "border-[#E8B4C0]/50 bg-[#FFFDFC] hover:border-[#B45F7A]/70",
                        !service.isActive
                          ? "opacity-60"
                          : "",
                      ].join(
                        " ",
                      )}
                    >
                      <span
                        className={[
                          "mt-0.5 grid size-6 shrink-0 place-items-center rounded-lg border",
                          selected
                            ? "border-[#B45F7A] bg-[#B45F7A] text-white"
                            : "border-[#D8C7CD] bg-white text-transparent",
                        ].join(
                          " ",
                        )}
                      >
                        <Check className="size-4" />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-[#2F2027]">
                          {service.name}
                        </span>

                        <span className="mt-1 block text-xs text-[#816D75]">
                          {service.categoryName} · {service.durationMinutes} min ·{" "}
                          {formatServicePrice(
                            service,
                          )}
                        </span>

                        {!service.isActive ? (
                          <span className="mt-2 block text-xs font-semibold text-amber-700">
                            Prestation actuellement masquée
                          </span>
                        ) : null}
                      </span>
                    </button>
                  );
                },
              )}
            </div>

            <FieldError
              name="serviceIds"
              errors={
                fieldErrors
              }
            />
          </FormSection>

          {/* -------------------------------------------------------------- */}
          {/*                             BANNIÈRE                            */}
          {/* -------------------------------------------------------------- */}

          <FormSection
            title="Bannière promotionnelle"
            description="Configurez une bannière liée à cette promotion."
            icon={
              <LayoutPanelTop className="size-5" />
            }
          >
            <ToggleField
              checked={
                values.bannerEnabled
              }
              disabled={
                isPending
              }
              onChange={(
                checked,
              ) =>
                updateValue(
                  "bannerEnabled",
                  checked,
                )
              }
              title="Activer la bannière"
              description="La bannière suivra automatiquement les dates et l’état de la promotion."
            />

            {values.bannerEnabled ? (
              <div className="mt-5 space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-semibold text-[#2F2027]">
                      Titre
                    </span>

                    <input
                      type="text"
                      value={
                        values.bannerTitle
                      }
                      disabled={
                        isPending
                      }
                      onChange={(
                        event,
                      ) =>
                        updateValue(
                          "bannerTitle",
                          event.target.value,
                        )
                      }
                      placeholder="Profitez de -20 %"
                      className={
                        INPUT_CLASS_NAME
                      }
                    />

                    <FieldError
                      name="bannerTitle"
                      errors={
                        fieldErrors
                      }
                    />
                  </label>

                  <label className="block">
                    <span className="text-sm font-semibold text-[#2F2027]">
                      Sous-titre
                    </span>

                    <input
                      type="text"
                      value={
                        values.bannerSubtitle
                      }
                      disabled={
                        isPending
                      }
                      onChange={(
                        event,
                      ) =>
                        updateValue(
                          "bannerSubtitle",
                          event.target.value,
                        )
                      }
                      placeholder="Offre valable pendant une durée limitée"
                      className={
                        INPUT_CLASS_NAME
                      }
                    />

                    <FieldError
                      name="bannerSubtitle"
                      errors={
                        fieldErrors
                      }
                    />
                  </label>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-semibold text-[#2F2027]">
                      Image ordinateur
                    </span>

                    <input
                      type="url"
                      value={
                        values.bannerImageUrl
                      }
                      disabled={
                        isPending
                      }
                      onChange={(
                        event,
                      ) =>
                        updateValue(
                          "bannerImageUrl",
                          event.target.value,
                        )
                      }
                      placeholder="https://..."
                      className={
                        INPUT_CLASS_NAME
                      }
                    />

                    <FieldError
                      name="bannerImageUrl"
                      errors={
                        fieldErrors
                      }
                    />
                  </label>

                  <label className="block">
                    <span className="text-sm font-semibold text-[#2F2027]">
                      Image mobile
                    </span>

                    <input
                      type="url"
                      value={
                        values.bannerMobileImageUrl
                      }
                      disabled={
                        isPending
                      }
                      onChange={(
                        event,
                      ) =>
                        updateValue(
                          "bannerMobileImageUrl",
                          event.target.value,
                        )
                      }
                      placeholder="https://..."
                      className={
                        INPUT_CLASS_NAME
                      }
                    />

                    <FieldError
                      name="bannerMobileImageUrl"
                      errors={
                        fieldErrors
                      }
                    />
                  </label>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-semibold text-[#2F2027]">
                      Libellé du bouton
                    </span>

                    <input
                      type="text"
                      value={
                        values.bannerButtonLabel
                      }
                      disabled={
                        isPending
                      }
                      onChange={(
                        event,
                      ) =>
                        updateValue(
                          "bannerButtonLabel",
                          event.target.value,
                        )
                      }
                      placeholder="Réserver maintenant"
                      className={
                        INPUT_CLASS_NAME
                      }
                    />

                    <FieldError
                      name="bannerButtonLabel"
                      errors={
                        fieldErrors
                      }
                    />
                  </label>

                  <label className="block">
                    <span className="text-sm font-semibold text-[#2F2027]">
                      Adresse du bouton
                    </span>

                    <input
                      type="text"
                      value={
                        values.bannerButtonUrl
                      }
                      disabled={
                        isPending
                      }
                      onChange={(
                        event,
                      ) =>
                        updateValue(
                          "bannerButtonUrl",
                          event.target.value,
                        )
                      }
                      placeholder="/reservation"
                      className={
                        INPUT_CLASS_NAME
                      }
                    />

                    <FieldError
                      name="bannerButtonUrl"
                      errors={
                        fieldErrors
                      }
                    />
                  </label>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-semibold text-[#2F2027]">
                      Couleur de fond
                    </span>

                    <div className="mt-2 flex gap-3">
                      <input
                        type="color"
                        value={
                          values.bannerBackgroundColor ||
                          "#843F59"
                        }
                        disabled={
                          isPending
                        }
                        onChange={(
                          event,
                        ) =>
                          updateValue(
                            "bannerBackgroundColor",
                            event.target.value,
                          )
                        }
                        className="size-11 cursor-pointer rounded-xl border border-[#E8B4C0]/70 bg-white p-1"
                      />

                      <input
                        type="text"
                        value={
                          values.bannerBackgroundColor
                        }
                        disabled={
                          isPending
                        }
                        onChange={(
                          event,
                        ) =>
                          updateValue(
                            "bannerBackgroundColor",
                            event.target.value,
                          )
                        }
                        placeholder="#843F59"
                        className={`${INPUT_CLASS_NAME} mt-0`}
                      />
                    </div>

                    <FieldError
                      name="bannerBackgroundColor"
                      errors={
                        fieldErrors
                      }
                    />
                  </label>

                  <label className="block">
                    <span className="text-sm font-semibold text-[#2F2027]">
                      Couleur du texte
                    </span>

                    <div className="mt-2 flex gap-3">
                      <input
                        type="color"
                        value={
                          values.bannerTextColor ||
                          "#FFFFFF"
                        }
                        disabled={
                          isPending
                        }
                        onChange={(
                          event,
                        ) =>
                          updateValue(
                            "bannerTextColor",
                            event.target.value,
                          )
                        }
                        className="size-11 cursor-pointer rounded-xl border border-[#E8B4C0]/70 bg-white p-1"
                      />

                      <input
                        type="text"
                        value={
                          values.bannerTextColor
                        }
                        disabled={
                          isPending
                        }
                        onChange={(
                          event,
                        ) =>
                          updateValue(
                            "bannerTextColor",
                            event.target.value,
                          )
                        }
                        placeholder="#FFFFFF"
                        className={`${INPUT_CLASS_NAME} mt-0`}
                      />
                    </div>

                    <FieldError
                      name="bannerTextColor"
                      errors={
                        fieldErrors
                      }
                    />
                  </label>
                </div>

                <div
                  className="overflow-hidden rounded-[1.5rem] border border-black/10 p-5 shadow-inner"
                  style={{
                    backgroundColor:
                      values.bannerBackgroundColor ||
                      "#843F59",

                    color:
                      values.bannerTextColor ||
                      "#FFFFFF",
                  }}
                >
                  <p className="text-xs font-bold uppercase tracking-[0.18em] opacity-70">
                    Aperçu
                  </p>

                  <p className="mt-3 text-xl font-black">
                    {values.bannerTitle ||
                      "Titre de la bannière"}
                  </p>

                  <p className="mt-1 text-sm opacity-80">
                    {values.bannerSubtitle ||
                      "Sous-titre de la bannière"}
                  </p>

                  {values.bannerButtonLabel ? (
                    <span className="mt-4 inline-flex rounded-full bg-white px-4 py-2 text-xs font-bold text-[#2F2027]">
                      {values.bannerButtonLabel}
                    </span>
                  ) : null}
                </div>
              </div>
            ) : null}
          </FormSection>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/*                            COLONNE LATÉRALE                       */}
        {/* ---------------------------------------------------------------- */}

        <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
          <FormSection
            title="Publication"
            description="Contrôlez la visibilité et l’état de l’offre."
            icon={
              <Sparkles className="size-5" />
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
                title="Promotion active"
                description="La promotion peut être utilisée pendant sa période de validité."
              />

              <ToggleField
                checked={
                  values.showOnHomepage
                }
                disabled={
                  isPending
                }
                onChange={(
                  checked,
                ) =>
                  updateValue(
                    "showOnHomepage",
                    checked,
                  )
                }
                title="Afficher sur l’accueil"
                description="L’offre pourra être mise en avant sur la page d’accueil."
              />
            </div>
          </FormSection>

          <FormSection
            title="Résumé"
            description="Vérifiez les principaux réglages avant l’enregistrement."
            icon={
              <BadgePercent className="size-5" />
            }
          >
            <dl className="space-y-4 text-sm">
              <div className="flex items-start justify-between gap-4">
                <dt className="text-[#816D75]">
                  Type
                </dt>

                <dd className="text-right font-bold text-[#2F2027]">
                  {
                    TYPE_OPTIONS.find(
                      (
                        option,
                      ) =>
                        option.value ===
                        values.type,
                    )?.label
                  }
                </dd>
              </div>

              <div className="flex items-start justify-between gap-4">
                <dt className="text-[#816D75]">
                  Prestations
                </dt>

                <dd className="text-right font-bold text-[#2F2027]">
                  {selectedServices.length}
                </dd>
              </div>

              <div className="flex items-start justify-between gap-4">
                <dt className="text-[#816D75]">
                  Code
                </dt>

                <dd className="text-right font-mono font-bold text-[#2F2027]">
                  {values.code ||
                    "Aucun"}
                </dd>
              </div>

              <div className="flex items-start justify-between gap-4">
                <dt className="text-[#816D75]">
                  Bannière
                </dt>

                <dd className="text-right font-bold text-[#2F2027]">
                  {values.bannerEnabled
                    ? "Activée"
                    : "Désactivée"}
                </dd>
              </div>
            </dl>
          </FormSection>

          <div className="rounded-[2rem] border border-[#E8B4C0]/50 bg-gradient-to-br from-[#2F2027] to-[#843F59] p-6 text-white shadow-xl shadow-[#843F59]/15">
            <span className="grid size-11 place-items-center rounded-2xl bg-white/10">
              {values.type ===
              "FIXED_AMOUNT" ? (
                <CircleDollarSign className="size-5" />
              ) : values.imageUrl ? (
                <ImageIcon className="size-5" />
              ) : (
                <BadgePercent className="size-5" />
              )}
            </span>

            <p className="mt-4 font-bold">
              {mode ===
              "CREATE"
                ? "Nouvelle promotion"
                : "Modification de la promotion"}
            </p>

            <p className="mt-2 text-xs leading-5 text-white/65">
              Les informations seront validées côté serveur avant
              l’enregistrement.
            </p>

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
                  ? "Créer la promotion"
                  : "Enregistrer les modifications"}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
