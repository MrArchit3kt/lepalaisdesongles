import {
  AdminSettingsClient,
} from "@/features/admin/settings/components/admin-settings-client";

import {
  getAdminSettings,
} from "@/features/admin/settings/services/admin-settings.service";

import {
  isPushNotificationsEnabled,
} from "@/features/push/services/push-settings.service";

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

export default async function AdminSettingsPage() {
  await requireAdminUser();

  const [settings, pushEnabled] = await Promise.all([
    getAdminSettings(),
    isPushNotificationsEnabled(),
  ]);

  return (
    <AdminSettingsClient
      initialData={settings}
      initialPushEnabled={pushEnabled}
    />
  );
}
