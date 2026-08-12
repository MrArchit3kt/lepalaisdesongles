import Link from "next/link";
import { ArrowLeft, Heart, Sparkles } from "lucide-react";

import { getPublicWebsiteSettings } from "@/features/admin/settings/services/admin-settings.service";
import { ServiceCard } from "@/features/services/components/service-card";
import { prisma } from "@/lib/prisma";
import { requireClientUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function FavoriteServicesPage() {
  const user = await requireClientUser();

  const [favorites, websiteSettings] = await Promise.all([
    prisma.favoriteService.findMany({
      where: {
        userId: user.id,
        service: { isActive: true },
      },

      orderBy: { createdAt: "desc" },

      select: {
        service: {
          include: {
            category: {
              select: { id: true, name: true, slug: true, color: true },
            },

            images: {
              orderBy: { sortOrder: "asc" },
              take: 1,
            },
          },
        },
      },
    }),

    getPublicWebsiteSettings(),
  ]);

  const services = favorites.map((favorite) => favorite.service);

  return (
    <main className="pb-16">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="pt-5 sm:pt-8">
          <Link
            href="/espace-client"
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-[#6F5962] transition hover:bg-white hover:text-[#35242B] hover:shadow-sm"
          >
            <ArrowLeft className="size-4" />
            Retour à mon espace
          </Link>
        </div>

        <div className="mt-6 flex items-center gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#AA526E] to-[#8B405A] text-white shadow-sm">
            <Heart className="size-6" />
          </span>

          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#A5526D]">
              Mon espace
            </p>

            <h1 className="mt-1 font-serif text-3xl font-semibold text-[#2F2027] sm:text-4xl">
              Mes favoris
            </h1>
          </div>
        </div>

        {services.length > 0 ? (
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                defaultImageUrl={websiteSettings.defaultServiceImageUrl}
                isFavorited
                isAuthenticated
              />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-[30px] border border-dashed border-[#DCA8B8] bg-white px-6 py-16 text-center">
            <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#FFF0F4] text-[#A64D69]">
              <Sparkles className="size-6" />
            </span>

            <h2 className="mt-5 font-serif text-3xl text-[#35242B]">
              Aucun favori pour le moment
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#79636C]">
              Parcourez nos prestations et cliquez sur le cœur pour les
              retrouver ici.
            </p>

            <Link
              href="/prestations"
              className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-gradient-to-r from-[#AA526E] via-[#BD7088] to-[#8B405A] px-6 text-sm font-semibold text-white"
            >
              Découvrir les prestations
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
