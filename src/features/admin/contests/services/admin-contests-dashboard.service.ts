import type {
  Prisma,
} from "@/generated/prisma/client";

import type {
  AdminContest,
  AdminContestAlert,
  AdminContestParticipant,
  AdminContestsDashboardData,
} from "@/features/admin/contests/types/admin-contests.types";

import {
  prisma,
} from "@/lib/prisma";

/* -------------------------------------------------------------------------- */
/*                                CONSTANTES                                  */
/* -------------------------------------------------------------------------- */

const RECENT_PARTICIPANTS_LIMIT =
  12;

/* -------------------------------------------------------------------------- */
/*                            SÉLECTIONS PRISMA                               */
/* -------------------------------------------------------------------------- */

const participantUserSelect = {
  id:
    true,

  firstName:
    true,

  lastName:
    true,

  email:
    true,

  phone:
    true,

  image:
    true,

  status:
    true,
} satisfies Prisma.UserSelect;

const contestParticipantSelect = {
  id:
    true,

  contestId:
    true,

  userId:
    true,

  answer:
    true,

  isWinner:
    true,

  createdAt:
    true,

  user: {
    select:
      participantUserSelect,
  },
} satisfies Prisma.ContestParticipantSelect;

const contestSelect = {
  id:
    true,

  createdById:
    true,

  title:
    true,

  slug:
    true,

  description:
    true,

  rules:
    true,

  prize:
    true,

  imageUrl:
    true,

  status:
    true,

  startsAt:
    true,

  endsAt:
    true,

  drawAt:
    true,

  winnerId:
    true,

  maximumEntries:
    true,

  requiresAccount:
    true,

  showOnHomepage:
    true,

  createdAt:
    true,

  updatedAt:
    true,

  createdBy: {
    select: {
      id:
        true,

      firstName:
        true,

      lastName:
        true,

      email:
        true,
    },
  },

  participants: {
    where: {
      isWinner:
        true,
    },

    orderBy: {
      createdAt:
        "asc",
    },

    take:
      1,

    select:
      contestParticipantSelect,
  },

  _count: {
    select: {
      participants:
        true,
    },
  },
} satisfies Prisma.ContestSelect;

const recentParticipantSelect = {
  ...contestParticipantSelect,

  contest: {
    select: {
      id:
        true,

      title:
        true,

      slug:
        true,

      status:
        true,
    },
  },
} satisfies Prisma.ContestParticipantSelect;

/* -------------------------------------------------------------------------- */
/*                              TYPES PRISMA                                  */
/* -------------------------------------------------------------------------- */

type ContestRow =
  Prisma.ContestGetPayload<{
    select:
      typeof contestSelect;
  }>;

type ParticipantRow =
  Prisma.ContestParticipantGetPayload<{
    select:
      typeof contestParticipantSelect;
  }>;

type RecentParticipantRow =
  Prisma.ContestParticipantGetPayload<{
    select:
      typeof recentParticipantSelect;
  }>;

/* -------------------------------------------------------------------------- */
/*                                 FORMATAGE                                  */
/* -------------------------------------------------------------------------- */

function serializeParticipant(
  participant: ParticipantRow,
): AdminContestParticipant {
  return {
    id:
      participant.id,

    contestId:
      participant.contestId,

    userId:
      participant.userId,

    answer:
      participant.answer,

    isWinner:
      participant.isWinner,

    user: {
      id:
        participant.user.id,

      firstName:
        participant.user.firstName,

      lastName:
        participant.user.lastName,

      email:
        participant.user.email,

      phone:
        participant.user.phone,

      image:
        participant.user.image,

      status:
        participant.user.status,
    },

    createdAt:
      participant.createdAt.toISOString(),
  };
}

function serializeContest(
  contest: ContestRow,
): AdminContest {
  const participantCount =
    contest._count.participants;

  const remainingEntries =
    contest.maximumEntries ===
      null
      ? null
      : Math.max(
          contest.maximumEntries -
            participantCount,
          0,
        );

  const winner =
    contest.participants[0]
      ? serializeParticipant(
          contest.participants[0],
        )
      : null;

  return {
    id:
      contest.id,

    createdById:
      contest.createdById,

    title:
      contest.title,

    slug:
      contest.slug,

    description:
      contest.description,

    rules:
      contest.rules,

    prize:
      contest.prize,

    imageUrl:
      contest.imageUrl,

    status:
      contest.status,

    startsAt:
      contest.startsAt.toISOString(),

    endsAt:
      contest.endsAt.toISOString(),

    drawAt:
      contest.drawAt
        ?.toISOString() ??
      null,

    winnerId:
      contest.winnerId,

    maximumEntries:
      contest.maximumEntries,

    requiresAccount:
      contest.requiresAccount,

    showOnHomepage:
      contest.showOnHomepage,

    participantCount,

    remainingEntries,

    winner,

    createdBy:
      contest.createdBy
        ? {
            id:
              contest.createdBy.id,

            firstName:
              contest.createdBy.firstName,

            lastName:
              contest.createdBy.lastName,

            email:
              contest.createdBy.email,
          }
        : null,

    createdAt:
      contest.createdAt.toISOString(),

    updatedAt:
      contest.updatedAt.toISOString(),
  };
}

/* -------------------------------------------------------------------------- */
/*                                   ALERTES                                  */
/* -------------------------------------------------------------------------- */

function buildContestAlerts(
  input: {
    totalContests: number;
    activeContests: AdminContest[];
    upcomingContests: AdminContest[];
    contestsAwaitingDraw: AdminContest[];
  },
): AdminContestAlert[] {
  const alerts:
    AdminContestAlert[] =
    [];

  if (
    input.totalContests ===
    0
  ) {
    alerts.push({
      id:
        "NO_CONTEST",

      title:
        "Aucun concours créé",

      description:
        "Créez votre premier jeu concours pour animer la communauté.",

      count:
        0,

      href:
        "/admin/concours/nouveau",

      tone:
        "VIOLET",
    });
  }

  if (
    input.contestsAwaitingDraw
      .length >
    0
  ) {
    alerts.push({
      id:
        "CONTESTS_AWAITING_DRAW",

      title:
        "Tirages en attente",

      description:
        "Des concours terminés attendent encore la désignation d’une gagnante.",

      count:
        input
          .contestsAwaitingDraw
          .length,

      href:
        "/admin/concours?status=CLOSED",

      tone:
        "AMBER",
    });
  }

  const contestsEndingSoon =
    input.activeContests.filter(
      (
        contest,
      ) => {
        const remainingTime =
          new Date(
            contest.endsAt,
          ).getTime() -
          Date.now();

        return (
          remainingTime >
            0 &&
          remainingTime <=
            72 *
              60 *
              60 *
              1000
        );
      },
    );

  if (
    contestsEndingSoon.length >
    0
  ) {
    alerts.push({
      id:
        "CONTESTS_ENDING_SOON",

      title:
        "Concours bientôt terminés",

      description:
        "Un ou plusieurs concours se terminent dans moins de 72 heures.",

      count:
        contestsEndingSoon.length,

      href:
        "/admin/concours?status=ACTIVE",

      tone:
        "ROSE",
    });
  }

  const upcomingSoon =
    input.upcomingContests.filter(
      (
        contest,
      ) => {
        const remainingTime =
          new Date(
            contest.startsAt,
          ).getTime() -
          Date.now();

        return (
          remainingTime >
            0 &&
          remainingTime <=
            48 *
              60 *
              60 *
              1000
        );
      },
    );

  if (
    upcomingSoon.length >
    0
  ) {
    alerts.push({
      id:
        "CONTESTS_STARTING_SOON",

      title:
        "Lancements programmés",

      description:
        "Des concours commenceront dans les prochaines 48 heures.",

      count:
        upcomingSoon.length,

      href:
        "/admin/concours?status=SCHEDULED",

      tone:
        "BLUE",
    });
  }

  return alerts;
}

/* -------------------------------------------------------------------------- */
/*                              SERVICE PRINCIPAL                             */
/* -------------------------------------------------------------------------- */

export async function getAdminContestsDashboardData():
  Promise<AdminContestsDashboardData> {
  const now =
    new Date();

  const monthStart =
    new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
      0,
      0,
      0,
      0,
    );

  const [
    contestRows,
    totalParticipants,
    participantsThisMonth,
    recentParticipantRows,
  ] =
    await Promise.all([
      prisma.contest.findMany({
        orderBy: [
          {
            status:
              "asc",
          },
          {
            startsAt:
              "desc",
          },
          {
            createdAt:
              "desc",
          },
        ],

        select:
          contestSelect,
      }),

      prisma.contestParticipant.count(),

      prisma.contestParticipant.count({
        where: {
          createdAt: {
            gte:
              monthStart,
          },
        },
      }),

      prisma.contestParticipant.findMany({
        orderBy: {
          createdAt:
            "desc",
        },

        take:
          RECENT_PARTICIPANTS_LIMIT,

        select:
          recentParticipantSelect,
      }),
    ]);

  const contests =
    contestRows.map(
      serializeContest,
    );

  const activeContests =
    contests.filter(
      (
        contest,
      ) =>
        contest.status ===
        "ACTIVE",
    );

  const upcomingContests =
    contests.filter(
      (
        contest,
      ) =>
        contest.status ===
        "SCHEDULED" &&
        new Date(
          contest.startsAt,
        ) >
          now,
    );

  const contestsAwaitingDraw =
    contests.filter(
      (
        contest,
      ) =>
        (
          contest.status ===
            "CLOSED" ||
          (
            contest.status ===
              "ACTIVE" &&
            new Date(
              contest.endsAt,
            ) <=
              now
          )
        ) &&
        contest.winner ===
          null,
    );

  const draftContests =
    contests.filter(
      (
        contest,
      ) =>
        contest.status ===
        "DRAFT",
    ).length;

  const scheduledContests =
    contests.filter(
      (
        contest,
      ) =>
        contest.status ===
        "SCHEDULED",
    ).length;

  const closedContests =
    contests.filter(
      (
        contest,
      ) =>
        contest.status ===
        "CLOSED",
    ).length;

  const drawnContests =
    contests.filter(
      (
        contest,
      ) =>
        contest.status ===
        "DRAWN",
    ).length;

  const cancelledContests =
    contests.filter(
      (
        contest,
      ) =>
        contest.status ===
        "CANCELLED",
    ).length;

  const contestsShownOnHomepage =
    contests.filter(
      (
        contest,
      ) =>
        contest.showOnHomepage,
    ).length;

  return {
    generatedAt:
      now.toISOString(),

    metrics: {
      totalContests:
        contests.length,

      draftContests,

      scheduledContests,

      activeContests:
        activeContests.length,

      closedContests,

      drawnContests,

      cancelledContests,

      totalParticipants,

      participantsThisMonth,

      contestsShownOnHomepage,

      contestsAwaitingDraw:
        contestsAwaitingDraw.length,
    },

    alerts:
      buildContestAlerts({
        totalContests:
          contests.length,

        activeContests,

        upcomingContests,

        contestsAwaitingDraw,
      }),

    contests,

    activeContests,

    upcomingContests,

    contestsAwaitingDraw,

    recentParticipants:
      recentParticipantRows.map(
        (
          participant:
            RecentParticipantRow,
        ) => ({
          ...serializeParticipant(
            participant,
          ),

          contest: {
            id:
              participant.contest.id,

            title:
              participant.contest.title,

            slug:
              participant.contest.slug,

            status:
              participant.contest.status,
          },
        }),
      ),
  };
}
