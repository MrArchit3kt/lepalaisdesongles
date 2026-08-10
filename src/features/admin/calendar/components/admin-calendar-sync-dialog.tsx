"use client";

import { CalendarSync, Check, Copy, LoaderCircle, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type FeedUrls = {
  feedUrl: string;
  webcalUrl: string;
};

type FeedTokenResponse = FeedUrls & {
  error?: string;
};

export function AdminCalendarSyncDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [urls, setUrls] = useState<FeedUrls | null>(null);
  const [hasCopied, setHasCopied] = useState(false);

  function openDialog(): void {
    setIsOpen(true);

    if (urls) {
      return;
    }

    setIsLoading(true);

    fetch("/api/admin/calendar/feed-token")
      .then((response) => response.json() as Promise<FeedTokenResponse>)
      .then((payload) => {
        if (!payload.feedUrl) {
          throw new Error(payload.error ?? "Impossible de charger le lien.");
        }

        setUrls({ feedUrl: payload.feedUrl, webcalUrl: payload.webcalUrl });
      })
      .catch((error: unknown) => {
        toast.error(
          error instanceof Error
            ? error.message
            : "Impossible de charger le lien de synchronisation.",
        );
      })
      .finally(() => setIsLoading(false));
  }

  function handleRegenerate(): void {
    if (isRegenerating) {
      return;
    }

    setIsRegenerating(true);

    fetch("/api/admin/calendar/feed-token", { method: "POST" })
      .then((response) => response.json() as Promise<FeedTokenResponse>)
      .then((payload) => {
        if (!payload.feedUrl) {
          throw new Error(payload.error ?? "Impossible de régénérer le lien.");
        }

        setUrls({ feedUrl: payload.feedUrl, webcalUrl: payload.webcalUrl });
        setHasCopied(false);

        toast.success("Le lien a été régénéré. L’ancien lien ne fonctionne plus.");
      })
      .catch((error: unknown) => {
        toast.error(
          error instanceof Error
            ? error.message
            : "Impossible de régénérer le lien.",
        );
      })
      .finally(() => setIsRegenerating(false));
  }

  function handleCopy(): void {
    if (!urls) {
      return;
    }

    navigator.clipboard
      .writeText(urls.feedUrl)
      .then(() => {
        setHasCopied(true);
        setTimeout(() => setHasCopied(false), 2000);
      })
      .catch(() => {
        toast.error("Impossible de copier le lien.");
      });
  }

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        className="inline-flex items-center gap-2 rounded-full border border-pink-100 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 shadow-sm transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
      >
        <CalendarSync className="size-4" />
        <span>Synchro iPhone</span>
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6">
          <button
            type="button"
            aria-label="Fermer la fenêtre"
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm"
          />

          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="calendar-sync-title"
            className="relative z-10 w-full max-w-lg rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-2xl sm:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-rose-600">
                  Agenda
                </p>

                <h2
                  id="calendar-sync-title"
                  className="mt-1 text-xl font-black text-zinc-950"
                >
                  Synchroniser avec mon iPhone
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Fermer"
                className="grid size-9 shrink-0 place-items-center rounded-full text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-950"
              >
                <X className="size-5" />
              </button>
            </div>

            <p className="mt-3 text-sm leading-6 text-zinc-600">
              Tous les rendez-vous du salon s’ajoutent automatiquement à
              l’app Calendrier de votre iPhone, mise à jour toute seule au
              fil des nouvelles réservations.
            </p>

            {isLoading ? (
              <p className="mt-6 flex items-center gap-2 text-sm text-zinc-500">
                <LoaderCircle className="size-4 animate-spin" />
                Chargement du lien...
              </p>
            ) : urls ? (
              <div className="mt-6 space-y-4">
                <a
                  href={urls.webcalUrl}
                  className="flex h-12 items-center justify-center rounded-2xl bg-rose-600 px-5 text-sm font-black text-white shadow-sm transition hover:bg-rose-700"
                >
                  Ajouter à Calendrier (depuis l’iPhone)
                </a>

                <div>
                  <p className="mb-2 text-xs font-bold text-zinc-500">
                    Ou copiez ce lien dans Réglages → Calendrier → Comptes
                    → Ajouter un compte → Autre → Ajouter un calendrier
                    abonné :
                  </p>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={urls.feedUrl}
                      onFocus={(event) => event.currentTarget.select()}
                      className="h-11 min-w-0 flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-xs text-zinc-700 outline-none"
                    />

                    <button
                      type="button"
                      onClick={handleCopy}
                      aria-label="Copier le lien"
                      className="grid size-11 shrink-0 place-items-center rounded-xl border border-zinc-200 text-zinc-600 transition hover:border-rose-300 hover:text-rose-700"
                    >
                      {hasCopied ? (
                        <Check className="size-4 text-emerald-600" />
                      ) : (
                        <Copy className="size-4" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRegenerate}
                  disabled={isRegenerating}
                  className="text-xs font-bold text-zinc-500 underline decoration-dotted underline-offset-4 transition hover:text-rose-700 disabled:opacity-50"
                >
                  {isRegenerating
                    ? "Régénération..."
                    : "Le lien a été partagé par erreur ? Régénérer le lien"}
                </button>
              </div>
            ) : null}
          </section>
        </div>
      ) : null}
    </>
  );
}
