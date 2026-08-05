import type { ReactNode } from "react";

import { AdminNavigation } from "@/features/admin/navigation/admin-navigation";

import { getUnreadConversationCount } from "@/features/messages/services/conversation.service";

import { requireAdminUser } from "@/lib/session";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type AdminGroupLayoutProps = {
  children: ReactNode;
};

/* -------------------------------------------------------------------------- */
/*                                CONFIGURATION                               */
/* -------------------------------------------------------------------------- */

export const dynamic = "force-dynamic";

/* -------------------------------------------------------------------------- */
/*                                   LAYOUT                                   */
/* -------------------------------------------------------------------------- */

export default async function AdminGroupLayout({
  children,
}: AdminGroupLayoutProps) {
  const user = await requireAdminUser();

  const unreadMessageCount = await getUnreadConversationCount(user.id);

  return (
    <AdminNavigation
      user={{
        firstName: user.firstName?.trim() || "Administrateur",
        lastName: user.lastName?.trim() || "",
        email: user.email?.trim() || "",
        image: user.image ?? null,
      }}
      unreadMessageCount={unreadMessageCount}
    >
      {children}
    </AdminNavigation>
  );
}
