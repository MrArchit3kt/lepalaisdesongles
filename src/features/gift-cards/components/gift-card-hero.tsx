import {
  ArrowDown,
  CalendarClock,
  Check,
  CreditCard,
  Gift,
  Heart,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const HERO_BENEFITS = [
  {
    icon: CalendarClock,
    title: "Valable 12 mois",
    description: "À compter de son activation",
  },
  {
    icon: Gift,
    title: "Toutes les prestations",
    description: "Utilisable directement au salon",
  },
  {
    icon: CreditCard,
    title: "Paiement sécurisé",
    description: "Paiement en ligne avec PayPal",
  },
] as const;

const FOOTER_BENEFITS = [
  {
    icon: Gift,
    title: "Toutes nos prestations",
    description: "Une liberté totale pour se faire plaisir",
  },
  {
    icon: Heart,
    title: "Expertise & passion",
    description: "Un moment de beauté privilégié",
  },
  {
    icon: Sparkles,
    title: "Produits professionnels",
    description: "Des soins et finitions de qualité",
  },
  {
    icon: ShieldCheck,
    title: "Paiement sécurisé",
    description: "Un règlement protégé avec PayPal",
  },
] as const;

export function GiftCardHero() {
  return (
    <section className="relative isolate overflow-hidden border-b border-[#ecd9df] bg-[#fbf3f5]">
      <div className="pointer-events-none absolute inset-0 -z-30 bg-[linear-gradient(118deg,#f8e8ed_0%,#fff9fa_42%,#f1dce3_100%)]" />

      <div className="pointer-events-none absolute inset-0 -z-20 opacity-90 [background-image:radial-gradient(circle_at_10%_16%,rgba(255,255,255,0.98)_0,rgba(255,255,255,0)_29%),radial-gradient(circle_at_86%_16%,rgba(202,124,148,0.20)_0,rgba(202,124,148,0)_32%),radial-gradient(circle_at_53%_88%,rgba(221,183,194,0.30)_0,rgba(221,183,194,0)_36%)]" />

      <div className="pointer-events-none absolute -left-28 top-20 -z-10 size-[24rem] rounded-full bg-[#e8b3c3]/25 blur-[100px]" />

      <div className="pointer-events-none absolute -right-24 top-[-5rem] -z-10 size-[30rem] rounded-full bg-[#d89cb0]/25 blur-[120px]" />

      <div className="pointer-events-none absolute bottom-[-13rem] left-1/3 -z-10 size-[35rem] rounded-full bg-white/80 blur-[110px]" />

      <div className="pointer-events-none absolute left-[7%] top-[16%] hidden size-3 rounded-full bg-white shadow-[0_0_28px_10px_rgba(255,255,255,0.9)] lg:block" />

      <div className="pointer-events-none absolute left-[44%] top-[22%] hidden size-2 rounded-full bg-[#dca8b8]/60 shadow-[0_0_24px_7px_rgba(220,168,184,0.45)] lg:block" />

      <div className="pointer-events-none absolute right-[8%] top-[12%] hidden size-4 rounded-full bg-white/80 blur-[1px] shadow-[0_0_30px_10px_rgba(255,255,255,0.8)] lg:block" />

      <div className="mx-auto max-w-[1440px] px-4 pb-5 pt-6 sm:px-6 sm:pb-9 sm:pt-10 lg:px-8 lg:pb-12 lg:pt-16">
        <div className="grid items-center gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:gap-8 xl:min-h-[730px]">
          <div className="relative z-20 mx-auto max-w-2xl text-center lg:mx-0 lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/90 bg-white/60 px-4 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-[#a44e69] shadow-[0_12px_35px_rgba(91,45,61,0.08)] backdrop-blur-xl">
              <Sparkles className="size-4" />
              Le plaisir d&apos;offrir
            </div>

            <p className="mt-8 font-serif text-xl italic tracking-wide text-[#a65a73] sm:text-2xl">
              Une attention unique
            </p>

            <h1 className="mt-3 max-w-[10ch] font-serif text-[2.15rem] font-semibold leading-[1.05] tracking-[-0.03em] text-[#35242b] sm:text-[3.4rem] sm:leading-[1] lg:text-[4.8rem] xl:text-[5.3rem]">
              Carte

              <span className="mt-1 block bg-gradient-to-r from-[#a64d69] via-[#c47890] to-[#8b3e59] bg-clip-text pb-2 italic text-transparent">
                cadeau
              </span>
            </h1>

            <p className="mx-auto mt-7 max-w-xl text-sm leading-7 text-[#79636c] sm:text-base sm:leading-8 lg:mx-0">
              Offrez bien plus qu&apos;un cadeau&nbsp;: un véritable moment de
              beauté et de détente au Palais des Ongles. Choisissez le montant,
              personnalisez votre attention et laissez la bénéficiaire
              sélectionner la prestation qui lui fera plaisir.
            </p>

            <div className="mt-7 flex flex-wrap justify-center gap-3 lg:justify-start">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/90 bg-white/65 px-4 py-2 text-xs font-bold text-[#6f5962] shadow-sm backdrop-blur">
                <Check className="size-4 text-[#a64d69]" />
                Montant au choix
              </span>

              <span className="inline-flex items-center gap-2 rounded-full border border-white/90 bg-white/65 px-4 py-2 text-xs font-bold text-[#6f5962] shadow-sm backdrop-blur">
                <Check className="size-4 text-[#a64d69]" />
                Utilisable en plusieurs fois
              </span>
            </div>

            <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start">
              <a
                href="#gift-card-purchase"
                className="group inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#aa526e] via-[#bd7088] to-[#8b405a] px-7 py-4 text-sm font-black text-white shadow-[0_18px_45px_rgba(139,64,90,0.28)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_55px_rgba(139,64,90,0.35)] sm:w-auto"
              >
                <Gift className="size-5 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110" />

                Offrir une carte cadeau

                <ArrowDown className="size-4 transition-transform duration-300 group-hover:translate-y-1" />
              </a>

              <p className="text-xs font-semibold leading-5 text-[#8b747d]">
                Activation après confirmation

                <span className="block">du paiement PayPal</span>
              </p>
            </div>

            <div className="mt-9 grid gap-3 sm:grid-cols-3 lg:max-w-2xl">
              {HERO_BENEFITS.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="rounded-[1.35rem] border border-white/80 bg-white/50 p-4 text-left shadow-[0_14px_35px_rgba(93,47,63,0.06)] backdrop-blur-xl"
                >
                  <span className="grid size-9 place-items-center rounded-xl bg-[#fff0f4] text-[#a64d69]">
                    <Icon className="size-4" />
                  </span>

                  <p className="mt-3 text-xs font-black text-[#3b2930]">
                    {title}
                  </p>

                  <p className="mt-1 text-[10px] leading-5 text-[#8c747d]">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 mx-auto flex min-h-[260px] w-full max-w-[760px] items-center justify-center sm:min-h-[400px] lg:min-h-[650px]">
            <div className="pointer-events-none absolute left-1/2 top-1/2 size-[24rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/60 bg-white/20 shadow-[inset_0_0_70px_rgba(255,255,255,0.65),0_35px_100px_rgba(115,56,76,0.10)] backdrop-blur-[2px] sm:size-[33rem]" />

            <div className="pointer-events-none absolute left-[12%] top-[17%] size-28 rounded-full bg-[#d99db0]/25 blur-2xl sm:size-40" />

            <div className="pointer-events-none absolute bottom-[8%] right-[5%] size-32 rounded-full bg-white/80 blur-3xl sm:size-48" />

            <div className="relative z-10 w-[88%] max-w-[570px] rotate-[-5deg] transition duration-500 hover:rotate-[-2deg] hover:scale-[1.02]">
              <div className="absolute inset-x-8 bottom-[-2rem] h-24 rounded-[50%] bg-[#72384c]/25 blur-2xl" />

              <div className="relative aspect-[1.56/1] overflow-hidden rounded-[1.8rem] border border-white/75 bg-gradient-to-br from-[#f8dce5] via-[#f2c5d2] to-[#c87891] p-px shadow-[0_38px_90px_rgba(99,48,67,0.30),inset_0_1px_0_rgba(255,255,255,0.9)] sm:rounded-[2.25rem]">
                <div className="relative size-full overflow-hidden rounded-[calc(1.8rem-1px)] bg-[linear-gradient(135deg,#fff7f9_0%,#f7dce4_42%,#d894a9_100%)] sm:rounded-[calc(2.25rem-1px)]">
                  <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.95),transparent_28%),radial-gradient(circle_at_80%_90%,rgba(137,59,85,0.18),transparent_38%)]" />

                  <div className="pointer-events-none absolute -left-16 bottom-[-4rem] size-56 rounded-full border-[34px] border-white/25" />

                  <div className="pointer-events-none absolute -right-24 top-[-6rem] size-64 rounded-full border-[45px] border-white/20" />

                  <div className="absolute inset-x-0 top-[42%] h-[18%] bg-gradient-to-r from-[#9b4964] via-[#c47189] to-[#8d3f5a] shadow-[0_10px_25px_rgba(116,48,72,0.25)]">
                    <div className="absolute inset-x-0 top-1/2 h-px bg-white/35" />
                  </div>

                  <div className="absolute bottom-0 right-[18%] top-0 w-[15%] bg-gradient-to-b from-[#9b4964] via-[#c97790] to-[#873b56] shadow-[8px_0_20px_rgba(116,48,72,0.18)]">
                    <div className="absolute bottom-0 left-1/2 top-0 w-px bg-white/30" />
                  </div>

                  <div className="absolute right-[13.5%] top-[31%] z-20 size-24 sm:size-32">
                    <div className="absolute left-0 top-5 h-16 w-16 rotate-[-30deg] rounded-[75%_35%_75%_35%] bg-gradient-to-br from-[#d988a0] to-[#8f405a] shadow-xl sm:h-20 sm:w-20" />

                    <div className="absolute right-0 top-5 h-16 w-16 rotate-[30deg] rounded-[35%_75%_35%_75%] bg-gradient-to-bl from-[#d988a0] to-[#8f405a] shadow-xl sm:h-20 sm:w-20" />

                    <div className="absolute left-1/2 top-[2.1rem] size-10 -translate-x-1/2 rounded-full bg-gradient-to-br from-[#e49ab0] to-[#873b56] shadow-xl sm:top-[2.7rem] sm:size-12" />
                  </div>

                  <div className="absolute inset-y-0 left-0 z-10 flex w-[68%] flex-col justify-between p-6 sm:p-9 lg:p-11">
                    <div>
                      <p className="text-[8px] font-black uppercase tracking-[0.28em] text-[#984a64] sm:text-[10px]">
                        Le Palais des Ongles
                      </p>

                      <div className="mt-4 h-px w-14 bg-[#b7617b]/50" />
                    </div>

                    <div>
                      <p className="font-serif text-[1.8rem] font-semibold leading-none tracking-[-0.04em] text-[#3c2931] sm:text-[2.7rem] lg:text-[3.15rem]">
                        Carte

                        <span className="block italic text-[#9d4964]">
                          cadeau
                        </span>
                      </p>

                      <p className="mt-3 max-w-[15rem] text-[8px] font-semibold uppercase tracking-[0.18em] text-[#7d626c] sm:text-[10px]">
                        Un moment de beauté rien que pour vous
                      </p>
                    </div>

                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <p className="text-[7px] font-bold uppercase tracking-[0.18em] text-[#a07584] sm:text-[8px]">
                          Valeur
                        </p>

                        <p className="mt-1 font-serif text-xl font-semibold text-[#8c405a] sm:text-2xl">
                          Au choix
                        </p>
                      </div>

                      <Sparkles className="mb-1 size-5 text-[#a64d69]/65" />
                    </div>
                  </div>

                  <div className="pointer-events-none absolute -left-[38%] top-[-70%] h-[210%] w-[36%] rotate-[24deg] bg-gradient-to-r from-transparent via-white/40 to-transparent blur-sm" />
                </div>
              </div>

              <div className="absolute -bottom-5 left-8 rotate-[3deg] rounded-full border border-white/90 bg-white/80 px-4 py-2 text-[9px] font-black uppercase tracking-[0.18em] text-[#9d4964] shadow-[0_12px_25px_rgba(104,52,70,0.12)] backdrop-blur-xl sm:left-14 sm:text-[10px]">
                Personnalisable avec votre message
              </div>
            </div>

            <div className="pointer-events-none absolute bottom-[12%] left-[16%] z-30 size-2 rounded-full bg-white shadow-[0_0_20px_8px_rgba(255,255,255,0.9)]" />

            <div className="pointer-events-none absolute right-[14%] top-[20%] z-30 size-2 rounded-full bg-white shadow-[0_0_20px_7px_rgba(255,255,255,0.9)]" />
          </div>
        </div>

        <div className="relative z-20 mt-8 overflow-hidden rounded-[2rem] border border-white/80 bg-white/55 shadow-[0_24px_65px_rgba(96,48,65,0.08)] backdrop-blur-2xl lg:mt-4">
          <div className="grid sm:grid-cols-2 xl:grid-cols-4">
            {FOOTER_BENEFITS.map(
              ({ icon: Icon, title, description }, index) => (
                <div
                  key={title}
                  className="relative flex items-center gap-4 px-4 py-3.5 sm:px-6 sm:py-5 lg:py-6"
                >
                  {index > 0 ? (
                    <div className="absolute left-0 top-1/2 hidden h-10 w-px -translate-y-1/2 bg-[#ead4dc] xl:block" />
                  ) : null}

                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl border border-[#f0dce3] bg-[#fff7f9] text-[#a64d69] shadow-sm">
                    <Icon className="size-5" />
                  </span>

                  <div>
                    <p className="text-xs font-black text-[#3d2a32]">
                      {title}
                    </p>

                    <p className="mt-1 text-[10px] leading-5 text-[#8a737c]">
                      {description}
                    </p>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
