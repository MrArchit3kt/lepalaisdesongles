"use client";

import {
  Quote,
  Sparkles,
  Star,
} from "lucide-react";
import {
  motion,
} from "framer-motion";

const STARS = Array.from({
  length: 5,
});

export function GalleryTestimonial() {
  return (
    <section className="relative overflow-hidden px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-1/2 -z-10 h-72 -translate-y-1/2 bg-gradient-to-r from-transparent via-pink-100/60 to-transparent blur-3xl"
      />

      <div className="mx-auto max-w-5xl">
        <motion.div
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
            margin: "-80px",
          }}
          transition={{
            duration: 0.55,
          }}
          className="relative overflow-hidden rounded-[2.5rem] border border-pink-100 bg-white px-6 py-10 text-center shadow-[0_35px_100px_-45px_rgba(190,24,93,0.35)] sm:px-10 sm:py-14 lg:px-16"
        >
          <div
            aria-hidden="true"
            className="absolute -left-16 -top-20 h-56 w-56 rounded-full bg-pink-100/70 blur-3xl"
          />

          <div
            aria-hidden="true"
            className="absolute -bottom-24 -right-16 h-64 w-64 rounded-full bg-fuchsia-100/60 blur-3xl"
          />

          <div className="relative">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-950 text-white shadow-lg">
              <Quote className="h-6 w-6" />
            </div>

            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-pink-200 bg-pink-50 px-4 py-2 text-sm font-bold text-pink-700">
              <Sparkles className="h-4 w-4" />

              L’expérience du salon
            </div>

            <blockquote className="mx-auto mt-7 max-w-3xl text-2xl font-black leading-tight tracking-tight text-zinc-950 sm:text-3xl lg:text-4xl">
              “Une pose magnifique,
              réalisée avec beaucoup
              de soin et exactement
              comme je l’imaginais.”
            </blockquote>

            <div className="mt-7 flex justify-center gap-1">
              {STARS.map(
                (
                  _,
                  index,
                ) => (
                  <motion.span
                    key={
                      index
                    }
                    initial={{
                      opacity:
                        0,
                      scale:
                        0.7,
                    }}
                    whileInView={{
                      opacity:
                        1,
                      scale: 1,
                    }}
                    viewport={{
                      once:
                        true,
                    }}
                    transition={{
                      delay:
                        0.15 +
                        index *
                          0.06,
                      duration:
                        0.25,
                    }}
                  >
                    <Star className="h-5 w-5 fill-pink-500 text-pink-500" />
                  </motion.span>
                ),
              )}
            </div>

            <div className="mt-5">
              <p className="font-bold text-zinc-950">
                Cliente du Palais
                des Ongles
              </p>

              <p className="mt-1 text-sm text-zinc-500">
                Avis vérifié
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}