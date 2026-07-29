import {
  getPublicWebsiteSettings,
} from "@/features/admin/settings/services/admin-settings.service";

import {
  prisma,
} from "@/lib/prisma";

export async function getHomePageData() {
  const now = new Date();

  const [
    featuredServices,
    featuredReviews,
    activePromotion,
    activeContest,
    workingHours,
    galleryItems,
    websiteSettings,
  ] = await Promise.all([
    prisma.service.findMany({
      where: {
        isActive: true,
        isFeatured: true,
        allowOnlineBooking: true,
      },
      include: {
        category: {
          select: {
            name: true,
            slug: true,
            color: true,
          },
        },
      },
      orderBy: [
        {
          sortOrder: "asc",
        },
        {
          createdAt: "asc",
        },
      ],
      take: 6,
    }),

    prisma.review.findMany({
      where: {
        status: "APPROVED",
        isFeatured: true,
      },
      orderBy: [
        {
          rating: "desc",
        },
        {
          publishedAt: "desc",
        },
      ],
      take: 6,
    }),

    prisma.promotion.findFirst({
      where: {
        isActive: true,
        showOnHomepage: true,
        startsAt: {
          lte: now,
        },
        endsAt: {
          gte: now,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.contest.findFirst({
      where: {
        status: "ACTIVE",
        showOnHomepage: true,
        startsAt: {
          lte: now,
        },
        endsAt: {
          gte: now,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.workingHour.findMany({
      orderBy: {
        dayOfWeek: "asc",
      },
    }),

    prisma.galleryItem.findMany({
      where: {
        isPublished: true,
        isFeatured: true,
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
      orderBy: [
        {
          sortOrder: "asc",
        },
        {
          publishedAt: "desc",
        },
      ],
      take: 6,
    }),

    getPublicWebsiteSettings(),
  ]);

  return {
    featuredServices,
    featuredReviews,
    activePromotion,
    activeContest,
    workingHours,
    galleryItems,
    websiteSettings,
  };
}

export type HomePageData = Awaited<
  ReturnType<typeof getHomePageData>
>;
