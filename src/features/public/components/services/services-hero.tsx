import {
  ArrowDown,
  CalendarCheck,
  Check,
  Clock3,
  Gem,
  Hand,
  Palette,
  Sparkles,
} from "lucide-react";

type ServicesHeroProps = {
  categoriesCount: number;
  servicesCount: number;
};

const formatNumber = (value: number): string =>
  new Intl.NumberFormat("fr-FR").format(value);

export function ServicesHero({
  categoriesCount,
  servicesCount,
}: ServicesHeroProps) {
  return (
    <section className="relative isolate overflow-hidden border-b border-[#ECD9DF] bg-[#FBF3F5]">
      <div className="pointer-events-none absolute inset-0 -z-30 bg-[linear-gradient(118deg,#F8E8ED_0%,#FFF9FA_42%,#F1DCE3_100%)]" />

      <div className="pointer-events-none absolute inset-0 -z-20 opacity-90 [background-image:radial-gradient(circle_at_10%_16%,rgba(255,255,255,0.98)_0,rgba(255,255,255,0)_29%),radial-gradient(circle_at_86%_16%,rgba(202,124,148,0.20)_0,rgba(202,124,148,0)_32%),radial-gradient(circle_at_53%_88%,rgba(221,183,194,0.30)_0,rgba(221,183,194,0)_36%)]" />

      <div className="pointer-events-none absolute -left-28 top-20 -z-10 size-[24rem] rounded-full bg-[#E8B3C3]/25 blur-[100px]" />

      <div className="pointer-events-none absolute -right-24 top-[-5rem] -z-10 size-[30rem] rounded-full bg-[#D89CB0]/25 blur-[120px]" />

      <div className="pointer-events-none absolute bottom-[-13rem] left-1/3 -z-10 size-[35rem] rounded-full bg-white/80 blur-[110px]" />

      <div className="pointer-events-none absolute left-[7%] top-[16%] hidden size-3 rounded-full bg-white shadow-[0_0_28px_10px_rgba(255,255,255,0.9)] lg:block" />

      <div className="pointer-events-none absolute left-[44%] top-[22%] hidden size-2 rounded-full bg-[#DCA8B8]/60 shadow-[0_0_24px_7px_rgba(220,168,184,0.45)] lg:block" />

      <div className="pointer-events-none absolute right-[8%] top-[12%] hidden size-4 rounded-full bg-white/80 shadow-[0_0_30px_10px_rgba(255,255,255,0.8)] lg:block" />

      <div className="mx-auto max-w-[1440px] px-4 pb-6 pt-6 sm:px-6 sm:pb-10 sm:pt-10 lg:px-8 lg:pb-14 lg:pt-16">
        <div className="grid items-center gap-14 lg:grid-cols-[0.94fr_1.06fr] lg:gap-10 xl:min-h-[700px]">
          <div className="relative z-20 mx-auto w-full max-w-2xl text-center lg:mx-0 lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/90 bg-white/60 px-4 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-[#A44E69] shadow-[0_12px_35px_rgba(91,45,61,0.08)] backdrop-blur-xl">
              <Sparkles className="size-4" />
              Prestations & tarifs
            </div>

            <p className="mt-8 font-serif text-xl italic tracking-wide text-[#A65A73] sm:text-2xl">
              La beauté jusque dans les détails
            </p>

            <h1 className="mt-3 max-w-[12ch] font-serif text-[2.15rem] font-semibold leading-[1.05] tracking-[-0.03em] text-[#35242B] sm:text-[3.4rem] sm:leading-[1] lg:text-[4.8rem] xl:text-[5.3rem]">
              Trouvez la prestation
              <span className="mt-1 block bg-gradient-to-r from-[#A64D69] via-[#C47890] to-[#8B3E59] bg-clip-text pb-2 italic text-transparent">
                qui vous ressemble
              </span>
            </h1>

            <p className="mx-auto mt-7 max-w-xl text-sm leading-7 text-[#79636C] sm:text-base sm:leading-8 lg:mx-0">
              Semi-permanent, gainage, gel, extensions ou nail art&nbsp;:
              découvrez des prestations réalisées avec précision et adaptées à
              vos ongles, à votre style et à toutes vos envies.
            </p>

            <div className="mt-7 flex flex-wrap justify-center gap-3 lg:justify-start">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/90 bg-white/65 px-4 py-2 text-xs font-bold text-[#6F5962] shadow-sm backdrop-blur">
                <Check className="size-4 text-[#A64D69]" />
                Tarifs transparents
              </span>

              <span className="inline-flex items-center gap-2 rounded-full border border-white/90 bg-white/65 px-4 py-2 text-xs font-bold text-[#6F5962] shadow-sm backdrop-blur">
                <Check className="size-4 text-[#A64D69]" />
                Durée indiquée
              </span>

              <span className="inline-flex items-center gap-2 rounded-full border border-white/90 bg-white/65 px-4 py-2 text-xs font-bold text-[#6F5962] shadow-sm backdrop-blur">
                <Check className="size-4 text-[#A64D69]" />
                Réservation en ligne
              </span>
            </div>

            <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start">
              <a
                href="#services-catalog"
                className="group inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#AA526E] via-[#BD7088] to-[#8B405A] px-7 py-4 text-sm font-black text-white shadow-[0_18px_45px_rgba(139,64,90,0.28)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_55px_rgba(139,64,90,0.35)] sm:w-auto"
              >
                <Palette className="size-5 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110" />
                Découvrir les prestations
                <ArrowDown className="size-4 transition-transform duration-300 group-hover:translate-y-1" />
              </a>

              <p className="text-xs font-semibold leading-5 text-[#8B747D]">
                Choisissez votre prestation
                <span className="block">puis votre créneau disponible</span>
              </p>
            </div>

            <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:max-w-lg">
              <div className="rounded-[1.35rem] border border-white/80 bg-white/50 p-4 text-left shadow-[0_14px_35px_rgba(93,47,63,0.06)] backdrop-blur-xl">
                <span className="grid size-9 place-items-center rounded-xl bg-[#FFF0F4] text-[#A64D69]">
                  <Gem className="size-4" />
                </span>

                <p className="mt-3 text-2xl font-black text-[#3B2930]">
                  {formatNumber(servicesCount)}
                </p>

                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8C747D]">
                  Prestations disponibles
                </p>
              </div>

              <div className="rounded-[1.35rem] border border-white/80 bg-white/50 p-4 text-left shadow-[0_14px_35px_rgba(93,47,63,0.06)] backdrop-blur-xl">
                <span className="grid size-9 place-items-center rounded-xl bg-[#FFF0F4] text-[#A64D69]">
                  <Palette className="size-4" />
                </span>

                <p className="mt-3 text-2xl font-black text-[#3B2930]">
                  {formatNumber(categoriesCount)}
                </p>

                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8C747D]">
                  Catégories de soins
                </p>
              </div>
            </div>
          </div>

          <div className="relative z-10 mx-auto flex min-h-[260px] w-full max-w-[720px] items-center justify-center sm:min-h-[400px] lg:min-h-[620px]">
            <div className="pointer-events-none absolute left-1/2 top-1/2 size-[23rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/65 bg-white/20 shadow-[inset_0_0_80px_rgba(255,255,255,0.75),0_35px_100px_rgba(115,56,76,0.10)] backdrop-blur-sm sm:size-[31rem]" />

            <div className="pointer-events-none absolute left-[6%] top-[12%] size-28 rounded-full bg-[#D99DB0]/25 blur-2xl sm:size-40" />

            <div className="pointer-events-none absolute bottom-[10%] right-[2%] size-36 rounded-full bg-white/80 blur-3xl sm:size-52" />

            <div className="relative flex w-full max-w-[590px] items-center justify-center">
              <div className="absolute bottom-[1%] left-1/2 h-24 w-[72%] -translate-x-1/2 rounded-[50%] bg-[#7A3E53]/20 blur-3xl" />

              <div className="relative z-10 flex size-[305px] items-center justify-center rounded-full border border-white/80 bg-[radial-gradient(circle_at_38%_30%,rgba(255,255,255,0.95),rgba(255,238,243,0.75)_42%,rgba(224,156,177,0.72)_100%)] shadow-[0_35px_90px_rgba(105,48,69,0.22),inset_0_1px_0_rgba(255,255,255,0.95)] sm:size-[400px]">
                <div className="absolute inset-5 rounded-full border border-white/55" />
                <div className="absolute inset-12 rounded-full border border-white/45" />

                <div className="relative flex size-44 items-center justify-center rounded-full border border-white/80 bg-white/55 shadow-[0_22px_50px_rgba(117,56,77,0.15)] backdrop-blur-xl sm:size-56">
                  <Hand className="size-24 text-[#9B4964] drop-shadow-[0_16px_22px_rgba(125,58,82,0.25)] sm:size-32" />

                  <span className="absolute -right-2 top-5 grid size-11 place-items-center rounded-full border border-white bg-white/90 text-[#B86680] shadow-lg">
                    <Sparkles className="size-5" />
                  </span>
                </div>
              </div>

              <div className="absolute left-[1%] top-[11%] z-20 rotate-[-7deg] rounded-[1.5rem] border border-white/85 bg-white/70 px-5 py-4 shadow-[0_20px_45px_rgba(98,47,65,0.13)] backdrop-blur-xl sm:left-[4%]">
                <Gem className="size-6 text-[#A64D69]" />

                <p className="mt-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#7E6670]">
                  Finitions soignées
                </p>
              </div>

              <div className="absolute right-[0%] top-[19%] z-20 rotate-[7deg] rounded-[1.5rem] border border-white/85 bg-white/70 px-5 py-4 shadow-[0_20px_45px_rgba(98,47,65,0.13)] backdrop-blur-xl sm:right-[2%]">
                <Palette className="size-6 text-[#A64D69]" />

                <p className="mt-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#7E6670]">
                  Style personnalisé
                </p>
              </div>

              <div className="absolute bottom-[7%] left-[5%] z-20 rotate-[5deg] rounded-[1.5rem] border border-white/85 bg-white/70 px-5 py-4 shadow-[0_20px_45px_rgba(98,47,65,0.13)] backdrop-blur-xl sm:left-[9%]">
                <Clock3 className="size-6 text-[#A64D69]" />

                <p className="mt-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#7E6670]">
                  Durée maîtrisée
                </p>
              </div>

              <div className="absolute bottom-[4%] right-[2%] z-20 rotate-[-6deg] rounded-[1.5rem] border border-white/85 bg-white/70 px-5 py-4 shadow-[0_20px_45px_rgba(98,47,65,0.13)] backdrop-blur-xl sm:right-[6%]">
                <CalendarCheck className="size-6 text-[#A64D69]" />

                <p className="mt-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#7E6670]">
                  Créneaux en ligne
                </p>
              </div>

              <div className="pointer-events-none absolute left-[17%] top-[45%] size-2 rounded-full bg-white shadow-[0_0_20px_8px_rgba(255,255,255,0.9)]" />

              <div className="pointer-events-none absolute right-[15%] top-[43%] size-2 rounded-full bg-white shadow-[0_0_20px_8px_rgba(255,255,255,0.9)]" />
            </div>
          </div>
        </div>

        <div className="relative z-20 mt-8 overflow-hidden rounded-[2rem] border border-white/80 bg-white/55 shadow-[0_24px_65px_rgba(96,48,65,0.08)] backdrop-blur-2xl lg:mt-4">
          <div className="grid sm:grid-cols-3">
            <div className="flex items-center gap-4 px-4 py-3.5 sm:px-6 sm:py-5 lg:py-6">
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl border border-[#F0DCE3] bg-[#FFF7F9] text-[#A64D69] shadow-sm">
                <Gem className="size-5" />
              </span>

              <div>
                <p className="text-xs font-black text-[#3D2A32]">
                  Travail minutieux
                </p>

                <p className="mt-1 text-[10px] leading-5 text-[#8A737C]">
                  Chaque finition est réalisée avec précision
                </p>
              </div>
            </div>

            <div className="relative flex items-center gap-4 px-4 py-3.5 sm:px-6 sm:py-5 lg:py-6">
              <div className="absolute left-0 top-1/2 hidden h-10 w-px -translate-y-1/2 bg-[#EAD4DC] sm:block" />

              <span className="grid size-11 shrink-0 place-items-center rounded-2xl border border-[#F0DCE3] bg-[#FFF7F9] text-[#A64D69] shadow-sm">
                <Palette className="size-5" />
              </span>

              <div>
                <p className="text-xs font-black text-[#3D2A32]">
                  Résultat personnalisé
                </p>

                <p className="mt-1 text-[10px] leading-5 text-[#8A737C]">
                  Une prestation adaptée à votre style
                </p>
              </div>
            </div>

            <div className="relative flex items-center gap-4 px-4 py-3.5 sm:px-6 sm:py-5 lg:py-6">
              <div className="absolute left-0 top-1/2 hidden h-10 w-px -translate-y-1/2 bg-[#EAD4DC] sm:block" />

              <span className="grid size-11 shrink-0 place-items-center rounded-2xl border border-[#F0DCE3] bg-[#FFF7F9] text-[#A64D69] shadow-sm">
                <CalendarCheck className="size-5" />
              </span>

              <div>
                <p className="text-xs font-black text-[#3D2A32]">
                  Réservation rapide
                </p>

                <p className="mt-1 text-[10px] leading-5 text-[#8A737C]">
                  Sélectionnez facilement votre prochain créneau
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
