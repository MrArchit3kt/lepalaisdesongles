import {
  AppointmentStatus,
} from "@/generated/prisma/client";

import {
  getServerSession,
} from "next-auth";

import {
  NextResponse,
} from "next/server";

import {
  authOptions,
} from "@/lib/auth";

import {
  getAdminCalendar,
} from "@/features/admin/calendar/services/admin-calendar.service";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type SessionUser = {
  id?: string;
  role?: string;
};

/* -------------------------------------------------------------------------- */
/*                                CONFIGURATION                               */
/* -------------------------------------------------------------------------- */

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

function parseStatuses(
  value: string | null,
): AppointmentStatus[] | undefined {
  if (!value) {
    return undefined;
  }

  const validStatuses =
    new Set(
      Object.values(
        AppointmentStatus,
      ),
    );

  const statuses =
    value
      .split(",")
      .map((status) =>
        status.trim(),
      )
      .filter(
        (
          status,
        ): status is AppointmentStatus =>
          validStatuses.has(
            status as AppointmentStatus,
          ),
      );

  return statuses.length > 0
    ? statuses
    : undefined;
}

/* -------------------------------------------------------------------------- */
/*                                    GET                                     */
/* -------------------------------------------------------------------------- */

export async function GET(
  request: Request,
) {
  try {
    const session =
      await getServerSession(
        authOptions,
      );

    const user =
      session?.user as
        | SessionUser
        | undefined;

    if (
      !user?.id ||
      ![
        "SUPER_ADMIN",
        "ADMIN",
        "STAFF",
      ].includes(
        user.role ?? "",
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Accès refusé.",
        },
        {
          status: 403,
        },
      );
    }

    const url =
      new URL(
        request.url,
      );

    const start =
      url.searchParams.get(
        "start",
      );

    const end =
      url.searchParams.get(
        "end",
      );

    const staffId =
      url.searchParams.get(
        "staffId",
      );

    const workstationId =
      url.searchParams.get(
        "workstationId",
      );

    const search =
      url.searchParams.get(
        "search",
      );

    const statuses =
      parseStatuses(
        url.searchParams.get(
          "statuses",
        ),
      );

    if (
      start &&
      Number.isNaN(
        new Date(
          start,
        ).getTime(),
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "La date de début est invalide.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      end &&
      Number.isNaN(
        new Date(
          end,
        ).getTime(),
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "La date de fin est invalide.",
        },
        {
          status: 400,
        },
      );
    }

    const calendar =
      await getAdminCalendar(
        {
          actorId:
            user.id,

          startsAt:
            start,

          endsAt:
            end,

          staffId:
            staffId &&
            staffId !==
              "ALL"
              ? staffId
              : undefined,

          workstationId:
            workstationId &&
            workstationId !==
              "ALL"
              ? workstationId
              : undefined,

          statuses,

          search,
        },
      );

    /*
     * On conserve le format historique attendu par
     * AdminCalendarClient afin de ne rien casser.
     *
     * En parallèle, on renvoie aussi les nouveaux champs :
     * events, businessHours, statistics et range.
     */

    const appointments =
      calendar.events
        .filter(
          (event) =>
            event.kind ===
              "APPOINTMENT" &&
            event.client !==
              null &&
            event.reference !==
              null &&
            event.status !==
              null,
        )
        .map(
          (event) => ({
            id: event.id,

            reference:
              event.reference as string,

            startsAt:
              event.startsAt,

            endsAt:
              event.endsAt,

            status:
              event.status as AppointmentStatus,

            paymentStatus:
              String(
                event.metadata
                  .paymentStatus ??
                  "NOT_REQUIRED",
              ),

            totalDurationMinutes:
              event.totalDurationMinutes ??
              0,

            totalPriceCents:
              event.totalPriceCents ??
              0,

            depositCents:
              event.depositCents ??
              0,

            clientComment:
              event.clientComment,

            adminComment:
              event.adminComment,

            cancellationReason:
              event.cancellationReason,

            client: {
              id:
                event.client
                  ?.id ?? "",

              firstName:
                event.client
                  ?.firstName ??
                "",

              lastName:
                event.client
                  ?.lastName ??
                "",

              email:
                event.client
                  ?.email ?? "",

              phone:
                event.client
                  ?.phone ??
                null,
            },

            staff:
              event.staffId
                ? {
                    id:
                      event.staffId,

                    displayName:
                      String(
                        event
                          .metadata
                          .staffName ??
                          "Professionnelle",
                      ),

                    isOwner:
                      calendar.staff.find(
                        (
                          staff,
                        ) =>
                          staff.id ===
                          event.staffId,
                      )
                        ?.isOwner ??
                      false,

                    isActive:
                      calendar.staff.find(
                        (
                          staff,
                        ) =>
                          staff.id ===
                          event.staffId,
                      )
                        ?.isActive ??
                      true,

                    color:
                      String(
                        event
                          .metadata
                          .staffColor ??
                          event.color,
                      ),
                  }
                : null,

            workstation:
              event.workstationId
                ? {
                    id:
                      event.workstationId,

                    name:
                      String(
                        event
                          .metadata
                          .workstationName ??
                          "Poste",
                      ),

                    slug:
                      String(
                        event
                          .metadata
                          .workstationSlug ??
                          "",
                      ),

                    isActive:
                      true,
                  }
                : null,

            services:
              event.services.map(
                (
                  service,
                ) => ({
                  id:
                    service.id,

                  serviceId:
                    service.serviceId,

                  serviceName:
                    service.name,

                  quantity:
                    service.quantity,

                  durationMinutes:
                    service.durationMinutes,

                  unitPriceCents:
                    service.unitPriceCents,
                }),
              ),

            isMovable:
              event.draggable,

            isResizable:
              event.resizable,
          }),
        );

    return NextResponse.json(
      {
        /*
         * Format actuel utilisé par le client.
         */

        appointments,

        staff:
          calendar.staff.map(
            (staff) => ({
              id:
                staff.id,

              displayName:
                staff.name,

              isOwner:
                staff.isOwner,

              isActive:
                staff.isActive,

              color:
                staff.color,
            }),
          ),

        workstations:
          calendar.workstations.map(
            (
              workstation,
            ) => ({
              id:
                workstation.id,

              name:
                workstation.name,

              slug:
                workstation.slug,

              isActive:
                workstation.isActive,
            }),
          ),

        /*
         * Nouveau moteur complet.
         *
         * Ces données seront utilisées dans le prochain fichier
         * pour afficher les pauses, congés et fermetures.
         */

        range:
          calendar.range,

        events:
          calendar.events,

        businessHours:
          calendar.businessHours,

        statistics:
          calendar.statistics,
      },
      {
        status: 200,
      },
    );
  } catch (
    error: unknown
  ) {
    console.error(
      "[ADMIN_CALENDAR_GET]",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Le calendrier ne peut pas être chargé.",
      },
      {
        status: 400,
      },
    );
  }
}
