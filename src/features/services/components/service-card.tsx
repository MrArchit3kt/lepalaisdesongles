import {
  ArrowRight,
  CalendarDays,
  Clock3,
  CreditCard,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import type { PublicService } from "@/features/services/services/public-services.service";
import { formatPrice } from "@/lib/utils";

type ServiceCardProps = {
  service: PublicService;

  defaultImageUrl?: string;
};

export function ServiceCard({
  service,
  defaultImageUrl = "",
}: ServiceCardProps) {
  const displayedPrice =
    service.promotionalPriceCents ??
    service.priceCents;

  const displayedImageUrl =
    service.images[0]?.url ??
    service.imageUrl ??
    defaultImageUrl;

  const displayedImageAlt =
    service.images[0]?.alt ??
    service.name;

  const hasPromotion =
    service.priceCents !== null &&
    service.promotionalPriceCents !== null &&
    service.promotionalPriceCents <
      service.priceCents;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[30px] border border-[#35242B]/8 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#8B405A]/10">
      <Link
        href={`/prestations/${service.slug}`}
        className="relative block aspect-[16/10] overflow-hidden bg-[#FFF0F4]"
      >
        {displayedImageUrl ? (
          <Image
            src={
              displayedImageUrl
            }
            alt={
              displayedImageAlt
            }
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className="flex size-full items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${
                service.color ?? "#F6E7EB"
              }, ${service.category.color ?? "#A64D69"})`,
            }}
          >
            <div className="flex size-24 items-center justify-center rounded-full border border-white/40 bg-white/20 text-white backdrop-blur">
              <Sparkles className="size-10" />
            </div>
          </div>
        )}

        <div className="absolute left-4 top-4">
          <span className="rounded-full bg-white/90 px-4 py-2 text-xs font-semibold text-[#4A3540] shadow-sm backdrop-blur">
            {service.category.name}
          </span>
        </div>

        {hasPromotion ? (
          <div className="absolute right-4 top-4">
            <span className="rounded-full bg-gradient-to-r from-[#AA526E] to-[#8B405A] px-4 py-2 text-xs font-semibold text-white shadow-lg">
              Offre spéciale
            </span>
          </div>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link
              href={`/prestations/${service.slug}`}
              className="font-serif text-3xl leading-tight text-[#35242B] transition hover:text-[#A64D69]"
            >
              {service.name}
            </Link>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#6F5962]">
              <span className="flex items-center gap-2">
                <Clock3 className="size-4" />
                {service.durationMinutes} min
              </span>

              {service.depositRequired ? (
                <span className="flex items-center gap-2">
                  <CreditCard className="size-4" />
                  Acompte
                </span>
              ) : null}
            </div>
          </div>

          <div className="shrink-0 text-right">
            {hasPromotion &&
            service.priceCents !== null ? (
              <p className="text-sm text-[#A6949B] line-through">
                {formatPrice(service.priceCents)}
              </p>
            ) : null}

            <p className="text-xl font-semibold text-[#35242B]">
              {displayedPrice !== null
                ? formatPrice(displayedPrice)
                : "Sur devis"}
            </p>
          </div>
        </div>

        <p className="mt-5 line-clamp-3 text-sm leading-7 text-[#79636C]">
          {service.shortDescription ??
              "Découvrez cette prestation et ses différentes possibilités de personnalisation."}
        </p>

        {service.depositRequired &&
        service.depositCents ? (
          <div className="mt-5 rounded-2xl bg-[#FFF0F4] px-4 py-3 text-sm text-[#6F5962]">
            Acompte demandé :{" "}
            <span className="font-semibold text-[#35242B]">
              {formatPrice(service.depositCents)}
            </span>
          </div>
        ) : null}

        <div className="mt-auto grid gap-3 pt-7 sm:grid-cols-2">
          <Link
            href={`/prestations/${service.slug}`}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#35242B]/10 bg-white px-4 text-sm font-semibold text-[#35242B] transition hover:bg-[#FFF0F4]"
          >
            Voir les détails
            <ArrowRight className="size-4" />
          </Link>

          <Link
            href={`/reservation?service=${service.slug}`}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#AA526E] via-[#BD7088] to-[#8B405A] px-4 text-sm font-semibold text-white transition hover:shadow-[0_10px_25px_rgba(139,64,90,0.35)]"
          >
            <CalendarDays className="size-4" />
            Réserver
          </Link>
        </div>
      </div>
    </article>
  );
}
