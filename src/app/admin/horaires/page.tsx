import { requireAdminUser } from "@/lib/session";
import { getBusinessHours } from "@/features/admin/business-hours/business-hours";
import { BusinessHoursClient } from "@/features/admin/business-hours/business-hours-client";

export const dynamic = "force-dynamic";

export default async function AdminHorairesPage() {
  await requireAdminUser();
  const hours = await getBusinessHours();

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-pink-50 px-4 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-5 sm:mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-rose-600 sm:text-sm">Administration</p>
          <h1 className="mt-1.5 text-2xl font-semibold sm:mt-2 sm:text-5xl">Horaires du salon</h1>
          <p className="mt-2 text-sm text-zinc-600 sm:mt-3 sm:text-base">Le salon est ouvert 7 jours sur 7, de 09:00 à 19:00. Modifie ici les journées, heures et pauses.</p>
        </header>
        <BusinessHoursClient initialHours={hours} />
      </div>
    </main>
  );
}
