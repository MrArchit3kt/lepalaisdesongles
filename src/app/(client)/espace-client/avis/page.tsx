import Link from "next/link";
import { ArrowLeft, MessageSquareHeart, Star } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { requireClientUser } from "@/lib/session";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "En cours de validation",
  APPROVED: "Publié",
  REJECTED: "Non retenu",
  HIDDEN: "Masqué",
};

const STATUS_CLASSES: Record<string, string> = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-700",
  APPROVED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  REJECTED: "border-rose-200 bg-rose-50 text-rose-700",
  HIDDEN: "border-zinc-200 bg-zinc-100 text-zinc-600",
};

function formatDate(value: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(value);
}

export default async function ClientReviewsPage() {
  const user = await requireClientUser();

  const reviews = await prisma.review.findMany({
    where: { authorId: user.id },
    orderBy: { createdAt: "desc" },

    select: {
      id: true,
      status: true,
      rating: true,
      title: true,
      content: true,
      response: true,
      createdAt: true,

      appointment: {
        select: {
          reference: true,

          services: {
            orderBy: { sortOrder: "asc" },
            select: { serviceName: true },
          },
        },
      },
    },
  });

  return (
    <main className="pb-16">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="pt-5 sm:pt-8">
          <Link
            href="/espace-client"
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-[#6F5962] transition hover:bg-white hover:text-[#35242B] hover:shadow-sm"
          >
            <ArrowLeft className="size-4" />
            Retour à mon espace
          </Link>
        </div>

        <div className="mt-6 flex items-center gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#AA526E] to-[#8B405A] text-white shadow-sm">
            <MessageSquareHeart className="size-6" />
          </span>

          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#A5526D]">
              Mon espace
            </p>

            <h1 className="mt-1 font-serif text-3xl font-semibold text-[#2F2027] sm:text-4xl">
              Mes avis
            </h1>
          </div>
        </div>

        {reviews.length > 0 ? (
          <div className="mt-8 space-y-5">
            {reviews.map((review) => (
              <article
                key={review.id}
                className="rounded-[1.75rem] border border-[#EFDEE4] bg-white p-6 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={index}
                        className={
                          index < review.rating
                            ? "size-4 fill-[#D6B679] text-[#D6B679]"
                            : "size-4 text-[#E3D7DB]"
                        }
                      />
                    ))}
                  </div>

                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-bold ${
                      STATUS_CLASSES[review.status] ?? STATUS_CLASSES.PENDING
                    }`}
                  >
                    {STATUS_LABELS[review.status] ?? review.status}
                  </span>
                </div>

                {review.appointment?.services.length ? (
                  <p className="mt-3 text-xs font-bold uppercase tracking-[0.14em] text-[#A5526D]">
                    {review.appointment.services
                      .map((service) => service.serviceName)
                      .join(", ")}
                  </p>
                ) : null}

                {review.title ? (
                  <h2 className="mt-2 font-serif text-xl font-semibold text-[#2F2027]">
                    {review.title}
                  </h2>
                ) : null}

                <p className="mt-2 leading-7 text-[#816D75]">
                  {review.content}
                </p>

                <p className="mt-3 text-xs text-[#8E747E]">
                  Déposé le {formatDate(review.createdAt)}
                </p>

                {review.response ? (
                  <div className="mt-5 rounded-[1.25rem] border border-[#E8D4DB] bg-gradient-to-br from-[#FFF9FA] to-[#FFF0F4] p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#A5526D]">
                      Réponse du salon
                    </p>

                    <p className="mt-2 text-sm leading-6 text-[#816D75]">
                      {review.response}
                    </p>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-[30px] border border-dashed border-[#DCA8B8] bg-white px-6 py-16 text-center">
            <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#FFF0F4] text-[#A64D69]">
              <MessageSquareHeart className="size-6" />
            </span>

            <h2 className="mt-5 font-serif text-3xl text-[#35242B]">
              Aucun avis pour le moment
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#79636C]">
              Vous pourrez déposer un avis depuis la page d’un rendez-vous
              terminé.
            </p>

            <Link
              href="/espace-client/rendez-vous"
              className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-gradient-to-r from-[#AA526E] via-[#BD7088] to-[#8B405A] px-6 text-sm font-semibold text-white"
            >
              Voir mes rendez-vous
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
