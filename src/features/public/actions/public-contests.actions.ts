"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  getCurrentUser,
} from "@/lib/session";

import {
  prisma,
} from "@/lib/prisma";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

export type PublicContestParticipationActionResult = {
  success: boolean;

  message: string;

  requiresAuthentication?: boolean;

  alreadyParticipating?: boolean;
};

/* -------------------------------------------------------------------------- */
/*                                  ACTION                                    */
/* -------------------------------------------------------------------------- */

export async function joinPublicContestAction(
  contestId: string,
): Promise<PublicContestParticipationActionResult> {
  const normalizedContestId =
    contestId.trim();

  if (
    !normalizedContestId
  ) {
    return {
      success:
        false,

      message:
        "Le concours est introuvable.",
    };
  }

  const user =
    await getCurrentUser();

  if (
    !user
  ) {
    return {
      success:
        false,

      message:
        "Connectez-vous à votre compte pour participer.",

      requiresAuthentication:
        true,
    };
  }

  if (
    user.status !==
      "ACTIVE" ||
    user.role !==
      "CLIENT"
  ) {
    return {
      success:
        false,

      message:
        "Seuls les comptes clientes actifs peuvent participer.",
    };
  }

  try {
    const result =
      await prisma.$transaction(
        async (
          transaction,
        ) => {
          const contest =
            await transaction.contest.findUnique({
              where: {
                id:
                  normalizedContestId,
              },

              select: {
                id:
                  true,

                slug:
                  true,

                status:
                  true,

                startsAt:
                  true,

                endsAt:
                  true,

                maximumEntries:
                  true,

                requiresAccount:
                  true,

                _count: {
                  select: {
                    participants:
                      true,
                  },
                },

                participants: {
                  where: {
                    userId:
                      user.id,
                  },

                  select: {
                    id:
                      true,
                  },

                  take:
                    1,
                },
              },
            });

          if (
            !contest
          ) {
            return {
              success:
                false,

              message:
                "Le concours est introuvable.",
            };
          }

          const now =
            new Date();

          if (
            contest.status !==
              "ACTIVE" ||
            contest.startsAt >
              now ||
            contest.endsAt <
              now
          ) {
            return {
              success:
                false,

              message:
                "Ce concours n’est pas ouvert aux participations.",
            };
          }

          if (
            contest.participants.length >
            0
          ) {
            return {
              success:
                false,

              message:
                "Vous participez déjà à ce concours.",

              alreadyParticipating:
                true,
            };
          }

          if (
            contest.maximumEntries !==
              null &&
            contest._count
              .participants >=
              contest.maximumEntries
          ) {
            return {
              success:
                false,

              message:
                "Le nombre maximal de participations est atteint.",
            };
          }

          await transaction.contestParticipant.create({
            data: {
              contestId:
                contest.id,

              userId:
                user.id,
            },
          });

          await transaction.notification.create({
            data: {
              userId:
                user.id,

              type:
                "SYSTEM",

              title:
                "Participation enregistrée",

              message:
                "Votre participation au concours a bien été enregistrée.",

              actionUrl:
                `/concours/${contest.slug}`,
            },
          });

          return {
            success:
              true,

            message:
              "Votre participation a bien été enregistrée.",
          };
        },
      );

    if (
      result.success
    ) {
      revalidatePath(
        "/concours",
      );

      revalidatePath(
        "/espace-client",
      );
    }

    return result;
  } catch (
    error: unknown
  ) {
    console.error(
      "[PUBLIC_CONTEST_PARTICIPATION]",
      error,
    );

    return {
      success:
        false,

      message:
        "Une erreur est survenue pendant l’enregistrement de votre participation.",
    };
  }
}
