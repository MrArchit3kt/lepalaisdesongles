import bcrypt from "bcryptjs";

import {
  prisma,
} from "@/lib/prisma";

import {
  registerSchema,
} from "@/features/auth/schemas/register.schema";

import {
  getReferralLinkPreview,
} from "@/features/vip/services/referral-link.service";

export class EmailAlreadyUsedError
  extends Error {
  constructor() {
    super(
      "Un compte existe déjà avec cette adresse e-mail.",
    );

    this.name =
      "EmailAlreadyUsedError";
  }
}

export async function registerClient(
  input: unknown,
) {
  const validatedData =
    registerSchema.parse(
      input,
    );

  const [
    existingUser,
    referral,
    passwordHash,
  ] =
    await Promise.all([
      prisma.user.findUnique({
        where: {
          email:
            validatedData.email,
        },

        select: {
          id:
            true,
        },
      }),

      validatedData.referralToken
        ? getReferralLinkPreview(
            validatedData.referralToken,
          )
        : Promise.resolve(
            null,
          ),

      bcrypt.hash(
        validatedData.password,
        12,
      ),
    ]);

  if (
    existingUser
  ) {
    throw new EmailAlreadyUsedError();
  }

  return prisma.$transaction(
    async (
      transaction,
    ) => {
      const registeredAt =
        new Date();

      const user =
        await transaction.user.create({
          data: {
            email:
              validatedData.email,

            passwordHash,

            firstName:
              validatedData.firstName,

            lastName:
              validatedData.lastName,

            phone:
              validatedData.phone,

            role:
              "CLIENT",

            status:
              "ACTIVE",

            clientProfile: {
              create: {
                marketingEmail:
                  validatedData
                    .marketingConsent,

                marketingSms:
                  false,
              },
            },
          },

          select: {
            id:
              true,

            email:
              true,

            firstName:
              true,

            lastName:
              true,

            phone:
              true,

            role:
              true,

            status:
              true,

            createdAt:
              true,
          },
        });

      let referralId:
        string | null =
        null;

      if (
        referral &&
        referral.referrerUserId !==
          user.id
      ) {
        const createdReferral =
          await transaction.referral.create({
            data: {
              referrerId:
                referral.referrerUserId,

              referredUserId:
                user.id,

              referredEmail:
                user.email,

              referredFirstName:
                user.firstName,

              referredLastName:
                user.lastName,

              referredPhone:
                user.phone,

              referralCode:
                referral.token,

              invitationUrl:
                `/inscription?ref=${encodeURIComponent(
                  referral.token,
                )}`,

              status:
                "REGISTERED",

              registeredAt,

              source:
                "REFERRAL_LINK",

              metadata: {
                automatic:
                  true,

                registrationSource:
                  "WEBSITE",

                referrerDisplayName:
                  referral
                    .referrerDisplayName,
              },
            },

            select: {
              id:
                true,
            },
          });

        referralId =
          createdReferral.id;

        await transaction.notification.create({
          data: {
            userId:
              referral
                .referrerUserId,

            type:
              "SYSTEM",

            title:
              "Nouvelle filleule inscrite",

            message:
              `${user.firstName} a créé son compte grâce à votre lien de parrainage.`,

            actionUrl:
              "/espace-client/fidelite",

            metadata: {
              referralId:
                createdReferral.id,

              referredUserId:
                user.id,
            },
          },
        });

        await transaction.notification.create({
          data: {
            userId:
              user.id,

            type:
              "SYSTEM",

            title:
              "Parrainage enregistré",

            message:
              `Votre invitation de ${referral.referrerFirstName} a bien été prise en compte.`,

            actionUrl:
              "/espace-client/fidelite",

            metadata: {
              referralId:
                createdReferral.id,

              referrerUserId:
                referral
                  .referrerUserId,
            },
          },
        });
      }

      await transaction.auditLog.create({
        data: {
          actorId:
            user.id,

          action:
            "CLIENT_REGISTERED",

          entityType:
            "User",

          entityId:
            user.id,

          metadata: {
            source:
              "website",

            referralId,

            referredBy:
              referral
                ?.referrerUserId ??
              null,

            referralToken:
              referral
                ?.token ??
              null,
          },
        },
      });

      await transaction.notification.create({
        data: {
          userId:
            user.id,

          type:
            "SYSTEM",

          title:
            "Bienvenue au Palais des Ongles",

          message:
            "Votre compte a bien été créé. Vous pouvez désormais réserver vos prestations et suivre vos rendez-vous.",

          actionUrl:
            "/espace-client",
        },
      });

      return user;
    },
  );
}
