import { randomBytes } from "node:crypto";

import {
  AppointmentStatus,
  PaymentMethod,
  PaymentStatus,
  Prisma,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/features/notifications/services/notification.service";
import { appointmentCreatedNotification } from "@/features/notifications/utils/notification-helper";
import { sendAppointmentEmail } from "@/features/notifications/services/appointment-email.service";

import type {
  CreateAppointmentInput,
  CreateAppointmentResult,
} from "../types/create-appointment.types";
import { getAvailability } from "./availability.service";
import { calculateRequiredPaymentCents } from "../utils/booking-rules";

const BLOCKING_STATUSES: AppointmentStatus[] = [
  AppointmentStatus.PENDING,
  AppointmentStatus.CONFIRMED,
  AppointmentStatus.IN_PROGRESS,
];

const MAX_APPOINTMENT_IMAGES = 5;

type SanitizedAppointmentImage = {
  key: string;
};

type TrustedAppointmentImage = {
  key: string;
  url: string;
  fileName: string | null;
  mimeType: string;
  sizeBytes: number;
};

function cleanIds(values: string[]): string[] {
  return Array.from(
    new Set(values.map((value) => value.trim()).filter(Boolean)),
  );
}

function cleanServiceQuantities(
  serviceIds: string[],
  serviceOptions: CreateAppointmentInput["serviceOptions"] | undefined,
): Map<string, number> {
  const quantities = new Map<string, number>();

  for (const serviceId of serviceIds) {
    quantities.set(serviceId, 1);
  }

  for (const option of serviceOptions ?? []) {
    if (!option || typeof option !== "object") {
      throw new Error("Une quantité de prestation est invalide.");
    }

    const serviceId =
      typeof option.serviceId === "string" ? option.serviceId.trim() : "";

    if (!serviceId || !quantities.has(serviceId)) {
      throw new Error(
        "Une quantité de prestation ne correspond pas aux prestations sélectionnées.",
      );
    }

    if (
      !Number.isInteger(option.quantity) ||
      option.quantity < 1 ||
      option.quantity > 50
    ) {
      throw new Error(
        "La quantité d’une prestation doit être comprise entre 1 et 50.",
      );
    }

    quantities.set(serviceId, option.quantity);
  }

  return quantities;
}

function parseIsoDate(value: string, field: string): Date {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`${field} est invalide.`);
  }

  return parsed;
}

function dateInParis(value: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(value);
}

function makeReference(): string {
  const date = new Intl.DateTimeFormat("fr-CA", {
    timeZone: "Europe/Paris",
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  })
    .format(new Date())
    .replaceAll("-", "");

  const randomPart = randomBytes(3).toString("hex").toUpperCase();

  return `PDO-${date}-${randomPart}`;
}

function cleanAppointmentImages(
  images: CreateAppointmentInput["images"] | undefined,
): SanitizedAppointmentImage[] {
  if (!images || images.length === 0) {
    return [];
  }

  if (images.length > MAX_APPOINTMENT_IMAGES) {
    throw new Error(
      `Vous pouvez joindre au maximum ${MAX_APPOINTMENT_IMAGES} photos.`,
    );
  }

  const uniqueKeys = new Set<string>();

  for (const rawImage of images) {
    if (!rawImage || typeof rawImage !== "object") {
      throw new Error("Une photo d’inspiration est invalide.");
    }

    const candidate = rawImage as {
      key?: unknown;
    };

    const key = typeof candidate.key === "string" ? candidate.key.trim() : "";

    if (!key || key.length > 500) {
      throw new Error("Une photo d’inspiration ne possède pas de clé valide.");
    }

    uniqueKeys.add(key);
  }

  return Array.from(uniqueKeys).map((key) => ({
    key,
  }));
}

function isRetryableTransactionError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    (error.code === "P2034" || error.code === "P2002")
  );
}

async function createWithRetry<T>(operation: () => Promise<T>): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (!isRetryableTransactionError(error) || attempt === 3) {
        throw error;
      }
    }
  }

  throw lastError;
}

export async function createAppointment(
  clientId: string,
  input: CreateAppointmentInput,
): Promise<CreateAppointmentResult> {
  const serviceIds = cleanIds(input.serviceIds);

  const quantityByServiceId = cleanServiceQuantities(
    serviceIds,
    input.serviceOptions,
  );

  const serviceOptions = serviceIds.map((serviceId) => ({
    serviceId,
    quantity: quantityByServiceId.get(serviceId) ?? 1,
  }));

  const staffId = input.staffId.trim();

  const workstationId = input.workstationId.trim();

  const startsAt = parseIsoDate(input.startsAt, "L'heure de début");

  const endsAt = parseIsoDate(input.endsAt, "L'heure de fin");

  const appointmentImages = cleanAppointmentImages(input.images);

  if (!clientId) {
    throw new Error("Vous devez être connecté pour réserver.");
  }

  if (serviceIds.length === 0) {
    throw new Error("Sélectionnez au moins une prestation.");
  }

  if (!staffId || staffId === "any") {
    throw new Error("La professionnelle du créneau est manquante.");
  }

  if (!workstationId) {
    throw new Error("Le poste de travail du créneau est manquant.");
  }

  if (startsAt <= new Date()) {
    throw new Error("Ce créneau est déjà passé.");
  }

  if (endsAt <= startsAt) {
    throw new Error("La durée du rendez-vous est invalide.");
  }

  /*
   * Première vérification via le service public
   * de disponibilités.
   */
  const availability = await getAvailability({
    staffId,
    serviceIds,
    serviceOptions,
    date: dateInParis(startsAt),
  });

  const exactSlot = availability.slots.find(
    (slot) =>
      slot.startsAt === startsAt.toISOString() &&
      slot.endsAt === endsAt.toISOString() &&
      slot.staff.id === staffId &&
      slot.workstation.id === workstationId,
  );

  if (!exactSlot) {
    throw new Error(
      "Ce créneau n'est plus disponible. Choisissez-en un autre.",
    );
  }

  const result = await createWithRetry(() =>
    prisma.$transaction(
      async (tx) => {
        const client = await tx.user.findFirst({
          where: {
            id: clientId,

            status: "ACTIVE",

            role: "CLIENT",
          },

          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        });

        if (!client) {
          throw new Error("Votre compte client n'est pas actif.");
        }

        const staff = await tx.staffProfile.findFirst({
          where: {
            id: staffId,
            isActive: true,
            acceptsOnlineBooking: true,

            user: {
              status: "ACTIVE",
            },
          },

          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },

            services: {
              where: {
                serviceId: {
                  in: serviceIds,
                },

                isActive: true,

                service: {
                  isActive: true,
                  allowOnlineBooking: true,
                },
              },

              include: {
                service: true,
              },
            },
          },
        });

        if (!staff || staff.services.length !== serviceIds.length) {
          throw new Error(
            "Cette professionnelle ne réalise plus toutes les prestations choisies.",
          );
        }

        const workstation = await tx.staffWorkstation.findFirst({
          where: {
            staffId,
            workstationId,
            isActive: true,

            workstation: {
              isActive: true,
              availableForBooking: true,

              AND: serviceIds.map((serviceId) => ({
                serviceAssignments: {
                  some: {
                    serviceId,
                    isActive: true,
                  },
                },
              })),
            },
          },

          select: {
            workstationId: true,
          },
        });

        if (!workstation) {
          throw new Error(
            "Le poste choisi n'est plus compatible avec cette réservation.",
          );
        }

        const totalDurationMinutes = staff.services.reduce(
          (total, assignment) => {
            const quantity = quantityByServiceId.get(assignment.serviceId) ?? 1;

            return (
              total +
              (assignment.durationMinutes ??
                assignment.service.durationMinutes) *
                quantity
            );
          },
          0,
        );

        const cleanupMinutes = Math.max(
          staff.defaultCleanupMinutes,
          ...staff.services.map(
            (assignment) =>
              assignment.cleanupMinutes ?? assignment.service.cleanupMinutes,
          ),
        );

        const expectedEndsAt = new Date(
          startsAt.getTime() + totalDurationMinutes * 60_000,
        );

        if (expectedEndsAt.getTime() !== endsAt.getTime()) {
          throw new Error(
            "La durée des prestations a changé. Rechargez les créneaux.",
          );
        }

        const occupiedEndsAt = new Date(
          endsAt.getTime() + cleanupMinutes * 60_000,
        );

        /*
         * Seconde vérification dans une transaction
         * Serializable afin d'éviter les doubles
         * réservations.
         */
        const conflict = await tx.appointment.findFirst({
          where: {
            status: {
              in: BLOCKING_STATUSES,
            },

            startsAt: {
              lt: occupiedEndsAt,
            },

            endsAt: {
              gt: startsAt,
            },

            OR: [
              {
                staffId,
              },
              {
                workstationId,
              },
            ],
          },

          select: {
            id: true,
          },
        });

        if (conflict) {
          throw new Error(
            "Ce créneau vient d'être réservé. Choisissez-en un autre.",
          );
        }

        const resolvedServices = staff.services.map((assignment, index) => {
          const unitPriceCents =
            assignment.priceCents ??
            assignment.service.promotionalPriceCents ??
            assignment.service.priceCents;

          if (unitPriceCents === null) {
            throw new Error(
              `La prestation « ${assignment.service.name} » est disponible uniquement sur devis.`,
            );
          }

          return {
            serviceId: assignment.serviceId,

            serviceName: assignment.service.name,

            unitPriceCents,

            durationMinutes:
              assignment.durationMinutes ?? assignment.service.durationMinutes,

            quantity: quantityByServiceId.get(assignment.serviceId) ?? 1,

            sortOrder: index,
          };
        });

        const totalPriceCents = resolvedServices.reduce(
          (total, service) => total + service.unitPriceCents * service.quantity,
          0,
        );

        if (totalPriceCents < 0) {
          throw new Error("Le montant total des prestations est invalide.");
        }

        /*
         * Ce champ conserve le nom depositCents
         * dans la base, mais contient :
         *
         * - le paiement intégral jusqu'à 35 € ;
         * - l'acompte fixe de 35 € au-dessus.
         */
        const depositCents = calculateRequiredPaymentCents(totalPriceCents);

        const requiresPayment = depositCents > 0;

        const appointmentStatus = requiresPayment
          ? AppointmentStatus.PENDING
          : AppointmentStatus.CONFIRMED;

        const paymentStatus = requiresPayment
          ? PaymentStatus.PENDING
          : PaymentStatus.NOT_REQUIRED;

        const reference = makeReference();

        const uploadKeys = appointmentImages.map((image) => image.key);

        const uploadClaimedAt = new Date();

        const registeredUploads =
          uploadKeys.length > 0
            ? await tx.securityUpload.findMany({
                where: {
                  key: {
                    in: uploadKeys,
                  },

                  uploadedById: clientId,

                  purpose: "APPOINTMENT_INSPIRATION",

                  claimedAt: null,

                  expiresAt: {
                    gt: uploadClaimedAt,
                  },
                },

                select: {
                  key: true,

                  url: true,

                  fileName: true,

                  mimeType: true,

                  sizeBytes: true,
                },
              })
            : [];

        if (registeredUploads.length !== uploadKeys.length) {
          throw new Error(
            "Une photo d’inspiration est expirée, déjà utilisée ou n’appartient pas à votre compte.",
          );
        }

        const registeredUploadByKey = new Map(
          registeredUploads.map((upload) => [upload.key, upload]),
        );

        const trustedAppointmentImages: TrustedAppointmentImage[] =
          uploadKeys.map((key) => {
            const upload = registeredUploadByKey.get(key);

            if (!upload) {
              throw new Error(
                "Une photo d’inspiration n’a pas pu être vérifiée.",
              );
            }

            return {
              key: upload.key,

              url: upload.url,

              fileName: upload.fileName,

              mimeType: upload.mimeType,

              sizeBytes: upload.sizeBytes,
            };
          });

        const appointment = await tx.appointment.create({
          data: {
            reference,
            clientId,
            staffId,
            workstationId,

            status: appointmentStatus,

            startsAt,
            endsAt,

            totalDurationMinutes,
            totalPriceCents,
            depositCents,

            paymentStatus,

            paymentMethod: requiresPayment ? PaymentMethod.PAYPAL : null,

            confirmedAt: requiresPayment ? null : new Date(),

            clientComment: input.clientComment?.trim() || null,

            services: {
              create: resolvedServices,
            },

            images:
              trustedAppointmentImages.length > 0
                ? {
                    create: trustedAppointmentImages.map((image) => ({
                      url: image.url,

                      fileName: image.fileName,

                      mimeType: image.mimeType,

                      sizeBytes: image.sizeBytes,
                    })),
                  }
                : undefined,
          },

          select: {
            id: true,
            reference: true,
          },
        });

        if (uploadKeys.length > 0) {
          const claimResult = await tx.securityUpload.updateMany({
            where: {
              key: {
                in: uploadKeys,
              },

              uploadedById: clientId,

              purpose: "APPOINTMENT_INSPIRATION",

              claimedAt: null,

              expiresAt: {
                gt: uploadClaimedAt,
              },
            },

            data: {
              claimedAt: uploadClaimedAt,

              claimedEntityType: "Appointment",

              claimedEntityId: appointment.id,
            },
          });

          if (claimResult.count !== uploadKeys.length) {
            throw new Error(
              "Une photo d’inspiration vient déjà d’être utilisée. Veuillez recommencer.",
            );
          }
        }

        return {
          reference: appointment.reference,

          appointmentId: appointment.id,

          status: requiresPayment
            ? ("PENDING" as const)
            : ("CONFIRMED" as const),

          paymentStatus: requiresPayment
            ? ("PENDING" as const)
            : ("NOT_REQUIRED" as const),

          depositCents,
          requiresPayment,

          confirmationUrl: requiresPayment
            ? `/reservation/paiement/${appointment.reference}`
            : `/reservation/confirmation/${appointment.reference}`,

          emailContext: {
            recipientEmail: client.email,

            recipientName: [client.firstName, client.lastName]
              .filter(Boolean)
              .join(" ")
              .trim(),

            serviceNames: resolvedServices.flatMap((service) =>
              Array.from(
                {
                  length: service.quantity,
                },
                () => service.serviceName,
              ),
            ),

            staffName:
              staff.displayName?.trim() ||
              [staff.user.firstName, staff.user.lastName]
                .filter(Boolean)
                .join(" ")
                .trim() ||
              null,
          },
        };
      },

      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    ),
  );

  try {
    await createNotification(
      appointmentCreatedNotification({
        userId: clientId,
        reference: result.reference,
        startsAt,
      }),
    );
  } catch (reason: unknown) {
    console.error("[APPOINTMENT_CREATED_NOTIFICATION]", reason);
  }

  /*
   * Une réservation nécessitant un paiement PayPal
   * reste PENDING à ce stade.
   *
   * L'e-mail BOOKING_CONFIRMED ne doit donc partir
   * ici que pour les rendez-vous immédiatement
   * confirmés sans paiement.
   *
   * Pour les rendez-vous PayPal, l'envoi sera
   * déclenché après la capture effective.
   */
  if (!result.requiresPayment) {
    try {
      const siteUrl = (
        process.env.NEXT_PUBLIC_APP_URL?.trim() ||
        process.env.NEXTAUTH_URL?.trim() ||
        "https://lepalaisdesongles.fr"
      ).replace(/\/+$/, "");

      await sendAppointmentEmail({
        kind: "BOOKING_CONFIRMED",

        recipientEmail: result.emailContext.recipientEmail,

        recipientName: result.emailContext.recipientName,

        appointmentReference: result.reference,

        startsAt: startsAt.toISOString(),

        serviceNames: result.emailContext.serviceNames,

        staffName: result.emailContext.staffName,

        manageUrl: `${siteUrl}/espace-client/rendez-vous/${encodeURIComponent(
          result.reference,
        )}`,
      });
    } catch (reason: unknown) {
      /*
       * Un problème Resend ne doit jamais annuler
       * un rendez-vous déjà créé en base.
       */
      console.error("[APPOINTMENT_BOOKING_CONFIRMED_EMAIL]", reason);
    }
  }

  return {
    reference: result.reference,
    appointmentId: result.appointmentId,
    status: result.status,
    paymentStatus: result.paymentStatus,
    depositCents: result.depositCents,
    requiresPayment: result.requiresPayment,
    confirmationUrl: result.confirmationUrl,
  };
}
