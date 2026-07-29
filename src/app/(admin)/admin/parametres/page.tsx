import {
  AdminSettingsClient,
} from "@/features/admin/settings/components/admin-settings-client";

import {
  getAdminSettings,
} from "@/features/admin/settings/services/admin-settings.service";

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

  const settings =
    await getAdminSettings();

  return (
    <AdminSettingsClient
      initialData={settings}
    />
  );
}
