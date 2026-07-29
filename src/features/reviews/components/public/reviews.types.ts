export type PublicReviewSource =
  | "INTERNAL"
  | "GOOGLE";

export type PublicReview = {
  id: string;
  authorName: string;
  authorAvatarUrl?: string | null;
  rating: number;
  content: string;
  createdAt: string;
  source: PublicReviewSource;
  isVerified: boolean;
  serviceName?: string | null;
  ownerResponse?: string | null;
  ownerRespondedAt?: string | null;
};

export type ReviewRatingFilter =
  | "all"
  | "5"
  | "4"
  | "3"
  | "2"
  | "1";

export type ReviewSortOption =
  | "recent"
  | "oldest"
  | "rating-desc"
  | "rating-asc";

export type ReviewRatingDistribution = {
  rating: 1 | 2 | 3 | 4 | 5;
  count: number;
  percentage: number;
};

export type ReviewsSummary = {
  totalReviews: number;
  averageRating: number;
  verifiedReviews: number;
  satisfactionRate: number;
  distribution: ReviewRatingDistribution[];
};