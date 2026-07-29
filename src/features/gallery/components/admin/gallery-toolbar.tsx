"use client";

import { Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";

type GalleryToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  onCreate: () => void;
};

export function GalleryToolbar({
  search,
  onSearchChange,
  onCreate,
}: GalleryToolbarProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="relative w-full md:max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />

        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Rechercher une réalisation..."
          className="h-11 w-full rounded-full border border-[#241A1D]/15 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-[#B8899A]"
        />
      </div>

      <Button onClick={onCreate}>
        <Plus className="h-4 w-4" />
        Nouvelle réalisation
      </Button>
    </div>
  );
}