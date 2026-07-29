import Link from "next/link";
import {
  Eye,
  ImageIcon,
  Images,
  Plus,
  Sparkles,
} from "lucide-react";

import type {
  GalleryTableItem,
} from "@/features/gallery/components/admin/gallery-table";

import {
  getGalleryItems,
  getGalleryStatistics,
} from "@/features/gallery/services/gallery-query.service";

import { GalleryManager } from "@/features/gallery/components/admin/gallery-manager";

/* -------------------------------------------------------------------------- */
/*                                CONFIGURATION                               */
/* -------------------------------------------------------------------------- */

export const dynamic =
  "force-dynamic";

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

function formatNumber(
  value: number,
): string {
  return new Intl.NumberFormat(
    "fr-FR",
  ).format(value);
}

/* -------------------------------------------------------------------------- */
/*                                   PAGE                                     */
/* -------------------------------------------------------------------------- */

export default async function AdminGalleryPage() {
  const [
    galleryResult,
    statistics,
  ] = await Promise.all([
    getGalleryItems({
      page: 1,
      limit: 500,
      published: undefined,
    }),

    getGalleryStatistics(),
  ]);

  const items: GalleryTableItem[] =
    galleryResult.items.map(
      (item) => ({
        id: item.id,
        title: item.title,
        slug: item.slug,
        coverUrl: item.coverUrl,
        alt: item.alt,
        serviceName:
          item.serviceName,
        priceCents:
          item.priceCents,
        durationMinutes:
          item.durationMinutes,
        isFeatured:
          item.isFeatured,
        isPublished:
          item.isPublished,
        viewCount:
          item.viewCount,
        createdAt:
          item.createdAt,
        category:
          item.category
            ? {
                id:
                  item.category.id,
                name:
                  item.category.name,
              }
            : null,
      }),
    );

  return (
    <main className="min-h-screen">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* ---------------------------------------------------------------- */}
        {/*                              HEADER                              */}
        {/* ---------------------------------------------------------------- */}

        <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-zinc-950 via-[#36242b] to-[#bd4b73] px-6 py-8 text-white shadow-xl shadow-rose-950/10 sm:px-8 lg:px-10 lg:py-10">
          <div className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-pink-400/20 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-28 left-1/3 size-72 rounded-full bg-rose-300/10 blur-3xl" />

          <div className="relative flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-rose-50 backdrop-blur">
                <Sparkles className="size-4" />

                Galerie du salon
              </div>

              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                Gérez vos réalisations
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-rose-50/80 sm:text-base">
                Ajoutez les nouvelles
                poses, organisez les
                catégories et choisissez
                les réalisations visibles
                par vos clientes.
              </p>
            </div>

            <Link
              href="/admin/galerie/nouvelle"
              className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-bold text-zinc-950 shadow-lg transition hover:-translate-y-0.5 hover:bg-rose-50"
            >
              <Plus className="size-4" />

              Nouvelle réalisation
            </Link>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/*                           STATISTIQUES                            */}
        {/* ---------------------------------------------------------------- */}

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-zinc-500">
                  Réalisations
                </p>

                <p className="mt-2 text-3xl font-black text-zinc-950">
                  {formatNumber(
                    statistics.totalItems,
                  )}
                </p>
              </div>

              <div className="grid size-12 place-items-center rounded-2xl bg-zinc-100 text-zinc-700">
                <Images className="size-6" />
              </div>
            </div>
          </article>

          <article className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-zinc-500">
                  Publiées
                </p>

                <p className="mt-2 text-3xl font-black text-emerald-700">
                  {formatNumber(
                    statistics.publishedItems,
                  )}
                </p>
              </div>

              <div className="grid size-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
                <ImageIcon className="size-6" />
              </div>
            </div>
          </article>

          <article className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-zinc-500">
                  À la une
                </p>

                <p className="mt-2 text-3xl font-black text-[#bd4b73]">
                  {formatNumber(
                    statistics.featuredItems,
                  )}
                </p>
              </div>

              <div className="grid size-12 place-items-center rounded-2xl bg-rose-50 text-[#bd4b73]">
                <Sparkles className="size-6" />
              </div>
            </div>
          </article>

          <article className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-zinc-500">
                  Vues cumulées
                </p>

                <p className="mt-2 text-3xl font-black text-violet-700">
                  {formatNumber(
                    statistics.totalViews,
                  )}
                </p>
              </div>

              <div className="grid size-12 place-items-center rounded-2xl bg-violet-50 text-violet-600">
                <Eye className="size-6" />
              </div>
            </div>
          </article>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/*                               TABLE                              */}
        {/* ---------------------------------------------------------------- */}

        <div className="mt-6">
        <GalleryManager items={items} />
        </div>
      </div>
    </main>
  );
}
