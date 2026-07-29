"use client";

import Link from "next/link";
import {
  CheckCheck,
  Trash2,
} from "lucide-react";

export type NotificationFooterProps = {
  processing?: boolean;

  hasNotifications: boolean;

  hasUnread: boolean;

  onMarkAllRead?: () => void;

  onDeleteRead?: () => void;

  onClose?: () => void;
};

export function NotificationFooter({
  processing = false,
  hasNotifications,
  hasUnread,
  onMarkAllRead,
  onDeleteRead,
  onClose,
}: NotificationFooterProps) {
  return (
    <div className="border-t border-zinc-100 bg-white p-3">

      <div className="mb-3 flex flex-wrap gap-2">

        <button
          type="button"
          disabled={
            processing ||
            !hasUnread
          }
          onClick={onMarkAllRead}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <CheckCheck className="size-4" />

          Tout marquer lu

        </button>

        <button
          type="button"
          disabled={
            processing ||
            !hasNotifications
          }
          onClick={onDeleteRead}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Trash2 className="size-4" />

          Supprimer les lues

        </button>

      </div>

      <Link
        href="/admin/rendez-vous"
        onClick={onClose}
        className="flex h-11 w-full items-center justify-center rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-sm font-semibold text-white shadow-sm transition hover:from-rose-600 hover:to-pink-700"
      >
        Voir les rendez-vous
      </Link>

    </div>
  );
}
