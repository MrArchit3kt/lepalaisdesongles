/* -------------------------------------------------------------------------- */
/*                              ÉNUMÉRATIONS                                  */
/* -------------------------------------------------------------------------- */

export type AdminContestStatus =
  | "DRAFT"
  | "SCHEDULED"
  | "ACTIVE"
  | "CLOSED"
  | "DRAWN"
  | "CANCELLED";

export type AdminContestFilterStatus =
  | "ALL"
  | AdminContestStatus;

export type AdminContestAction =
  | "ACTIVATE"
  | "SCHEDULE"
  | "CLOSE"
  | "CANCEL"
  | "DRAW"
  | "REOPEN"
  | "DELETE";

/* -------------------------------------------------------------------------- */
/*                                  UTILISATEUR                               */
/* -------------------------------------------------------------------------- */

export type AdminContestUser = {
  id: string;

  firstName: string;
  lastName: string;

  email: string;
  phone: string | null;
  image: string | null;

  status: string;
};

/* -------------------------------------------------------------------------- */
/*                                PARTICIPANTE                                */
/* -------------------------------------------------------------------------- */

export type AdminContestParticipant = {
  id: string;

  contestId: string;
  userId: string;

  answer: string | null;
  isWinner: boolean;

  user: AdminContestUser;

  createdAt: string;
};

/* -------------------------------------------------------------------------- */
/*                                  CRÉATEUR                                  */
/* -------------------------------------------------------------------------- */

export type AdminContestCreator = {
  id: string;

  firstName: string;
  lastName: string;

  email: string;
} | null;

/* -------------------------------------------------------------------------- */
/*                                   CONCOURS                                 */
/* -------------------------------------------------------------------------- */

export type AdminContest = {
  id: string;
  createdById: string | null;

  title: string;
  slug: string;

  description: string;
  rules: string | null;

  prize: string;
  imageUrl: string | null;

  status: AdminContestStatus;

  startsAt: string;
  endsAt: string;
  drawAt: string | null;

  winnerId: string | null;

  maximumEntries: number | null;

  requiresAccount: boolean;
  showOnHomepage: boolean;

  participantCount: number;
  remainingEntries: number | null;

  winner: AdminContestParticipant | null;

  createdBy: AdminContestCreator;

  createdAt: string;
  updatedAt: string;
};

/* -------------------------------------------------------------------------- */
/*                             CONCOURS DÉTAILLÉ                              */
/* -------------------------------------------------------------------------- */

export type AdminContestDetails = AdminContest & {
  participants: AdminContestParticipant[];
};

/* -------------------------------------------------------------------------- */
/*                                STATISTIQUES                                */
/* -------------------------------------------------------------------------- */

export type AdminContestMetrics = {
  totalContests: number;

  draftContests: number;
  scheduledContests: number;
  activeContests: number;
  closedContests: number;
  drawnContests: number;
  cancelledContests: number;

  totalParticipants: number;
  participantsThisMonth: number;

  contestsShownOnHomepage: number;

  contestsAwaitingDraw: number;
};

/* -------------------------------------------------------------------------- */
/*                                   ALERTES                                  */
/* -------------------------------------------------------------------------- */

export type AdminContestAlertTone =
  | "ROSE"
  | "AMBER"
  | "BLUE"
  | "VIOLET"
  | "EMERALD";

export type AdminContestAlert = {
  id: string;

  title: string;
  description: string;

  count: number | null;

  href: string;

  tone: AdminContestAlertTone;
};

/* -------------------------------------------------------------------------- */
/*                             DONNÉES DASHBOARD                              */
/* -------------------------------------------------------------------------- */

export type AdminContestsDashboardData = {
  generatedAt: string;

  metrics: AdminContestMetrics;

  alerts: AdminContestAlert[];

  contests: AdminContest[];

  activeContests: AdminContest[];
  upcomingContests: AdminContest[];
  contestsAwaitingDraw: AdminContest[];

  recentParticipants: Array<
    AdminContestParticipant & {
      contest: {
        id: string;
        title: string;
        slug: string;
        status: AdminContestStatus;
      };
    }
  >;
};

/* -------------------------------------------------------------------------- */
/*                               FORMULAIRE                                   */
/* -------------------------------------------------------------------------- */

export type AdminContestFormInput = {
  id?: string;

  title: string;
  slug: string;

  description: string;
  rules: string;

  prize: string;
  imageUrl: string;

  status: AdminContestStatus;

  startsAt: string;
  endsAt: string;
  drawAt: string;

  maximumEntries: number | null;

  requiresAccount: boolean;
  showOnHomepage: boolean;
};

/* -------------------------------------------------------------------------- */
/*                            TIRAGE AU SORT                                  */
/* -------------------------------------------------------------------------- */

export type AdminContestDrawInput = {
  contestId: string;

  participantId?: string;

  reason: string;
};

/* -------------------------------------------------------------------------- */
/*                         MODIFICATION DE STATUT                             */
/* -------------------------------------------------------------------------- */

export type AdminContestStatusInput = {
  contestId: string;

  action: AdminContestAction;

  reason?: string;
};

/* -------------------------------------------------------------------------- */
/*                                FILTRES                                     */
/* -------------------------------------------------------------------------- */

export type AdminContestFilters = {
  search: string;

  status: AdminContestFilterStatus;

  homepageOnly: boolean;
};

/* -------------------------------------------------------------------------- */
/*                              ÉTAT DES ACTIONS                              */
/* -------------------------------------------------------------------------- */

export type AdminContestActionState = {
  success: boolean;

  message: string;

  contestId?: string;
  redirectTo?: string;

  fieldErrors?: Record<
    string,
    string[]
  >;
};
