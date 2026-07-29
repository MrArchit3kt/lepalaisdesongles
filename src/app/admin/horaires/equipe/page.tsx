import {
  CalendarClock,
  Clock3,
  Info,
  Sparkles,
  UsersRound,
} from "lucide-react";

import {
  StaffHoursClient,
} from "@/features/admin/staff-hours/staff-hours-client";

import {
  getStaffHours,
  getStaffMembers,
} from "@/features/admin/staff-hours/staff-hours";

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

export default async function AdminStaffHoursPage() {
  await requireAdminUser();

  const staff =
    await getStaffMembers();

  const initialStaffId =
    staff[0]?.id ?? null;

  const initialHours =
    initialStaffId
      ? await getStaffHours(
          initialStaffId,
        )
      : [];

  const activeOnlineCount =
    staff.filter(
      (member) =>
        member.acceptsOnlineBooking,
    ).length;

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-pink-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px] space-y-7">
        {/* ---------------------------------------------------------------- */}
        {/*                              HEADER                              */}
        {/* ---------------------------------------------------------------- */}

        <header className="overflow-hidden rounded-[32px] border border-rose-100 bg-gradient-to-br from-white via-rose-50/60 to-pink-100/60 p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-start gap-4">
              <span className="grid size-14 shrink-0 place-items-center rounded-3xl bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-200">
                <CalendarClock className="size-7" />
              </span>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#bd4b73]">
                  Disponibilités
                </p>

                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
                  Horaires de l’équipe
                </h1>

                <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-600 sm:text-base">
                  Définissez les jours
                  travaillés, les horaires
                  et les pauses de chaque
                  professionnelle du
                  salon.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <HeaderStat
                icon={UsersRound}
                value={staff.length}
                label="Professionnelles actives"
              />

              <HeaderStat
                icon={Sparkles}
                value={
                  activeOnlineCount
                }
                label="Réservables en ligne"
              />
            </div>
          </div>
        </header>

        {/* ---------------------------------------------------------------- */}
        {/*                           INFORMATION                            */}
        {/* ---------------------------------------------------------------- */}

        <section className="grid gap-4 lg:grid-cols-3">
          <InformationCard
            icon={Clock3}
            title="Horaires personnalisés"
            description="Les horaires enregistrés ici remplacent ceux du salon pour la professionnelle sélectionnée."
          />

          <InformationCard
            icon={CalendarClock}
            title="Calcul des créneaux"
            description="Les disponibilités en ligne tiennent automatiquement compte des heures et des pauses."
          />

          <InformationCard
            icon={Info}
            title="Horaires du salon"
            description="En l’absence de configuration individuelle, les horaires généraux du salon sont utilisés."
          />
        </section>

        {/* ---------------------------------------------------------------- */}
        {/*                            NO STAFF                              */}
        {/* ---------------------------------------------------------------- */}

        {staff.length === 0 ? (
          <section className="grid min-h-96 place-items-center rounded-[32px] border border-dashed border-rose-300 bg-white p-8 text-center shadow-sm">
            <div className="max-w-lg">
              <span className="mx-auto grid size-16 place-items-center rounded-3xl bg-rose-50 text-[#bd4b73]">
                <UsersRound className="size-8" />
              </span>

              <h2 className="mt-5 text-xl font-semibold text-zinc-950">
                Aucune professionnelle active
              </h2>

              <p className="mt-3 text-sm leading-6 text-zinc-600">
                Ajoutez ou activez une
                professionnelle depuis la
                page Équipe avant de
                configurer ses horaires.
              </p>
            </div>
          </section>
        ) : (
          <StaffHoursClient
            staff={staff}
            initialStaffId={
              initialStaffId
            }
            initialHours={
              initialHours
            }
          />
        )}
      </div>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/*                              HEADER STAT                                   */
/* -------------------------------------------------------------------------- */

type HeaderStatProps = {
  icon: typeof UsersRound;
  value: number;
  label: string;
};

function HeaderStat({
  icon: Icon,
  value,
  label,
}: HeaderStatProps) {
  return (
    <div className="flex min-w-48 items-center gap-3 rounded-2xl border border-white/80 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
      <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-rose-50 text-[#bd4b73]">
        <Icon className="size-5" />
      </span>

      <div>
        <p className="text-xl font-semibold text-zinc-950">
          {value}
        </p>

        <p className="text-xs text-zinc-500">
          {label}
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                           INFORMATION CARD                                 */
/* -------------------------------------------------------------------------- */

type InformationCardProps = {
  icon: typeof Clock3;
  title: string;
  description: string;
};

function InformationCard({
  icon: Icon,
  title,
  description,
}: InformationCardProps) {
  return (
    <article className="flex items-start gap-4 rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
      <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-rose-50 text-[#bd4b73]">
        <Icon className="size-5" />
      </span>

      <div>
        <h2 className="font-semibold text-zinc-950">
          {title}
        </h2>

        <p className="mt-2 text-sm leading-6 text-zinc-600">
          {description}
        </p>
      </div>
    </article>
  );
}
