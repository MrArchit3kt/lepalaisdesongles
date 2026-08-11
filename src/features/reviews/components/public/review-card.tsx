"use client";

import Image from "next/image";
import {
  BadgeCheck,
  MessageSquare,
  Star,
} from "lucide-react";

import type {
  PublicReview,
} from "./reviews.types";

type ReviewCardProps = {
  review: PublicReview;
  index?: number;
};

function formatDate(
  value: string,
): string {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  ).format(date);
}

function getInitials(
  authorName: string,
): string {
  const initials =
    authorName
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map(
        (part) =>
          part.charAt(0),
      )
      .join("")
      .slice(0, 2)
      .toUpperCase();

  return initials || "C";
}

function clampRating(
  rating: number,
): number {
  if (
    !Number.isFinite(
      rating,
    )
  ) {
    return 0;
  }

  return Math.min(
    Math.max(
      Math.round(rating),
      0,
    ),
    5,
  );
}

export function ReviewCard({
  review,
}: ReviewCardProps) {
  const initials =
    getInitials(
      review.authorName,
    );

  const rating =
    clampRating(
      review.rating,
    );

  return (
    <article className="group relative overflow-hidden rounded-[2rem] border border-[#F0DCE3] bg-white p-5 shadow-[0_30px_80px_-40px_rgba(139,64,90,0.35)] sm:p-7 transition duration-300 hover:-translate-y-1 hover:shadow-[0_40px_100px_-35px_rgba(139,64,90,0.45)]">
      <div
        aria-hidden="true"
        className="absolute -right-14 -top-14 h-40 w-40 rounded-full bg-[#E8B3C3]/20 blur-3xl transition duration-500 group-hover:bg-[#E8B3C3]/35"
      />

      <div className="relative">
        <div className="flex items-start justify-between gap-5">
          <div className="flex min-w-0 items-center gap-4">
            {review.authorAvatarUrl ? (
              <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-[#FFF0F4] ring-2 ring-[#F0DCE3] sm:h-14 sm:w-14">
                <Image
                  src={
                    review.authorAvatarUrl
                  }
                  alt={`Photo de ${review.authorName}`}
                  fill
                  sizes="56px"
                  unoptimized
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#AA526E] to-[#8B405A] text-sm font-black text-white shadow-lg shadow-[#8B405A]/25 sm:h-14 sm:w-14">
                {initials}
              </div>
            )}

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="truncate font-black text-[#35242B]">
                  {
                    review.authorName
                  }
                </h3>

                {review.isVerified ? (
                  <BadgeCheck
                    aria-label="Avis vérifié"
                    className="h-5 w-5 shrink-0 text-emerald-500"
                  />
                ) : null}
              </div>

              <p className="mt-1 text-sm text-[#8C747D]">
                {formatDate(
                  review.createdAt,
                )}
              </p>
            </div>
          </div>

          <span className="shrink-0 rounded-full border border-[#F0DCE3] bg-[#FFF7F9] px-3 py-1 text-xs font-bold text-[#A64D69]">
            {review.source ===
            "GOOGLE"
              ? "Google"
              : "Site"}
          </span>
        </div>

        <div
          className="mt-4 flex gap-1 sm:mt-6"
          aria-label={`${rating} étoiles sur 5`}
        >
          {Array.from({
            length: 5,
          }).map(
            (
              _,
              starIndex,
            ) => (
              <Star
                key={
                  starIndex
                }
                aria-hidden="true"
                className={`h-5 w-5 ${
                  starIndex <
                  rating
                    ? "fill-[#A64D69] text-[#A64D69]"
                    : "fill-[#F0DCE3] text-[#F0DCE3]"
                }`}
              />
            ),
          )}
        </div>

        {review.serviceName ? (
          <div className="mt-5 inline-flex rounded-full border border-[#F0DCE3] bg-[#FFF7F9] px-3 py-1 text-xs font-bold text-[#6F5962]">
            {
              review.serviceName
            }
          </div>
        ) : null}

        <p className="mt-4 whitespace-pre-line break-words leading-7 text-[#5B4A52] sm:mt-6 sm:leading-8">
          {review.content}
        </p>

        {review.ownerResponse ? (
          <div className="mt-5 rounded-2xl border border-[#F0DCE3] bg-[#FFF7F9] p-4 sm:mt-8 sm:p-5">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 shrink-0 text-[#A64D69]" />

              <span className="font-bold text-[#A64D69]">
                Réponse du salon
              </span>
            </div>

            <p className="mt-3 whitespace-pre-line break-words leading-7 text-[#5B4A52]">
              {
                review.ownerResponse
              }
            </p>

            {review.ownerRespondedAt ? (
              <p className="mt-3 text-xs text-[#8C747D]">
                Répondu le{" "}
                {formatDate(
                  review.ownerRespondedAt,
                )}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}
