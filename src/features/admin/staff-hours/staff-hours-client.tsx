"use client";

import { useMemo, useState, useTransition } from "react";
import { RotateCcw, Save, UserRound } from "lucide-react";
import { toast } from "sonner";
import type { StaffHourItem } from "./staff-hours";

const LABELS: Record<StaffHourItem["dayOfWeek"], string> = {
  MONDAY: "Lundi",
  TUESDAY: "Mardi",
  WEDNESDAY: "Mercredi",
  THURSDAY: "Jeudi",
  FRIDAY: "Vendredi",
  SATURDAY: "Samedi",
  SUNDAY: "Dimanche",
};

type StaffMember = {
  id: string;
  displayName: string | null;
  color: string | null;
  acceptsOnlineBooking: boolean;
  slotIntervalMinutes: number;
  defaultCleanupMinutes: number;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
};

type Props = {
  staff: StaffMember[];
  initialStaffId: string | null;
  initialHours: StaffHourItem[];
};

export function StaffHoursClient({ staff, initialStaffId, initialHours }: Props) {
  const [staffId, setStaffId] = useState(initialStaffId);
  const [hours, setHours] = useState(initialHours);
  const [saved, setSaved] = useState(initialHours);
  const [pending, startTransition] = useTransition();

  const selected = staff.find((item) => item.id === staffId) ?? null;
  const dirty = useMemo(
    () => JSON.stringify(hours) !== JSON.stringify(saved),
    [hours, saved],
  );

  function patch(dayOfWeek: StaffHourItem["dayOfWeek"], values: Partial<StaffHourItem>) {
    setHours((current) =>
      current.map((item) =>
        item.dayOfWeek === dayOfWeek ? { ...item, ...values } : item,
      ),
    );
  }

  function selectStaff(nextStaffId: string) {
    setStaffId(nextStaffId);

    startTransition(async () => {
      try {
        const response = await fetch(
          `/api/admin/staff-hours?staffId=${encodeURIComponent(nextStaffId)}`,
        );
        const data = await response.json() as {
          hours?: StaffHourItem[];
          error?: string;
        };

        if (!response.ok || !data.hours) {
          throw new Error(data.error ?? "Chargement impossible.");
        }

        setHours(data.hours);
        setSaved(data.hours);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Chargement impossible.");
      }
    });
  }

  function save() {
    if (!staffId) return;

    startTransition(async () => {
      try {
        const response = await fetch("/api/admin/staff-hours", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ staffId, hours }),
        });

        const data = await response.json() as {
          success?: boolean;
          hours?: StaffHourItem[];
          error?: string;
        };

        if (!response.ok || !data.success || !data.hours) {
          throw new Error(data.error ?? "Enregistrement impossible.");
        }

        setHours(data.hours);
        setSaved(data.hours);
        toast.success("Horaires de la professionnelle enregistrés.");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Enregistrement impossible.");
      }
    });
  }

  function resetToSalon() {
    if (!staffId) return;

    startTransition(async () => {
      try {
        const response = await fetch(
          `/api/admin/staff-hours?staffId=${encodeURIComponent(staffId)}`,
          { method: "DELETE" },
        );

        const data = await response.json() as {
          success?: boolean;
          hours?: StaffHourItem[];
          error?: string;
        };

        if (!response.ok || !data.success || !data.hours) {
          throw new Error(data.error ?? "Réinitialisation impossible.");
        }

        setHours(data.hours);
        setSaved(data.hours);
        toast.success("Horaires réinitialisés sur ceux du salon.");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Réinitialisation impossible.");
      }
    });
  }

  if (staff.length === 0) {
    return (
      <div className="rounded-3xl border bg-white p-8 text-center shadow-sm">
        <UserRound className="mx-auto size-10 text-zinc-400" />
        <h2 className="mt-4 text-xl font-semibold">Aucune professionnelle active</h2>
        <p className="mt-2 text-zinc-500">
          Crée ou active une professionnelle avant de définir ses horaires.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <section className="rounded-3xl border bg-white p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <label>
            <span className="mb-2 block text-sm font-semibold">Professionnelle</span>
            <select
              value={staffId ?? ""}
              onChange={(event) => selectStaff(event.target.value)}
              disabled={pending}
              className="w-full rounded-xl border px-4 py-3"
            >
              {staff.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.displayName || `${item.user.firstName} ${item.user.lastName}`}
                </option>
              ))}
            </select>
          </label>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={resetToSalon}
              disabled={pending || !staffId}
              className="inline-flex items-center gap-2 rounded-xl border px-4 py-3"
            >
              <RotateCcw className="size-4" />
              Reprendre les horaires du salon
            </button>

            <button
              type="button"
              onClick={save}
              disabled={pending || !dirty || !staffId}
              className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-3 font-semibold text-white disabled:opacity-50"
            >
              <Save className="size-4" />
              {pending ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        </div>

        {selected ? (
          <div className="mt-4 grid gap-3 text-sm text-zinc-600 sm:grid-cols-3">
            <p>Réservation en ligne : <strong>{selected.acceptsOnlineBooking ? "Oui" : "Non"}</strong></p>
            <p>Pas des créneaux : <strong>{selected.slotIntervalMinutes} min</strong></p>
            <p>Nettoyage par défaut : <strong>{selected.defaultCleanupMinutes} min</strong></p>
          </div>
        ) : null}

        {dirty ? (
          <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
            Modifications non enregistrées.
          </p>
        ) : null}
      </section>

      {hours.map((item) => (
        <article key={item.dayOfWeek} className="rounded-3xl border bg-white p-5 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-[160px_130px_1fr] lg:items-center">
            <div>
              <h2 className="text-lg font-semibold">{LABELS[item.dayOfWeek]}</h2>
              <p className="text-sm text-zinc-500">{item.isOpen ? "Travaille" : "Repos"}</p>
            </div>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={item.isOpen}
                onChange={(event) =>
                  patch(item.dayOfWeek, {
                    isOpen: event.target.checked,
                    startTime: event.target.checked ? item.startTime ?? "09:00" : null,
                    endTime: event.target.checked ? item.endTime ?? "19:00" : null,
                    hasBreak: event.target.checked ? item.hasBreak : false,
                    breakStart: event.target.checked ? item.breakStart : null,
                    breakEnd: event.target.checked ? item.breakEnd : null,
                  })
                }
                className="size-5 accent-rose-600"
              />
              Travaille
            </label>

            {item.isOpen ? (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                <Time label="Début" value={item.startTime ?? "09:00"} onChange={(value) => patch(item.dayOfWeek, { startTime: value })} />
                <Time label="Fin" value={item.endTime ?? "19:00"} onChange={(value) => patch(item.dayOfWeek, { endTime: value })} />

                <label className="flex items-center gap-2 rounded-xl border px-3 py-2">
                  <input
                    type="checkbox"
                    checked={item.hasBreak}
                    onChange={(event) =>
                      patch(
                        item.dayOfWeek,
                        event.target.checked
                          ? {
                              hasBreak: true,
                              breakStart: item.breakStart ?? "12:00",
                              breakEnd: item.breakEnd ?? "13:00",
                            }
                          : {
                              hasBreak: false,
                              breakStart: null,
                              breakEnd: null,
                            },
                      )
                    }
                    className="size-5 accent-rose-600"
                  />
                  Pause
                </label>

                {item.hasBreak ? (
                  <>
                    <Time label="Début pause" value={item.breakStart ?? "12:00"} onChange={(value) => patch(item.dayOfWeek, { breakStart: value })} />
                    <Time label="Fin pause" value={item.breakEnd ?? "13:00"} onChange={(value) => patch(item.dayOfWeek, { breakEnd: value })} />
                  </>
                ) : null}
              </div>
            ) : (
              <div className="rounded-xl bg-zinc-100 p-3 text-sm text-zinc-500">
                Aucun rendez-vous ne pourra être attribué ce jour.
              </div>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}

function Time({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label>
      <span className="mb-1 block text-xs font-semibold uppercase text-zinc-500">
        {label}
      </span>
      <input
        type="time"
        step={900}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border px-3 py-2"
      />
    </label>
  );
}
