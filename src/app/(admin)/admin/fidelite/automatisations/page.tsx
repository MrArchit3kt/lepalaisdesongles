import {
  AdminVipAppointmentRulesManager,
} from "@/features/admin/vip/components/admin-vip-appointment-rules-manager";

import {
  getAdminVipAppointmentRulesSettings,
} from "@/features/admin/vip/services/admin-vip-appointment-rules.service";

import {
  requireAdminUser,
} from "@/lib/session";

export const dynamic =
  "force-dynamic";

export const revalidate =
  0;

export default async function AdminVipAutomationsPage() {
  await requireAdminUser();

  const settings =
    await getAdminVipAppointmentRulesSettings();

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1400px]">
        <AdminVipAppointmentRulesManager
          settings={settings}
        />
      </div>
    </main>
  );
}
