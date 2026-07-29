import type {
  Metadata,
} from "next";

import {
  BadgePercent,
  Sparkles,
} from "lucide-react";

import {
  AdminPromotionForm,
} from "@/features/admin/promotions/components/admin-promotion-form";

import {
  getAdminPromotionFormData,
} from "@/features/admin/promotions/services/admin-promotions.service";

import type {
  AdminPromotionFormInput,
} from "@/features/admin/promotions/types/admin-promotions.types";

/* -------------------------------------------------------------------------- */
/*                                  MÉTADONNÉES                               */
/* -------------------------------------------------------------------------- */

export const metadata:
  Metadata = {
    title:
      "Nouvelle promotion | Administration",

    description:
      "Création d’une nouvelle promotion.",
  };

export const dynamic =
  "force-dynamic";

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

function createDefaultPromotionFormValue():
  AdminPromotionFormInput {
  const now =
    new Date();

  const startsAt =
    new Date(
      now.getTime() +
        60 * 60 * 1000,
    );

  startsAt.setMinutes(
    0,
    0,
    0,
  );

  const endsAt =
    new Date(
      startsAt.getTime() +
        14 *
          24 *
          60 *
          60 *
          1000,
    );

  return {
    name:
      "",

    slug:
      "",

    description:
      "",

    type:
      "PERCENTAGE",

    percentageValue:
      10,

    amountCents:
      null,

    code:
      "",

    imageUrl:
      "",

    startsAt:
      startsAt.toISOString(),

    endsAt:
      endsAt.toISOString(),

    usageLimit:
      null,

    perClientLimit:
      null,

    minimumSpendCents:
      null,

    isActive:
      false,

    showOnHomepage:
      false,

    serviceIds:
      [],

    bannerEnabled:
      false,

    bannerTitle:
      "",

    bannerSubtitle:
      "",

    bannerImageUrl:
      "",

    bannerMobileImageUrl:
      "",

    bannerButtonLabel:
      "Réserver maintenant",

    bannerButtonUrl:
      "/reservation",

    bannerBackgroundColor:
      "#843F59",

    bannerTextColor:
      "#FFFFFF",
  };
}

/* -------------------------------------------------------------------------- */
/*                                   PAGE                                     */
/* -------------------------------------------------------------------------- */

export default async function NewAdminPromotionPage() {
  const {
    serviceOptions,
  } =
    await getAdminPromotionFormData();

  const initialValue =
    createDefaultPromotionFormValue();

  return (
    <main className="min-h-screen">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <section className="relative mb-6 overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#2F2027] via-[#5E3544] to-[#B45F7A] px-6 py-8 text-white shadow-xl shadow-[#843F59]/15 sm:px-8 lg:px-10">
          <div className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-[#E8B4C0]/25 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-32 left-1/3 size-72 rounded-full bg-white/10 blur-3xl" />

          <div className="relative flex items-start gap-5">
            <span className="grid size-14 shrink-0 place-items-center rounded-3xl bg-white/10 text-white backdrop-blur">
              <BadgePercent className="size-7" />
            </span>

            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#FFF0F4]/75">
                <Sparkles className="size-4" />

                Marketing et fidélisation
              </div>

              <h1 className="mt-3 font-serif text-4xl font-semibold sm:text-5xl">
                Nouvelle promotion
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/75 sm:text-base">
                Configurez l’offre, sa période de validité, les prestations
                concernées et sa bannière promotionnelle.
              </p>
            </div>
          </div>
        </section>

        <AdminPromotionForm
          mode="CREATE"
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
