import "server-only";

import {
  prisma,
} from "@/lib/prisma";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

export type ClientVipProgramStatus =
  | "DISABLED"
  | "PRE_LAUNCH"
  | "ACTIVE"
  | "PAUSED";

export type ClientVipAccessMode =
  | "DASHBOARD"
  | "PAUSED"
  | "PRE_LAUNCH"
  | "UNAVAILABLE";

export type ClientVipAccessState = {
  mode: ClientVipAccessMode;

  programStatus: ClientVipProgramStatus;

  clubEnabled: boolean;
  showInClientMenu: boolean;
  showPreLaunchPage: boolean;
  allowNewRegistrations: boolean;

  hasAccount: boolean;
  accountId: string | null;

  accountIsActive: boolean;
  accountIsSuspended: boolean;

  canInitializeAccount: boolean;
  canViewDashboard: boolean;
  shouldShowNavigation: boolean;
  isReadOnly: boolean;

  branding: {
    clubName: string;

    preLaunchTitle: string | null;
    preLaunchDescription: string | null;
    preLaunchImageUrl: string | null;
    preLaunchButtonLabel: string | null;
    preLaunchButtonUrl: string | null;
  };
};

/* -------------------------------------------------------------------------- */
/*                                  SERVICE                                   */
/* -------------------------------------------------------------------------- */

export async function getClientVipAccessState(
  userId: string,
): Promise<ClientVipAccessState> {
  const normalizedUserId =
    userId.trim();

  if (!normalizedUserId) {
    throw new Error(
      "L’identifiant de la cliente est obligatoire.",
    );
  }

  const [
    configuration,
    account,
  ] =
    await Promise.all([
      prisma.vipConfiguration.findUnique({
        where: {
          key:
            "default",
        },

        select: {
          programStatus:
            true,

          clubEnabled:
            true,

          showInClientMenu:
            true,

          showPreLaunchPage:
            true,

          allowNewRegistrations:
            true,

          clubName:
            true,

          preLaunchTitle:
            true,

          preLaunchDescription:
            true,

          preLaunchImageUrl:
            true,

          preLaunchButtonLabel:
            true,

          preLaunchButtonUrl:
            true,
        },
      }),

      prisma.loyaltyAccount.findUnique({
        where: {
          userId:
            normalizedUserId,
        },

        select: {
          id:
            true,

          isActive:
            true,

          isSuspended:
            true,
        },
      }),
    ]);

  const programStatus =
    configuration
      ?.programStatus ??
    "DISABLED";

  const clubEnabled =
    configuration
      ?.clubEnabled ??
    false;

  const showInClientMenu =
    configuration
      ?.showInClientMenu ??
    false;

  const showPreLaunchPage =
    configuration
      ?.showPreLaunchPage ??
    false;

  const allowNewRegistrations =
    configuration
      ?.allowNewRegistrations ??
    false;

  const hasAccount =
    account !==
    null;

  const accountIsActive =
    account
      ?.isActive ??
    false;

  const accountIsSuspended =
    account
      ?.isSuspended ??
    false;

  /*
   * Un nouveau compte n’est créé que lorsque le programme est réellement
   * actif, que le club est activé et que les nouvelles inscriptions sont
   * autorisées.
   */
  const canInitializeAccount =
    !hasAccount &&
    programStatus ===
      "ACTIVE" &&
    clubEnabled &&
    allowNewRegistrations;

  /*
   * Un membre déjà inscrit conserve un accès en lecture lorsque le programme
   * est temporairement en pause. Un programme complètement désactivé ne doit
   * plus être accessible.
   */
  const existingMemberCanView =
    hasAccount &&
    programStatus !==
      "DISABLED";

  const canViewDashboard =
    existingMemberCanView ||
    canInitializeAccount;

  const canViewPreLaunchPage =
    !hasAccount &&
    programStatus ===
      "PRE_LAUNCH" &&
    showPreLaunchPage;

  const isReadOnly =
    programStatus !==
      "ACTIVE" ||
    !clubEnabled ||
    !accountIsActive ||
    accountIsSuspended;

  let mode: ClientVipAccessMode =
    "UNAVAILABLE";

  if (
    canViewDashboard
  ) {
    mode =
      programStatus ===
        "ACTIVE" &&
      clubEnabled
        ? "DASHBOARD"
        : "PAUSED";
  } else if (
    canViewPreLaunchPage
  ) {
    mode =
      "PRE_LAUNCH";
  }

  const shouldShowNavigation =
    showInClientMenu &&
    (
      canViewDashboard ||
      canViewPreLaunchPage
    );

  return {
    mode,

    programStatus,

    clubEnabled,
    showInClientMenu,
    showPreLaunchPage,
    allowNewRegistrations,

    hasAccount,

    accountId:
      account?.id ??
      null,

    accountIsActive,
    accountIsSuspended,

    canInitializeAccount,
    canViewDashboard,
    shouldShowNavigation,
    isReadOnly,

    branding: {
      clubName:
        configuration
          ?.clubName ??
        "Club VIP Le Palais des Ongles",

      preLaunchTitle:
        configuration
          ?.preLaunchTitle ??
        null,

      preLaunchDescription:
        configuration
          ?.preLaunchDescription ??
        null,

      preLaunchImageUrl:
        configuration
          ?.preLaunchImageUrl ??
        null,

      preLaunchButtonLabel:
        configuration
          ?.preLaunchButtonLabel ??
        null,

      preLaunchButtonUrl:
        configuration
          ?.preLaunchButtonUrl ??
        null,
    },
  };
}
