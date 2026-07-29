import {
    AppointmentStatus,
    Prisma,
  } from "@/generated/prisma/client";
  
  import { prisma } from "@/lib/prisma";
  
  export type AppointmentTimelineChange = {
    field: string;
    label: string;
    before: unknown;
    after: unknown;
  };
  
  export type AppointmentTimelineAuthor = {
    id: string;
    name: string;
    email: string | null;
  };
  
  export type AppointmentTimelineColor =
    | "emerald"
    | "rose"
    | "amber"
    | "sky"
    | "violet"
    | "zinc";
  
  export type AppointmentTimelineItem = {
    id: string;
    action: string;
    createdAt: Date;
  
    previousStatus: AppointmentStatus | null;
    nextStatus: AppointmentStatus | null;
  
    previousStartsAt: Date | null;
    nextStartsAt: Date | null;
  
    reason: string | null;
    actorId: string | null;
  
    changes: AppointmentTimelineChange[];
  
    title: string;
    description: string | null;
    color: AppointmentTimelineColor;
    author: AppointmentTimelineAuthor | null;
  };
  
  function isRecord(
    value: unknown,
  ): value is Record<string, unknown> {
    return (
      typeof value === "object" &&
      value !== null &&
      !Array.isArray(value)
    );
  }
  
  function parseChanges(
    metadata: Prisma.JsonValue | null,
  ): AppointmentTimelineChange[] {
    if (!isRecord(metadata)) {
      return [];
    }
  
    const rawChanges = metadata.changes;
  
    if (!Array.isArray(rawChanges)) {
      return [];
    }
  
    return rawChanges.flatMap(
      (value): AppointmentTimelineChange[] => {
        if (!isRecord(value)) {
          return [];
        }
  
        const field =
          typeof value.field === "string"
            ? value.field
            : null;
  
        const label =
          typeof value.label === "string"
            ? value.label
            : null;
  
        if (!field || !label) {
          return [];
        }
  
        return [
          {
            field,
            label,
            before: value.before,
            after: value.after,
          },
        ];
      },
    );
  }
  
  function formatDate(
    value: Date | null,
  ): string | null {
    if (!value) {
      return null;
    }
  
    return new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "long",
      timeStyle: "short",
      timeZone: "Europe/Paris",
    }).format(value);
  }
  
  function getActionPresentation(
    action: string,
  ): {
    title: string;
    color: AppointmentTimelineColor;
  } {
    switch (action) {
      case "APPOINTMENT_CONFIRMED":
        return {
          title: "Rendez-vous confirmé",
          color: "emerald",
        };
  
      case "APPOINTMENT_REFUSED":
        return {
          title: "Rendez-vous refusé",
          color: "rose",
        };
  
      case "APPOINTMENT_CANCELLED_BY_ADMIN":
        return {
          title: "Rendez-vous annulé par le salon",
          color: "rose",
        };
  
      case "APPOINTMENT_CANCELLED_BY_CLIENT":
        return {
          title: "Rendez-vous annulé par la cliente",
          color: "rose",
        };
  
      case "APPOINTMENT_RESCHEDULED":
      case "APPOINTMENT_CALENDAR_MOVED":
        return {
          title: "Rendez-vous déplacé",
          color: "sky",
        };
  
      case "APPOINTMENT_NOTE_UPDATED":
        return {
          title: "Note administrative modifiée",
          color: "violet",
        };
  
      case "APPOINTMENT_STARTED":
        return {
          title: "Prestation commencée",
          color: "amber",
        };
  
      case "APPOINTMENT_COMPLETED":
        return {
          title: "Rendez-vous terminé",
          color: "emerald",
        };
  
      case "APPOINTMENT_NO_SHOW":
        return {
          title: "Cliente absente",
          color: "rose",
        };
  
      case "APPOINTMENT_CREATED":
        return {
          title: "Rendez-vous créé",
          color: "zinc",
        };
  
      case "APPOINTMENT_PAYMENT_UPDATED":
        return {
          title: "Paiement mis à jour",
          color: "emerald",
        };
  
      default:
        return {
          title: "Rendez-vous mis à jour",
          color: "zinc",
        };
    }
  }
  
  function buildDescription(input: {
    action: string;
    previousStartsAt: Date | null;
    nextStartsAt: Date | null;
    reason: string | null;
    changes: AppointmentTimelineChange[];
  }): string | null {
    const {
      action,
      previousStartsAt,
      nextStartsAt,
      reason,
      changes,
    } = input;
  
    if (
      action === "APPOINTMENT_RESCHEDULED" ||
      action === "APPOINTMENT_CALENDAR_MOVED"
    ) {
      const previousDate =
        formatDate(previousStartsAt);
  
      const nextDate =
        formatDate(nextStartsAt);
  
      if (previousDate && nextDate) {
        return `Créneau déplacé du ${previousDate} au ${nextDate}.`;
      }
  
      if (nextDate) {
        return `Nouveau créneau : ${nextDate}.`;
      }
    }
  
    if (reason) {
      return `Motif : ${reason}`;
    }
  
    const labels = changes
      .map((change) => change.label.trim())
      .filter(Boolean);
  
    if (labels.length === 1) {
      return `${labels[0]} a été modifié(e).`;
    }
  
    if (labels.length > 1) {
      return `Éléments modifiés : ${labels.join(", ")}.`;
    }
  
    return null;
  }
  
  function buildAuthorName(input: {
    firstName: string;
    lastName: string;
    email: string;
  }): string {
    const fullName = [
      input.firstName,
      input.lastName,
    ]
      .map((value) => value.trim())
      .filter(Boolean)
      .join(" ");
  
    return fullName || input.email;
  }
  
  export async function getAppointmentTimeline(
    appointmentId: string,
  ): Promise<AppointmentTimelineItem[]> {
    const cleanAppointmentId =
      appointmentId.trim();
  
    if (!cleanAppointmentId) {
      return [];
    }
  
    const history =
      await prisma.appointmentHistory.findMany({
        where: {
          appointmentId:
            cleanAppointmentId,
        },
  
        orderBy: [
          {
            createdAt: "asc",
          },
          {
            id: "asc",
          },
        ],
  
        select: {
          id: true,
          action: true,
          createdAt: true,
          previousStatus: true,
          nextStatus: true,
          previousStartsAt: true,
          nextStartsAt: true,
          reason: true,
          actorId: true,
          metadata: true,
        },
      });
  
    const actorIds = Array.from(
      new Set(
        history.flatMap((item) =>
          item.actorId
            ? [item.actorId]
            : [],
        ),
      ),
    );
  
    const actors =
      actorIds.length > 0
        ? await prisma.user.findMany({
            where: {
              id: {
                in: actorIds,
              },
            },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          })
        : [];
  
    const actorsById = new Map(
      actors.map((actor) => [
        actor.id,
        {
          id: actor.id,
          name: buildAuthorName(actor),
          email:
            actor.email || null,
        },
      ]),
    );
  
    return history.map(
      (item): AppointmentTimelineItem => {
        const changes =
          parseChanges(item.metadata);
  
        const presentation =
          getActionPresentation(
            item.action,
          );
  
        return {
          id: item.id,
          action: item.action,
          createdAt: item.createdAt,
  
          previousStatus:
            item.previousStatus,
  
          nextStatus:
            item.nextStatus,
  
          previousStartsAt:
            item.previousStartsAt,
  
          nextStartsAt:
            item.nextStartsAt,
  
          reason:
            item.reason,
  
          actorId:
            item.actorId,
  
          changes,
  
          title:
            presentation.title,
  
          description:
            buildDescription({
              action:
                item.action,
  
              previousStartsAt:
                item.previousStartsAt,
  
              nextStartsAt:
                item.nextStartsAt,
  
              reason:
                item.reason,
  
              changes,
            }),
  
          color:
            presentation.color,
  
          author:
            item.actorId
              ? actorsById.get(
                  item.actorId,
                ) ?? null
              : null,
        };
      },
    );
  }
  
  export async function getAppointmentTimelineByReference(
    reference: string,
  ): Promise<AppointmentTimelineItem[] | null> {
    const cleanReference =
      reference.trim();
  
    if (!cleanReference) {
      return null;
    }
  
    const appointment =
      await prisma.appointment.findUnique({
        where: {
          reference:
            cleanReference,
        },
  
        select: {
          id: true,
        },
      });
  
    if (!appointment) {
      return null;
    }
  
    return getAppointmentTimeline(
      appointment.id,
    );
  }