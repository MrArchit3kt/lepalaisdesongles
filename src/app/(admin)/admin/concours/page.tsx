import {
  AdminContestsDashboard,
} from "@/features/admin/contests/components/admin-contests-dashboard";

import {
  getAdminContestsDashboardData,
} from "@/features/admin/contests/services/admin-contests-dashboard.service";

import {
  requireAdminUser,
} from "@/lib/session";

export const dynamic =
  "force-dynamic";

export const revalidate =
  0;

export default async function AdminContestsPage() {
  await requireAdminUser();

  const data =
    await getAdminContestsDashboardData();

  return (
    <AdminContestsDashboard
      data={data}
    />
  );
}
