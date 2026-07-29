"use client";

import {
  useTransition,
} from "react";

import {
  CheckCircle2,
  LoaderCircle,
  LockKeyhole,
  Trophy,
  UserPlus,
} from "lucide-react";

import {
  usePathname,
  useRouter,
} from "next/navigation";

import {
  toast,
} from "sonner";

import {
  joinPublicContestAction,
} from "@/features/public/actions/public-contests.actions";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type PublicContestParticipationButtonProps = {
  contestId: string;

  isAuthenticated: boolean;

  isAlreadyParticipating: boolean;

  canParticipate: boolean;

  isUpcoming: boolean;

  hasEnded: boolean;

  isFull: boolean;
};

/* -------------------------------------------------------------------------- */
/*                                COMPOSANT                                   */
/* -------------------------------------------------------------------------- */

export function PublicContestParticipationButton({
  contestId,
  isAuthenticated,
  isAlreadyParticipating,
  canParticipate,
  isUpcoming,
  hasEnded,
  isFull,
}: PublicContestParticipationButtonProps) {
  const router =
    useRouter();

  const pathname =
    usePathname();

  const [
    isPending,
    startTransition,
  ] =
    useTransition();

  function handleParticipation() {
    if (
      !isAuthenticated
    ) {
      const callbackUrl =
        encodeURIComponent(
          pathname,
        );

      router.push(
        `/connexion?callbackUrl=${callbackUrl}`,
      );

      return;
    }

    startTransition(
      async () => {
        const result =
          await joinPublicContestAction(
            contestId,
          );

        if (
          result.requiresAuthentication
        ) {
          const callbackUrl =
            encodeURIComponent(
              pathname,
            );

          router.push(
            `/connexion?callbackUrl=${callbackUrl}`,
          );

          return;
        }

        if (
          !result.success
        ) {
          if (
            result.alreadyParticipating
          ) {
            toast.info(
              result.message,
            );

            router.refresh();

            return;
          }

          toast.error(
            result.message,
          );

          return;
        }

        toast.success(
          result.message,
        );

        router.refresh();
      },
    );
  }

  if (
    isAlreadyParticipating
  ) {
    return (
      <div className="flex min-h-14 w-full items-center justify-center gap-3 rounded-full border border-emerald-200 bg-emerald-50 px-6 text-sm font-bold text-emerald-700">
        <CheckCircle2 className="size-5" />

        Vous participez à ce concours
      </div>
    );
  }

  if (
    isUpcoming
  ) {
    return (
      <div className="flex min-h-14 w-full items-center justify-center gap-3 rounded-full border border-[#E8B4C0]/60 bg-[#FFF0F4] px-6 text-center text-sm font-bold text-[#843F59]">
        <LockKeyhole className="size-5 shrink-0" />

        Les participations ne sont pas encore ouvertes
      </div>
    );
  }

  if (
    hasEnded
  ) {
    return (
      <div className="flex min-h-14 w-full items-center justify-center gap-3 rounded-full border border-[#241A1D]/10 bg-[#F7F3F4] px-6 text-sm font-bold text-[#816D75]">
        <Trophy className="size-5" />

        Ce concours est terminé
      </div>
    );
  }

  if (
    isFull
  ) {
    return (
      <div className="flex min-h-14 w-full items-center justify-center gap-3 rounded-full border border-amber-200 bg-amber-50 px-6 text-sm font-bold text-amber-700">
        <UserPlus className="size-5" />

        Toutes les places ont été attribuées
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={
        handleParticipation
      }
      disabled={
        isPending ||
        !canParticipate
      }
      className="inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-full bg-[#241A1D] px-7 text-sm font-bold text-white shadow-xl shadow-black/10 transition hover:-translate-y-0.5 hover:bg-[#3B292F] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
    >
      {isPending ? (
        <>
          <LoaderCircle className="size-5 animate-spin" />

          Inscription en cours…
        </>
      ) : (
        <>
          <UserPlus className="size-5" />

          {isAuthenticated
            ? "Participer au concours"
            : "Se connecter pour participer"}
        </>
      )}
    </button>
  );
}
