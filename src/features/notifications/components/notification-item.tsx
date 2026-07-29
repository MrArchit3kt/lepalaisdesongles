"use client";

import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  CircleAlert,
  Clock3,
  MessageCircle,
  Sparkles,
  Trash2,
} from "lucide-react";

import type {
  NotificationKind,
  NotificationListItem,
} from "../types/notification.types";

type NotificationItemProps = {
  notification: NotificationListItem;

  onRead?: (
    id: string,
  ) => void;

  onUnread?: (
    id: string,
  ) => void;

  onDelete?: (
    id: string,
  ) => void;
};

type NotificationConfiguration = {
  label: string;
  icon: typeof Bell;
};

const CONFIGURATION: Record<
  NotificationKind,
  NotificationConfiguration
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
    label: "Rappel",
    icon: Clock3,
  },

  MESSAGE_RECEIVED: {
    label: "Message",
    icon: MessageCircle,
  },

  REVIEW_RECEIVED: {
    label: "Avis reçu",
    icon: Sparkles,
  },

  REVIEW_REQUEST: {
    label: "Demande d'avis",
    icon: Sparkles,
  },

  PROMOTION: {
    label: "Promotion",
    icon: Sparkles,
  },

  CONTEST: {
    label: "Concours",
    icon: Sparkles,
  },

  SYSTEM: {
    label: "Système",
    icon: CircleAlert,
  },
};

function formatDate(
  value: Date,
) {
  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      dateStyle: "short",
      timeStyle: "short",
    },
  ).format(
    value,
  );
}

export function NotificationItem({
  notification,
  onRead,
  onUnread,
  onDelete,
}: NotificationItemProps) {
  const configuration =
    CONFIGURATION[
      notification.type
    ];

  const Icon =
    configuration.icon;

  return (
    <article
      className={`rounded-xl border p-4 transition ${
        notification.isRead
          ? "border-zinc-200 bg-white"
          : "border-rose-200 bg-rose-50/40"
      }`}
    >
      <div className="flex gap-3">

        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">

          <Icon className="size-5 text-rose-600" />

        </div>

        <div className="min-w-0 flex-1">

          <div className="flex items-start justify-between gap-3">

            <div>

              <p className="text-xs font-semibold uppercase tracking-wide text-rose-600">

                {configuration.label}

              </p>

              <h4 className="mt-1 text-sm font-semibold text-zinc-900">

                {notification.title}

              </h4>

            </div>

            {!notification.isRead && (

              <span className="mt-1 size-2 rounded-full bg-rose-500" />

            )}

          </div>

          <p className="mt-2 text-sm leading-6 text-zinc-600">

            {notification.message}

          </p>

          <p className="mt-3 text-xs text-zinc-400">

            {formatDate(
              notification.createdAt,
            )}

          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {notification.actionUrl ? (
              <Link
                href={notification.actionUrl}
                className="inline-flex items-center rounded-lg bg-zinc-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-zinc-800"
              >
                Consulter
              </Link>
            ) : null}

            {notification.isRead ? (
              <button
                type="button"
                onClick={() =>
                  onUnread?.(
                    notification.id,
                  )
                }
                className="inline-flex items-center rounded-lg border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100"
              >
                Marquer non lu
              </button>
            ) : (
              <button
                type="button"
                onClick={() =>
                  onRead?.(
                    notification.id,
                  )
                }
                className="inline-flex items-center rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100"
              >
                Marquer lu
              </button>
            )}

            <button
              type="button"
              onClick={() =>
                onDelete?.(
                  notification.id,
                )
              }
              className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-100"
            >
              <Trash2 className="size-3.5" />
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
