import {
  ArrowLeft,
  Plus,
  Sparkles,
} from "lucide-react";

import Link from "next/link";

import {
  AdminServiceForm,
} from "@/features/admin/services/components/admin-service-form";

import type {
  AdminServiceFormInput,
} from "@/features/admin/services/schemas/admin-service.schema";

import {
  getAdminServicesPageData,
} from "@/features/admin/services/services/admin-services.service";

import {
  requireAdminUser,
} from "@/lib/session";

/* -------------------------------------------------------------------------- */
/*                                CONFIGURATION                               */
/* -------------------------------------------------------------------------- */

export const dynamic =
  "force-dynamic";

export const revalidate =
  0;

/* -------------------------------------------------------------------------- */
/*                                   PAGE                                     */
/* -------------------------------------------------------------------------- */

export default async function NewAdminServicePage() {
  await requireAdminUser();

  const {
    categories,
    statistics,
  } =
    await getAdminServicesPageData();

  const initialValue:
    AdminServiceFormInput = {
    name:
      "",

    categoryId:
      categories.find(
        (category) =>
          category.isActive,
      )?.id ??
      categories[0]?.id ??
      "",

    shortDescription:
      null,

    description:
      null,

    priceCents:
      null,

    promotionalPriceCents:
      null,

    durationMinutes:
      60,

    cleanupMinutes:
      0,

    depositRequired:
      false,

    depositCents:
      null,

    color:
      "#E8B4C0",

    isActive:
      true,

    isFeatured:
      false,

    allowOnlineBooking:
      false,

    sortOrder:
      statistics.totalServices,

    images:
      [],
  };

  return (
    <main className="min-h-screen">
      <div className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <Link
          href="/admin/prestations"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#843F59] transition hover:text-[#2F2027]"
        >
          <ArrowLeft className="size-4" />

          Retour aux prestations
        </Link>

        <section className="relative mt-6 overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#2F2027] via-[#5E3544] to-[#B45F7A] px-6 py-8 text-white shadow-xl shadow-[#843F59]/15 sm:px-8 lg:px-10">
          <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-[#E8B4C0]/25 blur-3xl" />

          <div className="relative flex items-start gap-5">
            <span className="grid size-14 shrink-0 place-items-center rounded-2xl border border-white/15 bg-white/10 backdrop-blur">
              <Plus className="size-7" />
            </span>

            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#FFF0F4]/75">
                <Sparkles className="size-3.5" />

                Catalogue du salon
              </div>

              <h1 className="mt-3 font-serif text-4xl font-semibold sm:text-5xl">
                Nouvelle prestation
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
                Ajoutez les informations, le tarif facultatif, les
                images et les options de réservation de cette nouvelle
                prestation.
              </p>
            </div>
          </div>
        </section>

        {categories.length ===
        0 ? (
          <section className="mt-6 rounded-[2rem] border border-amber-200 bg-amber-50 p-6 text-amber-900">
            <p className="font-semibold">
              Aucune catégorie de prestation n’est disponible.
            </p>

            <p className="mt-2 text-sm leading-6">
              Une catégorie doit être créée avant de pouvoir enregistrer
              une prestation.
            </p>
          </section>
        ) : (
          <section className="mt-6">
            <AdminServiceForm
              mode="CREATE"
              categories={
                categories
              }
              initialValue={
                initialValue
              }
            />
          </section>
        )}
      </div>
    </main>
  );
}
