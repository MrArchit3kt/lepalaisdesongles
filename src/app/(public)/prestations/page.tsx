import type { Metadata } from "next";
import { CalendarDays } from "lucide-react";
import Link from "next/link";

import { getPublicWebsiteSettings } from "@/features/admin/settings/services/admin-settings.service";

import { ServicesCatalog } from "@/features/services/components/services-catalog";
import { ServicesHero } from "@/features/public/components/services/services-hero";
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

  const [categories, services, websiteSettings] = await Promise.all([
    getPublicServiceCategories(),
    getPublicServices(),
    getPublicWebsiteSettings(),
  ]);

  return (
    <main className="bg-[#FFF9F8]">
      <ServicesHero
        categoriesCount={categories.length}
        servicesCount={services.length}
      />

      <section
        id="services-catalog"
        className="mx-auto max-w-7xl scroll-mt-24 px-5 py-16 lg:px-8 lg:py-20"
      >
        <ServicesCatalog
          categories={categories}
          services={services}
          initialCategory={categorie}
          defaultImageUrl={websiteSettings.defaultServiceImageUrl}
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
              Envoyez votre modèle ou expliquez votre besoin. La prestation
              pourra être ajustée avant le rendez-vous.
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
