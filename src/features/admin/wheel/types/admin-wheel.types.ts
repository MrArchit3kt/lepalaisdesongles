import type { WheelSegmentKind } from "@/generated/prisma/client";
import type { WheelSettings } from "@/features/wheel/types/wheel.types";

export type AdminWheelSegment = {
  id: string;
  label: string;
  kind: WheelSegmentKind;
  percentageValue: number | null;
  amountCents: number | null;
  weight: number;
  colorHex: string | null;
  isActive: boolean;
  sortOrder: number;
};

export type AdminWheelActionState = {
  success: boolean;
  message: string;
  fieldErrors?: Record<string, string[]>;
};

export type { WheelSettings };
