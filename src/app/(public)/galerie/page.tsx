import type {
  Metadata,
} from "next";

import {
  GalleryFinalCta,
} from "@/features/gallery/components/public/gallery-final-cta";
import {
  GalleryHero,
} from "@/features/gallery/components/public/gallery-hero";
import {
  GalleryStats,
} from "@/features/gallery/components/public/gallery-stats";
import {
  GalleryTestimonial,
} from "@/features/gallery/components/public/gallery-testimonial";
import {
  PublicGallery,
} from "@/features/gallery/components/public/public-gallery";
import type {
  PublicGalleryItem,
} from "@/features/gallery/components/public/gallery.types";
import {
  getGalleryItems,
} from "@/features/gallery/services/gallery-query.service";

export const metadata: Metadata =
  {
    title:
      "Galerie | Le Palais des Ongles",
    description:
      "Découvrez les créations réalisées au Palais des Ongles : French, baby-boomer, nail art, couleurs et poses personnalisées.",
  };

export const revalidate =
  300;

export default async function GalleryPage() {
  const galleryResult =
    await getGalleryItems({
      published: true,
      limit: 100,
    });

  const items: PublicGalleryItem[] =
    galleryResult.items
      .map((item) => {
        const firstMedia =
          item.media[0];

        const coverUrl =
          item.coverUrl ||
          firstMedia?.url ||
          "";

        return {
          id: item.id,
          slug:
            item.slug,
          title:
            item.title,
          coverUrl,
          alt:
            item.alt ??
            firstMedia?.alt ??
            item.title,
          category:
            item.category
              ?.name ??
            null,
          serviceName:
            item.serviceName ??
            null,
          isFeatured:
            item.isFeatured,
        };
      })
      .filter(
        (item) =>
          item.coverUrl
            .trim()
            .length >
          0,
      );

  return (
    <main className="min-h-screen overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#FFF9FA_45%,#ffffff_100%)]">
      <GalleryHero
        totalImages={
          items.length
        }
      />

      <GalleryStats
        totalImages={
          items.length
        }
      />

      <PublicGallery
        items={items}
      />

      <GalleryTestimonial />

      <GalleryFinalCta />
    </main>
  );
}