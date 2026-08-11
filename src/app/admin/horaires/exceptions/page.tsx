import { requireAdminUser } from "@/lib/session";
import { getAvailabilityExceptions } from "@/features/admin/availability-exceptions/availability-exceptions";
import { AvailabilityExceptionsClient } from "@/features/admin/availability-exceptions/availability-exceptions-client";

export const dynamic = "force-dynamic";

export default async function AvailabilityExceptionsPage() {
  await requireAdminUser();
  const data = await getAvailabilityExceptions();

  const serialized = {
    staff: data.staff,
    salonTimeOffs: data.salonTimeOffs.map((item) => ({
      ...item,
      startsAt: item.startsAt.toISOString(),
      endsAt: item.endsAt.toISOString(),
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    })),
    staffTimeOffs: data.staffTimeOffs.map((item) => ({
      ...item,
      startsAt: item.startsAt.toISOString(),
      endsAt: item.endsAt.toISOString(),
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    })),
    salonOverrides: data.salonOverrides.map((item) => ({
      ...item,
      date: item.date.toISOString(),
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    })),
    staffOverrides: data.staffOverrides.map((item) => ({
      ...item,
      date: item.date.toISOString(),
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    })),
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-pink-50 px-4 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-5 sm:mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-rose-600 sm:text-sm">Administration</p>
          <h1 className="mt-1.5 text-2xl font-semibold sm:mt-2 sm:text-5xl">Absences et exceptions</h1>
          <p className="mt-2 max-w-3xl text-sm text-zinc-600 sm:mt-3 sm:text-base">
            Gérez les congés, maladies, formations, fermetures exceptionnelles et ouvertures particulières.
          </p>
        </header>
        <AvailabilityExceptionsClient initialData={serialized} />
      </div>
    </main>
  );
}
