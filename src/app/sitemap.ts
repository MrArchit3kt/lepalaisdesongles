import type { MetadataRoute } from "next";

import { prisma } from "@/lib/prisma";
import { ContestStatus } from "@/generated/prisma/enums";

const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL ??
  "https://lepalaisdesongles.fr";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/prestations`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.95,
    },
    {
      url: `${SITE_URL}/reservation`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${SITE_URL}/galerie`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.90,
    },
    {
      url: `${SITE_URL}/promotions`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.90,
    },
    {
      url: `${SITE_URL}/carte-cadeau`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.90,
    },
    {
      url: `${SITE_URL}/concours`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.85,
    },
    {
      url: `${SITE_URL}/avis`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: `${SITE_URL}/connexion`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.20,
    },
    {
      url: `${SITE_URL}/inscription`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.20,
    },
  ];

  const services = await prisma.service.findMany({
    select: {
      slug: true,
      updatedAt: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  const promotions = await prisma.promotion.findMany({
    where: {
      isActive: true,
    },
    select: {
      slug: true,
      updatedAt: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  const contests = await prisma.contest.findMany({
    where: {
        status: {
          in: [
            ContestStatus.ACTIVE,
            ContestStatus.DRAWN,
          ],
        },
      },
    select: {
      slug: true,
      updatedAt: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  const servicePages: MetadataRoute.Sitemap =
    services.map((service) => ({
      url: `${SITE_URL}/prestations/${service.slug}`,
      lastModified: service.updatedAt,
      changeFrequency: "monthly",
      priority: 0.90,
    }));

  const promotionPages: MetadataRoute.Sitemap =
    promotions.map((promotion) => ({
      url: `${SITE_URL}/promotions/${promotion.slug}`,
      lastModified: promotion.updatedAt,
      changeFrequency: "weekly",
      priority: 0.80,
    }));

  const contestPages: MetadataRoute.Sitemap =
    contests.map((contest) => ({
      url: `${SITE_URL}/concours/${contest.slug}`,
      lastModified: contest.updatedAt,
      changeFrequency: "weekly",
      priority: 0.80,
    }));

  return [
    ...staticPages,
    ...servicePages,
    ...promotionPages,
    ...contestPages,
  ];
}