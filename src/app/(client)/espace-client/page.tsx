import Link from "next/link";
import {
  CalendarCheck2,
  CalendarDays,
  Camera,
  ChevronRight,
  Clock3,
  CreditCard,
  Crown,
  Gift,
  Heart,
  History,
  MessageCircle,
  ReceiptText,
  Sparkles,
  Star,
  UserRound,
} from "lucide-react";

import { LogoutButton } from "@/features/auth/components/logout-button";
import {
  getClientVipAccessState,
} from "@/features/vip/services/client-vip-access.service";

import {
  getClientVipDashboardData,
} from "@/features/vip/services/client-vip-dashboard.service";
import { prisma } from "@/lib/prisma";
import { requireClientUser } from "@/lib/session";

export const dynamic = "force-dynamic";

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

function formatDate(value: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(value);
}

function formatTime(value: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

export default async function ClientSpacePage() {
  const user = await requireClientUser();
  const now = new Date();

  const [
    nextAppointment,
    totalAppointments,
    completedAppointments,
    paidAppointments,
    reviewCount,
    photoCount,
  ] = await Promise.all([
    prisma.appointment.findFirst({
      where: {
        clientId: user.id,
        startsAt: {
          gte: now,
        },
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
      },

      orderBy: {
        startsAt: "asc",
      },

      select: {
        reference: true,
        status: true,
        paymentStatus: true,
        totalPriceCents: true,
        depositCents: true,
        startsAt: true,
        endsAt: true,

        staff: {
          select: {
            displayName: true,

            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },

        services: {
          orderBy: {
            sortOrder: "asc",
          },

          select: {
            id: true,
            serviceName: true,
            quantity: true,
          },
        },
      },
    }),

    prisma.appointment.count({
      where: {
        clientId: user.id,
      },
    }),

    prisma.appointment.count({
      where: {
        clientId: user.id,
        status: "COMPLETED",
      },
    }),

    prisma.appointment.aggregate({
      where: {
        clientId: user.id,
        paymentStatus: "PAID",
      },

      _sum: {
        depositCents: true,
      },
    }),

    prisma.review.count({
      where: {
        authorId: user.id,
      },
    }),

    prisma.appointmentImage.count({
      where: {
        appointment: {
          clientId: user.id,
        },
      },
    }),
  ]);

  const vipAccess =
    await getClientVipAccessState(
      user.id,
    );

  const vipDashboard =
    vipAccess.hasAccount &&
    vipAccess.canViewDashboard
      ? await getClientVipDashboardData(
          user.id,
        )
      : null;

  const paidTotalCents =
    paidAppointments._sum.depositCents ?? 0;

  const nextAppointmentPaidCents =
    nextAppointment?.paymentStatus === "PAID"
      ? nextAppointment.depositCents
      : 0;

  const nextAppointmentRemainingCents =
    nextAppointment
      ? Math.max(
          nextAppointment.totalPriceCents -
            nextAppointmentPaidCents,
          0,
        )
      : 0;

  const staffName =
    nextAppointment?.staff?.displayName?.trim() ||
    [
      nextAppointment?.staff?.user.firstName,
      nextAppointment?.staff?.user.lastName,
    ]
      .filter(Boolean)
      .join(" ") ||
    "Le Palais des Ongles";

  const appointmentServices =
    nextAppointment?.services
      .map((service) =>
        service.quantity > 1
          ? `${service.serviceName} × ${service.quantity}`
          : service.serviceName,
      )
      .join(", ") ?? "";

  const stats = [
    {
      label: "Rendez-vous",
      value: totalAppointments.toString(),
      description: "au total",
      icon: CalendarDays,
    },
    {
      label: "Terminés",
      value: completedAppointments.toString(),
      description: "prestations réalisées",
      icon: CalendarCheck2,
    },
    {
      label: "Montant versé",
      value: formatCurrency(paidTotalCents),
      description: "paiements enregistrés",
      icon: CreditCard,
    },
    {
      label: "Avis",
      value: reviewCount.toString(),
      description: "avis déposés",
      icon: Star,
    },
    {
      label: "Photos",
      value: photoCount.toString(),
      description: "souvenirs enregistrés",
      icon: Camera,
    },
  ];

  const shortcuts = [
    {
      title: "Mes rendez-vous",
      description:
        "Consultez vos rendez-vous à venir et passés.",
      href: "/espace-client/rendez-vous",
      icon: CalendarDays,
    },
    {
      title: "Mon historique",
      description:
        "Retrouvez toutes vos anciennes prestations.",
      href: "/espace-client/historique",
      icon: History,
    },
    {
      title: "Mes poses",
      description:
        "Découvrez les photos de vos réalisations.",
      href: "/espace-client/photos",
      icon: Sparkles,
    },
    {
      title: "Mes avis",
      description:
        "Consultez et gérez vos avis publiés.",
      href: "/espace-client/avis",
      icon: Star,
    },
    {
      title: "Mes favoris",
      description:
        "Retrouvez vos prestations préférées.",
      href: "/espace-client/favoris",
      icon: Heart,
    },
    {
      title: "Mes messages",
      description:
        "Échangez directement avec le salon.",
      href: "/espace-client/messages",
      icon: MessageCircle,
    },
    {
      title: "Mon profil",
      description:
        "Modifiez vos coordonnées et préférences.",
      href: "/espace-client/profil",
      icon: UserRound,
    },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(232,180,192,0.22),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(214,182,121,0.11),transparent_32%),linear-gradient(135deg,#FFF8FA_0%,#FFFDFC_48%,#FFF4F7_100%)] px-4 py-8 sm:px-6 lg:py-12">
      <div className="relative z-10 mx-auto max-w-7xl">
        <header className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,#2F2027_0%,#5B3342_48%,#843F59_100%)] p-7 text-white shadow-[0_28px_70px_rgba(79,38,54,0.24)] sm:p-10">
          <div className="absolute -right-16 -top-20 size-72 rounded-full bg-[#E8B4C0]/25 blur-3xl" />
          <div className="absolute -bottom-24 left-20 size-64 rounded-full bg-[#D6B679]/16 blur-3xl" />

          <div className="relative flex flex-col gap-7 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-[#F4D6DF] backdrop-blur">
                Espace cliente
              </p>

              <h1 className="mt-5 font-serif text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                Bonjour {user.firstName}
              </h1>

              <p className="mt-4 max-w-xl leading-7 text-[#EADDE2]">
                Retrouvez vos rendez-vous, vos
                prestations et toutes les informations
                de votre compte.
              </p>
            </div>

            <LogoutButton />
          </div>
        </header>

        <section className="mt-10">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#A5526D]">
                À venir
              </p>

              <h2 className="mt-2 font-serif text-3xl font-semibold text-[#2F2027]">
                Prochain rendez-vous
              </h2>
            </div>

            <Link
              href="/espace-client/rendez-vous"
              className="hidden items-center gap-2 rounded-full border border-[#E8C3CF] bg-[#FFF4F7] px-4 py-2 text-sm font-black text-[#A5526D] transition hover:border-[#D8AAB9] hover:bg-[#FFEAF0] hover:text-[#843F59] sm:flex"
            >
              Voir tous
              <ChevronRight className="size-4" />
            </Link>
          </div>

          {nextAppointment ? (
            <article className="overflow-hidden rounded-[2rem] border border-[#EFDEE4] bg-white/95 shadow-[0_20px_55px_rgba(85,38,55,0.09)] backdrop-blur">
              <div className="grid lg:grid-cols-[1fr_320px]">
                <div className="p-6 sm:p-8 lg:p-9">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <span
                      className={
                        nextAppointment.status ===
                        "CONFIRMED"
                          ? "rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700 shadow-sm"
                          : "rounded-full border border-[#E8D39F] bg-[#FFF9E9] px-3 py-1.5 text-xs font-black text-[#9A6A18] shadow-sm"
                      }
                    >
                      {nextAppointment.status ===
                      "CONFIRMED"
                        ? "Rendez-vous confirmé"
                        : "Paiement en attente"}
                    </span>

                    <span className="rounded-full bg-[#FBF6F8] px-3 py-1.5 text-xs font-semibold text-[#816D75]">
                      Référence{" "}
                      {nextAppointment.reference}
                    </span>
                  </div>

                  <h3 className="mt-7 font-serif text-3xl font-semibold text-[#2F2027]">
                    {appointmentServices ||
                      "Rendez-vous au salon"}
                  </h3>

                  <div className="mt-7 grid gap-4 sm:grid-cols-3">
                    <div className="flex gap-3 rounded-[1.25rem] border border-[#EFDEE4] bg-gradient-to-br from-white to-[#FFF5F8] p-4 shadow-sm">
                      <CalendarDays className="mt-0.5 size-5 shrink-0 text-[#A5526D]" />

                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#A68C96]">
                          Date
                        </p>

                        <p className="mt-1 text-sm font-semibold capitalize text-[#2F2027]">
                          {formatDate(
                            nextAppointment.startsAt,
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3 rounded-[1.25rem] border border-[#EFDEE4] bg-gradient-to-br from-white to-[#FFF5F8] p-4 shadow-sm">
                      <Clock3 className="mt-0.5 size-5 shrink-0 text-[#A5526D]" />

                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#A68C96]">
                          Horaire
                        </p>

                        <p className="mt-1 text-sm font-bold text-[#49363E]">
                          {formatTime(
                            nextAppointment.startsAt,
                          )}
                          {" – "}
                          {formatTime(
                            nextAppointment.endsAt,
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3 rounded-[1.25rem] border border-[#EFDEE4] bg-gradient-to-br from-white to-[#FFF5F8] p-4 shadow-sm">
                      <UserRound className="mt-0.5 size-5 shrink-0 text-[#A5526D]" />

                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#A68C96]">
                          Professionnelle
                        </p>

                        <p className="mt-1 text-sm font-bold text-[#49363E]">
                          {staffName}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#E8D4DB] bg-[linear-gradient(145deg,#FFF9FA_0%,#FFF0F4_100%)] p-6 sm:p-8 lg:border-l lg:border-t-0">
                  <div className="flex items-center gap-3">
                    <ReceiptText className="size-5 text-[#A5526D]" />

                    <h3 className="font-serif text-xl font-semibold text-[#2F2027]">
                      Paiement
                    </h3>
                  </div>

                  <div className="mt-5 space-y-3 text-sm">
                    <div className="flex justify-between gap-4 text-[#816D75]">
                      <span>Total</span>

                      <strong className="text-[#2F2027]">
                        {formatCurrency(
                          nextAppointment.totalPriceCents,
                        )}
                      </strong>
                    </div>

                    <div className="flex justify-between gap-4 text-[#816D75]">
                      <span>Montant versé</span>

                      <strong className="text-[#2F2027]">
                        {formatCurrency(
                          nextAppointmentPaidCents,
                        )}
                      </strong>
                    </div>

                    <div className="flex justify-between gap-4 border-t border-[#DFC7CF] pt-4">
                      <span className="font-semibold text-[#2F2027]">
                        Solde restant
                      </span>

                      <strong className="font-serif text-xl font-semibold text-[#A5526D]">
                        {formatCurrency(
                          nextAppointmentRemainingCents,
                        )}
                      </strong>
                    </div>
                  </div>

                  <Link
                    href={`/espace-client/rendez-vous/${nextAppointment.reference}`}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#B45F7A] to-[#843F59] px-5 py-3 text-sm font-black text-white shadow-[0_12px_28px_rgba(132,63,89,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(132,63,89,0.28)]"
                  >
                    Voir le rendez-vous
                    <ChevronRight className="size-4" />
                  </Link>
                </div>
              </div>
            </article>
          ) : (
            <article className="rounded-[2rem] border border-dashed border-[#D9B4C0] bg-gradient-to-br from-white to-[#FFF4F7] p-8 text-center shadow-[0_18px_45px_rgba(85,38,55,0.06)] sm:p-12">
              <span className="mx-auto flex size-16 items-center justify-center rounded-2xl border border-[#E8C3CF] bg-gradient-to-br from-[#FFF0F5] to-[#F4D4DE] text-[#A5526D] shadow-sm">
                <CalendarDays className="size-6" />
              </span>

              <h3 className="mt-5 font-serif text-2xl font-semibold text-[#2F2027]">
                Aucun rendez-vous à venir
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#816D75]">
                Réservez votre prochaine prestation
                auprès du Palais des Ongles.
              </p>

              <Link
                href="/reservation"
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#B45F7A] to-[#843F59] px-6 py-3 text-sm font-black text-white shadow-[0_12px_28px_rgba(132,63,89,0.22)] transition hover:-translate-y-0.5"
              >
                Réserver maintenant
                <ChevronRight className="size-4" />
              </Link>
            </article>
          )}
        </section>

        {vipAccess.shouldShowNavigation ? (
          <section className="mt-10">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#A5526D]">
                  Fidélité
                </p>

                <h2 className="mt-2 font-serif text-3xl font-semibold text-[#2F2027]">
                  Résumé de mon Club VIP
                </h2>
              </div>

              <Link
                href="/espace-client/fidelite"
                className="hidden items-center gap-2 rounded-full border border-[#E8C3CF] bg-[#FFF4F7] px-4 py-2 text-sm font-black text-[#A5526D] transition hover:border-[#D8AAB9] hover:bg-[#FFEAF0] hover:text-[#843F59] sm:flex"
              >
                Ouvrir le Club VIP

                <ChevronRight className="size-4" />
              </Link>
            </div>

            {vipDashboard ? (
              <article className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,#2F2027_0%,#5B3342_46%,#843F59_100%)] p-6 text-white shadow-[0_28px_70px_rgba(79,38,54,0.24)] sm:p-8">
                <div className="absolute -right-20 -top-20 size-72 rounded-full bg-[#E8B4C0]/28 blur-3xl" />

                <div className="absolute -bottom-28 left-1/3 size-64 rounded-full bg-[#D6B679]/18 blur-3xl" />

                <div className="relative grid gap-8 lg:grid-cols-[1fr_420px] lg:items-center">
                  <div>
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#F4D6DF] backdrop-blur">
                      <Crown className="size-4" />

                      {vipAccess.branding.clubName}
                    </span>

                    <p className="mt-6 text-[10px] font-black uppercase tracking-[0.16em] text-white/55">
                      Niveau actuel
                    </p>

                    <h3 className="mt-2 font-serif text-4xl font-semibold">
                      {vipDashboard.account.currentLevel
                        ?.name ?? "Membre VIP"}
                    </h3>

                    {vipAccess.mode === "PAUSED" ? (
                      <p className="mt-3 inline-flex rounded-full bg-amber-400/15 px-3 py-1.5 text-xs font-semibold text-amber-200">
                        Programme temporairement en pause
                      </p>
                    ) : null}

                    <div className="mt-7 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-[1.25rem] border border-white/15 bg-white/10 p-4 shadow-inner backdrop-blur">
                        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/50">
                          Points
                        </p>

                        <p className="mt-2 font-serif text-2xl font-semibold">
                          {vipDashboard.account.points.toLocaleString(
                            "fr-FR",
                          )}
                        </p>
                      </div>

                      <div className="rounded-[1.25rem] border border-white/15 bg-white/10 p-4 shadow-inner backdrop-blur">
                        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/50">
                          Expérience
                        </p>

                        <p className="mt-2 font-serif text-2xl font-semibold">
                          {vipDashboard.account.experience.toLocaleString(
                            "fr-FR",
                          )}{" "}
                          XP
                        </p>
                      </div>

                      <div className="rounded-[1.25rem] border border-white/15 bg-white/10 p-4 shadow-inner backdrop-blur">
                        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/50">
                          Récompenses
                        </p>

                        <p className="mt-2 flex items-center gap-2 font-serif text-2xl font-semibold">
                          <Gift className="size-5 text-[#F0C8D3]" />

                          {vipDashboard.metrics.availableRewards.toLocaleString(
                            "fr-FR",
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[1.6rem] border border-white/15 bg-white/10 p-5 shadow-inner backdrop-blur-xl sm:p-6">
                    {vipDashboard.nextLevel ? (
                      <>
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#F0C8D3]">
                              Prochain niveau
                            </p>

                            <p className="mt-2 font-serif text-2xl font-semibold">
                              {vipDashboard.nextLevel.name}
                            </p>
                          </div>

                          <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-black">
                            {vipDashboard.progress.xpPercent} %
                          </span>
                        </div>

                        <div className="mt-6">
                          <div className="flex items-center justify-between gap-4 text-xs text-white/60">
                            <span>Progression XP</span>

                            <span>
                              {vipDashboard.progress.remainingXp.toLocaleString(
                                "fr-FR",
                              )}{" "}
                              XP restants
                            </span>
                          </div>

                          <div className="mt-2 h-3 overflow-hidden rounded-full border border-white/5 bg-white/10">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-[#F0C8D3] to-[#D6B679] transition-all"
                              style={{
                                width:
                                  `${vipDashboard.progress.xpPercent}%`,
                              }}
                            />
                          </div>
                        </div>

                        <div className="mt-5">
                          <div className="flex items-center justify-between gap-4 text-xs text-white/60">
                            <span>Progression points</span>

                            <span>
                              {vipDashboard.progress.remainingPoints.toLocaleString(
                                "fr-FR",
                              )}{" "}
                              points restants
                            </span>
                          </div>

                          <div className="mt-2 h-3 overflow-hidden rounded-full border border-white/5 bg-white/10">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-[#C97992] to-[#E8B4C0] transition-all"
                              style={{
                                width:
                                  `${vipDashboard.progress.pointsPercent}%`,
                              }}
                            />
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center">
                        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-white/10">
                          <Crown className="size-7 text-[#E8B4B8]" />
                        </span>

                        <p className="mt-4 font-serif text-2xl">
                          Niveau maximum atteint
                        </p>

                        <p className="mt-2 text-sm leading-6 text-white/60">
                          Continuez à cumuler des points pour débloquer vos
                          prochaines récompenses.
                        </p>
                      </div>
                    )}

                    <Link
                      href="/espace-client/fidelite"
                      className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 text-sm font-black text-[#843F59] shadow-[0_10px_24px_rgba(28,10,17,0.15)] transition hover:-translate-y-0.5 hover:bg-[#FFF2F6]"
                    >
                      Voir mes avantages

                      <ChevronRight className="size-4" />
                    </Link>
                  </div>
                </div>
              </article>
            ) : (
              <article className="relative overflow-hidden rounded-[2rem] border border-[#EFDEE4] bg-white/95 p-6 shadow-[0_20px_55px_rgba(85,38,55,0.09)] sm:p-8">
                <div className="absolute -right-16 -top-16 size-56 rounded-full bg-[#E8B4C0]/25 blur-3xl" />

                <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
                    <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#B45F7A] to-[#843F59] text-white shadow-[0_10px_25px_rgba(132,63,89,0.22)]">
                      {vipAccess.mode === "PRE_LAUNCH" ? (
                        <Sparkles className="size-6" />
                      ) : (
                        <Crown className="size-6" />
                      )}
                    </span>

                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#A5526D]">
                        {vipAccess.branding.clubName}
                      </p>

                      <h3 className="mt-2 font-serif text-2xl font-semibold text-[#2F2027]">
                        {vipAccess.mode === "PRE_LAUNCH"
                          ? vipAccess.branding.preLaunchTitle ??
                            "Le Club VIP arrive bientôt"
                          : "Activez votre compte fidélité"}
                      </h3>

                      <p className="mt-2 max-w-2xl text-sm leading-6 text-[#816D75]">
                        {vipAccess.mode === "PRE_LAUNCH"
                          ? vipAccess.branding.preLaunchDescription ??
                            "Des niveaux, des points et des récompenses exclusives sont en préparation."
                          : "Rejoignez le Club VIP pour cumuler des points, progresser dans les niveaux et recevoir des récompenses."}
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/espace-client/fidelite"
                    className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#B45F7A] to-[#843F59] px-6 text-sm font-black text-white shadow-[0_12px_28px_rgba(132,63,89,0.22)] transition hover:-translate-y-0.5"
                  >
                    {vipAccess.mode === "PRE_LAUNCH"
                      ? "Découvrir"
                      : "Activer mon Club VIP"}

                    <ChevronRight className="size-4" />
                  </Link>
                </div>
              </article>
            )}
          </section>
        ) : null}

        <section className="mt-10">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#A5526D]">
              Mon activité
            </p>

            <h2 className="mt-2 font-serif text-3xl font-semibold text-[#2F2027]">
              Mes statistiques
            </h2>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <article
                  key={stat.label}
                  className="group relative overflow-hidden rounded-[1.5rem] border border-[#EFDEE4] bg-white/95 p-5 shadow-[0_14px_36px_rgba(85,38,55,0.07)] transition duration-300 hover:-translate-y-1 hover:border-[#DDBAC5] hover:shadow-[0_20px_44px_rgba(132,63,89,0.12)]"
                >
                  <span className="flex size-11 items-center justify-center rounded-2xl border border-[#E8C3CF] bg-gradient-to-br from-[#FFF0F5] to-[#F4D4DE] text-[#A5526D] shadow-sm transition group-hover:scale-105">
                    <Icon className="size-5" />
                  </span>

                  <p className="mt-5 font-serif text-2xl font-semibold text-[#2F2027]">
                    {stat.value}
                  </p>

                  <p className="mt-1 text-sm font-bold text-[#49363E]">
                    {stat.label}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[#8E747E]">
                    {stat.description}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-10">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#A5526D]">
              Navigation
            </p>

            <h2 className="mt-2 font-serif text-3xl font-semibold text-[#2F2027]">
              Accès rapides
            </h2>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shortcuts.map((shortcut) => {
              const Icon = shortcut.icon;

              return (
                <Link
                  key={shortcut.title}
                  href={shortcut.href}
                  className="group flex items-start gap-4 rounded-[1.5rem] border border-[#EFDEE4] bg-white/95 p-5 shadow-[0_12px_32px_rgba(85,38,55,0.06)] transition duration-300 hover:-translate-y-1 hover:border-[#DDBAC5] hover:bg-[#FFF9FA] hover:shadow-[0_20px_44px_rgba(132,63,89,0.12)]"
                >
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-[#E8C3CF] bg-gradient-to-br from-[#FFF0F5] to-[#F4D4DE] text-[#A5526D] shadow-sm transition duration-300 group-hover:scale-105 group-hover:border-[#B45F7A] group-hover:bg-gradient-to-br group-hover:from-[#B45F7A] group-hover:to-[#843F59] group-hover:text-white">
                    <Icon className="size-5" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-serif text-xl font-semibold text-[#2F2027]">
                      {shortcut.title}
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-[#816D75]">
                      {shortcut.description}
                    </p>
                  </div>

                  <ChevronRight className="mt-2 size-5 shrink-0 text-[#B4939F] transition group-hover:translate-x-1 group-hover:text-[#843F59]" />
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
