import {
  ArrowRight,
  CalendarDays,
  Check,
  Sparkles,
  Star,
} from "lucide-react";

import Image from "next/image";
import Link from "next/link";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type HomeHeroProps = {
  heroImageUrl?: string;

  heroMobileImageUrl?: string;
};

/* -------------------------------------------------------------------------- */
/*                                  COMPOSANT                                 */
/* -------------------------------------------------------------------------- */

export function HomeHero({
  heroImageUrl = "",
  heroMobileImageUrl = "",
}: HomeHeroProps) {
  const mobileImageUrl =
    heroMobileImageUrl ||
    heroImageUrl;

  return (
    <section className="relative overflow-hidden bg-[#FFF9F8]">
      <div className="absolute -left-32 top-20 size-[430px] rounded-full bg-[#E8B4B8]/20 blur-3xl" />

      <div className="absolute -right-40 bottom-0 size-[500px] rounded-full bg-[#C9A36A]/15 blur-3xl" />

      <div className="relative mx-auto grid min-h-[760px] max-w-7xl items-center gap-12 px-5 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
        {/* ---------------------------------------------------------------- */}
        {/*                               TEXTE                              */}
        {/* ---------------------------------------------------------------- */}

        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#B8899A]/20 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#916777] shadow-sm">
            <Sparkles className="size-4" />

            Beauté & élégance
          </div>

          <h1 className="mt-7 max-w-3xl font-serif text-5xl leading-[0.98] text-[#241A1D] sm:text-6xl lg:text-7xl">
            Sublimez vos ongles avec une création
            <span className="text-[#B8899A]">
              {" "}
              qui vous ressemble.
            </span>
          </h1>

          <p className="mt-7 max-w-xl text-base leading-8 text-[#75636A] sm:text-lg">
            Poses en gel, semi-permanent, gainage et
            nail art sur mesure dans un univers
            élégant, chaleureux et entièrement pensé
            pour vous.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/reservation"
              className="inline-flex h-14 items-center justify-center gap-3 rounded-full bg-[#241A1D] px-7 text-sm font-semibold text-white shadow-xl shadow-black/10 transition hover:-translate-y-0.5 hover:bg-[#3A292F]"
            >
              <CalendarDays className="size-5" />

              Réserver ma prestation
            </Link>

            <Link
              href="/galerie"
              className="inline-flex h-14 items-center justify-center gap-3 rounded-full border border-[#241A1D]/10 bg-white px-7 text-sm font-semibold text-[#241A1D] transition hover:bg-[#FFF0F0]"
            >
              Découvrir la galerie

              <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap gap-x-7 gap-y-4 text-sm text-[#5F5056]">
            <span className="flex items-center gap-2">
              <Check className="size-4 text-[#B8899A]" />

              Prestations sur mesure
            </span>

            <span className="flex items-center gap-2">
              <Check className="size-4 text-[#B8899A]" />

              Réservation en ligne
            </span>

            <span className="flex items-center gap-2">
              <Check className="size-4 text-[#B8899A]" />

              Conseils personnalisés
            </span>
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/*                               VISUEL                             */}
        {/* ---------------------------------------------------------------- */}

        <div className="relative mx-auto w-full max-w-xl">
          <div className="absolute -left-3 top-6 z-20 rounded-3xl border border-white/70 bg-white/90 p-4 shadow-xl backdrop-blur sm:-left-6 sm:top-10">
            <div className="flex items-center gap-2">
              <div className="flex">
                {Array.from({
                  length:
                    5,
                }).map(
                  (
                    _,
                    index,
                  ) => (
                    <Star
                      key={
                        index
                      }
                      className="size-4 fill-[#C9A36A] text-[#C9A36A]"
                    />
                  ),
                )}
              </div>

              <span className="text-sm font-semibold">
                5,0
              </span>
            </div>

            <p className="mt-1 text-xs text-[#75636A]">
              Clientes satisfaites
            </p>
          </div>

          <div className="relative aspect-[4/5] overflow-hidden rounded-[44px] border border-[#241A1D]/7 bg-gradient-to-br from-[#F2D7D9] via-[#E7BDC4] to-[#B8899A] shadow-2xl shadow-[#6E4452]/20">
            {heroImageUrl ? (
              <>
                <Image
                  src={
                    mobileImageUrl
                  }
                  alt="Création ongulaire réalisée au Palais des Ongles"
                  fill
                  priority
                  sizes="(max-width: 1023px) 100vw, 1px"
                  className="object-cover lg:hidden"
                />

                <Image
                  src={
                    heroImageUrl
                  }
                  alt="Création ongulaire réalisée au Palais des Ongles"
                  fill
                  priority
                  sizes="(max-width: 1023px) 1px, 45vw"
                  className="hidden object-cover lg:block"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#241A1D]/65 via-transparent to-transparent" />
              </>
            ) : (
              <>
                <div className="absolute inset-5 rounded-[36px] border border-white/30" />

                <div className="absolute left-1/2 top-[44%] size-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/25 blur-3xl" />
              </>
            )}

            <div className="absolute inset-x-6 bottom-8 z-10 rounded-[30px] border border-white/35 bg-white/20 p-6 text-white backdrop-blur-lg sm:inset-x-10 sm:bottom-12">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/75">
                Votre prochain rendez-vous
              </p>

              <h2 className="mt-3 font-serif text-3xl">
                Un moment rien que pour vous
              </h2>

              <p className="mt-3 text-sm leading-6 text-white/75">
                Choisissez votre prestation, votre
                date et envoyez vos inspirations en
                quelques minutes.
              </p>
            </div>
          </div>

          <div className="absolute -bottom-7 -right-1 z-20 rounded-3xl bg-[#241A1D] p-5 text-white shadow-2xl sm:-right-3">
            <p className="font-serif text-3xl">
              90+
            </p>

            <p className="mt-1 text-xs text-white/60">
              jours réservables
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
