import type {
  Metadata,
} from "next";

import {
  ArrowRight,
  BadgePercent,
  CalendarDays,
  Clock3,
  Gift,
  Hourglass,
  Sparkles,
  Tag,
  TicketCheck,
} from "lucide-react";

import Image from "next/image";
import Link from "next/link";

import {
  getPublicWebsiteSettings,
} from "@/features/admin/settings/services/admin-settings.service";

import {
  getPublicPromotionsPageData,
} from "@/features/public/services/public-promotions.service";

import { PromotionsHero } from "@/features/public/components/promotions/promotions-hero";

import {
  formatPrice,
} from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*                                MÉTADONNÉES                                 */
/* -------------------------------------------------------------------------- */

export const metadata:
  Metadata = {
  title:
    "Promotions et offres",

  description:
    "Découvrez les promotions actives et les prochaines offres du Palais des Ongles.",
};

export const dynamic =
  "force-dynamic";

export const revalidate =
  0;

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

function formatDate(
  value: Date,
): string {
  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      day:
        "numeric",

      month:
        "long",

      year:
        "numeric",
    },
  ).format(
    value,
  );
}

function formatPromotionValue(
  promotion: {
    type:
      | "PERCENTAGE"
      | "FIXED_AMOUNT"
      | "FREE_SERVICE"
      | "CUSTOM";

    percentageValue:
      number | null;

    amountCents:
      number | null;
  },
): string {
  switch (
    promotion.type
  ) {
    case "PERCENTAGE":
      return promotion.percentageValue !==
        null
        ? `-${promotion.percentageValue} %`
        : "Réduction";

    case "FIXED_AMOUNT":
      return promotion.amountCents !==
        null
        ? `-${formatPrice(
            promotion.amountCents,
          )}`
        : "Réduction";

    case "FREE_SERVICE":
      return "Offert";

    case "CUSTOM":
    default:
      return "Offre spéciale";
  }
}

function getPromotionImage(
  promotion: {
    imageUrl:
      string | null;

    banner: {
      imageUrl:
        string | null;
    } | null;
  },

  defaultImageUrl:
    string,
): string {
  return (
    promotion.imageUrl ??
    promotion.banner
      ?.imageUrl ??
    defaultImageUrl
  );
}

/* -------------------------------------------------------------------------- */
/*                        CARTE D’UNE PROMOTION                               */
/* -------------------------------------------------------------------------- */

type PromotionCardProps = {
  promotion:
    Awaited<
      ReturnType<
        typeof getPublicPromotionsPageData
      >
    >["activePromotions"][number];

  status:
    "ACTIVE" | "UPCOMING";

  defaultImageUrl:
    string;
};

function PromotionCard({
  promotion,
  status,
  defaultImageUrl,
}: PromotionCardProps) {
  const imageUrl =
    getPromotionImage(
      promotion,
      defaultImageUrl,
    );

  const promotionValue =
    formatPromotionValue(
      promotion,
    );

  const isActive =
    status ===
    "ACTIVE";

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[34px] border border-[#35242B]/8 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#8B405A]/10">
      <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-[#F6E7EB] to-[#DCA8B8]">
        {imageUrl ? (
          <>
            <Image
              src={
                imageUrl
              }
              alt={
                promotion.name
              }
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition duration-500 group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#35242B]/75 via-transparent to-[#35242B]/10" />
          </>
        ) : (
          <div className="flex size-full items-center justify-center">
            <span className="grid size-28 place-items-center rounded-full border border-white/40 bg-white/25 text-white backdrop-blur">
              <BadgePercent className="size-12" />
            </span>
          </div>
        )}

        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-4 p-5">
          <span
            className={[
              "inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold shadow-lg backdrop-blur",
              isActive
                ? "bg-emerald-50/95 text-emerald-700"
                : "bg-white/95 text-[#8B405A]",
            ].join(
              " ",
            )}
          >
            {isActive ? (
              <TicketCheck className="size-4" />
            ) : (
              <Hourglass className="size-4" />
            )}

            {isActive
              ? "En cours"
              : "À venir"}
          </span>

          <span className="rounded-full bg-[#35242B]/90 px-4 py-2 text-sm font-black text-white shadow-lg backdrop-blur">
            {promotionValue}
          </span>
        </div>

        <div className="absolute inset-x-5 bottom-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
            Offre du Palais des Ongles
          </p>

          <h2 className="mt-2 font-serif text-3xl font-semibold leading-tight text-white sm:text-4xl">
            {promotion.name}
          </h2>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <p className="text-sm leading-7 text-[#79636C]">
          {promotion.description ??
            "Profitez de cette offre exclusive pendant sa période de validité."}
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="flex items-start gap-3 rounded-2xl bg-[#FFFAFB] p-4">
            <CalendarDays className="mt-0.5 size-5 shrink-0 text-[#A64D69]" />

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#8C747D]">
                {isActive
                  ? "Valable jusqu’au"
                  : "Commence le"}
              </p>

              <p className="mt-1 text-sm font-bold text-[#35242B]">
                {formatDate(
                  isActive
                    ? promotion.endsAt
                    : promotion.startsAt,
                )}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl bg-[#FFFAFB] p-4">
            <Clock3 className="mt-0.5 size-5 shrink-0 text-[#A64D69]" />

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#8C747D]">
                Période
              </p>

              <p className="mt-1 text-sm font-bold text-[#35242B]">
                Du{" "}
                {formatDate(
                  promotion.startsAt,
                )}{" "}
                au{" "}
                {formatDate(
                  promotion.endsAt,
                )}
              </p>
            </div>
          </div>
        </div>

        {promotion.code ? (
          <div className="mt-5 flex items-center justify-between gap-4 rounded-2xl border border-dashed border-[#A64D69]/45 bg-[#FFF0F4] px-5 py-4">
            <div className="flex items-center gap-3">
              <Tag className="size-5 text-[#A64D69]" />

              <div>
                <p className="text-xs text-[#6F5962]">
                  Code promotionnel
                </p>

                <p className="mt-1 font-mono text-lg font-black tracking-[0.16em] text-[#35242B]">
                  {promotion.code}
                </p>
              </div>
            </div>

            <span className="text-xs font-semibold text-[#A64D69]">
              À indiquer lors de la réservation
            </span>
          </div>
        ) : null}

        <div className="mt-5 space-y-3">
          {promotion.minimumSpendCents !==
          null ? (
            <div className="flex items-center gap-3 text-sm text-[#5B4A52]">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#FFF0F4] text-[#A64D69]">
                <Gift className="size-4" />
              </span>

              Minimum de commande :{" "}
              <strong className="text-[#35242B]">
                {formatPrice(
                  promotion.minimumSpendCents,
                )}
              </strong>
            </div>
          ) : null}

          {promotion.remainingUses !==
          null ? (
            <div className="flex items-center gap-3 text-sm text-[#5B4A52]">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#FFF0F4] text-[#A64D69]">
                <TicketCheck className="size-4" />
              </span>

              {promotion.remainingUses} utilisation
              {promotion.remainingUses !==
              1
                ? "s"
                : ""}{" "}
              restante
              {promotion.remainingUses !==
              1
                ? "s"
                : ""}
            </div>
          ) : null}
        </div>

        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8C747D]">
            Prestations concernées
          </p>

          {promotion.services.length >
          0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {promotion.services.map(
                (
                  service,
                ) => (
                  <Link
                    key={
                      service.id
                    }
                    href={`/prestations/${service.slug}`}
                    className="rounded-full border border-[#35242B]/8 bg-[#FFFAFB] px-4 py-2 text-xs font-semibold text-[#4A3540] transition hover:border-[#A64D69] hover:bg-[#FFF0F4]"
                  >
                    {service.name}
                  </Link>
                ),
              )}
            </div>
          ) : (
            <p className="mt-2 text-sm text-[#5B4A52]">
              Offre valable sur toutes les prestations éligibles.
            </p>
          )}
        </div>

        <div className="mt-auto pt-7">
          <Link
            href={
              isActive
                ? "/reservation"
                : "/prestations"
            }
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#35242B] px-6 text-sm font-semibold text-white shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-[#4A2E38]"
          >
            {isActive
              ? "Profiter de l’offre"
              : "Découvrir les prestations"}

            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   PAGE                                     */
/* -------------------------------------------------------------------------- */

export default async function PromotionsPage() {
  const [
    data,
    websiteSettings,
  ] =
    await Promise.all([
      getPublicPromotionsPageData(),
      getPublicWebsiteSettings(),
    ]);

  return (
    <main className="bg-[#FFFAFB]">
      {/* ------------------------------------------------------------------ */}
      {/*                               HERO                                 */}
      {/* ------------------------------------------------------------------ */}

      <PromotionsHero
        activeCount={data.statistics.activeCount}
        upcomingCount={data.statistics.upcomingCount}
      />

      {/* ------------------------------------------------------------------ */}

      <section
        id="active-promotions"
        className="mx-auto max-w-7xl scroll-mt-24 px-5 py-9 sm:py-12 lg:px-8 lg:py-24"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#A44E69]">
            Offres disponibles
          </p>

          <h2 className="mt-4 font-serif text-4xl text-[#35242B] sm:text-5xl">
            Promotions en cours
          </h2>

          <p className="mt-4 max-w-2xl leading-7 text-[#79636C]">
            Profitez de ces avantages avant leur date de fin ou
            avant épuisement du nombre d’utilisations.
          </p>
        </div>

        {data.activePromotions.length >
        0 ? (
          <div className="mt-10 grid gap-7 lg:grid-cols-2">
            {data.activePromotions.map(
              (
                promotion,
              ) => (
                <PromotionCard
                  key={
                    promotion.id
                  }
                  promotion={
                    promotion
                  }
                  status="ACTIVE"
                  defaultImageUrl={
                    websiteSettings.defaultServiceImageUrl
                  }
                />
              ),
            )}
          </div>
        ) : (
          <div className="mt-10 rounded-[34px] border border-dashed border-[#35242B]/15 bg-white px-6 py-16 text-center">
            <span className="mx-auto grid size-16 place-items-center rounded-full bg-[#FFF0F4] text-[#A64D69]">
              <Sparkles className="size-7" />
            </span>

            <h3 className="mt-5 font-serif text-3xl text-[#35242B]">
              Aucune promotion active
            </h3>

            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#79636C]">
              De nouvelles offres seront prochainement disponibles.
            </p>
          </div>
        )}
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*                         PROMOTIONS À VENIR                          */}
      {/* ------------------------------------------------------------------ */}

      {data.upcomingPromotions.length >
      0 ? (
        <section className="bg-white py-9 sm:py-12 lg:py-24">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#A44E69]">
                Prochainement
              </p>

              <h2 className="mt-4 font-serif text-4xl text-[#35242B] sm:text-5xl">
                Promotions à venir
              </h2>

              <p className="mt-4 max-w-2xl leading-7 text-[#79636C]">
                Notez les dates pour ne manquer aucune prochaine
                offre du salon.
              </p>
            </div>

            <div className="mt-10 grid gap-7 lg:grid-cols-2">
              {data.upcomingPromotions.map(
                (
                  promotion,
                ) => (
                  <PromotionCard
                    key={
                      promotion.id
                    }
                    promotion={
                      promotion
                    }
                    status="UPCOMING"
                    defaultImageUrl={
                      websiteSettings.defaultServiceImageUrl
                    }
                  />
                ),
              )}
            </div>
          </div>
        </section>
      ) : null}

      {/* ------------------------------------------------------------------ */}
      {/*                                CTA                                 */}
      {/* ------------------------------------------------------------------ */}

      <section className="px-5 py-10 sm:py-14 lg:px-8 lg:py-28">
        <div className="mx-auto flex max-w-7xl flex-col gap-7 rounded-[38px] bg-[#35242B] p-8 text-white sm:p-12 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#E8B3C3]">
              Votre prochain rendez-vous
            </p>

            <h2 className="mt-4 font-serif text-4xl">
              Choisissez votre prestation et votre créneau.
            </h2>

            <p className="mt-4 max-w-2xl leading-7 text-white/60">
              Les conditions de la promotion seront vérifiées lors
              de la réservation ou de sa confirmation.
            </p>
          </div>

          <Link
            href="/reservation"
            className="inline-flex h-13 shrink-0 items-center justify-center gap-2 rounded-full bg-white px-7 text-sm font-semibold text-[#35242B] transition hover:bg-[#FFF0F4]"
          >
            <CalendarDays className="size-4" />

            Prendre rendez-vous
          </Link>
        </div>
      </section>
    </main>
  );
}
