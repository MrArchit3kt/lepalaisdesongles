import type { Metadata } from "next";
import {
  BadgeEuro,
  CalendarClock,
  CheckCircle2,
  Gift,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

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
    <main className="min-h-screen overflow-hidden bg-[linear-gradient(180deg,#FFF8FA_0%,#FFFDFD_48%,#FDF4F7_100%)]">
      <section className="relative border-b border-[#F0E1E6] px-4 py-14 sm:px-6 sm:py-20 lg:py-24">
        <div className="pointer-events-none absolute left-[-8rem] top-[-8rem] size-80 rounded-full bg-[#E8B4C0]/30 blur-3xl" />
        <div className="pointer-events-none absolute right-[-8rem] top-10 size-80 rounded-full bg-[#D6B679]/15 blur-3xl" />

        <div className="relative mx-auto max-w-6xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#E8C3CF] bg-white/80 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#A5526D] shadow-sm">
            <Sparkles className="size-4" />
            Une attention qui fait plaisir
          </span>

          <h1 className="mx-auto mt-7 max-w-4xl font-serif text-4xl font-semibold tracking-tight text-[#2F2027] sm:text-5xl lg:text-6xl">
            Offrez un moment de beauté avec une carte cadeau
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-[#816D75] sm:text-base">
            Choisissez le montant, personnalisez votre attention et réglez
            directement avec PayPal. La carte sera activée dès la confirmation
            du paiement.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs font-bold text-[#816D75]">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#EFDEE4] bg-white/80 px-4 py-2">
              <CheckCircle2 className="size-4 text-emerald-600" />
              Utilisable en plusieurs fois
            </span>

            <span className="inline-flex items-center gap-2 rounded-full border border-[#EFDEE4] bg-white/80 px-4 py-2">
              <BadgeEuro className="size-4 text-[#A5526D]" />
              Solde débité au salon
            </span>
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:py-16">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
          <aside className="space-y-4 lg:sticky lg:top-24">
            <div className="rounded-[2rem] border border-[#EFDEE4] bg-white/90 p-6 shadow-[0_20px_55px_rgba(85,38,55,0.08)] backdrop-blur sm:p-7">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#A5526D]">
                Comment ça marche ?
              </p>

              <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-[#2F2027]">
                Un cadeau simple et élégant
              </h2>

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
                      <h3 className="text-sm font-black text-[#2F2027]">
                        {title}
                      </h3>

                      <p className="mt-1 text-xs leading-6 text-[#816D75]">
                        {description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p className="px-2 text-xs leading-6 text-[#8E7881]">
              La carte cadeau est distincte des promotions et du programme de
              fidélité. Elle est présentée au salon lors du règlement d’une
              prestation.
            </p>
          </aside>

          <GiftCardPurchaseClient />
        </div>
      </section>
    </main>
  );
}
