import { MessageSquareHeart } from "lucide-react";

import { AdminReviewsClient } from "@/features/admin/reviews/components/admin-reviews-client";
import { getAdminReviews } from "@/features/admin/reviews/services/admin-reviews.service";
import { requireAdminUser } from "@/lib/session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AdminReviewsPage() {
  await requireAdminUser();

  const reviews = await getAdminReviews();

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-pink-50 px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-5 sm:mb-8">
          <div className="flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-rose-600 text-white shadow-sm">
              <MessageSquareHeart className="size-6" />
            </span>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-rose-600 sm:text-sm">
                Administration
              </p>

              <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-zinc-950 sm:mt-2 sm:text-5xl">
                Avis clientes
              </h1>

              <p className="mt-2 max-w-3xl text-sm text-zinc-600 sm:mt-3 sm:text-base">
                Les 5 avis Google les plus pertinents s’affichent
                automatiquement sur la page publique « Avis ». Ajoutez ici le
                reste de vos avis Google (ou d’autres plateformes) pour
                qu’ils apparaissent aussi sur le site.
              </p>
            </div>
          </div>
        </header>

        <AdminReviewsClient reviews={reviews} />
      </div>
    </main>
  );
}
