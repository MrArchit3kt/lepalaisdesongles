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

export const LABELS: Record<(typeof DAYS)[number], string> = {
  MONDAY: "Lundi",
  TUESDAY: "Mardi",
  WEDNESDAY: "Mercredi",
  THURSDAY: "Jeudi",
  FRIDAY: "Vendredi",
  SATURDAY: "Samedi",
  SUNDAY: "Dimanche",
};

const time = z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/);
const optionalTime = z.union([time, z.literal(""), z.null()]).transform((v) => v === "" ? null : v);

export const businessHoursSchema = z.object({
  hours: z.array(z.object({
    dayOfWeek: z.nativeEnum(DayOfWeek),
    isOpen: z.boolean(),
    startTime: optionalTime,
    endTime: optionalTime,
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
    if (Boolean(value.breakStart) !== Boolean(value.breakEnd)) {
      ctx.addIssue({ code: "custom", message: "Renseignez le début et la fin de pause." });
    }
    if (value.breakStart && value.breakEnd && (
      value.breakStart >= value.breakEnd ||
      value.breakStart < value.startTime ||
      value.breakEnd > value.endTime
    )) {
      ctx.addIssue({ code: "custom", message: "La pause doit être comprise dans les horaires." });
    }
  })).length(7),
});

export type BusinessHoursInput = z.infer<typeof businessHoursSchema>;
export type BusinessHourItem = BusinessHoursInput["hours"][number];

export async function ensureBusinessHours() {
  await prisma.$transaction(DAYS.map((dayOfWeek) =>
    prisma.workingHour.upsert({
      where: { dayOfWeek },
      update: {},
      create: { dayOfWeek, isOpen: true, startTime: "09:00", endTime: "19:00" },
    }),
  ));
}

export async function getBusinessHours(): Promise<BusinessHourItem[]> {
  await ensureBusinessHours();
  const rows = await prisma.workingHour.findMany();
  return DAYS.map((dayOfWeek) => {
    const row = rows.find((item) => item.dayOfWeek === dayOfWeek);
    return {
      dayOfWeek,
      isOpen: row?.isOpen ?? true,
      startTime: row?.startTime ?? "09:00",
      endTime: row?.endTime ?? "19:00",
      breakStart: row?.breakStart ?? null,
      breakEnd: row?.breakEnd ?? null,
    };
  });
}

export async function saveBusinessHours(input: BusinessHoursInput) {
  await prisma.$transaction(input.hours.map((item) =>
    prisma.workingHour.upsert({
      where: { dayOfWeek: item.dayOfWeek },
      create: {
        dayOfWeek: item.dayOfWeek,
        isOpen: item.isOpen,
        startTime: item.isOpen ? item.startTime : null,
        endTime: item.isOpen ? item.endTime : null,
        breakStart: item.isOpen ? item.breakStart : null,
        breakEnd: item.isOpen ? item.breakEnd : null,
      },
      update: {
        isOpen: item.isOpen,
        startTime: item.isOpen ? item.startTime : null,
        endTime: item.isOpen ? item.endTime : null,
        breakStart: item.isOpen ? item.breakStart : null,
        breakEnd: item.isOpen ? item.breakEnd : null,
      },
    }),
  ));
  return getBusinessHours();
}
