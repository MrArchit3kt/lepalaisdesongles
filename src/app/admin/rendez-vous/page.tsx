import { prisma } from "@/lib/prisma";
import { AdminAppointmentsClient } from "@/features/admin/appointments/components/admin-appointments-client";

export const dynamic = "force-dynamic";

export default async function AdminAppointmentsPage() {
  const appointments = await prisma.appointment.findMany({
    orderBy: [{ startsAt: "asc" }, { createdAt: "desc" }], take: 500,
    include: {
      client: { select: { firstName: true, lastName: true, email: true, phone: true } },
      staff: { select: { id: true, displayName: true, user: { select: { firstName: true, lastName: true } } } },
      workstation: { select: { id: true, name: true } },
      services: { orderBy: { sortOrder: "asc" }, select: { id: true, serviceName: true, quantity: true, durationMinutes: true } },
    },
  });

  const serialized = appointments.map((a) => ({
    id: a.id, reference: a.reference, status: a.status, paymentStatus: a.paymentStatus,
    startsAt: a.startsAt.toISOString(), endsAt: a.endsAt.toISOString(), totalPriceCents: a.totalPriceCents,
    depositCents: a.depositCents, clientComment: a.clientComment, adminComment: a.adminComment,
    cancellationReason: a.cancellationReason, client: a.client,
    staff: a.staff ? { id: a.staff.id, displayName: a.staff.displayName?.trim() || `${a.staff.user.firstName} ${a.staff.user.lastName}`.trim() } : null,
    workstation: a.workstation, services: a.services,
  }));

  return <main className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-pink-50 px-4 py-8 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl"><header className="mb-8"><p className="text-sm font-semibold uppercase tracking-[0.22em] text-rose-600">Administration</p><h1 className="mt-2 text-3xl font-semibold sm:text-5xl">Gestion des rendez-vous</h1><p className="mt-3 text-zinc-600">Confirmez, refusez, annulez, reprogrammez et suivez chaque rendez-vous.</p></header><AdminAppointmentsClient appointments={serialized}/></div></main>;
}
