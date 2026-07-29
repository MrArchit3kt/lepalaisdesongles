import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  Clock3,
  CreditCard,
  ExternalLink,
  ImageIcon,
  Mail,
  MapPin,
  MessageSquareText,
  Phone,
  ReceiptText,
  Star,
  UserRound,
  XCircle,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { requireClientUser } from "@/lib/session";
import { CancelAppointmentButton } from "@/features/client/components/cancel-appointment-button";

export const dynamic = "force-dynamic";

type AppointmentDetailPageProps = {
  params: Promise<{
    reference: string;
  }>;

  searchParams: Promise<{
    cancelled?: string;
    late?: string;
    error?: string;
  }>;
};

const SALON_NAME = "Le Palais des Ongles";
const SALON_ADDRESS =
  "31 route d'Autun, 71140 Maltat, France";
const SALON_PHONE = "07 49 85 31 88";
const SALON_EMAIL =
  "lepalaisdesongles@gmail.com";

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

function formatDateTime(value: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes} min`;
  }

  if (remainingMinutes === 0) {
    return `${hours} h`;
  }

  return `${hours} h ${remainingMinutes
    .toString()
    .padStart(2, "0")}`;
}

function getStatusPresentation(
  status: string,
  paymentStatus: string,
) {
  if (status === "CONFIRMED") {
    return {
      label: "Rendez-vous confirmé",
      description:
        "Votre rendez-vous est confirmé par le salon.",
      icon: CheckCircle2,
      className:
        "border-emerald-200 bg-gradient-to-br from-emerald-50 to-white text-emerald-700 shadow-sm",
    };
  }

  if (status === "PENDING") {
    return {
      label:
        paymentStatus === "PAID"
          ? "Validation du salon en attente"
          : "Paiement en attente",
      description:
        paymentStatus === "PAID"
          ? "Votre paiement est enregistré. Le salon doit encore confirmer le rendez-vous."
          : "Le rendez-vous sera confirmé après le règlement demandé.",
      icon: AlertCircle,
      className:
        "border-[#E8D39F] bg-gradient-to-br from-[#FFFBEF] to-[#FFF6DC] text-[#9A6A18] shadow-sm",
    };
  }

  if (status === "COMPLETED") {
    return {
      label: "Rendez-vous terminé",
      description:
        "Cette prestation a été réalisée.",
      icon: CheckCircle2,
      className:
        "border-[#DABCCA] bg-gradient-to-br from-[#FFF7FA] to-[#FFF0F5] text-[#843F59] shadow-sm",
    };
  }

  if (status === "EXPIRED") {
    return {
      label: "Rendez-vous expiré",
      description:
        "Le délai de paiement de cette réservation a expiré.",
      icon: XCircle,
      className:
        "border-[#E6D8DD] bg-gradient-to-br from-white to-[#F8F4F5] text-[#806C74]",
    };
  }

  if (
    status === "CANCELLED_BY_CLIENT" ||
    status === "CANCELLED_BY_ADMIN"
  ) {
    return {
      label: "Rendez-vous annulé",
      description:
        status === "CANCELLED_BY_CLIENT"
          ? "Ce rendez-vous a été annulé par la cliente."
          : "Ce rendez-vous a été annulé par le salon.",
      icon: XCircle,
      className:
        "border-red-200 bg-red-50 text-red-700",
    };
  }

  if (status === "REFUSED") {
    return {
      label: "Rendez-vous refusé",
      description:
        "Le salon n'a pas pu accepter cette demande.",
      icon: XCircle,
      className:
        "border-red-200 bg-red-50 text-red-700",
    };
  }

  return {
    label: status,
    description:
      "Consultez les informations de votre rendez-vous.",
    icon: AlertCircle,
    className:
      "border-[#E6D8DD] bg-gradient-to-br from-white to-[#F8F4F5] text-[#806C74]",
  };
}

function getReviewStatusLabel(status: string): string {
  if (status === "APPROVED") {
    return "Avis publié";
  }

  if (status === "REJECTED") {
    return "Avis refusé";
  }

  return "Avis en cours de validation";
}

export default async function AppointmentDetailPage({
  params,
  searchParams,
}: AppointmentDetailPageProps) {
  const user = await requireClientUser();

  const { reference } = await params;
  const query = await searchParams;

  const cleanReference = reference.trim();

  if (!cleanReference) {
    notFound();
  }

  const appointment =
    await prisma.appointment.findFirst({
      where: {
        reference: cleanReference,
        clientId: user.id,
      },

      select: {
        id: true,
        reference: true,
        status: true,
        paymentStatus: true,
        paymentMethod: true,

        startsAt: true,
        endsAt: true,
        totalDurationMinutes: true,

        totalPriceCents: true,
        depositCents: true,

        clientComment: true,
        adminComment: true,
        cancellationReason: true,

        paidAt: true,
        confirmedAt: true,
        cancelledAt: true,
        completedAt: true,
        createdAt: true,

        staff: {
          select: {
            displayName: true,
            bio: true,

            user: {
              select: {
                firstName: true,
                lastName: true,
                image: true,
              },
            },
          },
        },

        workstation: {
          select: {
            name: true,
          },
        },

        services: {
          orderBy: {
            sortOrder: "asc",
          },

          select: {
            id: true,
            serviceName: true,
            unitPriceCents: true,
            durationMinutes: true,
            quantity: true,
            comment: true,

            service: {
              select: {
                slug: true,
                imageUrl: true,
                shortDescription: true,

                category: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },

        images: {
          orderBy: {
            createdAt: "asc",
          },

          select: {
            id: true,
            url: true,
            fileName: true,
            mimeType: true,
            createdAt: true,
          },
        },

        review: {
          select: {
            id: true,
            rating: true,
            title: true,
            content: true,
            response: true,
            status: true,
            isVerified: true,
            publishedAt: true,
            respondedAt: true,
            createdAt: true,
          },
        },
      },
    });

  if (!appointment) {
    notFound();
  }

  const statusPresentation =
    getStatusPresentation(
      appointment.status,
      appointment.paymentStatus,
    );

  const StatusIcon = statusPresentation.icon;

  const staffName =
    appointment.staff?.displayName?.trim() ||
    [
      appointment.staff?.user.firstName,
      appointment.staff?.user.lastName,
    ]
      .filter(Boolean)
      .join(" ") ||
    SALON_NAME;

  const amountPaidCents =
    appointment.paymentStatus === "PAID"
      ? appointment.depositCents
      : 0;

  const remainingCents = Math.max(
    appointment.totalPriceCents -
      amountPaidCents,
    0,
  );

  const canDownloadCalendar =
    appointment.status === "CONFIRMED";

  const isInactive =
    appointment.status === "EXPIRED" ||
    appointment.status ===
      "CANCELLED_BY_CLIENT" ||
    appointment.status ===
      "CANCELLED_BY_ADMIN" ||
    appointment.status === "REFUSED";

  const mapsUrl =
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent(SALON_ADDRESS);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(232,180,192,0.20),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(214,182,121,0.10),transparent_32%),linear-gradient(135deg,#FFF8FA_0%,#FFFDFC_48%,#FFF4F7_100%)] px-4 py-8 sm:px-6 lg:py-12">
      <div className="relative z-10 mx-auto max-w-7xl">
        {query.cancelled === "1" ? (
          <div className="mb-6 rounded-[1.5rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5 text-emerald-800 shadow-[0_14px_35px_rgba(16,185,129,0.08)]">
            <div className="flex gap-3">
              <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
              <div>
                <p className="font-semibold">
                  Votre rendez-vous a bien été annulé.
                </p>
                <p className="mt-1 text-sm leading-6">
                  Le créneau a été libéré et le salon peut
                  désormais consulter votre motif d’annulation.
                </p>
                {query.late === "1" ? (
                  <p className="mt-2 text-sm font-semibold">
                    Cette annulation ayant été effectuée à moins de
                    48 heures, la somme versée peut être conservée
                    conformément aux conditions du salon.
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}

        {query.error ? (
          <div className="mb-6 rounded-[1.5rem] border border-red-200 bg-gradient-to-br from-red-50 to-white p-5 text-red-700 shadow-[0_14px_35px_rgba(220,38,38,0.07)]">
            <div className="flex gap-3">
              <AlertCircle className="mt-0.5 size-5 shrink-0" />
              <p className="text-sm font-semibold leading-6">
                {query.error}
              </p>
            </div>
          </div>
        ) : null}

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/espace-client/rendez-vous"
            className="inline-flex items-center gap-2 rounded-full border border-[#E8C3CF] bg-white/85 px-4 py-2 text-sm font-black text-[#A5526D] shadow-sm transition hover:border-[#D8AAB9] hover:bg-[#FFF0F4] hover:text-[#843F59]"
          >
            <ArrowLeft className="size-4" />
            Retour à mes rendez-vous
          </Link>

          <span className="rounded-full border border-[#E8C3CF] bg-white/90 px-4 py-2 text-xs font-black text-[#816D75] shadow-sm">
            Référence {appointment.reference}
          </span>
        </div>

        <header className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,#2F2027_0%,#5B3342_48%,#843F59_100%)] p-7 text-white shadow-[0_28px_70px_rgba(79,38,54,0.24)] sm:p-10">
          <div className="absolute -right-20 -top-20 size-72 rounded-full bg-[#E8B4C0]/25 blur-3xl" />
          <div className="absolute -bottom-28 left-20 size-72 rounded-full bg-[#D6B679]/16 blur-3xl" />

          <div className="relative">
            <div
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-black ${statusPresentation.className}`}
            >
              <StatusIcon className="size-4" />
              {statusPresentation.label}
            </div>

            <h1 className="mt-6 max-w-4xl font-serif text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              {appointment.services.length > 0
                ? appointment.services
                    .map(
                      (service) =>
                        service.serviceName,
                    )
                    .join(", ")
                : "Rendez-vous au salon"}
            </h1>

            <p className="mt-4 max-w-2xl leading-7 text-[#EADDE2]">
              {statusPresentation.description}
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-[1.25rem] border border-white/15 bg-white/10 p-4 shadow-inner backdrop-blur-xl">
                <CalendarDays className="size-5 text-[#F0C8D3]" />

                <p className="mt-3 text-[10px] font-black uppercase tracking-[0.16em] text-white/50">
                  Date
                </p>

                <p className="mt-1 font-semibold capitalize">
                  {formatDate(
                    appointment.startsAt,
                  )}
                </p>
              </div>

              <div className="rounded-[1.25rem] border border-white/15 bg-white/10 p-4 shadow-inner backdrop-blur-xl">
                <Clock3 className="size-5 text-[#F0C8D3]" />

                <p className="mt-3 text-[10px] font-black uppercase tracking-[0.16em] text-white/50">
                  Horaire
                </p>

                <p className="mt-1 font-semibold">
                  {formatTime(
                    appointment.startsAt,
                  )}
                  {" – "}
                  {formatTime(appointment.endsAt)}
                </p>
              </div>

              <div className="rounded-[1.25rem] border border-white/15 bg-white/10 p-4 shadow-inner backdrop-blur-xl">
                <UserRound className="size-5 text-[#F0C8D3]" />

                <p className="mt-3 text-[10px] font-black uppercase tracking-[0.16em] text-white/50">
                  Professionnelle
                </p>

                <p className="mt-1 font-semibold">
                  {staffName}
                </p>
              </div>

              <div className="rounded-[1.25rem] border border-white/15 bg-white/10 p-4 shadow-inner backdrop-blur-xl">
                <ReceiptText className="size-5 text-[#F0C8D3]" />

                <p className="mt-3 text-[10px] font-black uppercase tracking-[0.16em] text-white/50">
                  Durée
                </p>

                <p className="mt-1 font-semibold">
                  {formatDuration(
                    appointment.totalDurationMinutes,
                  )}
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-8">
            <section className="rounded-[2rem] border border-[#EFDEE4] bg-white/95 p-6 shadow-[0_18px_48px_rgba(85,38,55,0.08)] backdrop-blur sm:p-8">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#A5526D]">
                  Prestations
                </p>

                <h2 className="mt-2 font-serif text-3xl font-semibold text-[#2F2027]">
                  Détail du rendez-vous
                </h2>
              </div>

              <div className="mt-6 divide-y divide-[#F0E1E6]">
                {appointment.services.map(
                  (service) => {
                    const serviceTotal =
                      service.unitPriceCents *
                      service.quantity;

                    return (
                      <article
                        key={service.id}
                        className="py-5 first:pt-0 last:pb-0"
                      >
                        <div className="flex items-start justify-between gap-5">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-serif text-xl font-semibold text-[#2F2027]">
                                {service.serviceName}
                              </h3>

                              {service.quantity > 1 ? (
                                <span className="rounded-full border border-[#E8C3CF] bg-[#FFF1F5] px-2.5 py-1 text-xs font-black text-[#A5526D]">
                                  × {service.quantity}
                                </span>
                              ) : null}
                            </div>

                            <p className="mt-2 text-sm text-[#816D75]">
                              {
                                service.service
                                  .category.name
                              }
                              {" • "}
                              {formatDuration(
                                service.durationMinutes *
                                  service.quantity,
                              )}
                            </p>

                            {service.service
                              .shortDescription ? (
                              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#816D75]">
                                {
                                  service.service
                                    .shortDescription
                                }
                              </p>
                            ) : null}

                            {service.comment ? (
                              <div className="mt-3 rounded-[1.25rem] border border-[#EFDEE4] bg-gradient-to-br from-white to-[#FFF5F8] p-4 text-sm leading-6 text-[#816D75]">
                                <strong className="text-[#2F2027]">
                                  Précision :
                                </strong>{" "}
                                {service.comment}
                              </div>
                            ) : null}

                            <Link
                              href={`/prestations/${service.service.slug}`}
                              className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#E8C3CF] bg-[#FFF4F7] px-4 py-2 text-sm font-black text-[#A5526D] transition hover:border-[#D8AAB9] hover:bg-[#FFEAF0] hover:text-[#843F59]"
                            >
                              Voir la prestation
                              <ExternalLink className="size-3.5" />
                            </Link>
                          </div>

                          <strong className="shrink-0 font-serif text-xl font-semibold text-[#2F2027]">
                            {formatCurrency(
                              serviceTotal,
                            )}
                          </strong>
                        </div>
                      </article>
                    );
                  },
                )}
              </div>
            </section>

            {(appointment.clientComment ||
              appointment.adminComment ||
              appointment.cancellationReason) && (
              <section className="rounded-[2rem] border border-[#EFDEE4] bg-white/95 p-6 shadow-[0_18px_48px_rgba(85,38,55,0.08)] backdrop-blur sm:p-8">
                <div className="flex items-center gap-3">
                  <span className="flex size-12 items-center justify-center rounded-2xl border border-[#E8C3CF] bg-gradient-to-br from-[#FFF0F5] to-[#F4D4DE] text-[#A5526D] shadow-sm">
                    <MessageSquareText className="size-5" />
                  </span>

                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#A5526D]">
                      Informations
                    </p>

                    <h2 className="font-serif text-2xl font-semibold text-[#2F2027]">
                      Commentaires
                    </h2>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {appointment.clientComment ? (
                    <div className="rounded-[1.25rem] border border-[#EFDEE4] bg-gradient-to-br from-white to-[#FFF7F9] p-5">
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#A5526D]">
                        Votre commentaire
                      </p>

                      <p className="mt-2 text-sm leading-6 text-[#816D75]">
                        {appointment.clientComment}
                      </p>
                    </div>
                  ) : null}

                  {appointment.adminComment ? (
                    <div className="rounded-[1.25rem] border border-[#E8D4DB] bg-gradient-to-br from-[#FFF9FA] to-[#FFF0F4] p-5">
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#A5526D]">
                        Message du salon
                      </p>

                      <p className="mt-2 text-sm leading-6 text-[#816D75]">
                        {appointment.adminComment}
                      </p>
                    </div>
                  ) : null}

                  {appointment.cancellationReason ? (
                    <div className="rounded-[1.25rem] border border-red-200 bg-gradient-to-br from-red-50 to-white p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.13em] text-red-700">
                        Motif d’annulation
                      </p>

                      <p className="mt-2 text-sm leading-6 text-red-700">
                        {
                          appointment.cancellationReason
                        }
                      </p>
                    </div>
                  ) : null}
                </div>
              </section>
            )}

            <section className="rounded-[2rem] border border-[#EFDEE4] bg-white/95 p-6 shadow-[0_18px_48px_rgba(85,38,55,0.08)] backdrop-blur sm:p-8">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#A5526D]">
                    Galerie privée
                  </p>

                  <h2 className="mt-2 font-serif text-3xl font-semibold text-[#2F2027]">
                    Photos du rendez-vous
                  </h2>
                </div>

                <span className="rounded-full border border-[#E8C3CF] bg-[#FFF4F7] px-3 py-1.5 text-sm font-semibold text-[#816D75]">
                  {appointment.images.length} photo
                  {appointment.images.length > 1
                    ? "s"
                    : ""}
                </span>
              </div>

              {appointment.images.length > 0 ? (
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {appointment.images.map(
                    (image) => (
                      <a
                        key={image.id}
                        href={image.url}
                        target="_blank"
                        rel="noreferrer"
                        className="group overflow-hidden rounded-[1.5rem] border border-[#EFDEE4] bg-white shadow-[0_12px_30px_rgba(85,38,55,0.06)] transition hover:-translate-y-0.5 hover:border-[#DDBAC5] hover:shadow-[0_18px_40px_rgba(132,63,89,0.11)]"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={image.url}
                          alt={
                            image.fileName ||
                            "Photo du rendez-vous"
                          }
                          className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                        />

                        <div className="flex items-center justify-between gap-4 p-4">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-[#2F2027]">
                              {image.fileName ||
                                "Photo de la pose"}
                            </p>

                            <p className="mt-1 text-xs text-[#8E747E]">
                              Ajoutée le{" "}
                              {formatDateTime(
                                image.createdAt,
                              )}
                            </p>
                          </div>

                          <ExternalLink className="size-4 shrink-0 text-[#A5526D]" />
                        </div>
                      </a>
                    ),
                  )}
                </div>
              ) : (
                <div className="mt-6 rounded-[1.5rem] border border-dashed border-[#D9B4C0] bg-gradient-to-br from-white to-[#FFF4F7] p-8 text-center">
                  <ImageIcon className="mx-auto size-7 text-[#A5526D]" />

                  <h3 className="mt-4 font-serif text-xl font-semibold text-[#2F2027]">
                    Aucune photo disponible
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-[#816D75]">
                    Les photos ajoutées par le salon
                    apparaîtront ici.
                  </p>
                </div>
              )}
            </section>

            <section className="rounded-[2rem] border border-[#EFDEE4] bg-white/95 p-6 shadow-[0_18px_48px_rgba(85,38,55,0.08)] backdrop-blur sm:p-8">
              <div className="flex items-center gap-3">
                <span className="flex size-12 items-center justify-center rounded-2xl border border-[#E8C3CF] bg-gradient-to-br from-[#FFF0F5] to-[#F4D4DE] text-[#A5526D] shadow-sm">
                  <Star className="size-5" />
                </span>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#A5526D]">
                    Votre expérience
                  </p>

                  <h2 className="font-serif text-2xl font-semibold text-[#2F2027]">
                    Avis
                  </h2>
                </div>
              </div>

              {appointment.review ? (
                <div className="mt-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-1">
                      {Array.from({
                        length: 5,
                      }).map((_, index) => (
                        <Star
                          key={index}
                          className={
                            index <
                            appointment.review!.rating
                              ? "size-5 fill-current text-[#D6B679]"
                              : "size-5 text-[#E3D7DB]"
                          }
                        />
                      ))}
                    </div>

                    <span className="rounded-full border border-[#E8C3CF] bg-[#FFF1F5] px-3 py-1.5 text-xs font-black text-[#A5526D]">
                      {getReviewStatusLabel(
                        appointment.review.status,
                      )}
                    </span>
                  </div>

                  {appointment.review.title ? (
                    <h3 className="mt-5 font-serif text-2xl font-semibold text-[#2F2027]">
                      {appointment.review.title}
                    </h3>
                  ) : null}

                  <p className="mt-3 leading-7 text-[#816D75]">
                    {appointment.review.content}
                  </p>

                  <p className="mt-3 text-xs text-[#8E747E]">
                    Déposé le{" "}
                    {formatDateTime(
                      appointment.review.createdAt,
                    )}
                  </p>

                  {appointment.review.response ? (
                    <div className="mt-6 rounded-[1.25rem] border border-[#E8D4DB] bg-gradient-to-br from-[#FFF9FA] to-[#FFF0F4] p-5">
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#A5526D]">
                        Réponse du salon
                      </p>

                      <p className="mt-2 text-sm leading-6 text-[#816D75]">
                        {appointment.review.response}
                      </p>
                    </div>
                  ) : null}
                </div>
              ) : appointment.status ===
                "COMPLETED" ? (
                <div className="mt-6 rounded-[1.5rem] border border-[#EFDEE4] bg-gradient-to-br from-white to-[#FFF5F8] p-6">
                  <h3 className="font-serif text-xl font-semibold text-[#2F2027]">
                    Partagez votre expérience
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-[#816D75]">
                    Vous pourrez bientôt déposer un avis
                    depuis votre espace cliente.
                  </p>
                </div>
              ) : (
                <div className="mt-6 rounded-[1.5rem] border border-[#EFDEE4] bg-gradient-to-br from-white to-[#FFF5F8] p-6">
                  <p className="text-sm leading-6 text-[#816D75]">
                    Vous pourrez laisser un avis une fois
                    le rendez-vous terminé.
                  </p>
                </div>
              )}
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-[2rem] border border-[#EFDEE4] bg-white/95 p-6 shadow-[0_18px_48px_rgba(85,38,55,0.08)] backdrop-blur">
              <div className="flex items-center gap-3">
                <CreditCard className="size-5 text-[#A5526D]" />

                <h2 className="font-serif text-2xl font-semibold text-[#2F2027]">
                  Paiement
                </h2>
              </div>

              <div className="mt-6 space-y-4 text-sm">
                <div className="flex justify-between gap-4 text-[#816D75]">
                  <span>Total des prestations</span>

                  <strong className="text-[#2F2027]">
                    {formatCurrency(
                      appointment.totalPriceCents,
                    )}
                  </strong>
                </div>

                <div className="flex justify-between gap-4 text-[#816D75]">
                  <span>Montant versé</span>

                  <strong className="text-[#2F2027]">
                    {formatCurrency(
                      amountPaidCents,
                    )}
                  </strong>
                </div>

                <div className="flex justify-between gap-4 border-t border-[#DFC7CF] pt-4">
                  <span className="font-semibold text-[#2F2027]">
                    Solde restant
                  </span>

                  <strong className="font-serif text-xl font-semibold text-[#A5526D]">
                    {formatCurrency(
                      remainingCents,
                    )}
                  </strong>
                </div>
              </div>

              <div className="mt-6 rounded-[1.25rem] border border-[#EFDEE4] bg-gradient-to-br from-white to-[#FFF5F8] p-4 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-[#816D75]">
                    Statut
                  </span>

                  <strong className="text-[#2F2027]">
                    {appointment.paymentStatus ===
                    "PAID"
                      ? "Payé"
                      : appointment.paymentStatus ===
                          "PENDING"
                        ? "En attente"
                        : "Non réglé"}
                  </strong>
                </div>

                {appointment.paidAt ? (
                  <p className="mt-3 border-t border-[#EAD9DF] pt-3 text-xs text-[#8E747E]">
                    Paiement enregistré le{" "}
                    {formatDateTime(
                      appointment.paidAt,
                    )}
                  </p>
                ) : null}
              </div>
            </section>

            <section className="rounded-[2rem] border border-[#EFDEE4] bg-white/95 p-6 shadow-[0_18px_48px_rgba(85,38,55,0.08)] backdrop-blur">
              <h2 className="font-serif text-2xl font-semibold text-[#2F2027]">
                Actions
              </h2>

              <div className="mt-5 space-y-3">
                {canDownloadCalendar ? (
                  <a
                    href={`/api/appointments/${encodeURIComponent(
                      appointment.reference,
                    )}/calendar`}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#B45F7A] to-[#843F59] px-5 py-3 text-sm font-black text-white shadow-[0_12px_28px_rgba(132,63,89,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(132,63,89,0.28)]"
                  >
                    <CalendarPlus className="size-4" />
                    Ajouter au calendrier
                  </a>
                ) : (
                  <div className="rounded-2xl border border-[#E6D8DD] bg-[#F8F4F5] px-5 py-3 text-center text-sm font-semibold text-[#8E747E]">
                    Calendrier disponible après
                    confirmation
                  </div>
                )}

                {(
                  appointment.status === "PENDING" ||
                  appointment.status === "CONFIRMED"
                ) &&
                appointment.startsAt > new Date() ? (
                  <CancelAppointmentButton
                    reference={appointment.reference}
                    startsAt={appointment.startsAt.toISOString()}
                    depositCents={appointment.depositCents}
                    paymentStatus={appointment.paymentStatus}
                  />
                ) : null}

                {!isInactive ? (
                  <Link
                    href="/contact"
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#E8C3CF] bg-white px-5 py-3 text-sm font-black text-[#843F59] shadow-sm transition hover:-translate-y-0.5 hover:border-[#D8AAB9] hover:bg-[#FFF0F4]"
                  >
                    <MessageSquareText className="size-4" />
                    Contacter le salon
                  </Link>
                ) : null}

                <Link
                  href="/reservation"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#E8C3CF] bg-white px-5 py-3 text-sm font-black text-[#843F59] shadow-sm transition hover:-translate-y-0.5 hover:border-[#D8AAB9] hover:bg-[#FFF0F4]"
                >
                  <CalendarDays className="size-4" />
                  Nouveau rendez-vous
                </Link>
              </div>
            </section>

            <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,#2F2027_0%,#5B3342_48%,#843F59_100%)] p-6 text-white shadow-[0_24px_55px_rgba(79,38,54,0.22)]">
              <div className="flex items-center gap-3">
                <MapPin className="size-5 text-[#F0C8D3]" />

                <h2 className="font-serif text-2xl font-semibold">
                  Le salon
                </h2>
              </div>

              <p className="mt-5 font-semibold">
                {SALON_NAME}
              </p>

              <p className="mt-2 text-sm leading-6 text-[#EADDE2]">
                {SALON_ADDRESS}
              </p>

              {appointment.workstation ? (
                <p className="mt-3 text-sm text-[#EADDE2]">
                  Poste :{" "}
                  <strong className="text-white">
                    {appointment.workstation.name}
                  </strong>
                </p>
              ) : null}

              <div className="mt-6 space-y-3 border-t border-white/15 pt-5">
                <a
                  href={`tel:${SALON_PHONE.replace(
                    /\s/g,
                    "",
                  )}`}
                  className="flex items-center gap-3 text-sm text-[#EADDE2] transition hover:text-white"
                >
                  <Phone className="size-4 text-[#F0C8D3]" />
                  {SALON_PHONE}
                </a>

                <a
                  href={`mailto:${SALON_EMAIL}`}
                  className="flex items-center gap-3 break-all text-sm text-[#EADDE2] transition hover:text-white"
                >
                  <Mail className="size-4 shrink-0 text-[#F0C8D3]" />
                  {SALON_EMAIL}
                </a>
              </div>

              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-[#843F59] shadow-[0_10px_24px_rgba(28,10,17,0.15)] transition hover:-translate-y-0.5 hover:bg-[#FFF2F6]"
              >
                <MapPin className="size-4" />
                Ouvrir dans Maps
              </a>
            </section>

            <section className="rounded-[1.5rem] border border-[#E8D39F] bg-gradient-to-br from-[#FFFBEF] to-[#FFF6DC] p-5 shadow-[0_14px_35px_rgba(154,106,24,0.08)]">
              <div className="flex gap-3">
                <AlertCircle className="mt-0.5 size-5 shrink-0 text-[#9A6A18]" />

                <div>
                  <h3 className="font-serif text-lg font-semibold text-[#72501A]">
                    Politique d’annulation
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-[#886221]">
                    Toute annulation effectuée moins de
                    48 heures avant le rendez-vous
                    entraîne la perte de la somme déjà
                    versée.
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-[1.5rem] border border-[#EFDEE4] bg-white/90 p-5 text-xs leading-6 text-[#8E747E] shadow-[0_12px_32px_rgba(85,38,55,0.05)]">
              <p>
                Réservation créée le{" "}
                {formatDateTime(
                  appointment.createdAt,
                )}
              </p>

              {appointment.confirmedAt ? (
                <p>
                  Confirmée le{" "}
                  {formatDateTime(
                    appointment.confirmedAt,
                  )}
                </p>
              ) : null}

              {appointment.completedAt ? (
                <p>
                  Terminée le{" "}
                  {formatDateTime(
                    appointment.completedAt,
                  )}
                </p>
              ) : null}

              {appointment.cancelledAt ? (
                <p>
                  Annulée le{" "}
                  {formatDateTime(
                    appointment.cancelledAt,
                  )}
                </p>
              ) : null}
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
