import "server-only";

import type { PublicReview } from "@/features/reviews/components/public/reviews.types";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type GooglePlaceReview = {
  name?: string;
  rating?: number;
  publishTime?: string;
  text?: { text?: string };
  originalText?: { text?: string };
  authorAttribution?: {
    displayName?: string;
    photoUri?: string;
  };
};

type GooglePlaceDetailsResponse = {
  rating?: number;
  userRatingCount?: number;
  reviews?: GooglePlaceReview[];
  error?: { message?: string };
};

export type GoogleReviewsResult = {
  reviews: PublicReview[];
  rating: number | null;
  userRatingCount: number | null;
};

const EMPTY_RESULT: GoogleReviewsResult = {
  reviews: [],
  rating: null,
  userRatingCount: null,
};

/*
 * Rafraîchi toutes les 6h : l'API Places (New) facture chaque appel,
 * et les conditions d'utilisation de Google interdisent de mettre en
 * cache son contenu plus de 30 jours sans rafraîchissement. Next.js
 * gère ce cache automatiquement via `next.revalidate`.
 */
const REVALIDATE_SECONDS = 6 * 60 * 60;

/*
 * Récupère les avis Google les plus pertinents de la fiche du salon
 * (5 maximum, limite imposée par l'API Places) pour les afficher sur
 * la page /avis aux côtés des avis internes.
 *
 * Ne lève jamais d'erreur : une clé manquante, un quota dépassé ou
 * une panne de l'API ne doivent jamais casser la page publique — on
 * renvoie simplement un résultat vide, les avis internes restent
 * affichés normalement.
 */
export async function getGoogleReviews(): Promise<GoogleReviewsResult> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY?.trim();
  const placeId = process.env.GOOGLE_PLACE_ID?.trim();

  if (!apiKey || !placeId) {
    return EMPTY_RESULT;
  }

  try {
    const response = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`,
      {
        headers: {
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "rating,userRatingCount,reviews",
        },

        next: { revalidate: REVALIDATE_SECONDS },
      },
    );

    const payload = (await response.json()) as GooglePlaceDetailsResponse;

    if (!response.ok) {
      console.error("[GOOGLE_REVIEWS_FETCH]", {
        status: response.status,
        message: payload.error?.message,
      });

      return EMPTY_RESULT;
    }

    const reviews: PublicReview[] = (payload.reviews ?? [])
      .filter(
        (review): review is GooglePlaceReview & { name: string } =>
          typeof review.name === "string" &&
          typeof review.authorAttribution?.displayName === "string" &&
          typeof review.rating === "number",
      )
      .map((review) => ({
        id: review.name,

        authorName: review.authorAttribution!.displayName!,

        authorAvatarUrl: review.authorAttribution?.photoUri ?? null,

        rating: review.rating!,

        content:
          review.text?.text?.trim() ||
          review.originalText?.text?.trim() ||
          "",

        createdAt: review.publishTime ?? new Date().toISOString(),

        source: "GOOGLE",

        // Un avis renvoyé par l'API Places provient forcément d'un
        // compte Google authentifié : toujours considéré comme
        // vérifié, contrairement aux avis internes.
        isVerified: true,

        serviceName: null,
        ownerResponse: null,
        ownerRespondedAt: null,
      }));

    return {
      reviews,
      rating: payload.rating ?? null,
      userRatingCount: payload.userRatingCount ?? null,
    };
  } catch (error) {
    console.error("[GOOGLE_REVIEWS_FETCH]", error);

    return EMPTY_RESULT;
  }
}
