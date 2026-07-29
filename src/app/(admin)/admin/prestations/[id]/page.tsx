import {
  ArrowLeft,
  ExternalLink,
  FilePenLine,
  Sparkles,
} from "lucide-react";

import Link from "next/link";

import {
  notFound,
} from "next/navigation";

import {
  AdminServiceForm,
} from "@/features/admin/services/components/admin-service-form";

import type {
  AdminServiceFormInput,
} from "@/features/admin/services/schemas/admin-service.schema";

import {
  getAdminServiceById,
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
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type EditAdminServicePageProps = {
  params: Promise<{
    id: string;
  }>;
};

/* -------------------------------------------------------------------------- */
/*                                   PAGE                                     */
/* -------------------------------------------------------------------------- */

export default async function EditAdminServicePage({
  params,
}: EditAdminServicePageProps) {
  await requireAdminUser();

  const {
    id,
  } =
    await params;

  const [
    service,
    pageData,
  ] =
    await Promise.all([
      getAdminServiceById(
        id,
      ),

      getAdminServicesPageData(),
    ]);

  if (!service) {
    notFound();
  }

  const initialValue:
    AdminServiceFormInput = {
    name:
      service.name,

    categoryId:
      service.categoryId,

    shortDescription:
      service.shortDescription,

    description:
      service.description,

    priceCents:
      service.priceCents,

    promotionalPriceCents:
      service.promotionalPriceCents,

    durationMinutes:
      service.durationMinutes,

    cleanupMinutes:
      service.cleanupMinutes,

    depositRequired:
      service.depositRequired,

    depositCents:
      service.depositCents,

    color:
      service.color,

    isActive:
      service.isActive,

    isFeatured:
      service.isFeatured,

    allowOnlineBooking:
      service.allowOnlineBooking,

    sortOrder:
      service.sortOrder,

    images:
      service.images.map(
        (
          image,
          index,
        ) => ({
          id:
            image.id,

          url:
            image.url,

          alt:
            image.alt,

          sortOrder:
            image.sortOrder,

          isCover:
            image.isCover ||
            (
              index === 0 &&
              !service.images.some(
                (
                  currentImage,
                ) =>
                  currentImage.isCover,
              )
            ),
        }),
      ),
  };

  return (
    <main className="min-h-screen">
      <div className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* ---------------------------------------------------------------- */}
        {/*                             NAVIGATION                            */}
        {/* ---------------------------------------------------------------- */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/admin/prestations"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#843F59] transition hover:text-[#2F2027]"
          >
            <ArrowLeft className="size-4" />

            Retour aux prestations
          </Link>

          {service.isActive ? (
            <Link
              href={`/prestations/${service.slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#843F59] transition hover:text-[#2F2027]"
            >
              Voir la fiche publique

              <ExternalLink className="size-4" />
            </Link>
          ) : null}
        </div>

        {/* ---------------------------------------------------------------- */}
        {/*                              EN-TÊTE                             */}
        {/* ---------------------------------------------------------------- */}

        <section className="relative mt-6 overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#2F2027] via-[#5E3544] to-[#B45F7A] px-6 py-8 text-white shadow-xl shadow-[#843F59]/15 sm:px-8 lg:px-10">
          <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-[#E8B4C0]/25 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-28 left-1/3 size-72 rounded-full bg-[#D6B679]/15 blur-3xl" />

          <div className="relative flex items-start gap-5">
            <span className="grid size-14 shrink-0 place-items-center rounded-2xl border border-white/15 bg-white/10 backdrop-blur">
              <FilePenLine className="size-7" />
            </span>

            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#FFF0F4]/75">
                <Sparkles className="size-3.5" />

                Modification
              </div>

              <h1 className="mt-3 break-words font-serif text-4xl font-semibold sm:text-5xl">
                {service.name}
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
                Modifiez les informations, les images, le tarif et la
                visibilité de cette prestation.
              </p>

              <div className="mt-5 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5">
                  {service.category.name}
                </span>

                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5">
                  {service.durationMinutes} minutes
                </span>

                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5">
                  {service.isActive
                    ? "Visible"
                    : "Masquée"}
                </span>

                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5">
                  {service.appointmentCount} rendez-vous
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/*                             FORMULAIRE                            */}
        {/* ---------------------------------------------------------------- */}

        <section className="mt-6">
          <AdminServiceForm
            mode="EDIT"
            serviceId={
              service.id
            }
            categories={
              pageData.categories
            }
            initialValue={
              initialValue
            }
          />
        </section>
      </div>
    </main>
  );
}
