import {
  randomInt,
} from "node:crypto";

import type {
  Prisma,
} from "@/generated/prisma/client";

import {
  adminContestDrawSchema,
  adminContestFormSchema,
  adminContestStatusSchema,
} from "@/features/admin/contests/schemas/admin-contests.schemas";

import type {
  AdminContest,
  AdminContestDetails,
  AdminContestDrawInput,
  AdminContestFormInput,
  AdminContestParticipant,
  AdminContestStatus,
  AdminContestStatusInput,
} from "@/features/admin/contests/types/admin-contests.types";

import {
  prisma,
} from "@/lib/prisma";

/* -------------------------------------------------------------------------- */
/*                                  ERREURS                                   */
/* -------------------------------------------------------------------------- */

export class AdminContestValidationError extends Error {
  readonly fieldErrors: Record<
    string,
    string[]
  >;

  constructor(
    message: string,
    fieldErrors: Record<
      string,
      string[]
    >,
  ) {
    super(message);

    this.name =
      "AdminContestValidationError";

    this.fieldErrors =
      fieldErrors;
  }
}

/* -------------------------------------------------------------------------- */
/*                            SÉLECTIONS PRISMA                               */
/* -------------------------------------------------------------------------- */

const participantSelect = {
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
    select: {
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
    },
  },
} satisfies Prisma.ContestParticipantSelect;

const contestDetailsSelect = {
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
    orderBy: {
      createdAt:
        "desc",
    },

    select:
      participantSelect,
  },
} satisfies Prisma.ContestSelect;

/* -------------------------------------------------------------------------- */
/*                              TYPES PRISMA                                  */
/* -------------------------------------------------------------------------- */

type ContestDetailsRow =
  Prisma.ContestGetPayload<{
    select:
      typeof contestDetailsSelect;
  }>;

type ParticipantRow =
  Prisma.ContestParticipantGetPayload<{
    select:
      typeof participantSelect;
  }>;

/* -------------------------------------------------------------------------- */
/*                              OUTILS ZOD                                    */
/* -------------------------------------------------------------------------- */

function normalizeFieldErrors(
  errors: Record<
    string,
    string[] | undefined
  >,
): Record<
  string,
  string[]
> {
  return Object.fromEntries(
    Object.entries(
      errors,
    ).filter(
      (
        entry,
      ): entry is [
        string,
        string[],
      ] =>
        Array.isArray(
          entry[1],
        ) &&
        entry[1].length >
          0,
    ),
  );
}

function parseContestForm(
  value: unknown,
): AdminContestFormInput {
  const result =
    adminContestFormSchema.safeParse(
      value,
    );

  if (
    result.success
  ) {
    return result.data;
  }

  throw new AdminContestValidationError(
    "Le formulaire du concours contient des erreurs.",
    normalizeFieldErrors(
      result.error.flatten()
        .fieldErrors,
    ),
  );
}

function parseContestStatus(
  value: unknown,
): AdminContestStatusInput {
  const result =
    adminContestStatusSchema.safeParse(
      value,
    );

  if (
    result.success
  ) {
    return result.data;
  }

  throw new AdminContestValidationError(
    "L’action demandée contient des erreurs.",
    normalizeFieldErrors(
      result.error.flatten()
        .fieldErrors,
    ),
  );
}

function parseContestDraw(
  value: unknown,
): AdminContestDrawInput {
  const result =
    adminContestDrawSchema.safeParse(
      value,
    );

  if (
    result.success
  ) {
    return result.data;
  }

  throw new AdminContestValidationError(
    "Le tirage au sort contient des erreurs.",
    normalizeFieldErrors(
      result.error.flatten()
        .fieldErrors,
    ),
  );
}

/* -------------------------------------------------------------------------- */
/*                                  OUTILS                                    */
/* -------------------------------------------------------------------------- */

function toInputJsonValue(
  value: unknown,
): Prisma.InputJsonValue {
  return JSON.parse(
    JSON.stringify(
      value,
    ),
  ) as Prisma.InputJsonValue;
}

function emptyToNull(
  value: string,
): string | null {
  const normalized =
    value.trim();

  return normalized ===
    ""
    ? null
    : normalized;
}

function parseDate(
  value: string,
): Date {
  return new Date(
    value,
  );
}

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

function serializeContestDetails(
  contest: ContestDetailsRow,
): AdminContestDetails {
  const participants =
    contest.participants.map(
      serializeParticipant,
    );

  const participantCount =
    participants.length;

  const winner =
    participants.find(
      (
        participant,
      ) =>
        participant.isWinner ||
        participant.userId ===
          contest.winnerId,
    ) ??
    null;

  const remainingEntries =
    contest.maximumEntries ===
      null
      ? null
      : Math.max(
          contest.maximumEntries -
            participantCount,
          0,
        );

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

    participants,

    createdAt:
      contest.createdAt.toISOString(),

    updatedAt:
      contest.updatedAt.toISOString(),
  };
}

async function assertContestActor(
  actorId: string,
): Promise<{
  id: string;
  displayName: string;
}> {
  const actor =
    await prisma.user.findFirst({
      where: {
        id:
          actorId,

        status:
          "ACTIVE",

        role: {
          in: [
            "SUPER_ADMIN",
            "ADMIN",
          ],
        },
      },

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
    });

  if (!actor) {
    throw new Error(
      "Accès à la gestion des concours refusé.",
    );
  }

  return {
    id:
      actor.id,

    displayName:
      [
        actor.firstName,
        actor.lastName,
      ]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      actor.email,
  };
}

async function assertSlugAvailable(
  slug: string,
  excludedContestId?: string,
): Promise<void> {
  const existingContest =
    await prisma.contest.findUnique({
      where: {
        slug,
      },

      select: {
        id:
          true,
      },
    });

  if (
    existingContest &&
    existingContest.id !==
      excludedContestId
  ) {
    throw new AdminContestValidationError(
      "Ce slug est déjà utilisé par un autre concours.",
      {
        slug: [
          "Choisissez un autre slug.",
        ],
      },
    );
  }
}

function validateOperationalStatus(
  input: AdminContestFormInput,
): void {
  const now =
    new Date();

  const startsAt =
    parseDate(
      input.startsAt,
    );

  const endsAt =
    parseDate(
      input.endsAt,
    );

  if (
    input.status ===
      "ACTIVE" &&
    startsAt >
      now
  ) {
    throw new AdminContestValidationError(
      "Un concours actif ne peut pas commencer dans le futur.",
      {
        startsAt: [
          "Utilisez le statut « Planifié » pour un lancement futur.",
        ],
      },
    );
  }

  if (
    input.status ===
      "ACTIVE" &&
    endsAt <=
      now
  ) {
    throw new AdminContestValidationError(
      "Un concours actif doit se terminer dans le futur.",
      {
        endsAt: [
          "Choisissez une date de fin future.",
        ],
      },
    );
  }
}

function getContestSnapshot(
  contest: {
    id: string;
    title: string;
    slug: string;
    description: string;
    rules: string | null;
    prize: string;
    imageUrl: string | null;
    status: AdminContestStatus;
    startsAt: Date;
    endsAt: Date;
    drawAt: Date | null;
    winnerId: string | null;
    maximumEntries: number | null;
    requiresAccount: boolean;
    showOnHomepage: boolean;
  },
) {
  return {
    id:
      contest.id,

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
  };
}

/* -------------------------------------------------------------------------- */
/*                                  LECTURE                                   */
/* -------------------------------------------------------------------------- */

export async function getAdminContestDetails(
  contestId: string,
): Promise<AdminContestDetails | null> {
  const contest =
    await prisma.contest.findUnique({
      where: {
        id:
          contestId,
      },

      select:
        contestDetailsSelect,
    });

  return contest
    ? serializeContestDetails(
        contest,
      )
    : null;
}

/* -------------------------------------------------------------------------- */
/*                                  CRÉATION                                  */
/* -------------------------------------------------------------------------- */

export async function createAdminContest(
  rawValue: unknown,
  actorId: string,
): Promise<AdminContest> {
  const actor =
    await assertContestActor(
      actorId,
    );

  const input =
    parseContestForm(
      rawValue,
    );

  validateOperationalStatus(
    input,
  );

  if (
    ![
      "DRAFT",
      "SCHEDULED",
      "ACTIVE",
    ].includes(
      input.status,
    )
  ) {
    throw new AdminContestValidationError(
      "Le statut sélectionné ne peut pas être utilisé lors de la création.",
      {
        status: [
          "Créez le concours en brouillon, planifié ou actif.",
        ],
      },
    );
  }

  await assertSlugAvailable(
    input.slug,
  );

  const contest =
    await prisma.$transaction(
      async (
        transaction,
      ) => {
        const createdContest =
          await transaction.contest.create({
            data: {
              createdById:
                actor.id,

              title:
                input.title,

              slug:
                input.slug,

              description:
                input.description,

              rules:
                emptyToNull(
                  input.rules,
                ),

              prize:
                input.prize,

              imageUrl:
                emptyToNull(
                  input.imageUrl,
                ),

              status:
                input.status,

              startsAt:
                parseDate(
                  input.startsAt,
                ),

              endsAt:
                parseDate(
                  input.endsAt,
                ),

              drawAt:
                input.drawAt
                  ? parseDate(
                      input.drawAt,
                    )
                  : null,

              maximumEntries:
                input.maximumEntries,

              requiresAccount:
                input.requiresAccount,

              showOnHomepage:
                input.showOnHomepage,
            },

            select:
              contestDetailsSelect,
          });

        await transaction.auditLog.create({
          data: {
            actorId:
              actor.id,

            action:
              "CONTEST_CREATED",

            entityType:
              "Contest",

            entityId:
              createdContest.id,

            metadata:
              toInputJsonValue({
                actorName:
                  actor.displayName,

                contest:
                  getContestSnapshot(
                    createdContest,
                  ),
              }),
          },
        });

        return createdContest;
      },
    );

  return serializeContestDetails(
    contest,
  );
}

/* -------------------------------------------------------------------------- */
/*                                MODIFICATION                                */
/* -------------------------------------------------------------------------- */

export async function updateAdminContest(
  rawValue: unknown,
  actorId: string,
): Promise<AdminContest> {
  const actor =
    await assertContestActor(
      actorId,
    );

  const input =
    parseContestForm(
      rawValue,
    );

  if (!input.id) {
    throw new AdminContestValidationError(
      "Le concours à modifier est introuvable.",
      {
        id: [
          "Identifiant du concours absent.",
        ],
      },
    );
  }

  validateOperationalStatus(
    input,
  );

  const existingContest =
    await prisma.contest.findUnique({
      where: {
        id:
          input.id,
      },

      select: {
        id:
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

        _count: {
          select: {
            participants:
              true,
          },
        },
      },
    });

  if (!existingContest) {
    throw new Error(
      "Le concours demandé est introuvable.",
    );
  }

  if (
    existingContest.status ===
      "DRAWN" &&
    input.status !==
      "DRAWN"
  ) {
    throw new AdminContestValidationError(
      "Un concours déjà tiré ne peut pas changer de statut depuis le formulaire.",
      {
        status: [
          "Le résultat du tirage doit être conservé.",
        ],
      },
    );
  }

  if (
    input.maximumEntries !==
      null &&
    input.maximumEntries <
      existingContest._count
        .participants
  ) {
    throw new AdminContestValidationError(
      "La limite est inférieure au nombre actuel de participantes.",
      {
        maximumEntries: [
          `Le concours possède déjà ${existingContest._count.participants} participations.`,
        ],
      },
    );
  }

  await assertSlugAvailable(
    input.slug,
    existingContest.id,
  );

  const updatedContest =
    await prisma.$transaction(
      async (
        transaction,
      ) => {
        const contest =
          await transaction.contest.update({
            where: {
              id:
                existingContest.id,
            },

            data: {
              title:
                input.title,

              slug:
                input.slug,

              description:
                input.description,

              rules:
                emptyToNull(
                  input.rules,
                ),

              prize:
                input.prize,

              imageUrl:
                emptyToNull(
                  input.imageUrl,
                ),

              status:
                input.status,

              startsAt:
                parseDate(
                  input.startsAt,
                ),

              endsAt:
                parseDate(
                  input.endsAt,
                ),

              drawAt:
                input.drawAt
                  ? parseDate(
                      input.drawAt,
                    )
                  : null,

              maximumEntries:
                input.maximumEntries,

              requiresAccount:
                input.requiresAccount,

              showOnHomepage:
                input.showOnHomepage,
            },

            select:
              contestDetailsSelect,
          });

        await transaction.auditLog.create({
          data: {
            actorId:
              actor.id,

            action:
              "CONTEST_UPDATED",

            entityType:
              "Contest",

            entityId:
              contest.id,

            metadata:
              toInputJsonValue({
                actorName:
                  actor.displayName,

                previous:
                  getContestSnapshot(
                    existingContest,
                  ),

                next:
                  getContestSnapshot(
                    contest,
                  ),
              }),
          },
        });

        return contest;
      },
    );

  return serializeContestDetails(
    updatedContest,
  );
}

/* -------------------------------------------------------------------------- */
/*                        MODIFICATION DU STATUT                              */
/* -------------------------------------------------------------------------- */

export async function changeAdminContestStatus(
  rawValue: unknown,
  actorId: string,
): Promise<{
  contestId: string;
  status: AdminContestStatus | null;
  deleted: boolean;
}> {
  const actor =
    await assertContestActor(
      actorId,
    );

  const input =
    parseContestStatus(
      rawValue,
    );

  const existingContest =
    await prisma.contest.findUnique({
      where: {
        id:
          input.contestId,
      },

      select: {
        id:
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

        _count: {
          select: {
            participants:
              true,
          },
        },
      },
    });

  if (!existingContest) {
    throw new Error(
      "Le concours demandé est introuvable.",
    );
  }

  const now =
    new Date();

  if (
    input.action ===
      "DRAW"
  ) {
    throw new AdminContestValidationError(
      "Utilisez l’action de tirage au sort pour désigner une gagnante.",
      {
        action: [
          "Le tirage nécessite une sélection sécurisée parmi les participantes.",
        ],
      },
    );
  }

  if (
    input.action ===
      "DELETE"
  ) {
    if (
      ![
        "DRAFT",
        "CANCELLED",
      ].includes(
        existingContest.status,
      )
    ) {
      throw new AdminContestValidationError(
        "Seuls les concours en brouillon ou annulés peuvent être supprimés.",
        {
          action: [
            "Annulez d’abord le concours avant de le supprimer.",
          ],
        },
      );
    }

    if (
      existingContest._count
        .participants >
      0
    ) {
      throw new AdminContestValidationError(
        "Ce concours possède déjà des participations.",
        {
          action: [
            "Conservez-le comme concours annulé afin de préserver l’historique.",
          ],
        },
      );
    }

    await prisma.$transaction(
      async (
        transaction,
      ) => {
        await transaction.contest.delete({
          where: {
            id:
              existingContest.id,
          },
        });

        await transaction.auditLog.create({
          data: {
            actorId:
              actor.id,

            action:
              "CONTEST_DELETED",

            entityType:
              "Contest",

            entityId:
              existingContest.id,

            metadata:
              toInputJsonValue({
                actorName:
                  actor.displayName,

                reason:
                  input.reason,

                contest:
                  getContestSnapshot(
                    existingContest,
                  ),
              }),
          },
        });
      },
    );

    return {
      contestId:
        existingContest.id,

      status:
        null,

      deleted:
        true,
    };
  }

  let nextStatus:
    AdminContestStatus;

  let nextStartsAt =
    existingContest.startsAt;

  let nextEndsAt =
    existingContest.endsAt;

  let showOnHomepage =
    existingContest.showOnHomepage;

  switch (
    input.action
  ) {
    case "ACTIVATE": {
      if (
        existingContest.status ===
          "DRAWN" ||
        existingContest.status ===
          "CANCELLED"
      ) {
        throw new AdminContestValidationError(
          "Ce concours ne peut pas être activé directement.",
          {
            action: [
              "Utilisez « Réouvrir » lorsque cela est possible.",
            ],
          },
        );
      }

      if (
        existingContest.endsAt <=
        now
      ) {
        throw new AdminContestValidationError(
          "La date de fin est déjà dépassée.",
          {
            action: [
              "Modifiez les dates du concours avant de l’activer.",
            ],
          },
        );
      }

      nextStatus =
        "ACTIVE";

      if (
        existingContest.startsAt >
        now
      ) {
        nextStartsAt =
          now;
      }

      break;
    }

    case "SCHEDULE": {
      if (
        existingContest.status ===
          "DRAWN"
      ) {
        throw new AdminContestValidationError(
          "Un concours déjà tiré ne peut pas être replanifié.",
          {
            action: [
              "Le résultat du concours doit être conservé.",
            ],
          },
        );
      }

      if (
        existingContest.startsAt <=
        now
      ) {
        throw new AdminContestValidationError(
          "La date de début doit être future pour planifier le concours.",
          {
            action: [
              "Modifiez la date de début avant de le planifier.",
            ],
          },
        );
      }

      nextStatus =
        "SCHEDULED";
      break;
    }

    case "CLOSE": {
      if (
        ![
          "ACTIVE",
          "SCHEDULED",
        ].includes(
          existingContest.status,
        )
      ) {
        throw new AdminContestValidationError(
          "Ce concours ne peut pas être clôturé dans son état actuel.",
          {
            action: [
              "Seuls les concours actifs ou planifiés peuvent être clôturés.",
            ],
          },
        );
      }

      nextStatus =
        "CLOSED";

      if (
        existingContest.endsAt >
        now
      ) {
        nextEndsAt =
          now;
      }

      break;
    }

    case "CANCEL": {
      if (
        existingContest.status ===
          "DRAWN"
      ) {
        throw new AdminContestValidationError(
          "Un concours déjà tiré ne peut pas être annulé.",
          {
            action: [
              "Le résultat doit être conservé.",
            ],
          },
        );
      }

      nextStatus =
        "CANCELLED";

      showOnHomepage =
        false;

      break;
    }

    case "REOPEN": {
      if (
        ![
          "CLOSED",
          "CANCELLED",
        ].includes(
          existingContest.status,
        )
      ) {
        throw new AdminContestValidationError(
          "Ce concours ne peut pas être réouvert dans son état actuel.",
          {
            action: [
              "Seuls les concours clôturés ou annulés peuvent être réouverts.",
            ],
          },
        );
      }

      if (
        existingContest.winnerId
      ) {
        throw new AdminContestValidationError(
          "Ce concours possède déjà une gagnante.",
          {
            action: [
              "Un concours ayant déjà fait l’objet d’un tirage ne peut pas être réouvert.",
            ],
          },
        );
      }

      if (
        existingContest.endsAt <=
        now
      ) {
        throw new AdminContestValidationError(
          "La date de fin du concours est dépassée.",
          {
            action: [
              "Modifiez la date de fin avant de le réouvrir.",
            ],
          },
        );
      }

      nextStatus =
        existingContest.startsAt >
          now
          ? "SCHEDULED"
          : "ACTIVE";

      break;
    }

    default:
      throw new Error(
        "Action de concours non prise en charge.",
      );
  }

  await prisma.$transaction(
    async (
      transaction,
    ) => {
      await transaction.contest.update({
        where: {
          id:
            existingContest.id,
        },

        data: {
          status:
            nextStatus,

          startsAt:
            nextStartsAt,

          endsAt:
            nextEndsAt,

          showOnHomepage,
        },
      });

      await transaction.auditLog.create({
        data: {
          actorId:
            actor.id,

          action:
            `CONTEST_${input.action}`,

          entityType:
            "Contest",

          entityId:
            existingContest.id,

          metadata:
            toInputJsonValue({
              actorName:
                actor.displayName,

              reason:
                input.reason ??
                null,

              previousStatus:
                existingContest.status,

              nextStatus,

              previousStartsAt:
                existingContest.startsAt,

              nextStartsAt,

              previousEndsAt:
                existingContest.endsAt,

              nextEndsAt,
            }),
        },
      });
    },
  );

  return {
    contestId:
      existingContest.id,

    status:
      nextStatus,

    deleted:
      false,
  };
}

/* -------------------------------------------------------------------------- */
/*                             TIRAGE AU SORT                                 */
/* -------------------------------------------------------------------------- */

export async function drawAdminContestWinner(
  rawValue: unknown,
  actorId: string,
): Promise<{
  contestId: string;
  participantId: string;
  userId: string;
  winnerName: string;
}> {
  const actor =
    await assertContestActor(
      actorId,
    );

  const input =
    parseContestDraw(
      rawValue,
    );

  return prisma.$transaction(
    async (
      transaction,
    ) => {
      const contest =
        await transaction.contest.findUnique({
          where: {
            id:
              input.contestId,
          },

          select: {
            id:
              true,

            title:
              true,

            slug:
              true,

            status:
              true,

            endsAt:
              true,

            winnerId:
              true,

            participants: {
              where: {
                user: {
                  status:
                    "ACTIVE",
                },
              },

              orderBy: {
                createdAt:
                  "asc",
              },

              select: {
                id:
                  true,

                userId:
                  true,

                user: {
                  select: {
                    firstName:
                      true,

                    lastName:
                      true,

                    email:
                      true,
                  },
                },
              },
            },
          },
        });

      if (!contest) {
        throw new Error(
          "Le concours demandé est introuvable.",
        );
      }

      if (
        contest.status ===
          "DRAWN" ||
        contest.winnerId
      ) {
        throw new AdminContestValidationError(
          "Une gagnante a déjà été désignée pour ce concours.",
          {
            contestId: [
              "Un nouveau tirage n’est pas autorisé.",
            ],
          },
        );
      }

      const canDraw =
        contest.status ===
          "CLOSED" ||
        (
          contest.status ===
            "ACTIVE" &&
          contest.endsAt <=
            new Date()
        );

      if (!canDraw) {
        throw new AdminContestValidationError(
          "Le concours doit être terminé ou clôturé avant le tirage.",
          {
            contestId: [
              "Clôturez d’abord le concours.",
            ],
          },
        );
      }

      if (
        contest.participants
          .length ===
        0
      ) {
        throw new AdminContestValidationError(
          "Aucune participante éligible n’est disponible.",
          {
            contestId: [
              "Le tirage nécessite au moins une participante active.",
            ],
          },
        );
      }

      const selectedParticipant =
        input.participantId
          ? contest.participants.find(
              (
                participant,
              ) =>
                participant.id ===
                input.participantId,
            )
          : contest.participants[
              randomInt(
                contest.participants
                  .length,
              )
            ];

      if (
        !selectedParticipant
      ) {
        throw new AdminContestValidationError(
          "La participante sélectionnée n’est pas éligible.",
          {
            participantId: [
              "Sélectionnez une participante inscrite à ce concours.",
            ],
          },
        );
      }

      const winnerName =
        [
          selectedParticipant
            .user.firstName,

          selectedParticipant
            .user.lastName,
        ]
          .filter(Boolean)
          .join(" ")
          .trim() ||
        selectedParticipant
          .user.email;

      await transaction.contestParticipant.updateMany({
        where: {
          contestId:
            contest.id,

          isWinner:
            true,
        },

        data: {
          isWinner:
            false,
        },
      });

      await transaction.contestParticipant.update({
        where: {
          id:
            selectedParticipant.id,
        },

        data: {
          isWinner:
            true,
        },
      });

      await transaction.contest.update({
        where: {
          id:
            contest.id,
        },

        data: {
          status:
            "DRAWN",

          winnerId:
            selectedParticipant.userId,

          drawAt:
            new Date(),
        },
      });

      await transaction.loyaltyAccount.updateMany({
        where: {
          userId:
            selectedParticipant.userId,
        },

        data: {
          totalContestWins: {
            increment:
              1,
          },
        },
      });

      await transaction.notification.create({
        data: {
          userId:
            selectedParticipant.userId,

          type:
            "CONTEST",

          title:
            "Vous avez gagné un concours !",

          message:
            `Félicitations, vous êtes la gagnante du concours « ${contest.title} ». Nous vous contacterons prochainement pour votre lot.`,

          actionUrl:
            `/concours/${contest.slug}`,

          metadata:
            toInputJsonValue({
              contestId:
                contest.id,

              participantId:
                selectedParticipant.id,

              winner:
                true,
            }),
        },
      });

      await transaction.auditLog.create({
        data: {
          actorId:
            actor.id,

          action:
            "CONTEST_WINNER_DRAWN",

          entityType:
            "Contest",

          entityId:
            contest.id,

          metadata:
            toInputJsonValue({
              actorName:
                actor.displayName,

              reason:
                input.reason,

              participantId:
                selectedParticipant.id,

              winnerUserId:
                selectedParticipant.userId,

              winnerName,

              drawMode:
                input.participantId
                  ? "MANUAL_SELECTION"
                  : "SECURE_RANDOM_DRAW",

              eligibleParticipants:
                contest.participants
                  .length,
            }),
        },
      });

      return {
        contestId:
          contest.id,

        participantId:
          selectedParticipant.id,

        userId:
          selectedParticipant.userId,

        winnerName,
      };
    },
    {
      isolationLevel:
        "Serializable",
    },
  );
}
