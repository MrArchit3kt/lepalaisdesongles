"use client";

import {
  AlertTriangle,
  LoaderCircle,
  X,
} from "lucide-react";
import {
  useEffect,
  useRef,
} from "react";

type CalendarAppointmentConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  pending?: boolean;
  danger?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function CalendarAppointmentConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  pending = false,
  danger = true,
  onCancel,
  onConfirm,
}: CalendarAppointmentConfirmDialogProps) {
  const confirmButtonRef =
    useRef<HTMLButtonElement | null>(
      null,
    );

  useEffect(() => {
    if (!open) {
      return;
    }

    const timeout =
      window.setTimeout(
        () => {
          confirmButtonRef.current?.focus();
        },
        0,
      );

    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (
        event.key ===
          "Escape" &&
        !pending
      ) {
        event.preventDefault();

        onCancel();
      }
    }

    document.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      window.clearTimeout(
        timeout,
      );

      document.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [
    onCancel,
    open,
    pending,
  ]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[200] grid place-items-center bg-zinc-950/55 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(
        event,
      ) => {
        if (
          event.target ===
            event.currentTarget &&
          !pending
        ) {
          onCancel();
        }
      }}
    >
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="appointment-confirm-title"
        aria-describedby="appointment-confirm-description"
        className="w-full max-w-md rounded-3xl border border-white/20 bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-red-50 text-red-600">
            <AlertTriangle className="size-6" />
          </div>

          <button
            type="button"
            disabled={
              pending
            }
            onClick={
              onCancel
            }
            aria-label="Fermer la confirmation"
            className="grid size-9 shrink-0 place-items-center rounded-full border border-zinc-200 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-950 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="size-4" />
          </button>
        </div>

        <h2
          id="appointment-confirm-title"
          className="mt-5 text-xl font-semibold tracking-tight text-zinc-950"
        >
          {title}
        </h2>

        <p
          id="appointment-confirm-description"
          className="mt-2 text-sm leading-6 text-zinc-600"
        >
          {description}
        </p>

        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={
              pending
            }
            onClick={
              onCancel
            }
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Retour
          </button>

          <button
            ref={
              confirmButtonRef
            }
            type="button"
            disabled={
              pending
            }
            onClick={
              onConfirm
            }
            className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
              danger
                ? "bg-red-600 hover:bg-red-700"
                : "bg-zinc-900 hover:bg-zinc-800"
            }`}
          >
            {pending ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : null}

            {confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
