"use client";

import { Button } from "@/components/ui/button";

type GalleryFilter = "all" | "published" | "draft" | "featured";

type GalleryFiltersProps = {
  value: GalleryFilter;
  onChange: (value: GalleryFilter) => void;
};

const filters: Array<{
  value: GalleryFilter;
  label: string;
}> = [
  {
    value: "all",
    label: "Toutes",
  },
  {
    value: "published",
    label: "Publiées",
  },
  {
    value: "draft",
    label: "Brouillons",
  },
  {
    value: "featured",
    label: "À la une",
  },
];

export function GalleryFilters({
  value,
  onChange,
}: GalleryFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => (
        <Button
          key={filter.value}
          variant={
            value === filter.value
              ? "primary"
              : "outline"
          }
          size="sm"
          onClick={() => onChange(filter.value)}
        >
          {filter.label}
        </Button>
      ))}
    </div>
  );
}