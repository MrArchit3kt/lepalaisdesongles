import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ExternalLink,
  Heart,
  Images,
  Sparkles,
} from "lucide-react";
import { FaInstagram } from "react-icons/fa6";

const INSTAGRAM_URL =
  "https://www.instagram.com/le_palais_des_ongles71/";

type InstagramGalleryItem = {
  id: string;
  title: string;
  slug: string;
  coverUrl: string;
  alt: string | null;
  serviceName: string | null;
  category: {
    name: string;
  } | null;
};

type InstagramSectionProps = {
  items: InstagramGalleryItem[];
};

export function InstagramSection({
  items,
}: InstagramSectionProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="relative overflow-hidden bg-[#FFF9F8] px-4 py-24 sm:px-6 lg:px-8">
      <div
        aria-hidden="true"
        className="absolute -left-32 top-20 h-80 w-80 rounded-full bg-[#E8B4B8]/20 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="absolute -right-32 bottom-12 h-96 w-96 rounded-full bg-[#C9A36A]/15 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl">
        <div className="flex flex-col items-center text-center">
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-[#B8899A]/20 bg-white px-5 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#916777] shadow-sm transition hover:border-[#B8899A]/40"
          >
            <FaInstagram className="h-4 w-4" />

            @le_palais_des_ongles71

            <ExternalLink className="h-3.5 w-3.5" />
          </a>

          <h2 className="mt-7 max-w-3xl font-serif text-4xl leading-tight text-[#241A1D] sm:text-5xl">
            De nouvelles inspirations
            <span className="text-[#B8899A]">
              {" "}
              pour votre prochaine pose
            </span>
          </h2>

          <p className="mt-6 max-w-2xl text-base leading-8 text-[#75636A] sm:text-lg">
            Découvrez les dernières
            réalisations du Palais des
            Ongles et retrouvez encore
            plus de créations,
            nouveautés et inspirations
            sur Instagram.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <article
              key={item.id}
              className="group relative overflow-hidden rounded-[2rem] border border-[#241A1D]/7 bg-white shadow-[0_30px_80px_-40px_rgba(36,26,29,0.35)]"
            >
              <Link
                href={`/galerie?creation=${encodeURIComponent(
                  item.slug,
                )}`}
                aria-label={`Découvrir ${item.title}`}
                className="block"
              >
                <div className="relative aspect-square overflow-hidden bg-[#FFF0F0]">
                  <Image
                    src={
                      item.coverUrl
                    }
                    alt={
                      item.alt ??
                      item.title
                    }
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition duration-700 group-hover:scale-110"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-[#241A1D]/80 via-[#241A1D]/10 to-transparent opacity-70 transition duration-500 group-hover:opacity-90" />

                  <div className="absolute left-5 top-5 flex flex-wrap gap-2">
                    {item.category ? (
                      <span className="rounded-full border border-white/20 bg-white/90 px-3 py-1.5 text-xs font-bold text-[#241A1D] shadow-sm backdrop-blur">
                        {
                          item
                            .category
                            .name
                        }
                      </span>
                    ) : null}

                    {item.serviceName ? (
                      <span className="rounded-full border border-white/20 bg-[#241A1D]/55 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
                        {
                          item.serviceName
                        }
                      </span>
                    ) : null}
                  </div>

                  <div className="absolute inset-x-0 bottom-0 p-6 text-left text-white">
                    <div className="flex items-end justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-[#E8B4B8]">
                          <Sparkles className="h-4 w-4" />

                          Réalisation
                        </div>

                        <h3 className="mt-2 line-clamp-2 font-serif text-xl">
                          {
                            item.title
                          }
                        </h3>
                      </div>

                      <span className="flex h-11 w-11 shrink-0 translate-y-3 items-center justify-center rounded-full bg-white text-[#B8899A] opacity-0 shadow-lg transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                        <Heart className="h-5 w-5" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-[#241A1D] px-7 text-sm font-semibold text-white shadow-xl shadow-black/10 transition hover:-translate-y-0.5 hover:bg-[#3A292F]"
          >
            <FaInstagram className="h-5 w-5" />

            Suivre sur Instagram

            <ExternalLink className="h-4 w-4" />
          </a>

          <Link
            href="/galerie"
            className="inline-flex h-14 items-center justify-center gap-2 rounded-full border border-[#241A1D]/10 bg-white px-7 text-sm font-semibold text-[#241A1D] transition hover:-translate-y-0.5 hover:bg-[#FFF0F0]"
          >
            <Images className="h-5 w-5" />

            Voir toutes les réalisations

            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
