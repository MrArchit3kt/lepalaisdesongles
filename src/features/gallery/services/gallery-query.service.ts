import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export type GalleryQueryOptions = {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  featured?: boolean;
  published?: boolean;
};

export async function getGalleryItems(
  options: GalleryQueryOptions = {},
) {
  const {
    page = 1,
    limit = 12,
    search,
    categoryId,
    featured,
    published = true,
  } = options;

  const where: Prisma.GalleryItemWhereInput = {};

  if (published !== undefined) {
    where.isPublished = published;
  }

  if (featured !== undefined) {
    where.isFeatured = featured;
  }

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (search && search.trim().length > 0) {
    where.OR = [
      {
        title: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        description: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        serviceName: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        tags: {
          has: search,
        },
      },
    ];
  }

  const [items, total] = await prisma.$transaction([
    prisma.galleryItem.findMany({
      where,
      include: {
        category: true,
        media: {
          orderBy: {
            sortOrder: "asc",
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: [
        {
          sortOrder: "asc",
        },
        {
          createdAt: "desc",
        },
      ],
      skip: (page - 1) * limit,
      take: limit,
    }),

    prisma.galleryItem.count({
      where,
    }),
  ]);

  return {
    items,
    total,
    page,
    limit,
    pageCount: Math.ceil(total / limit),
    hasNextPage: page * limit < total,
    hasPreviousPage: page > 1,
  };
}

export async function getGalleryItemById(
  id: string,
) {
  return prisma.galleryItem.findUnique({
    where: {
      id,
    },
    include: {
      category: true,
      media: {
        orderBy: {
          sortOrder: "asc",
        },
      },
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });
}

export async function getGalleryItemBySlug(
  slug: string,
) {
  return prisma.galleryItem.findUnique({
    where: {
      slug,
    },
    include: {
      category: true,
      media: {
        orderBy: {
          sortOrder: "asc",
        },
      },
      createdBy: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });
}

export async function getFeaturedGalleryItems(
  limit = 8,
) {
  return prisma.galleryItem.findMany({
    where: {
      isPublished: true,
      isFeatured: true,
    },
    include: {
      media: {
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
    orderBy: [
      {
        sortOrder: "asc",
      },
      {
        createdAt: "desc",
      },
    ],
    take: limit,
  });
}

export async function getGalleryCategories() {
  return prisma.galleryCategory.findMany({
    where: {
      isActive: true,
    },
    orderBy: [
      {
        sortOrder: "asc",
      },
      {
        name: "asc",
      },
    ],
    include: {
      _count: {
        select: {
          items: {
            where: {
              isPublished: true,
            },
          },
        },
      },
    },
  });
}

export async function getGalleryStatistics() {
  const [
    totalItems,
    publishedItems,
    featuredItems,
    totalViews,
    totalCategories,
  ] = await prisma.$transaction([
    prisma.galleryItem.count(),

    prisma.galleryItem.count({
      where: {
        isPublished: true,
      },
    }),

    prisma.galleryItem.count({
      where: {
        isFeatured: true,
      },
    }),

    prisma.galleryItem.aggregate({
      _sum: {
        viewCount: true,
      },
    }),

    prisma.galleryCategory.count(),
  ]);

  return {
    totalItems,
    publishedItems,
    featuredItems,
    totalCategories,
    totalViews: totalViews._sum.viewCount ?? 0,
  };
}