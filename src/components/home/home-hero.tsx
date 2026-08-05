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
    <section className="relative overflow-hidden bg-[#FBF3F5]">
      <div className="absolute -left-32 top-20 size-[430px] rounded-full bg-[#E8B3C3]/25 blur-3xl" />

      <div className="absolute -right-40 bottom-0 size-[500px] rounded-full bg-[#D89CB0]/20 blur-3xl" />

      <div className="relative mx-auto grid min-h-[760px] max-w-7xl items-center gap-12 px-5 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
        {/* ---------------------------------------------------------------- */}
        {/*                               TEXTE                              */}
        {/* ---------------------------------------------------------------- */}

        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/90 bg-white/60 px-4 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-[#A44E69] shadow-[0_12px_35px_rgba(91,45,61,0.08)] backdrop-blur-xl">
            <Sparkles className="size-4" />

            Beauté & élégance
          </div>

          <h1 className="mt-7 max-w-3xl font-serif text-5xl leading-[0.98] text-[#35242B] sm:text-6xl lg:text-7xl">
            Sublimez vos ongles avec une création
            <span className="bg-gradient-to-r from-[#A64D69] via-[#C47890] to-[#8B3E59] bg-clip-text italic text-transparent">
              {" "}
              qui vous ressemble.
            </span>
          </h1>

          <p className="mt-7 max-w-xl text-base leading-8 text-[#79636C] sm:text-lg">
            Poses en gel, semi-permanent, gainage et
            nail art sur mesure dans un univers
            élégant, chaleureux et entièrement pensé
            pour vous.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/reservation"
              className="group inline-flex h-14 items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#AA526E] via-[#BD7088] to-[#8B405A] px-7 text-sm font-black text-white shadow-[0_18px_45px_rgba(139,64,90,0.28)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_55px_rgba(139,64,90,0.35)]"
            >
              <CalendarDays className="size-5" />

              Réserver ma prestation
            </Link>

            <Link
              href="/galerie"
              className="inline-flex h-14 items-center justify-center gap-3 rounded-full border border-white/90 bg-white/65 px-7 text-sm font-bold text-[#35242B] shadow-sm backdrop-blur transition hover:bg-white"
            >
              Découvrir la galerie

              <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap gap-x-7 gap-y-4 text-sm text-[#6F5962]">
            <span className="flex items-center gap-2">
              <Check className="size-4 text-[#A64D69]" />

              Prestations sur mesure
            </span>

            <span className="flex items-center gap-2">
              <Check className="size-4 text-[#A64D69]" />

              Réservation en ligne
            </span>

            <span className="flex items-center gap-2">
              <Check className="size-4 text-[#A64D69]" />

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
                      className="size-4 fill-[#D6B778] text-[#D6B778]"
                    />
                  ),
                )}
              </div>

              <span className="text-sm font-semibold">
                5,0
              </span>
            </div>

            <p className="mt-1 text-xs text-[#79636C]">
              Clientes satisfaites
            </p>
          </div>

          <div className="relative aspect-[4/5] overflow-hidden rounded-[44px] border border-[#35242B]/7 bg-gradient-to-br from-[#F6E7EB] via-[#E8C3CF] to-[#B8899A] shadow-2xl shadow-[#8B405A]/20">
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

                <div className="absolute inset-0 bg-gradient-to-t from-[#35242B]/65 via-transparent to-transparent" />
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

          <div className="absolute -bottom-7 -right-1 z-20 rounded-3xl bg-[#35242B] p-5 text-white shadow-2xl sm:-right-3">
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
