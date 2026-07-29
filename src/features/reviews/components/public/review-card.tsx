"use client";

import Image from "next/image";
import {
  BadgeCheck,
  MessageSquare,
  Star,
} from "lucide-react";
import { motion } from "framer-motion";

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
  index = 0,
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
    <motion.article
      initial={{
        opacity: 0,
        y: 24,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        margin: "-60px",
      }}
      transition={{
        duration: 0.45,
        delay: Math.min(
          index * 0.05,
          0.3,
        ),
      }}
      className="group relative overflow-hidden rounded-[2rem] border border-pink-100 bg-white p-7 shadow-[0_30px_80px_-40px_rgba(236,72,153,0.35)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_40px_100px_-35px_rgba(236,72,153,0.45)]"
    >
      <div
        aria-hidden="true"
        className="absolute -right-14 -top-14 h-40 w-40 rounded-full bg-pink-500/10 blur-3xl transition duration-500 group-hover:bg-pink-500/20"
      />

      <div className="relative">
        <div className="flex items-start justify-between gap-5">
          <div className="flex min-w-0 items-center gap-4">
            {review.authorAvatarUrl ? (
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-pink-50 ring-2 ring-pink-100">
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
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-fuchsia-500 text-sm font-black text-white shadow-lg shadow-pink-200">
                {initials}
              </div>
            )}

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="truncate font-black text-zinc-950">
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

              <p className="mt-1 text-sm text-zinc-500">
                {formatDate(
                  review.createdAt,
                )}
              </p>
            </div>
          </div>

          <span className="shrink-0 rounded-full border border-pink-100 bg-pink-50 px-3 py-1 text-xs font-bold text-pink-700">
            {review.source ===
            "GOOGLE"
              ? "Google"
              : "Site"}
          </span>
        </div>

        <div
          className="mt-6 flex gap-1"
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
                    ? "fill-pink-500 text-pink-500"
                    : "fill-zinc-200 text-zinc-200"
                }`}
              />
            ),
          )}
        </div>

        {review.serviceName ? (
          <div className="mt-5 inline-flex rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold text-zinc-700">
            {
              review.serviceName
            }
          </div>
        ) : null}

        <p className="mt-6 whitespace-pre-line break-words leading-8 text-zinc-700">
          {review.content}
        </p>

        {review.ownerResponse ? (
          <div className="mt-8 rounded-2xl border border-pink-100 bg-pink-50/70 p-5">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 shrink-0 text-pink-600" />

              <span className="font-bold text-pink-700">
                Réponse du salon
              </span>
            </div>

            <p className="mt-3 whitespace-pre-line break-words leading-7 text-zinc-700">
              {
                review.ownerResponse
              }
            </p>

            {review.ownerRespondedAt ? (
              <p className="mt-3 text-xs text-zinc-500">
                Répondu le{" "}
                {formatDate(
                  review.ownerRespondedAt,
                )}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </motion.article>
  );
}