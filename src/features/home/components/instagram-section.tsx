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
    <section className="relative overflow-hidden bg-[#FFFAFB] px-4 py-24 sm:px-6 lg:px-8">
      <div
        aria-hidden="true"
        className="absolute -left-32 top-20 h-80 w-80 rounded-full bg-[#E8B3C3]/25 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="absolute -right-32 bottom-12 h-96 w-96 rounded-full bg-[#D6B778]/15 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl">
        <div className="flex flex-col items-center text-center">
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-white/90 bg-white px-5 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-[#A44E69] shadow-sm transition hover:border-[#D89CB0]"
          >
            <FaInstagram className="h-4 w-4" />

            @le_palais_des_ongles71

            <ExternalLink className="h-3.5 w-3.5" />
          </a>

          <h2 className="mt-7 max-w-3xl font-serif text-4xl leading-tight text-[#35242B] sm:text-5xl">
            De nouvelles inspirations
            <span className="bg-gradient-to-r from-[#A64D69] via-[#C47890] to-[#8B3E59] bg-clip-text italic text-transparent">
              {" "}
              pour votre prochaine pose
            </span>
          </h2>

          <p className="mt-6 max-w-2xl text-base leading-8 text-[#79636C] sm:text-lg">
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
              className="group relative overflow-hidden rounded-[2rem] border border-[#F0DCE3] bg-white shadow-[0_30px_80px_-40px_rgba(139,64,90,0.35)]"
            >
              <Link
                href={`/galerie?creation=${encodeURIComponent(
                  item.slug,
                )}`}
                aria-label={`Découvrir ${item.title}`}
                className="block"
              >
                <div className="relative aspect-square overflow-hidden bg-[#FFF0F4]">
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

                  <div className="absolute inset-0 bg-gradient-to-t from-[#2E1E28]/80 via-[#2E1E28]/10 to-transparent opacity-70 transition duration-500 group-hover:opacity-90" />

                  <div className="absolute left-5 top-5 flex flex-wrap gap-2">
                    {item.category ? (
                      <span className="rounded-full border border-white/20 bg-white/90 px-3 py-1.5 text-xs font-bold text-[#35242B] shadow-sm backdrop-blur">
                        {
                          item
                            .category
                            .name
                        }
                      </span>
                    ) : null}

                    {item.serviceName ? (
                      <span className="rounded-full border border-white/20 bg-[#2E1E28]/55 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
                        {
                          item.serviceName
                        }
                      </span>
                    ) : null}
                  </div>

                  <div className="absolute inset-x-0 bottom-0 p-6 text-left text-white">
                    <div className="flex items-end justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-[#F0C4D3]">
                          <Sparkles className="h-4 w-4" />

                          Réalisation
                        </div>

                        <h3 className="mt-2 line-clamp-2 font-serif text-xl">
                          {
                            item.title
                          }
                        </h3>
                      </div>

                      <span className="flex h-11 w-11 shrink-0 translate-y-3 items-center justify-center rounded-full bg-white text-[#A64D69] opacity-0 shadow-lg transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
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
            className="group inline-flex h-14 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#AA526E] via-[#BD7088] to-[#8B405A] px-7 text-sm font-black text-white shadow-[0_18px_45px_rgba(139,64,90,0.28)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_55px_rgba(139,64,90,0.35)]"
          >
            <FaInstagram className="h-5 w-5" />

            Suivre sur Instagram

            <ExternalLink className="h-4 w-4" />
          </a>

          <Link
            href="/galerie"
            className="inline-flex h-14 items-center justify-center gap-2 rounded-full border border-white/90 bg-white/65 px-7 text-sm font-bold text-[#35242B] shadow-sm backdrop-blur transition hover:bg-white"
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
