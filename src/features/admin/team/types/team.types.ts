import type {
  DayOfWeek,
} from "@/generated/prisma/client";

/* -------------------------------------------------------------------------- */
/*                                  ENUMS                                     */
/* -------------------------------------------------------------------------- */

export type TeamSortField =
  | "displayName"
  | "createdAt"
  | "appointments"
  | "revenue";

export type TeamSortDirection =
  | "asc"
  | "desc";

/* -------------------------------------------------------------------------- */
/*                                  FILTERS                                   */
/* -------------------------------------------------------------------------- */

export type TeamFilters = {
  search: string;
  activeOnly: boolean;
  onlineBookingOnly: boolean;
  includeOwner: boolean;
};

export type TeamQuery = {
  filters: TeamFilters;
  sortField: TeamSortField;
  sortDirection: TeamSortDirection;
};

/* -------------------------------------------------------------------------- */
/*                                 STATISTICS                                 */
/* -------------------------------------------------------------------------- */

export type TeamStatistics = {
  appointments: number;
  completedAppointments: number;
  cancelledAppointments: number;

  revenueCents: number;

  averageTicketCents: number;

  averageRating: number;

  clients: number;
};

/* -------------------------------------------------------------------------- */
/*                                WORKSTATION                                 */
/* -------------------------------------------------------------------------- */

export type TeamWorkstation = {
  id: string;
  name: string;
  slug: string;

  isPrimary: boolean;
  isActive: boolean;
};

/* -------------------------------------------------------------------------- */
/*                                  SERVICE                                   */
/* -------------------------------------------------------------------------- */

export type TeamService = {
  id: string;

  serviceId: string;

  name: string;

  durationMinutes: number | null;

  cleanupMinutes: number | null;

  priceCents: number | null;

  depositRequired: boolean | null;

  depositCents: number | null;

  isActive: boolean;
};

/* -------------------------------------------------------------------------- */
/*                               WORKING HOURS                                */
/* -------------------------------------------------------------------------- */

export type TeamWorkingHour = {
  id: string;

  dayOfWeek: DayOfWeek;

  isOpen: boolean;

  startTime: string | null;

  endTime: string | null;

  hasBreak: boolean;

  breakStart: string | null;

  breakEnd: string | null;
};

/* -------------------------------------------------------------------------- */
/*                              WORKING OVERRIDE                              */
/* -------------------------------------------------------------------------- */

export type TeamWorkingHourOverride = {
  id: string;

  date: string;

  isOpen: boolean;

  startTime: string | null;

  endTime: string | null;

  hasBreak: boolean;

  breakStart: string | null;

  breakEnd: string | null;

  reason: string | null;
};

/* -------------------------------------------------------------------------- */
/*                                  TIME OFF                                  */
/* -------------------------------------------------------------------------- */

export type TeamTimeOff = {
  id: string;

  title: string;

  reason: string | null;

  startsAt: string;

  endsAt: string;

  allDay: boolean;
};

/* -------------------------------------------------------------------------- */
/*                                TEAM MEMBER                                 */
/* -------------------------------------------------------------------------- */

export type TeamMember = {
  id: string;

  userId: string;

  firstName: string;

  lastName: string;

  displayName: string;

  email: string;

  phone: string | null;

  image: string | null;

  bio: string | null;

  color: string | null;

  isOwner: boolean;

  isActive: boolean;

  acceptsOnlineBooking: boolean;

  defaultCleanupMinutes: number;

  slotIntervalMinutes: number;

  sortOrder: number;

  createdAt: string;

  updatedAt: string;

  workstations: TeamWorkstation[];

  services: TeamService[];

  workingHours: TeamWorkingHour[];

  overrides:
    TeamWorkingHourOverride[];

  timeOffs: TeamTimeOff[];

  statistics: TeamStatistics;
};

/* -------------------------------------------------------------------------- */
/*                               FORM VALUES                                  */
/* -------------------------------------------------------------------------- */

export type TeamMemberFormValues = {
  firstName: string;

  lastName: string;

  email: string;

  phone: string;

  bio: string;

  color: string;

  password: string;

  isOwner: boolean;

  isActive: boolean;

  acceptsOnlineBooking: boolean;

  defaultCleanupMinutes: number;

  slotIntervalMinutes: number;

  workstationIds: string[];

  serviceIds: string[];
};

/* -------------------------------------------------------------------------- */
/*                                 PAYLOADS                                   */
/* -------------------------------------------------------------------------- */

export type CreateTeamMemberPayload =
  TeamMemberFormValues;

export type UpdateTeamMemberPayload =
  TeamMemberFormValues & {
    id: string;
  };

/* -------------------------------------------------------------------------- */
/*                                 RESPONSES                                  */
/* -------------------------------------------------------------------------- */

export type TeamMemberListResponse = {
  members: TeamMember[];

  total: number;
};

export type TeamMemberResponse = {
  member: TeamMember;
};

/* -------------------------------------------------------------------------- */
/*                              FORM OPTIONS                                  */
/* -------------------------------------------------------------------------- */

export type TeamServiceOption = {
  id: string;
  name: string;
  durationMinutes: number;
  priceCents: number;

  category: {
    id: string;
    name: string;
  };
};

export type TeamWorkstationOption = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  availableForBooking: boolean;
};

export type TeamFormOptions = {
  services: TeamServiceOption[];
  workstations: TeamWorkstationOption[];
};

/* -------------------------------------------------------------------------- */
/*                                 API ERRORS                                 */
/* -------------------------------------------------------------------------- */

export type TeamApiIssue = {
  path: string;
  message: string;
};

export type TeamApiError = {
  error: string;
  issues?: TeamApiIssue[];
};

export type TeamCreateResponse = {
  success: true;
  member: TeamMember;
};

export type TeamUpdateResponse = {
  success: true;
  member: TeamMember;
};

export type TeamDeleteResponse = {
  success: true;
  deleted: boolean;
  deactivated: boolean;
};

export type TeamActivationResponse = {
  success: true;
  member: TeamMember;
};
