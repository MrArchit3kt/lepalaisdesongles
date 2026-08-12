import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CalendarDays, ImageIcon } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { requireClientUser } from "@/lib/session";

export const dynamic = "force-dynamic";

function formatDate(value: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(value);
}

export default async function ClientPhotosPage() {
  const user = await requireClientUser();

  const appointments = await prisma.appointment.findMany({
    where: {
      clientId: user.id,
      images: { some: {} },
    },

    orderBy: { startsAt: "desc" },

    select: {
      id: true,
      reference: true,
      startsAt: true,

      services: {
        orderBy: { sortOrder: "asc" },
        select: { serviceName: true },
      },

      images: {
        orderBy: { createdAt: "asc" },
        select: { id: true, url: true, fileName: true },
      },
    },
  });

  const totalPhotos = appointments.reduce(
    (total, appointment) => total + appointment.images.length,
    0,
  );

  return (
    <main className="pb-16">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
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
            <ImageIcon className="size-6" />
          </span>

          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#A5526D]">
              Mon espace
            </p>

            <h1 className="mt-1 font-serif text-3xl font-semibold text-[#2F2027] sm:text-4xl">
              Mes photos
            </h1>

            <p className="mt-2 text-sm leading-6 text-[#816D75]">
              Les {totalPhotos > 1 ? "photos" : "photo"} d’inspiration
              envoyées avec vos réservations.
            </p>
          </div>
        </div>

        {appointments.length > 0 ? (
          <div className="mt-8 space-y-8">
            {appointments.map((appointment) => (
              <section key={appointment.id}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-serif text-xl font-semibold text-[#2F2027]">
                      {appointment.services
                        .map((service) => service.serviceName)
                        .join(", ") || "Rendez-vous"}
                    </p>

                    <p className="mt-1 flex items-center gap-2 text-xs text-[#8E747E]">
                      <CalendarDays className="size-3.5" />
                      {formatDate(appointment.startsAt)}
                    </p>
                  </div>

                  <Link
                    href={`/espace-client/rendez-vous/${encodeURIComponent(
                      appointment.reference,
                    )}`}
                    className="text-sm font-semibold text-[#A64D69] transition hover:text-[#35242B]"
                  >
                    Voir le rendez-vous
                  </Link>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {appointment.images.map((image) => (
                    <div
                      key={image.id}
                      className="relative aspect-square overflow-hidden rounded-[1.5rem] border border-[#EFDEE4] bg-[#F6E7EB]"
                    >
                      <Image
                        src={image.url}
                        alt={image.fileName ?? "Photo d’inspiration"}
                        fill
                        sizes="(max-width: 640px) 50vw, 25vw"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-[30px] border border-dashed border-[#DCA8B8] bg-white px-6 py-16 text-center">
            <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#FFF0F4] text-[#A64D69]">
              <ImageIcon className="size-6" />
            </span>

            <h2 className="mt-5 font-serif text-3xl text-[#35242B]">
              Aucune photo pour le moment
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#79636C]">
              Les photos d’inspiration que vous envoyez lors d’une
              réservation apparaîtront ici.
            </p>

            <Link
              href="/reservation"
              className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-gradient-to-r from-[#AA526E] via-[#BD7088] to-[#8B405A] px-6 text-sm font-semibold text-white"
            >
              Prendre rendez-vous
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
