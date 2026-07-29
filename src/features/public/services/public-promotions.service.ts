import {
  prisma,
} from "@/lib/prisma";

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

function getRemainingUses({
  usageLimit,
  usageCount,
}: {
  usageLimit: number | null;
  usageCount: number;
}): number | null {
  if (
    usageLimit ===
    null
  ) {
    return null;
  }

  return Math.max(
    usageLimit -
      usageCount,
    0,
  );
}

/* -------------------------------------------------------------------------- */
/*                                   QUERY                                    */
/* -------------------------------------------------------------------------- */

export async function getPublicPromotionsPageData() {
  const now =
    new Date();

  const promotions =
    await prisma.promotion.findMany({
      where: {
        isActive:
          true,

        endsAt: {
          gte:
            now,
        },
      },

      include: {
        services: {
          include: {
            service: {
              select: {
                id:
                  true,

                name:
                  true,

                slug:
                  true,

                shortDescription:
                  true,

                priceCents:
                  true,

                promotionalPriceCents:
                  true,

                durationMinutes:
                  true,

                imageUrl:
                  true,

                isActive:
                  true,

                category: {
                  select: {
                    name:
                      true,

                    slug:
                      true,

                    color:
                      true,
                  },
                },

                images: {
                  orderBy: {
                    sortOrder:
                      "asc",
                  },

                  take:
                    1,

                  select: {
                    id:
                      true,

                    url:
                      true,

                    alt:
                      true,
                  },
                },
              },
            },
          },

          orderBy: {
            service: {
              sortOrder:
                "asc",
            },
          },
        },

        banners: {
          where: {
            isActive:
              true,
          },

          orderBy: {
            sortOrder:
              "asc",
          },

          take:
            1,

          select: {
            id:
              true,

            title:
              true,

            subtitle:
              true,

            imageUrl:
              true,

            mobileImageUrl:
              true,

            buttonLabel:
              true,

            buttonUrl:
              true,

            backgroundColor:
              true,

            textColor:
              true,
          },
        },

        _count: {
          select: {
            services:
              true,
          },
        },
      },

      orderBy: [
        {
          startsAt:
            "asc",
        },

        {
          createdAt:
            "desc",
        },
      ],
    });

  const formattedPromotions =
    promotions.map(
      (
        promotion,
      ) => ({
        ...promotion,

        remainingUses:
          getRemainingUses({
            usageLimit:
              promotion.usageLimit,

            usageCount:
              promotion.usageCount,
          }),

        services:
          promotion.services
            .map(
              (
                relation,
              ) =>
                relation.service,
            )
            .filter(
              (
                service,
              ) =>
                service.isActive,
            ),

        banner:
          promotion.banners[0] ??
          null,
      }),
    );

  const activePromotions =
    formattedPromotions.filter(
      (
        promotion,
      ) =>
        promotion.startsAt <=
          now &&
        promotion.endsAt >=
          now &&
        (
          promotion.remainingUses ===
            null ||
          promotion.remainingUses >
            0
        ),
    );

  const upcomingPromotions =
    formattedPromotions.filter(
      (
        promotion,
      ) =>
        promotion.startsAt >
        now,
    );

  return {
    activePromotions,
    upcomingPromotions,

    statistics: {
      activeCount:
        activePromotions.length,

      upcomingCount:
        upcomingPromotions.length,

      totalAvailable:
        activePromotions.length +
        upcomingPromotions.length,
    },
  };
}

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

export type PublicPromotionsPageData =
  Awaited<
    ReturnType<
      typeof getPublicPromotionsPageData
    >
  >;

export type PublicPromotion =
  PublicPromotionsPageData[
    "activePromotions"
  ][number];
