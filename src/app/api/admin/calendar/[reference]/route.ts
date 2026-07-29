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
  moveCalendarAppointment,
} from "@/features/admin/calendar/services/admin-calendar.service";

import type {
  CalendarMutation,
} from "@/features/admin/calendar/types/admin-calendar.types";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type Context = {
  params: Promise<{
    reference: string;
  }>;
};

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
/*                                   PATCH                                    */
/* -------------------------------------------------------------------------- */

export async function PATCH(
  request: Request,
  context: Context,
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

    const {
      reference,
    } =
      await context.params;

    const body =
      (await request.json()) as CalendarMutation;

    if (
      body.action !==
      "move"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Action invalide.",
        },
        {
          status: 400,
        },
      );
    }

    const startsAt =
      new Date(
        body.startsAt,
      );

    const endsAt =
      new Date(
        body.endsAt,
      );

    if (
      Number.isNaN(
        startsAt.getTime(),
      ) ||
      Number.isNaN(
        endsAt.getTime(),
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Les dates du rendez-vous sont invalides.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      endsAt <=
      startsAt
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "La fin du rendez-vous doit être postérieure au début.",
        },
        {
          status: 400,
        },
      );
    }

    const appointment =
      await moveCalendarAppointment(
        {
          reference:
            decodeURIComponent(
              reference,
            ),

          actorId:
            user.id,

          startsAt:
            body.startsAt,

          endsAt:
            body.endsAt,

          staffId:
            body.staffId,

          workstationId:
            body.workstationId,
        },
      );

    return NextResponse.json(
      {
        success: true,

        appointment: {
          id:
            appointment.id,

          reference:
            appointment.reference,

          startsAt:
            appointment.startsAt.toISOString(),

          endsAt:
            appointment.endsAt.toISOString(),

          staffId:
            appointment.staffId,

          workstationId:
            appointment.workstationId,

          totalDurationMinutes:
            appointment.totalDurationMinutes,

          processedById:
            appointment.processedById,

          updatedAt:
            appointment.updatedAt.toISOString(),
        },
      },
      {
        status: 200,
      },
    );
  } catch (
    error: unknown
  ) {
    console.error(
      "[ADMIN_CALENDAR_PATCH]",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Modification impossible.",
      },
      {
        status: 400,
      },
    );
  }
}
