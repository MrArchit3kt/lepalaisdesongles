"use client";

import { Award, Camera, Heart, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

type GalleryStatsProps = {
  totalImages: number;
};

const items = [
  {
    icon: Camera,
    label: "Réalisations",
    color: "text-pink-600",
  },
  {
    icon: Heart,
    label: "Passion",
    value: "100%",
    color: "text-rose-500",
  },
  {
    icon: Sparkles,
    label: "Créativité",
    value: "Illimitée",
    color: "text-fuchsia-500",
  },
  {
    icon: Award,
    label: "Qualité",
    value: "Premium",
    color: "text-amber-500",
  },
];

export function GalleryStats({
  totalImages,
}: GalleryStatsProps) {
  return (
    <section className="-mt-14 relative z-10 mb-20 px-6">
      <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2 xl:grid-cols-4">
        {items.map((item, index) => {
          const Icon = item.icon;

          return (
            <motion.div
              key={item.label}
              initial={{
                opacity: 0,
                y: 30,
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
                delay: index * 0.08,
              }}
              className="rounded-3xl border border-pink-100 bg-white p-8 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.18em] text-zinc-500">
                    {item.label}
                  </p>

                  <p className="mt-3 text-3xl font-black text-zinc-900">
                    {item.label === "Réalisations"
                      ? totalImages
                      : item.value}
                  </p>
                </div>

                <div className="rounded-2xl bg-pink-50 p-4">
                  <Icon className={`h-7 w-7 ${item.color}`} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}