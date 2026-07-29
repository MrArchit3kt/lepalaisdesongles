import type { Metadata } from "next";

import { ArrowLeft, Gift } from "lucide-react";

import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminGiftCardDetailsView } from "@/features/admin/gift-cards/components/admin-gift-card-details";

import { getAdminGiftCardDetailsByReference } from "@/features/admin/gift-cards/services/admin-gift-card.service";

import { requireAdminUser } from "@/lib/session";

type AdminGiftCardDetailsPageProps = {
  params: Promise<{
    reference: string;
  }>;
};

export const metadata: Metadata = {
  title: "Détail carte cadeau | Administration",
};

export const dynamic = "force-dynamic";

export const runtime = "nodejs";

export default async function AdminGiftCardDetailsPage({
  params,
}: AdminGiftCardDetailsPageProps) {
  await requireAdminUser();

  const { reference } = await params;

  const giftCard = await getAdminGiftCardDetailsByReference(
    decodeURIComponent(reference),
  );

  if (!giftCard) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-pink-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">
        <Link
          href="/admin/cartes-cadeaux"
          className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-bold text-zinc-700 shadow-sm transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
        >
          <ArrowLeft className="size-4" />
          Retour aux cartes
        </Link>

        <header className="mb-8 mt-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-rose-600 shadow-sm">
            <Gift className="size-4" />
            Administration
          </span>

          <h1 className="mt-4 text-3xl font-black tracking-tight text-zinc-950 sm:text-5xl">
            Détail de la carte
          </h1>

          <p className="mt-3 max-w-3xl text-zinc-600">
            Consultez son solde, ses bénéficiaires, son paiement PayPal et
            l’intégralité de ses mouvements.
          </p>
        </header>

        <AdminGiftCardDetailsView giftCard={giftCard} />
      </div>
    </main>
  );
}
