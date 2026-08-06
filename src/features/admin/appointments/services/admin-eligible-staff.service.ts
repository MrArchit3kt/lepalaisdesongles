import "server-only";

import { prisma } from "@/lib/prisma";
import { calculateRequiredPaymentCents } from "@/features/booking/utils/booking-rules";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

export type AdminEligibleStaffOption = {
  staffId: string;
  displayName: string;
  totalDurationMinutes: number;
  cleanupMinutes: number;
  totalPriceCents: number;
  depositCents: number;
  workstationId: string | null;
};

export class AdminEligibleStaffError extends Error {
  constructor(message: string) {
    super(message);

    this.name = "AdminEligibleStaffError";
  }
}

/* -------------------------------------------------------------------------- */
/*                                CONSTANTES                                  */
/* -------------------------------------------------------------------------- */

const MAX_SERVICE_IDS = 10;
const MAX_IDENTIFIER_LENGTH = 191;

/* -------------------------------------------------------------------------- */
/*                                  SERVICE                                   */
/* -------------------------------------------------------------------------- */

/*
 * Liste les professionnelles pouvant réaliser toutes les prestations
 * demandées, pour un rendez-vous créé manuellement par l'équipe.
 *
 * Contrairement au moteur de disponibilité public
 * (`booking/services/availability.service.ts`), cette recherche
 * ignore volontairement `acceptsOnlineBooking`, `allowOnlineBooking`
 * et les horaires configurés : ce sont des réglages qui concernent la
 * réservation en ligne côté cliente, pas des contraintes métier. Une
 * professionnelle qui ne prend pas de rendez-vous en ligne, ou dont
 * le planning du jour n'est pas configuré, peut très bien être
 * planifiée manuellement par l'équipe. Seul un véritable
 * chevauchement de planning est bloqué, au moment de la création
 * (voir `admin-create-appointment.service.ts`).
 */
export async function getAdminEligibleStaff(
  rawServiceIds: string[],
  serviceOptions: Array<{ serviceId: string; quantity: number }> = [],
): Promise<AdminEligibleStaffOption[]> {
  const serviceIds = Array.from(
    new Set(rawServiceIds.map((id) => id.trim()).filter(Boolean)),
  );

  if (serviceIds.length === 0) {
    throw new AdminEligibleStaffError("Sélectionnez au moins une prestation.");
  }

  if (serviceIds.length > MAX_SERVICE_IDS) {
    throw new AdminEligibleStaffError(
      `Vous ne pouvez pas sélectionner plus de ${MAX_SERVICE_IDS} prestations.`,
    );
  }

  if (serviceIds.some((id) => id.length > MAX_IDENTIFIER_LENGTH)) {
    throw new AdminEligibleStaffError(
      "Une des prestations sélectionnées est invalide.",
    );
  }

  const quantityByServiceId = new Map<string, number>();

  for (const serviceId of serviceIds) {
    quantityByServiceId.set(serviceId, 1);
  }

  for (const option of serviceOptions) {
    const serviceId = option.serviceId.trim();

    if (!serviceId || !serviceIds.includes(serviceId)) {
      continue;
    }

    if (
      !Number.isInteger(option.quantity) ||
      option.quantity < 1 ||
      option.quantity > 50
    ) {
      continue;
    }

    quantityByServiceId.set(serviceId, option.quantity);
  }

  const staffMembers = await prisma.staffProfile.findMany({
    where: {
      isActive: true,

      user: {
        status: "ACTIVE",
      },

      AND: serviceIds.map((serviceId) => ({
        services: {
          some: {
            serviceId,
            isActive: true,
            service: { isActive: true },
          },
        },
      })),
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
          serviceId: { in: serviceIds },
          isActive: true,
          service: { isActive: true },
        },

        include: { service: true },
      },

      workstationAssignments: {
        where: {
          isActive: true,
          workstation: { isActive: true },
        },

        include: {
          workstation: {
            include: {
              serviceAssignments: {
                where: {
                  serviceId: { in: serviceIds },
                  isActive: true,
                },
              },
            },
          },
        },

        orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
      },
    },

    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  const options: AdminEligibleStaffOption[] = [];

  for (const staff of staffMembers) {
    // La professionnelle ne réalise pas (ou plus) toutes les prestations.
    if (staff.services.length !== serviceIds.length) {
      continue;
    }

    let totalPriceCents = 0;
    let hasQuoteOnlyService = false;

    for (const assignment of staff.services) {
      const priceCents =
        assignment.priceCents ??
        assignment.service.promotionalPriceCents ??
        assignment.service.priceCents;

      if (priceCents === null) {
        hasQuoteOnlyService = true;

        break;
      }

      const quantity = quantityByServiceId.get(assignment.serviceId) ?? 1;

      totalPriceCents += priceCents * quantity;
    }

    // Prestation sur devis : pas de tarif calculable automatiquement.
    if (hasQuoteOnlyService) {
      continue;
    }

    const totalDurationMinutes = staff.services.reduce((total, assignment) => {
      const quantity = quantityByServiceId.get(assignment.serviceId) ?? 1;

      return (
        total +
        (assignment.durationMinutes ?? assignment.service.durationMinutes) *
          quantity
      );
    }, 0);

    const cleanupMinutes = Math.max(
      staff.defaultCleanupMinutes,

      ...staff.services.map(
        (assignment) =>
          assignment.cleanupMinutes ?? assignment.service.cleanupMinutes,
      ),
    );

    const depositCents = calculateRequiredPaymentCents(totalPriceCents);

    const displayName =
      staff.displayName?.trim() ||
      `${staff.user.firstName} ${staff.user.lastName}`.trim();

    const fullyCompatibleAssignment = staff.workstationAssignments.find(
      (assignment) =>
        assignment.workstation.serviceAssignments.length === serviceIds.length,
    );

    const workstationId =
      fullyCompatibleAssignment?.workstationId ??
      staff.workstationAssignments[0]?.workstationId ??
      null;

    options.push({
      staffId: staff.id,
      displayName,
      totalDurationMinutes,
      cleanupMinutes,
      totalPriceCents,
      depositCents,
      workstationId,
    });
  }

  return options;
}
