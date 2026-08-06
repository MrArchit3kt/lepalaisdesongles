import "server-only";

import { prisma } from "@/lib/prisma";

export type AppointmentEmailContext = {
  recipientEmail: string;
  recipientName: string;
  serviceNames: string[];
  staffName: string | null;
};

/*
 * Recharge le détail d'un rendez-vous (cliente, professionnelle,
 * prestations) nécessaire à la construction d'un e-mail transactionnel,
 * lorsque le flux d'origine (création manuelle admin, application d'un
 * code promo, capture PayPal...) ne dispose pas déjà de ces informations
 * en mémoire.
 */
export async function loadAppointmentEmailContext(
  appointmentId: string,
): Promise<AppointmentEmailContext> {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },

    select: {
      client: {
        select: { email: true, firstName: true, lastName: true },
      },

      staff: {
        select: {
          displayName: true,
          user: { select: { firstName: true, lastName: true } },
        },
      },

      services: {
        orderBy: { sortOrder: "asc" },
        select: { serviceName: true, quantity: true },
      },
    },
  });

  if (!appointment) {
    throw new Error("Le rendez-vous est introuvable.");
  }

  const serviceNames = appointment.services.flatMap((service) =>
    Array.from(
      { length: Math.max(service.quantity, 1) },
      () => service.serviceName,
    ),
  );

  const staffName =
    appointment.staff?.displayName?.trim() ||
    [appointment.staff?.user.firstName, appointment.staff?.user.lastName]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    null;

  return {
    recipientEmail: appointment.client.email,

    recipientName: [appointment.client.firstName, appointment.client.lastName]
      .filter(Boolean)
      .join(" ")
      .trim(),

    serviceNames,
    staffName,
  };
}
