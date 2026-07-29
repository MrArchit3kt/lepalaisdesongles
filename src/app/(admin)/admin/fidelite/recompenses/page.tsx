import Link from "next/link";

import {
  ArrowLeft,
  Gift,
  Sparkles,
} from "lucide-react";

import {
  AdminVipRewardsManager,
} from "@/features/admin/vip/components/admin-vip-rewards-manager";

import {
  getAdminVipRewardsPageData,
} from "@/features/admin/vip/services/admin-vip-rewards.service";

import {
  requireAdminUser,
} from "@/lib/session";

export const dynamic =
  "force-dynamic";

export const revalidate =
  0;

export default async function AdminVipRewardsPage() {
  await requireAdminUser();

  const data =
    await getAdminVipRewardsPageData();

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">
        <Link
          href="/admin/fidelite"
          className="inline-flex items-center gap-2 text-sm font-black text-zinc-600 transition hover:text-violet-700"
        >
          <ArrowLeft className="size-4" />

          Retour au Club VIP
        </Link>

        <section className="relative mt-5 overflow-hidden rounded-[2rem] bg-zinc-950 px-6 py-8 text-white shadow-xl sm:px-8 lg:px-10">
          <div className="absolute -right-20 -top-24 size-72 rounded-full bg-violet-500/30 blur-3xl" />

          <div className="absolute -bottom-28 left-1/3 size-64 rounded-full bg-rose-500/20 blur-3xl" />

          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-violet-100">
              <Gift className="size-4" />

              Club VIP
            </span>

            <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
              Récompenses fidélité
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-300">
              Gérez les cadeaux, réductions, prestations offertes, points,
              XP et récompenses exclusives du programme fidélité.
            </p>

            <div className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300">
              <Sparkles className="size-4 text-violet-300" />

              Les règles de niveau, dates et disponibilité sont vérifiées lors
              de chaque enregistrement.
            </div>
          </div>
        </section>

        <div className="mt-6">
          <AdminVipRewardsManager
            data={data}
          />
        </div>
      </div>
    </main>
  );
}
