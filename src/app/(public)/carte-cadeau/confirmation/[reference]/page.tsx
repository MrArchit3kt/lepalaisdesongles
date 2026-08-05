import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CalendarClock,
  CheckCircle2,
  Copy,
  Gift,
  Home,
  Mail,
  ReceiptText,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Carte cadeau confirmée | Le Palais des Ongles",
  description: "Confirmation de votre achat de carte cadeau.",
};

type GiftCardConfirmationPageProps = {
  params: Promise<{
    reference: string;
  }>;
};

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

function formatDate(value: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(value);
}

function getStatusLabel(status: string): string {
  switch (status) {
    case "ACTIVE":
      return "Carte active";
    case "PARTIALLY_USED":
      return "Carte partiellement utilisée";
    case "USED":
      return "Carte utilisée";
    case "EXPIRED":
      return "Carte expirée";
    case "CANCELLED":
      return "Carte annulée";
    case "REVOKED":
      return "Carte révoquée";
    default:
      return "Paiement en cours de confirmation";
  }
}

export default async function GiftCardConfirmationPage({
  params,
}: GiftCardConfirmationPageProps) {
  const { reference } = await params;
  const cleanReference = reference.trim();

  if (!cleanReference || cleanReference.length > 80) {
    notFound();
  }

  const giftCard = await prisma.giftCard.findUnique({
    where: {
      reference: cleanReference,
    },
    select: {
      reference: true,
      code: true,
      status: true,
      initialAmountCents: true,
      balanceCents: true,
      currency: true,
      purchaserFirstName: true,
      purchaserLastName: true,
      purchaserEmail: true,
      recipientFirstName: true,
      recipientLastName: true,
      recipientEmail: true,
      personalMessage: true,
      paidAt: true,
      activatedAt: true,
      expiresAt: true,
      createdAt: true,
    },
  });

  if (!giftCard) {
    notFound();
  }

  const isUsable =
    giftCard.status === "ACTIVE" || giftCard.status === "PARTIALLY_USED";

  const purchaserName = [
    giftCard.purchaserFirstName,
    giftCard.purchaserLastName,
  ]
    .filter(Boolean)
    .join(" ");

  const recipientName = [
    giftCard.recipientFirstName,
    giftCard.recipientLastName,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#FFF8FA_0%,#FFFDFD_46%,#FDF4F7_100%)] px-4 py-10 sm:px-6 lg:py-16">
      <div className="mx-auto max-w-5xl">
        <section className="overflow-hidden rounded-[2.25rem] border border-[#EFDEE4] bg-white/95 shadow-[0_28px_75px_rgba(85,38,55,0.11)] backdrop-blur">
          <header className="border-b border-[#F0E1E6] bg-gradient-to-br from-white via-[#FFF8FA] to-[#FBECEF] px-6 py-10 text-center sm:px-10 sm:py-12">
            <div className="mx-auto flex size-16 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-700 shadow-[0_14px_32px_rgba(16,185,129,0.12)]">
              <CheckCircle2 className="size-8" />
            </div>

            <span className="mt-6 inline-flex rounded-full border border-emerald-200 bg-emerald-50/90 px-4 py-2 text-[10px] font-black uppercase tracking-[0.15em] text-emerald-700 shadow-sm">
              {getStatusLabel(giftCard.status)}
            </span>

            <h1 className="mt-5 font-serif text-3xl font-semibold tracking-tight text-[#35242B] sm:text-4xl lg:text-5xl">
              Votre carte cadeau est prête
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#816D75] sm:text-base">
              Le paiement a bien été enregistré. Conservez le code ci-dessous :
              il devra être présenté au salon lors de son utilisation.
            </p>

            <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#E8D4DB] bg-white/80 px-4 py-2 text-xs font-medium text-[#816D75] shadow-sm">
              Référence
              <span className="font-black text-[#2F2027]">
                {giftCard.reference}
              </span>
            </p>
          </header>

          <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-[1.08fr_0.92fr]">
            <div>
              <div className="rounded-[1.75rem] border border-[#E8C3CF] bg-gradient-to-br from-[#843F59] via-[#A5526D] to-[#C97992] p-6 text-white shadow-[0_22px_50px_rgba(132,63,89,0.24)] sm:p-8">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/75">
                      Le Palais des Ongles
                    </p>
                    <h2 className="mt-2 font-serif text-3xl font-semibold">
                      Carte cadeau
                    </h2>
                  </div>

                  <Gift className="size-9 text-white/90" />
                </div>

                <div className="mt-10">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/70">
                    Code à présenter
                  </p>

                  <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-white/25 bg-white/10 px-4 py-4 backdrop-blur">
                    <p className="break-all font-mono text-xl font-black tracking-[0.12em] sm:text-2xl">
                      {giftCard.code}
                    </p>

                    <Copy className="size-5 shrink-0 text-white/80" />
                  </div>
                </div>

                <div className="mt-8 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs text-white/70">Pour</p>
                    <p className="mt-1 font-black">{recipientName}</p>
                  </div>

                  <p className="font-serif text-4xl font-semibold">
                    {formatCurrency(giftCard.initialAmountCents)}
                  </p>
                </div>
              </div>

              {giftCard.personalMessage ? (
                <div className="mt-5 rounded-[1.5rem] border border-[#EFDEE4] bg-[#FFF9FB] p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#A5526D]">
                    Message personnel
                  </p>
                  <p className="mt-3 whitespace-pre-wrap text-sm italic leading-7 text-[#5F4A53]">
                    « {giftCard.personalMessage} »
                  </p>
                </div>
              ) : null}
            </div>

            <div className="space-y-4">
              <h2 className="font-serif text-2xl font-semibold tracking-tight text-[#2F2027]">
                Détails de la carte
              </h2>

              <div className="grid gap-4">
                <div className="flex gap-3 rounded-[1.25rem] border border-[#EFDEE4] bg-gradient-to-br from-white to-[#FFF7F9] p-4">
                  <ReceiptText className="mt-0.5 size-5 shrink-0 text-[#A5526D]" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#A68C96]">
                      Solde disponible
                    </p>
                    <p className="mt-1 text-lg font-black text-[#2F2027]">
                      {formatCurrency(giftCard.balanceCents)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 rounded-[1.25rem] border border-[#EFDEE4] bg-gradient-to-br from-white to-[#FFF7F9] p-4">
                  <UserRound className="mt-0.5 size-5 shrink-0 text-[#A5526D]" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#A68C96]">
                      Offerte par
                    </p>
                    <p className="mt-1 text-sm font-black text-[#2F2027]">
                      {purchaserName}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 rounded-[1.25rem] border border-[#EFDEE4] bg-gradient-to-br from-white to-[#FFF7F9] p-4">
                  <Mail className="mt-0.5 size-5 shrink-0 text-[#A5526D]" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#A68C96]">
                      Confirmation envoyée à
                    </p>
                    <p className="mt-1 break-all text-sm font-black text-[#2F2027]">
                      {giftCard.purchaserEmail}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 rounded-[1.25rem] border border-[#EFDEE4] bg-gradient-to-br from-white to-[#FFF7F9] p-4">
                  <CalendarClock className="mt-0.5 size-5 shrink-0 text-[#A5526D]" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#A68C96]">
                      Valable jusqu’au
                    </p>
                    <p className="mt-1 text-sm font-black capitalize text-[#2F2027]">
                      {formatDate(giftCard.expiresAt)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.35rem] border border-[#E8C3CF] bg-[#FFF8FA] p-4 text-xs leading-6 text-[#816D75]">
                <div className="flex gap-3">
                  <ShieldCheck className="mt-0.5 size-5 shrink-0 text-[#A5526D]" />
                  <p>
                    {isUsable
                      ? "Cette carte peut être utilisée au salon et débitée en une ou plusieurs fois."
                      : "Cette carte n’est actuellement pas utilisable. Contactez le salon en cas de besoin."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <footer className="flex flex-col gap-3 border-t border-[#F0E1E6] bg-[#FFF9FB] p-6 sm:flex-row sm:justify-center sm:p-8">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#E7CED6] bg-white px-6 py-3 text-sm font-black text-[#843F59] shadow-sm transition hover:border-[#C97992] hover:bg-[#FFF8FA]"
            >
              <Home className="size-4" />
              Retour à l’accueil
            </Link>

            <Link
              href="/reservation"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#A5526D] to-[#843F59] px-6 py-3 text-sm font-black text-white shadow-[0_12px_28px_rgba(132,63,89,0.22)] transition hover:-translate-y-0.5"
            >
              Prendre rendez-vous
            </Link>
          </footer>
        </section>
      </div>
    </main>
  );
}
