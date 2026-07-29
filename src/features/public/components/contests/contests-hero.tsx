import {
  ArrowDown,
  Award,
  Crown,
  Gift,
  Medal,
  Sparkles,
  Trophy,
  UsersRound,
} from "lucide-react";

type ContestsHeroProps = {
  activeCount: number;
  upcomingCount: number;
  totalParticipants: number;
};

const formatNumber = (value: number): string =>
  new Intl.NumberFormat("fr-FR").format(value);

export function ContestsHero({
  activeCount,
  upcomingCount,
  totalParticipants,
}: ContestsHeroProps) {
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
        <div className="grid min-h-[650px] items-center gap-14 lg:grid-cols-[0.94fr_1.06fr] lg:gap-10 xl:min-h-[700px]">
          <div className="relative z-20 mx-auto w-full max-w-2xl text-center lg:mx-0 lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/90 bg-white/60 px-4 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-[#A44E69] shadow-[0_12px_35px_rgba(91,45,61,0.08)] backdrop-blur-xl">
              <Sparkles className="size-4" />
              Jeux concours
            </div>

            <p className="mt-8 font-serif text-xl italic tracking-wide text-[#A65A73] sm:text-2xl">
              Tentez votre chance
            </p>

            <h1 className="mt-3 max-w-[11ch] font-serif text-[3.25rem] font-semibold leading-[0.98] tracking-[-0.045em] text-[#35242B] sm:text-[4.4rem] sm:leading-[0.96] lg:text-[4.8rem] xl:text-[5.3rem]">
              Participez
              <span className="mt-1 block bg-gradient-to-r from-[#A64D69] via-[#C47890] to-[#8B3E59] bg-clip-text pb-2 italic text-transparent">
                et gagnez
              </span>
            </h1>

            <p className="mx-auto mt-7 max-w-xl text-sm leading-7 text-[#79636C] sm:text-base sm:leading-8 lg:mx-0">
              Découvrez les concours du Palais des Ongles, participez à nos
              événements exclusifs et tentez de remporter de magnifiques lots.
              Suivez les classements et retrouvez toutes les prochaines dates.
            </p>

            <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start">
              <a
                href="#active-contests"
                className="group inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#AA526E] via-[#BD7088] to-[#8B405A] px-7 py-4 text-sm font-black text-white shadow-[0_18px_45px_rgba(139,64,90,0.28)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_55px_rgba(139,64,90,0.35)] sm:w-auto"
              >
                <Trophy className="size-5 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110" />
                Voir les concours
                <ArrowDown className="size-4 transition-transform duration-300 group-hover:translate-y-1" />
              </a>

              <p className="text-xs font-semibold leading-5 text-[#8B747D]">
                Participation simple
                <span className="block">et résultats transparents</span>
              </p>
            </div>

            <div className="mt-9 grid gap-3 sm:grid-cols-3 lg:max-w-2xl">
              <div className="rounded-[1.35rem] border border-white/80 bg-white/50 p-4 text-left shadow-[0_14px_35px_rgba(93,47,63,0.06)] backdrop-blur-xl">
                <span className="grid size-9 place-items-center rounded-xl bg-[#FFF0F4] text-[#A64D69]">
                  <Trophy className="size-4" />
                </span>

                <p className="mt-3 text-2xl font-black text-[#3B2930]">
                  {formatNumber(activeCount)}
                </p>

                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8C747D]">
                  Concours en cours
                </p>
              </div>

              <div className="rounded-[1.35rem] border border-white/80 bg-white/50 p-4 text-left shadow-[0_14px_35px_rgba(93,47,63,0.06)] backdrop-blur-xl">
                <span className="grid size-9 place-items-center rounded-xl bg-[#FFF0F4] text-[#A64D69]">
                  <Gift className="size-4" />
                </span>

                <p className="mt-3 text-2xl font-black text-[#3B2930]">
                  {formatNumber(upcomingCount)}
                </p>

                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8C747D]">
                  À venir
                </p>
              </div>

              <div className="rounded-[1.35rem] border border-white/80 bg-white/50 p-4 text-left shadow-[0_14px_35px_rgba(93,47,63,0.06)] backdrop-blur-xl">
                <span className="grid size-9 place-items-center rounded-xl bg-[#FFF0F4] text-[#A64D69]">
                  <UsersRound className="size-4" />
                </span>

                <p className="mt-3 text-2xl font-black text-[#3B2930]">
                  {formatNumber(totalParticipants)}
                </p>

                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8C747D]">
                  Participations
                </p>
              </div>
            </div>
          </div>

          <div className="relative z-10 mx-auto flex min-h-[500px] w-full max-w-[720px] items-center justify-center sm:min-h-[580px] lg:min-h-[620px]">
            <div className="pointer-events-none absolute left-1/2 top-1/2 size-[23rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/65 bg-white/20 shadow-[inset_0_0_80px_rgba(255,255,255,0.75),0_35px_100px_rgba(115,56,76,0.10)] backdrop-blur-sm sm:size-[31rem]" />

            <div className="pointer-events-none absolute left-[6%] top-[12%] size-28 rounded-full bg-[#D99DB0]/25 blur-2xl sm:size-40" />

            <div className="pointer-events-none absolute bottom-[10%] right-[2%] size-36 rounded-full bg-white/80 blur-3xl sm:size-52" />

            <div className="relative flex w-full max-w-[570px] items-center justify-center">
              <div className="absolute bottom-[2%] left-1/2 h-24 w-[70%] -translate-x-1/2 rounded-[50%] bg-[#7A3E53]/20 blur-3xl" />

              <div className="relative z-10 flex size-[300px] items-center justify-center rounded-full border border-white/80 bg-[radial-gradient(circle_at_38%_30%,rgba(255,255,255,0.95),rgba(255,238,243,0.75)_42%,rgba(224,156,177,0.72)_100%)] shadow-[0_35px_90px_rgba(105,48,69,0.22),inset_0_1px_0_rgba(255,255,255,0.95)] sm:size-[390px]">
                <div className="absolute inset-5 rounded-full border border-white/55" />

                <div className="absolute inset-12 rounded-full border border-white/45" />

                <div className="relative flex size-40 items-center justify-center rounded-full border border-white/80 bg-white/55 shadow-[0_22px_50px_rgba(117,56,77,0.15)] backdrop-blur-xl sm:size-52">
                  <Trophy className="size-24 text-[#9B4964] drop-shadow-[0_16px_22px_rgba(125,58,82,0.25)] sm:size-32" />

                  <span className="absolute -right-2 top-4 grid size-11 place-items-center rounded-full border border-white bg-white/90 text-[#B86680] shadow-lg">
                    <Sparkles className="size-5" />
                  </span>
                </div>
              </div>

              <div className="absolute left-[2%] top-[12%] z-20 rotate-[-8deg] rounded-[1.5rem] border border-white/85 bg-white/70 px-5 py-4 shadow-[0_20px_45px_rgba(98,47,65,0.13)] backdrop-blur-xl sm:left-[4%]">
                <Crown className="size-6 text-[#B4863B]" />

                <p className="mt-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#7E6670]">
                  Première place
                </p>
              </div>

              <div className="absolute right-[0%] top-[20%] z-20 rotate-[7deg] rounded-[1.5rem] border border-white/85 bg-white/70 px-5 py-4 shadow-[0_20px_45px_rgba(98,47,65,0.13)] backdrop-blur-xl sm:right-[2%]">
                <Medal className="size-6 text-[#A64D69]" />

                <p className="mt-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#7E6670]">
                  Lots exclusifs
                </p>
              </div>

              <div className="absolute bottom-[6%] left-[7%] z-20 rotate-[5deg] rounded-[1.5rem] border border-white/85 bg-white/70 px-5 py-4 shadow-[0_20px_45px_rgba(98,47,65,0.13)] backdrop-blur-xl sm:left-[10%]">
                <UsersRound className="size-6 text-[#A64D69]" />

                <p className="mt-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#7E6670]">
                  Classement public
                </p>
              </div>

              <div className="absolute bottom-[4%] right-[4%] z-20 rotate-[-6deg] rounded-[1.5rem] border border-white/85 bg-white/70 px-5 py-4 shadow-[0_20px_45px_rgba(98,47,65,0.13)] backdrop-blur-xl sm:right-[7%]">
                <Award className="size-6 text-[#A64D69]" />

                <p className="mt-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#7E6670]">
                  Résultats suivis
                </p>
              </div>

              <div className="pointer-events-none absolute left-[16%] top-[46%] size-2 rounded-full bg-white shadow-[0_0_20px_8px_rgba(255,255,255,0.9)]" />

              <div className="pointer-events-none absolute right-[15%] top-[42%] size-2 rounded-full bg-white shadow-[0_0_20px_8px_rgba(255,255,255,0.9)]" />
            </div>
          </div>
        </div>

        <div className="relative z-20 mt-8 overflow-hidden rounded-[2rem] border border-white/80 bg-white/55 shadow-[0_24px_65px_rgba(96,48,65,0.08)] backdrop-blur-2xl lg:mt-4">
          <div className="grid sm:grid-cols-3">
            <div className="flex items-center gap-4 px-5 py-5 sm:px-6 lg:py-6">
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl border border-[#F0DCE3] bg-[#FFF7F9] text-[#A64D69] shadow-sm">
                <Trophy className="size-5" />
              </span>

              <div>
                <p className="text-xs font-black text-[#3D2A32]">
                  Concours exclusifs
                </p>

                <p className="mt-1 text-[10px] leading-5 text-[#8A737C]">
                  Des événements réservés à notre communauté
                </p>
              </div>
            </div>

            <div className="relative flex items-center gap-4 px-5 py-5 sm:px-6 lg:py-6">
              <div className="absolute left-0 top-1/2 hidden h-10 w-px -translate-y-1/2 bg-[#EAD4DC] sm:block" />

              <span className="grid size-11 shrink-0 place-items-center rounded-2xl border border-[#F0DCE3] bg-[#FFF7F9] text-[#A64D69] shadow-sm">
                <UsersRound className="size-5" />
              </span>

              <div>
                <p className="text-xs font-black text-[#3D2A32]">
                  Classement visible
                </p>

                <p className="mt-1 text-[10px] leading-5 text-[#8A737C]">
                  Suivez votre progression en toute transparence
                </p>
              </div>
            </div>

            <div className="relative flex items-center gap-4 px-5 py-5 sm:px-6 lg:py-6">
              <div className="absolute left-0 top-1/2 hidden h-10 w-px -translate-y-1/2 bg-[#EAD4DC] sm:block" />

              <span className="grid size-11 shrink-0 place-items-center rounded-2xl border border-[#F0DCE3] bg-[#FFF7F9] text-[#A64D69] shadow-sm">
                <Gift className="size-5" />
              </span>

              <div>
                <p className="text-xs font-black text-[#3D2A32]">
                  De beaux cadeaux
                </p>

                <p className="mt-1 text-[10px] leading-5 text-[#8A737C]">
                  Des lots sélectionnés avec soin
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
