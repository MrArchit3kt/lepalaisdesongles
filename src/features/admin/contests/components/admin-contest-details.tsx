"use client";

import {
  useTransition,
} from "react";

import Link from "next/link";

import {
  useRouter,
} from "next/navigation";

import {
  ArrowLeft,
  CalendarDays,
  CircleX,
  LoaderCircle,
  Lock,
  Play,
  RefreshCcw,
  Sparkles,
  Trash2,
  Trophy,
  UserRound,
  UsersRound,
} from "lucide-react";

import {
  toast,
} from "sonner";

import {
  changeAdminContestStatusAction,
  drawAdminContestWinnerAction,
} from "@/features/admin/contests/actions/admin-contests.actions";

import {
  AdminContestForm,
} from "@/features/admin/contests/components/admin-contest-form";

import type {
  AdminContestAction,
  AdminContestDetails as AdminContestDetailsType,
} from "@/features/admin/contests/types/admin-contests.types";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type AdminContestDetailsProps = {
  contest: AdminContestDetailsType;
};

/* -------------------------------------------------------------------------- */
/*                                  OUTILS                                    */
/* -------------------------------------------------------------------------- */

function formatDate(
  value: string,
): string {
  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      dateStyle:
        "medium",

      timeStyle:
        "short",
    },
  ).format(
    new Date(
      value,
    ),
  );
}

function getUserName(
  user: {
    firstName: string;
    lastName: string;
    email: string;
  },
): string {
  return [
    user.firstName,
    user.lastName,
  ]
    .filter(Boolean)
    .join(" ")
    .trim() ||
    user.email;
}

/* -------------------------------------------------------------------------- */
/*                                 COMPOSANT                                  */
/* -------------------------------------------------------------------------- */

export function AdminContestDetails({
  contest,
}: AdminContestDetailsProps) {
  const router =
    useRouter();

  const [
    isPending,
    startTransition,
  ] =
    useTransition();

  function runStatusAction(
    action: AdminContestAction,
  ): void {
    let reason:
      string | undefined;

    if (
      action ===
        "CANCEL" ||
      action ===
        "DELETE"
    ) {
      const enteredReason =
        window.prompt(
          action ===
          "DELETE"
            ? "Indiquez le motif de suppression :"
            : "Indiquez le motif d’annulation :",
        );

      if (
        enteredReason ===
        null
      ) {
        return;
      }

      reason =
        enteredReason.trim();

      if (!reason) {
        toast.error(
          "Un motif est obligatoire.",
        );

        return;
      }
    }

    if (
      action ===
        "DELETE" &&
      !window.confirm(
        "Supprimer définitivement ce concours ?",
      )
    ) {
      return;
    }

    startTransition(() => {
      void (async () => {
        const result =
          await changeAdminContestStatusAction({
            contestId:
              contest.id,

            action,

            reason,
          });

        if (
          !result.success
        ) {
          toast.error(
            result.message,
          );

          return;
        }

        toast.success(
          result.message,
        );

        if (
          result.redirectTo
        ) {
          router.push(
            result.redirectTo,
          );

          return;
        }

        router.refresh();
      })();
    });
  }

  function drawWinner():
    void {
    if (
      !window.confirm(
        `Effectuer un tirage au sort sécurisé parmi ${contest.participantCount} participante(s) ?`,
      )
    ) {
      return;
    }

    const reason =
      window.prompt(
        "Indiquez un motif ou une référence pour le tirage :",
        "Tirage au sort officiel",
      );

    if (
      reason ===
        null ||
      !reason.trim()
    ) {
      return;
    }

    startTransition(() => {
      void (async () => {
        const result =
          await drawAdminContestWinnerAction({
            contestId:
              contest.id,

            reason:
              reason.trim(),
          });

        if (
          !result.success
        ) {
          toast.error(
            result.message,
          );

          return;
        }

        toast.success(
          result.message,
        );

        router.refresh();
      })();
    });
  }

  const drawAvailable =
    contest.status ===
      "CLOSED" ||
    (
      contest.status ===
        "ACTIVE" &&
      new Date(
        contest.endsAt,
      ) <=
        new Date()
    );

  return (
    <div className="bg-zinc-50">
      <section className="px-4 pt-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/admin/concours"
            className="inline-flex items-center gap-2 text-sm font-black text-zinc-600 hover:text-violet-700"
          >
            <ArrowLeft className="size-4" />

            Liste des concours
          </Link>

          <div className="mt-5 rounded-[1.75rem] border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-600">
                  Actions rapides
                </p>

                <h1 className="mt-1 text-2xl font-black text-zinc-950">
                  {contest.title}
                </h1>

                <p className="mt-1 text-sm text-zinc-500">
                  {contest.participantCount} participante(s) · Fin le{" "}
                  {formatDate(
                    contest.endsAt,
                  )}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {contest.status ===
                  "DRAFT" ? (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        runStatusAction(
                          "ACTIVATE",
                        )
                      }
                      disabled={isPending}
                      className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-black text-white"
                    >
                      <Play className="size-4" />

                      Activer
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        runStatusAction(
                          "SCHEDULE",
                        )
                      }
                      disabled={isPending}
                      className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-black text-white"
                    >
                      <CalendarDays className="size-4" />

                      Planifier
                    </button>
                  </>
                ) : null}

                {contest.status ===
                  "SCHEDULED" ? (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        runStatusAction(
                          "ACTIVATE",
                        )
                      }
                      disabled={isPending}
                      className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-black text-white"
                    >
                      <Play className="size-4" />

                      Activer maintenant
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        runStatusAction(
                          "CLOSE",
                        )
                      }
                      disabled={isPending}
                      className="inline-flex h-10 items-center gap-2 rounded-xl bg-amber-600 px-4 text-sm font-black text-white"
                    >
                      <Lock className="size-4" />

                      Clôturer
                    </button>
                  </>
                ) : null}

                {contest.status ===
                  "ACTIVE" ? (
                  <button
                    type="button"
                    onClick={() =>
                      runStatusAction(
                        "CLOSE",
                      )
                    }
                    disabled={isPending}
                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-amber-600 px-4 text-sm font-black text-white"
                  >
                    <Lock className="size-4" />

                    Clôturer
                  </button>
                ) : null}

                {(
                  contest.status ===
                    "CLOSED" ||
                  contest.status ===
                    "CANCELLED"
                ) &&
                !contest.winnerId ? (
                  <button
                    type="button"
                    onClick={() =>
                      runStatusAction(
                        "REOPEN",
                      )
                    }
                    disabled={isPending}
                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-black text-white"
                  >
                    <RefreshCcw className="size-4" />

                    Réouvrir
                  </button>
                ) : null}

                {drawAvailable &&
                !contest.winnerId ? (
                  <button
                    type="button"
                    onClick={
                      drawWinner
                    }
                    disabled={
                      isPending ||
                      contest.participantCount ===
                        0
                    }
                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-violet-600 px-4 text-sm font-black text-white disabled:opacity-40"
                  >
                    <Trophy className="size-4" />

                    Tirer une gagnante
                  </button>
                ) : null}

                {![
                  "DRAWN",
                  "CANCELLED",
                ].includes(
                  contest.status,
                ) ? (
                  <button
                    type="button"
                    onClick={() =>
                      runStatusAction(
                        "CANCEL",
                      )
                    }
                    disabled={isPending}
                    className="inline-flex h-10 items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-black text-red-700"
                  >
                    <CircleX className="size-4" />

                    Annuler
                  </button>
                ) : null}

                {[
                  "DRAFT",
                  "CANCELLED",
                ].includes(
                  contest.status,
                ) ? (
                  <button
                    type="button"
                    onClick={() =>
                      runStatusAction(
                        "DELETE",
                      )
                    }
                    disabled={isPending}
                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-black text-white"
                  >
                    <Trash2 className="size-4" />

                    Supprimer
                  </button>
                ) : null}

                {isPending ? (
                  <span className="flex size-10 items-center justify-center">
                    <LoaderCircle className="size-5 animate-spin text-violet-600" />
                  </span>
                ) : null}
              </div>
            </div>

            {contest.winner ? (
              <div className="mt-5 flex items-center gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-amber-500 text-white">
                  <Trophy className="size-6" />
                </span>

                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-amber-700">
                    Gagnante du concours
                  </p>

                  <p className="mt-1 text-lg font-black text-amber-950">
                    {getUserName(
                      contest.winner
                        .user,
                    )}
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          <section className="mt-6 rounded-[1.75rem] border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
            <header className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                <UsersRound className="size-5" />
              </span>

              <div>
                <h2 className="text-lg font-black text-zinc-950">
                  Participantes
                </h2>

                <p className="text-sm text-zinc-500">
                  {contest.participantCount} inscription(s)
                </p>
              </div>
            </header>

            <div className="mt-5 space-y-3">
              {contest.participants.map(
                (
                  participant,
                ) => (
                  <article
                    key={
                      participant.id
                    }
                    className={`flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between ${
                      participant.isWinner
                        ? "border-amber-300 bg-amber-50"
                        : "border-zinc-200 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex size-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500">
                        {participant.isWinner ? (
                          <Trophy className="size-5 text-amber-600" />
                        ) : (
                          <UserRound className="size-5" />
                        )}
                      </span>

                      <div>
                        <p className="font-black text-zinc-950">
                          {getUserName(
                            participant.user,
                          )}
                        </p>

                        <p className="text-xs text-zinc-500">
                          {
                            participant.user
                              .email
                          }
                        </p>
                      </div>
                    </div>

                    <div className="text-sm sm:text-right">
                      <p className="font-bold text-zinc-700">
                        Inscrite le{" "}
                        {formatDate(
                          participant.createdAt,
                        )}
                      </p>

                      {participant.answer ? (
                        <p className="mt-1 max-w-md text-xs text-zinc-500">
                          Réponse :{" "}
                          {
                            participant.answer
                          }
                        </p>
                      ) : null}
                    </div>
                  </article>
                ),
              )}

              {contest.participants
                .length ===
              0 ? (
                <div className="flex min-h-44 flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 text-center">
                  <Sparkles className="size-8 text-zinc-300" />

                  <p className="mt-3 font-black text-zinc-700">
                    Aucune participante
                  </p>

                  <p className="mt-1 text-sm text-zinc-500">
                    Les inscriptions apparaîtront ici.
                  </p>
                </div>
              ) : null}
            </div>
          </section>
        </div>
      </section>

      <AdminContestForm
        mode="EDIT"
        initialValue={{
          id:
            contest.id,

          title:
            contest.title,

          slug:
            contest.slug,

          description:
            contest.description,

          rules:
            contest.rules ??
            "",

          prize:
            contest.prize,

          imageUrl:
            contest.imageUrl ??
            "",

          status:
            contest.status,

          startsAt:
            contest.startsAt,

          endsAt:
            contest.endsAt,

          drawAt:
            contest.drawAt ??
            "",

          maximumEntries:
            contest.maximumEntries,

          requiresAccount:
            contest.requiresAccount,

          showOnHomepage:
            contest.showOnHomepage,
        }}
      />
    </div>
  );
}
