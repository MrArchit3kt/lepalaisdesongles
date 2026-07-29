import type {
  Metadata,
} from "next";

import {
  notFound,
} from "next/navigation";

import {
  BadgePercent,
  CalendarClock,
  ChartNoAxesCombined,
  Eye,
  EyeOff,
  House,
  Sparkles,
  TicketCheck,
} from "lucide-react";

import {
  AdminPromotionForm,
} from "@/features/admin/promotions/components/admin-promotion-form";

import {
  getAdminPromotionFormData,
} from "@/features/admin/promotions/services/admin-promotions.service";

import type {
  AdminPromotionDetails,
  AdminPromotionFormInput,
} from "@/features/admin/promotions/types/admin-promotions.types";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type AdminPromotionPageProps = {
  params:
    Promise<{
      id:
        string;
    }>;
};

/* -------------------------------------------------------------------------- */
/*                                  MÉTADONNÉES                               */
/* -------------------------------------------------------------------------- */

export const dynamic =
  "force-dynamic";

export async function generateMetadata({
  params,
}: AdminPromotionPageProps): Promise<Metadata> {
  const {
    id,
  } =
    await params;

  try {
    const {
      promotion,
    } =
      await getAdminPromotionFormData(
        id,
      );

    if (
      !promotion
    ) {
      return {
        title:
          "Promotion introuvable | Administration",
      };
    }

    return {
      title:
        `${promotion.name} | Promotions`,

      description:
        `Modification de la promotion ${promotion.name}.`,
    };
  } catch {
    return {
      title:
        "Promotion introuvable | Administration",
    };
  }
}

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

function normalizePromotionFormValue(
  promotion:
    AdminPromotionDetails,
): AdminPromotionFormInput {
  const banner =
    promotion.banner ??
    promotion.banners[0] ??
    null;

  return {
    id:
      promotion.id,

    name:
      promotion.name,

    slug:
      promotion.slug,

    description:
      promotion.description ??
      "",

    type:
      promotion.type,

    percentageValue:
      promotion.percentageValue,

    amountCents:
      promotion.amountCents,

    code:
      promotion.code ??
      "",

    imageUrl:
      promotion.imageUrl ??
      "",

    startsAt:
      promotion.startsAt,

    endsAt:
      promotion.endsAt,

    usageLimit:
      promotion.usageLimit,

    perClientLimit:
      promotion.perClientLimit,

    minimumSpendCents:
      promotion.minimumSpendCents,

    isActive:
      promotion.isActive,

    showOnHomepage:
      promotion.showOnHomepage,

    serviceIds:
      promotion.services.map(
        (
          service,
        ) =>
          service.id,
      ),

    bannerEnabled:
      banner !==
        null,

    bannerTitle:
      banner?.title ??
      "",

    bannerSubtitle:
      banner?.subtitle ??
      "",

    bannerImageUrl:
      banner?.imageUrl ??
      "",

    bannerMobileImageUrl:
      banner?.mobileImageUrl ??
      "",

    bannerButtonLabel:
      banner?.buttonLabel ??
      "",

    bannerButtonUrl:
      banner?.buttonUrl ??
      "",

    bannerBackgroundColor:
      banner?.backgroundColor ??
      "#843F59",

    bannerTextColor:
      banner?.textColor ??
      "#FFFFFF",
  };
}

function formatDate(
  value:
    string,
): string {
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

/* -------------------------------------------------------------------------- */
/*                                   PAGE                                     */
/* -------------------------------------------------------------------------- */

export default async function EditAdminPromotionPage({
  params,
}: AdminPromotionPageProps) {
  const {
    id,
  } =
    await params;

  let formData:
    Awaited<
      ReturnType<
        typeof getAdminPromotionFormData
      >
    >;

  try {
    formData =
      await getAdminPromotionFormData(
        id,
      );
  } catch (
    error:
      unknown
  ) {
    console.error(
      "[ADMIN_PROMOTION_EDIT_PAGE]",
      error,
    );

    notFound();
  }

  const {
    promotion,
    serviceOptions,
  } =
    formData;

  if (
    !promotion
  ) {
    notFound();
  }

  const initialValue =
    normalizePromotionFormValue(
      promotion,
    );

  return (
    <main className="min-h-screen">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* ---------------------------------------------------------------- */}
        {/*                                HERO                              */}
        {/* ---------------------------------------------------------------- */}

        <section className="relative mb-6 overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#2F2027] via-[#5E3544] to-[#B45F7A] px-6 py-8 text-white shadow-xl shadow-[#843F59]/15 sm:px-8 lg:px-10">
          <div className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-[#E8B4C0]/25 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-32 left-1/3 size-72 rounded-full bg-white/10 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-7 xl:flex-row xl:items-start">
            <div className="flex items-start gap-5">
              <span className="grid size-14 shrink-0 place-items-center rounded-3xl bg-white/10 text-white backdrop-blur">
                <BadgePercent className="size-7" />
              </span>

              <div>
                <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#FFF0F4]/75">
                  <Sparkles className="size-4" />

                  Modification de la promotion
                </div>

                <h1 className="mt-3 font-serif text-4xl font-semibold sm:text-5xl">
                  {promotion.name}
                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-white/75 sm:text-base">
                  Modifiez l’offre, sa période de diffusion et les prestations
                  auxquelles elle s’applique.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[28rem]">
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/60">
                  {promotion.isActive ? (
                    <Eye className="size-4" />
                  ) : (
                    <EyeOff className="size-4" />
                  )}

                  État
                </p>

                <p className="mt-2 font-bold">
                  {promotion.isActive
                    ? "Promotion activée"
                    : "Promotion désactivée"}
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/60">
                  <TicketCheck className="size-4" />

                  Utilisations
                </p>

                <p className="mt-2 font-bold">
                  {promotion.usageCount}
                  {promotion.usageLimit !==
                  null
                    ? ` / ${promotion.usageLimit}`
                    : " sans limite"}
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/60">
                  <CalendarClock className="size-4" />

                  Période
                </p>

                <p className="mt-2 text-sm font-bold">
                  {formatDate(
                    promotion.startsAt,
                  )}
                </p>

                <p className="mt-1 text-xs text-white/65">
                  au{" "}
                  {formatDate(
                    promotion.endsAt,
                  )}
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/60">
                  {promotion.showOnHomepage ? (
                    <House className="size-4" />
                  ) : (
                    <ChartNoAxesCombined className="size-4" />
                  )}

                  Diffusion
                </p>

                <p className="mt-2 font-bold">
                  {promotion.showOnHomepage
                    ? "Affichée sur l’accueil"
                    : "Non affichée sur l’accueil"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/*                             FORMULAIRE                            */}
        {/* ---------------------------------------------------------------- */}

        <AdminPromotionForm
          mode="EDIT"
          promotionId={
            promotion.id
          }
          serviceOptions={
            serviceOptions
          }
          initialValue={
            initialValue
          }
        />
      </div>
    </main>
  );
}
