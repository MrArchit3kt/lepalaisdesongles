"use client";

import {
  Check,
  Clock3,
  CreditCard,
  Layers3,
  Minus,
  Plus,
  Sparkles,
} from "lucide-react";

import { cn } from "@/lib/utils";

import type {
  Category,
  ReservationServiceOption,
  ServiceItem,
} from "./reservation.types";

type ReservationServicesProps = {
  categories: Category[];
  selectedServiceIds: string[];
  serviceOptions: ReservationServiceOption[];
  onToggleService: (serviceId: string) => void;
  onQuantityChange: (
    serviceId: string,
    quantity: number,
  ) => void;
};

function formatPrice(cents: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

function getDisplayedPrice(
  service: ServiceItem,
): number {
  return (
    service.promotionalPriceCents ??
    service.priceCents
  );
}

function hasPromotion(
  service: ServiceItem,
): boolean {
  return (
    service.promotionalPriceCents !== null &&
    service.promotionalPriceCents <
      service.priceCents
  );
}

function supportsQuantity(
  service: ServiceItem,
): boolean {
  return (
    service.slug === "nail-art" ||
    service.slug === "decoration"
  );
}

export function ReservationServices({
  categories,
  selectedServiceIds,
  serviceOptions,
  onToggleService,
  onQuantityChange,
}: ReservationServicesProps) {
  const selectedCount =
    selectedServiceIds.length;

  const totalServiceCount =
    categories.reduce(
      (total, category) =>
        total + category.services.length,
      0,
    );

  const quantityServices = categories
    .flatMap((category) => category.services)
    .filter(
      (service) =>
        selectedServiceIds.includes(service.id) &&
        supportsQuantity(service),
    );

  function getQuantity(
    serviceId: string,
  ): number {
    return (
      serviceOptions.find(
        (option) =>
          option.serviceId === serviceId,
      )?.quantity ?? 1
    );
  }

  return (
    <section
      id="reservation-services"
      aria-labelledby="reservation-services-title"
      className="relative overflow-hidden rounded-[2rem] border border-[#EFDEE4] bg-white/95 p-5 shadow-[0_22px_58px_rgba(85,38,55,0.09)] backdrop-blur sm:p-7 lg:p-8"
    >
      <div className="pointer-events-none absolute -right-24 -top-24 size-64 rounded-full bg-[#E8B4C0]/28 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-32 -left-24 size-72 rounded-full bg-[#D6B679]/12 blur-3xl" />

      <div className="relative">
        <header className="flex flex-col gap-5 border-b border-[#F0E1E6] pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-white/40 bg-gradient-to-br from-[#C97992] via-[#B45F7A] to-[#843F59] text-white shadow-[0_12px_28px_rgba(132,63,89,0.24)]">
              <Sparkles className="size-5" />
            </span>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#A5526D]">
                Étape 1
              </p>

              <h2
                id="reservation-services-title"
                className="mt-2 font-serif text-3xl font-semibold tracking-tight text-[#2F2027] sm:text-4xl"
              >
                Choisissez vos prestations
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-[#816D75]">
                Vous pouvez sélectionner plusieurs
                prestations. La durée et le prix seront
                automatiquement calculés dans votre
                résumé.
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#E8C3CF] bg-[#FFF8FA] px-4 py-2 text-xs font-black text-[#816D75] shadow-sm">
              <Layers3 className="size-4 text-[#A5526D]" />

              {totalServiceCount} prestation
              {totalServiceCount > 1 ? "s" : ""}
            </span>

            {selectedCount > 0 ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#B45F7A] to-[#843F59] px-4 py-2 text-xs font-black text-white shadow-[0_8px_20px_rgba(132,63,89,0.22)]">
                <Check className="size-4" />

                {selectedCount} sélectionnée
                {selectedCount > 1 ? "s" : ""}
              </span>
            ) : null}
          </div>
        </header>

        {categories.length > 0 ? (
          <div className="mt-8 space-y-10">
            {categories.map((category) => (
              <section
                key={category.id}
                aria-labelledby={`category-${category.id}`}
              >
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h3
                      id={`category-${category.id}`}
                      className="font-serif text-2xl font-semibold text-[#2F2027]"
                    >
                      {category.name}
                    </h3>

                    {category.description ? (
                      <p className="mt-1 max-w-2xl text-sm leading-6 text-[#816D75]">
                        {category.description}
                      </p>
                    ) : null}
                  </div>

                  <span className="rounded-full bg-[#FFF4F7] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-[#A68C96]">
                    {category.services.length} choix
                  </span>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {category.services.map(
                    (service) => {
                      const selected =
                        selectedServiceIds.includes(
                          service.id,
                        );

                      const displayedPrice =
                        getDisplayedPrice(service);

                      const promotion =
                        hasPromotion(service);

                      return (
                        <button
                          key={service.id}
                          type="button"
                          onClick={() =>
                            onToggleService(
                              service.id,
                            )
                          }
                          aria-pressed={selected}
                          className={cn(
                            "group relative flex min-h-48 flex-col overflow-hidden rounded-[1.65rem] border p-5 text-left outline-none transition duration-300 focus-visible:ring-4 focus-visible:ring-[#E8B4C0]/30 sm:p-6",
                            selected
                              ? "border-[#B45F7A] bg-gradient-to-br from-white via-[#FFF2F6] to-[#F6DCE4] shadow-[0_20px_48px_rgba(132,63,89,0.14)] ring-1 ring-[#D8AAB9]/40"
                              : "border-[#EFDEE4] bg-white/90 shadow-[0_10px_28px_rgba(85,38,55,0.05)] hover:-translate-y-1 hover:border-[#DDBAC5] hover:bg-white hover:shadow-[0_20px_46px_rgba(132,63,89,0.11)]",
                          )}
                        >
                          <span
                            aria-hidden="true"
                            className={cn(
                              "pointer-events-none absolute -right-12 -top-14 size-36 rounded-full blur-2xl transition duration-300",
                              selected
                                ? "bg-[#E8B4C0]/55"
                                : "bg-[#FFF0F4]/0 group-hover:bg-[#E8B4C0]/28",
                            )}
                          />

                          <div className="relative flex items-start justify-between gap-4">
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                {promotion ? (
                                  <span className="inline-flex rounded-full bg-gradient-to-r from-[#D6B679] to-[#B9924C] px-3 py-1 text-[0.65rem] font-black uppercase tracking-[0.12em] text-white shadow-sm">
                                    Offre spéciale
                                  </span>
                                ) : null}

                                {service.depositRequired ? (
                                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E8C3CF] bg-white/85 px-3 py-1 text-[0.68rem] font-black text-[#A5526D] shadow-sm">
                                    <CreditCard className="size-3" />
                                    Acompte
                                  </span>
                                ) : null}
                              </div>

                              <h4 className="mt-3 pr-2 font-serif text-2xl font-semibold leading-tight text-[#2F2027]">
                                {service.name}
                              </h4>
                            </div>

                            <span
                              className={cn(
                                "grid size-10 shrink-0 place-items-center rounded-full border transition duration-300",
                                selected
                                  ? "border-[#D6B679] bg-gradient-to-br from-[#B45F7A] to-[#843F59] text-white shadow-[0_9px_22px_rgba(132,63,89,0.24)]"
                                  : "border-[#E8DDE1] bg-white text-[#A68C96] group-hover:border-[#D8AAB9] group-hover:text-[#A5526D]",
                              )}
                            >
                              {selected ? (
                                <Check className="size-5" />
                              ) : (
                                <Plus className="size-5" />
                              )}
                            </span>
                          </div>

                          <p className="relative mt-3 line-clamp-3 text-sm leading-6 text-[#816D75]">
                            {service.shortDescription ??
                              "Découvrez cette prestation personnalisable selon vos envies et votre style."}
                          </p>

                          <div className="relative mt-auto flex flex-wrap items-end justify-between gap-4 pt-6">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="inline-flex items-center gap-2 rounded-full border border-[#EFDEE4] bg-white/90 px-3 py-2 text-xs font-black text-[#705D65] shadow-sm">
                                <Clock3 className="size-4 text-[#A5526D]" />

                                {
                                  service.durationMinutes
                                }{" "}
                                min
                              </span>

                              {service.depositRequired &&
                              service.depositCents ? (
                                <span className="inline-flex items-center gap-2 rounded-full border border-[#EFDEE4] bg-white/90 px-3 py-2 text-xs font-black text-[#705D65] shadow-sm">
                                  <CreditCard className="size-4 text-[#A5526D]" />

                                  Acompte{" "}
                                  {formatPrice(
                                    service.depositCents,
                                  )}
                                </span>
                              ) : null}
                            </div>

                            <div className="text-right">
                              {promotion ? (
                                <p className="text-xs text-[#A68C96] line-through">
                                  {formatPrice(
                                    service.priceCents,
                                  )}
                                </p>
                              ) : null}

                              <p className="font-serif text-xl font-semibold text-[#2F2027]">
                                {formatPrice(
                                  displayedPrice,
                                )}
                              </p>
                            </div>
                          </div>

                          {selected ? (
                            <div className="relative mt-5 flex items-center gap-2 border-t border-[#DDBAC5] pt-4 text-xs font-black text-[#A5526D]">
                              <Check className="size-4" />
                              Ajoutée à votre réservation
                            </div>
                          ) : (
                            <div className="relative mt-5 flex items-center gap-2 border-t border-[#F0E1E6] pt-4 text-xs font-black text-[#8E747E] transition group-hover:text-[#A5526D]">
                              <Plus className="size-4" />
                              Ajouter cette prestation
                            </div>
                          )}
                        </button>
                      );
                    },
                  )}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-[1.75rem] border border-dashed border-[#D9B4C0] bg-gradient-to-br from-white to-[#FFF4F7] px-6 py-14 text-center shadow-[0_16px_40px_rgba(85,38,55,0.05)]">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl border border-[#E8C3CF] bg-gradient-to-br from-[#FFF0F5] to-[#F4D4DE] text-[#A5526D] shadow-sm">
              <Sparkles className="size-6" />
            </span>

            <h3 className="mt-5 font-serif text-2xl font-semibold text-[#2F2027]">
              Aucune prestation disponible
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#816D75]">
              Les prestations réservables seront bientôt
              affichées ici.
            </p>
          </div>
        )}

        {quantityServices.length > 0 ? (
          <div className="mt-8 rounded-[1.75rem] border border-[#E8C3CF] bg-gradient-to-br from-[#FFF8FA] to-white p-5 shadow-[0_14px_34px_rgba(132,63,89,0.08)] sm:p-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#A5526D]">
                Personnalisation
              </p>

              <h3 className="mt-2 font-serif text-2xl font-semibold text-[#2F2027]">
                Choisissez la quantité
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#816D75]">
                Indiquez le nombre d’ongles concernés.
                Le prix et la durée sont recalculés
                automatiquement.
              </p>
            </div>

            <div className="mt-5 grid gap-3">
              {quantityServices.map((service) => {
                const quantity =
                  getQuantity(service.id);

                const unitPrice =
                  getDisplayedPrice(service);

                return (
                  <div
                    key={service.id}
                    className="flex flex-col gap-4 rounded-[1.35rem] border border-[#EFDEE4] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-black text-[#49363E]">
                        {service.name}
                      </p>

                      <p className="mt-1 text-xs text-[#816D75]">
                        {formatPrice(unitPrice)} par ongle
                        {" · "}
                        {service.durationMinutes} min
                        par ongle
                      </p>

                      <p className="mt-2 text-sm font-black text-[#A5526D]">
                        Total :{" "}
                        {formatPrice(
                          unitPrice * quantity,
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        aria-label={`Diminuer la quantité pour ${service.name}`}
                        disabled={quantity <= 1}
                        onClick={() =>
                          onQuantityChange(
                            service.id,
                            quantity - 1,
                          )
                        }
                        className="grid size-11 place-items-center rounded-full border border-[#E8C3CF] bg-white text-[#A5526D] shadow-sm transition hover:bg-[#FFF2F6] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Minus className="size-4" />
                      </button>

                      <output
                        aria-live="polite"
                        className="grid min-w-14 place-items-center rounded-2xl bg-gradient-to-br from-[#B45F7A] to-[#843F59] px-4 py-3 text-base font-black text-white shadow-sm"
                      >
                        {quantity}
                      </output>

                      <button
                        type="button"
                        aria-label={`Augmenter la quantité pour ${service.name}`}
                        disabled={quantity >= 10}
                        onClick={() =>
                          onQuantityChange(
                            service.id,
                            quantity + 1,
                          )
                        }
                        className="grid size-11 place-items-center rounded-full border border-[#E8C3CF] bg-white text-[#A5526D] shadow-sm transition hover:bg-[#FFF2F6] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Plus className="size-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}