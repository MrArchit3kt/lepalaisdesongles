import type {
    Appointment,
    AppointmentService,
    StaffProfile,
    Workstation,
  } from "@/generated/prisma/client";
  
  export type AppointmentWithRelations =
    Appointment & {
      staff: StaffProfile | null;
      workstation: Workstation | null;
      services: AppointmentService[];
    };
  
  export type AppointmentServiceSnapshot = {
    serviceId: string;
    name: string;
    quantity: number;
    durationMinutes: number;
    unitPriceCents: number;
    totalDurationMinutes: number;
    totalPriceCents: number;
  };
  
  export type AppointmentFieldChange = {
    field: string;
    label: string;
    before: unknown;
    after: unknown;
  };
  
  export type AppointmentChangeSet = {
    hasChanges: boolean;
    changes: AppointmentFieldChange[];
    changedFields: string[];
  };
  
  function compareField(
    changes: AppointmentFieldChange[],
    field: string,
    label: string,
    before: unknown,
    after: unknown,
  ): void {
    if (before === after) {
      return;
    }
  
    changes.push({
      field,
      label,
      before,
      after,
    });
  }
  
  function normalizeText(
    value: string | null | undefined,
  ): string | null {
    const normalized =
      value?.replace(/\s+/g, " ").trim() ?? "";
  
    return normalized.length > 0
      ? normalized
      : null;
  }
  
  function serviceSnapshot(
    service: AppointmentService,
  ): AppointmentServiceSnapshot {
    return {
      serviceId: service.serviceId,
      name: service.serviceName,
      quantity: service.quantity,
      durationMinutes: service.durationMinutes,
      unitPriceCents: service.unitPriceCents,
  
      totalDurationMinutes:
        service.durationMinutes *
        service.quantity,
  
      totalPriceCents:
        service.unitPriceCents *
        service.quantity,
    };
  }
  
  function createServicesSnapshot(
    services: AppointmentService[],
  ): AppointmentServiceSnapshot[] {
    return [...services]
      .sort((first, second) => {
        if (
          first.sortOrder !==
          second.sortOrder
        ) {
          return (
            first.sortOrder -
            second.sortOrder
          );
        }
  
        return first.serviceId.localeCompare(
          second.serviceId,
        );
      })
      .map(serviceSnapshot);
  }
  
  function servicesSignature(
    services: AppointmentServiceSnapshot[],
  ): string {
    return JSON.stringify(
      services.map((service) => ({
        serviceId:
          service.serviceId,
  
        name:
          service.name,
  
        quantity:
          service.quantity,
  
        durationMinutes:
          service.durationMinutes,
  
        unitPriceCents:
          service.unitPriceCents,
      })),
    );
  }
  
  function sameInstant(
    before: Date,
    after: Date,
  ): boolean {
    return (
      before.getTime() ===
      after.getTime()
    );
  }
  
  function sameCalendarDate(
    before: Date,
    after: Date,
  ): boolean {
    const formatter =
      new Intl.DateTimeFormat(
        "fr-FR",
        {
          timeZone:
            "Europe/Paris",
  
          year:
            "numeric",
  
          month:
            "2-digit",
  
          day:
            "2-digit",
        },
      );
  
    return (
      formatter.format(before) ===
      formatter.format(after)
    );
  }
  
  function sameLocalTime(
    before: Date,
    after: Date,
  ): boolean {
    const formatter =
      new Intl.DateTimeFormat(
        "fr-FR",
        {
          timeZone:
            "Europe/Paris",
  
          hour:
            "2-digit",
  
          minute:
            "2-digit",
  
          hour12:
            false,
        },
      );
  
    return (
      formatter.format(before) ===
      formatter.format(after)
    );
  }
  
  export function detectAppointmentChanges(
    before: AppointmentWithRelations,
    after: AppointmentWithRelations,
  ): AppointmentChangeSet {
    const changes:
      AppointmentFieldChange[] = [];
  
    /*
     * On sépare volontairement :
     * - le jour ;
     * - l’heure ;
     *
     * Cela permettra aux notifications,
     * e-mails et timelines d’afficher
     * précisément ce qui a changé.
     */
    if (
      !sameCalendarDate(
        before.startsAt,
        after.startsAt,
      )
    ) {
      compareField(
        changes,
        "date",
        "Date",
        before.startsAt.toISOString(),
        after.startsAt.toISOString(),
      );
    }
  
    if (
      !sameLocalTime(
        before.startsAt,
        after.startsAt,
      )
    ) {
      compareField(
        changes,
        "time",
        "Heure",
        before.startsAt.toISOString(),
        after.startsAt.toISOString(),
      );
    }
  
    /*
     * Si startsAt change seulement à cause
     * d’une différence technique invisible
     * en heure locale, on conserve malgré
     * tout une trace générique.
     */
    if (
      !sameInstant(
        before.startsAt,
        after.startsAt,
      ) &&
      !changes.some(
        (change) =>
          change.field === "date" ||
          change.field === "time",
      )
    ) {
      compareField(
        changes,
        "startsAt",
        "Début",
        before.startsAt.toISOString(),
        after.startsAt.toISOString(),
      );
    }
  
    if (
      !sameInstant(
        before.endsAt,
        after.endsAt,
      )
    ) {
      compareField(
        changes,
        "endsAt",
        "Fin",
        before.endsAt.toISOString(),
        after.endsAt.toISOString(),
      );
    }
  
    compareField(
      changes,
      "status",
      "Statut",
      before.status,
      after.status,
    );
  
    compareField(
      changes,
      "staff",
      "Professionnelle",
      before.staff?.displayName ??
        null,
      after.staff?.displayName ??
        null,
    );
  
    compareField(
      changes,
      "staffId",
      "Identifiant de la professionnelle",
      before.staffId,
      after.staffId,
    );
  
    compareField(
      changes,
      "workstation",
      "Poste",
      before.workstation?.name ??
        null,
      after.workstation?.name ??
        null,
    );
  
    compareField(
      changes,
      "workstationId",
      "Identifiant du poste",
      before.workstationId,
      after.workstationId,
    );
  
    compareField(
      changes,
      "duration",
      "Durée",
      before.totalDurationMinutes,
      after.totalDurationMinutes,
    );
  
    compareField(
      changes,
      "price",
      "Prix",
      before.totalPriceCents,
      after.totalPriceCents,
    );
  
    compareField(
      changes,
      "deposit",
      "Acompte",
      before.depositCents,
      after.depositCents,
    );
  
    compareField(
      changes,
      "paymentStatus",
      "Statut du paiement",
      before.paymentStatus,
      after.paymentStatus,
    );
  
    compareField(
      changes,
      "paymentMethod",
      "Moyen de paiement",
      before.paymentMethod,
      after.paymentMethod,
    );
  
    compareField(
      changes,
      "clientComment",
      "Commentaire cliente",
      normalizeText(
        before.clientComment,
      ),
      normalizeText(
        after.clientComment,
      ),
    );
  
    compareField(
      changes,
      "adminComment",
      "Note interne",
      normalizeText(
        before.adminComment,
      ),
      normalizeText(
        after.adminComment,
      ),
    );
  
    compareField(
      changes,
      "cancellationReason",
      "Motif",
      normalizeText(
        before.cancellationReason,
      ),
      normalizeText(
        after.cancellationReason,
      ),
    );
  
    const beforeServices =
      createServicesSnapshot(
        before.services,
      );
  
    const afterServices =
      createServicesSnapshot(
        after.services,
      );
  
    if (
      servicesSignature(
        beforeServices,
      ) !==
      servicesSignature(
        afterServices,
      )
    ) {
      changes.push({
        field: "services",
        label: "Prestations",
        before: beforeServices,
        after: afterServices,
      });
    }
  
    return {
      hasChanges:
        changes.length > 0,
  
      changes,
  
      changedFields:
        changes.map(
          (change) =>
            change.field,
        ),
    };
  }