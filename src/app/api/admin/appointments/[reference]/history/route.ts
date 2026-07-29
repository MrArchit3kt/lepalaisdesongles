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
    getAppointmentTimelineByReference,
  } from "@/features/admin/appointments/services/appointment-history.service";
  
  type Context = {
    params: Promise<{
      reference: string;
    }>;
  };
  
  type SessionUser = {
    id?: string;
    role?: string;
  };
  
  const ADMIN_ROLES = [
    "SUPER_ADMIN",
    "ADMIN",
    "STAFF",
  ];
  
  export const runtime =
    "nodejs";
  
  export const dynamic =
    "force-dynamic";
  
  export async function GET(
    _request: Request,
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
        !ADMIN_ROLES.includes(
          user.role ?? "",
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Accès administrateur refusé.",
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
  
      const cleanReference =
        decodeURIComponent(
          reference,
        ).trim();
  
      if (!cleanReference) {
        return NextResponse.json(
          {
            success: false,
            error:
              "La référence du rendez-vous est invalide.",
          },
          {
            status: 400,
          },
        );
      }
  
      const timeline =
        await getAppointmentTimelineByReference(
          cleanReference,
        );
  
      if (!timeline) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Rendez-vous introuvable.",
          },
          {
            status: 404,
          },
        );
      }
  
      return NextResponse.json({
        success: true,
  
        timeline:
          timeline.map(
            (item) => ({
              id:
                item.id,
  
              action:
                item.action,
  
              createdAt:
                item.createdAt.toISOString(),
  
              previousStatus:
                item.previousStatus,
  
              nextStatus:
                item.nextStatus,
  
              previousStartsAt:
                item.previousStartsAt?.toISOString() ??
                null,
  
              nextStartsAt:
                item.nextStartsAt?.toISOString() ??
                null,
  
              reason:
                item.reason,
  
              actorId:
                item.actorId,
  
              changes:
                item.changes,
            }),
          ),
      });
    } catch (error) {
      console.error(
        "[ADMIN_APPOINTMENT_HISTORY]",
        error,
      );
  
      return NextResponse.json(
        {
          success: false,
          error:
            "Impossible de récupérer l’historique du rendez-vous.",
        },
        {
          status: 500,
        },
      );
    }
  }