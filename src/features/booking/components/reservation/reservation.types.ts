import type {
  AvailabilityResult,
  AvailabilitySlot,
} from "../../types/availability.types";

export type ServiceItem = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  priceCents: number;
  promotionalPriceCents: number | null;
  durationMinutes: number;
  depositRequired: boolean;
  depositCents: number | null;
};

export type ReservationServiceOption = {
  serviceId: string;

  /**
   * Quantité sélectionnée.
   *
   * Exemple :
   * - Nail Art : nombre de doigts
   * - Décoration : nombre de doigts
   */
  quantity: number;
};

export type Category = {
  id: string;
  name: string;
  description: string | null;
  services: ServiceItem[];
};

export type StaffMember = {
  id: string;
  displayName: string;
  bio: string | null;
  image: string | null;
  isOwner: boolean;
  serviceIds: string[];
};

export type ReservationStep =
  | 1
  | 2
  | 3
  | 4;

export type ReservationSummary = {
  totalPriceCents: number;
  totalDurationMinutes: number;
  depositCents: number;
  remainingCents: number;
  isFullPayment: boolean;
};

export type ReservationWizardState = {
  serviceIds: string[];
  serviceOptions: ReservationServiceOption[];
  staffId: string;
  date: string;
  clientComment: string;
  availability: AvailabilityResult | null;
  selectedSlot: AvailabilitySlot | null;
};

export type ReservationProgressItem = {
  step: ReservationStep;
  label: string;
  completed: boolean;
  active: boolean;
};
