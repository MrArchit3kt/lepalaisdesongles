import type { WheelSegmentKind, WheelSpinTrigger } from "@/generated/prisma/client";

export type WheelSettings = {
  enabled: boolean;
  bookingSpinEnabled: boolean;
  dailySpinEnabled: boolean;
  defaultValidityDays: number;
};

export type WheelSegmentPublic = {
  id: string;
  label: string;
  kind: WheelSegmentKind;
  colorHex: string | null;
  sortOrder: number;
  weight: number;
};

export type WheelEligibility = {
  eligible: boolean;
  reason: "OK" | "DISABLED" | "TRIGGER_DISABLED" | "ALREADY_SPUN" | "NO_SEGMENTS";
  segments: WheelSegmentPublic[];
};

export type WheelSpinResult = {
  segmentId: string;
  label: string;
  kind: WheelSegmentKind;
  won: boolean;
  code: string | null;
  expiresAt: string | null;
  percentageValue: number | null;
  amountCents: number | null;
};

export type { WheelSpinTrigger };
