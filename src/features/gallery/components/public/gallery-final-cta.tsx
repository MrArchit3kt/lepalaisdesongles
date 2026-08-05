import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Check,
  Heart,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const REASSURANCE_ITEMS = [
  {
    icon: CalendarDays,
    label:
      "Réservation en ligne",
  },
  {
    icon: ShieldCheck,
    label:
      "Prestations soignées",
  },
  {
    icon: Heart,
    label:
      "Conseils personnalisés",
  },
];

export function GalleryFinalCta() {
  return (
    <section className="relative overflow-hidden px-4 pb-20 pt-4 sm:px-6 sm:pb-24 lg:px-8 lg:pb-32">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-[#DCA8B8]/40 bg-gradient-to-br from-[#3B2430] via-[#4A2A3A] to-[#2E1E28] px-6 py-12 shadow-[0_40px_120px_-45px_rgba(139,64,90,0.55)] sm:px-10 sm:py-16 lg:px-16 lg:py-20">
          <div
            aria-hidden="true"
            className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#C47890]/30 blur-3xl"
          />

          <div
            aria-hidden="true"
            className="absolute -bottom-40 -right-24 h-[28rem] w-[28rem] rounded-full bg-[#D6B778]/20 blur-3xl"
          />

          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_38%)]"
          />

          <div className="relative grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_390px] lg:gap-16">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-[#F0C4D3] backdrop-blur">
                <Sparkles className="h-4 w-4" />

                Votre prochaine pose commence ici
              </div>

              <h2 className="mt-6 max-w-3xl font-serif text-3xl font-semibold italic tracking-tight text-white sm:text-4xl lg:text-5xl">
                Une création vous a
                inspirée ?
              </h2>

              <p className="mt-5 max-w-2xl text-base leading-7 text-white/70 sm:text-lg">
                Réservez votre
                rendez-vous en
                quelques instants et
                indiquez vos envies
                lors de votre
                réservation. Vous
                pourrez également
                ajouter vos propres
                photos d’inspiration.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {REASSURANCE_ITEMS.map(
                  ({
                    icon: Icon,
                    label,
                  }) => (
                    <div
                      key={label}
                      className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 backdrop-blur-sm"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-[#E8B3C3]">
                        <Icon className="h-4 w-4" />
                      </span>

                      <span className="text-sm font-semibold text-white">
                        {label}
                      </span>
                    </div>
                  ),
                )}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-5 shadow-2xl backdrop-blur-xl sm:p-6">
              <div className="rounded-[1.5rem] bg-white p-6 sm:p-7">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#A64D69]">
                  Réserver maintenant
                </p>

                <h3 className="mt-3 font-serif text-2xl font-semibold tracking-tight text-[#35242B]">
                  Choisissez votre
                  prestation et votre
                  créneau
                </h3>

                <div className="mt-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#FFF0F4] text-[#A64D69]">
                      <Check className="h-3.5 w-3.5" />
                    </span>

                    <p className="text-sm leading-6 text-[#6F5962]">
                      Durée et tarif
                      calculés
                      automatiquement.
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#FFF0F4] text-[#A64D69]">
                      <Check className="h-3.5 w-3.5" />
                    </span>

                    <p className="text-sm leading-6 text-[#6F5962]">
                      Disponibilités
                      affichées en
                      temps réel.
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#FFF0F4] text-[#A64D69]">
                      <Check className="h-3.5 w-3.5" />
                    </span>

                    <p className="text-sm leading-6 text-[#6F5962]">
                      Photos
                      d’inspiration
                      ajoutables à la
                      réservation.
                    </p>
                  </div>
                </div>

                <Link
                  href="/reservation"
                  className="group mt-7 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#AA526E] via-[#BD7088] to-[#8B405A] px-6 py-4 text-sm font-black text-white shadow-[0_18px_45px_rgba(139,64,90,0.28)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_55px_rgba(139,64,90,0.35)]"
                >
                  Prendre rendez-vous

                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>

                <p className="mt-4 text-center text-xs leading-5 text-[#8C747D]">
                  Réservation simple,
                  rapide et
                  sécurisée.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
