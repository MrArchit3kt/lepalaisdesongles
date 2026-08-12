"use client";

import { useState } from "react";
import { Star } from "lucide-react";

import { createReviewAction } from "@/features/client/actions/create-review.action";

type LeaveReviewFormProps = {
  reference: string;
};

export function LeaveReviewForm({ reference }: LeaveReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  const displayedRating = hoveredRating ?? rating;

  return (
    <form
      action={createReviewAction}
      className="mt-6 rounded-[1.5rem] border border-[#EFDEE4] bg-gradient-to-br from-white to-[#FFF5F8] p-6"
    >
      <input type="hidden" name="reference" value={reference} />
      <input type="hidden" name="rating" value={rating} />

      <h3 className="font-serif text-xl font-semibold text-[#2F2027]">
        Partagez votre expérience
      </h3>

      <p className="mt-2 text-sm leading-6 text-[#816D75]">
        Votre avis sera visible sur le site après validation par le salon.
      </p>

      <div className="mt-5">
        <span className="mb-2 block text-sm font-semibold text-[#2F2027]">
          Votre note
        </span>

        <div
          className="flex items-center gap-1"
          onMouseLeave={() => setHoveredRating(null)}
        >
          {Array.from({ length: 5 }).map((_, index) => {
            const value = index + 1;

            return (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                onMouseEnter={() => setHoveredRating(value)}
                aria-label={`${value} étoile${value > 1 ? "s" : ""}`}
                className="p-0.5"
              >
                <Star
                  className={
                    value <= displayedRating
                      ? "size-7 fill-[#D6B679] text-[#D6B679] transition"
                      : "size-7 text-[#E3D7DB] transition"
                  }
                />
              </button>
            );
          })}
        </div>
      </div>

      <label className="mt-5 block">
        <span className="mb-2 block text-sm font-semibold text-[#2F2027]">
          Titre (facultatif)
        </span>

        <input
          type="text"
          name="title"
          maxLength={160}
          placeholder="Un résumé de votre visite"
          className="w-full rounded-2xl border border-[#241A1D]/15 bg-white px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-[#A9969D] focus:border-[#9D6F80] focus:ring-4 focus:ring-[#9D6F80]/10"
        />
      </label>

      <label className="mt-4 block">
        <span className="mb-2 block text-sm font-semibold text-[#2F2027]">
          Votre avis
        </span>

        <textarea
          name="content"
          required
          minLength={10}
          maxLength={2000}
          rows={5}
          placeholder="Racontez votre expérience au salon…"
          className="w-full resize-none rounded-2xl border border-[#241A1D]/15 bg-white px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-[#A9969D] focus:border-[#9D6F80] focus:ring-4 focus:ring-[#9D6F80]/10"
        />

        <p className="mt-2 text-xs text-[#927E85]">
          Entre 10 et 2000 caractères.
        </p>
      </label>

      <button
        type="submit"
        className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-[#B45F7A] to-[#843F59] px-6 text-sm font-black text-white shadow-[0_12px_28px_rgba(132,63,89,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(132,63,89,0.28)] sm:w-auto"
      >
        Publier mon avis
      </button>
    </form>
  );
}
