import type { Metadata } from "next";

import { Gift } from "lucide-react";

import { AdminGiftCardsClient } from "@/features/admin/gift-cards/components/admin-gift-cards-client";

import {
  getAdminGiftCardsDashboardData,
  parseAdminGiftCardQuery,
} from "@/features/admin/gift-cards/services/admin-gift-card.service";

import { requireAdminUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Cartes cadeaux | Administration",
};

export const dynamic = "force-dynamic";

export const runtime = "nodejs";

type AdminGiftCardsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminGiftCardsPage({
  searchParams,
}: AdminGiftCardsPageProps) {
  await requireAdminUser();

  const resolvedSearchParams = await searchParams;
  const query = parseAdminGiftCardQuery(resolvedSearchParams);
  const data = await getAdminGiftCardsDashboardData(query);

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-pink-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px]">
        <header className="mb-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-rose-600 shadow-sm">
            <Gift className="size-4" />
            Administration
          </span>

          <h1 className="mt-4 text-3xl font-black tracking-tight text-zinc-950 sm:text-5xl">
            Cartes cadeaux
          </h1>

          <p className="mt-3 max-w-3xl text-zinc-600">
            Consultez les ventes, les soldes disponibles et l’état de toutes les
            cartes cadeaux du salon.
          </p>
        </header>

        <AdminGiftCardsClient
          key={[
            data.query.page,
            data.query.pageSize,
            data.query.search,
            data.query.status,
            data.query.sort,
            data.query.dateFrom,
            data.query.dateTo,
            data.query.expiredOnly,
          ].join(":")}
          data={data}
        />
      </div>
    </main>
  );
}
