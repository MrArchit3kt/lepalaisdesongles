import { prisma } from "@/lib/prisma";

export async function getPublicServiceCategories() {
  return prisma.serviceCategory.findMany({
    where: {
      isActive: true,
      services: {
        some: {
          isActive: true,
        },
      },
    },

    include: {
      _count: {
        select: {
          services: {
            where: {
              isActive: true,
            },
          },
        },
      },
    },

    orderBy: [
      {
        sortOrder: "asc",
      },
      {
        name: "asc",
      },
    ],
  });
}

export async function getPublicServices() {
  return prisma.service.findMany({
    where: {
      isActive: true,
    },

    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
          color: true,
        },
      },

      images: {
        orderBy: {
          sortOrder: "asc",
        },

        take: 1,
      },
    },

    orderBy: [
      {
        sortOrder: "asc",
      },
      {
        name: "asc",
      },
    ],
  });
}

export async function getPublicServiceBySlug(
  slug: string,
) {
  return prisma.service.findFirst({
    where: {
      slug,
      isActive: true,
    },

    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          color: true,
        },
      },

      images: {
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
  });
}

export async function getRelatedPublicServices({
  categoryId,
  excludedServiceId,
}: {
  categoryId: string;
  excludedServiceId: string;
}) {
  return prisma.service.findMany({
    where: {
      categoryId,
      isActive: true,
      id: {
        not: excludedServiceId,
      },
    },

    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
          color: true,
        },
      },

      images: {
        orderBy: {
          sortOrder: "asc",
        },

        take: 1,
      },
    },

    orderBy: [
      {
        sortOrder: "asc",
      },
      {
        name: "asc",
      },
    ],

    take: 3,
  });
}

export type PublicServiceCategories = Awaited<
  ReturnType<typeof getPublicServiceCategories>
>;

export type PublicServices = Awaited<
  ReturnType<typeof getPublicServices>
>;

export type PublicService = PublicServices[number];
