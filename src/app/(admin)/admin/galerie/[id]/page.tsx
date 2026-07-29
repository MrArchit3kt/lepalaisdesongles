import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
} from "lucide-react";

import {
  EditGalleryForm,
  type EditGalleryItem,
} from "@/features/gallery/components/admin/edit-gallery-form";

import {
  updateGalleryItemAction,
  type GalleryActionState,
} from "@/features/gallery/actions/gallery.actions";

import {
  getGalleryCategories,
  getGalleryItemById,
} from "@/features/gallery/services/gallery-query.service";

export const dynamic = "force-dynamic";

type AdminEditGalleryPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminEditGalleryPage({
  params,
}: AdminEditGalleryPageProps) {
  const { id } = await params;

  const [
    galleryItem,
    categories,
  ] = await Promise.all([
    getGalleryItemById(id),
    getGalleryCategories(),
  ]);

  if (!galleryItem) {
    notFound();
  }

  async function updateAction(
    _previousState: GalleryActionState,
    formData: FormData,
  ): Promise<GalleryActionState> {
    "use server";

    const itemId = String(
      formData.get("id") ?? "",
    ).trim();

    if (!itemId) {
      return {
        success: false,
        message:
          "Identifiant de la réalisation introuvable.",
      };
    }

    return updateGalleryItemAction(
      itemId,
      formData,
    );
  }

  const item: EditGalleryItem = {
    id: galleryItem.id,
    title: galleryItem.title,
    description:
      galleryItem.description ?? "",
    categoryId:
      galleryItem.categoryId ?? "",
    serviceName:
      galleryItem.serviceName ?? "",
    priceCents:
      galleryItem.priceCents ??
      undefined,
    durationMinutes:
      galleryItem.durationMinutes ??
      undefined,
    tags: galleryItem.tags,
    isFeatured:
      galleryItem.isFeatured,
    isPublished:
      galleryItem.isPublished,

      images: galleryItem.media.map(
        (media, index) => ({
          id: media.id,
          url: media.url,
          type: media.type,
          sortOrder: media.sortOrder,
          thumbnailUrl:
            media.thumbnailUrl ?? null,
          alt:
            media.alt ??
            galleryItem.alt ??
            galleryItem.title,
          width: media.width ?? null,
          height: media.height ?? null,
          isCover:
            media.url === galleryItem.coverUrl ||
            (index === 0 &&
              !galleryItem.media.some(
                (currentMedia) =>
                  currentMedia.url ===
                  galleryItem.coverUrl,
              )),
        }),
      ),
  };

  const categoryOptions =
    categories.map((category) => ({
      id: category.id,
      name: category.name,
    }));

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/admin/galerie"
          className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-600 transition hover:text-pink-600"
        >
          <ArrowLeft className="h-4 w-4" />

          Retour à la galerie
        </Link>

        {galleryItem.isPublished ? (
          <Link
            href={`/galerie/${galleryItem.slug}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-600 transition hover:text-pink-600"
          >
            Voir la page publique

            <ExternalLink className="h-4 w-4" />
          </Link>
        ) : null}
      </div>

      <EditGalleryForm
        item={item}
        action={updateAction}
        categories={categoryOptions}
      />
    </main>
  );
}
