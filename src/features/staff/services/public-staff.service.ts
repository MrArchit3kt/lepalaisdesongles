import { prisma } from "@/lib/prisma";

export async function getPublicStaffMembers(serviceIds?: string[]) {
  const normalizedServiceIds = Array.from(
    new Set((serviceIds ?? []).map((id) => id.trim()).filter(Boolean)),
  );

  return prisma.staffProfile.findMany({
    where: {
      isActive: true,
      acceptsOnlineBooking: true,
      user: {
        status: "ACTIVE",
      },
      ...(normalizedServiceIds.length > 0
        ? {
            AND: normalizedServiceIds.map((serviceId) => ({
              services: {
                some: {
                  isActive: true,
                  serviceId,
                },
              },
            })),
          }
        : {}),
    },
    select: {
      id: true,
      displayName: true,
      bio: true,
      color: true,
      isOwner: true,
      sortOrder: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
          image: true,
        },
      },
      services: normalizedServiceIds.length
        ? {
            where: {
              isActive: true,
              serviceId: {
                in: normalizedServiceIds,
              },
            },
            select: {
              serviceId: true,
            },
          }
        : false,
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
}
