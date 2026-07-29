"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ExternalLink,
  Heart,
  Images,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
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
    <section className="relative overflow-hidden px-4 py-24 sm:px-6 lg:px-8">
      <div
        aria-hidden="true"
        className="absolute -left-32 top-20 h-80 w-80 rounded-full bg-pink-200/35 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="absolute -right-32 bottom-12 h-96 w-96 rounded-full bg-fuchsia-200/30 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl">
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            margin: "-80px",
          }}
          transition={{
            duration: 0.5,
          }}
          className="flex flex-col items-center text-center"
        >
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-pink-200 bg-pink-50 px-5 py-2 text-sm font-bold text-pink-700 transition hover:border-pink-300 hover:bg-pink-100 focus:outline-none focus:ring-4 focus:ring-pink-100"
          >
            <FaInstagram className="h-4 w-4" />

            @le_palais_des_ongles71

            <ExternalLink className="h-3.5 w-3.5" />
          </a>

          <h2 className="mt-6 max-w-3xl text-4xl font-black tracking-tight text-zinc-950 sm:text-5xl">
            De nouvelles inspirations
            pour votre prochaine pose
          </h2>

          <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-600 sm:text-lg">
            Découvrez les dernières
            réalisations du Palais des
            Ongles et retrouvez encore
            plus de créations,
            nouveautés et inspirations
            sur Instagram.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(
            (
              item,
              index,
            ) => (
              <motion.article
                key={item.id}
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
                  margin: "-50px",
                }}
                transition={{
                  duration: 0.45,
                  delay: Math.min(
                    index * 0.07,
                    0.3,
                  ),
                }}
                className="group relative overflow-hidden rounded-[2rem] border border-pink-100 bg-white shadow-[0_30px_80px_-40px_rgba(236,72,153,0.4)]"
              >
                <Link
                  href={`/galerie?creation=${encodeURIComponent(
                    item.slug,
                  )}`}
                  aria-label={`Découvrir ${item.title}`}
                  className="block"
                >
                  <div className="relative aspect-square overflow-hidden bg-pink-50">
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

                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/10 to-transparent opacity-70 transition duration-500 group-hover:opacity-90" />

                    <div className="absolute left-5 top-5 flex flex-wrap gap-2">
                      {item.category ? (
                        <span className="rounded-full border border-white/20 bg-white/90 px-3 py-1.5 text-xs font-black text-zinc-900 shadow-sm backdrop-blur">
                          {
                            item
                              .category
                              .name
                          }
                        </span>
                      ) : null}

                      {item.serviceName ? (
                        <span className="rounded-full border border-white/20 bg-zinc-950/55 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
                          {
                            item.serviceName
                          }
                        </span>
                      ) : null}
                    </div>

                    <div className="absolute inset-x-0 bottom-0 p-6 text-left text-white">
                      <div className="flex items-end justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-pink-200">
                            <Sparkles className="h-4 w-4" />

                            Réalisation
                          </div>

                          <h3 className="mt-2 line-clamp-2 text-xl font-black">
                            {
                              item.title
                            }
                          </h3>
                        </div>

                        <span className="flex h-11 w-11 shrink-0 translate-y-3 items-center justify-center rounded-full bg-white text-pink-600 opacity-0 shadow-lg transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                          <Heart className="h-5 w-5" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ),
          )}
        </div>

        <motion.div
          initial={{
            opacity: 0,
            y: 18,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.45,
            delay: 0.2,
          }}
          className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-pink-600 px-7 text-sm font-black text-white shadow-lg shadow-pink-200 transition duration-300 hover:-translate-y-1 hover:bg-pink-700 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-pink-200"
          >
            <FaInstagram className="h-5 w-5" />

            Suivre sur Instagram

            <ExternalLink className="h-4 w-4" />
          </a>

          <Link
            href="/galerie"
            className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-7 text-sm font-black text-zinc-800 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-pink-200 hover:text-pink-700 focus:outline-none focus:ring-4 focus:ring-pink-100"
          >
            <Images className="h-5 w-5" />

            Voir toutes les réalisations

            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}