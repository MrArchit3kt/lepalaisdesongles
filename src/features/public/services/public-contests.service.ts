import {
  prisma,
} from "@/lib/prisma";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type ContestParticipantRow = {
  id: string;
  userId: string;
  createdAt: Date;

  user: {
    firstName: string;
    lastName: string;
    image: string | null;
  };
};

type ContestScore = {
  points: number;
  votes: number;
};

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

function getPublicDisplayName({
  firstName,
  lastName,
}: {
  firstName: string;
  lastName: string;
}): string {
  const normalizedFirstName =
    firstName.trim();

  const normalizedLastName =
    lastName.trim();

  if (
    normalizedLastName.length ===
    0
  ) {
    return normalizedFirstName;
  }

  return `${normalizedFirstName} ${normalizedLastName
    .charAt(
      0,
    )
    .toLocaleUpperCase(
      "fr-FR",
    )}.`;
}

function getRemainingEntries({
  maximumEntries,
  participantCount,
}: {
  maximumEntries: number | null;
  participantCount: number;
}): number | null {
  if (
    maximumEntries ===
    null
  ) {
    return null;
  }

  return Math.max(
    maximumEntries -
      participantCount,
    0,
  );
}

function buildLeaderboard({
  participants,
  scoresByUserId,
}: {
  participants:
    ContestParticipantRow[];

  scoresByUserId:
    Map<
      string,
      ContestScore
    >;
}) {
  return participants
    .map(
      (
        participant,
      ) => {
        const score =
          scoresByUserId.get(
            participant.userId,
          ) ?? {
            points:
              0,

            votes:
              0,
          };

        return {
          participantId:
            participant.id,

          userId:
            participant.userId,

          displayName:
            getPublicDisplayName(
              participant.user,
            ),

          imageUrl:
            participant.user.image,

          points:
            score.points,

          votes:
            score.votes,

          totalScore:
            score.points +
            score.votes,

          joinedAt:
            participant.createdAt,
        };
      },
    )
    .sort(
      (
        firstEntry,
        secondEntry,
      ) => {
        if (
          secondEntry.totalScore !==
          firstEntry.totalScore
        ) {
          return (
            secondEntry.totalScore -
            firstEntry.totalScore
          );
        }

        if (
          secondEntry.points !==
          firstEntry.points
        ) {
          return (
            secondEntry.points -
            firstEntry.points
          );
        }

        return (
          firstEntry.joinedAt.getTime() -
          secondEntry.joinedAt.getTime()
        );
      },
    )
    .map(
      (
        entry,
        index,
      ) => ({
        ...entry,

        position:
          index +
          1,
      }),
    );
}

/* -------------------------------------------------------------------------- */
/*                                   QUERY                                    */
/* -------------------------------------------------------------------------- */

export async function getPublicContestsPageData() {
  const now =
    new Date();

  const contests =
    await prisma.contest.findMany({
      where: {
        OR: [
          {
            status:
              "ACTIVE",

            endsAt: {
              gte:
                now,
            },
          },

          {
            status:
              "SCHEDULED",

            startsAt: {
              gt:
                now,
            },
          },
        ],
      },

      include: {
        participants: {
          orderBy: {
            createdAt:
              "asc",
          },

          select: {
            id:
              true,

            userId:
              true,

            createdAt:
              true,

            user: {
              select: {
                firstName:
                  true,

                lastName:
                  true,

                image:
                  true,
              },
            },
          },
        },

        winners: {
          orderBy: {
            position:
              "asc",
          },

          select: {
            id:
              true,

            position:
              true,

            score:
              true,

            points:
              true,

            prizeName:
              true,

            prizeDescription:
              true,

            prizeValueCents:
              true,

            announcedAt:
              true,

            user: {
              select: {
                firstName:
                  true,

                lastName:
                  true,

                image:
                  true,
              },
            },
          },
        },

        _count: {
          select: {
            participants:
              true,

            pointEntries:
              true,

            votes:
              true,
          },
        },
      },

      orderBy: [
        {
          startsAt:
            "asc",
        },

        {
          createdAt:
            "desc",
        },
      ],
    });

  const activeContests =
    contests.filter(
      (
        contest,
      ) =>
        contest.status ===
          "ACTIVE" &&
        contest.startsAt <=
          now &&
        contest.endsAt >=
          now,
    );

  const upcomingContests =
    contests.filter(
      (
        contest,
      ) =>
        contest.startsAt >
          now &&
        (
          contest.status ===
            "SCHEDULED" ||
          contest.status ===
            "ACTIVE"
        ),
    );

  const activeContestIds =
    activeContests.map(
      (
        contest,
      ) =>
        contest.id,
    );

  const [
    pointGroups,
    voteGroups,
  ] =
    activeContestIds.length >
    0
      ? await Promise.all([
          prisma.contestPointEntry.groupBy({
            by: [
              "contestId",
              "userId",
            ],

            where: {
              contestId: {
                in:
                  activeContestIds,
              },
            },

            _sum: {
              points:
                true,
            },
          }),

          prisma.contestVote.groupBy({
            by: [
              "contestId",
              "candidateUserId",
            ],

            where: {
              contestId: {
                in:
                  activeContestIds,
              },

              candidateUserId: {
                not:
                  null,
              },
            },

            _sum: {
              score:
                true,
            },
          }),
        ])
      : [
          [],
          [],
        ];

  const scoresByContestId =
    new Map<
      string,
      Map<
        string,
        ContestScore
      >
    >();

  function getContestScoreMap(
    contestId: string,
  ) {
    const existingMap =
      scoresByContestId.get(
        contestId,
      );

    if (
      existingMap
    ) {
      return existingMap;
    }

    const createdMap =
      new Map<
        string,
        ContestScore
      >();

    scoresByContestId.set(
      contestId,
      createdMap,
    );

    return createdMap;
  }

  for (
    const group of
    pointGroups
  ) {
    const contestScoreMap =
      getContestScoreMap(
        group.contestId,
      );

    const currentScore =
      contestScoreMap.get(
        group.userId,
      ) ?? {
        points:
          0,

        votes:
          0,
      };

    contestScoreMap.set(
      group.userId,
      {
        ...currentScore,

        points:
          group._sum.points ??
          0,
      },
    );
  }

  for (
    const group of
    voteGroups
  ) {
    if (
      !group.candidateUserId
    ) {
      continue;
    }

    const contestScoreMap =
      getContestScoreMap(
        group.contestId,
      );

    const currentScore =
      contestScoreMap.get(
        group.candidateUserId,
      ) ?? {
        points:
          0,

        votes:
          0,
      };

    contestScoreMap.set(
      group.candidateUserId,
      {
        ...currentScore,

        votes:
          group._sum.score ??
          0,
      },
    );
  }

  const formattedActiveContests =
    activeContests.map(
      (
        contest,
      ) => ({
        ...contest,

        participantCount:
          contest._count
            .participants,

        remainingEntries:
          getRemainingEntries({
            maximumEntries:
              contest.maximumEntries,

            participantCount:
              contest._count
                .participants,
          }),

        leaderboard:
          buildLeaderboard({
            participants:
              contest.participants,

            scoresByUserId:
              scoresByContestId.get(
                contest.id,
              ) ??
              new Map(),
          }),
      }),
    );

  const formattedUpcomingContests =
    upcomingContests.map(
      (
        contest,
      ) => ({
        ...contest,

        participantCount:
          contest._count
            .participants,

        remainingEntries:
          getRemainingEntries({
            maximumEntries:
              contest.maximumEntries,

            participantCount:
              contest._count
                .participants,
          }),
      }),
    );

  return {
    activeContests:
      formattedActiveContests,

    upcomingContests:
      formattedUpcomingContests,

    statistics: {
      activeCount:
        formattedActiveContests.length,

      upcomingCount:
        formattedUpcomingContests.length,

      totalParticipants:
        formattedActiveContests.reduce(
          (
            total,
            contest,
          ) =>
            total +
            contest.participantCount,
          0,
        ),
    },
  };
}

/* -------------------------------------------------------------------------- */
/*                           DÉTAIL D’UN CONCOURS                             */
/* -------------------------------------------------------------------------- */

export async function getPublicContestDetails({
  slug,
  userId,
}: {
  slug: string;
  userId?: string | null;
}) {
  const now =
    new Date();

  const contest =
    await prisma.contest.findUnique({
      where: {
        slug,
      },

      include: {
        participants: {
          orderBy: {
            createdAt:
              "asc",
          },

          select: {
            id:
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
              select: {
                firstName:
                  true,

                lastName:
                  true,

                image:
                  true,
              },
            },
          },
        },

        winners: {
          orderBy: {
            position:
              "asc",
          },

          select: {
            id:
              true,

            userId:
              true,

            position:
              true,

            score:
              true,

            points:
              true,

            prizeName:
              true,

            prizeDescription:
              true,

            prizeValueCents:
              true,

            announcedAt:
              true,

            claimedAt:
              true,

            user: {
              select: {
                firstName:
                  true,

                lastName:
                  true,

                image:
                  true,
              },
            },
          },
        },

        _count: {
          select: {
            participants:
              true,

            pointEntries:
              true,

            votes:
              true,
          },
        },
      },
    });

  if (
    !contest ||
    contest.status ===
      "DRAFT" ||
    contest.status ===
      "CANCELLED"
  ) {
    return null;
  }

  const [
    pointGroups,
    voteGroups,
  ] =
    await Promise.all([
      prisma.contestPointEntry.groupBy({
        by: [
          "userId",
        ],

        where: {
          contestId:
            contest.id,
        },

        _sum: {
          points:
            true,
        },
      }),

      prisma.contestVote.groupBy({
        by: [
          "candidateUserId",
        ],

        where: {
          contestId:
            contest.id,

          candidateUserId: {
            not:
              null,
          },
        },

        _sum: {
          score:
            true,
        },
      }),
    ]);

  const scoresByUserId =
    new Map<
      string,
      ContestScore
    >();

  for (
    const group of
    pointGroups
  ) {
    scoresByUserId.set(
      group.userId,
      {
        points:
          group._sum.points ??
          0,

        votes:
          scoresByUserId.get(
            group.userId,
          )?.votes ??
          0,
      },
    );
  }

  for (
    const group of
    voteGroups
  ) {
    if (
      !group.candidateUserId
    ) {
      continue;
    }

    scoresByUserId.set(
      group.candidateUserId,
      {
        points:
          scoresByUserId.get(
            group.candidateUserId,
          )?.points ??
          0,

        votes:
          group._sum.score ??
          0,
      },
    );
  }

  const leaderboard =
    buildLeaderboard({
      participants:
        contest.participants,

      scoresByUserId,
    });

  const participantCount =
    contest._count
      .participants;

  const remainingEntries =
    getRemainingEntries({
      maximumEntries:
        contest.maximumEntries,

      participantCount,
    });

  const hasStarted =
    contest.startsAt <=
    now;

  const hasEnded =
    contest.endsAt <
    now;

  const isActive =
    contest.status ===
      "ACTIVE" &&
    hasStarted &&
    !hasEnded;

  const isUpcoming =
    contest.startsAt >
      now ||
    contest.status ===
      "SCHEDULED";

  const isFull =
    remainingEntries ===
    0;

  const currentParticipation =
    userId
      ? contest.participants.find(
          (
            participant,
          ) =>
            participant.userId ===
            userId,
        ) ??
        null
      : null;

  return {
    ...contest,

    participantCount,
    remainingEntries,
    leaderboard,

    hasStarted,
    hasEnded,
    isActive,
    isUpcoming,
    isFull,

    canParticipate:
      isActive &&
      !isFull &&
      !currentParticipation,

    currentParticipation,

    winners:
      contest.winners.map(
        (
          winner,
        ) => ({
          ...winner,

          displayName:
            getPublicDisplayName(
              winner.user,
            ),
        }),
      ),
  };
}

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

export type PublicContestDetails =
  NonNullable<
    Awaited<
      ReturnType<
        typeof getPublicContestDetails
      >
    >
  >;

export type PublicContestsPageData =
  Awaited<
    ReturnType<
      typeof getPublicContestsPageData
    >
  >;

export type PublicActiveContest =
  PublicContestsPageData[
    "activeContests"
  ][number];

export type PublicUpcomingContest =
  PublicContestsPageData[
    "upcomingContests"
  ][number];
