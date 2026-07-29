import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import {
  CreateGalleryForm,
} from "@/features/gallery/components/admin/create-gallery-form";

import {
  getGalleryCategories,
} from "@/features/gallery/services/gallery-query.service";

export const dynamic = "force-dynamic";

export default async function NewGalleryPage() {
  const categories =
    await getGalleryCategories();

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link
          href="/admin/galerie"
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 transition hover:text-[#bd4b73]"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à la galerie
        </Link>
      </div>

      <CreateGalleryForm
        categories={categories.map(
          (category) => ({
            id: category.id,
            name: category.name,
          }),
        )}
      />
    </main>
  );
}