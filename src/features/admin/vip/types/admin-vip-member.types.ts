import type {
  AdminVipMember,
  AdminVipMemberLevel,
  AdminVipTransaction,
} from "@/features/admin/vip/types/admin-vip.types";

import type {
  AdminVipRewardStatus,
  AdminVipRewardType,
} from "@/features/admin/vip/types/admin-vip-reward.types";

/* -------------------------------------------------------------------------- */
/*                                FILTRES                                     */
/* -------------------------------------------------------------------------- */

export type AdminVipMemberStatusFilter =
  | "ALL"
  | "ACTIVE"
  | "SUSPENDED"
  | "INACTIVE";

export type AdminVipMemberFilters = {
  search: string;
  status: AdminVipMemberStatusFilter;
  levelId: string;
};

/* -------------------------------------------------------------------------- */
/*                            RÉCOMPENSE CLIENTE                              */
/* -------------------------------------------------------------------------- */

export type AdminVipClientRewardStatus =
  | "AVAILABLE"
  | "RESERVED"
  | "USED"
  | "EXPIRED"
  | "CANCELLED"
  | "GIFTED";

export type AdminVipMemberReward = {
  id: string;

  userId: string;
  accountId: string;
  rewardId: string;

  status: AdminVipClientRewardStatus;

  uniqueCode: string;
  qrCode: string | null;
  barcode: string | null;

  usedAt: string | null;
  expiresAt: string | null;
  cancelledAt: string | null;
  giftedAt: string | null;
  reservedAt: string | null;

  appointmentId: string | null;
  transactionId: string | null;

  reward: {
    id: string;
    name: string;
    slug: string;

    type: AdminVipRewardType;
    status: AdminVipRewardStatus;

    color: string | null;
    icon: string | null;
    imageUrl: string | null;

    fixedAmountCents: number | null;
    percentage: number | null;
    loyaltyPoints: number | null;
    experiencePoints: number | null;
  };

  createdAt: string;
  updatedAt: string;
};

/* -------------------------------------------------------------------------- */
/*                            HISTORIQUE NIVEAU                               */
/* -------------------------------------------------------------------------- */

export type AdminVipMemberLevelHistory = {
  id: string;
  accountId: string;

  previousLevelId: string | null;
  newLevelId: string;

  experienceAtUpgrade: number;
  pointsAtUpgrade: number;

  upgradedAutomatically: boolean;

  reason: string | null;

  previousLevel: AdminVipMemberLevel | null;
  newLevel: AdminVipMemberLevel;

  createdAt: string;
};

/* -------------------------------------------------------------------------- */
/*                             MEMBRE DÉTAILLÉ                                */
/* -------------------------------------------------------------------------- */

export type AdminVipMemberDetails =
  AdminVipMember & {
    suspendedAt: string | null;
    levelReachedAt: string | null;

    transactions: AdminVipTransaction[];

    rewards: AdminVipMemberReward[];

    levelHistory: AdminVipMemberLevelHistory[];
  };

/* -------------------------------------------------------------------------- */
/*                              OPTIONS ADMIN                                 */
/* -------------------------------------------------------------------------- */

export type AdminVipMemberLevelOption = {
  id: string;
  name: string;
  level: number;

  requiredXp: number;
  requiredPoints: number;

  color: string | null;
  icon: string | null;

  isDefault: boolean;
};

export type AdminVipMemberRewardOption = {
  id: string;
  name: string;
  slug: string;

  type: AdminVipRewardType;

  color: string | null;
  icon: string | null;

  validForDays: number | null;

  unlimitedStock: boolean;
  remainingStock: number | null;

  repeatable: boolean;
};

/* -------------------------------------------------------------------------- */
/*                               STATISTIQUES                                 */
/* -------------------------------------------------------------------------- */

export type AdminVipMembersMetrics = {
  totalMembers: number;
  activeMembers: number;
  suspendedMembers: number;
  inactiveMembers: number;

  membersWithoutLevel: number;

  totalPoints: number;
  totalExperience: number;

  totalRewardsAvailable: number;
  totalRewardsUsed: number;

  newMembersThisMonth: number;
};

/* -------------------------------------------------------------------------- */
/*                               DONNÉES PAGE                                 */
/* -------------------------------------------------------------------------- */

export type AdminVipMembersPageData = {
  generatedAt: string;

  metrics: AdminVipMembersMetrics;

  members: AdminVipMember[];

  levels: AdminVipMemberLevelOption[];

  rewards: AdminVipMemberRewardOption[];
};

/* -------------------------------------------------------------------------- */
/*                              ACTIONS ADMIN                                 */
/* -------------------------------------------------------------------------- */

export type AdminVipBalanceAdjustmentInput = {
  accountId: string;

  pointsDelta: number;
  experienceDelta: number;

  title: string;
  reason: string;
};

export type AdminVipMemberLevelChangeInput = {
  accountId: string;
  levelId: string;

  reason: string;
};

export type AdminVipMemberStatusAction =
  | "ACTIVATE"
  | "DEACTIVATE"
  | "SUSPEND"
  | "UNSUSPEND";

export type AdminVipMemberStatusInput = {
  accountId: string;

  action: AdminVipMemberStatusAction;

  reason: string;
};

export type AdminVipMemberRewardGrantInput = {
  accountId: string;
  rewardId: string;

  expiresAt: string;

  reason: string;
};
