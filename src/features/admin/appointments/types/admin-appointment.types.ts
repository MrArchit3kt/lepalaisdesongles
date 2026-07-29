"use client";

export type AdminAppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "REFUSED"
  | "CANCELLED_BY_CLIENT"
  | "CANCELLED_BY_ADMIN"
  | "NO_SHOW"
  | "EXPIRED";

export type AdminAppointmentListItem = {
  id: string;
  reference: string;
  status: AdminAppointmentStatus;
  paymentStatus: string;
  startsAt: string;
  endsAt: string;
  totalPriceCents: number;
  depositCents: number;
  clientComment: string | null;
  adminComment: string | null;
  cancellationReason: string | null;

  client: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
  };

  staff: {
    id: string;
    displayName: string;
  } | null;

  workstation: {
    id: string;
    name: string;
  } | null;

  services: Array<{
    id: string;
    serviceName: string;
    quantity: number;
    durationMinutes: number;
  }>;
};

export type AdminAppointmentMutation =
  | {
      action: "confirm";
      adminComment?: string;
    }
  | {
      action: "refuse";
      reason: string;
      adminComment?: string;
    }
  | {
      action: "cancel";
      reason: string;
      adminComment?: string;
    }
  | {
      action: "reschedule";
      startsAt: string;
      adminComment?: string;
    }
  | {
      action: "update_note";
      adminComment: string;
    }
  | {
      action: "start";
    }
  | {
      action: "complete";
    }
  | {
      action: "no_show";
      reason?: string;
    };

export type AppointmentHistoryChange = {
  field: string;
  label: string;
  before: unknown;
  after: unknown;
};

export type AdminAppointmentTimelineItem = {
  id: string;
  action: string;
  createdAt: string;

  previousStatus: AdminAppointmentStatus | null;
  nextStatus: AdminAppointmentStatus | null;

  previousStartsAt: string | null;
  nextStartsAt: string | null;

  reason: string | null;
  actorId: string | null;

  changes: AppointmentHistoryChange[];
};

export type AdminAppointmentTimelineResponse = {
  success: true;
  timeline: AdminAppointmentTimelineItem[];
};