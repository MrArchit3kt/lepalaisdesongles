import { DayOfWeek, UserRole } from "../src/generated/prisma/client";
import { prisma } from "../src/lib/prisma";

const DEFAULT_HOURS = [
  { dayOfWeek: DayOfWeek.MONDAY, isOpen: true, startTime: "09:00", endTime: "18:00" },
  { dayOfWeek: DayOfWeek.TUESDAY, isOpen: true, startTime: "09:00", endTime: "18:00" },
  { dayOfWeek: DayOfWeek.WEDNESDAY, isOpen: true, startTime: "09:00", endTime: "18:00" },
  { dayOfWeek: DayOfWeek.THURSDAY, isOpen: true, startTime: "09:00", endTime: "18:00" },
  { dayOfWeek: DayOfWeek.FRIDAY, isOpen: true, startTime: "09:00", endTime: "18:00" },
  { dayOfWeek: DayOfWeek.SATURDAY, isOpen: true, startTime: "09:00", endTime: "17:00" },
  { dayOfWeek: DayOfWeek.SUNDAY, isOpen: false, startTime: null, endTime: null },
] as const;

async function main() {
  const ownerEmail = process.env.OWNER_EMAIL?.trim().toLowerCase();

  const owner = await prisma.user.findFirst({
    where: ownerEmail
      ? { email: ownerEmail }
      : {
          role: {
            in: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
          },
        },
    orderBy: { createdAt: "asc" },
  });

  if (!owner) {
    throw new Error(
      "Aucun administrateur trouvé. Ajoutez OWNER_EMAIL dans .env ou créez d'abord le compte administrateur.",
    );
  }

  const staff = await prisma.staffProfile.upsert({
    where: { userId: owner.id },
    create: {
      userId: owner.id,
      displayName: `${owner.firstName} ${owner.lastName}`.trim(),
      isOwner: true,
      isActive: true,
      acceptsOnlineBooking: true,
      defaultCleanupMinutes: 0,
      slotIntervalMinutes: 15,
      sortOrder: 0,
    },
    update: {
      isOwner: true,
      isActive: true,
      acceptsOnlineBooking: true,
    },
  });

  for (const hours of DEFAULT_HOURS) {
    await prisma.staffWorkingHour.upsert({
      where: {
        staffId_dayOfWeek: {
          staffId: staff.id,
          dayOfWeek: hours.dayOfWeek,
        },
      },
      create: {
        staffId: staff.id,
        dayOfWeek: hours.dayOfWeek,
        isOpen: hours.isOpen,
        startTime: hours.startTime,
        endTime: hours.endTime,
        hasBreak: false,
        breakStart: null,
        breakEnd: null,
      },
      update: {},
    });
  }

  const services = await prisma.service.findMany({
    where: { isActive: true },
    select: { id: true },
  });

  await prisma.$transaction(
    services.map((service, index) =>
      prisma.staffService.upsert({
        where: {
          staffId_serviceId: {
            staffId: staff.id,
            serviceId: service.id,
          },
        },
        create: {
          staffId: staff.id,
          serviceId: service.id,
          isActive: true,
          sortOrder: index,
        },
        update: {
          isActive: true,
        },
      }),
    ),
  );

  console.log(`✓ Profil employé créé pour ${owner.email}`);
  console.log(`✓ ${services.length} prestation(s) attribuée(s)`);
  console.log("✓ Horaires créés sans pause pour le patron");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
