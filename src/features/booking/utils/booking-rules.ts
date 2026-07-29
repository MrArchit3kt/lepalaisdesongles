import type { AvailabilitySlot } from "../types/availability.types";

export type TimeWindow = {
  startsAt: Date;
  endsAt: Date;
};

export type StaffPlanningRank = {
  appointmentCount: number;
  occupiedMinutes: number;
  sortOrder: number;
  occupiedWindows: TimeWindow[];
};

export const MAXIMUM_DEPOSIT_CENTS = 3_500;

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}

export function overlaps(first: TimeWindow, second: TimeWindow): boolean {
  return first.startsAt < second.endsAt && first.endsAt > second.startsAt;
}

export function calculateRequiredPaymentCents(totalPriceCents: number): number {
  if (!Number.isInteger(totalPriceCents) || totalPriceCents < 0) {
    throw new Error("Le montant total des prestations est invalide.");
  }

  return Math.min(totalPriceCents, MAXIMUM_DEPOSIT_CENTS);
}

export function getPlanningGapScore(
  slot: AvailabilitySlot,
  rank: StaffPlanningRank | undefined,
): number {
  if (!rank || rank.occupiedWindows.length === 0) {
    return Number.MAX_SAFE_INTEGER;
  }

  const startsAt = new Date(slot.startsAt).getTime();
  const endsAt = new Date(slot.endsAt).getTime();

  return rank.occupiedWindows.reduce((best, occupied) => {
    const gapBefore = Math.abs(startsAt - occupied.endsAt.getTime());
    const gapAfter = Math.abs(occupied.startsAt.getTime() - endsAt);
    return Math.min(best, gapBefore, gapAfter);
  }, Number.MAX_SAFE_INTEGER);
}

export function compareAvailabilitySlots(
  a: AvailabilitySlot,
  b: AvailabilitySlot,
  staffRank: ReadonlyMap<string, StaffPlanningRank>,
): number {
  const byStart = a.startsAt.localeCompare(b.startsAt);
  if (byStart !== 0) return byStart;

  const aRank = staffRank.get(a.staff.id);
  const bRank = staffRank.get(b.staff.id);

  const byPlanningGap =
    getPlanningGapScore(a, aRank) - getPlanningGapScore(b, bRank);
  if (byPlanningGap !== 0) return byPlanningGap;

  const byAppointmentCount =
    (aRank?.appointmentCount ?? 0) - (bRank?.appointmentCount ?? 0);
  if (byAppointmentCount !== 0) return byAppointmentCount;

  const byOccupiedMinutes =
    (aRank?.occupiedMinutes ?? 0) - (bRank?.occupiedMinutes ?? 0);
  if (byOccupiedMinutes !== 0) return byOccupiedMinutes;

  const bySortOrder =
    (aRank?.sortOrder ?? 0) - (bRank?.sortOrder ?? 0);
  if (bySortOrder !== 0) return bySortOrder;

  const byStaff = a.staff.displayName.localeCompare(b.staff.displayName, "fr");
  if (byStaff !== 0) return byStaff;

  return a.workstation.name.localeCompare(b.workstation.name, "fr");
}
