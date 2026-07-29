import { prisma } from "@/lib/prisma";
import { z } from "zod";

const dateTimeSchema = z.string().datetime();

const timeOffBaseSchema = z.object({
  title: z.string().trim().min(2).max(120),
  reason: z.string().trim().max(500).nullable().optional(),
  startsAt: dateTimeSchema,
  endsAt: dateTimeSchema,
  allDay: z.boolean().default(false),
});

function validateTimeOff(
  value: {
    startsAt: string;
    endsAt: string;
  },
  ctx: z.RefinementCtx,
) {
  if (new Date(value.startsAt) >= new Date(value.endsAt)) {
    ctx.addIssue({
      code: "custom",
      message: "La fin doit être après le début.",
    });
  }
}

export const staffTimeOffSchema = timeOffBaseSchema
  .extend({
    staffId: z.string().min(1),
  })
  .superRefine(validateTimeOff);

export const salonTimeOffSchema =
  timeOffBaseSchema.superRefine(validateTimeOff);

export const salonOverrideSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  isOpen: z.boolean(),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).nullable(),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).nullable(),
  breakStart: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).nullable(),
  breakEnd: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).nullable(),
  reason: z.string().trim().max(500).nullable().optional(),
});

export const staffOverrideSchema = salonOverrideSchema.extend({
  staffId: z.string().min(1),
  hasBreak: z.boolean(),
});

export async function getAvailabilityExceptions() {
  const [staff, salonTimeOffs, staffTimeOffs, salonOverrides, staffOverrides] =
    await Promise.all([
      prisma.staffProfile.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        select: {
          id: true,
          displayName: true,
          color: true,
          user: { select: { firstName: true, lastName: true } },
        },
      }),
      prisma.timeOff.findMany({ orderBy: { startsAt: "asc" }, take: 300 }),
      prisma.staffTimeOff.findMany({
        orderBy: { startsAt: "asc" },
        take: 500,
        include: {
          staff: {
            select: {
              id: true,
              displayName: true,
              color: true,
              user: { select: { firstName: true, lastName: true } },
            },
          },
        },
      }),
      prisma.workingHourOverride.findMany({ orderBy: { date: "asc" }, take: 300 }),
      prisma.staffWorkingHourOverride.findMany({
        orderBy: { date: "asc" },
        take: 500,
        include: {
          staff: {
            select: {
              id: true,
              displayName: true,
              color: true,
              user: { select: { firstName: true, lastName: true } },
            },
          },
        },
      }),
    ]);

  return { staff, salonTimeOffs, staffTimeOffs, salonOverrides, staffOverrides };
}

export async function createException(
  kind: "staff-time-off" | "salon-time-off" | "salon-override" | "staff-override",
  payload: unknown,
  actorId: string,
) {
  if (kind === "staff-time-off") {
    const input = staffTimeOffSchema.parse(payload);
    return prisma.staffTimeOff.create({
      data: {
        staffId: input.staffId,
        title: input.title,
        reason: input.reason || null,
        startsAt: new Date(input.startsAt),
        endsAt: new Date(input.endsAt),
        allDay: input.allDay,
      },
    });
  }

  if (kind === "salon-time-off") {
    const input = salonTimeOffSchema.parse(payload);
    return prisma.timeOff.create({
      data: {
        title: input.title,
        reason: input.reason || null,
        startsAt: new Date(input.startsAt),
        endsAt: new Date(input.endsAt),
        allDay: input.allDay,
        createdById: actorId,
      },
    });
  }

  if (kind === "salon-override") {
    const input = salonOverrideSchema.parse(payload);
    if (input.isOpen && (!input.startTime || !input.endTime || input.startTime >= input.endTime)) {
      throw new Error("Horaires exceptionnels invalides.");
    }
    const date = new Date(`${input.date}T00:00:00.000Z`);
    return prisma.workingHourOverride.upsert({
      where: { date },
      create: {
        date,
        isOpen: input.isOpen,
        startTime: input.isOpen ? input.startTime : null,
        endTime: input.isOpen ? input.endTime : null,
        breakStart: input.isOpen ? input.breakStart : null,
        breakEnd: input.isOpen ? input.breakEnd : null,
        reason: input.reason || null,
        createdById: actorId,
      },
      update: {
        isOpen: input.isOpen,
        startTime: input.isOpen ? input.startTime : null,
        endTime: input.isOpen ? input.endTime : null,
        breakStart: input.isOpen ? input.breakStart : null,
        breakEnd: input.isOpen ? input.breakEnd : null,
        reason: input.reason || null,
        createdById: actorId,
      },
    });
  }

  const input = staffOverrideSchema.parse(payload);
  if (input.isOpen && (!input.startTime || !input.endTime || input.startTime >= input.endTime)) {
    throw new Error("Horaires exceptionnels invalides.");
  }
  const date = new Date(`${input.date}T00:00:00.000Z`);
  return prisma.staffWorkingHourOverride.upsert({
    where: { staffId_date: { staffId: input.staffId, date } },
    create: {
      staffId: input.staffId,
      date,
      isOpen: input.isOpen,
      startTime: input.isOpen ? input.startTime : null,
      endTime: input.isOpen ? input.endTime : null,
      hasBreak: input.isOpen ? input.hasBreak : false,
      breakStart: input.isOpen && input.hasBreak ? input.breakStart : null,
      breakEnd: input.isOpen && input.hasBreak ? input.breakEnd : null,
      reason: input.reason || null,
    },
    update: {
      isOpen: input.isOpen,
      startTime: input.isOpen ? input.startTime : null,
      endTime: input.isOpen ? input.endTime : null,
      hasBreak: input.isOpen ? input.hasBreak : false,
      breakStart: input.isOpen && input.hasBreak ? input.breakStart : null,
      breakEnd: input.isOpen && input.hasBreak ? input.breakEnd : null,
      reason: input.reason || null,
    },
  });
}

export async function deleteException(kind: string, id: string) {
  if (kind === "staff-time-off") return prisma.staffTimeOff.delete({ where: { id } });
  if (kind === "salon-time-off") return prisma.timeOff.delete({ where: { id } });
  if (kind === "salon-override") return prisma.workingHourOverride.delete({ where: { id } });
  if (kind === "staff-override") return prisma.staffWorkingHourOverride.delete({ where: { id } });
  throw new Error("Type d’exception inconnu.");
}
