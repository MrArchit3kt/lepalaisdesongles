import { DayOfWeek } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const DAYS = [
  DayOfWeek.MONDAY,
  DayOfWeek.TUESDAY,
  DayOfWeek.WEDNESDAY,
  DayOfWeek.THURSDAY,
  DayOfWeek.FRIDAY,
  DayOfWeek.SATURDAY,
  DayOfWeek.SUNDAY,
] as const;

const time = z.string().regex(/^([01]\\d|2[0-3]):([0-5]\\d)$/);
const optionalTime = z.union([time, z.literal(""), z.null()]).transform((value) =>
  value === "" ? null : value,
);

export const staffHoursSchema = z.object({
  staffId: z.string().min(1),
  hours: z.array(
    z.object({
      dayOfWeek: z.nativeEnum(DayOfWeek),
      isOpen: z.boolean(),
      startTime: optionalTime,
      endTime: optionalTime,
      hasBreak: z.boolean(),
      breakStart: optionalTime,
      breakEnd: optionalTime,
    }).superRefine((value, ctx) => {
      if (!value.isOpen) return;

      if (!value.startTime || !value.endTime) {
        ctx.addIssue({ code: "custom", message: "Ouverture et fermeture obligatoires." });
        return;
      }

      if (value.startTime >= value.endTime) {
        ctx.addIssue({ code: "custom", message: "La fermeture doit être après l’ouverture." });
      }

      if (value.hasBreak && (!value.breakStart || !value.breakEnd)) {
        ctx.addIssue({ code: "custom", message: "Les horaires de pause sont obligatoires." });
      }

      if (
        value.hasBreak &&
        value.breakStart &&
        value.breakEnd &&
        (
          value.breakStart >= value.breakEnd ||
          value.breakStart < value.startTime ||
          value.breakEnd > value.endTime
        )
      ) {
        ctx.addIssue({ code: "custom", message: "La pause doit être comprise dans la journée." });
      }
    }),
  ).length(7),
});

export type StaffHourItem = z.infer<typeof staffHoursSchema>["hours"][number];

export async function getStaffMembers() {
  return prisma.staffProfile.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      displayName: true,
      color: true,
      acceptsOnlineBooking: true,
      slotIntervalMinutes: true,
      defaultCleanupMinutes: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });
}

async function getSalonHoursMap() {
  const rows = await prisma.workingHour.findMany();
  return new Map(rows.map((row) => [row.dayOfWeek, row]));
}

export async function getStaffHours(staffId: string): Promise<StaffHourItem[]> {
  const [staff, salonHours] = await Promise.all([
    prisma.staffProfile.findUnique({
      where: { id: staffId },
      select: { id: true },
    }),
    getSalonHoursMap(),
  ]);

  if (!staff) throw new Error("Professionnelle introuvable.");

  const rows = await prisma.staffWorkingHour.findMany({
    where: { staffId },
  });

  return DAYS.map((dayOfWeek) => {
    const row = rows.find((item) => item.dayOfWeek === dayOfWeek);
    const salon = salonHours.get(dayOfWeek);

    return {
      dayOfWeek,
      isOpen: row?.isOpen ?? salon?.isOpen ?? true,
      startTime: row?.startTime ?? salon?.startTime ?? "09:00",
      endTime: row?.endTime ?? salon?.endTime ?? "19:00",
      hasBreak: row?.hasBreak ?? Boolean(salon?.breakStart && salon?.breakEnd),
      breakStart: row?.breakStart ?? salon?.breakStart ?? null,
      breakEnd: row?.breakEnd ?? salon?.breakEnd ?? null,
    };
  });
}

export async function saveStaffHours(input: z.infer<typeof staffHoursSchema>) {
  const staff = await prisma.staffProfile.findUnique({
    where: { id: input.staffId },
    select: { id: true },
  });

  if (!staff) throw new Error("Professionnelle introuvable.");

  await prisma.$transaction(
    input.hours.map((item) =>
      prisma.staffWorkingHour.upsert({
        where: {
          staffId_dayOfWeek: {
            staffId: input.staffId,
            dayOfWeek: item.dayOfWeek,
          },
        },
        create: {
          staffId: input.staffId,
          dayOfWeek: item.dayOfWeek,
          isOpen: item.isOpen,
          startTime: item.isOpen ? item.startTime : null,
          endTime: item.isOpen ? item.endTime : null,
          hasBreak: item.isOpen ? item.hasBreak : false,
          breakStart: item.isOpen && item.hasBreak ? item.breakStart : null,
          breakEnd: item.isOpen && item.hasBreak ? item.breakEnd : null,
        },
        update: {
          isOpen: item.isOpen,
          startTime: item.isOpen ? item.startTime : null,
          endTime: item.isOpen ? item.endTime : null,
          hasBreak: item.isOpen ? item.hasBreak : false,
          breakStart: item.isOpen && item.hasBreak ? item.breakStart : null,
          breakEnd: item.isOpen && item.hasBreak ? item.breakEnd : null,
        },
      }),
    ),
  );

  return getStaffHours(input.staffId);
}

export async function resetStaffHours(staffId: string) {
  await prisma.staffWorkingHour.deleteMany({ where: { staffId } });
  return getStaffHours(staffId);
}
