import type {
  ReactNode,
} from "react";

import {
  AdminNavigation,
} from "@/features/admin/navigation/admin-navigation";

import {
  requireAdminUser,
} from "@/lib/session";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type AdminGroupLayoutProps = {
  children: ReactNode;
};

/* -------------------------------------------------------------------------- */
/*                                CONFIGURATION                               */
/* -------------------------------------------------------------------------- */

export const dynamic =
  "force-dynamic";

/* -------------------------------------------------------------------------- */
/*                                   LAYOUT                                   */
/* -------------------------------------------------------------------------- */

export default async function AdminGroupLayout({
  children,
}: AdminGroupLayoutProps) {
  const user =
    await requireAdminUser();

  return (
    <AdminNavigation
      user={{
        firstName:
          user.firstName?.trim() ||
          "Administrateur",

        lastName:
          user.lastName?.trim() ||
          "",

        email:
          user.email?.trim() ||
          "",

        image:
          user.image ?? null,
      }}
    >
      {children}
    </AdminNavigation>
  );
}
