"use client";

import {
  CalendarOff,
  CheckCircle2,
  Clock3,
  Palmtree,
  PlayCircle,
  UserRoundX,
  XCircle,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type LegendItem = {
  label: string;
  className: string;
  icon?: React.ReactNode;
};

/* -------------------------------------------------------------------------- */
/*                                  DONNÉES                                   */
/* -------------------------------------------------------------------------- */

const appointmentItems: LegendItem[] = [
  {
    label: "En attente",
    className:
      "border-amber-300 bg-amber-100 text-amber-950",
    icon: (
      <Clock3 className="size-3.5" />
    ),
  },
  {
    label: "Confirmé",
    className:
      "border-emerald-300 bg-emerald-100 text-emerald-950",
    icon: (
      <CheckCircle2 className="size-3.5" />
    ),
  },
  {
    label: "En cours",
    className:
      "border-blue-300 bg-blue-100 text-blue-950",
    icon: (
      <PlayCircle className="size-3.5" />
    ),
  },
  {
    label: "Terminé",
    className:
      "border-violet-300 bg-violet-100 text-violet-950",
    icon: (
      <CheckCircle2 className="size-3.5" />
    ),
  },
  {
    label: "Annulé / refusé",
    className:
      "border-red-300 bg-red-100 text-red-950",
    icon: (
      <XCircle className="size-3.5" />
    ),
  },
];

const availabilityItems: LegendItem[] = [
  {
    label: "Pause",
    className:
      "border-slate-300 bg-slate-100 text-slate-700",
    icon: (
      <Clock3 className="size-3.5" />
    ),
  },
  {
    label: "Congé",
    className:
      "border-sky-300 bg-sky-100 text-sky-900",
    icon: (
      <Palmtree className="size-3.5" />
    ),
  },
  {
    label: "Professionnelle absente",
    className:
      "border-zinc-300 bg-zinc-100 text-zinc-800",
    icon: (
      <UserRoundX className="size-3.5" />
    ),
  },
  {
    label: "Salon fermé",
    className:
      "border-red-300 bg-red-100 text-red-900",
    icon: (
      <CalendarOff className="size-3.5" />
    ),
  },
];

/* -------------------------------------------------------------------------- */
/*                                 COMPOSANT                                  */
/* -------------------------------------------------------------------------- */

export function AdminCalendarLegend() {
  return (
    <section className="rounded-3xl border border-pink-100 bg-white p-4 shadow-sm">
      <div className="grid gap-5 xl:grid-cols-2">
        <LegendGroup
          title="Statuts des rendez-vous"
          items={
            appointmentItems
          }
        />

        <LegendGroup
          title="Indisponibilités"
          items={
            availabilityItems
          }
        />
      </div>

      <div className="mt-4 border-t border-zinc-100 pt-4">
        <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <span className="block h-5 w-1.5 rounded-full bg-pink-500" />

            <span>
              La barre colorée à gauche d’un rendez-vous correspond à la
              professionnelle assignée.
            </span>
          </div>

          <span className="hidden text-zinc-300 sm:inline">
            •
          </span>

          <span>
            Les éléments hachurés ou gris représentent une période non
            réservable.
          </span>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                               GROUPE LÉGENDE                               */
/* -------------------------------------------------------------------------- */

function LegendGroup({
  title,
  items,
}: {
  title: string;
  items: LegendItem[];
}) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-zinc-950">
        {title}
      </h2>

      <div className="mt-3 flex flex-wrap gap-2">
        {items.map(
          (
            item,
          ) => (
            <div
              key={
                item.label
              }
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${item.className}`}
            >
              {item.icon}

              <span>
                {
                  item.label
                }
              </span>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
