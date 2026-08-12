import type { Metadata } from "next";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Clock3,
  CreditCard,
  Info,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getPublicWebsiteSettings,
} from "@/features/admin/settings/services/admin-settings.service";

import { FavoriteServiceButton } from "@/features/services/components/favorite-service-button";
import { ServiceCard } from "@/features/services/components/service-card";
import {
  getPublicServiceBySlug,
  getRelatedPublicServices,
} from "@/features/services/services/public-services.service";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { formatPrice } from "@/lib/utils";

type ServiceDetailsPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: ServiceDetailsPageProps): Promise<Metadata> {
  const { slug } = await params;

  const service =
    await getPublicServiceBySlug(slug);

  if (!service) {
    return {
      title: "Prestation introuvable",
    };
  }

  return {
    title: service.name,
    description:
      service.shortDescription,
  };
}

export const dynamic = "force-dynamic";

export default async function ServiceDetailsPage({
  params,
}: ServiceDetailsPageProps) {
  const { slug } = await params;

  const [
    service,
    websiteSettings,
    user,
  ] =
    await Promise.all([
      getPublicServiceBySlug(
        slug,
      ),

      getPublicWebsiteSettings(),

      getCurrentUser(),
    ]);

  if (!service) {
    notFound();
  }

  const relatedServices =
    await getRelatedPublicServices({
      categoryId: service.categoryId,
      excludedServiceId: service.id,
    });

  const isAuthenticated = Boolean(user?.id) && user?.role === "CLIENT";

  const favoriteServiceIds = isAuthenticated
    ? new Set(
        (
          await prisma.favoriteService.findMany({
            where: {
              userId: user!.id,
              serviceId: {
                in: [service.id, ...relatedServices.map((item) => item.id)],
              },
            },
            select: { serviceId: true },
          })
        ).map((favorite) => favorite.serviceId),
      )
    : new Set<string>();

  const displayedPrice =
    service.promotionalPriceCents ??
    service.priceCents;

  const displayedImageUrl =
    service.images[0]?.url ??
    service.imageUrl ??
    websiteSettings.defaultServiceImageUrl;

  const displayedImageAlt =
    service.images[0]?.alt ??
    service.name;

  const hasPromotion =
    service.priceCents !== null &&
    service.promotionalPriceCents !== null &&
    service.promotionalPriceCents <
      service.priceCents;

  return (
    <main className="bg-[#FFFAFB]">
      <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-16">
        <Link
          href="/prestations"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#A64D69] transition hover:text-[#35242B]"
        >
          <ArrowLeft className="size-4" />
          Retour aux prestations
        </Link>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-start">
          <div>
            <div className="overflow-hidden rounded-[38px] border border-[#35242B]/8 bg-[#F6E7EB] shadow-xl shadow-[#8B405A]/10">
              <div className="relative aspect-[4/3]">
                {displayedImageUrl ? (
                  <Image
                    src={
                      displayedImageUrl
                    }
                    alt={
                      displayedImageAlt
                    }
                    fill
                    priority
                    sizes="(max-width: 1023px) 100vw, 55vw"
                    className="object-cover"
                  />
                ) : (
                  <div
                    className="flex size-full items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${
                        service.color ?? "#F6E7EB"
                      }, ${
                        service.category.color ??
                        "#A64D69"
                      })`,
                    }}
                  >
                    <div className="flex size-36 items-center justify-center rounded-full border border-white/35 bg-white/20 text-white backdrop-blur">
                      <Sparkles className="size-16" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {service.images.length > 1 ? (
              <div className="mt-4 grid grid-cols-3 gap-4">
                {service.images
                  .slice(1, 4)
                  .map((image) => (
                    <div
                      key={
                        image.id
                      }
                      className="relative aspect-square overflow-hidden rounded-[24px] border border-[#35242B]/8 bg-white"
                    >
                      <Image
                        src={
                          image.url
                        }
                        alt={
                          image.alt ??
                          service.name
                        }
                        fill
                        sizes="(max-width: 768px) 33vw, 220px"
                        className="object-cover"
                      />
                    </div>
                  ))}
              </div>
            ) : null}
          </div>

          <div className="lg:sticky lg:top-28">
            <div className="flex items-start justify-between gap-4">
              <span className="inline-flex rounded-full bg-[#FFF0F4] px-4 py-2 text-xs font-semibold uppercase tracking-[0.17em] text-[#A64D69]">
                {service.category.name}
              </span>

              <FavoriteServiceButton
                serviceId={service.id}
                initialIsFavorited={favoriteServiceIds.has(service.id)}
                isAuthenticated={isAuthenticated}
                className="grid size-11 shrink-0 place-items-center rounded-full border border-[#35242B]/8 bg-white text-[#A64D69] shadow-sm transition hover:scale-105 hover:bg-[#FFF0F4]"
              />
            </div>

            <h1 className="mt-5 font-serif text-5xl leading-[1.02] text-[#35242B] sm:text-6xl">
              {service.name}
            </h1>

            <p className="mt-6 text-base leading-8 text-[#79636C]">
              {service.shortDescription}
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#35242B]/8 bg-white px-4 py-2.5 text-sm text-[#4A3540]">
                <Clock3 className="size-4 text-[#A64D69]" />
                {service.durationMinutes} minutes
              </div>

              {service.cleanupMinutes > 0 ? (
                <div className="inline-flex items-center gap-2 rounded-full border border-[#35242B]/8 bg-white px-4 py-2.5 text-sm text-[#4A3540]">
                  <Info className="size-4 text-[#A64D69]" />
                  {service.cleanupMinutes} min de finition
                </div>
              ) : null}

              {service.depositRequired ? (
                <div className="inline-flex items-center gap-2 rounded-full border border-[#35242B]/8 bg-white px-4 py-2.5 text-sm text-[#4A3540]">
                  <CreditCard className="size-4 text-[#A64D69]" />
                  Acompte requis
                </div>
              ) : null}
            </div>

            <div className="mt-8 rounded-[30px] border border-[#35242B]/8 bg-white p-6 shadow-sm">
              <div className="flex items-end justify-between gap-5">
                <div>
                  <p className="text-sm text-[#79636C]">
                    Tarif de la prestation
                  </p>

                  <div className="mt-2 flex items-end gap-3">
                    <p className="text-4xl font-semibold text-[#35242B]">
                      {displayedPrice !== null
                        ? formatPrice(displayedPrice)
                        : "Sur devis"}
                    </p>

                    {hasPromotion &&
                    service.priceCents !== null ? (
                      <p className="pb-1 text-base text-[#A6949B] line-through">
                        {formatPrice(
                          service.priceCents,
                        )}
                      </p>
                    ) : null}
                  </div>
                </div>

                {hasPromotion ? (
                  <span className="rounded-full bg-gradient-to-r from-[#AA526E] to-[#8B405A] px-4 py-2 text-xs font-semibold text-white">
                    Prix promotionnel
                  </span>
                ) : null}
              </div>

              {service.depositRequired &&
              service.depositCents ? (
                <div className="mt-5 flex items-start gap-3 rounded-2xl bg-[#FFF0F4] p-4">
                  <CreditCard className="mt-0.5 size-5 shrink-0 text-[#A64D69]" />

                  <p className="text-sm leading-6 text-[#6F5962]">
                    Un acompte de{" "}
                    <strong className="text-[#35242B]">
                      {formatPrice(
                        service.depositCents,
                      )}
                    </strong>{" "}
                    sera demandé pour confirmer le
                    rendez-vous.
                  </p>
                </div>
              ) : null}

              <Link
                href={`/reservation?service=${service.slug}`}
                className="mt-6 inline-flex h-14 w-full items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#AA526E] via-[#BD7088] to-[#8B405A] px-7 text-sm font-black text-white shadow-[0_18px_45px_rgba(139,64,90,0.28)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_55px_rgba(139,64,90,0.35)]"
              >
                <CalendarDays className="size-5" />
                Réserver cette prestation
              </Link>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-2xl border border-[#35242B]/8 bg-white p-4">
                <ShieldCheck className="mt-0.5 size-5 shrink-0 text-[#A64D69]" />

                <div>
                  <p className="text-sm font-semibold text-[#35242B]">
                    Travail professionnel
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[#79636C]">
                    Produits adaptés et protocole
                    rigoureux.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-[#35242B]/8 bg-white p-4">
                <Sparkles className="mt-0.5 size-5 shrink-0 text-[#A64D69]" />

                <div>
                  <p className="text-sm font-semibold text-[#35242B]">
                    Résultat personnalisé
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[#79636C]">
                    Forme, couleur et finition adaptées.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-[0.75fr_1.25fr] lg:px-8">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#A44E69]">
              À propos
            </p>

            <h2 className="mt-4 font-serif text-4xl text-[#35242B]">
              Tout savoir avant votre rendez-vous.
            </h2>
          </div>

          <div>
            <div className="text-base leading-8 text-[#5B4A52]">
              {(
                service.description ??
                service.shortDescription ??
                "Les détails complets de cette prestation seront prochainement disponibles."
              )
                .split("\n")
                .filter(Boolean)
                .map((paragraph) => (
                  <p
                    key={paragraph}
                    className="mb-4 last:mb-0"
                  >
                    {paragraph}
                  </p>
                ))}
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                "Préparation minutieuse des ongles",
                "Conseils adaptés à vos envies",
                "Finition propre et durable",
                "Respect de l’ongle naturel",
              ].map((benefit) => (
                <div
                  key={benefit}
                  className="flex items-center gap-3 rounded-2xl bg-[#FFFAFB] p-4"
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#E8B3C3]/40 text-[#A64D69]">
                    <Check className="size-4" />
                  </span>

                  <span className="text-sm font-medium text-[#4A3540]">
                    {benefit}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {relatedServices.length > 0 ? (
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#A44E69]">
                Vous aimerez aussi
              </p>

              <h2 className="mt-4 font-serif text-4xl text-[#35242B]">
                Autres prestations de la catégorie.
              </h2>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {relatedServices.map(
                (relatedService) => (
                  <ServiceCard
                    key={
                      relatedService.id
                    }
                    service={
                      relatedService
                    }
                    defaultImageUrl={
                      websiteSettings.defaultServiceImageUrl
                    }
                    isFavorited={favoriteServiceIds.has(relatedService.id)}
                    isAuthenticated={isAuthenticated}
                  />
                ),
              )}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
