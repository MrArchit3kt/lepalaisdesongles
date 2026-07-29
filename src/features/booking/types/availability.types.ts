export type AvailabilityStaff = {
  id: string;
  displayName: string;
};

export type AvailabilityWorkstation = {
  id: string;
  name: string;
};

export type AvailabilitySlot = {
  startsAt: string;
  endsAt: string;
  label: string;
  staff: AvailabilityStaff;
  workstation: AvailabilityWorkstation;
};

export type AvailabilityResult = {
  date: string;
  requestedStaffId: string;
  autoAssigned: boolean;
  totalDurationMinutes: number;
  cleanupMinutes: number;
  totalPriceCents: number;
  depositCents: number;
  slots: AvailabilitySlot[];
};

export type AvailabilityServiceOptionInput = {
  serviceId: string;
  quantity: number;
};

export type GetAvailabilityInput = {
  staffId: string;
  serviceIds: string[];
  serviceOptions?: AvailabilityServiceOptionInput[];
  date: string;
};
