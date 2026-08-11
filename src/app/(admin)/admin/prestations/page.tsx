import {
  CalendarCheck,
  Eye,
  EyeOff,
  FileQuestion,
  Layers3,
  Plus,
  Sparkles,
} from "lucide-react";

import Link from "next/link";

import {
  AdminServicesManager,
} from "@/features/admin/services/components/admin-services-manager";

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
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

function formatNumber(
  value: number,
): string {
  return new Intl.NumberFormat(
    "fr-FR",
  ).format(
    value,
  );
}

/* -------------------------------------------------------------------------- */
/*                                   PAGE                                     */
/* -------------------------------------------------------------------------- */

export default async function AdminServicesPage() {
  await requireAdminUser();

  const {
    services,
    categories,
    statistics,
  } =
    await getAdminServicesPageData();

  return (
    <main className="min-h-screen">
      <div className="mx-auto w-full max-w-[1600px] px-3 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        {/* ---------------------------------------------------------------- */}
        {/*                              EN-TÊTE                             */}
        {/* ---------------------------------------------------------------- */}

        <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#2F2027] via-[#5E3544] to-[#B45F7A] px-4 py-5 text-white shadow-xl shadow-[#843F59]/15 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
          <div className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-[#E8B4C0]/25 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-32 left-1/3 size-80 rounded-full bg-[#D6B679]/15 blur-3xl" />

          <div className="relative flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-[#FFF8FA] backdrop-blur sm:mb-5 sm:px-4 sm:py-2 sm:text-sm">
                <Sparkles className="size-4" />

                Catalogue du salon
              </div>

              <h1 className="font-serif text-2xl font-semibold tracking-tight sm:text-5xl">
                Gérez vos prestations
              </h1>

              <p className="mt-2 max-w-2xl text-xs leading-6 text-white/75 sm:mt-4 sm:text-base sm:leading-7">
                Ajoutez, modifiez, masquez ou mettez en avant les
                prestations affichées sur le site. Les tarifs peuvent
                rester facultatifs pour les services proposés sur devis.
              </p>
            </div>

            <Link
              href="/admin/prestations/nouvelle"
              className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-bold text-[#2F2027] shadow-lg transition hover:-translate-y-0.5 hover:bg-[#FFF0F4]"
            >
              <Plus className="size-4" />

              Nouvelle prestation
            </Link>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/*                           STATISTIQUES                            */}
        {/* ---------------------------------------------------------------- */}

        <section className="mt-4 grid gap-3 sm:mt-6 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
          <article className="rounded-[1.75rem] border border-[#E8B4C0]/45 bg-white p-3.5 shadow-sm sm:p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#816D75]">
                  Prestations
                </p>

                <p className="mt-1.5 text-xl font-black sm:mt-2 sm:text-3xl text-[#2F2027]">
                  {formatNumber(
                    statistics.totalServices,
                  )}
                </p>

                <p className="mt-1 text-xs text-[#9B868E]">
                  {formatNumber(
                    statistics.totalCategories,
                  )}{" "}
                  catégorie
                  {statistics.totalCategories !== 1
                    ? "s"
                    : ""}
                </p>
              </div>

              <div className="grid size-10 place-items-center rounded-2xl sm:size-12 bg-[#FFF0F4] text-[#B45F7A]">
                <Layers3 className="size-6" />
              </div>
            </div>
          </article>

          <article className="rounded-[1.75rem] border border-[#E8B4C0]/45 bg-white p-3.5 shadow-sm sm:p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#816D75]">
                  Visibles
                </p>

                <p className="mt-1.5 text-xl font-black sm:mt-2 sm:text-3xl text-emerald-700">
                  {formatNumber(
                    statistics.activeServices,
                  )}
                </p>

                <p className="mt-1 text-xs text-[#9B868E]">
                  {formatNumber(
                    statistics.hiddenServices,
                  )}{" "}
                  masquée
                  {statistics.hiddenServices !== 1
                    ? "s"
                    : ""}
                </p>
              </div>

              <div className="grid size-10 place-items-center rounded-2xl sm:size-12 bg-emerald-50 text-emerald-600">
                <Eye className="size-6" />
              </div>
            </div>
          </article>

          <article className="rounded-[1.75rem] border border-[#E8B4C0]/45 bg-white p-3.5 shadow-sm sm:p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#816D75]">
                  Réservables en ligne
                </p>

                <p className="mt-1.5 text-xl font-black sm:mt-2 sm:text-3xl text-[#843F59]">
                  {formatNumber(
                    statistics.onlineBookingServices,
                  )}
                </p>

                <p className="mt-1 text-xs text-[#9B868E]">
                  Paiement PayPal disponible
                </p>
              </div>

              <div className="grid size-10 place-items-center rounded-2xl sm:size-12 bg-[#FFF0F4] text-[#B45F7A]">
                <CalendarCheck className="size-6" />
              </div>
            </div>
          </article>

          <article className="rounded-[1.75rem] border border-[#E8B4C0]/45 bg-white p-3.5 shadow-sm sm:p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#816D75]">
                  Prestations sur devis
                </p>

                <p className="mt-1.5 text-xl font-black sm:mt-2 sm:text-3xl text-[#9B7628]">
                  {formatNumber(
                    statistics.quoteOnlyServices,
                  )}
                </p>

                <p className="mt-1 text-xs text-[#9B868E]">
                  Prix facultatif
                </p>
              </div>

              <div className="grid size-10 place-items-center rounded-2xl sm:size-12 bg-[#FFF9E9] text-[#9B7628]">
                <FileQuestion className="size-6" />
              </div>
            </div>
          </article>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/*                            INFORMATIONS                           */}
        {/* ---------------------------------------------------------------- */}

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="flex items-start gap-4 rounded-[1.75rem] border border-[#E8B4C0]/45 bg-[#FFF8FA] p-5">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white text-[#B45F7A] shadow-sm">
              <Sparkles className="size-5" />
            </span>

            <div>
              <p className="font-semibold text-[#2F2027]">
                {formatNumber(
                  statistics.featuredServices,
                )}{" "}
                prestation
                {statistics.featuredServices !== 1
                  ? "s"
                  : ""}{" "}
                mise
                {statistics.featuredServices !== 1
                  ? "s"
                  : ""}{" "}
                en avant
              </p>

              <p className="mt-1 text-sm leading-6 text-[#816D75]">
                Les prestations mises en avant peuvent apparaître sur
                la page d’accueil du site.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 rounded-[1.75rem] border border-[#E8B4C0]/45 bg-[#FFF8FA] p-5">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white text-[#843F59] shadow-sm">
              {statistics.hiddenServices > 0 ? (
                <EyeOff className="size-5" />
              ) : (
                <Eye className="size-5" />
              )}
            </span>

            <div>
              <p className="font-semibold text-[#2F2027]">
                Masquer sans supprimer
              </p>

              <p className="mt-1 text-sm leading-6 text-[#816D75]">
                Une prestation liée à d’anciens rendez-vous doit être
                masquée afin de conserver l’historique des clientes.
              </p>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/*                           GESTIONNAIRE                            */}
        {/* ---------------------------------------------------------------- */}

        <section className="mt-6">
          <AdminServicesManager
            services={
              services
            }
            categories={
              categories
            }
          />
        </section>
      </div>
    </main>
  );
}
