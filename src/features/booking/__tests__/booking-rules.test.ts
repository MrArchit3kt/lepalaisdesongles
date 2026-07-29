import { describe, expect, it } from "vitest";

import type { AvailabilitySlot } from "../types/availability.types";
import {
  addMinutes,
  calculateRequiredPaymentCents,
  compareAvailabilitySlots,
  getPlanningGapScore,
  overlaps,
  type StaffPlanningRank,
} from "../utils/booking-rules";

function makeSlot(overrides: Partial<AvailabilitySlot> = {}): AvailabilitySlot {
  return {
    startsAt: "2026-07-20T08:00:00.000Z",
    endsAt: "2026-07-20T09:00:00.000Z",
    label: "10:00",
    staff: { id: "staff-a", displayName: "Alice" },
    workstation: { id: "desk-a", name: "Table 1" },
    ...overrides,
  };
}

describe("règles financières", () => {
  it("demande le paiement intégral sous 35 €", () => {
    expect(calculateRequiredPaymentCents(2_900)).toBe(2_900);
  });

  it("plafonne l'acompte à 35 €", () => {
    expect(calculateRequiredPaymentCents(8_500)).toBe(3_500);
  });

  it("refuse un montant invalide", () => {
    expect(() => calculateRequiredPaymentCents(-1)).toThrow(
      "Le montant total des prestations est invalide.",
    );
  });
});

describe("fenêtres d'occupation", () => {
  it("ajoute les minutes de nettoyage", () => {
    const date = new Date("2026-07-20T08:00:00.000Z");
    expect(addMinutes(date, 15).toISOString()).toBe(
      "2026-07-20T08:15:00.000Z",
    );
  });

  it("détecte un chevauchement réel", () => {
    expect(overlaps(
      {
        startsAt: new Date("2026-07-20T08:00:00.000Z"),
        endsAt: new Date("2026-07-20T09:00:00.000Z"),
      },
      {
        startsAt: new Date("2026-07-20T08:45:00.000Z"),
        endsAt: new Date("2026-07-20T09:30:00.000Z"),
      },
    )).toBe(true);
  });

  it("autorise deux créneaux qui se touchent", () => {
    expect(overlaps(
      {
        startsAt: new Date("2026-07-20T08:00:00.000Z"),
        endsAt: new Date("2026-07-20T09:00:00.000Z"),
      },
      {
        startsAt: new Date("2026-07-20T09:00:00.000Z"),
        endsAt: new Date("2026-07-20T10:00:00.000Z"),
      },
    )).toBe(false);
  });
});

describe("optimisation du planning", () => {
  const compactRank: StaffPlanningRank = {
    appointmentCount: 2,
    occupiedMinutes: 120,
    sortOrder: 2,
    occupiedWindows: [{
      startsAt: new Date("2026-07-20T07:00:00.000Z"),
      endsAt: new Date("2026-07-20T08:00:00.000Z"),
    }],
  };

  it("donne un score nul à un créneau collé", () => {
    expect(getPlanningGapScore(makeSlot(), compactRank)).toBe(0);
  });

  it("privilégie le créneau réduisant le trou", () => {
    const slotA = makeSlot();
    const slotB = makeSlot({
      staff: { id: "staff-b", displayName: "Brigitte" },
    });

    const ranks = new Map<string, StaffPlanningRank>([
      ["staff-a", compactRank],
      ["staff-b", {
        ...compactRank,
        occupiedWindows: [{
          startsAt: new Date("2026-07-20T05:00:00.000Z"),
          endsAt: new Date("2026-07-20T06:00:00.000Z"),
        }],
      }],
    ]);

    expect(compareAvailabilitySlots(slotA, slotB, ranks)).toBeLessThan(0);
  });

  it("utilise ensuite le nombre de rendez-vous", () => {
    const slotA = makeSlot();
    const slotB = makeSlot({
      staff: { id: "staff-b", displayName: "Brigitte" },
    });

    const ranks = new Map<string, StaffPlanningRank>([
      ["staff-a", {
        appointmentCount: 1,
        occupiedMinutes: 60,
        sortOrder: 2,
        occupiedWindows: [],
      }],
      ["staff-b", {
        appointmentCount: 3,
        occupiedMinutes: 60,
        sortOrder: 1,
        occupiedWindows: [],
      }],
    ]);

    expect(compareAvailabilitySlots(slotA, slotB, ranks)).toBeLessThan(0);
  });
});
