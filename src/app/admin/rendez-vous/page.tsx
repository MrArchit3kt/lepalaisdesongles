import { AdminAppointmentsClient } from "@/features/admin/appointments/components/admin-appointments-client";
import { AdminCreateAppointmentDialog } from "@/features/admin/appointments/components/admin-create-appointment-dialog";
import { getPublicServices } from "@/features/services/services/public-services.service";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminAppointmentsPage() {
  const [appointments, allServices] = await Promise.all([
    prisma.appointment.findMany({
      orderBy: [
        {
          startsAt: "asc",
        },
        {
          createdAt: "desc",
        },
      ],

      take: 500,

      include: {
        client: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },

        staff: {
          select: {
            id: true,
            displayName: true,

            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },

        workstation: {
          select: {
            id: true,
            name: true,
          },
        },

        services: {
          orderBy: {
            sortOrder: "asc",
          },

          select: {
            id: true,
            serviceName: true,
            quantity: true,
            durationMinutes: true,
          },
        },
      },
    }),

    getPublicServices(),
  ]);

  const services = allServices.map((service) => ({
    id: service.id,
    name: service.name,
    categoryName: service.category.name,
    priceCents: service.priceCents,
    durationMinutes: service.durationMinutes,
  }));

  const serialized = appointments.map((appointment) => ({
    id: appointment.id,
    reference: appointment.reference,
    status: appointment.status,

    paymentStatus: appointment.paymentStatus,
    paymentMethod: appointment.paymentMethod,

    paypalCaptureId: appointment.paypalCaptureId,

    paypalRefundId: appointment.paypalRefundId,
    paypalRefundRequestId: appointment.paypalRefundRequestId,
    paypalRefundStatus: appointment.paypalRefundStatus,

    refundRequestedAt: appointment.refundRequestedAt?.toISOString() ?? null,

    refundedAmountCents: appointment.refundedAmountCents,

    refundedAt: appointment.refundedAt?.toISOString() ?? null,

    refundReason: appointment.refundReason,

    isRefunded:
      appointment.paymentStatus === "REFUNDED" &&
      appointment.paypalRefundStatus === "COMPLETED" &&
      Boolean(appointment.paypalRefundId),

    isRefundPending:
      appointment.paymentStatus === "PAID" &&
      appointment.paypalRefundStatus === "PENDING" &&
      Boolean(appointment.paypalRefundId),

    canRefund:
      appointment.paymentMethod === "PAYPAL" &&
      appointment.paymentStatus === "PAID" &&
      Boolean(appointment.paypalCaptureId) &&
      !appointment.paypalRefundId &&
      !appointment.paypalRefundRequestId &&
      !appointment.paypalRefundStatus &&
      !appointment.refundRequestedAt &&
      !appointment.refundedAt,

    canSyncRefund:
      appointment.paymentMethod === "PAYPAL" &&
      Boolean(appointment.paypalRefundId) &&
      appointment.paypalRefundStatus !== "COMPLETED",

    startsAt: appointment.startsAt.toISOString(),
    endsAt: appointment.endsAt.toISOString(),

    totalPriceCents: appointment.totalPriceCents,
    depositCents: appointment.depositCents,

    clientComment: appointment.clientComment,
    adminComment: appointment.adminComment,
    cancellationReason: appointment.cancellationReason,

    client: appointment.client,

    staff: appointment.staff
      ? {
          id: appointment.staff.id,

          displayName:
            appointment.staff.displayName?.trim() ||
            [appointment.staff.user.firstName, appointment.staff.user.lastName]
              .filter(Boolean)
              .join(" ")
              .trim(),
        }
      : null,

    workstation: appointment.workstation,
    services: appointment.services,
  }));

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-pink-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-rose-600">
              Administration
            </p>

            <h1 className="mt-2 text-3xl font-semibold sm:text-5xl">
              Gestion des rendez-vous
            </h1>

            <p className="mt-3 text-zinc-600">
              Confirmez, refusez, annulez, reprogrammez et suivez chaque
              rendez-vous.
            </p>
          </div>

          <AdminCreateAppointmentDialog services={services} />
        </header>

        <AdminAppointmentsClient appointments={serialized} />
      </div>
    </main>
  );
}
