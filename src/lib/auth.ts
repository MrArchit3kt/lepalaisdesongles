import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import {
  shouldUseSecureAuthCookies,
} from "@/lib/auth-cookie-policy";

import { loginSchema } from "@/features/auth/schemas/login.schema";
import { prisma } from "@/lib/prisma";
import {
  clearSecurityRateLimit,
  getClientIpAddress,
  getSecurityRateLimitStatus,
  registerSecurityRateLimitFailure,
  type SecurityRateLimitOptions,
} from "@/lib/security/rate-limit";

/* -------------------------------------------------------------------------- */
/*                         POLITIQUES DE CONNEXION                             */
/* -------------------------------------------------------------------------- */

const LOGIN_WINDOW_MS =
  15 * 60 * 1000;

const LOGIN_BLOCK_MS =
  30 * 60 * 1000;

const LOGIN_IP_MAX_ATTEMPTS =
  20;

const LOGIN_ACCOUNT_MAX_ATTEMPTS =
  5;

const SESSION_MAX_AGE_SECONDS =
  12 * 60 * 60;

/*
 * Ce hash sert uniquement à effectuer une comparaison
 * bcrypt lorsqu’une adresse e-mail n’existe pas.
 *
 * Cela réduit les différences de temps de réponse
 * permettant de deviner si un compte existe.
 */
const DUMMY_PASSWORD_HASH =
  bcrypt.hashSync(
    "nailstudio-invalid-password-sentinel",
    12,
  );

function createLoginIpLimit(
  ipAddress: string,
): SecurityRateLimitOptions {
  return {
    action:
      "AUTH_LOGIN_IP",

    subject:
      ipAddress,

    maxAttempts:
      LOGIN_IP_MAX_ATTEMPTS,

    windowMs:
      LOGIN_WINDOW_MS,

    blockMs:
      LOGIN_BLOCK_MS,
  };
}

function createLoginAccountLimit(
  email: string,
): SecurityRateLimitOptions {
  return {
    action:
      "AUTH_LOGIN_ACCOUNT",

    subject:
      email,

    maxAttempts:
      LOGIN_ACCOUNT_MAX_ATTEMPTS,

    windowMs:
      LOGIN_WINDOW_MS,

    blockMs:
      LOGIN_BLOCK_MS,
  };
}

async function registerFailedLogin(
  ipLimit:
    SecurityRateLimitOptions,

  accountLimit?:
    SecurityRateLimitOptions,
): Promise<void> {
  const operations = [
    registerSecurityRateLimitFailure(
      ipLimit,
    ),
  ];

  if (
    accountLimit
  ) {
    operations.push(
      registerSecurityRateLimitFailure(
        accountLimit,
      ),
    );
  }

  await Promise.allSettled(
    operations,
  );
}

async function clearLoginAccountLimit(
  accountLimit:
    SecurityRateLimitOptions,
): Promise<void> {
  await clearSecurityRateLimit({
    action:
      accountLimit.action,

    subject:
      accountLimit.subject,
  });
}

/* -------------------------------------------------------------------------- */
/*                           CONFIGURATION NEXTAUTH                            */
/* -------------------------------------------------------------------------- */

export const authOptions: NextAuthOptions = {
  secret:
    process.env.AUTH_SECRET ??
    process.env.NEXTAUTH_SECRET,

  debug:
    false,

  useSecureCookies:
    shouldUseSecureAuthCookies(),

  session: {
    strategy:
      "jwt",

    maxAge:
      SESSION_MAX_AGE_SECONDS,

    updateAge:
      60 * 60,
  },

  jwt: {
    maxAge:
      SESSION_MAX_AGE_SECONDS,
  },

  pages: {
    signIn:
      "/connexion",

    error:
      "/connexion",
  },

  providers: [
    CredentialsProvider({
      name:
        "E-mail et mot de passe",

      credentials: {
        email: {
          label:
            "Adresse e-mail",

          type:
            "email",

          placeholder:
            "cliente@exemple.fr",
        },

        password: {
          label:
            "Mot de passe",

          type:
            "password",
        },
      },

      async authorize(
        credentials,
        request,
      ) {
        const ipAddress =
          getClientIpAddress(
            request.headers ?? {},
          );

        const ipLimit =
          createLoginIpLimit(
            ipAddress,
          );

        const ipStatus =
          await getSecurityRateLimitStatus(
            ipLimit,
          );

        /*
         * On ne consulte même pas la base utilisateur
         * lorsque l’adresse IP est déjà bloquée.
         */
        if (
          !ipStatus.allowed
        ) {
          return null;
        }

        const parsedCredentials =
          loginSchema.safeParse(
            credentials,
          );

        if (
          !parsedCredentials.success
        ) {
          await registerFailedLogin(
            ipLimit,
          );

          return null;
        }

        const {
          email,
          password,
        } =
          parsedCredentials.data;

        const accountLimit =
          createLoginAccountLimit(
            email,
          );

        const accountStatus =
          await getSecurityRateLimitStatus(
            accountLimit,
          );

        if (
          !accountStatus.allowed
        ) {
          /*
           * Même lorsqu’un compte est bloqué,
           * la tentative compte aussi pour l’IP.
           */
          await registerSecurityRateLimitFailure(
            ipLimit,
          );

          return null;
        }

        const user =
          await prisma.user.findUnique({
            where: {
              email,
            },

            select: {
              id:
                true,

              email:
                true,

              passwordHash:
                true,

              firstName:
                true,

              lastName:
                true,

              image:
                true,

              role:
                true,

              status:
                true,

              authVersion:
                true,
            },
          });

        /*
         * Une comparaison bcrypt est toujours exécutée,
         * que l’utilisateur existe ou non.
         */
        const passwordIsValid =
          await bcrypt.compare(
            password,
            user?.passwordHash ??
              DUMMY_PASSWORD_HASH,
          );

        if (
          !user ||
          !user.passwordHash ||
          user.status !==
            "ACTIVE" ||
          !passwordIsValid
        ) {
          await registerFailedLogin(
            ipLimit,
            accountLimit,
          );

          return null;
        }

        /*
         * Une réussite efface uniquement les échecs
         * liés au compte. Le compteur IP reste intact
         * afin qu’un attaquant ne puisse pas le remettre
         * à zéro avec son propre compte.
         */
        await clearLoginAccountLimit(
          accountLimit,
        );

        await prisma.user.update({
          where: {
            id:
              user.id,
          },

          data: {
            lastLoginAt:
              new Date(),
          },
        });

        return {
          id:
            user.id,

          email:
            user.email,

          name:
            `${user.firstName} ${user.lastName}`,

          image:
            user.image,

          firstName:
            user.firstName,

          lastName:
            user.lastName,

          role:
            user.role,

          status:
            user.status,

          authVersion:
            user.authVersion,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({
      token,
      user,
    }) {
      /*
       * Lors de la connexion initiale, les informations
       * fiables viennent directement de authorize().
       */
      if (
        user
      ) {
        token.id =
          user.id;

        token.firstName =
          user.firstName;

        token.lastName =
          user.lastName;

        token.role =
          user.role;

        token.status =
          user.status;

        token.authVersion =
          user.authVersion;

        token.sessionInvalidated =
          false;

        return token;
      }

      /*
       * Les anciens JWT créés avant l’ajout d’authVersion
       * sont volontairement invalidés.
       */
      if (
        !token.id ||
        typeof token.authVersion !==
          "number"
      ) {
        token.id =
          "";

        token.status =
          "DISABLED";

        token.authVersion =
          -1;

        token.sessionInvalidated =
          true;

        return token;
      }

      /*
       * Cette lecture en base rend la révocation immédiate :
       * changement de mot de passe, rôle, statut ou e-mail.
       */
      const currentUser =
        await prisma.user.findUnique({
          where: {
            id:
              token.id,
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

            image:
              true,

            role:
              true,

            status:
              true,

            authVersion:
              true,
          },
        });

      if (
        !currentUser ||
        currentUser.status !==
          "ACTIVE" ||
        currentUser.authVersion !==
          token.authVersion
      ) {
        token.id =
          "";

        token.status =
          "DISABLED";

        token.authVersion =
          -1;

        token.sessionInvalidated =
          true;

        return token;
      }

      /*
       * Pour une session toujours valide, les données
       * d’autorisation sont rafraîchies depuis la base.
       */
      token.id =
        currentUser.id;

      token.email =
        currentUser.email;

      token.name =
        `${currentUser.firstName} ${currentUser.lastName}`;

      token.picture =
        currentUser.image;

      token.firstName =
        currentUser.firstName;

      token.lastName =
        currentUser.lastName;

      token.role =
        currentUser.role;

      token.status =
        currentUser.status;

      token.authVersion =
        currentUser.authVersion;

      token.sessionInvalidated =
        false;

      return token;
    },

    async session({
      session,
      token,
    }) {
      if (
        session.user
      ) {
        session.user.id =
          token.id;

        session.user.firstName =
          token.firstName;

        session.user.lastName =
          token.lastName;

        session.user.role =
          token.role;

        session.user.status =
          token.status;

        session.user.authVersion =
          token.authVersion;

        session.user.sessionInvalidated =
          token.sessionInvalidated ===
          true;
      }

      return session;
    },

    async redirect({
      url,
      baseUrl,
    }) {
      if (
        url.startsWith(
          "/",
        )
      ) {
        return `${baseUrl}${url}`;
      }

      try {
        if (
          new URL(
            url,
          ).origin ===
          new URL(
            baseUrl,
          ).origin
        ) {
          return url;
        }
      } catch {
        return baseUrl;
      }

      return baseUrl;
    },
  },

  events: {
    async signIn({
      user,
    }) {
      if (
        !user.id
      ) {
        return;
      }

      await prisma.auditLog.create({
        data: {
          actorId:
            user.id,

          action:
            "AUTH_SIGN_IN",

          entityType:
            "User",

          entityId:
            user.id,
        },
      });
    },

    async signOut({
      token,
    }) {
      if (
        !token?.id
      ) {
        return;
      }

      await prisma.auditLog.create({
        data: {
          actorId:
            token.id,

          action:
            "AUTH_SIGN_OUT",

          entityType:
            "User",

          entityId:
            token.id,
        },
      });
    },
  },
};
