"use client";

import { useMemo, useState, useTransition } from "react";
import { RotateCcw, Save } from "lucide-react";
import { toast } from "sonner";
import type { BusinessHourItem } from "./business-hours";

const LABELS: Record<BusinessHourItem["dayOfWeek"], string> = {
  MONDAY: "Lundi",
  TUESDAY: "Mardi",
  WEDNESDAY: "Mercredi",
  THURSDAY: "Jeudi",
  FRIDAY: "Vendredi",
  SATURDAY: "Samedi",
  SUNDAY: "Dimanche",
};

type Props = { initialHours: BusinessHourItem[] };

export function BusinessHoursClient({ initialHours }: Props) {
  const [hours, setHours] = useState(initialHours);
  const [saved, setSaved] = useState(initialHours);
  const [pending, startTransition] = useTransition();
  const dirty = useMemo(() => JSON.stringify(hours) !== JSON.stringify(saved), [hours, saved]);

  function patch(dayOfWeek: BusinessHourItem["dayOfWeek"], values: Partial<BusinessHourItem>) {
    setHours((current) =>
      current.map((item) => item.dayOfWeek === dayOfWeek ? { ...item, ...values } : item),
    );
  }

  function reset() {
    setHours(hours.map((item) => ({
      ...item,
      isOpen: true,
      startTime: "09:00",
      endTime: "19:00",
      breakStart: null,
      breakEnd: null,
    })));
  }

  function save() {
    startTransition(async () => {
      try {
        const response = await fetch("/api/admin/business-hours", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hours }),
        });
        const data = await response.json() as { success?: boolean; error?: string; hours?: BusinessHourItem[] };
        if (!response.ok || !data.success || !data.hours) throw new Error(data.error ?? "Erreur.");
        setHours(data.hours);
        setSaved(data.hours);
        toast.success("Horaires enregistrés.");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erreur.");
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-3xl border bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-zinc-600">
          Configuration par défaut : 7 jours sur 7, de 09:00 à 19:00, sans pause.
        </p>
        <div className="flex gap-2">
          <button onClick={reset} disabled={pending} className="inline-flex items-center gap-2 rounded-xl border px-4 py-2">
            <RotateCcw className="size-4" /> 9h–19h
          </button>
          <button onClick={save} disabled={pending || !dirty} className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 font-semibold text-white disabled:opacity-50">
            <Save className="size-4" /> {pending ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </div>

      {hours.map((item) => {
        const hasBreak = Boolean(item.breakStart && item.breakEnd);
        return (
          <article key={item.dayOfWeek} className="rounded-3xl border bg-white p-5 shadow-sm">
            <div className="grid gap-4 lg:grid-cols-[160px_130px_1fr] lg:items-center">
              <div>
                <h2 className="text-lg font-semibold">{LABELS[item.dayOfWeek]}</h2>
                <p className="text-sm text-zinc-500">{item.isOpen ? "Ouvert" : "Fermé"}</p>
              </div>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={item.isOpen}
                  onChange={(e) => patch(item.dayOfWeek, {
                    isOpen: e.target.checked,
                    startTime: e.target.checked ? item.startTime ?? "09:00" : null,
                    endTime: e.target.checked ? item.endTime ?? "19:00" : null,
                    breakStart: e.target.checked ? item.breakStart : null,
                    breakEnd: e.target.checked ? item.breakEnd : null,
                  })}
                  className="size-5 accent-rose-600"
                />
                Ouvert
              </label>

              {item.isOpen ? (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                  <Time label="Ouverture" value={item.startTime ?? "09:00"} onChange={(value) => patch(item.dayOfWeek, { startTime: value })} />
                  <Time label="Fermeture" value={item.endTime ?? "19:00"} onChange={(value) => patch(item.dayOfWeek, { endTime: value })} />
                  <label className="flex items-center gap-2 rounded-xl border px-3 py-2">
                    <input
                      type="checkbox"
                      checked={hasBreak}
                      onChange={(e) => patch(item.dayOfWeek, e.target.checked
                        ? { breakStart: "12:00", breakEnd: "13:00" }
                        : { breakStart: null, breakEnd: null })}
                      className="size-5 accent-rose-600"
                    />
                    Pause
                  </label>
                  {hasBreak ? (
                    <>
                      <Time label="Début pause" value={item.breakStart ?? "12:00"} onChange={(value) => patch(item.dayOfWeek, { breakStart: value })} />
                      <Time label="Fin pause" value={item.breakEnd ?? "13:00"} onChange={(value) => patch(item.dayOfWeek, { breakEnd: value })} />
                    </>
                  ) : null}
                </div>
              ) : (
                <div className="rounded-xl bg-zinc-100 p-3 text-sm text-zinc-500">Aucun créneau ce jour.</div>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}

function Time({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label>
      <span className="mb-1 block text-xs font-semibold uppercase text-zinc-500">{label}</span>
      <input type="time" step={900} value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border px-3 py-2" />
    </label>
  );
}
