"use client";

import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  CircleAlert,
  Clock3,
  MessageCircle,
  RefreshCw,
  Sparkles,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  toast,
} from "sonner";

import {
  useAdminNotifications,
} from "@/features/notifications/hooks/use-admin-notifications";

import type {
  AdminRealtimeNotification,
} from "@/features/notifications/hooks/use-admin-notifications";
import type {
  NotificationKind,
} from "@/features/notifications/types/notification.types";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type AdminNotificationCenterProps = {
  className?: string;
};

type NotificationDisplayConfiguration = {
  label: string;
  icon: typeof Bell;
};

/* -------------------------------------------------------------------------- */
/*                                 CONSTANTES                                 */
/* -------------------------------------------------------------------------- */

const NOTIFICATION_CONFIGURATION: Record<
  NotificationKind,
  NotificationDisplayConfiguration
> = {
  APPOINTMENT_CREATED: {
    label: "Nouveau rendez-vous",
    icon: Bell,
  },
  APPOINTMENT_CONFIRMED: {
    label: "Rendez-vous confirmé",
    icon: CheckCircle2,
  },

  APPOINTMENT_REFUSED: {
    label: "Rendez-vous refusé",
    icon: CircleAlert,
  },

  APPOINTMENT_CANCELLED: {
    label: "Rendez-vous annulé",
    icon: CircleAlert,
  },

  APPOINTMENT_REMINDER: {
    label: "Rappel de rendez-vous",
    icon: Clock3,
  },

  MESSAGE_RECEIVED: {
    label: "Nouveau message",
    icon: MessageCircle,
  },

  REVIEW_RECEIVED: {
    label: "Nouvel avis",
    icon: Sparkles,
  },

  REVIEW_REQUEST: {
    label: "Demande d’avis",
    icon: Sparkles,
  },

  PROMOTION: {
    label: "Promotion",
    icon: Sparkles,
  },

  CONTEST: {
    label: "Jeu concours",
    icon: Sparkles,
  },

  SYSTEM: {
    label: "Information système",
    icon: CircleAlert,
  },
};

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */


function formatNotificationDate(
  value: string,
): string {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      dateStyle: "short",
      timeStyle: "short",
    },
  ).format(date);
}

function getNotificationConfiguration(
  type: NotificationKind,
): NotificationDisplayConfiguration {
  return (
    NOTIFICATION_CONFIGURATION[
      type
    ] ??
    NOTIFICATION_CONFIGURATION.SYSTEM
  );
}

/* -------------------------------------------------------------------------- */
/*                                COMPONENT                                   */
/* -------------------------------------------------------------------------- */

export function AdminNotificationCenter({
  className = "",
}: AdminNotificationCenterProps) {
  const [
    open,
    setOpen,
  ] = useState(false);

  const containerRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  const {
    unreadCount,
    connected,
    reconnecting,
    lastNotification,
    reconnect,
  } = useAdminNotifications({
    onNotification:
      (
        notification,
      ) => {
        showNotificationToast(
          notification,
        );
      },
  });

  useEffect(() => {
    function handlePointerDown(
      event: PointerEvent,
    ): void {
      const target =
        event.target;

      if (
        !(target instanceof Node)
      ) {
        return;
      }

      if (
        containerRef.current &&
        !containerRef.current.contains(
          target,
        )
      ) {
        setOpen(false);
      }
    }

    function handleKeyDown(
      event: KeyboardEvent,
    ): void {
      if (
        event.key === "Escape"
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "pointerdown",
      handlePointerDown,
    );

    document.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        handlePointerDown,
      );

      document.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, []);

  const configuration =
    lastNotification
      ? getNotificationConfiguration(
          lastNotification.type,
        )
      : null;

  const LastNotificationIcon =
    configuration?.icon ??
    Bell;

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
    >
      <button
        type="button"
        onClick={() =>
          setOpen(
            (current) =>
              !current,
          )
        }
        className="relative grid size-10 place-items-center rounded-xl border border-zinc-200 bg-white text-zinc-700 shadow-sm transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
        aria-label={
          unreadCount > 0
            ? `${unreadCount} notification${unreadCount > 1 ? "s" : ""} non lue${unreadCount > 1 ? "s" : ""}`
            : "Notifications"
        }
        aria-expanded={
          open
        }
      >
        <Bell className="size-5" />

        {unreadCount > 0 ? (
          <span className="absolute -right-1.5 -top-1.5 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1.5 text-[10px] font-bold leading-none text-white ring-2 ring-white">
            {unreadCount > 99
              ? "99+"
              : unreadCount}
          </span>
        ) : null}

        <span
          className={`absolute bottom-0.5 right-0.5 size-2.5 rounded-full ring-2 ring-white ${
            connected
              ? "bg-emerald-500"
              : reconnecting
                ? "bg-amber-500"
                : "bg-zinc-400"
          }`}
        />
      </button>

      {open ? (
        <div className="absolute right-0 top-12 z-50 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl shadow-zinc-950/15">
          <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-zinc-950">
                Notifications
              </p>

              <p className="mt-0.5 text-xs text-zinc-500">
                {unreadCount > 0
                  ? `${unreadCount} notification${unreadCount > 1 ? "s" : ""} non lue${unreadCount > 1 ? "s" : ""}`
                  : "Aucune notification non lue"}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setOpen(false)
              }
              className="grid size-8 place-items-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
              aria-label="Fermer les notifications"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="border-b border-zinc-100 bg-zinc-50 px-4 py-2.5">
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
                  onClick={
                    reconnect
                  }
                  disabled={
                    reconnecting
                  }
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
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

          <div className="p-3">
            {lastNotification &&
            configuration ? (
              <div className="rounded-2xl border border-rose-100 bg-rose-50/60 p-3">
                <div className="flex items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-rose-600 shadow-sm">
                    <LastNotificationIcon className="size-5" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-rose-600">
                      {
                        configuration.label
                      }
                    </p>

                    <p className="mt-1 text-sm font-semibold text-zinc-950">
                      {
                        lastNotification.title
                      }
                    </p>

                    <p className="mt-1 line-clamp-3 text-xs leading-5 text-zinc-600">
                      {
                        lastNotification.message
                      }
                    </p>

                    <p className="mt-2 text-[11px] text-zinc-400">
                      {formatNotificationDate(
                        lastNotification.createdAt,
                      )}
                    </p>

                    {lastNotification.actionUrl ? (
                      <Link
                        href={
                          lastNotification.actionUrl
                        }
                        onClick={() =>
                          setOpen(false)
                        }
                        className="mt-3 inline-flex rounded-lg bg-zinc-950 px-3 py-2 text-xs font-semibold text-white transition hover:bg-zinc-800"
                      >
                        Consulter
                      </Link>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 px-4 py-8 text-center">
                <span className="grid size-12 place-items-center rounded-2xl bg-zinc-100 text-zinc-400">
                  <Bell className="size-5" />
                </span>

                <p className="mt-3 text-sm font-semibold text-zinc-800">
                  En attente d’une notification
                </p>

                <p className="mt-1 max-w-xs text-xs leading-5 text-zinc-500">
                  Les nouvelles réservations, annulations et modifications apparaîtront ici automatiquement.
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-zinc-100 p-3">
            <Link
              href="/admin/rendez-vous"
              onClick={() =>
                setOpen(false)
              }
              className="flex h-10 w-full items-center justify-center rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-sm font-semibold text-white shadow-sm transition hover:from-rose-600 hover:to-pink-700"
            >
              Voir les rendez-vous
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  TOAST                                     */
/* -------------------------------------------------------------------------- */

function showNotificationToast(
  notification: AdminRealtimeNotification,
): void {
  const configuration =
    getNotificationConfiguration(
      notification.type,
    );

  const description =
    notification.message.length >
    180
      ? `${notification.message.slice(0, 177)}…`
      : notification.message;

  toast(
    notification.title,
    {
      description,

      duration:
        8_000,

      action:
        notification.actionUrl
          ? {
              label:
                "Consulter",

              onClick:
                () => {
                  window.location.href =
                    notification.actionUrl ??
                    "/admin/rendez-vous";
                },
            }
          : undefined,

      icon:
        configuration.label ===
        "Nouveau message"
          ? "💬"
          : configuration.label ===
              "Rendez-vous annulé"
            ? "⚠️"
            : "🔔",
    },
  );
}
