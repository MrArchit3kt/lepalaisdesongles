import type { Metadata } from "next";
import { Disc3, Sparkles } from "lucide-react";

import { AdminWheelDashboard } from "@/features/admin/wheel/components/admin-wheel-dashboard";
import {
  getAdminWheelSegments,
  getAdminWheelSettings,
} from "@/features/admin/wheel/services/admin-wheel.service";

export const metadata: Metadata = {
  title: "Roue de la chance | Administration",
  description: "Configuration de la roue de la chance et de ses lots.",
};

export const dynamic = "force-dynamic";

export default async function AdminWheelPage() {
  const [settings, segments] = await Promise.all([
    getAdminWheelSettings(),
    getAdminWheelSegments(),
  ]);

  return (
    <main className="min-h-screen">
      <div className="mx-auto w-full max-w-[1600px] px-3 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#2F2027] via-[#5E3544] to-[#B45F7A] px-4 py-5 text-white shadow-xl shadow-[#843F59]/15 sm:px-8 sm:py-8 lg:px-10">
          <div className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-[#E8B4C0]/25 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-32 left-1/3 size-72 rounded-full bg-white/10 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#FFF0F4]/75">
                <Sparkles className="size-4" />
                Marketing et fidélisation
              </div>

              <h1 className="mt-2 flex items-center gap-3 font-serif text-2xl font-semibold sm:mt-4 sm:text-5xl">
                <Disc3 className="size-8 sm:size-10" />
                Roue de la chance
              </h1>

              <p className="mt-3 max-w-2xl text-sm text-white/75 sm:text-base">
                Configurez les cases de la roue (perdu, réductions), leurs
                probabilités et les moments où elle est proposée aux
                clientes : après une réservation, une fois par jour à la
                connexion, ou les deux.
              </p>
            </div>
          </div>
        </section>

        <div className="mt-6">
          <AdminWheelDashboard
            initialSettings={settings}
            initialSegments={segments}
          />
        </div>
      </div>
    </main>
  );
}
