import {
  ArrowDown,
  BadgePercent,
  CalendarDays,
  Gift,
  Sparkles,
  Tag,
  TicketCheck,
} from "lucide-react";

type PromotionsHeroProps = {
  activeCount: number;
  upcomingCount: number;
};

const formatNumber = (value: number): string =>
  new Intl.NumberFormat("fr-FR").format(value);

export function PromotionsHero({
  activeCount,
  upcomingCount,
}: PromotionsHeroProps) {
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

      <div className="mx-auto max-w-[1440px] px-4 pb-10 pt-10 sm:px-6 sm:pb-12 sm:pt-14 lg:px-8 lg:pb-14 lg:pt-16">
        <div className="grid min-h-[650px] items-center gap-12 lg:grid-cols-[0.94fr_1.06fr] lg:gap-10 xl:min-h-[700px]">
          <div className="relative z-20 mx-auto max-w-2xl text-center lg:mx-0 lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/90 bg-white/60 px-4 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-[#A44E69] shadow-[0_12px_35px_rgba(91,45,61,0.08)] backdrop-blur-xl">
              <Sparkles className="size-4" />
              Offres exclusives
            </div>

            <p className="mt-8 font-serif text-xl italic tracking-wide text-[#A65A73] sm:text-2xl">
              Profitez de chaque occasion
            </p>

            <h1 className="mt-2 font-serif text-[3.5rem] font-semibold leading-[0.9] tracking-[-0.055em] text-[#35242B] sm:text-[4.8rem] lg:text-[5.4rem] xl:text-[6.1rem]">
              Nos
              <span className="block bg-gradient-to-r from-[#A64D69] via-[#C47890] to-[#8B3E59] bg-clip-text italic text-transparent">
                promotions
              </span>
            </h1>

            <p className="mx-auto mt-7 max-w-xl text-sm leading-7 text-[#79636C] sm:text-base sm:leading-8 lg:mx-0">
              Découvrez les offres du Palais des Ongles et profitez de tarifs
              privilégiés sur une sélection de prestations. Retrouvez les codes,
              périodes de validité et conditions de chaque promotion.
            </p>

            <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start">
              <a
                href="#active-promotions"
                className="group inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#AA526E] via-[#BD7088] to-[#8B405A] px-7 py-4 text-sm font-black text-white shadow-[0_18px_45px_rgba(139,64,90,0.28)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_55px_rgba(139,64,90,0.35)] sm:w-auto"
              >
                <BadgePercent className="size-5 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110" />
                Voir les offres
                <ArrowDown className="size-4 transition-transform duration-300 group-hover:translate-y-1" />
              </a>

              <p className="text-xs font-semibold leading-5 text-[#8B747D]">
                Offres limitées
                <span className="block">selon les périodes annoncées</span>
              </p>
            </div>

            <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:max-w-lg">
              <div className="rounded-[1.35rem] border border-white/80 bg-white/50 p-4 text-left shadow-[0_14px_35px_rgba(93,47,63,0.06)] backdrop-blur-xl">
                <span className="grid size-9 place-items-center rounded-xl bg-[#FFF0F4] text-[#A64D69]">
                  <TicketCheck className="size-4" />
                </span>

                <p className="mt-3 text-2xl font-black text-[#3B2930]">
                  {formatNumber(activeCount)}
                </p>

                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8C747D]">
                  Promotions actives
                </p>
              </div>

              <div className="rounded-[1.35rem] border border-white/80 bg-white/50 p-4 text-left shadow-[0_14px_35px_rgba(93,47,63,0.06)] backdrop-blur-xl">
                <span className="grid size-9 place-items-center rounded-xl bg-[#FFF0F4] text-[#A64D69]">
                  <CalendarDays className="size-4" />
                </span>

                <p className="mt-3 text-2xl font-black text-[#3B2930]">
                  {formatNumber(upcomingCount)}
                </p>

                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8C747D]">
                  Prochainement
                </p>
              </div>
            </div>
          </div>

          <div className="relative z-10 mx-auto flex min-h-[500px] w-full max-w-[720px] items-center justify-center sm:min-h-[580px] lg:min-h-[620px]">
            <div className="pointer-events-none absolute left-1/2 top-1/2 size-[24rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/60 bg-white/20 shadow-[inset_0_0_70px_rgba(255,255,255,0.65),0_35px_100px_rgba(115,56,76,0.10)] backdrop-blur-[2px] sm:size-[33rem]" />

            <div className="pointer-events-none absolute left-[8%] top-[15%] size-28 rounded-full bg-[#D99DB0]/25 blur-2xl sm:size-40" />

            <div className="pointer-events-none absolute bottom-[8%] right-[2%] size-32 rounded-full bg-white/80 blur-3xl sm:size-48" />

            <div className="relative w-[88%] max-w-[540px]">
              <div className="absolute inset-x-12 bottom-[-2rem] h-24 rounded-[50%] bg-[#72384C]/20 blur-2xl" />

              <div className="relative overflow-hidden rounded-[2.5rem] border border-white/80 bg-white/55 p-6 shadow-[0_35px_90px_rgba(99,48,67,0.22)] backdrop-blur-2xl sm:p-8">
                <div className="pointer-events-none absolute -right-20 -top-20 size-56 rounded-full bg-[#D995AA]/25 blur-3xl" />

                <div className="pointer-events-none absolute -bottom-24 -left-16 size-64 rounded-full bg-white/80 blur-3xl" />

                <div className="relative rounded-[2rem] border border-white/90 bg-[linear-gradient(145deg,#FFF9FB_0%,#F8DDE5_48%,#D992A8_100%)] px-6 py-10 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] sm:px-9 sm:py-12">
                  <div className="mx-auto flex size-40 items-center justify-center rounded-full border border-white/70 bg-white/35 shadow-[0_22px_50px_rgba(117,56,77,0.15)] backdrop-blur sm:size-48">
                    <div className="relative">
                      <BadgePercent className="size-24 text-[#9B4964] drop-shadow-[0_15px_20px_rgba(125,58,82,0.25)] sm:size-28" />

                      <span className="absolute -right-4 -top-3 grid size-11 place-items-center rounded-full border border-white bg-white/85 text-[#B86680] shadow-lg">
                        <Sparkles className="size-5" />
                      </span>
                    </div>
                  </div>

                  <div className="mt-8 text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#9E526B]">
                      Le Palais des Ongles
                    </p>

                    <h2 className="mt-3 font-serif text-3xl font-semibold text-[#3B2930] sm:text-4xl">
                      Des offres qui font plaisir
                    </h2>

                    <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-[#7C636D]">
                      Réductions, prestations offertes et avantages exclusifs
                      sont proposés tout au long de l’année.
                    </p>
                  </div>

                  <div className="mt-7 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-white/80 bg-white/55 p-4 text-center backdrop-blur">
                      <Tag className="mx-auto size-5 text-[#A64D69]" />

                      <p className="mt-2 text-xs font-black text-[#3B2930]">
                        Codes exclusifs
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/80 bg-white/55 p-4 text-center backdrop-blur">
                      <Gift className="mx-auto size-5 text-[#A64D69]" />

                      <p className="mt-2 text-xs font-black text-[#3B2930]">
                        Avantages salon
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/90 bg-white/80 px-5 py-2 text-[9px] font-black uppercase tracking-[0.18em] text-[#9D4964] shadow-[0_12px_25px_rgba(104,52,70,0.12)] backdrop-blur-xl sm:text-[10px]">
                Le bon moment pour en profiter
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-20 mt-8 overflow-hidden rounded-[2rem] border border-white/80 bg-white/55 shadow-[0_24px_65px_rgba(96,48,65,0.08)] backdrop-blur-2xl lg:mt-4">
          <div className="grid sm:grid-cols-3">
            <div className="flex items-center gap-4 px-5 py-5 sm:px-6 lg:py-6">
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl border border-[#F0DCE3] bg-[#FFF7F9] text-[#A64D69] shadow-sm">
                <BadgePercent className="size-5" />
              </span>

              <div>
                <p className="text-xs font-black text-[#3D2A32]">
                  Offres exclusives
                </p>

                <p className="mt-1 text-[10px] leading-5 text-[#8A737C]">
                  Des promotions sélectionnées avec soin
                </p>
              </div>
            </div>

            <div className="relative flex items-center gap-4 px-5 py-5 sm:px-6 lg:py-6">
              <div className="absolute left-0 top-1/2 hidden h-10 w-px -translate-y-1/2 bg-[#EAD4DC] sm:block" />

              <span className="grid size-11 shrink-0 place-items-center rounded-2xl border border-[#F0DCE3] bg-[#FFF7F9] text-[#A64D69] shadow-sm">
                <CalendarDays className="size-5" />
              </span>

              <div>
                <p className="text-xs font-black text-[#3D2A32]">
                  Dates transparentes
                </p>

                <p className="mt-1 text-[10px] leading-5 text-[#8A737C]">
                  Chaque période de validité est clairement indiquée
                </p>
              </div>
            </div>

            <div className="relative flex items-center gap-4 px-5 py-5 sm:px-6 lg:py-6">
              <div className="absolute left-0 top-1/2 hidden h-10 w-px -translate-y-1/2 bg-[#EAD4DC] sm:block" />

              <span className="grid size-11 shrink-0 place-items-center rounded-2xl border border-[#F0DCE3] bg-[#FFF7F9] text-[#A64D69] shadow-sm">
                <TicketCheck className="size-5" />
              </span>

              <div>
                <p className="text-xs font-black text-[#3D2A32]">
                  Réservation simple
                </p>

                <p className="mt-1 text-[10px] leading-5 text-[#8A737C]">
                  Profitez rapidement de l’offre disponible
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
