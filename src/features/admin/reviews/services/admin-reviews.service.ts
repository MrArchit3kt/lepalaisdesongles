import "server-only";

import { ReviewSource } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

import type { AdminReviewPayload } from "../schemas/admin-review.schema";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

export type AdminReviewListItem = {
  id: string;
  source: ReviewSource;
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
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],

    select: {
      id: true,
      source: true,
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

    /*
     * `status` ne conditionne pas encore l'affichage public (seul
     * `publishedAt` le fait, voir avis/page.tsx), mais on le pose à
     * APPROVED par cohérence : un avis ajouté manuellement par
     * l'équipe est par définition déjà validé.
     */
    status: "APPROVED" as const,

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
