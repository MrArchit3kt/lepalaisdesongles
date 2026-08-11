import type {
  Metadata,
} from "next";

import {
  BadgePercent,
  CalendarClock,
  ChartNoAxesCombined,
  CircleOff,
  House,
  Plus,
  Sparkles,
  TicketCheck,
} from "lucide-react";

import Link from "next/link";

import {
  AdminPromotionsManager,
} from "@/features/admin/promotions/components/admin-promotions-manager";

import {
  getAdminPromotionsDashboardData,
} from "@/features/admin/promotions/services/admin-promotions.service";

/* -------------------------------------------------------------------------- */
/*                                  MÉTADONNÉES                               */
/* -------------------------------------------------------------------------- */

export const metadata:
  Metadata = {
    title:
      "Promotions | Administration",

    description:
      "Gestion des promotions du salon.",
  };

export const dynamic =
  "force-dynamic";

/* -------------------------------------------------------------------------- */
/*                                   PAGE                                     */
/* -------------------------------------------------------------------------- */

export default async function AdminPromotionsPage() {
  const data =
    await getAdminPromotionsDashboardData();

  const {
    metrics,
    promotions,
    alerts,
    endingSoon,
  } =
    data;

  return (
    <main className="min-h-screen">
      <div className="mx-auto w-full max-w-[1600px] px-3 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        {/* ---------------------------------------------------------------- */}
        {/*                                HERO                              */}
        {/* ---------------------------------------------------------------- */}

        <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#2F2027] via-[#5E3544] to-[#B45F7A] px-4 py-5 text-white shadow-xl shadow-[#843F59]/15 sm:px-8 sm:py-8 lg:px-10">
          <div className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-[#E8B4C0]/25 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-32 left-1/3 size-72 rounded-full bg-white/10 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-7 lg:flex-row lg:items-center">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#FFF0F4]/75">
                <Sparkles className="size-4" />

                Marketing et fidélisation
              </div>

              <h1 className="mt-2 font-serif text-2xl font-semibold sm:mt-4 sm:text-5xl">
                Promotions
              </h1>

              <p className="mt-2 max-w-2xl text-xs leading-6 text-white/75 sm:mt-4 sm:text-base sm:leading-7">
                Créez vos offres, programmez leur diffusion et contrôlez leur
                visibilité sur le site et la page d’accueil.
              </p>
            </div>

            <Link
              href="/admin/promotions/nouvelle"
              className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-black text-[#2F2027] shadow-lg transition hover:-translate-y-0.5 hover:bg-[#FFF0F4]"
            >
              <Plus className="size-5" />

              Nouvelle promotion
            </Link>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/*                            STATISTIQUES                           */}
        {/* ---------------------------------------------------------------- */}

        <section className="mt-4 grid gap-3 sm:mt-6 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
          <article className="rounded-[1.75rem] border border-[#E8B4C0]/45 bg-white p-3.5 shadow-sm sm:p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#816D75]">
                  Promotions
                </p>

                <p className="mt-1.5 text-xl font-black sm:mt-2 sm:text-3xl text-[#2F2027]">
                  {metrics.totalPromotions}
                </p>

                <p className="mt-1 text-xs text-[#9B868E]">
                  {metrics.inactivePromotions} désactivée
                  {metrics.inactivePromotions !==
                  1
                    ? "s"
                    : ""}
                </p>
              </div>

              <div className="grid size-10 place-items-center rounded-2xl sm:size-12 bg-[#FFF0F4] text-[#B45F7A]">
                <BadgePercent className="size-6" />
              </div>
            </div>
          </article>

          <article className="rounded-[1.75rem] border border-[#E8B4C0]/45 bg-white p-3.5 shadow-sm sm:p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#816D75]">
                  Actives
                </p>

                <p className="mt-1.5 text-xl font-black sm:mt-2 sm:text-3xl text-[#2F2027]">
                  {metrics.activePromotions}
                </p>

                <p className="mt-1 text-xs text-[#9B868E]">
                  {metrics.totalUsageCount} utilisation
                  {metrics.totalUsageCount !==
                  1
                    ? "s"
                    : ""}
                </p>
              </div>

              <div className="grid size-10 place-items-center rounded-2xl sm:size-12 bg-emerald-50 text-emerald-600">
                <TicketCheck className="size-6" />
              </div>
            </div>
          </article>

          <article className="rounded-[1.75rem] border border-[#E8B4C0]/45 bg-white p-3.5 shadow-sm sm:p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#816D75]">
                  Programmées
                </p>

                <p className="mt-1.5 text-xl font-black sm:mt-2 sm:text-3xl text-[#2F2027]">
                  {metrics.scheduledPromotions}
                </p>

                <p className="mt-1 text-xs text-[#9B868E]">
                  {endingSoon.length} bientôt terminée
                  {endingSoon.length !==
                  1
                    ? "s"
                    : ""}
                </p>
              </div>

              <div className="grid size-10 place-items-center rounded-2xl sm:size-12 bg-blue-50 text-blue-600">
                <CalendarClock className="size-6" />
              </div>
            </div>
          </article>

          <article className="rounded-[1.75rem] border border-[#E8B4C0]/45 bg-white p-3.5 shadow-sm sm:p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#816D75]">
                  Sur l’accueil
                </p>

                <p className="mt-1.5 text-xl font-black sm:mt-2 sm:text-3xl text-[#2F2027]">
                  {metrics.promotionsShownOnHomepage}
                </p>

                <p className="mt-1 text-xs text-[#9B868E]">
                  {metrics.exhaustedPromotions} épuisée
                  {metrics.exhaustedPromotions !==
                  1
                    ? "s"
                    : ""}
                </p>
              </div>

              <div className="grid size-10 place-items-center rounded-2xl sm:size-12 bg-violet-50 text-violet-600">
                <House className="size-6" />
              </div>
            </div>
          </article>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/*                               ALERTES                            */}
        {/* ---------------------------------------------------------------- */}

        {alerts.length >
        0 ? (
          <section className="mt-6 grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
            {alerts.map(
              (
                alert,
              ) => (
                <Link
                  key={
                    alert.id
                  }
                  href={
                    alert.href
                  }
                  className="flex items-start gap-4 rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5 text-amber-950 transition hover:border-amber-300"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white/75 text-amber-700">
                    {alert.tone ===
                    "BLUE" ? (
                      <CalendarClock className="size-5" />
                    ) : alert.tone ===
                      "AMBER" ? (
                      <CircleOff className="size-5" />
                    ) : (
                      <ChartNoAxesCombined className="size-5" />
                    )}
                  </span>

                  <span>
                    <span className="block font-bold">
                      {alert.title}
                    </span>

                    <span className="mt-1 block text-sm leading-6 text-amber-800">
                      {alert.description}
                    </span>
                  </span>

                  {alert.count !==
                  null ? (
                    <span className="ml-auto rounded-full bg-white px-3 py-1 text-sm font-black text-amber-800">
                      {alert.count}
                    </span>
                  ) : null}
                </Link>
              ),
            )}
          </section>
        ) : null}

        {/* ---------------------------------------------------------------- */}
        {/*                             GESTIONNAIRE                         */}
        {/* ---------------------------------------------------------------- */}

        <section className="mt-6">
          <AdminPromotionsManager
            promotions={
              promotions
            }
          />
        </section>
      </div>
    </main>
  );
}
