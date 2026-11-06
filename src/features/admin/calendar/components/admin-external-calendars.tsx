"use client";

import { CalendarPlus, Link2, RefreshCw, Trash2, TriangleAlert } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type ExternalCalendar = {
  id: string;
  name: string | null;
  url: string;
  busyCount: number;
  lastSyncedAt: string | null;
  error: string | null;
};

/*
 * Agendas externes (iCal) importés : leurs créneaux occupés bloquent les
 * disponibilités du salon (ex. l'agenda Klyvo du salon).
 */
export function AdminExternalCalendars() {
  const [calendars, setCalendars] = useState<ExternalCalendar[]>([]);
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/calendar/external");
      const data = await res.json();
      if (Array.isArray(data.calendars)) setCalendars(data.calendars);
    } catch {
      // Silencieux : la liste reste vide.
    }
  }, []);

  useEffect(() => {
    // Chargement initial de la liste (fetch au montage).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
  }, [refresh]);

  async function addCalendar(event: React.FormEvent) {
    event.preventDefault();
    if (!url.trim() || busy) return;
    setBusy(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/calendar/external", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), name: name.trim() || undefined }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback({ ok: true, text: `Agenda connecté : ${data.events} créneau${data.events > 1 ? "x" : ""} occupé${data.events > 1 ? "s" : ""} détecté${data.events > 1 ? "s" : ""}. Ils bloquent désormais vos disponibilités.` });
        setUrl("");
        setName("");
        await refresh();
      } else {
        setFeedback({ ok: false, text: data.error ?? "Impossible de connecter cet agenda." });
      }
    } catch {
      setFeedback({ ok: false, text: "Erreur réseau." });
    } finally {
      setBusy(false);
    }
  }

  async function act(id: string, method: "DELETE" | "POST") {
    setBusy(true);
    try {
      await fetch(`/api/admin/calendar/external/${id}`, { method });
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mb-5 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:mb-8 sm:p-6">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-full bg-rose-50 text-rose-600">
          <CalendarPlus className="size-5" />
        </span>
        <div>
          <h2 className="text-base font-semibold text-zinc-950">Bloquer les créneaux pris ailleurs</h2>
          <p className="text-sm text-zinc-600">Collez le lien iCal d’un agenda externe (ex. votre agenda Klyvo) : ses créneaux occupés bloqueront vos disponibilités.</p>
        </div>
      </div>

      {calendars.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {calendars.map((calendar) => (
            <li key={calendar.id} className="rounded-xl bg-zinc-50 px-4 py-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-zinc-900">{calendar.name || calendar.url.replace(/^https?:\/\//, "").slice(0, 60)}</p>
                  <p className="text-xs text-zinc-500">
                    {calendar.busyCount} créneau{calendar.busyCount > 1 ? "x" : ""} occupé{calendar.busyCount > 1 ? "s" : ""}
                    {calendar.lastSyncedAt ? ` · synchronisé le ${new Date(calendar.lastSyncedAt).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}` : ""}
                  </p>
                  {calendar.error ? (
                    <p className="mt-1 inline-flex items-center gap-1 text-xs text-red-600">
                      <TriangleAlert className="size-3.5" /> {calendar.error}
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 gap-1">
                  <button type="button" disabled={busy} onClick={() => act(calendar.id, "POST")} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-200 disabled:opacity-50">
                    <RefreshCw className="size-3.5" /> Synchroniser
                  </button>
                  <button type="button" disabled={busy} onClick={() => act(calendar.id, "DELETE")} className="inline-flex items-center rounded-lg px-2 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50">
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      <form onSubmit={addCalendar} className="mt-4 space-y-3">
        <input
          type="url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://… .ics"
          className="w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200"
        />
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Nom (facultatif) — ex. : agenda Klyvo"
          className="w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200"
        />
        {feedback ? (
          <p className={feedback.ok ? "text-sm text-emerald-600" : "text-sm text-red-600"}>{feedback.text}</p>
        ) : null}
        <button type="submit" disabled={busy || !url.trim()} className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50">
          <Link2 className="size-4" /> {busy ? "Vérification…" : "Connecter cet agenda"}
        </button>
      </form>

      <details className="mt-4 rounded-xl bg-zinc-50 px-4 py-3">
        <summary className="cursor-pointer text-sm font-semibold text-zinc-800">Où trouver mon lien iCal ?</summary>
        <ul className="mt-2 space-y-1.5 text-sm text-zinc-600">
          <li><span className="font-medium text-zinc-900">Klyvo :</span> espace pro → Synchroniser l’agenda → lien « .ics ».</li>
          <li><span className="font-medium text-zinc-900">Google Agenda :</span> Paramètres → votre agenda → « Adresse secrète au format iCal ».</li>
          <li><span className="font-medium text-zinc-900">Outlook :</span> Paramètres → Calendrier → Partager/Publier → lien ICS.</li>
        </ul>
      </details>
    </section>
  );
}
