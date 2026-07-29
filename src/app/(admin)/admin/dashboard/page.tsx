import {
  AdminDashboard,
} from "@/features/admin/dashboard/components/admin-dashboard";

import {
  getAdminDashboardData,
} from "@/features/admin/dashboard/services/admin-dashboard.service";

import {
  getRoleLabel,
} from "@/lib/roles";

import {
  requireAdminUser,
} from "@/lib/session";

/* -------------------------------------------------------------------------- */
/*                                CONFIGURATION                               */
/* -------------------------------------------------------------------------- */

export const dynamic =
  "force-dynamic";

export const revalidate =
  0;

/* -------------------------------------------------------------------------- */
/*                                   PAGE                                     */
/* -------------------------------------------------------------------------- */

export default async function AdminDashboardPage() {
  const user =
    await requireAdminUser();

  const data =
    await getAdminDashboardData(
      user.id,
    );

  return (
    <AdminDashboard
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

        roleLabel:
          getRoleLabel(
            user.role,
          ),
      }}
      data={data}
    />
  );
}
