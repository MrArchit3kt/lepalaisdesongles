import type { Metadata } from "next";
import {
  CalendarDays,
  Check,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

import {
  getPublicWebsiteSettings,
} from "@/features/admin/settings/services/admin-settings.service";

import { ServicesCatalog } from "@/features/services/components/services-catalog";
import {
  getPublicServiceCategories,
  getPublicServices,
} from "@/features/services/services/public-services.service";

export const metadata: Metadata = {
  title: "Prestations et tarifs",
  description:
    "Découvrez les prestations du Palais des Ongles : semi-permanent, gainage, gel, extensions et nail art personnalisé.",
};

export const dynamic = "force-dynamic";

type ServicesPageProps = {
  searchParams: Promise<{
    categorie?: string;
  }>;
};

export default async function ServicesPage({
  searchParams,
}: ServicesPageProps) {
  const { categorie } = await searchParams;

  const [
    categories,
    services,
    websiteSettings,
  ] = await Promise.all([
    getPublicServiceCategories(),
    getPublicServices(),
    getPublicWebsiteSettings(),
  ]);

  return (
    <main className="bg-[#FFF9F8]">
      <section className="relative overflow-hidden border-b border-[#241A1D]/7">
        <div className="absolute -left-36 top-10 size-[420px] rounded-full bg-[#E8B4B8]/20 blur-3xl" />
        <div className="absolute -right-32 bottom-0 size-[420px] rounded-full bg-[#C9A36A]/12 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#B8899A]/20 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#956B7B] shadow-sm">
              <Sparkles className="size-4" />
              Prestations & tarifs
            </div>

            <h1 className="mt-7 font-serif text-5xl leading-[1.02] text-[#241A1D] sm:text-6xl lg:text-7xl">
              Choisissez la prestation qui vous
              <span className="text-[#B8899A]">
                {" "}
                ressemble.
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-8 text-[#75636A] sm:text-lg">
              Chaque prestation est réalisée avec soin
              et adaptée à vos ongles, votre style et vos
              envies.
            </p>

            <div className="mt-8 flex flex-wrap gap-x-7 gap-y-4 text-sm text-[#5F5056]">
              <span className="flex items-center gap-2">
                <Check className="size-4 text-[#B8899A]" />
                Tarifs transparents
              </span>

              <span className="flex items-center gap-2">
                <Check className="size-4 text-[#B8899A]" />
                Durée indiquée
              </span>

              <span className="flex items-center gap-2">
                <Check className="size-4 text-[#B8899A]" />
                Réservation immédiate
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
        <ServicesCatalog
          categories={
            categories
          }
          services={
            services
          }
          initialCategory={
            categorie
          }
          defaultImageUrl={
            websiteSettings.defaultServiceImageUrl
          }
        />
      </section>

      <section className="px-5 pb-20 lg:px-8 lg:pb-28">
        <div className="mx-auto flex max-w-7xl flex-col gap-7 rounded-[36px] bg-[#241A1D] p-8 text-white sm:p-12 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#E8B4B8]">
              Besoin d’un conseil ?
            </p>

            <h2 className="mt-4 font-serif text-4xl">
              Vous hésitez entre plusieurs prestations ?
            </h2>

            <p className="mt-4 max-w-2xl leading-7 text-white/60">
              Envoyez votre modèle ou expliquez votre
              besoin. La prestation pourra être ajustée
              avant le rendez-vous.
            </p>
          </div>

          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <Link
              href="/contact"
              className="inline-flex h-13 items-center justify-center rounded-full border border-white/15 bg-white/5 px-7 text-sm font-semibold transition hover:bg-white/10"
            >
              Demander conseil
            </Link>

            <Link
              href="/reservation"
              className="inline-flex h-13 items-center justify-center gap-2 rounded-full bg-white px-7 text-sm font-semibold text-[#241A1D] transition hover:bg-[#FFF0F0]"
            >
              <CalendarDays className="size-4" />
              Réserver
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
