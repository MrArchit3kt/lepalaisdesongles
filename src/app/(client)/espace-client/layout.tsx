import type { ReactNode } from "react";

import {
  ClientSpaceNavigation,
  type ClientNavigationItem,
} from "@/features/client/navigation/client-space-navigation";

import { getUnreadConversationCount } from "@/features/messages/services/conversation.service";

import { getClientVipAccessState } from "@/features/vip/services/client-vip-access.service";

import { prisma } from "@/lib/prisma";

import { requireClientUser } from "@/lib/session";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type ClientSpaceLayoutProps = {
  children: ReactNode;
};

/* -------------------------------------------------------------------------- */
/*                                CONFIGURATION                               */
/* -------------------------------------------------------------------------- */

export const dynamic = "force-dynamic";

/* -------------------------------------------------------------------------- */
/*                                   LAYOUT                                   */
/* -------------------------------------------------------------------------- */

export default async function ClientSpaceLayout({
  children,
}: ClientSpaceLayoutProps) {
  const user = await requireClientUser();

  const [vipAccess, unreadNotificationCount, unreadMessageCount] =
    await Promise.all([
      getClientVipAccessState(user.id),

      prisma.notification.count({
        where: {
          userId: user.id,
          readAt: null,
        },
      }),

      getUnreadConversationCount(user.id),
    ]);

  const navigation: ClientNavigationItem[] = [
    {
      label: "Accueil",
      href: "/espace-client",
      icon: "HOME",
      exact: true,
    },
    {
      label: "Rendez-vous",
      href: "/espace-client/rendez-vous",
      icon: "APPOINTMENTS",
    },
    {
      label: "Messages",
      href: "/espace-client/messages",
      icon: "MESSAGES",
      badge: unreadMessageCount,
    },

    ...(vipAccess.shouldShowNavigation
      ? [
          {
            label: "Club VIP",
            href: "/espace-client/fidelite",
            icon: "VIP" as const,
          },
        ]
      : []),

    {
      label: "Notifications",
      href: "/espace-client/notifications",
      icon: "NOTIFICATIONS",
      badge: unreadNotificationCount,
    },
  ];

  return (
    <ClientSpaceNavigation
      user={{
        firstName: user.firstName?.trim() || "Cliente",
        lastName: user.lastName?.trim() || "",
        email: user.email?.trim() || "",
      }}
      navigation={navigation}
    >
      {children}
    </ClientSpaceNavigation>
  );
}
