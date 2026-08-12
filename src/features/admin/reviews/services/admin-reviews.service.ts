import "server-only";

import { ReviewSource, ReviewStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

import type { AdminReviewPayload } from "../schemas/admin-review.schema";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

export type AdminReviewListItem = {
  id: string;
  source: ReviewSource;
  status: ReviewStatus;
  authorName: string;
  authorAvatar: string | null;
  rating: number;
  title: string | null;
  content: string;
  isVerified: boolean;
  isFeatured: boolean;
  publishedAt: string | null;
  createdAt: string;
};

export class AdminReviewNotFoundError extends Error {
  constructor() {
    super("Cet avis est introuvable.");
    this.name = "AdminReviewNotFoundError";
  }
}

/* -------------------------------------------------------------------------- */
/*                                  LECTURE                                   */
/* -------------------------------------------------------------------------- */

export async function getAdminReviews(): Promise<AdminReviewListItem[]> {
  const reviews = await prisma.review.findMany({
    /*
     * Les avis en attente de validation (soumis par une cliente
     * depuis son espace) remontent en premier, pour ne pas passer
     * inaperçus.
     */
    orderBy: [{ status: "asc" }, { publishedAt: "desc" }, { createdAt: "desc" }],

    select: {
      id: true,
      source: true,
      status: true,
      authorName: true,
      authorAvatar: true,
      rating: true,
      title: true,
      content: true,
      isVerified: true,
      isFeatured: true,
      publishedAt: true,
      createdAt: true,
    },
  });

  return reviews.map((review) => ({
    ...review,
    publishedAt: review.publishedAt?.toISOString() ?? null,
    createdAt: review.createdAt.toISOString(),
  }));
}

/* -------------------------------------------------------------------------- */
/*                                  ÉCRITURE                                  */
/* -------------------------------------------------------------------------- */

function buildData(input: AdminReviewPayload) {
  return {
    source: input.source as ReviewSource,
    authorName: input.authorName,
    authorAvatar: input.authorAvatar?.trim() || null,
    rating: input.rating,
    title: input.title?.trim() || null,
    content: input.content,
    status: input.status as ReviewStatus,
    isVerified: input.isVerified,
    isFeatured: input.isFeatured,
    publishedAt: new Date(`${input.publishedAt}T12:00:00.000Z`),
  };
}

export async function createAdminReview(
  input: AdminReviewPayload,
): Promise<{ id: string }> {
  const review = await prisma.review.create({
    data: buildData(input),
    select: { id: true },
  });

  return review;
}

export async function updateAdminReview(
  id: string,
  input: AdminReviewPayload,
): Promise<{ id: string }> {
  const existing = await prisma.review.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existing) {
    throw new AdminReviewNotFoundError();
  }

  const review = await prisma.review.update({
    where: { id },
    data: buildData(input),
    select: { id: true },
  });

  return review;
}

export async function deleteAdminReview(id: string): Promise<void> {
  const existing = await prisma.review.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existing) {
    throw new AdminReviewNotFoundError();
  }

  await prisma.review.delete({ where: { id } });
}
