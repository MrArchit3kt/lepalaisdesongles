import Image from "next/image";
import Link from "next/link";

import {
  redirect,
} from "next/navigation";

import {
  ArrowLeft,
  Clock3,
  Crown,
  LockKeyhole,
  Sparkles,
} from "lucide-react";

import {
  ClientVipDashboard,
} from "@/features/vip/components/client-vip-dashboard";

import {
  getClientVipAccessState,
} from "@/features/vip/services/client-vip-access.service";

import {
  getClientVipDashboardData,
} from "@/features/vip/services/client-vip-dashboard.service";

import {
  ensureClientLoyaltyAccount,
} from "@/features/vip/services/ensure-client-loyalty-account.service";

import {
  requireClientUser,
} from "@/lib/session";

export const dynamic =
  "force-dynamic";

export const revalidate =
  0;

/* -------------------------------------------------------------------------- */
/*                          PAGE DE PRÉ-LANCEMENT                             */
/* -------------------------------------------------------------------------- */

function VipPreLaunchPage({
  clubName,
  title,
  description,
  imageUrl,
  buttonLabel,
  buttonUrl,
}: {
  clubName: string;
  title: string | null;
  description: string | null;
  imageUrl: string | null;
  buttonLabel: string | null;
  buttonUrl: string | null;
}) {
  return (
    <main className="min-h-[calc(100vh-80px)] bg-[#FFFAFB] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#3B2430] via-[#4A2A3A] to-[#2E1E28] p-6 text-white shadow-xl sm:p-10 lg:p-14">
          <div className="absolute -right-28 -top-28 size-96 rounded-full bg-[#C47890]/30 blur-3xl" />

          <div className="absolute -bottom-32 left-1/3 size-80 rounded-full bg-[#D6B778]/20 blur-3xl" />

          <div className="relative grid gap-10 lg:grid-cols-[1fr_360px] lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.24em]">
                <Sparkles className="size-4" />

                Bientôt disponible
              </span>

              <span className="mt-6 flex size-16 items-center justify-center rounded-[1.4rem] border border-white/10 bg-white/10">
                <Crown className="size-8" />
              </span>

              <p className="mt-5 text-sm font-bold text-[#F0C4D3]">
                {clubName}
              </p>

              <h1 className="mt-2 font-serif text-3xl font-semibold italic sm:text-4xl lg:text-5xl">
                {title ??
                  "Le Club VIP arrive bientôt"}
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
                {description ??
                  "Un nouvel espace fidélité est en préparation avec des niveaux, des points et des récompenses exclusives."}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {buttonUrl ? (
                  <Link
                    href={buttonUrl}
                    className="inline-flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-[#AA526E] via-[#BD7088] to-[#8B405A] px-6 text-sm font-black text-white transition hover:shadow-[0_10px_25px_rgba(139,64,90,0.4)]"
                  >
                    {buttonLabel ??
                      "En savoir plus"}
                  </Link>
                ) : null}

                <Link
                  href="/espace-client"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-6 text-sm font-black text-white transition hover:bg-white/15"
                >
                  <ArrowLeft className="size-4" />

                  Retour à mon espace
                </Link>
              </div>
            </div>

            <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/10 p-3">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt=""
                  width={640}
                  height={640}
                  sizes="(max-width: 768px) 100vw, 40vw"
                  className="aspect-square w-full rounded-[1.25rem] object-cover"
                />
              ) : (
                <div className="flex aspect-square items-center justify-center rounded-[1.25rem] bg-gradient-to-br from-[#C47890]/50 to-[#D6B778]/20">
                  <Crown className="size-24 text-white/80" />
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   PAGE                                     */
/* -------------------------------------------------------------------------- */

export default async function ClientVipPage() {
  const user =
    await requireClientUser();

  let access =
    await getClientVipAccessState(
      user.id,
    );

  if (
    access.mode ===
    "UNAVAILABLE"
  ) {
    redirect(
      "/espace-client",
    );
  }

  if (
    access.mode ===
    "PRE_LAUNCH"
  ) {
    return (
      <VipPreLaunchPage
        clubName={
          access.branding.clubName
        }
        title={
          access.branding
            .preLaunchTitle
        }
        description={
          access.branding
            .preLaunchDescription
        }
        imageUrl={
          access.branding
            .preLaunchImageUrl
        }
        buttonLabel={
          access.branding
            .preLaunchButtonLabel
        }
        buttonUrl={
          access.branding
            .preLaunchButtonUrl
        }
      />
    );
  }

  if (
    access.canInitializeAccount
  ) {
    await ensureClientLoyaltyAccount(
      user.id,
    );

    access =
      await getClientVipAccessState(
        user.id,
      );
  }

  const data =
    await getClientVipDashboardData(
      user.id,
    );

  return (
    <main className="min-h-screen bg-[#FFFAFB] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1400px] space-y-6">
        {access.mode ===
        "PAUSED" ? (
          <section className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5">
            <div className="flex items-start gap-3">
              <Clock3 className="mt-0.5 size-5 shrink-0 text-amber-700" />

              <div>
                <h1 className="font-serif text-lg font-semibold text-amber-950">
                  Programme fidélité temporairement en pause
                </h1>

                <p className="mt-1 text-sm leading-6 text-amber-800">
                  Votre compte, vos points et vos récompenses restent
                  consultables. Les nouveaux gains et certaines opérations
                  sont temporairement suspendus.
                </p>
              </div>
            </div>
          </section>
        ) : null}

        {!access.accountIsActive ||
        access.accountIsSuspended ? (
          <section className="rounded-[1.5rem] border border-red-200 bg-red-50 p-5">
            <div className="flex items-start gap-3">
              <LockKeyhole className="mt-0.5 size-5 shrink-0 text-red-700" />

              <div>
                <h2 className="font-serif text-lg font-semibold text-red-950">
                  Compte fidélité restreint
                </h2>

                <p className="mt-1 text-sm leading-6 text-red-800">
                  Vos informations restent visibles, mais les nouvelles
                  opérations fidélité sont actuellement bloquées.
                </p>
              </div>
            </div>
          </section>
        ) : null}

        <ClientVipDashboard
          data={data}
        />
      </div>
    </main>
  );
}
