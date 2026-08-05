import "server-only";

import { createAppointment } from "@/features/booking/services/create-appointment.service";
import type {
  CreateAppointmentInput,
  CreateAppointmentResult,
} from "@/features/booking/types/create-appointment.types";
import { sendAppointmentEmail } from "@/features/notifications/services/appointment-email.service";
import { prisma } from "@/lib/prisma";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

export type AdminCreateAppointmentInput = {
  clientId: string;
  serviceIds: string[];
  serviceOptions?: Array<{ serviceId: string; quantity: number }>;
  staffId: string;
  workstationId: string;
  startsAt: string;
  endsAt: string;
};

export type AdminCreateAppointmentActor = {
  id: string;
  displayName: string;
};

type AdminCreateAppointmentErrorCode =
  | "CLIENT_NOT_FOUND"
  | "APPOINTMENT_CREATION_FAILED";

export class AdminCreateAppointmentError extends Error {
  public readonly code: AdminCreateAppointmentErrorCode;
  public readonly status: number;

  public constructor(
    code: AdminCreateAppointmentErrorCode,
    message: string,
    status: number,
  ) {
    super(message);

    this.name = "AdminCreateAppointmentError";
    this.code = code;
    this.status = status;
  }
}

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.NEXTAUTH_URL?.trim() ||
    "https://lepalaisdesongles.fr"
  ).replace(/\/+$/, "");
}

/*
 * createAppointment() ne renvoie pas le détail des prestations ni
 * de la professionnelle : on les recharge pour construire l'e-mail
 * de demande de paiement, sans modifier la fonction partagée par le
 * tunnel de réservation public.
 */
async function loadAppointmentEmailContext(appointmentId: string): Promise<{
  recipientEmail: string;
  recipientName: string;
  serviceNames: string[];
  staffName: string | null;
}> {
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
    throw new AdminCreateAppointmentError(
      "APPOINTMENT_CREATION_FAILED",
      "Le rendez-vous créé est introuvable.",
      500,
    );
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

/* -------------------------------------------------------------------------- */
/*                    CRÉATION MANUELLE PAR L'ADMINISTRATION                  */
/* -------------------------------------------------------------------------- */

export async function adminCreateAppointment(
  input: AdminCreateAppointmentInput,
  actor: AdminCreateAppointmentActor,
): Promise<CreateAppointmentResult> {
  const clientId = input.clientId.trim();

  const client = await prisma.user.findFirst({
    where: {
      id: clientId,
      role: "CLIENT",
      status: "ACTIVE",
    },

    select: { id: true },
  });

  if (!client) {
    throw new AdminCreateAppointmentError(
      "CLIENT_NOT_FOUND",
      "Cette cliente est introuvable ou son compte n'est pas actif.",
      404,
    );
  }

  const createInput: CreateAppointmentInput = {
    serviceIds: input.serviceIds,
    serviceOptions: input.serviceOptions ?? [],
    staffId: input.staffId,
    workstationId: input.workstationId,
    startsAt: input.startsAt,
    endsAt: input.endsAt,
    clientComment: null,
    images: [],
  };

  const result = await createAppointment(client.id, createInput);

  /*
   * Trace la création dans l'historique du rendez-vous et le
   * journal d'audit : contrairement à une réservation publique,
   * celle-ci a été déclenchée par un·e membre de l'équipe.
   */
  await prisma.$transaction([
    prisma.appointmentHistory.create({
      data: {
        appointmentId: result.appointmentId,
        actorId: actor.id,
        action: "ADMIN_APPOINTMENT_CREATED",
        nextStatus: result.status,
        reason: `Rendez-vous créé manuellement par ${actor.displayName}.`,
      },
    }),

    prisma.auditLog.create({
      data: {
        actorId: actor.id,
        action: "ADMIN_APPOINTMENT_CREATED",
        entityType: "Appointment",
        entityId: result.appointmentId,

        metadata: {
          reference: result.reference,
          clientId: client.id,
          requiresPayment: result.requiresPayment,
        },
      },
    }),
  ]);

  if (result.requiresPayment) {
    try {
      const context = await loadAppointmentEmailContext(result.appointmentId);

      const siteUrl = getSiteUrl();

      await sendAppointmentEmail({
        kind: "DEPOSIT_PAYMENT_REQUESTED",

        recipientEmail: context.recipientEmail,
        recipientName: context.recipientName,

        appointmentReference: result.reference,
        startsAt: input.startsAt,

        serviceNames: context.serviceNames,
        staffName: context.staffName,

        manageUrl: `${siteUrl}${result.confirmationUrl}`,

        depositAmountCents: result.depositCents,
      });
    } catch (reason: unknown) {
      /*
       * Le rendez-vous est déjà créé : un problème d'envoi ne doit
       * jamais faire échouer la création côté admin. L'admin peut
       * toujours partager le lien de paiement manuellement.
       */
      console.error("[ADMIN_APPOINTMENT_DEPOSIT_EMAIL]", reason);
    }
  }

  return result;
}
