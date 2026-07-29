"use client";

import { motion } from "framer-motion";

export type GalleryCategory = {
  id: string;
  label: string;
  count: number;
};

type GalleryCategoryFilterProps = {
  categories: GalleryCategory[];
  selected: string;
  onChange: (value: string) => void;
};

export function GalleryCategoryFilter({
  categories,
  selected,
  onChange,
}: GalleryCategoryFilterProps) {
  return (
    <div className="mb-10 overflow-x-auto">
      <div className="flex min-w-max gap-3 pb-2">
        {categories.map((category) => {
          const active =
            category.id === selected;

          return (
            <motion.button
              whileTap={{
                scale: 0.96,
              }}
              whileHover={{
                y: -2,
              }}
              key={category.id}
              type="button"
              onClick={() =>
                onChange(category.id)
              }
              className={[
                "inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition-all",
                active
                  ? "border-pink-600 bg-pink-600 text-white shadow-lg shadow-pink-300/40"
                  : "border-zinc-200 bg-white text-zinc-700 hover:border-pink-300 hover:bg-pink-50",
              ].join(" ")}
            >
              <span>
                {category.label}
              </span>

              <span
                className={[
                  "rounded-full px-2 py-0.5 text-xs",
                  active
                    ? "bg-white/20"
                    : "bg-zinc-100",
                ].join(" ")}
              >
                {category.count}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}