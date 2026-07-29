import type { Metadata } from "next";
import {
  BadgeEuro,
  CalendarClock,
  Gift,
  HeartHandshake,
  ShieldCheck,
} from "lucide-react";

import { GiftCardHero } from "@/features/gift-cards/components/gift-card-hero";
import { GiftCardPurchaseClient } from "@/features/gift-cards/components/gift-card-purchase-client";

export const metadata: Metadata = {
  title: "Carte cadeau | Le Palais des Ongles",
  description:
    "Offrez une carte cadeau personnalisée valable au Palais des Ongles.",
};

const BENEFITS = [
  {
    icon: Gift,
    title: "Montant au choix",
    description: "Choisissez librement le montant adapté à votre cadeau.",
  },
  {
    icon: HeartHandshake,
    title: "Cadeau personnalisé",
    description: "Ajoutez le nom de la bénéficiaire et un message personnel.",
  },
  {
    icon: ShieldCheck,
    title: "Paiement sécurisé",
    description: "Le règlement est effectué en ligne avec PayPal.",
  },
  {
    icon: CalendarClock,
    title: "Valable 12 mois",
    description:
      "La carte est utilisable au salon pendant douze mois après son activation.",
  },
] as const;

export default function GiftCardPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[linear-gradient(180deg,#FFF9FB_0%,#FFFDFD_48%,#FDF4F7_100%)]">
      <GiftCardHero />

      <section
        id="gift-card-purchase"
        className="relative scroll-mt-24 px-4 py-14 sm:px-6 sm:py-16 lg:py-20"
      >
        <div className="pointer-events-none absolute left-[-10rem] top-20 size-80 rounded-full bg-[#E8B4C0]/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-10 right-[-10rem] size-96 rounded-full bg-[#D6B679]/10 blur-3xl" />

        <div className="relative mx-auto max-w-6xl">
          <header className="mx-auto mb-10 max-w-3xl text-center sm:mb-12">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#E8C3CF] bg-white/80 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#A5526D] shadow-sm">
              <BadgeEuro className="size-4" />
              Créez votre carte cadeau
            </span>

            <h2 className="mt-6 font-serif text-4xl font-semibold tracking-tight text-[#2F2027] sm:text-5xl">
              Personnalisez votre attention
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#816D75] sm:text-base">
              Sélectionnez le montant, renseignez les coordonnées de la
              bénéficiaire et ajoutez votre message personnel avant de procéder
              au paiement sécurisé avec PayPal.
            </p>
          </header>

          <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
            <aside className="space-y-4 lg:sticky lg:top-24">
              <div className="rounded-[2rem] border border-[#EFDEE4] bg-white/90 p-6 shadow-[0_20px_55px_rgba(85,38,55,0.08)] backdrop-blur sm:p-7">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#A5526D]">
                  Comment ça marche ?
                </p>

                <h3 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-[#2F2027]">
                  Un cadeau simple et élégant
                </h3>

                <div className="mt-6 space-y-4">
                  {BENEFITS.map(({ icon: Icon, title, description }) => (
                    <div
                      key={title}
                      className="flex gap-4 rounded-[1.35rem] border border-[#F0E1E6] bg-gradient-to-br from-white to-[#FFF8FA] p-4"
                    >
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#FFF0F4] text-[#A5526D]">
                        <Icon className="size-5" />
                      </span>

                      <div>
                        <h4 className="text-sm font-black text-[#2F2027]">
                          {title}
                        </h4>

                        <p className="mt-1 text-xs leading-6 text-[#816D75]">
                          {description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-[#EFDEE4] bg-white/70 px-5 py-4 text-xs leading-6 text-[#8E7881] shadow-sm backdrop-blur">
                La carte cadeau est distincte des promotions et du programme de
                fidélité. Elle est présentée au salon lors du règlement d’une
                prestation.
              </div>
            </aside>

            <GiftCardPurchaseClient />
          </div>
        </div>
      </section>
    </main>
  );
}
