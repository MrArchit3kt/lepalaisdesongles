import {
  ArrowRight,
  Clock3,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

import type { HomePageData } from "@/features/public/services/home.service";
import { formatPrice } from "@/lib/utils";

type FeaturedServicesProps = {
  services: HomePageData["featuredServices"];
};

function formatFeaturedServicePrice(
  service: HomePageData["featuredServices"][number],
): string {
  if (service.priceCents === null) {
    return "Sur devis";
  }

  return formatPrice(
    service.promotionalPriceCents ??
      service.priceCents,
  );
}

export function FeaturedServices({
  services,
}: FeaturedServicesProps) {
  return (
    <section className="bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#A44E69]">
              Nos prestations
            </p>

            <h2 className="mt-4 max-w-2xl font-serif text-4xl leading-tight text-[#35242B] sm:text-5xl">
              Des soins pensés pour révéler votre style.
            </h2>
          </div>

          <Link
            href="/prestations"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#A64D69] transition hover:text-[#35242B]"
          >
            Voir toutes les prestations
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service, index) => (
            <article
              key={service.id}
              className="group rounded-[30px] border border-[#F0DCE3] bg-[#FFFAFB] p-6 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#8B405A]/8"
            >
              <div className="flex items-start justify-between gap-4">
                <span
                  className="flex size-12 items-center justify-center rounded-2xl"
                  style={{
                    backgroundColor:
                      service.color ?? "#F6E7EB",
                  }}
                >
                  <Sparkles className="size-5 text-[#35242B]" />
                </span>

                <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#35242B] shadow-sm">
                  {formatFeaturedServicePrice(
                    service,
                  )}
                </span>
              </div>

              <p className="mt-6 text-[10px] font-black uppercase tracking-[0.18em] text-[#A44E69]">
                {service.category.name}
              </p>

              <h3 className="mt-3 font-serif text-3xl text-[#35242B]">
                {service.name}
              </h3>

              <p className="mt-3 min-h-12 text-sm leading-6 text-[#79636C]">
                {service.shortDescription}
              </p>

              <div className="mt-6 flex items-center justify-between border-t border-[#F0DCE3] pt-5">
                <span className="flex items-center gap-2 text-sm text-[#79636C]">
                  <Clock3 className="size-4" />
                  {service.durationMinutes} min
                </span>

                <Link
                  href={
                    service.priceCents !== null
                      ? `/reservation?service=${service.slug}`
                      : `/prestations/${service.slug}`
                  }
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#A64D69] transition group-hover:text-[#35242B]"
                >
                  {service.priceCents !== null
                    ? "Réserver"
                    : "Voir le détail"}
                  <ArrowRight className="size-4" />
                </Link>
              </div>

              <span className="sr-only">
                Prestation numéro {index + 1}
              </span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
