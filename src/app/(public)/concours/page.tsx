import type {
  Metadata,
} from "next";

import {
  ArrowRight,
  CalendarDays,
  Clock3,
  Crown,
  Gift,
  Hourglass,
  Medal,
  Sparkles,
  Trophy,
  UserPlus,
  UsersRound,
} from "lucide-react";

import Image from "next/image";
import Link from "next/link";

import {
  getPublicWebsiteSettings,
} from "@/features/admin/settings/services/admin-settings.service";

import {
  getPublicContestsPageData,
  type PublicActiveContest,
  type PublicUpcomingContest,
} from "@/features/public/services/public-contests.service";

/* -------------------------------------------------------------------------- */
/*                                MÉTADONNÉES                                 */
/* -------------------------------------------------------------------------- */

export const metadata:
  Metadata = {
  title:
    "Concours et classements",

  description:
    "Découvrez les concours en cours et à venir du Palais des Ongles, les lots à gagner et les classements actuels.",
};

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

function getContestImage(
  contest: {
    imageUrl:
      string | null;
  },

  defaultImageUrl:
    string,
): string {
  return (
    contest.imageUrl ??
    defaultImageUrl
  );
}

function getPositionIcon(
  position: number,
) {
  switch (
    position
  ) {
    case 1:
      return (
        <Crown className="size-5" />
      );

    case 2:
    case 3:
      return (
        <Medal className="size-5" />
      );

    default:
      return (
        <span className="text-sm font-black">
          {position}
        </span>
      );
  }
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
      return "bg-[#FFF0F4] text-[#843F59]";
  }
}

/* -------------------------------------------------------------------------- */
/*                             CLASSEMENT ACTUEL                              */
/* -------------------------------------------------------------------------- */

function ContestLeaderboard({
  contest,
}: {
  contest:
    PublicActiveContest;
}) {
  const entries =
    contest.leaderboard.slice(
      0,
      10,
    );

  return (
    <section className="rounded-[2rem] border border-[#241A1D]/8 bg-[#FFF9F8] p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A06F81]">
            Classement actuel
          </p>

          <h3 className="mt-2 font-serif text-3xl text-[#241A1D]">
            Les participantes en tête
          </h3>
        </div>

        <div className="inline-flex items-center gap-2 self-start rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#6D5A62] shadow-sm">
          <UsersRound className="size-4 text-[#A27384]" />

          {contest.participantCount} participante
          {contest.participantCount !==
          1
            ? "s"
            : ""}
        </div>
      </div>

      {entries.length >
      0 ? (
        <div className="mt-6 space-y-3">
          {entries.map(
            (
              entry,
            ) => (
              <article
                key={
                  entry.participantId
                }
                className={[
                  "flex items-center gap-4 rounded-2xl border p-3.5 transition",
                  entry.position ===
                    1
                    ? "border-[#D6B679]/55 bg-[#FFFDF4]"
                    : "border-[#241A1D]/7 bg-white",
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
                  <span className="relative size-11 shrink-0 overflow-hidden rounded-full border-2 border-white bg-[#F2D7D9] shadow-sm">
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
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#E8B4C0] to-[#B45F7A] font-serif text-lg font-bold text-white">
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
                  <p className="truncate font-semibold text-[#241A1D]">
                    {entry.displayName}
                  </p>

                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#816D75]">
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
                  <p className="text-xl font-black text-[#843F59]">
                    {entry.totalScore}
                  </p>

                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9B868E]">
                    score
                  </p>
                </div>
              </article>
            ),
          )}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-[#E8B4C0] bg-white px-5 py-10 text-center">
          <Trophy className="mx-auto size-8 text-[#B45F7A]" />

          <p className="mt-3 font-semibold text-[#241A1D]">
            Le classement est encore vide
          </p>

          <p className="mt-2 text-sm text-[#816D75]">
            Les premières participations apparaîtront ici.
          </p>
        </div>
      )}

      {contest.leaderboard.length >
      10 ? (
        <p className="mt-4 text-center text-xs text-[#816D75]">
          Les 10 premières places sont affichées.
        </p>
      ) : null}
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                            CONCOURS EN COURS                               */
/* -------------------------------------------------------------------------- */

function ActiveContestCard({
  contest,
  defaultImageUrl,
}: {
  contest:
    PublicActiveContest;

  defaultImageUrl:
    string;
}) {
  const imageUrl =
    getContestImage(
      contest,
      defaultImageUrl,
    );

  return (
    <article className="overflow-hidden rounded-[2.5rem] border border-[#241A1D]/8 bg-white shadow-xl shadow-[#6B4451]/8">
      <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative min-h-[420px] overflow-hidden bg-gradient-to-br from-[#E8B4C0] to-[#843F59]">
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
                sizes="(max-width: 1023px) 100vw, 45vw"
                className="object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#241A1D]/85 via-[#241A1D]/20 to-transparent" />
            </>
          ) : (
            <>
              <div className="absolute -left-20 top-10 size-72 rounded-full bg-white/20 blur-3xl" />

              <div className="absolute -bottom-20 right-0 size-72 rounded-full bg-[#D6B679]/25 blur-3xl" />

              <Trophy className="absolute left-1/2 top-1/2 size-32 -translate-x-1/2 -translate-y-1/2 text-white/35" />
            </>
          )}

          <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-4 p-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50/95 px-4 py-2 text-xs font-bold text-emerald-700 shadow-lg backdrop-blur">
              <Sparkles className="size-4" />

              Concours en cours
            </span>
          </div>

          <div className="absolute inset-x-0 bottom-0 p-7 text-white sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/65">
              Jusqu’au{" "}
              {formatDate(
                contest.endsAt,
              )}
            </p>

            <h2 className="mt-3 font-serif text-4xl font-semibold leading-tight sm:text-5xl">
              {contest.title}
            </h2>

            <p className="mt-4 line-clamp-4 max-w-xl text-sm leading-7 text-white/75">
              {contest.description}
            </p>
          </div>
        </div>

        <div className="flex flex-col p-6 sm:p-8">
          <div className="rounded-[1.75rem] border border-[#D6B679]/40 bg-[#FFF9E9] p-5">
            <div className="flex items-start gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white text-[#9B7628] shadow-sm">
                <Gift className="size-6" />
              </span>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#A58542]">
                  Lot à gagner
                </p>

                <p className="mt-2 font-serif text-2xl font-semibold text-[#4F3D1D]">
                  {contest.prize}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-2xl bg-[#FFF9F8] p-4">
              <CalendarDays className="mt-0.5 size-5 shrink-0 text-[#A27384]" />

              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-[#9A858D]">
                  Fin du concours
                </p>

                <p className="mt-1 text-sm font-bold text-[#241A1D]">
                  {formatDate(
                    contest.endsAt,
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl bg-[#FFF9F8] p-4">
              <UsersRound className="mt-0.5 size-5 shrink-0 text-[#A27384]" />

              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-[#9A858D]">
                  Participantes
                </p>

                <p className="mt-1 text-sm font-bold text-[#241A1D]">
                  {contest.participantCount}
                  {contest.maximumEntries !==
                  null
                    ? ` / ${contest.maximumEntries}`
                    : ""}
                </p>
              </div>
            </div>

            {contest.drawAt ? (
              <div className="flex items-start gap-3 rounded-2xl bg-[#FFF9F8] p-4">
                <Trophy className="mt-0.5 size-5 shrink-0 text-[#A27384]" />

                <div>
                  <p className="text-xs uppercase tracking-[0.12em] text-[#9A858D]">
                    Résultat prévu
                  </p>

                  <p className="mt-1 text-sm font-bold text-[#241A1D]">
                    {formatDate(
                      contest.drawAt,
                    )}
                  </p>
                </div>
              </div>
            ) : null}

            {contest.remainingEntries !==
            null ? (
              <div className="flex items-start gap-3 rounded-2xl bg-[#FFF9F8] p-4">
                <UserPlus className="mt-0.5 size-5 shrink-0 text-[#A27384]" />

                <div>
                  <p className="text-xs uppercase tracking-[0.12em] text-[#9A858D]">
                    Places restantes
                  </p>

                  <p className="mt-1 text-sm font-bold text-[#241A1D]">
                    {contest.remainingEntries}
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          <div className="mt-auto pt-6">
            <Link
              href={`/concours/${contest.slug}`}
              className="inline-flex h-13 w-full items-center justify-center gap-2 rounded-full bg-[#241A1D] px-6 text-sm font-semibold text-white shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-[#3B292F]"
            >
              Voir le concours et participer

              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-[#241A1D]/7 p-6 sm:p-8">
        <ContestLeaderboard
          contest={
            contest
          }
        />
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/*                            CONCOURS À VENIR                                */
/* -------------------------------------------------------------------------- */

function UpcomingContestCard({
  contest,
  defaultImageUrl,
}: {
  contest:
    PublicUpcomingContest;

  defaultImageUrl:
    string;
}) {
  const imageUrl =
    getContestImage(
      contest,
      defaultImageUrl,
    );

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[2rem] border border-[#241A1D]/8 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#6B4451]/10">
      <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-[#F2D7D9] to-[#B8899A]">
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
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition duration-500 group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#241A1D]/75 via-transparent to-[#241A1D]/10" />
          </>
        ) : (
          <div className="grid size-full place-items-center">
            <Trophy className="size-20 text-white/55" />
          </div>
        )}

        <span className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-xs font-bold text-[#843F59] shadow-lg backdrop-blur">
          <Hourglass className="size-4" />

          À venir
        </span>

        <div className="absolute inset-x-5 bottom-5 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
            Début le{" "}
            {formatDate(
              contest.startsAt,
            )}
          </p>

          <h3 className="mt-2 font-serif text-3xl font-semibold leading-tight">
            {contest.title}
          </h3>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <p className="line-clamp-3 text-sm leading-7 text-[#75636A]">
          {contest.description}
        </p>

        <div className="mt-5 flex items-start gap-3 rounded-2xl bg-[#FFF9E9] p-4">
          <Gift className="mt-0.5 size-5 shrink-0 text-[#9B7628]" />

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#A58542]">
              Lot à gagner
            </p>

            <p className="mt-1 font-semibold text-[#4F3D1D]">
              {contest.prize}
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl bg-[#FFF9F8] p-4">
            <Clock3 className="size-4 text-[#A27384]" />

            <p className="mt-2 text-xs text-[#9A858D]">
              Ouverture
            </p>

            <p className="mt-1 font-semibold text-[#241A1D]">
              {formatDate(
                contest.startsAt,
              )}
            </p>
          </div>

          <div className="rounded-2xl bg-[#FFF9F8] p-4">
            <CalendarDays className="size-4 text-[#A27384]" />

            <p className="mt-2 text-xs text-[#9A858D]">
              Clôture
            </p>

            <p className="mt-1 font-semibold text-[#241A1D]">
              {formatDate(
                contest.endsAt,
              )}
            </p>
          </div>
        </div>

        <div className="mt-auto pt-6">
          <Link
            href={`/concours/${contest.slug}`}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-[#241A1D]/10 bg-white px-6 text-sm font-semibold text-[#241A1D] transition hover:bg-[#FFF0F0]"
          >
            Découvrir le concours

            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   PAGE                                     */
/* -------------------------------------------------------------------------- */

export default async function ContestsPage() {
  const [
    data,
    websiteSettings,
  ] =
    await Promise.all([
      getPublicContestsPageData(),
      getPublicWebsiteSettings(),
    ]);

  const defaultImageUrl =
    websiteSettings.socialShareImageUrl ||
    websiteSettings.homeHeroImageUrl ||
    websiteSettings.defaultServiceImageUrl;

  return (
    <main className="bg-[#FFF9F8]">
      {/* ------------------------------------------------------------------ */}
      {/*                               HERO                                 */}
      {/* ------------------------------------------------------------------ */}

      <section className="relative overflow-hidden border-b border-[#241A1D]/7">
        <div className="absolute -left-36 top-0 size-[430px] rounded-full bg-[#E8B4B8]/25 blur-3xl" />

        <div className="absolute -right-32 bottom-0 size-[430px] rounded-full bg-[#D6B679]/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#B8899A]/20 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#956B7B] shadow-sm">
              <Trophy className="size-4" />

              Jeux concours
            </div>

            <h1 className="mt-7 font-serif text-5xl leading-[1.02] text-[#241A1D] sm:text-6xl lg:text-7xl">
              Participez, progressez et
              <span className="text-[#B8899A]">
                {" "}
                remportez de beaux lots.
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-8 text-[#75636A] sm:text-lg">
              Découvrez les concours en cours, suivez les
              classements en direct et préparez-vous pour les
              prochains événements du salon.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <span className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#241A1D] shadow-sm">
                {data.statistics.activeCount} concours en cours
              </span>

              <span className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#241A1D] shadow-sm">
                {data.statistics.upcomingCount} à venir
              </span>

              <span className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#241A1D] shadow-sm">
                {data.statistics.totalParticipants} participation
                {data.statistics.totalParticipants !==
                1
                  ? "s"
                  : ""}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*                         CONCOURS EN COURS                            */}
      {/* ------------------------------------------------------------------ */}

      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#A06F81]">
            En ce moment
          </p>

          <h2 className="mt-4 font-serif text-4xl text-[#241A1D] sm:text-5xl">
            Concours en cours
          </h2>

          <p className="mt-4 max-w-2xl leading-7 text-[#75636A]">
            Consultez les lots, les conditions et le classement
            actualisé de chaque concours actif.
          </p>
        </div>

        {data.activeContests.length >
        0 ? (
          <div className="mt-10 space-y-10">
            {data.activeContests.map(
              (
                contest,
              ) => (
                <ActiveContestCard
                  key={
                    contest.id
                  }
                  contest={
                    contest
                  }
                  defaultImageUrl={
                    defaultImageUrl
                  }
                />
              ),
            )}
          </div>
        ) : (
          <div className="mt-10 rounded-[2rem] border border-dashed border-[#241A1D]/15 bg-white px-6 py-16 text-center">
            <span className="mx-auto grid size-16 place-items-center rounded-full bg-[#FFF0F4] text-[#B45F7A]">
              <Trophy className="size-7" />
            </span>

            <h3 className="mt-5 font-serif text-3xl text-[#241A1D]">
              Aucun concours en cours
            </h3>

            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#75636A]">
              Consultez les concours à venir pour connaître les
              prochaines dates et les futurs lots à gagner.
            </p>
          </div>
        )}
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*                         CONCOURS À VENIR                            */}
      {/* ------------------------------------------------------------------ */}

      {data.upcomingContests.length >
      0 ? (
        <section className="bg-white py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#A06F81]">
                Prochainement
              </p>

              <h2 className="mt-4 font-serif text-4xl text-[#241A1D] sm:text-5xl">
                Concours à venir
              </h2>

              <p className="mt-4 max-w-2xl leading-7 text-[#75636A]">
                Découvrez les prochains concours et les cadeaux
                qui seront mis en jeu.
              </p>
            </div>

            <div className="mt-10 grid gap-7 md:grid-cols-2">
              {data.upcomingContests.map(
                (
                  contest,
                ) => (
                  <UpcomingContestCard
                    key={
                      contest.id
                    }
                    contest={
                      contest
                    }
                    defaultImageUrl={
                      defaultImageUrl
                    }
                  />
                ),
              )}
            </div>
          </div>
        </section>
      ) : null}

      {/* ------------------------------------------------------------------ */}
      {/*                                CTA                                 */}
      {/* ------------------------------------------------------------------ */}

      <section className="px-5 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto flex max-w-7xl flex-col gap-7 rounded-[2.5rem] bg-[#241A1D] p-8 text-white sm:p-12 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#E8B4B8]">
              Espace cliente
            </p>

            <h2 className="mt-4 font-serif text-4xl">
              Connectez-vous pour participer aux concours.
            </h2>

            <p className="mt-4 max-w-2xl leading-7 text-white/60">
              Votre compte vous permet de suivre vos participations,
              vos résultats et les récompenses remportées.
            </p>
          </div>

          <Link
            href="/connexion"
            className="inline-flex h-13 shrink-0 items-center justify-center gap-2 rounded-full bg-white px-7 text-sm font-semibold text-[#241A1D] transition hover:bg-[#FFF0F0]"
          >
            <UserPlus className="size-4" />

            Accéder à mon compte
          </Link>
        </div>
      </section>
    </main>
  );
}
