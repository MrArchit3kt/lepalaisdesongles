import type {
  AdminAppointmentStatus,
} from "@/features/admin/appointments/types/admin-appointment.types";

/* -------------------------------------------------------------------------- */
/*                                    VUES                                    */
/* -------------------------------------------------------------------------- */

export type AdminCalendarView =
  | "day"
  | "week"
  | "month";

/* -------------------------------------------------------------------------- */
/*                              TYPES D’ÉVÉNEMENTS                            */
/* -------------------------------------------------------------------------- */

export type AdminCalendarEventKind =
  | "APPOINTMENT"
  | "STAFF_BREAK"
  | "STAFF_TIME_OFF"
  | "STAFF_CLOSED"
  | "BUSINESS_BREAK"
  | "BUSINESS_TIME_OFF"
  | "BUSINESS_CLOSED";

export type AdminCalendarEventSource =
  | "APPOINTMENT"
  | "STAFF_WORKING_HOUR"
  | "STAFF_WORKING_HOUR_OVERRIDE"
  | "STAFF_TIME_OFF"
  | "WORKING_HOUR"
  | "WORKING_HOUR_OVERRIDE"
  | "TIME_OFF";

export type AdminCalendarEventType =
  | "APPOINTMENT"
  | "UNAVAILABILITY"
  | "BREAK"
  | "BUSINESS_CLOSURE";

export type AdminCalendarResourceType =
  | "STAFF"
  | "WORKSTATION"
  | "GLOBAL";

/* -------------------------------------------------------------------------- */
/*                                  RESSOURCES                                */
/* -------------------------------------------------------------------------- */

export type AdminCalendarStaff = {
  id: string;
  displayName: string;
  isOwner: boolean;
  isActive: boolean;
  color: string | null;
};

export type AdminCalendarWorkstation = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
};

export type AdminCalendarService = {
  id: string;
  serviceId: string;
  serviceName: string;
  quantity: number;
  durationMinutes: number;
  unitPriceCents: number;
};

export type AdminCalendarClient = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
};

export type AdminCalendarAppointmentImage = {
  id: string;
  url: string;
  fileName: string | null;
  mimeType: string | null;
  sizeBytes: number | null;
};

/* -------------------------------------------------------------------------- */
/*                                RENDEZ-VOUS                                 */
/* -------------------------------------------------------------------------- */

export type AdminCalendarAppointmentEvent = {
  id: string;
  type: "APPOINTMENT";

  reference: string;
  title: string;

  startsAt: string;
  endsAt: string;

  status: AdminAppointmentStatus;
  paymentStatus: string;

  totalDurationMinutes: number;
  totalPriceCents: number;
  depositCents: number;

  clientComment: string | null;
  adminComment: string | null;
  cancellationReason: string | null;

  client: AdminCalendarClient;

  staff: AdminCalendarStaff | null;
  workstation: AdminCalendarWorkstation | null;

  services: AdminCalendarService[];
  images: AdminCalendarAppointmentImage[];

  isMovable: boolean;
  isResizable: boolean;
};

/* -------------------------------------------------------------------------- */
/*                         ÉVÉNEMENTS BLOQUANTS LEGACY                        */
/* -------------------------------------------------------------------------- */

export type AdminCalendarBlockingEvent = {
  id: string;

  type:
    | "UNAVAILABILITY"
    | "BREAK"
    | "BUSINESS_CLOSURE";

  title: string;
  description: string | null;

  startsAt: string;
  endsAt: string;

  resourceType: AdminCalendarResourceType;

  staffId: string | null;
  workstationId: string | null;

  staff: AdminCalendarStaff | null;
  workstation: AdminCalendarWorkstation | null;

  isMovable: boolean;
  isResizable: boolean;
};

export type AdminCalendarEvent =
  | AdminCalendarAppointmentEvent
  | AdminCalendarBlockingEvent;

/* -------------------------------------------------------------------------- */
/*                       ÉVÉNEMENTS DU NOUVEAU MOTEUR                         */
/* -------------------------------------------------------------------------- */

export type AdminCalendarEngineClient = {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string | null;
  image: string | null;
};

export type AdminCalendarEngineService = {
  id: string;
  serviceId: string;
  name: string;
  quantity: number;
  unitPriceCents: number;
  durationMinutes: number;
  comment: string | null;
  sortOrder: number;
};

export type AdminCalendarEngineEvent = {
  id: string;
  key: string;

  kind: AdminCalendarEventKind;
  source: AdminCalendarEventSource;

  title: string;
  subtitle: string | null;
  description: string | null;

  startsAt: string;
  endsAt: string;
  allDay: boolean;

  color: string;
  textColor: string;
  backgroundColor: string;
  borderColor: string;

  staffId: string | null;
  workstationId: string | null;
  reference: string | null;

  status: AdminAppointmentStatus | null;
  statusLabel: string | null;

  draggable: boolean;
  resizable: boolean;
  blocking: boolean;
  editable: boolean;

  client: AdminCalendarEngineClient | null;
  services: AdminCalendarEngineService[];
  images: AdminCalendarAppointmentImage[];

  totalDurationMinutes: number | null;
  totalPriceCents: number | null;
  depositCents: number | null;

  clientComment: string | null;
  adminComment: string | null;
  cancellationReason: string | null;

  metadata: Record<
    string,
    unknown
  >;
};

/* -------------------------------------------------------------------------- */
/*                              PLAGE ET FILTRES                              */
/* -------------------------------------------------------------------------- */

export type AdminCalendarRange = {
  startsAt: string;
  endsAt: string;
};

export type AdminCalendarEngineRange =
  AdminCalendarRange & {
    numberOfDays: number;
    timeZone: string;
  };

export type AdminCalendarFilters = {
  staffId: string | null;
  workstationId: string | null;
  statuses: AdminAppointmentStatus[];
  includeUnavailable: boolean;
  includeCompleted: boolean;
  search: string;
};

export type AdminCalendarBusinessHours = {
  dayStart: string;
  dayEnd: string;
  slotIntervalMinutes: number;
};

export type AdminCalendarStatistics = {
  totalAppointments: number;
  pendingAppointments: number;
  confirmedAppointments: number;
  inProgressAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  totalRevenueCents: number;
  totalBookedMinutes: number;
};

export type AdminCalendarData = {
  range: AdminCalendarRange;

  staff: AdminCalendarStaff[];
  workstations: AdminCalendarWorkstation[];

  events: AdminCalendarEvent[];
};

/* -------------------------------------------------------------------------- */
/*                               RÉPONSES API                                 */
/* -------------------------------------------------------------------------- */

export type AdminCalendarApiSuccess = {
  success: true;
  data: AdminCalendarData;
};

export type AdminCalendarApiError = {
  success: false;
  error: string;
  code?: string;
};

export type AdminCalendarApiResponse =
  | AdminCalendarApiSuccess
  | AdminCalendarApiError;

/* -------------------------------------------------------------------------- */
/*                                  MUTATIONS                                 */
/* -------------------------------------------------------------------------- */

export type MoveAppointmentMutation = {
  action: "move";
  startsAt: string;
  endsAt: string;
  staffId?: string | null;
  workstationId?: string | null;
};

export type ResizeAppointmentMutation = {
  action: "resize";
  startsAt: string;
  endsAt: string;
};

export type CalendarAppointmentMutation =
  | MoveAppointmentMutation
  | ResizeAppointmentMutation;

/* -------------------------------------------------------------------------- */
/*                                INTERFACE UI                                */
/* -------------------------------------------------------------------------- */

export type CalendarEventPosition = {
  topPercent: number;
  heightPercent: number;
};

export type CalendarDayColumn = {
  date: string;
  label: string;
  shortLabel: string;
  isToday: boolean;
};

export type CalendarTimeSlot = {
  hour: number;
  minute: number;
  label: string;
  totalMinutes: number;
};

export type CalendarSelection = {
  startsAt: string;
  endsAt: string;
  staffId: string | null;
  workstationId: string | null;
};

export type CalendarDragState = {
  eventId: string;
  eventType: AdminCalendarEventType;

  originalStartsAt: string;
  originalEndsAt: string;

  originalStaffId: string | null;
  originalWorkstationId: string | null;
};

export type CalendarMutationState = {
  isPending: boolean;
  eventId: string | null;
  error: string | null;
};

/* -------------------------------------------------------------------------- */
/*                           OUTILS DE NARROWING                              */
/* -------------------------------------------------------------------------- */

export function isAppointmentCalendarEvent(
  event: AdminCalendarEvent,
): event is AdminCalendarAppointmentEvent {
  return (
    event.type ===
    "APPOINTMENT"
  );
}

export function isBlockingCalendarEvent(
  event: AdminCalendarEvent,
): event is AdminCalendarBlockingEvent {
  return (
    event.type !==
    "APPOINTMENT"
  );
}

export function canMoveCalendarEvent(
  event: AdminCalendarEvent,
): boolean {
  return event.isMovable;
}

export function canResizeCalendarEvent(
  event: AdminCalendarEvent,
): boolean {
  return event.isResizable;
}

export function isEngineAppointmentEvent(
  event: AdminCalendarEngineEvent,
): boolean {
  return (
    event.kind ===
    "APPOINTMENT"
  );
}

export function isEngineBlockingEvent(
  event: AdminCalendarEngineEvent,
): boolean {
  return (
    event.kind !==
    "APPOINTMENT"
  );
}

export function isStaffCalendarEvent(
  event: AdminCalendarEngineEvent,
): boolean {
  return (
    event.staffId !== null
  );
}

export function isBusinessCalendarEvent(
  event: AdminCalendarEngineEvent,
): boolean {
  return (
    event.kind ===
      "BUSINESS_BREAK" ||
    event.kind ===
      "BUSINESS_TIME_OFF" ||
    event.kind ===
      "BUSINESS_CLOSED"
  );
}

/* -------------------------------------------------------------------------- */
/*                    COMPATIBILITÉ AVEC L’ANCIEN MODULE                      */
/* -------------------------------------------------------------------------- */

export type CalendarStatus =
  AdminAppointmentStatus;

export type CalendarMutation =
  CalendarAppointmentMutation;

export type CalendarAppointment = {
  id: string;
  reference: string;

  startsAt: string;
  endsAt: string;

  status: CalendarStatus;
  paymentStatus: string;

  totalDurationMinutes: number;
  totalPriceCents: number;
  depositCents: number;

  clientComment: string | null;
  adminComment: string | null;
  cancellationReason: string | null;

  client: AdminCalendarClient;

  staff: AdminCalendarStaff | null;
  workstation: AdminCalendarWorkstation | null;

  services: AdminCalendarService[];
  images: AdminCalendarAppointmentImage[];

  isMovable?: boolean;
  isResizable?: boolean;
};

export type CalendarPayload = {
  range?: AdminCalendarEngineRange;

  staff: AdminCalendarStaff[];
  workstations: AdminCalendarWorkstation[];

  appointments: CalendarAppointment[];

  events?: AdminCalendarEngineEvent[];

  businessHours?: AdminCalendarBusinessHours;

  statistics?: AdminCalendarStatistics;
};