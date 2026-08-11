"use client";

import Image from "next/image";
import {
  Camera,
  Expand,
  Sparkles,
} from "lucide-react";
import {
  motion,
} from "framer-motion";

import type {
  PublicGalleryItem,
} from "@/features/gallery/components/public/gallery.types";

type GalleryMasonryProps = {
  items: PublicGalleryItem[];
  onSelect: (
    index: number,
  ) => void;
};

export function GalleryMasonry({
  items,
  onSelect,
}: GalleryMasonryProps) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map(
        (
          item,
          index,
        ) => {
          return (
            <motion.article
              key={
                item.id
              }
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
                margin:
                  "-60px",
              }}
              transition={{
                duration:
                  0.45,
                delay:
                  Math.min(
                    index,
                    8,
                  ) *
                  0.045,
              }}
              className="group"
            >
              <button
                type="button"
                onClick={() =>
                  onSelect(
                    index,
                  )
                }
                aria-label={`Voir la réalisation ${item.title}`}
                className="relative block w-full overflow-hidden rounded-[2rem] border border-white/80 bg-white text-left shadow-[0_20px_60px_-30px_rgba(59,36,48,0.35)] outline-none transition duration-500 hover:-translate-y-1 hover:shadow-[0_30px_80px_-30px_rgba(139,64,90,0.4)] focus-visible:ring-4 focus-visible:ring-[#F0DCE3]"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-[#F6E7EB]">
                  <Image
                    src={
                      item.coverUrl
                    }
                    alt={
                      item.alt ??
                      item.title
                    }
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                    className="object-cover transition duration-700 ease-out group-hover:scale-[1.06]"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-[#2E1E28]/85 via-[#2E1E28]/5 to-transparent opacity-80 transition duration-500 group-hover:opacity-95" />

                  <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
                    {item.isFeatured ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/90 px-3 py-1.5 text-xs font-bold text-[#8B3E59] shadow-lg backdrop-blur-md">
                        <Sparkles className="h-3.5 w-3.5" />

                        En vedette
                      </span>
                    ) : (
                      <span />
                    )}

                    <span className="flex h-10 w-10 translate-y-2 items-center justify-center rounded-full border border-white/30 bg-[#2E1E28]/30 text-white opacity-0 shadow-lg backdrop-blur-md transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      <Expand className="h-4 w-4" />
                    </span>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <div className="translate-y-1 transition duration-300 group-hover:translate-y-0">
                      {item.category ? (
                        <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#F0C4D3]">
                          {
                            item.category
                          }
                        </p>
                      ) : null}

                      <h3 className="font-serif text-xl font-semibold leading-tight text-white drop-shadow-sm">
                        {
                          item.title
                        }
                      </h3>

                      {item.serviceName ? (
                        <div className="mt-3 flex items-center gap-2 text-sm text-white/80">
                          <Camera className="h-4 w-4 text-[#E8B3C3]" />

                          <span>
                            {
                              item.serviceName
                            }
                          </span>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="pointer-events-none absolute inset-0 rounded-[2rem] ring-1 ring-inset ring-white/20" />
                </div>
              </button>
            </motion.article>
          );
        },
      )}
    </div>
  );
}