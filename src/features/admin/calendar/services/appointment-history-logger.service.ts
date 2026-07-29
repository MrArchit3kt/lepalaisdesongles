import {
    AppointmentStatus,
    Prisma,
    type PrismaClient,
  } from "@/generated/prisma/client";
  
  import { prisma } from "@/lib/prisma";
  
  export type AppointmentHistoryLoggerInput = {
    prisma?: Prisma.TransactionClient | PrismaClient;
  
    appointmentId: string;
  
    actorId?: string | null;
  
    action: string;
  
    previousStatus?: AppointmentStatus | null;
    nextStatus?: AppointmentStatus | null;
  
    previousStartsAt?: Date | null;
    nextStartsAt?: Date | null;
  
    reason?: string | null;
  
    metadata?:
  | Prisma.InputJsonValue
  | Prisma.NullableJsonNullValueInput;
  };
  
  export async function logAppointmentHistory({
    prisma: db = prisma,
    appointmentId,
    actorId = null,
    action,
    previousStatus = null,
    nextStatus = null,
    previousStartsAt = null,
    nextStartsAt = null,
    reason = null,
    metadata = Prisma.JsonNull,
  }: AppointmentHistoryLoggerInput) {
    const id = appointmentId.trim();
  
    if (!id) {
      return;
    }
  
    await db.appointmentHistory.create({
      data: {
        appointmentId: id,
        actorId,
        action,
        previousStatus,
        nextStatus,
        previousStartsAt,
        nextStartsAt,
        reason,
        metadata:
            metadata,
      },
    });
  }