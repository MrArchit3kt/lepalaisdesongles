"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireClientUser } from "@/lib/session";

function buildAppointmentUrl(
  reference: string,
  parameters?: Record<string, string>,
): string {
  const encodedReference = encodeURIComponent(reference);

  const searchParameters = new URLSearchParams(parameters);

  const query = searchParameters.toString();

  return query
    ? `/espace-client/rendez-vous/${encodedReference}?${query}`
    : `/espace-client/rendez-vous/${encodedReference}`;
}

function normalizeText(value: FormDataEntryValue | null): string {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

export async function createReviewAction(formData: FormData): Promise<never> {
  const user = await requireClientUser();

  const reference = String(formData.get("reference") ?? "").trim();

  if (!reference) {
    redirect("/espace-client/rendez-vous");
  }

  const rating = Number(formData.get("rating"));

  const title = normalizeText(formData.get("title"));

  const content = normalizeText(formData.get("content"));

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    redirect(
      buildAppointmentUrl(reference, {
        error: "Sélectionnez une note entre 1 et 5 étoiles.",
      }),
    );
  }

  if (content.length < 10) {
    redirect(
      buildAppointmentUrl(reference, {
        error: "Merci de détailler un peu plus votre expérience (10 caractères minimum).",
      }),
    );
  }

  if (content.length > 2000) {
    redirect(
      buildAppointmentUrl(reference, {
        error: "Votre avis ne peut pas dépasser 2000 caractères.",
      }),
    );
  }

  if (title.length > 160) {
    redirect(
      buildAppointmentUrl(reference, {
        error: "Le titre de votre avis ne peut pas dépasser 160 caractères.",
      }),
    );
  }

  const appointment = await prisma.appointment.findFirst({
    where: {
      reference,
      clientId: user.id,
      status: "COMPLETED",
    },

    select: {
      id: true,

      review: {
        select: { id: true },
      },

      client: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  if (!appointment) {
    redirect(
      buildAppointmentUrl(reference, {
        error: "Ce rendez-vous est introuvable ou n’est pas encore terminé.",
      }),
    );
  }

  if (appointment.review) {
    redirect(buildAppointmentUrl(reference));
  }

  const authorName =
    [appointment.client.firstName, appointment.client.lastName]
      .filter(Boolean)
      .join(" ")
      .trim() || "Cliente";

  try {
    await prisma.review.create({
      data: {
        authorId: user.id,
        appointmentId: appointment.id,
        source: "WEBSITE",
        authorName,
        rating,
        title: title || null,
        content,

        /*
         * En attente de validation par l'équipe avant publication sur
         * /avis — voir getPublishedReviews (status = APPROVED
         * requis). Toujours "vérifié" : l'avis est lié à un rendez-
         * vous réellement terminé au salon.
         */
        status: "PENDING",
        isVerified: true,
        publishedAt: new Date(),
      },
    });
  } catch (error: unknown) {
    /*
     * Contrainte unique sur appointmentId : un avis existe déjà
     * (double soumission concurrente). Le rendez-vous est déjà créé
     * de toute façon, on retombe simplement sur la page.
     */
    console.error("[CLIENT_REVIEW_CREATE]", error);

    redirect(
      buildAppointmentUrl(reference, {
        error: "Impossible d’enregistrer votre avis. Réessayez plus tard.",
      }),
    );
  }

  revalidatePath(buildAppointmentUrl(reference));
  revalidatePath("/avis");

  redirect(buildAppointmentUrl(reference, { reviewSubmitted: "1" }));
}
