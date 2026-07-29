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
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#A06F81]">
            Elles nous font confiance
          </p>

          <h2 className="mx-auto mt-4 max-w-3xl font-serif text-4xl leading-tight text-[#241A1D] sm:text-5xl">
            Des clientes heureuses, des ongles
            inoubliables.
          </h2>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="rounded-[30px] border border-[#241A1D]/7 bg-[#FFF9F8] p-7"
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
                          ? "size-4 fill-[#C9A36A] text-[#C9A36A]"
                          : "size-4 text-[#D8D0D2]"
                      }
                    />
                  ))}
                </div>

                <Quote className="size-7 text-[#E8B4B8]" />
              </div>

              {review.title ? (
                <h3 className="mt-6 font-serif text-2xl text-[#241A1D]">
                  {review.title}
                </h3>
              ) : null}

              <p className="mt-4 text-sm leading-7 text-[#695960]">
                “{review.content}”
              </p>

              <div className="mt-7 flex items-center justify-between border-t border-[#241A1D]/7 pt-5">
                <div>
                  <p className="font-semibold text-[#241A1D]">
                    {review.authorName}
                  </p>

                  <p className="mt-1 text-xs text-[#8D7A82]">
                    Cliente vérifiée
                  </p>
                </div>

                <span className="rounded-full bg-white px-3 py-1 text-xs text-[#8D6574] shadow-sm">
                  {review.source}
                </span>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/avis"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#8D6574]"
          >
            Voir tous les avis
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
