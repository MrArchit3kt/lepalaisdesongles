import type {
  Metadata,
} from "next";

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Crown,
  Gift,
  Medal,
  ShieldCheck,
  Sparkles,
  Trophy,
  UsersRound,
} from "lucide-react";

import Image from "next/image";
import Link from "next/link";
import {
  notFound,
} from "next/navigation";

import {
  getPublicWebsiteSettings,
} from "@/features/admin/settings/services/admin-settings.service";

import {
  PublicContestParticipationButton,
} from "@/features/public/components/public-contest-participation-button";

import {
  getPublicContestDetails,
} from "@/features/public/services/public-contests.service";

import {
  getCurrentUser,
} from "@/lib/session";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type ContestDetailsPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

/* -------------------------------------------------------------------------- */
/*                                CONFIGURATION                               */
/* -------------------------------------------------------------------------- */

export const dynamic =
  "force-dynamic";

export const revalidate =
  0;

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

function formatDate(
  value: Date,
): string {
  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      day:
        "numeric",

      month:
        "long",

      year:
        "numeric",
    },
  ).format(
    value,
  );
}

function formatDateTime(
  value: Date,
): string {
  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      day:
        "numeric",

      month:
        "long",

      year:
        "numeric",

      hour:
        "2-digit",

      minute:
        "2-digit",
    },
  ).format(
    value,
  );
}

function formatPrice(
  valueCents: number,
): string {
  return new Intl.NumberFormat(
    "fr-FR",
    {
      style:
        "currency",

      currency:
        "EUR",
    },
  ).format(
    valueCents /
      100,
  );
}

function getPositionClasses(
  position: number,
): string {
  switch (
    position
  ) {
    case 1:
      return "bg-[#FFF4CF] text-[#9B7628]";

    case 2:
      return "bg-zinc-100 text-zinc-600";

    case 3:
      return "bg-[#F7E4D7] text-[#A4643A]";

    default:
      return "bg-[#FFF0F4] text-[#8B405A]";
  }
}

function getPositionIcon(
  position: number,
) {
  if (
    position ===
    1
  ) {
    return (
      <Crown className="size-5" />
    );
  }

  if (
    position ===
      2 ||
    position ===
      3
  ) {
    return (
      <Medal className="size-5" />
    );
  }

  return (
    <span className="text-sm font-black">
      {position}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*                                MÉTADONNÉES                                 */
/* -------------------------------------------------------------------------- */

export async function generateMetadata({
  params,
}: ContestDetailsPageProps): Promise<Metadata> {
  const {
    slug,
  } =
    await params;

  const contest =
    await getPublicContestDetails({
      slug,
      userId:
        null,
    });

  if (
    !contest
  ) {
    return {
      title:
        "Concours introuvable",
    };
  }

  return {
    title:
      contest.title,

    description:
      contest.description,

    openGraph: {
      title:
        contest.title,

      description:
        contest.description,

      images:
        contest.imageUrl
          ? [
              {
                url:
                  contest.imageUrl,
              },
            ]
          : undefined,
    },
  };
}

/* -------------------------------------------------------------------------- */
/*                                 CLASSEMENT                                 */
/* -------------------------------------------------------------------------- */

async function ContestLeaderboard({
  contest,
}: {
  contest:
    NonNullable<
      Awaited<
        ReturnType<
          typeof getPublicContestDetails
        >
      >
    >;
}) {
  return (
    <section className="rounded-[2rem] border border-[#35242B]/8 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#A44E69]">
            Classement
          </p>

          <h2 className="mt-3 font-serif text-4xl text-[#35242B]">
            Classement actuel
          </h2>

          <p className="mt-3 max-w-xl text-sm leading-7 text-[#6F5962]">
            Le classement évolue selon les points et les votes
            enregistrés pendant toute la durée du concours.
          </p>
        </div>

        <span className="inline-flex items-center gap-2 self-start rounded-full bg-[#FFF0F4] px-4 py-2 text-sm font-semibold text-[#8B405A]">
          <UsersRound className="size-4" />

          {contest.participantCount} participante
          {contest.participantCount !==
          1
            ? "s"
            : ""}
        </span>
      </div>

      {contest.leaderboard.length >
      0 ? (
        <div className="mt-7 space-y-3">
          {contest.leaderboard.map(
            (
              entry,
            ) => (
              <article
                key={
                  entry.participantId
                }
                className={[
                  "flex items-center gap-3 rounded-2xl border p-3.5 sm:gap-4 sm:p-4",
                  entry.position ===
                    1
                    ? "border-[#D6B679]/55 bg-[#FFFDF4]"
                    : "border-[#35242B]/7 bg-[#FFFAFB]",
                ].join(
                  " ",
                )}
              >
                <span
                  className={[
                    "grid size-10 shrink-0 place-items-center rounded-full",
                    getPositionClasses(
                      entry.position,
                    ),
                  ].join(
                    " ",
                  )}
                >
                  {getPositionIcon(
                    entry.position,
                  )}
                </span>

                {entry.imageUrl ? (
                  <span className="relative size-11 shrink-0 overflow-hidden rounded-full border-2 border-white bg-[#F6E7EB] shadow-sm">
                    <Image
                      src={
                        entry.imageUrl
                      }
                      alt={
                        entry.displayName
                      }
                      fill
                      sizes="44px"
                      className="object-cover"
                    />
                  </span>
                ) : (
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#E8B3C3] to-[#A64D69] font-serif text-lg font-bold text-white">
                    {entry.displayName
                      .charAt(
                        0,
                      )
                      .toLocaleUpperCase(
                        "fr-FR",
                      )}
                  </span>
                )}

                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-[#35242B]">
                    {entry.displayName}
                  </p>

                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#6F5962]">
                    <span>
                      {entry.points} point
                      {entry.points !==
                      1
                        ? "s"
                        : ""}
                    </span>

                    {entry.votes >
                    0 ? (
                      <span>
                        {entry.votes} vote
                        {entry.votes !==
                        1
                          ? "s"
                          : ""}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-xl font-black text-[#8B405A]">
                    {entry.totalScore}
                  </p>

                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8C747D]">
                    score
                  </p>
                </div>
              </article>
            ),
          )}
        </div>
      ) : (
        <div className="mt-7 rounded-2xl border border-dashed border-[#E8B3C3] bg-[#FFFAFB] px-6 py-12 text-center">
          <Trophy className="mx-auto size-9 text-[#A64D69]" />

          <h3 className="mt-4 font-serif text-2xl text-[#35242B]">
            Le classement est encore vide
          </h3>

          <p className="mt-2 text-sm text-[#6F5962]">
            Les premières participantes apparaîtront ici.
          </p>
        </div>
      )}
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  GAGNANTS                                  */
/* -------------------------------------------------------------------------- */

async function ContestWinners({
  contest,
}: {
  contest:
    NonNullable<
      Awaited<
        ReturnType<
          typeof getPublicContestDetails
        >
      >
    >;
}) {
  if (
    contest.winners.length ===
    0
  ) {
    return null;
  }

  return (
    <section className="rounded-[2rem] border border-[#D6B679]/40 bg-[#FFF9E9] p-6 sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9B7628]">
        Résultats officiels
      </p>

      <h2 className="mt-3 font-serif text-4xl text-[#4F3D1D]">
        Les gagnantes
      </h2>

      <div className="mt-7 grid gap-4 md:grid-cols-2">
        {contest.winners.map(
          (
            winner,
          ) => (
            <article
              key={
                winner.id
              }
              className="flex items-start gap-4 rounded-2xl border border-[#D6B679]/35 bg-white p-5 shadow-sm"
            >
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-[#FFF4CF] text-[#9B7628]">
                {getPositionIcon(
                  winner.position,
                )}
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#A58542]">
                  {winner.position}
                  {winner.position ===
                  1
                    ? "re"
                    : "e"}{" "}
                  place
                </p>

                <p className="mt-1 font-serif text-2xl font-semibold text-[#4F3D1D]">
                  {winner.displayName}
                </p>

                {winner.prizeName ? (
                  <p className="mt-3 font-semibold text-[#35242B]">
                    {winner.prizeName}
                  </p>
                ) : null}

                {winner.prizeDescription ? (
                  <p className="mt-1 text-sm leading-6 text-[#6F5962]">
                    {winner.prizeDescription}
                  </p>
                ) : null}

                {winner.prizeValueCents !==
                null ? (
                  <p className="mt-2 text-sm font-bold text-[#9B7628]">
                    Valeur :{" "}
                    {formatPrice(
                      winner.prizeValueCents,
                    )}
                  </p>
                ) : null}
              </div>
            </article>
          ),
        )}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   PAGE                                     */
/* -------------------------------------------------------------------------- */

export default async function ContestDetailsPage({
  params,
}: ContestDetailsPageProps) {
  const [
    {
      slug,
    },
    currentUser,
    websiteSettings,
  ] =
    await Promise.all([
      params,
      getCurrentUser(),
      getPublicWebsiteSettings(),
    ]);

  const contest =
    await getPublicContestDetails({
      slug,
      userId:
        currentUser?.id ??
        null,
    });

  if (
    !contest
  ) {
    notFound();
  }

  const imageUrl =
    contest.imageUrl ??
    websiteSettings.socialShareImageUrl ??
    websiteSettings.homeHeroImageUrl ??
    websiteSettings.defaultServiceImageUrl;

  const isAlreadyParticipating =
    Boolean(
      contest.currentParticipation,
    );

  return (
    <main className="bg-[#FFFAFB]">
      {/* ------------------------------------------------------------------ */}
      {/*                               HERO                                 */}
      {/* ------------------------------------------------------------------ */}

      <section className="relative min-h-[620px] overflow-hidden bg-[#35242B]">
        {imageUrl ? (
          <>
            <Image
              src={
                imageUrl
              }
              alt={
                contest.title
              }
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-r from-[#35242B]/95 via-[#35242B]/75 to-[#35242B]/25" />

            <div className="absolute inset-0 bg-gradient-to-t from-[#35242B] via-transparent to-[#35242B]/20" />
          </>
        ) : (
          <>
            <div className="absolute -left-32 top-0 size-[500px] rounded-full bg-[#A64D69]/35 blur-3xl" />

            <div className="absolute -right-32 bottom-0 size-[500px] rounded-full bg-[#D6B679]/25 blur-3xl" />
          </>
        )}

        <div className="relative mx-auto flex min-h-[620px] max-w-7xl flex-col justify-between px-5 py-10 lg:px-8 lg:py-14">
          <Link
            href="/concours"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
          >
            <ArrowLeft className="size-4" />

            Retour aux concours
          </Link>

          <div className="max-w-4xl py-14">
            <div className="flex flex-wrap gap-3">
              {contest.isActive ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700">
                  <Sparkles className="size-4" />

                  Concours en cours
                </span>
              ) : null}

              {contest.isUpcoming ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-[#8B405A]">
                  <Clock3 className="size-4" />

                  Prochainement
                </span>
              ) : null}

              {contest.hasEnded ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-[#6F5962]">
                  <Trophy className="size-4" />

                  Concours terminé
                </span>
              ) : null}
            </div>

            <h1 className="mt-6 font-serif text-5xl font-semibold leading-[1.02] text-white sm:text-6xl lg:text-7xl">
              {contest.title}
            </h1>

            <p className="mt-7 max-w-3xl text-base leading-8 text-white/75 sm:text-lg">
              {contest.description}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur">
                <CalendarDays className="size-4 text-[#E8B3C3]" />

                Du{" "}
                {formatDate(
                  contest.startsAt,
                )}{" "}
                au{" "}
                {formatDate(
                  contest.endsAt,
                )}
              </span>

              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur">
                <UsersRound className="size-4 text-[#E8B3C3]" />

                {contest.participantCount} participante
                {contest.participantCount !==
                1
                  ? "s"
                  : ""}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*                         INFORMATIONS PRINCIPALES                     */}
      {/* ------------------------------------------------------------------ */}

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-16 lg:grid-cols-[1fr_380px] lg:px-8 lg:py-24">
        <div className="space-y-8">
          <section className="rounded-[2rem] border border-[#35242B]/8 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#A44E69]">
              Présentation
            </p>

            <h2 className="mt-3 font-serif text-4xl text-[#35242B]">
              À propos du concours
            </h2>

            <p className="mt-5 whitespace-pre-line text-base leading-8 text-[#79636C]">
              {contest.description}
            </p>
          </section>

          <section className="rounded-[2rem] border border-[#D6B679]/40 bg-[#FFF9E9] p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-white text-[#9B7628] shadow-sm">
                <Gift className="size-7" />
              </span>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A58542]">
                  Lot à gagner
                </p>

                <h2 className="mt-3 font-serif text-3xl font-semibold text-[#4F3D1D]">
                  {contest.prize}
                </h2>
              </div>
            </div>
          </section>

          {contest.rules ? (
            <section className="rounded-[2rem] border border-[#35242B]/8 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-start gap-4">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#FFF0F4] text-[#8B405A]">
                  <ShieldCheck className="size-6" />
                </span>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#A44E69]">
                    Règlement
                  </p>

                  <h2 className="mt-3 font-serif text-4xl text-[#35242B]">
                    Conditions de participation
                  </h2>
                </div>
              </div>

              <div className="mt-6 whitespace-pre-line text-sm leading-8 text-[#79636C]">
                {contest.rules}
              </div>
            </section>
          ) : null}

          <ContestWinners
            contest={
              contest
            }
          />

          <ContestLeaderboard
            contest={
              contest
            }
          />
        </div>

        {/* ---------------------------------------------------------------- */}
        {/*                         CARTE DE PARTICIPATION                    */}
        {/* ---------------------------------------------------------------- */}

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-[2rem] border border-[#35242B]/8 bg-white p-6 shadow-xl shadow-[#8B405A]/8">
            <div className="flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-2xl bg-[#FFF0F4] text-[#8B405A]">
                <Trophy className="size-6" />
              </span>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#A44E69]">
                  Participation
                </p>

                <h2 className="mt-1 font-serif text-2xl text-[#35242B]">
                  Tentez votre chance
                </h2>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-start gap-3 rounded-2xl bg-[#FFFAFB] p-4">
                <CalendarDays className="mt-0.5 size-5 shrink-0 text-[#A64D69]" />

                <div>
                  <p className="text-xs uppercase tracking-[0.12em] text-[#8C747D]">
                    Ouverture
                  </p>

                  <p className="mt-1 text-sm font-bold text-[#35242B]">
                    {formatDateTime(
                      contest.startsAt,
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl bg-[#FFFAFB] p-4">
                <Clock3 className="mt-0.5 size-5 shrink-0 text-[#A64D69]" />

                <div>
                  <p className="text-xs uppercase tracking-[0.12em] text-[#8C747D]">
                    Clôture
                  </p>

                  <p className="mt-1 text-sm font-bold text-[#35242B]">
                    {formatDateTime(
                      contest.endsAt,
                    )}
                  </p>
                </div>
              </div>

              {contest.drawAt ? (
                <div className="flex items-start gap-3 rounded-2xl bg-[#FFFAFB] p-4">
                  <Crown className="mt-0.5 size-5 shrink-0 text-[#A64D69]" />

                  <div>
                    <p className="text-xs uppercase tracking-[0.12em] text-[#8C747D]">
                      Résultat prévu
                    </p>

                    <p className="mt-1 text-sm font-bold text-[#35242B]">
                      {formatDateTime(
                        contest.drawAt,
                      )}
                    </p>
                  </div>
                </div>
              ) : null}

              <div className="flex items-start gap-3 rounded-2xl bg-[#FFFAFB] p-4">
                <UsersRound className="mt-0.5 size-5 shrink-0 text-[#A64D69]" />

                <div>
                  <p className="text-xs uppercase tracking-[0.12em] text-[#8C747D]">
                    Places
                  </p>

                  <p className="mt-1 text-sm font-bold text-[#35242B]">
                    {contest.maximumEntries !==
                    null
                      ? `${contest.participantCount} / ${contest.maximumEntries}`
                      : "Nombre illimité"}
                  </p>
                </div>
              </div>
            </div>

            {contest.currentParticipation ? (
              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-700" />

                <div>
                  <p className="font-semibold text-emerald-800">
                    Participation enregistrée
                  </p>

                  <p className="mt-1 text-xs leading-5 text-emerald-700">
                    Inscrite le{" "}
                    {formatDateTime(
                      contest.currentParticipation
                        .createdAt,
                    )}
                  </p>
                </div>
              </div>
            ) : null}

            <div className="mt-6">
              <PublicContestParticipationButton
                contestId={
                  contest.id
                }
                isAuthenticated={
                  Boolean(
                    currentUser,
                  )
                }
                isAlreadyParticipating={
                  isAlreadyParticipating
                }
                canParticipate={
                  contest.canParticipate
                }
                isUpcoming={
                  contest.isUpcoming
                }
                hasEnded={
                  contest.hasEnded
                }
                isFull={
                  contest.isFull
                }
              />
            </div>

            {contest.requiresAccount ? (
              <p className="mt-4 text-center text-xs leading-5 text-[#6F5962]">
                Un compte cliente actif est nécessaire pour
                participer.
              </p>
            ) : null}
          </div>
        </aside>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*                                RETOUR                              */}
      {/* ------------------------------------------------------------------ */}

      <section className="border-t border-[#35242B]/7 bg-white px-5 py-12 lg:px-8">
        <div className="mx-auto flex max-w-7xl justify-center">
          <Link
            href="/concours"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[#35242B]/10 px-6 text-sm font-semibold text-[#35242B] transition hover:bg-[#FFF0F4]"
          >
            <ArrowLeft className="size-4" />

            Voir tous les concours
          </Link>
        </div>
      </section>
    </main>
  );
}
