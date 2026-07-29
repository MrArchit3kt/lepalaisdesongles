"use client";

import Link from "next/link";
import { ArrowRight, Camera, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

type GalleryHeroProps = {
  totalImages: number;
};

export function GalleryHero({
  totalImages,
}: GalleryHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-pink-100 bg-gradient-to-br from-white via-pink-50 to-fuchsia-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(236,72,153,0.15),transparent_45%)]" />

      <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-pink-300/20 blur-3xl" />

      <div className="absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-fuchsia-300/20 blur-3xl" />

      <div className="relative mx-auto flex min-h-[72vh] max-w-7xl flex-col items-center justify-center px-6 text-center">

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .6 }}
          className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 shadow-lg"
        >
          <Sparkles className="h-4 w-4 text-pink-600" />

          <span className="text-sm font-semibold text-pink-600">
            Galerie Premium
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity:0,y:30 }}
          animate={{ opacity:1,y:0 }}
          transition={{ delay:.15 }}
          className="mt-8 max-w-5xl text-5xl font-black tracking-tight text-zinc-950 md:text-7xl"
        >
          Chaque pose raconte
          <span className="block text-pink-600">
            une histoire.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity:0,y:30 }}
          animate={{ opacity:1,y:0 }}
          transition={{ delay:.25 }}
          className="mt-8 max-w-3xl text-lg leading-8 text-zinc-600"
        >
          Découvrez les créations réalisées au salon.
          Inspirez-vous des dernières tendances,
          choisissez votre style
          puis réservez votre prochain rendez-vous.
        </motion.p>

        <motion.div
          initial={{ opacity:0,y:30 }}
          animate={{ opacity:1,y:0 }}
          transition={{ delay:.35 }}
          className="mt-10 flex flex-wrap justify-center gap-5"
        >
          <Link
            href="/reservation"
            className="inline-flex items-center gap-2 rounded-full bg-pink-600 px-8 py-4 text-white shadow-xl transition hover:scale-105 hover:bg-pink-700"
          >
            Réserver maintenant

            <ArrowRight className="h-5 w-5"/>
          </Link>

          <div className="inline-flex items-center gap-3 rounded-full border border-zinc-200 bg-white px-8 py-4 shadow-sm">
            <Camera className="h-5 w-5 text-pink-600"/>

            <span className="font-semibold">
              {totalImages} réalisations
            </span>
          </div>
        </motion.div>

      </div>
    </section>
  );
}