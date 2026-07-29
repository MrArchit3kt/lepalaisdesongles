export type AdminVipSystemRuleStatus =
  | "DRAFT"
  | "ACTIVE"
  | "PAUSED"
  | "ARCHIVED";

export type AdminVipAppointmentPointsRule = {
  id: string;

  name: string;
  slug: string;

  status: AdminVipSystemRuleStatus;
  enabled: boolean;

  pointsPerEuro: number;

  executionCount: number;
  successCount: number;
  failureCount: number;

  lastExecutedAt: string | null;
  updatedAt: string;
};

export type AdminVipAppointmentXpRule = {
  id: string;

  name: string;
  slug: string;

  status: AdminVipSystemRuleStatus;
  enabled: boolean;

  xpPerCompletedAppointment: number;

  executionCount: number;
  successCount: number;
  failureCount: number;

  lastExecutedAt: string | null;
  updatedAt: string;
};

export type AdminVipAppointmentRulesConfiguration = {
  programStatus:
    | "DISABLED"
    | "PRE_LAUNCH"
    | "ACTIVE"
    | "PAUSED";

  clubEnabled: boolean;
  automaticRulesEnabled: boolean;
  xpEnabled: boolean;

  notificationsEnabled: boolean;
  notifyOnXpEarned: boolean;
};

export type AdminVipAppointmentRulesSettings = {
  generatedAt: string;

  minimumSpendCents: number | null;
  onlyPaidAppointments: boolean;

  configuration:
    AdminVipAppointmentRulesConfiguration;

  pointsRule:
    AdminVipAppointmentPointsRule;

  xpRule:
    AdminVipAppointmentXpRule;
};
