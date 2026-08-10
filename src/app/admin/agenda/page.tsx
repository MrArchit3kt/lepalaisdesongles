import Link from "next/link";

import {
  CalendarClock,
  CalendarOff,
  Clock3,
  UsersRound,
} from "lucide-react";

import {
  AdminCalendarClient,
} from "@/features/admin/calendar/components/admin-calendar-client";
import {
  AdminCalendarSyncDialog,
} from "@/features/admin/calendar/components/admin-calendar-sync-dialog";

import {
  requireAdminUser,
} from "@/lib/session";

/* -------------------------------------------------------------------------- */
/*                                CONFIGURATION                               */
/* -------------------------------------------------------------------------- */

export const dynamic =
  "force-dynamic";

export const runtime =
  "nodejs";

/* -------------------------------------------------------------------------- */
/*                                    PAGE                                    */
/* -------------------------------------------------------------------------- */

export default async function AdminAgendaPage() {
  await requireAdminUser();

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-pink-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1700px]">
        <header className="mb-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-rose-600">
                Administration
              </p>

              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-5xl">
                Agenda professionnel
              </h1>

              <p className="mt-3 max-w-3xl text-zinc-600">
                Consultez les rendez-vous, les horaires, les pauses,
                les absences et les fermetures du salon depuis un seul
                planning.
              </p>
            </div>

            <nav
              aria-label="Actions rapides de l’agenda"
              className="flex flex-wrap gap-2"
            >
              <QuickLink
                href="/admin/rendez-vous"
                label="Rendez-vous"
                icon={
                  <CalendarClock className="size-4" />
                }
              />

              <QuickLink
                href="/admin/horaires/equipe"
                label="Horaires équipe"
                icon={
                  <UsersRound className="size-4" />
                }
              />

              <QuickLink
                href="/admin/horaires"
                label="Horaires salon"
                icon={
                  <Clock3 className="size-4" />
                }
              />

              <QuickLink
                href="/admin/horaires/exceptions"
                label="Absences et fermetures"
                icon={
                  <CalendarOff className="size-4" />
                }
              />

              <AdminCalendarSyncDialog />
            </nav>
          </div>
        </header>

        <AdminCalendarClient />
      </div>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/*                              QUICK LINK                                    */
/* -------------------------------------------------------------------------- */

function QuickLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-full border border-pink-100 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 shadow-sm transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
    >
      {icon}

      <span>
        {label}
      </span>
    </Link>
  );
}
