export type AdminVipRewardType =
  | "FIXED_DISCOUNT"
  | "PERCENTAGE_DISCOUNT"
  | "FREE_SERVICE"
  | "FREE_NAIL_ART"
  | "FREE_PRODUCT"
  | "GIFT_CARD"
  | "LOYALTY_POINTS"
  | "EXPERIENCE_POINTS"
  | "CONTEST_ENTRY"
  | "SEASON_PASS_XP"
  | "PHYSICAL_GIFT"
  | "VIP_ACCESS"
  | "CUSTOM";

export type AdminVipRewardStatus =
  | "DRAFT"
  | "ACTIVE"
  | "INACTIVE"
  | "ARCHIVED";

export type AdminVipRewardLevelOption = {
  id: string;
  name: string;
  level: number;
  color: string | null;
  status: string;
};

export type AdminVipRewardServiceOption = {
  id: string;
  name: string;
  priceCents: number;
  durationMinutes: number;
};

export type AdminVipReward = {
  id: string;

  name: string;
  slug: string;

  description: string | null;
  shortDescription: string | null;

  type: AdminVipRewardType;

  icon: string | null;
  imageUrl: string | null;
  bannerUrl: string | null;
  color: string | null;

  fixedAmountCents: number | null;
  percentage: number | null;
  loyaltyPoints: number | null;
  experiencePoints: number | null;

  freeServiceId: string | null;
  freeService: AdminVipRewardServiceOption | null;

  quantity: number | null;

  minimumLevelId: string | null;
  minimumLevel: AdminVipRewardLevelOption | null;

  minimumPoints: number | null;
  minimumXp: number | null;

  rewardCode: string | null;
  couponCodePrefix: string | null;

  validForDays: number | null;

  startsAt: string | null;
  endsAt: string | null;

  unlimitedStock: boolean;
  stock: number | null;
  remainingStock: number | null;

  status: AdminVipRewardStatus;

  visible: boolean;
  featured: boolean;
  repeatable: boolean;

  sortOrder: number;

  clientRewardCount: number;
  linkedBadgeCount: number;
  linkedAchievementCount: number;

  availableInShop: boolean;

  createdAt: string;
  updatedAt: string;
};

export type AdminVipRewardMetrics = {
  totalRewards: number;
  activeRewards: number;
  draftRewards: number;
  inactiveRewards: number;
  archivedRewards: number;
  featuredRewards: number;
  limitedStockRewards: number;
  outOfStockRewards: number;
  assignedRewards: number;
};

export type AdminVipRewardsPageData = {
  generatedAt: string;

  metrics: AdminVipRewardMetrics;

  rewards: AdminVipReward[];

  levels: AdminVipRewardLevelOption[];

  services: AdminVipRewardServiceOption[];
};
