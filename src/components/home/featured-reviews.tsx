import {
  ArrowRight,
  Quote,
  Star,
} from "lucide-react";
import Link from "next/link";

import type { HomePageData } from "@/features/public/services/home.service";

type FeaturedReviewsProps = {
  reviews: HomePageData["featuredReviews"];
};

export function FeaturedReviews({
  reviews,
}: FeaturedReviewsProps) {
  if (reviews.length === 0) {
    return null;
  }

  return (
    <section className="bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#A44E69]">
            Elles nous font confiance
          </p>

          <h2 className="mx-auto mt-4 max-w-3xl font-serif text-4xl leading-tight text-[#35242B] sm:text-5xl">
            Des clientes heureuses, des ongles
            inoubliables.
          </h2>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="rounded-[30px] border border-[#F0DCE3] bg-[#FFFAFB] p-7"
            >
              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  {Array.from({
                    length: 5,
                  }).map((_, index) => (
                    <Star
                      key={index}
                      className={
                        index < review.rating
                          ? "size-4 fill-[#A64D69] text-[#A64D69]"
                          : "size-4 text-[#ECD9DF]"
                      }
                    />
                  ))}
                </div>

                <Quote className="size-7 text-[#E8B3C3]" />
              </div>

              {review.title ? (
                <h3 className="mt-6 font-serif text-2xl text-[#35242B]">
                  {review.title}
                </h3>
              ) : null}

              <p className="mt-4 text-sm leading-7 text-[#5B4A52]">
                “{review.content}”
              </p>

              <div className="mt-7 flex items-center justify-between border-t border-[#F0DCE3] pt-5">
                <div>
                  <p className="font-semibold text-[#35242B]">
                    {review.authorName}
                  </p>

                  <p className="mt-1 text-xs text-[#8C747D]">
                    Cliente vérifiée
                  </p>
                </div>

                <span className="rounded-full bg-white px-3 py-1 text-xs text-[#A64D69] shadow-sm">
                  {review.source}
                </span>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/avis"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#A64D69]"
          >
            Voir tous les avis
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
