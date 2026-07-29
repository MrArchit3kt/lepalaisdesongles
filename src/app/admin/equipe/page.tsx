import {
  TeamClient,
} from "@/features/admin/team/components/team-client";

import {
  requireAdminUser,
} from "@/lib/session";

/* -------------------------------------------------------------------------- */
/*                                CONFIGURATION                               */
/* -------------------------------------------------------------------------- */

export const dynamic =
  "force-dynamic";

/* -------------------------------------------------------------------------- */
/*                                    PAGE                                    */
/* -------------------------------------------------------------------------- */

export default async function AdminTeamPage() {
  await requireAdminUser();

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-pink-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px]">
        <TeamClient />
      </div>
    </main>
  );
}
