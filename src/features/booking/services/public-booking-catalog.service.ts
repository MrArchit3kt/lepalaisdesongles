import { prisma } from "@/lib/prisma";

export async function getPublicBookingCatalog() {
  const [categories, staffMembers] = await Promise.all([
    prisma.serviceCategory.findMany({
      where: {
        isActive: true,
        services: {
          some: {
            isActive: true,
            allowOnlineBooking: true,
            priceCents: {
              not: null,
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        color: true,
        sortOrder: true,
        services: {
          where: {
            isActive: true,
            allowOnlineBooking: true,
            priceCents: {
              not: null,
            },
          },
          select: {
            id: true,
            name: true,
            slug: true,
            shortDescription: true,
            priceCents: true,
            promotionalPriceCents: true,
            durationMinutes: true,
            cleanupMinutes: true,
            depositRequired: true,
            depositCents: true,
            imageUrl: true,
            color: true,
            sortOrder: true,
          },
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        },
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
    prisma.staffProfile.findMany({
      where: {
        isActive: true,
        acceptsOnlineBooking: true,
        user: { status: "ACTIVE" },
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
        services: {
          where: { isActive: true },
          select: { serviceId: true },
        },
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    }),
  ]);

  const bookingCategories = categories
    .map((category) => ({
      ...category,
      services: category.services.filter(
        (
          service,
        ): service is typeof service & {
          priceCents: number;
        } => service.priceCents !== null,
      ),
    }))
    .filter(
      (category) =>
        category.services.length > 0,
    );

  return {
    categories: bookingCategories,
    staffMembers: staffMembers.map((staff) => ({
      id: staff.id,
      displayName:
        staff.displayName?.trim() ||
        `${staff.user.firstName} ${staff.user.lastName}`.trim(),
      bio: staff.bio,
      color: staff.color,
      image: staff.user.image,
      isOwner: staff.isOwner,
      serviceIds: staff.services.map(({ serviceId }) => serviceId),
    })),
  };
}
