"use client";

import {
  RefreshCw,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";

export type NotificationHeaderProps = {
  unreadCount: number;

  connected: boolean;

  reconnecting: boolean;

  onClose: () => void;

  onReconnect: () => void;

  onRefresh?: () => void;

  refreshing?: boolean;
};

export function NotificationHeader({
  unreadCount,
  connected,
  reconnecting,
  onClose,
  onReconnect,
  onRefresh,
  refreshing = false,
}: NotificationHeaderProps) {
  return (
    <>
      <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900">
            Notifications
          </h2>

          <p className="mt-0.5 text-xs text-zinc-500">
            {unreadCount > 0
              ? `${unreadCount} notification${unreadCount > 1 ? "s" : ""} non lue${unreadCount > 1 ? "s" : ""}`
              : "Aucune notification non lue"}
          </p>
        </div>

        <div className="flex items-center gap-2">

          {onRefresh ? (
            <button
              type="button"
              onClick={onRefresh}
              disabled={refreshing}
              className="grid size-8 place-items-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-50"
              aria-label="Actualiser"
            >
              <RefreshCw
                className={`size-4 ${
                  refreshing
                    ? "animate-spin"
                    : ""
                }`}
              />
            </button>
          ) : null}

          <button
            type="button"
            onClick={onClose}
            className="grid size-8 place-items-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
            aria-label="Fermer"
          >
            <X className="size-4" />
          </button>

        </div>
      </div>

      <div className="border-b border-zinc-100 bg-zinc-50 px-4 py-3">

        <div className="flex items-center justify-between gap-3">

          <div className="flex min-w-0 items-center gap-2">

            {connected ? (
              <Wifi className="size-4 shrink-0 text-emerald-600" />
            ) : (
              <WifiOff className="size-4 shrink-0 text-amber-600" />
            )}

            <span className="truncate text-xs font-medium text-zinc-600">

              {connected
                ? "Notifications en direct actives"
                : reconnecting
                  ? "Reconnexion en cours…"
                  : "Connexion interrompue"}

            </span>

          </div>

          {!connected ? (

            <button
              type="button"
              onClick={onReconnect}
              disabled={reconnecting}
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100 disabled:opacity-60"
            >

              <RefreshCw
                className={`size-3.5 ${
                  reconnecting
                    ? "animate-spin"
                    : ""
                }`}
              />

              Reconnecter

            </button>

          ) : null}

        </div>

      </div>
    </>
  );
}
