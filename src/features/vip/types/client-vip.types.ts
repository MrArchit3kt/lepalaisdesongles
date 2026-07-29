export type ClientVipLevel = {
  id: string;
  name: string;
  level: number;

  color: string | null;
  icon: string | null;
  imageUrl: string | null;

  requiredXp: number;
  requiredPoints: number;
};

export type ClientVipRewardStatus =
  | "AVAILABLE"
  | "RESERVED"
  | "USED"
  | "EXPIRED"
  | "CANCELLED"
  | "GIFTED";

export type ClientVipReward = {
  id: string;

  status: ClientVipRewardStatus;

  uniqueCode: string;
  qrCode: string | null;
  barcode: string | null;

  expiresAt: string | null;
  usedAt: string | null;
  reservedAt: string | null;
  giftedAt: string | null;
  cancelledAt: string | null;

  reward: {
    id: string;
    name: string;
    slug: string;

    shortDescription: string | null;

    type: string;

    icon: string | null;
    color: string | null;
    imageUrl: string | null;

    fixedAmountCents: number | null;
    percentage: number | null;
    loyaltyPoints: number | null;
    experiencePoints: number | null;
  };

  createdAt: string;
};

export type ClientVipTransaction = {
  id: string;

  type: string;
  source: string;

  xpAmount: number;
  pointsAmount: number;

  xpBalanceAfter: number;
  pointsBalanceAfter: number;

  title: string;
  description: string | null;

  appointmentReference: string | null;
  contestReference: string | null;
  rewardReference: string | null;
  challengeReference: string | null;

  actorName: string | null;

  isReversed: boolean;

  createdAt: string;
};

export type ClientVipProgress = {
  xpPercent: number;
  pointsPercent: number;

  remainingXp: number;
  remainingPoints: number;
};

export type ClientVipDashboardMetrics = {
  availableRewards: number;
  usedRewards: number;

  completedAppointments: number;

  totalPointsEarned: number;
  totalPointsSpent: number;

  totalExperienceEarned: number;

  totalSpentCents: number;
};

export type ClientVipDashboardData = {
  generatedAt: string;

  account: {
    id: string;

    memberNumber: string;
    referralCode: string;

    isActive: boolean;
    isSuspended: boolean;

    points: number;
    experience: number;

    joinedAt: string;
    lastRewardClaimedAt: string | null;

    currentLevel: ClientVipLevel | null;
  };

  nextLevel: ClientVipLevel | null;

  progress: ClientVipProgress;

  metrics: ClientVipDashboardMetrics;

  rewards: ClientVipReward[];

  transactions: ClientVipTransaction[];
};
