import {
  AdminVipClient,
} from "@/features/admin/vip/components/admin-vip-client";

import {
  getAdminVipDashboardData,
} from "@/features/admin/vip/services/admin-vip-dashboard.service";

import {
  requireAdminUser,
} from "@/lib/session";

export const dynamic =
  "force-dynamic";

export const revalidate =
  0;

export default async function AdminVipPage() {
  await requireAdminUser();

  const data =
    await getAdminVipDashboardData();

  return (
    <AdminVipClient
      initialData={data}
    />
  );
}
